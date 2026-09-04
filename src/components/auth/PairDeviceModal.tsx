import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw, Copy, Wifi, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';
import { authService, type AdminLoginSession } from '../../services/authService';
import euriskaLogo from '/euriska_logo.png';

interface PairDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PairDeviceModal: React.FC<PairDeviceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [session, setSession] = useState<AdminLoginSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPairedSuccess, setIsPairedSuccess] = useState<boolean>(false);

  // Initialize Pair QR Session
  const initPairSession = async () => {
    try {
      setIsRefreshing(true);
      setIsPairedSuccess(false);
      const newSession = await authService.createAdminLoginSession(true);
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
      console.error('Error generating Pair QR session:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initPairSession();
    } else {
      setSession(null);
      setIsPairedSuccess(false);
    }
  }, [isOpen]);

  // Real-time listener for mobile handshake
  useEffect(() => {
    if (!isOpen || !session) return;

    const unsubscribe = authService.subscribeAdminLoginSession(session.sessionId, (updated) => {
      if (updated.status === 'APPROVED') {
        setIsPairedSuccess(true);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
        showToast('👑 Phone Paired! Mobile Super Admin is now active.', 'success');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1800);
      } else if (updated.status === 'REJECTED') {
        showToast('Pairing session was rejected.', 'error');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, session?.sessionId]);

  // Countdown timer
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

  const handleCopyLink = () => {
    if (!session) return;
    const targetUrl = `${window.location.origin}/?admin_login=${session.sessionId}`;
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    showToast('Pairing link copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 24,
          padding: '26px 22px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          textAlign: 'center',
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

        {isPairedSuccess ? (
          <div style={{ padding: '16px 0' }}>
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
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Phone Paired Successfully! 👑
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Your mobile phone is now authenticated on the same Wi-Fi network. Super Admin privileges are active on both devices.
            </p>
          </div>
        ) : (
          <div>
            {/* Logo */}
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
                gap: 5,
                background: '#ecfdf5',
                color: '#065f46',
                padding: '3px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={13} />
              <span>Pure QR Device Pairing</span>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '4px 0 4px' }}>
              Pair Admin with Phone
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Scan this QR code with your phone camera to pair and unlock Super Admin on mobile.
            </p>

            {/* Desktop Wi-Fi Verification Info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '8px 12px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 12,
                color: '#334155',
              }}
            >
              <Wifi size={15} color="#059669" />
              <span>
                Desktop Network IP: <strong style={{ fontFamily: 'monospace' }}>{session?.creatorIp || 'Checking...'}</strong>
              </span>
            </div>

            {/* QR Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #fed7aa',
                borderRadius: 18,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              {qrCodeUrl ? (
                <div style={{ position: 'relative', background: '#ffffff', padding: 8, borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}>
                  <img
                    src={qrCodeUrl}
                    alt="Pair Phone QR"
                    style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
                  />
                  {timeLeft === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 14,
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
                        onClick={initPairSession}
                        style={{
                          padding: '6px 14px',
                          background: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <RefreshCw size={13} /> Refresh
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={24} className="animate-spin" />
                </div>
              )}

              {/* Waiting Indicator */}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: timeLeft > 0 ? '#10b981' : '#94a3b8',
                    display: 'inline-block',
                    animation: timeLeft > 0 ? 'pulse 1.5s infinite' : 'none',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                  {timeLeft > 0 ? `Waiting for scan... (${timeLeft}s)` : 'Session expired'}
                </span>
                {timeLeft > 0 && (
                  <button
                    type="button"
                    onClick={initPairSession}
                    disabled={isRefreshing}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2,
                    }}
                    title="Refresh QR Code"
                  >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>
            </div>

            {/* Strict Network Requirement Note */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: 11.5,
                color: '#92400e',
                lineHeight: 1.45,
                marginBottom: 12,
              }}
            >
              🔒 <strong>Strict Wi-Fi Match:</strong> Both this desktop and your phone must be on the same Wi-Fi. Pairing attempts over cellular SIM (Airtel/Jio) are strictly blocked.
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                <Copy size={13} />
                <span>{isCopied ? 'Link Copied!' : 'Copy Pairing Link'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#f1f5f9',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
