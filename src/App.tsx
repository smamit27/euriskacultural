import React, { useState } from 'react';
import './index.css';
import { Bell, ChevronLeft } from 'lucide-react';
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
import { EventsCalendarPage } from './components/pages/EventsCalendarPage';
import { KalakritiPage } from './components/pages/KalakritiPage';
import { PrasadPage } from './components/pages/PrasadPage';
import { MahaPrasadPage } from './components/pages/MahaPrasadPage';
import { DemographicsPage } from './components/pages/DemographicsPage';
import { FinancialReportPage } from './components/pages/FinancialReportPage';
import { LiveStreamPage } from './components/pages/LiveStreamPage';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { PairDeviceModal } from './components/auth/PairDeviceModal';
import { AdminScanApprovalModal } from './components/auth/AdminScanApprovalModal';
import { DemographicsScanApprovalModal } from './components/auth/DemographicsScanApprovalModal';
import { GlossyMandapWelcomeModal } from './components/sponsors/GlossyMandapWelcomeModal';
import { LoginAuditLogView } from './components/admin/LoginAuditLogView';
import { LiveTrafficModal } from './components/admin/LiveTrafficModal';
import { LiveStreamPlayerModal } from './components/livestream/LiveStreamPlayerModal';
import { NotificationModal } from './components/notifications/NotificationModal';
import { liveStreamService } from './services/liveStreamService';
import { notificationService } from './services/notificationService';
import { presenceService, type ActiveSession } from './services/presenceService';
import { contributionService } from './services/contributionService';
import { expenseService } from './services/expenseService';
import { useToast } from './context/ToastContext';
import type { LiveStreamInfo } from './types';
import euriskaLogo from '/euriska_logo.png';

type SubPage = 'programs' | 'performances' | 'gallery' | 'sponsors' | 'volunteers' | 'tasks' | 'reports' | 'settings' | 'events' | 'kalakriti' | 'prasad' | 'mahaprasad' | 'demographics' | 'livestream';

const PAGE_TITLES: Record<string, string> = {
  home: 'Dashboard',
  livestream: '🔴 Live Stream & Aarti Darshan',
  prasad: 'Ganpati Prasad Seva (8:00 PM Aarti)',
  mahaprasad: 'Maha Prasad RSVP (24 Sep, 8-10 PM)',
  demographics: 'Executive Demographics (Confidential)',
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
  onOpenNotifications,
}: {
  activeTab: TabType;
  subPage: string | null;
  onBack: () => void;
  onOpenAdminLogin?: () => void;
  onOpenPairPhone?: () => void;
  onOpenNotifications?: () => void;
  sessions?: ActiveSession[];
  onOpenTrafficModal?: () => void;
}) {
  const title = PAGE_TITLES[subPage ?? activeTab] ?? 'Dashboard';

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
        {/* Notification bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10,
            width: 38, height: 38, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', position: 'relative',
          }}
          title="Festival Announcements & Live Aarti Notifications"
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
  const [showPairModal, setShowPairModal] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [streamInfo, setStreamInfo] = useState<LiveStreamInfo | null>(null);
  const [showLivePlayerModal, setShowLivePlayerModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const prevIsLiveRef = React.useRef(false);

  // Subscribe to real-time live stream updates & trigger notifications
  React.useEffect(() => {
    const unsub = liveStreamService.subscribeLiveStream((info) => {
      setStreamInfo(info);
      if (info?.isLive && !prevIsLiveRef.current) {
        notificationService.sendLiveStreamNotification(info, () => {
          setActiveTab('more');
          setSubPage('livestream');
        });
        showToast(`🔴 LIVE NOW: ${info.title || 'Shree Ganesh Maha Aarti'} — Tap to watch!`, 'info');
      }
      prevIsLiveRef.current = !!info?.isLive;
    });
    return () => unsub();
  }, []);

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
      } else if (path.includes('/mahaprasad') || tabParam === 'mahaprasad') {
        if (isAdmin) {
          setActiveTab('mahaprasad');
          setSubPage(null);
        } else {
          setActiveTab('prasad');
          setSubPage(null);
          setShowAdminLogin(true);
        }
      } else if (path.includes('/demographics') || tabParam === 'demographics') {
        if (isAdmin) {
          setActiveTab('more');
          setSubPage('demographics');
        } else {
          setActiveTab('home');
          setSubPage(null);
          setShowAdminLogin(true);
        }
      } else if (path.includes('/prasad') || tabParam === 'prasad') {
        setActiveTab('prasad');
        setSubPage(null);
      } else if (path.includes('/kalakriti') || tabParam === 'kalakriti') {
        setActiveTab('kalakriti');
        setSubPage(null);
      } else if (tabParam === 'events' || path.includes('/events')) {
        setSubPage('events');
      } else if (tabParam === 'programs' || path.includes('/programs')) {
        setSubPage('programs');
      } else if (tabParam === 'livestream' || path.includes('/livestream')) {
        setActiveTab('more');
        setSubPage('livestream');
      } else if (tabParam === 'gallery' || path.includes('/gallery')) {
        setSubPage('gallery');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin]);

  const handleTabChange = (tab: TabType) => {
    if ((tab === 'contributions' || tab === 'expenses' || tab === 'report' || tab === 'mahaprasad') && !isAdmin) {
      showToast('🔒 Admin password required for Maha Prasad & Financial Management.', 'info');
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
    if (section === 'demographics') {
      if (!isAdmin) {
        showToast('🔒 Admin password required for Executive Demographics.', 'info');
        setShowAdminLogin(true);
        return;
      }
      setActiveTab('more');
      setSubPage('demographics');
      return;
    }
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
    if (section === 'livestream') {
      setActiveTab('more');
      setSubPage('livestream');
      return;
    }

    const subPages: SubPage[] = ['programs', 'performances', 'gallery', 'sponsors', 'volunteers', 'tasks', 'settings', 'kalakriti', 'prasad', 'demographics', 'livestream'];
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
    if (subPage === 'demographics') return isAdmin ? <DemographicsPage /> : <HomePage onNavigate={handleNavigate} onSelectBuilding={handleSelectBuilding} onShowAddContribution={() => {}} onShowAddExpense={() => {}} />;
    if (subPage === 'livestream') return <LiveStreamPage onNavigate={handleNavigate} />;
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
    if (subPage === 'mahaprasad') return isAdmin ? <MahaPrasadPage /> : <PrasadPage />;

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
      case 'mahaprasad':
        return isAdmin ? <MahaPrasadPage /> : <PrasadPage />;
      case 'kalakriti':
        return <KalakritiPage />;
      case 'report':
        return <FinancialReportPage />;
      case 'contributions':
        return <ContributionsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'more':
        return (
          <MoreMenu
            onNavigate={(page) => {
              if (page === 'reports') {
                handleTabChange('report');
              } else {
                setSubPage(page);
              }
            }}
            onOpenAdminLogin={() => setShowAdminLogin(true)}
          />
        );
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
          onOpenPairPhone={() => setShowPairModal(true)}
          onOpenNotifications={() => setShowNotificationModal(true)}
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
            onOpenPairPhone={() => setShowPairModal(true)}
            onOpenNotifications={() => setShowNotificationModal(true)}
            sessions={sessions}
            onOpenTrafficModal={() => setShowTrafficModal(true)}
          />

          {renderContent()}
        </main>

        {/* Festival & Live Aarti Notifications Drawer Modal */}
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          streamInfo={streamInfo}
          onWatchLive={() => {
            setActiveTab('more');
            setSubPage('livestream');
          }}
          onNavigate={handleNavigate}
        />

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

        {/* Dedicated QR-Only Device Pairing Modal */}
        <PairDeviceModal
          isOpen={showPairModal}
          onClose={() => setShowPairModal(false)}
        />

        {/* Real-time Admin QR Scan Mobile Approval Modal */}
        <AdminScanApprovalModal />

        {/* Real-time Demographics QR Scan Mobile Approval Modal */}
        <DemographicsScanApprovalModal />

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

        {/* First-time visitor Glossy Decoration Seva Welcome Splash */}
        <GlossyMandapWelcomeModal
          onNavigateToSponsors={() => {
            setActiveTab('more');
            setSubPage('sponsors');
          }}
        />

        {/* Global Live Stream Devotional Player Modal */}
        <LiveStreamPlayerModal
          isOpen={showLivePlayerModal}
          onClose={() => setShowLivePlayerModal(false)}
          streamInfo={streamInfo}
          onOpenPrasadBooking={() => handleTabChange('prasad')}
        />
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
