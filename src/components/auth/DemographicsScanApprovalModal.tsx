import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Lock, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { demographicsService } from '../../services/demographicsService';
import { useToast } from '../../context/ToastContext';

interface Props {
  onApproved?: () => void;
}

export const DemographicsScanApprovalModal: React.FC<Props> = ({ onApproved }) => {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSession = params.get('demologin') || params.get('demographics_auth');
    if (loginSession) {
      setSessionId(loginSession);
    }
  }, []);

  if (!sessionId) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await demographicsService.approveLoginSession(sessionId, passcode);
      if (res.success) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('🎉 Login Approved! Desktop unlocked.', 'success');
        if (onApproved) onApproved();

        // Clear query param from address bar cleanly
        const url = new URL(window.location.href);
        url.searchParams.delete('demologin');
        url.searchParams.delete('demographics_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('Approval failed:', err);
      setErrorMessage('Could not approve session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
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
        ) : (
          <div>
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
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Session ID:</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                {sessionId}
              </span>
            </div>

            {/* Passcode input field */}
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Enter Confidential Passkey:
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: errorMessage ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: 18,
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: '0.25em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errorMessage && (
                <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 6, textAlign: 'center' }}>
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={isSubmitting || !passcode.trim()}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                background: passcode.trim() ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: passcode.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: passcode.trim() ? '0 8px 20px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Verifying & Unlocking...' : 'Approve & Unlock Desktop'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
