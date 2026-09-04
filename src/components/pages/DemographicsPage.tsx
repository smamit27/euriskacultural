import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, Lock, Unlock, Search,
  Download, CheckCircle2, Clock, QrCode,
  RefreshCw, Sparkles, KeyRound, Copy, Check, Camera, X
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { demographicsService, type DemographicResident, type CommunityBreakdown, type DemographicsLoginSession } from '../../services/demographicsService';
import { useToast } from '../../context/ToastContext';

export const DemographicsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'QR_SCAN' | 'PASSCODE'>('QR_SCAN');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Scan-to-login QR state
  const [session, setSession] = useState<DemographicsLoginSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // In-app Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Data state
  const [residents, setResidents] = useState<DemographicResident[]>([]);
  const [summary, setSummary] = useState<CommunityBreakdown[]>([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  // Filters
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (demographicsService.isSessionAuthenticated()) {
      setIsAuthenticated(true);
      loadData('ALL');
    }
  }, []);

  // Initialize or refresh QR Session
  const initQrSession = async () => {
    try {
      setIsRefreshing(true);
      const newSession = await demographicsService.createLoginSession();
      setSession(newSession);
      setTimeLeft(180);

      const targetUrl = `${window.location.origin}/?demologin=${newSession.sessionId}`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating login QR session:', err);
      showToast('Could not create login session.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create session on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !session) {
      initQrSession();
    }
  }, [isAuthenticated]);

  // Real-time listener for current session
  useEffect(() => {
    if (!session || isAuthenticated) return;

    const unsubscribe = demographicsService.subscribeLoginSession(session.sessionId, (updated) => {
      if (updated.status === 'APPROVED') {
        demographicsService.authenticateSession();
        setIsAuthenticated(true);
        setAuthError('');
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('🎉 Instant Scan-to-Login Approved (Passcode: 1111)! Executive Demographics Unlocked.', 'success');
        loadData(selectedWing);
      } else if (updated.status === 'REJECTED') {
        setAuthError('Session was rejected by mobile user.');
        showToast('Login authorization was rejected.', 'error');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [session?.sessionId, isAuthenticated, selectedWing]);

  // Countdown timer for QR code
  useEffect(() => {
    if (isAuthenticated || !session || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeLeft, isAuthenticated]);

  const loadData = async (wing: string) => {
    try {
      const allResidents = await demographicsService.getDemographicResidents();
      setResidents(allResidents);

      const sumData = await demographicsService.getCommunitySummary(wing);
      setSummary(sumData.breakdown);
      setTotalResidents(sumData.totalResidents);
      setTotalPaid(sumData.totalPaid);
    } catch (err) {
      console.error(err);
      showToast('Failed to load demographic data.', 'error');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demographicsService.verifyPasskey(passkeyInput)) {
      demographicsService.authenticateSession();
      setIsAuthenticated(true);
      setAuthError('');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      showToast('🔒 Confidential Portal unlocked successfully.', 'success');
      loadData(selectedWing);
    } else {
      setAuthError('Access Denied: Invalid passcode. Enter 1111 or confidential passkey.');
      showToast('Incorrect passcode.', 'error');
    }
  };

  // Instant one-click simulate / approve button for easy demo
  const handleSimulateApprove = async () => {
    if (!session) return;
    try {
      setIsSimulating(true);
      await demographicsService.approveLoginSession(session.sessionId, '1111');
      // The Firestore listener will automatically fire and unlock the UI
    } catch (err) {
      console.error(err);
      showToast('Failed to simulate approval.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyLink = () => {
    if (!session) return;
    const targetUrl = `${window.location.origin}/?demologin=${session.sessionId}`;
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    showToast('Login verification link copied!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // In-app Camera Scanner Handlers
  const startCameraScanner = async () => {
    setIsCameraActive(true);
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode('demographics-camera-reader');
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            stopCameraScanner();
            // Check if text has demologin or session id
            let scannedSessionId = '';
            if (decodedText.includes('demologin=')) {
              const parts = decodedText.split('demologin=');
              scannedSessionId = parts[1]?.split('&')[0] || '';
            } else if (decodedText.startsWith('DEMO-')) {
              scannedSessionId = decodedText;
            }

            if (scannedSessionId || decodedText === '1111') {
              showToast('QR Scanned! Authorizing with Passcode 1111...', 'info');
              if (scannedSessionId) {
                await demographicsService.approveLoginSession(scannedSessionId, '1111');
              }
              demographicsService.authenticateSession();
              setIsAuthenticated(true);
              try {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } catch {}
              showToast('🎉 Scan Authorized! Unlocked Executive Demographics.', 'success');
              loadData(selectedWing);
            } else {
              showToast('Invalid QR Code. Please scan Demographics Login QR.', 'error');
            }
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera start error:', err);
        showToast('Camera permission denied or camera not found.', 'error');
        setIsCameraActive(false);
      }
    }, 150);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).finally(() => {
        scannerRef.current = null;
        setIsCameraActive(false);
      });
    } else {
      setIsCameraActive(false);
    }
  };

  const handleLock = () => {
    demographicsService.lockSession();
    setIsAuthenticated(false);
    setPasskeyInput('');
    setSession(null);
    showToast('Portal locked securely.', 'info');
  };

  const handleWingChange = (wing: string) => {
    setSelectedWing(wing);
    loadData(wing);
  };

  // Filtered residents
  const filteredResidents = residents.filter((r) => {
    if (selectedWing !== 'ALL' && r.buildingId !== selectedWing) return false;
    if (selectedCommunity !== 'ALL' && r.community !== selectedCommunity) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      return r.flatNumber.toLowerCase().includes(q) || r.residentName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Wing', 'Flat Number', 'Resident Name', 'Community', 'Status', 'Paid Amount (INR)'];
    const rows = filteredResidents.map((r) => [
      `Wing ${r.buildingId}`,
      r.flatNumber,
      `"${r.residentName.replace(/"/g, '""')}"`,
      r.community,
      r.status,
      r.amount,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Euriska_Confidential_Demographics_${selectedWing}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSV exported successfully.', 'success');
  };

  // 1. Password & Scan-To-Login Protection Gate Screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#ffffff',
            borderRadius: 24,
            padding: '32px 24px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
            border: '1.5px solid #fee2e2',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Top Lock Badge */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.2)',
            }}
          >
            <Lock size={28} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: 11,
              fontWeight: 900,
              padding: '4px 12px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}
          >
            <ShieldAlert size={14} /> Strictly Confidential
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            Executive Demographics
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Scan with your mobile phone or enter passcode <strong style={{ color: '#0f172a' }}>1111</strong> to unlock.
          </p>

          {/* Auth Mode Toggle Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 14,
              marginBottom: 20,
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode('QR_SCAN')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 12px',
                borderRadius: 11,
                border: 'none',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                background: authMode === 'QR_SCAN' ? '#ffffff' : 'transparent',
                color: authMode === 'QR_SCAN' ? '#0f172a' : '#64748b',
                boxShadow: authMode === 'QR_SCAN' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={16} color={authMode === 'QR_SCAN' ? '#dc2626' : '#64748b'} />
              <span>Scan to Login</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('PASSCODE')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 12px',
                borderRadius: 11,
                border: 'none',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                background: authMode === 'PASSCODE' ? '#ffffff' : 'transparent',
                color: authMode === 'PASSCODE' ? '#0f172a' : '#64748b',
                boxShadow: authMode === 'PASSCODE' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <KeyRound size={16} color={authMode === 'PASSCODE' ? '#dc2626' : '#64748b'} />
              <span>Passcode (1111)</span>
            </button>
          </div>

          {/* MODE A: REAL-TIME QR SCAN TO LOGIN */}
          {authMode === 'QR_SCAN' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              {/* QR Container */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 18,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  position: 'relative',
                }}
              >
                {qrCodeUrl ? (
                  <div style={{ position: 'relative', background: '#ffffff', padding: 8, borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    <img
                      src={qrCodeUrl}
                      alt="Scan to Login QR"
                      style={{ width: 190, height: 190, display: 'block', borderRadius: 8 }}
                    />
                    {timeLeft === 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(255, 255, 255, 0.94)',
                          borderRadius: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 12,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>QR Code Expired</span>
                        <button
                          onClick={initQrSession}
                          style={{
                            padding: '8px 14px',
                            background: '#0f172a',
                            color: '#ffffff',
                            borderRadius: 10,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <RefreshCw size={13} /> Refresh QR
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" />
                  </div>
                )}

                {/* Real-time listening indicator */}
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
                      animation: 'pulse 1.8s infinite',
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    Listening for mobile scan with Passcode <strong style={{ color: '#0f172a' }}>1111</strong>
                  </span>
                </div>

                {/* Session ID & Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                    {session?.sessionId || 'DEMO-SESSION'}
                  </span>
                  <span style={{ fontSize: 11, color: timeLeft < 30 ? '#ef4444' : '#64748b', fontWeight: 700 }}>
                    ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={initQrSession}
                    disabled={isRefreshing}
                    title="Generate New QR"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2,
                    }}
                  >
                    <RefreshCw size={13} style={{ transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s' }} />
                  </button>
                </div>
              </div>

              {/* Instant Test / Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={handleSimulateApprove}
                  disabled={isSimulating || timeLeft === 0}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Sparkles size={15} />
                  <span>{isSimulating ? 'Authorizing...' : '⚡ Instant One-Click Authorize (Passcode: 1111)'}</span>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={startCameraScanner}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    <Camera size={14} color="#64748b" />
                    <span>Scan with Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#64748b" />}
                    <span>{isCopied ? 'Link Copied!' : 'Copy Mobile Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: MANUAL PASSCODE (1111 OR $05CeLRO) */}
          {authMode === 'PASSCODE' && (
            <form onSubmit={handleAuthSubmit} style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter passcode (e.g. 1111)"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 12,
                    border: authError ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 16,
                    textAlign: 'center',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#f8fafc',
                  }}
                />

                {/* Quick 1111 Helper Button */}
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPasskeyInput('1111')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Quick Fill Passcode: 1111
                  </button>
                </div>

                {authError && (
                  <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                    {authError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
                }}
              >
                <Unlock size={16} />
                <span>Unlock Confidential Portal</span>
              </button>
            </form>
          )}

          {/* Camera Scanner Modal overlay */}
          {isCameraActive && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                style={{
                  maxWidth: 380,
                  width: '100%',
                  background: '#ffffff',
                  borderRadius: 20,
                  padding: 20,
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera size={18} color="#dc2626" /> Scan Demographics QR
                  </span>
                  <button
                    onClick={stopCameraScanner}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div
                  id="demographics-camera-reader"
                  style={{
                    width: '100%',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#000000',
                    minHeight: 250,
                  }}
                />

                <p style={{ fontSize: 12, color: '#64748b', marginTop: 12, margin: '12px 0 0 0' }}>
                  Point your camera at the Demographics Login QR to unlock with passcode <strong>1111</strong>.
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 11.5, color: '#94a3b8' }}>
            Authorized Committee &amp; Chairman Access Only • Passcode 1111 Enabled
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Confidential Portal View
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 16px 40px 16px' }}>
      {/* Confidential Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 24,
          padding: '24px 22px',
          color: '#ffffff',
          marginBottom: 20,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldAlert size={12} /> Confidential • Committee Eyes Only
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                Passkey Authenticated
              </span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Society Community &amp; Demographic Roster
            </h1>
            <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>
              Multi-community resident participation &amp; cultural background breakdown for Euriska Housing Society.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Download size={15} color="#38bdf8" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLock}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Lock size={15} />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {summary.map((item) => (
          <div
            key={item.community}
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1.5px solid ${item.color}25`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
                </span>
                <span
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                    fontWeight: 900,
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {item.percentage}% of Society
                </span>
              </div>

              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                {item.totalFlats}{' '}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Flats</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ color: '#059669' }}>🟢 Paid: {item.paidFlats}</span>
              <span style={{ color: '#d97706' }}>⏳ Pending: {item.pendingFlats}</span>
              <span style={{ color: '#0f172a' }}>₹{item.totalCollected.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Diversity Distribution Visual Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
            Overall Society Composition ({totalResidents} Total Residential Flats)
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
            Total Paid: {totalPaid} ({totalResidents > 0 ? Math.round((totalPaid / totalResidents) * 100) : 0}%)
          </span>
        </div>

        {/* Multi-segment Bar */}
        <div
          style={{
            height: 14,
            borderRadius: 8,
            display: 'flex',
            overflow: 'hidden',
            background: '#f1f5f9',
          }}
        >
          {summary.map((item) => (
            <div
              key={item.community}
              title={`${item.label}: ${item.totalFlats} flats (${item.percentage}%)`}
              style={{
                width: `${item.percentage}%`,
                background: item.color,
                transition: 'width 0.4s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
          {summary.map((item) => (
            <div key={item.community} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
              <span style={{ color: '#334155' }}>
                {item.icon} {item.label}: <strong>{item.totalFlats}</strong> ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {/* Top Filter Buttons & Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Wing Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#f8fafc', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            {['ALL', 'A', 'B', 'C'].map((w) => (
              <button
                key={w}
                onClick={() => handleWingChange(w)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedWing === w ? '#0f172a' : 'transparent',
                  color: selectedWing === w ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {w === 'ALL' ? 'All Wings' : `Wing ${w}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flat or name..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Secondary Filter Pills (Community & Status) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Community:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HINDU', label: '🪔 Hindu' },
              { id: 'MUSLIM', label: '🕌 Muslim' },
              { id: 'CHRISTIAN', label: '⛪ Christian' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommunity(c.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: selectedCommunity === c.id ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                  background: selectedCommunity === c.id ? '#0f172a' : '#ffffff',
                  color: selectedCommunity === c.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PAID', label: '🟢 Paid' },
              { id: 'PENDING', label: '⏳ Pending' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: selectedStatus === s.id ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                  background: selectedStatus === s.id ? '#0f172a' : '#ffffff',
                  color: selectedStatus === s.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resident Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Flat</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Wing</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Resident / Family Name</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Community Category</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Ganeshotsav Contribution</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                    No resident records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r, idx) => {
                  const commBadge =
                    r.community === 'HINDU'
                      ? { label: '🪔 Hindu', color: '#ea580c', bg: '#fff7ed' }
                      : r.community === 'MUSLIM'
                      ? { label: '🕌 Muslim', color: '#059669', bg: '#ecfdf5' }
                      : { label: '⛪ Christian', color: '#2563eb', bg: '#eff6ff' };

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {r.flatNumber}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#64748b' }}>
                        Wing {r.buildingId}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                        {r.residentName}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            background: commBadge.bg,
                            color: commBadge.color,
                            fontSize: 12,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 14,
                            border: `1px solid ${commBadge.color}30`,
                          }}
                        >
                          {commBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {r.status === 'PAID' ? (
                          <span style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Paid
                          </span>
                        ) : (
                          <span style={{ color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {r.status === 'PAID' ? `₹${r.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          <span>Showing {filteredResidents.length} of {residents.length} residents</span>
          <span>Confidential Data • Protected under Euriska Society Bye-Laws</span>
        </div>
      </div>
    </div>
  );
};
