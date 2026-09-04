import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Lock, X, Sparkles, KeyRound, Ban, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { demographicsService } from '../../services/demographicsService';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

interface Props {
  onApproved?: () => void;
}

export const DemographicsScanApprovalModal: React.FC<Props> = ({ onApproved }) => {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'ONE_TAP' | 'PASSWORD'>('ONE_TAP');
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSession = params.get('demologin') || params.get('demographics_auth');
    if (loginSession) {
      setSessionId(loginSession);
    }
  }, []);

  if (!sessionId) return null;

  // Option A: 1-Tap Instant Approval
  const handleOneTapApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await demographicsService.approveLoginSessionDirect(sessionId);
      if (res.success) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('🚀 1-Tap Demographics Login Approved! Desktop unlocked.', 'success');
        if (onApproved) onApproved();

        const url = new URL(window.location.href);
        url.searchParams.delete('demologin');
        url.searchParams.delete('demographics_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('1-Tap Demographics approval failed:', err);
      setErrorMessage('Could not approve session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option B: Passkey Verification Approval
  const handlePasswordApprove = async () => {
    if (!passcode.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await demographicsService.approveLoginSession(sessionId, passcode.trim());
      if (res.success) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('🎉 Login Approved with Passkey! Desktop unlocked.', 'success');
        if (onApproved) onApproved();

        const url = new URL(window.location.href);
        url.searchParams.delete('demologin');
        url.searchParams.delete('demographics_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('Passkey approval failed:', err);
      setErrorMessage('Could not approve session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject / Terminate Session
  const handleReject = async () => {
    try {
      await demographicsService.rejectLoginSession(sessionId);
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
    url.searchParams.delete('demologin');
    url.searchParams.delete('demographics_auth');
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
          border: '1.5px solid #fee2e2',
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
              Login Authorized! 🚀
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              The requesting desktop screen is now unlocked and viewing <strong>Executive Demographics</strong>.
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
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2), 0 0 0 2px #fee2e2',
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
                gap: 6,
                background: '#fee2e2',
                color: '#991b1b',
                fontSize: 11,
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              <ShieldAlert size={13} /> Mobile Authorization
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Executive Demographics
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Approve instant desktop login for session:
            </p>

            {/* Session Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 16,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Session ID:</span>
                <span style={{ fontSize: 11.5, fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                  {sessionId}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#059669', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                <span>Encrypted TLS 1.3 • Single-Use Verified Nonce</span>
              </div>
            </div>

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
                  color: authMethod === 'ONE_TAP' ? '#dc2626' : '#64748b',
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
                  color: authMethod === 'PASSWORD' ? '#dc2626' : '#64748b',
                  boxShadow: authMethod === 'PASSWORD' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <KeyRound size={14} />
                <span>Option B: Passkey</span>
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
                    <ShieldCheck size={16} /> 1-Tap Instant Authorization
                  </div>
                  <div style={{ fontSize: 11.5, color: '#15803d', lineHeight: 1.4 }}>
                    Tap below to instantly verify and unlock the Executive Demographics portal on your desktop screen.
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

            {/* OPTION B: PASSKEY VERIFICATION */}
            {authMethod === 'PASSWORD' && (
              <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: 14 }}>
                <div style={{ marginBottom: 14, textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Enter Confidential Passkey:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
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
                  disabled={isSubmitting || !passcode.trim()}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: passcode.trim() ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: passcode.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: passcode.trim() ? '0 8px 20px rgba(220, 38, 38, 0.35)' : 'none',
                  }}
                >
                  <KeyRound size={16} />
                  <span>{isSubmitting ? 'Verifying & Unlocking...' : 'Authorize with Passkey'}</span>
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
