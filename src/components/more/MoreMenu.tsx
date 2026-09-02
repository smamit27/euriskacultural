import React from 'react';
import {
  Calendar, Image, Mic, Handshake, Users, ClipboardList, BarChart3, Settings, LogIn, LogOut, PartyPopper, Palette, Flame, UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type SubPage = 'programs' | 'performances' | 'gallery' | 'sponsors' | 'volunteers' | 'tasks' | 'reports' | 'settings' | 'events' | 'kalakriti' | 'prasad' | 'mahaprasad';

interface MoreMenuProps {
  onNavigate: (page: SubPage) => void;
  onOpenAdminLogin?: () => void;
}

const MENU_ITEMS: { page: SubPage; icon: React.ReactNode; label: string; desc: string; adminOnly?: boolean }[] = [
  { page: 'mahaprasad', icon: <UtensilsCrossed size={22} color="#c2410c" />, label: '🍲 Maha Prasad RSVP (24 Sep)', desc: 'Community feast headcount & meal token (8:00 PM – 10:00 PM)', adminOnly: true },
  { page: 'prasad', icon: <Flame size={22} color="#ea580c" />, label: '🪔 Ganpati Prasad Seva', desc: 'Book evening Aarti (8 PM) prasad slots' },
  { page: 'kalakriti', icon: <Palette size={22} color="#ea580c" />, label: '🎨 Kalakriti', desc: 'Activity matrix & resident registrations' },
  { page: 'events', icon: <PartyPopper size={22} color="#d97706" />, label: '🎉 Cultural Calendar', desc: 'Festive events 2026–27' },
  { page: 'programs', icon: <Calendar size={22} color="#7e22ce" />, label: '🎭 Programs', desc: 'Full event schedule & timeline' },
  { page: 'performances', icon: <Mic size={22} color="#0e7490" />, label: '🎤 Performances', desc: 'Artists, acts & stage lineup' },
  { page: 'gallery', icon: <Image size={22} color="#c2410c" />, label: '📸 Gallery', desc: 'Photo albums & moments' },
  { page: 'sponsors', icon: <Handshake size={22} color="#047857" />, label: '🤝 Sponsors', desc: 'Partners & supporters' },
  { page: 'volunteers', icon: <Users size={22} color="#b45309" />, label: '👥 Volunteers', desc: 'Team members & shifts' },
  { page: 'tasks', icon: <ClipboardList size={22} color="#7c3aed" />, label: '📋 Tasks', desc: 'Kanban task board', adminOnly: true },
  { page: 'reports', icon: <BarChart3 size={22} color="#0369a1" />, label: '📊 Financial Transparency Report', desc: 'Infographic, expenses & collections', adminOnly: true },
  { page: 'settings', icon: <Settings size={22} color="#475569" />, label: '⚙️ Settings', desc: 'App preferences & account' },
];

export const MoreMenu: React.FC<MoreMenuProps> = ({ onNavigate, onOpenAdminLogin }) => {
  const { isAdmin, logoutAdmin, user } = useAuth();
  const { showToast } = useToast();

  const handleAdminAction = () => {
    if (isAdmin) {
      logoutAdmin();
      showToast('Switched to Resident view. Financial tabs hidden.', 'info');
    } else {
      if (onOpenAdminLogin) {
        onOpenAdminLogin();
      }
    }
  };

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>More</h1>
        {user && (
          <div style={{
            marginTop: 10,
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#fff',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16,
            }}>
              {isAdmin ? '👑' : '👤'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                {isAdmin ? user.displayName : 'Resident Mode'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {isAdmin ? 'Full Financial & Admin Privileges' : 'Public & Cultural Access'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="more-menu-grid" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MENU_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <div
              key={item.page}
              onClick={() => onNavigate(item.page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{item.desc}</div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 18 }}>›</div>
            </div>
          );
        })}

        {/* Admin Login / Logout Action */}
        <div
          onClick={handleAdminAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: isAdmin ? '#fff5f5' : '#fff7ed',
            border: isAdmin ? '1px solid #fecaca' : '1px solid #fed7aa',
            borderRadius: 14,
            padding: '12px 14px',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isAdmin ? '#fee2e2' : '#ffedd5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isAdmin ? <LogOut size={22} color="#dc2626" /> : <LogIn size={22} color="#ea580c" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: isAdmin ? '#dc2626' : '#c2410c' }}>
              {isAdmin ? '🚪 Exit Admin Mode' : '👑 Admin Login'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
              {isAdmin ? 'Switch back to safe Resident view' : 'Enter password to view Contributions & Expenses'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
