import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  Radio,
  Check,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import type { LiveStreamInfo } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamInfo?: LiveStreamInfo | null;
  onWatchLive?: () => void;
  onNavigate?: (section: string) => void;
}

const FESTIVAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: '🔴 Daily Aarti Live Streaming',
    time: 'Daily @ 8:00 AM & 8:00 PM',
    desc: 'Watch Shree Ganesh Darshan & Maha Aarti live from Mandap with lyrics & live reactions.',
    tag: 'LIVE STREAM',
    tagColor: '#ef4444',
    actionTarget: 'livestream',
  },
  {
    id: 'ann-2',
    title: '🍲 Maha Prasad Feast RSVP (24 Sep)',
    time: 'Thu, 24 Sep (8:00 PM – 10:00 PM)',
    desc: 'Society community dinner after Shri Satyanarayan Katha. Please confirm your family headcount.',
    tag: 'FEAST RSVP',
    tagColor: '#ea580c',
    actionTarget: 'prasad',
  },
  {
    id: 'ann-3',
    title: '🎭 Kalakriti 2026 Talent Registrations',
    time: 'Sun, 20 Sep (6:00 PM)',
    desc: 'Dance, singing, instrumental, skit and fancy dress registrations open for kids & adults.',
    tag: 'CULTURAL GALA',
    tagColor: '#7c3aed',
    actionTarget: 'kalakriti',
  },
  {
    id: 'ann-4',
    title: '🎪 Society Carnival & 91.1 FM Live RJ',
    time: 'Sat, 19 Sep (6:00 PM Onwards)',
    desc: 'Drawing competition (3 PM), Radio City 91.1 FM Live RJ interaction (6 PM) & Food Stalls (7 PM).',
    tag: 'CARNIVAL',
    tagColor: '#d97706',
    actionTarget: 'programs',
  },
  {
    id: 'ann-5',
    title: '🪔 Daily Prasad Seva Sponsorships',
    time: '14 Sep – 25 Sep 2026',
    desc: 'Book your flat evening Aarti Prasad slot (Pedha, Modak, Kheer, Dryfruits) on the portal.',
    tag: 'SEVA',
    tagColor: '#0284c7',
    actionTarget: 'prasad',
  },
];

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  streamInfo,
  onWatchLive,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    setEnabling(true);
    const granted = await notificationService.requestPermission();
    setEnabling(false);
    setPermission(notificationService.getPermission());

    if (granted) {
      showToast('🔔 Live Aarti notifications enabled! Test alert sent.', 'success');
    } else {
      showToast('Notifications permission was not granted.', 'info');
    }
  };

  const handleTestChime = () => {
    notificationService.playDevotionalChime();
    notificationService.sendTestNotification();
    showToast('🪔 Temple Bell chime played & test alert sent!', 'info');
  };

  const isLive = streamInfo?.isLive ?? false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
            padding: '20px 22px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BellRing size={20} color="#fde68a" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                Festival Announcements
              </h2>
              <p style={{ fontSize: 11.5, color: '#fed7aa', margin: 0 }}>
                Live Aarti Alerts &amp; Event Updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {/* Notification Permission Card */}
          <div
            style={{
              background: permission === 'granted' ? '#f0fdf4' : '#fff7ed',
              border: `1.5px solid ${permission === 'granted' ? '#bbf7d0' : '#fed7aa'}`,
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{permission === 'granted' ? '🔔' : '🔕'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: permission === 'granted' ? '#166534' : '#9a3412' }}>
                    {permission === 'granted'
                      ? 'Live Aarti Web Alerts Active'
                      : 'Enable Web Notifications'}
                  </div>
                  <div style={{ fontSize: 11, color: permission === 'granted' ? '#15803d' : '#78350f' }}>
                    {permission === 'granted'
                      ? 'You will receive popups when Aarti starts.'
                      : 'Get instant alerts on mobile & desktop when live.'}
                  </div>
                </div>
              </div>

              {permission === 'granted' ? (
                <div
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    borderRadius: 999,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Check size={12} />
                  <span>Enabled</span>
                </div>
              ) : (
                <button
                  onClick={handleEnableNotifications}
                  disabled={enabling}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                  }}
                >
                  {enabling ? 'Enabling...' : 'Allow Alerts'}
                </button>
              )}
            </div>

            {permission === 'granted' && (
              <button
                onClick={handleTestChime}
                style={{
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  borderRadius: 10,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Volume2 size={13} />
                <span>Test Devotional Bell Chime &amp; Notification</span>
              </button>
            )}
          </div>

          {/* Active Live Broadcast Banner (If Live) */}
          {isLive && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                color: '#fff',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (onWatchLive) onWatchLive();
                else if (onNavigate) onNavigate('livestream');
                onClose();
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Radio size={20} className="animate-pulse" />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#fecaca' }}>
                    🔴 BROADCASTING LIVE NOW
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>
                    {streamInfo?.title || 'Shree Ganesh Maha Aarti'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  color: '#dc2626',
                  borderRadius: 10,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                Watch ➔
              </div>
            </div>
          )}

          {/* Announcements List */}
          <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Recent Updates &amp; Timings
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FESTIVAL_ANNOUNCEMENTS.map((ann) => (
              <div
                key={ann.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: ann.actionTarget && onNavigate ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => {
                  if (ann.actionTarget && onNavigate) {
                    onNavigate(ann.actionTarget);
                    onClose();
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        background: `${ann.tagColor}15`,
                        color: ann.tagColor,
                        borderRadius: 6,
                        padding: '1px 6px',
                        fontSize: 9.5,
                        fontWeight: 800,
                      }}
                    >
                      {ann.tag}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      {ann.time}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                    {ann.title}
                  </div>

                  <p style={{ fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {ann.desc}
                  </p>
                </div>

                {ann.actionTarget && onNavigate && (
                  <ChevronRight size={16} color="#94a3b8" style={{ marginTop: 6 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Majestique Euriska Cultural 2026–27
          </span>

          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
