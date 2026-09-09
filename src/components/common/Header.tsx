import React from 'react';
import { Bell } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { ActiveSession } from '../../services/presenceService';
import euriskaLogo from '/euriska_logo.png';

interface HeaderProps {
  onOpenAdminLogin?: () => void;
  onOpenPairPhone?: () => void;
  onOpenNotifications?: () => void;
  sessions?: ActiveSession[];
  onOpenTrafficModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
}) => {
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      showToast('🎉 Cultural & Festive Calendar 2026–27 is LIVE! Check schedule in Programs.', 'info');
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
