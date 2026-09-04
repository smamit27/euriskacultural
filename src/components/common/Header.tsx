import React from 'react';
import { Bell, LogIn, LogOut, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LivePresenceBadge } from './LivePresenceBadge';
import type { ActiveSession } from '../../services/presenceService';
import euriskaLogo from '/euriska_logo.png';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  onOpenNotifications?: () => void;
  sessions?: ActiveSession[];
  onOpenTrafficModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  onOpenNotifications,
  sessions = [],
  onOpenTrafficModal,
}) => {
  const { isAdmin, logoutAdmin } = useAuth();
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      showToast('🎉 Cultural & Festive Calendar 2026–27 is LIVE! Check schedule in Programs.', 'info');
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      logoutAdmin();
      showToast('Switched to Resident view. Financial details hidden.', 'info');
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          overflow: 'hidden',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          flexShrink: 0,
        }}>
          <img
            src={euriskaLogo}
            alt="Euriska Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }}
          />
        </div>
        <div className="header-brand">
          <span className="brand-title brand-title-full">EURISKA</span>
          <span className="brand-title brand-title-mobile">EURISKA</span>
          <span className="brand-subtitle">Celebrating Togetherness 2026–27</span>
        </div>
      </div>

      <div className="header-right">
        {/* Real-time active visitors badge */}
        <LivePresenceBadge sessions={sessions} onClick={onOpenTrafficModal} />

        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={onOpenAdminLogin}
              className="role-tag"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                color: '#166534',
                fontWeight: 800,
              }}
              title="Click to generate QR code and pair/transfer Admin session to mobile"
            >
              <QrCode size={12} />
              <span>Pair Phone</span>
            </button>

            <button
              onClick={handleAdminToggle}
              className="role-tag"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#fef2f2',
                borderColor: '#fecaca',
                color: '#dc2626',
              }}
              title="Click to Exit Admin & Switch to Resident view"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdminToggle}
            className="role-tag"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#fff7ed',
              borderColor: '#fed7aa',
              color: '#ea580c',
              fontWeight: 800,
            }}
            title="Click to enter password and unlock Admin access"
          >
            <LogIn size={12} />
            <span>Admin Login</span>
          </button>
        )}

        <button
          onClick={handleNotificationClick}
          className="icon-btn"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
};
