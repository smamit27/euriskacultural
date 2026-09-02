import React, { useState } from 'react';
import './index.css';
import { Bell, ChevronLeft, Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { BottomNav, type TabType } from './components/common/BottomNav';
import { HomePage } from './components/pages/HomePage';
import { ContributionsPage } from './components/pages/ContributionsPage';
import { ExpensesPage } from './components/pages/ExpensesPage';
import { MoreMenu } from './components/more/MoreMenu';
import { ProgramTimeline } from './components/programs/ProgramTimeline';
import { PerformanceList } from './components/performances/PerformanceList';
import { GalleryGrid } from './components/gallery/GalleryGrid';
import { SponsorShowcase } from './components/sponsors/SponsorShowcase';
import { VolunteerList } from './components/volunteers/VolunteerList';
import { TaskKanban } from './components/tasks/TaskKanban';
import { AddContributionSheet } from './components/contributions/AddContributionSheet';
import { AddExpenseSheet } from './components/expenses/AddExpenseSheet';
import { FirebaseSyncUtil } from './components/admin/FirebaseSyncUtil';
import { EventsCalendarPage } from './components/pages/EventsCalendarPage';
import { KalakritiPage } from './components/pages/KalakritiPage';
import { PrasadPage } from './components/pages/PrasadPage';
import { FinancialReportPage } from './components/pages/FinancialReportPage';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { LoginAuditLogView } from './components/admin/LoginAuditLogView';
import { LivePresenceBadge } from './components/common/LivePresenceBadge';
import { LiveTrafficModal } from './components/admin/LiveTrafficModal';
import { presenceService, type ActiveSession } from './services/presenceService';
import { contributionService } from './services/contributionService';
import { expenseService } from './services/expenseService';
import { useToast } from './context/ToastContext';
import euriskaLogo from '/euriska_logo.png';

type SubPage = 'programs' | 'performances' | 'gallery' | 'sponsors' | 'volunteers' | 'tasks' | 'reports' | 'settings' | 'events' | 'kalakriti' | 'prasad';

const PAGE_TITLES: Record<string, string> = {
  home: 'Dashboard',
  prasad: 'Ganpati Prasad Seva (8:00 PM Aarti)',
  kalakriti: 'Kalakriti Activity Board',
  contributions: 'Contributions',
  expenses: 'Expenses',
  report: 'Financial Transparency Report',
  more: 'More',
  programs: 'Event Schedule',
  performances: 'Performances',
  gallery: 'Photo Gallery',
  sponsors: 'Sponsors',
  volunteers: 'Volunteers',
  tasks: 'Task Board',
  reports: 'Financial Transparency Report',
  settings: 'Settings',
  events: 'Cultural Calendar',
};

/* Desktop top header strip — hidden on mobile via CSS */
function DesktopHeader({
  activeTab,
  subPage,
  onBack,
  onOpenAdminLogin,
  sessions = [],
  onOpenTrafficModal,
}: {
  activeTab: TabType;
  subPage: string | null;
  onBack: () => void;
  onOpenAdminLogin: () => void;
  sessions?: ActiveSession[];
  onOpenTrafficModal?: () => void;
}) {
  const { isAdmin, logoutAdmin } = useAuth();
  const { showToast } = useToast();
  const title = PAGE_TITLES[subPage ?? activeTab] ?? 'Dashboard';

  const handleAdminToggle = () => {
    if (isAdmin) {
      logoutAdmin();
      showToast('Switched to Resident view. Financial tabs hidden.', 'info');
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <div className="desktop-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {subPage && (
          <button
            onClick={onBack}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 10,
              width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#0f172a',
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {/* Euriska Logo */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          overflow: 'hidden', background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={euriskaLogo} alt="Euriska" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Euriska — Celebrating Togetherness 2026–27</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Real-time active visitors badge */}
        <LivePresenceBadge sessions={sessions} onClick={onOpenTrafficModal} />

        {/* Role toggle button */}
        {isAdmin ? (
          <button
            onClick={handleAdminToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', borderRadius: 8, padding: '6px 12px',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}
            title="Click to Exit Admin"
          >
            <Shield size={14} />
            <span>Admin Active (Click to Exit)</span>
          </button>
        ) : (
          <button
            onClick={handleAdminToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
              color: '#ea580c', borderRadius: 8, padding: '6px 12px',
              cursor: 'pointer', fontSize: 12, fontWeight: 800,
            }}
            title="Enter password to access Admin features"
          >
            <Shield size={14} />
            <span>👑 Admin Login</span>
          </button>
        )}
        {/* Notification bell */}
        <button
          style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10,
            width: 38, height: 38, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', position: 'relative',
          }}
        >
          <Bell size={18} color="#64748b" />
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 8, height: 8,
            background: '#ef4444', borderRadius: '50%', border: '2px solid #f8fafc',
          }} />
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAdmin, logoutAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [subPage, setSubPage] = useState<SubPage | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [showTrafficModal, setShowTrafficModal] = useState(false);

  // Initialize real-time presence heartbeat
  React.useEffect(() => {
    presenceService.init(isAdmin ? 'ADMIN' : 'RESIDENT', subPage || activeTab);
    const unsubscribe = presenceService.subscribe((activeList) => {
      setSessions(activeList);
    });
    return () => unsubscribe();
  }, []);

  // Update presence status when page or role changes
  React.useEffect(() => {
    presenceService.updateState(isAdmin ? 'ADMIN' : 'RESIDENT', subPage || activeTab);
  }, [isAdmin, activeTab, subPage]);

  // Dynamically update document title for SEO, accessibility & bookmarking
  React.useEffect(() => {
    const currentTitle = PAGE_TITLES[subPage ?? activeTab] ?? 'Dashboard';
    document.title = `${currentTitle} | Euriska — Celebrating Togetherness (2026–27)`;
  }, [activeTab, subPage]);

  const [, setSelectedBuilding] = useState('A');
  const [showAddContrib, setShowAddContrib] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Sync URL pathname with tab on load & history changes
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const tabParam = (searchParams.get('tab') || '').toLowerCase();

      if (path.includes('/report') || tabParam === 'report' || hash.includes('report')) {
        if (isAdmin) {
          setActiveTab('report');
          setSubPage(null);
        } else {
          setActiveTab('home');
          setSubPage(null);
          setShowAdminLogin(true);
        }
      } else if (path.includes('/prasad') || tabParam === 'prasad' || path.includes('/mahaprasad') || tabParam === 'mahaprasad') {
        setActiveTab('prasad');
        setSubPage(null);
      } else if (path.includes('/kalakriti') || tabParam === 'kalakriti') {
        setActiveTab('kalakriti');
        setSubPage(null);
      } else if (tabParam === 'events' || path.includes('/events')) {
        setSubPage('events');
      } else if (tabParam === 'programs' || path.includes('/programs')) {
        setSubPage('programs');
      } else if (tabParam === 'gallery' || path.includes('/gallery')) {
        setSubPage('gallery');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin]);

  const handleTabChange = (tab: TabType) => {
    if ((tab === 'contributions' || tab === 'expenses' || tab === 'report') && !isAdmin) {
      showToast('🔒 Admin password required for Financial Reports, Contributions & Expenses.', 'info');
      setShowAdminLogin(true);
      return;
    }
    setSubPage(null);
    setActiveTab(tab);

    try {
      if (tab === 'report') {
        window.history.pushState(null, '', '/report');
      } else if (tab === 'home') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/${tab}`);
      }
    } catch {
      // Ignore if pushState blocked
    }
  };

  const handleNavigate = (section: string) => {
    // Map certain sections to tabs
    if (section === 'report' || section === 'reports') {
      if (!isAdmin) {
        showToast('🔒 Admin password required to view Financial Reports.', 'info');
        setShowAdminLogin(true);
        return;
      }
      handleTabChange('report');
      return;
    }
    if (section === 'contributions') {
      if (!isAdmin) {
        showToast('🔒 Admin password required for Contributions.', 'info');
        setShowAdminLogin(true);
        return;
      }
      handleTabChange('contributions');
      return;
    }
    if (section === 'expenses') {
      if (!isAdmin) {
        showToast('🔒 Admin password required for Expenses.', 'info');
        setShowAdminLogin(true);
        return;
      }
      handleTabChange('expenses');
      return;
    }
    if (section === 'prasad') { handleTabChange('prasad'); return; }
    if (section === 'kalakriti') { handleTabChange('kalakriti'); return; }
    if (section === 'events') { setActiveTab('more'); setSubPage('events'); return; }

    const subPages: SubPage[] = ['programs', 'performances', 'gallery', 'sponsors', 'volunteers', 'tasks', 'settings', 'kalakriti', 'prasad'];
    if (subPages.includes(section as SubPage)) {
      setActiveTab('more');
      setSubPage(section as SubPage);
    }
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    if (!isAdmin) {
      setShowAdminLogin(true);
    } else {
      handleTabChange('contributions');
    }
  };

  const handleSaveContrib = async (data: any) => {
    try {
      await contributionService.addContribution({ ...data, eventId: 'EURISKA-CULTURAL-2026' });
      showToast('✅ Contribution recorded successfully!', 'success');
      setShowAddContrib(false);
    } catch {
      showToast('Failed to record contribution.', 'error');
    }
  };

  const handleSaveExpense = async (data: any) => {
    try {
      await expenseService.addExpense(data);
      showToast('✅ Expense submitted for approval!', 'success');
      setShowAddExpense(false);
    } catch {
      showToast('Failed to save expense.', 'error');
    }
  };

  const renderContent = () => {
    // Sub-pages from More menu
    if (subPage === 'programs') return <ProgramTimeline onSelectProgram={() => {}} />;
    if (subPage === 'performances') return <PerformanceList onSelectPerformance={() => {}} />;
    if (subPage === 'gallery') return <GalleryGrid />;
    if (subPage === 'sponsors') return <SponsorShowcase />;
    if (subPage === 'volunteers') return <VolunteerList />;
    if (subPage === 'tasks') return <TaskKanban />;
    if (subPage === 'reports') return <FinancialReportPage />;
    if (subPage === 'settings') return <SettingsPage />;
    if (subPage === 'events') return <EventsCalendarPage />;
    if (subPage === 'kalakriti') return <KalakritiPage />;
    if (subPage === 'prasad') return <PrasadPage />;

    // Main tabs
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectBuilding={handleSelectBuilding}
            onShowAddContribution={() => {
              if (isAdmin) setShowAddContrib(true);
              else setShowAdminLogin(true);
            }}
            onShowAddExpense={() => {
              if (isAdmin) setShowAddExpense(true);
              else setShowAdminLogin(true);
            }}
          />
        );
      case 'prasad':
        return <PrasadPage />;
      case 'kalakriti':
        return <KalakritiPage />;
      case 'report':
        return <FinancialReportPage />;
      case 'contributions':
        return <ContributionsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'more':
        return <MoreMenu onNavigate={(page) => {
          if (page === 'reports') {
            handleTabChange('report');
          } else {
            setSubPage(page);
          }
        }} onOpenAdminLogin={() => setShowAdminLogin(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="mobile-shell-wrapper">
      <div className="mobile-shell">
        {/* Mobile Sticky Header (hidden on desktop via CSS) */}
        <Header
          onOpenAdminLogin={() => setShowAdminLogin(true)}
          sessions={sessions}
          onOpenTrafficModal={() => setShowTrafficModal(true)}
        />

        {/* Bottom Nav (becomes left sidebar on desktop via CSS) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setShowAdminLogin(true)}
          logoutAdmin={logoutAdmin}
        />

        {/* Scrollable Content Column */}
        <main className="app-content">
          {/* Desktop top header bar (hidden on mobile via CSS) */}
          <DesktopHeader
            activeTab={activeTab}
            subPage={subPage}
            onBack={() => setSubPage(null)}
            onOpenAdminLogin={() => setShowAdminLogin(true)}
            sessions={sessions}
            onOpenTrafficModal={() => setShowTrafficModal(true)}
          />

          {/* Sub-page back button — mobile only */}
          {subPage && (
            <div style={{
              padding: '10px 14px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
              className="mobile-back-btn-row"
            >
              <button
                onClick={() => setSubPage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 700,
                  padding: '4px 0',
                }}
              >
                ← Back
              </button>
            </div>
          )}

          {renderContent()}
        </main>

        {/* Live Active Visitors Traffic Modal */}
        <LiveTrafficModal
          isOpen={showTrafficModal}
          onClose={() => setShowTrafficModal(false)}
          sessions={sessions}
        />

        {/* Admin Password Login Modal */}
        <AdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />

        {/* Global Add Contribution Sheet */}
        <AddContributionSheet
          isOpen={showAddContrib}
          onClose={() => setShowAddContrib(false)}
          onSave={handleSaveContrib}
        />

        {/* Global Add Expense Sheet */}
        <AddExpenseSheet
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onSave={handleSaveExpense}
        />

        {/* Firebase Sync Utility (Admin only) */}
        <FirebaseSyncUtil />
      </div>
    </div>
  );
}

function SettingsPage() {
  const { isAdmin } = useAuth();
  return (
    <div style={{ padding: '0 14px 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Settings &amp; Security</h1>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>App Preferences, Security &amp; Audit Logs</p>
      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Active Session Role</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Currently browsing as: <strong>{isAdmin ? '👑 Super Admin' : '👤 Resident (Public)'}</strong></div>
      </div>

      {/* Admin Login & Device Tracking Audit Log */}
      {isAdmin && <LoginAuditLogView />}

      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '14px 16px', marginTop: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#c2410c', marginBottom: 4 }}>🏛️ Euriska Society Portal</div>
        <div style={{ fontSize: 12, color: '#9a3412', lineHeight: 1.6 }}>
          Connected live to <strong>Google Cloud Firestore</strong> (`euriskacultural.web.app`).<br />
          All participant registrations, Prasad bookings, and admin audit logs are synchronized in real time.
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
