import React from 'react';
import { Home, Palette, Flame, IndianRupee, ReceiptText, Grid, LogIn, LogOut, BarChart3, UtensilsCrossed } from 'lucide-react';

export type TabType = 'home' | 'prasad' | 'mahaprasad' | 'kalakriti' | 'report' | 'contributions' | 'expenses' | 'more';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
  onOpenAdminLogin?: () => void;
  logoutAdmin?: () => void;
}

const NAV_ITEMS: {
  tab: TabType;
  label: (isAdmin: boolean) => string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}[] = [
  { tab: 'home', label: () => 'Home', icon: <Home size={22} /> },
  { tab: 'prasad', label: () => 'Prasad Seva', icon: <Flame size={22} /> },
  { tab: 'mahaprasad', label: () => 'Maha Prasad', icon: <UtensilsCrossed size={22} /> },
  { tab: 'kalakriti', label: () => 'Kalakriti', icon: <Palette size={22} /> },
  {
    tab: 'report',
    label: () => 'Financial Report',
    icon: <BarChart3 size={22} />,
    adminOnly: true,
  },
  {
    tab: 'contributions',
    label: () => 'Contributions',
    icon: <IndianRupee size={22} />,
    adminOnly: true,
  },
  {
    tab: 'expenses',
    label: () => 'Expenses',
    icon: <ReceiptText size={22} />,
    adminOnly: true,
  },
  { tab: 'more', label: () => 'More', icon: <Grid size={22} /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  onOpenAdminLogin,
  logoutAdmin,
}) => {
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      <div className="sidebar-nav-items" style={{ display: 'contents' }}>
        {visibleItems.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            aria-label={label(isAdmin)}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {/* Active pill shown only on mobile */}
            {activeTab === tab && <span className="nav-active-pill" />}
            <div className="nav-icon-container">{icon}</div>
            <span className="nav-label">{label(isAdmin)}</span>
          </button>
        ))}
      </div>

      {/* Desktop/Tablet Sidebar Admin Footer Action */}
      <div className="sidebar-admin-footer">
        {isAdmin ? (
          <button
            onClick={logoutAdmin}
            className="sidebar-admin-btn admin-active"
            title="Click to Exit Admin Mode"
          >
            <LogOut size={18} />
            <span>Exit Admin</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="sidebar-admin-btn"
            title="Enter password to access Admin features"
          >
            <LogIn size={18} />
            <span>👑 Admin Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};
