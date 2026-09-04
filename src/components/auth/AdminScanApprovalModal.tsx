import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

interface Props {
  onApproved?: () => void;
}

export const AdminScanApprovalModal: React.FC<Props> = ({ onApproved }) => {
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSession = params.get('admin_login') || params.get('admin_auth');
    if (loginSession) {
      setSessionId(loginSession);
    }
  }, []);

  if (!sessionId) return null;

  const handleApprove = async () => {
    if (!password.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authService.approveAdminLoginSession(sessionId, password.trim());
      if (res.success) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Super Admin Login Approved! Desktop unlocked.', 'success');
        if (onApproved) onApproved();

        // Clear query params cleanly
        const url = new URL(window.location.href);
        url.searchParams.delete('admin_login');
        url.searchParams.delete('admin_auth');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } catch (err) {
      console.error('Admin approval failed:', err);
      setErrorMessage('Could not approve admin session. Check connection.');
      showToast('Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
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
              The desktop browser is now unlocked with full <strong>Super Admin</strong> access.
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
              <ShieldCheck size={13} /> Mobile Admin Approval
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Authorize Admin Login
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Approve instant desktop access for session:
            </p>

            {/* Session ID Card */}
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
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Session:</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                {sessionId}
              </span>
            </div>

            {/* Password input field */}
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
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

            {/* Approve Button */}
            <button
              onClick={handleApprove}
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
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Verifying & Unlocking...' : 'Approve & Unlock Desktop'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
