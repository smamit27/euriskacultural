import React, { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, X, QrCode, KeyRound, RefreshCw, Camera, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService, type AdminLoginSession } from '../../services/authService';
import euriskaLogo from '/euriska_logo.png';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdmin, unlockAdminDirect } = useAuth();
  const { showToast } = useToast();

  // Mode state: QR_SCAN or PASSWORD
  const [authMode, setAuthMode] = useState<'QR_SCAN' | 'PASSWORD'>('QR_SCAN');

  // Password state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scan-to-login QR state
  const [session, setSession] = useState<AdminLoginSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // In-app camera scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize or refresh Admin QR Session
  const initQrSession = async () => {
    try {
      setIsRefreshing(true);
      const newSession = await authService.createAdminLoginSession();
      setSession(newSession);
      setTimeLeft(180);

      const targetUrl = `${window.location.origin}/?admin_login=${newSession.sessionId}`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating Admin QR session:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      initQrSession();
    } else {
      setSession(null);
      stopCameraScanner();
    }
  }, [isOpen]);

  // Real-time listener for current Admin QR Session
  useEffect(() => {
    if (!isOpen || !session) return;

    const unsubscribe = authService.subscribeAdminLoginSession(session.sessionId, (updated) => {
      if (updated.status === 'APPROVED') {
        unlockAdminDirect();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Welcome Super Admin! Authenticated via mobile scan.', 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else if (updated.status === 'REJECTED') {
        showToast('Admin login authorization rejected.', 'error');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, session?.sessionId]);

  // Countdown timer for Admin QR code
  useEffect(() => {
    if (!isOpen || !session || timeLeft <= 0) return;
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
  }, [isOpen, session, timeLeft]);

  // Camera Scanner Handler
  const startCameraScanner = async () => {
    setIsCameraActive(true);
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode('admin-camera-reader');
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          async (decodedText) => {
            stopCameraScanner();
            let scannedSessionId = '';
            if (decodedText.includes('admin_login=')) {
              const parts = decodedText.split('admin_login=');
              scannedSessionId = parts[1]?.split('&')[0] || '';
            } else if (decodedText.startsWith('ADM-')) {
              scannedSessionId = decodedText;
            }

            if (scannedSessionId) {
              showToast('QR Code Recognized! Approve with Admin Password on device.', 'info');
              const inputPass = prompt('Enter Admin Password to confirm:');
              if (inputPass) {
                const res = await authService.approveAdminLoginSession(scannedSessionId, inputPass);
                if (res.success) {
                  unlockAdminDirect();
                  try {
                    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                  } catch {}
                  showToast('👑 Welcome Admin! Authenticated.', 'success');
                  onClose();
                  if (onSuccess) onSuccess();
                } else {
                  showToast('Incorrect password.', 'error');
                }
              }
            }
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera scanner error:', err);
        showToast('Camera not available or permission denied.', 'error');
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

  const handleCopyLink = () => {
    if (!session) return;
    const targetUrl = `${window.location.origin}/?admin_login=${session.sessionId}`;
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    showToast('Admin verification link copied!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError(false);

    try {
      const success = await loginAdmin(password.trim());
      if (success) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
        showToast('👑 Welcome Admin! Full access unlocked.', 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(true);
        showToast('Incorrect password. Please try again.', 'error');
        inputRef.current?.focus();
      }
    } catch {
      setError(true);
      showToast('Authentication failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 22,
          padding: '24px 20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X size={18} />
        </button>

        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#fff',
              margin: '0 auto 8px',
              padding: 4,
              boxShadow: '0 6px 16px rgba(249, 115, 22, 0.2), 0 0 0 2px #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={euriskaLogo} alt="Euriska" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#fff7ed',
              color: '#c2410c',
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            <ShieldCheck size={12} />
            <span>Admin Gateway</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
            Admin Access
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            Scan with your authorized mobile phone or enter passcode.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            marginBottom: 16,
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
              padding: '8px 12px',
              borderRadius: 9,
              border: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              background: authMode === 'QR_SCAN' ? '#ffffff' : 'transparent',
              color: authMode === 'QR_SCAN' ? '#0f172a' : '#64748b',
              boxShadow: authMode === 'QR_SCAN' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <QrCode size={15} color={authMode === 'QR_SCAN' ? '#ea580c' : '#64748b'} />
            <span>Scan to Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('PASSWORD');
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 9,
              border: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              background: authMode === 'PASSWORD' ? '#ffffff' : 'transparent',
              color: authMode === 'PASSWORD' ? '#0f172a' : '#64748b',
              boxShadow: authMode === 'PASSWORD' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={15} color={authMode === 'PASSWORD' ? '#ea580c' : '#64748b'} />
            <span>Passcode / Password</span>
          </button>
        </div>

        {/* TAB 1: SCAN QR TO LOGIN */}
        {authMode === 'QR_SCAN' && (
          <div style={{ animation: 'fadeIn 0.2s ease', textAlign: 'center' }}>
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #fed7aa',
                borderRadius: 16,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              {qrCodeUrl ? (
                <div style={{ position: 'relative', background: '#ffffff', padding: 6, borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                  <img
                    src={qrCodeUrl}
                    alt="Admin Login QR"
                    style={{ width: 175, height: 175, display: 'block', borderRadius: 8 }}
                  />
                  {timeLeft === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: 10,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#dc2626' }}>QR Expired</span>
                      <button
                        onClick={initQrSession}
                        style={{
                          padding: '6px 12px',
                          background: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <RefreshCw size={12} /> Refresh
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: 175, height: 175, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={22} className="animate-spin" />
                </div>
              )}

              {/* Real-time listening indicator */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ea580c',
                    boxShadow: '0 0 0 3px rgba(234, 88, 12, 0.25)',
                    animation: 'pulse 1.8s infinite',
                  }}
                />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  Waiting for mobile authorization...
                </span>
              </div>

              {/* Session ID & Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  {session?.sessionId || 'ADM-SESSION'}
                </span>
                <span style={{ fontSize: 10.5, color: timeLeft < 30 ? '#ef4444' : '#64748b', fontWeight: 700 }}>
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
                  <RefreshCw size={12} style={{ transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s' }} />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={startCameraScanner}
                style={{
                  flex: 1,
                  padding: '9px 12px',
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
                <span>Camera Scan</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '9px 12px',
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
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PASSWORD FORM */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: error ? '#dc2626' : '#94a3b8',
                  }}
                >
                  <Lock size={18} />
                </div>

                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter passcode or password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  style={{
                    width: '100%',
                    height: 44,
                    paddingLeft: 38,
                    paddingRight: 40,
                    borderRadius: 12,
                    border: error ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    background: error ? '#fef2f2' : '#f8fafc',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#dc2626',
                    fontWeight: 700,
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>⚠️</span>
                  <span>Invalid passcode or password. Please try again.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 12,
                border: 'none',
                background: !password.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                cursor: !password.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: !password.trim() ? 'none' : '0 4px 14px rgba(249, 115, 22, 0.4)',
              }}
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Admin Mode'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* In-app Camera Scanner Modal overlay */}
        {isCameraActive && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              style={{
                maxWidth: 360,
                width: '100%',
                background: '#ffffff',
                borderRadius: 20,
                padding: 20,
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Camera size={16} color="#ea580c" /> Scan Admin QR Code
                </span>
                <button
                  onClick={stopCameraScanner}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                id="admin-camera-reader"
                style={{
                  width: '100%',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#000000',
                  minHeight: 230,
                }}
              />

              <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, margin: '10px 0 0 0' }}>
                Point camera at the Admin Login QR Code on another device.
              </p>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 12,
              color: '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Continue as Resident (Guest Mode)
          </button>
        </div>
      </div>
    </div>
  );
};

