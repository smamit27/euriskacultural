import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, X, Sparkles, Ban, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService, type AdminLoginSession } from '../../services/authService';
import { fetchPublicIPAndLocation, isSameNetwork } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

interface Props {
  onApproved?: () => void;
}

export const AdminScanApprovalModal: React.FC<Props> = ({ onApproved }) => {
  const { unlockAdminDirect } = useAuth();
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<AdminLoginSession | null>(null);
  const [currentIp, setCurrentIp] = useState<string>('Detecting...');
  const [ipMatchStatus, setIpMatchStatus] = useState<'MATCHED' | 'MISMATCH' | 'CHECKING'>('CHECKING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkNetworkAndSession = async (loginSession: string) => {
    setIpMatchStatus('CHECKING');
    setErrorMessage('');
    const [sess, net] = await Promise.all([
      authService.getAdminLoginSession(loginSession),
      fetchPublicIPAndLocation(),
    ]);
    if (sess) setSessionData(sess);
    setCurrentIp(net.ip);

    if (sess && sess.creatorIp && net.ip && sess.creatorIp !== 'Unknown IP' && net.ip !== 'Unknown IP') {
      if (isSameNetwork(sess.creatorIp, net.ip)) {
        setIpMatchStatus('MATCHED');
        setErrorMessage('');
      } else {
        setIpMatchStatus('MISMATCH');
        setErrorMessage(`Network mismatch: Desktop is on ${sess.creatorIp}, but this phone is on ${net.ip}. Both devices must be on the same Wi-Fi.`);
      }
    } else {
      // If unable to verify IP, mark as mismatch to be strictly safe
      setIpMatchStatus('MISMATCH');
      setErrorMessage('Could not verify that both devices share the same Wi-Fi network.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginSession = params.get('admin_login') || params.get('admin_auth');
    if (loginSession) {
      setSessionId(loginSession);
      checkNetworkAndSession(loginSession);
    }
  }, []);

  if (!sessionId) return null;

  // 1-Tap Pair Phone (Strict Same-Network Verification)
  const handleOneTapApprove = async () => {
    if (ipMatchStatus !== 'MATCHED') {
      showToast('Cannot pair: Devices are not on the same Wi-Fi network.', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authService.approveAdminLoginSessionDirect(sessionId);
      if (res.success) {
        setIsApproved(true);
        // Unlock admin privileges on current mobile device
        unlockAdminDirect();
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Phone Paired! Super Admin Active on Both Devices.', 'success');
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
      console.error('Admin pairing failed:', err);
      setErrorMessage('Could not complete device pairing. Check Wi-Fi connection.');
      showToast('Pairing failed.', 'error');
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
          border: ipMatchStatus === 'MISMATCH' ? '2px solid #ef4444' : '1.5px solid #fed7aa',
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
              Device Paired Successfully! 👑
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              This mobile phone and your desktop are now authenticated with full <strong>Super Admin</strong> access.
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
              Done / Start Using Admin
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
              The pairing request was safely terminated and blocked.
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
              <ShieldCheck size={13} /> QR Device Pairing
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Pair Admin on Phone
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Scan verified from desktop session:
            </p>

            {/* IP Verification Status Card */}
            {ipMatchStatus === 'CHECKING' ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                }}
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>Verifying Wi-Fi Network Match...</span>
              </div>
            ) : ipMatchStatus === 'MATCHED' ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 16,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Wifi size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#15803d' }}>
                    ✅ Same Wi-Fi Network Verified
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: '#166534', lineHeight: 1.4 }}>
                  Both Desktop &amp; Phone are on IP: <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{currentIp}</span>. Ready for 1-Tap pairing.
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#fef2f2',
                  border: '2px solid #f87171',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 16,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#991b1b' }}>
                    ⛔ Pairing Blocked: Network Mismatch
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: '#b91c1c', lineHeight: 1.4, marginBottom: 6 }}>
                  Your phone is on <strong>Mobile SIM/Data</strong> (<span style={{ fontFamily: 'monospace' }}>{currentIp}</span>), while desktop is on <strong>Home Wi-Fi</strong> (<span style={{ fontFamily: 'monospace' }}>{sessionData?.creatorIp || 'Desktop Wi-Fi'}</span>).
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7f1d1d', marginBottom: 8 }}>
                  👉 Please switch this phone to your <strong>Home Wi-Fi</strong> and tap Re-check below:
                </div>
                <button
                  type="button"
                  onClick={() => sessionId && checkNetworkAndSession(sessionId)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} /> Re-check Wi-Fi Network
                </button>
              </div>
            )}

            {/* Error Message if any */}
            {errorMessage && ipMatchStatus === 'MISMATCH' && (
              <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 700, marginBottom: 12 }}>
                {errorMessage}
              </div>
            )}

            {/* 1-Tap Pair Button */}
            <div style={{ marginBottom: 14 }}>
              <button
                onClick={handleOneTapApprove}
                disabled={isSubmitting || ipMatchStatus !== 'MATCHED'}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  background:
                    ipMatchStatus === 'MATCHED'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : '#cbd5e1',
                  color: '#ffffff',
                  fontSize: 14.5,
                  fontWeight: 900,
                  border: 'none',
                  cursor: ipMatchStatus === 'MATCHED' ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow:
                    ipMatchStatus === 'MATCHED'
                      ? '0 8px 20px rgba(16, 185, 129, 0.35)'
                      : 'none',
                }}
              >
                <Sparkles size={18} />
                <span>
                  {isSubmitting
                    ? 'Pairing Devices...'
                    : ipMatchStatus === 'MATCHED'
                    ? '⚡ 1-Tap Pair Phone (Unlock Admin)'
                    : '⛔ Connect to Same Wi-Fi to Pair'}
                </span>
              </button>
            </div>

            {/* Security Reject / Cancel Button */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>

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
                <span>Terminate Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


