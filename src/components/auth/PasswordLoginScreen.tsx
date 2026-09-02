import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

export const PasswordLoginScreen: React.FC = () => {
  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError(false);

    try {
      const success = await loginAdmin(password.trim());
      if (success) {
        showToast('🎉 Welcome Admin to Euriska Cultural Portal!', 'success');
      } else {
        setError(true);
        showToast('Incorrect password. Please try again.', 'error');
        inputRef.current?.focus();
      }
    } catch {
      setError(true);
      showToast('Login verification failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(145deg, #0b1120 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          padding: '32px 24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 2,
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: '#ffffff',
              margin: '0 auto 14px',
              padding: 6,
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.25), 0 0 0 3px #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={euriskaLogo}
              alt="Euriska"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              padding: '3px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>Community Portal</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: -0.5 }}>
            EURISKA
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600 }}>
            Celebrating Togetherness 2026–27
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="portal-password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 800,
                color: '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Enter Password to Unlock
            </label>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: error ? '#dc2626' : '#94a3b8',
                }}
              >
                <Lock size={18} />
              </div>

              <input
                id="portal-password"
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                style={{
                  width: '100%',
                  height: 48,
                  paddingLeft: 42,
                  paddingRight: 44,
                  borderRadius: 14,
                  border: error ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                  background: error ? '#fef2f2' : '#f8fafc',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: !password.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 800,
              cursor: !password.trim() || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: !password.trim() ? 'none' : '0 6px 20px rgba(249, 115, 22, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{isSubmitting ? 'Verifying...' : 'Unlock Portal'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Protected Euriska Community Gateway</span>
        </div>
      </div>
    </div>
  );
};
