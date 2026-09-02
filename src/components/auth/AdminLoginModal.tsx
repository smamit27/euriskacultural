import React, { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError(false);

    try {
      const success = await loginAdmin(password.trim());
      if (success) {
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: 380,
          background: '#ffffff',
          borderRadius: 20,
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
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
            Admin Login
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            Enter admin password to view contributions &amp; expenses
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
                placeholder="Enter admin password..."
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
                <span>Incorrect password. Please try again.</span>
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
