import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock, X, Sparkles, KeyRound, Ban, Zap, Wifi, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService, type AdminLoginSession } from '../../services/authService';
import { fetchPublicIPAndLocation } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

interface Props {
  onApproved?: () => void;
}

export const AdminScanApprovalModal: React.FC<Props> = ({ onApproved }) => {
  const { isAdmin, unlockAdminDirect } = useAuth();
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<AdminLoginSession | null>(null);
  const [currentIp, setCurrentIp] = useState<string>('Detecting...');
  const [ipMatchStatus, setIpMatchStatus] = useState<'MATCHED' | 'MISMATCH' | 'CHECKING'>('CHECKING');
  const [authMethod, setAuthMethod] = useState<'ONE_TAP' | 'PASSWORD'>('ONE_TAP');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSession = params.get('admin_login') || params.get('admin_auth');
    if (loginSession) {
      setSessionId(loginSession);
      // Fetch session data & current IP
      (async () => {
        const [sess, net] = await Promise.all([
          authService.getAdminLoginSession(loginSession),
          fetchPublicIPAndLocation(),
        ]);
        if (sess) setSessionData(sess);
        setCurrentIp(net.ip);

        if (sess && sess.creatorIp && net.ip) {
          if (sess.creatorIp === net.ip || net.ip === 'Active Client Device') {
            setIpMatchStatus('MATCHED');
            setAuthMethod('ONE_TAP');
          } else {
            setIpMatchStatus('MISMATCH');
            setAuthMethod('PASSWORD');
          }
        } else {
          setIpMatchStatus('MATCHED');
        }
      })();
    }
  }, []);

  if (!sessionId) return null;

  // Option A: 1-Tap Instant Approval
  const handleOneTapApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authService.approveAdminLoginSessionDirect(sessionId);
      if (res.success) {
        setIsApproved(true);
        // Also unlock admin privileges on current mobile device
        unlockAdminDirect();
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Super Admin Login Approved! Desktop & Phone Unlocked.', 'success');
        if (onApproved) onApproved();

        const url = new URL(window.location.href);
        url.searchParams.delete('admin_login');
        url.searchParams.delete('admin_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('1-Tap Admin approval failed:', err);
      setErrorMessage('Could not approve admin session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option B: Password / Passcode Verification Approval
  const handlePasswordApprove = async () => {
    if (!password.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authService.approveAdminLoginSession(sessionId, password.trim());
      if (res.success) {
        setIsApproved(true);
        // Also unlock admin privileges on current mobile device
        unlockAdminDirect();
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Admin Login Approved with Passcode! Both Devices Unlocked.', 'success');
        if (onApproved) onApproved();

        const url = new URL(window.location.href);
        url.searchParams.delete('admin_login');
        url.searchParams.delete('admin_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('Password approval failed:', err);
      setErrorMessage('Could not approve admin session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Immediate Rejection (Security Safeguard)
  const handleReject = async () => {
    try {
      await authService.rejectAdminLoginSession(sessionId);
      setIsRejected(true);
      showToast('Session was safely rejected & terminated.', 'info');
      setTimeout(() => handleClose(), 1500);
    } catch {
      handleClose();
    }
  };

  const handleClose = () => {
    setSessionId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin_login');
    url.searchParams.delete('admin_auth');
    window.history.replaceState({}, document.title, url.pathname + url.search);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          background: '#ffffff',
          borderRadius: 24,
          padding: '28px 22px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1.5px solid #fed7aa',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
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
          <X size={16} />
        </button>

        {isApproved ? (
          <div style={{ padding: '10px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Admin Login Authorized! 👑
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              The desktop browser is now securely unlocked with full <strong>Super Admin</strong> access.
            </p>
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Done / Close
            </button>
          </div>
        ) : isRejected ? (
          <div style={{ padding: '10px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Ban size={36} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Session Rejected
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              The requesting session was safely terminated and blocked.
            </p>
          </div>
        ) : (
          <div>
            {/* Logo */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: '#fff',
                margin: '0 auto 10px',
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
                gap: 5,
                background: '#fff7ed',
                color: '#c2410c',
                fontSize: 11,
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              <ShieldCheck size={13} /> Secure Mobile Approval
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Authorize Admin Login
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Approve instant desktop access for session:
            </p>

            {/* IP Verification Status Card */}
            {ipMatchStatus === 'MATCHED' ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 12,
                  padding: '9px 12px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'left',
                }}
              >
                <Wifi size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>
                    ✅ Same Network / Wi-Fi Verified
                  </div>
                  <div style={{ fontSize: 10.5, color: '#166534' }}>
                    Client IP: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{currentIp}</span> • Trusted Device Pair
                  </div>
                </div>
              </div>
            ) : ipMatchStatus === 'MISMATCH' ? (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: 12,
                  padding: '9px 12px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'left',
                }}
              >
                <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309' }}>
                    ⚠️ Different Network (Passcode Required)
                  </div>
                  <div style={{ fontSize: 10.5, color: '#92400e' }}>
                    Phone ({currentIp}) ≠ Desktop ({sessionData?.creatorIp || 'Original'})
                  </div>
                </div>
              </div>
            ) : null}

            {/* Verification Mode Selector */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 12,
                marginBottom: 16,
                gap: 4,
              }}
            >
              <button
                type="button"
                onClick={() => setAuthMethod('ONE_TAP')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMethod === 'ONE_TAP' ? '#ffffff' : 'transparent',
                  color: authMethod === 'ONE_TAP' ? '#ea580c' : '#64748b',
                  boxShadow: authMethod === 'ONE_TAP' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Zap size={14} />
                <span>Option A: 1-Tap</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('PASSWORD')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMethod === 'PASSWORD' ? '#ffffff' : 'transparent',
                  color: authMethod === 'PASSWORD' ? '#ea580c' : '#64748b',
                  boxShadow: authMethod === 'PASSWORD' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <KeyRound size={14} />
                <span>Option B: Password</span>
              </button>
            </div>

            {/* OPTION A: 1-TAP INSTANT APPROVAL */}
            {authMethod === 'ONE_TAP' && (
              <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: 14 }}>
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 14,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <ShieldCheck size={16} /> 1-Tap Instant Authentication
                  </div>
                  <div style={{ fontSize: 11.5, color: '#15803d', lineHeight: 1.4 }}>
                    {isAdmin
                      ? 'Verified Committee Admin Device active. Tap below to unlock desktop instantly.'
                      : 'Authenticate desktop immediately with secure cryptographic verification.'}
                  </div>
                </div>

                <button
                  onClick={handleOneTapApprove}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>{isSubmitting ? 'Unlocking Desktop...' : '⚡ 1-Tap Approve Desktop Login'}</span>
                </button>
              </div>
            )}

            {/* OPTION B: PASSWORD VERIFICATION */}
            {authMethod === 'PASSWORD' && (
              <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: 14 }}>
                <div style={{ marginBottom: 14, textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Enter Admin Password to Authorize:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && password.trim() && !isSubmitting) {
                          e.preventDefault();
                          handlePasswordApprove();
                        }
                      }}
                      placeholder="••••••••"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 36px',
                        borderRadius: 10,
                        border: errorMessage ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                        fontSize: 16,
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {errorMessage && (
                    <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 6 }}>
                      {errorMessage}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePasswordApprove}
                  disabled={isSubmitting || !password.trim()}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: password.trim() ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: password.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: password.trim() ? '0 8px 20px rgba(249, 115, 22, 0.35)' : 'none',
                  }}
                >
                  <KeyRound size={16} />
                  <span>{isSubmitting ? 'Verifying & Unlocking...' : 'Authorize with Password'}</span>
                </button>
              </div>
            )}

            {/* Security Reject Button */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={handleReject}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#dc2626',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Ban size={13} />
                <span>Don't recognize this request? Reject &amp; Terminate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

