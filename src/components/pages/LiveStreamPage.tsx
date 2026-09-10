import React, { useState, useEffect } from 'react';
import {
  Radio,
  Eye,
  Sparkles,
  Utensils,
  BookOpen,
  Share2,
  Settings,
  Calendar,
  Clock,
  Bell,
} from 'lucide-react';
import { liveStreamService, AARTI_LYRICS } from '../../services/liveStreamService';
import { AdminLiveStreamModal } from '../livestream/AdminLiveStreamModal';
import { LiveVideoCard } from '../livestream/LiveVideoCard';
import { DailyLiveScheduler } from '../livestream/DailyLiveScheduler';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { LiveStreamInfo } from '../../types';

interface LiveStreamPageProps {
  onNavigate?: (section: string) => void;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export const DAILY_FESTIVAL_SCHEDULE = [
  {
    day: 1,
    date: '14 Sep 2026',
    dayName: 'Monday',
    title: 'Ganesh Sthapana & Aagman Miravnuk',
    morningAarti: '8:00 AM (Prathakal Sthapana)',
    eveningAarti: '8:00 PM (Maha Aarti & Prasad)',
    specialEvent: '🚩 5:00 PM: Grand Aagman Miravnuk with Dhol Tasha Pathak',
    badge: '🚩 STHAPANA & AAGMAN',
    badgeColor: '#ea580c',
  },
  {
    day: 2,
    date: '15 Sep 2026',
    dayName: 'Tuesday',
    title: 'Daily Darshan & Devotional Bhajans',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🪔 7:30 PM: Community Devotional Bhajans',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 3,
    date: '16 Sep 2026',
    dayName: 'Wednesday',
    title: 'Daily Pooja & Devotee Prasad Seva',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🌸 8:30 PM: Prasad Distribution',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 4,
    date: '17 Sep 2026',
    dayName: 'Thursday',
    title: 'Evening Aarti & Cultural Rehearsals',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🎭 6:30 PM: Kalakriti Stage Rehearsals at Podium',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 5,
    date: '18 Sep 2026',
    dayName: 'Friday',
    title: 'Daily Evening Aarti & Festive Gathering',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🪔 8:45 PM: Evening Prasad Seva by Residents',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 6,
    date: '19 Sep 2026',
    dayName: 'Saturday',
    title: 'Society Carnival, Radio City 91.1 FM & Food Stalls',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🎪 3 PM: Kids Drawing | 6 PM: Radio City 91.1 FM RJ Live | 7 PM: Food Stalls',
    badge: '🎪 CARNIVAL & FOOD STALLS',
    badgeColor: '#d97706',
  },
  {
    day: 7,
    date: '20 Sep 2026',
    dayName: 'Sunday',
    title: 'Kalakriti 2026: Grand Cultural Talent Show',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🎭 6:00 PM: Stage Performances (Dance, Music, Skit) & Awards',
    badge: '🎭 KALAKRITI STAGE SHOW',
    badgeColor: '#7c3aed',
  },
  {
    day: 8,
    date: '21 Sep 2026',
    dayName: 'Monday',
    title: 'Daily Darshan & Bhajan Sandhya',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🪔 8:30 PM: Devotee Prasad Seva',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 9,
    date: '22 Sep 2026',
    dayName: 'Tuesday',
    title: 'Daily Evening Aarti & Floral Decor',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🌸 8:45 PM: Evening Prasad Distribution',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 10,
    date: '23 Sep 2026',
    dayName: 'Wednesday',
    title: 'Daily Darshan & Satyanarayan Prep',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Evening Maha Aarti)',
    specialEvent: '🪔 8:30 PM: Mahaprasad Token & Preparation Briefing',
    badge: 'DAILY AARTI',
    badgeColor: '#0284c7',
  },
  {
    day: 11,
    date: '24 Sep 2026',
    dayName: 'Thursday',
    title: 'Shri Satyanarayan Katha & Grand Mahaprasad Feast',
    morningAarti: '8:00 AM (Morning Pooja)',
    eveningAarti: '8:00 PM (Maha Aarti)',
    specialEvent: '🍲 4:00 PM: Satyanarayan Pooja | 8:00 PM – 10:00 PM: Mahaprasad Community Dinner',
    badge: '🍲 MAHAPRASAD DINNER',
    badgeColor: '#dc2626',
  },
  {
    day: 12,
    date: '25 Sep 2026',
    dayName: 'Friday',
    title: 'Anant Chaturdashi Ganesh Visarjan Miravnuk',
    morningAarti: '8:00 AM (Uttarpujan & Morning Aarti)',
    eveningAarti: '4:00 PM (Final Visarjan Maha Aarti)',
    specialEvent: '🌊 4:00 PM: Farewell Miravnuk, Dhol Tasha & Eco-Friendly Immersion',
    badge: '🌊 GANESH VISARJAN',
    badgeColor: '#ea580c',
  },
];

export const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [streamInfo, setStreamInfo] = useState<LiveStreamInfo | null>(null);
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'lyrics' | 'info'>('schedule');
  const [selectedAartiIdx, setSelectedAartiIdx] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [reactionsCount, setReactionsCount] = useState<Record<string, number>>({
    '🙏': 142,
    '🪔': 118,
    '🌸': 94,
    '🥥': 76,
  });

  useEffect(() => {
    const unsub = liveStreamService.subscribeLiveStream((info) => {
      setStreamInfo(info);
    });
    return () => unsub();
  }, []);

  const videoId = streamInfo?.youtubeVideoId;
  const isLive = streamInfo?.isLive ?? false;
  const currentVideoId = activePlayingVideoId || (isLive ? videoId : null);

  const triggerReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setReactions((prev) => [...prev, { id, emoji, x }]);

    setReactionsCount((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  };

  const handleShare = async () => {
    const shareData = {
      title: streamInfo?.title || 'Euriska Cultural Live Stream',
      text: `🔴 Watch live: ${streamInfo?.title || 'Shree Ganesh Maha Aarti'} on Majestique Euriska Cultural Portal!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Live stream link copied to clipboard!', 'success');
    }
  };

  return (
    <div style={{ padding: '0 14px 40px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #431407 100%)',
          borderRadius: 20,
          padding: '20px',
          color: '#fff',
          marginBottom: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: isLive ? '#ef4444' : 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: isLive ? '0 0 18px rgba(239, 68, 68, 0.8)' : 'none',
              }}
            >
              <Radio size={24} className={isLive ? 'animate-pulse' : ''} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                {isLive ? (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: 12,
                      letterSpacing: 0.5,
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                    }}
                  >
                    🔴 ON AIR LIVE
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#334155',
                      color: '#e2e8f0',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}
                  >
                    OFFLINE REPLAY
                  </span>
                )}

                {isLive && streamInfo?.viewerCount && (
                  <span style={{ fontSize: 11, color: '#86efac', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={12} />
                    <span>{streamInfo.viewerCount} Devotees Watching</span>
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {streamInfo?.title || 'Shree Ganesh Evening Maha Aarti'}
              </h1>
              <p style={{ fontSize: 12, color: '#fed7aa', margin: '2px 0 0', fontWeight: 500 }}>
                Channel: <strong>Majestique Euriska Cultural</strong> (majestiqueeuriskacultural@gmail.com)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleShare}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                borderRadius: 12,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAdminModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
                }}
              >
                <Settings size={14} />
                <span>Broadcast Controls</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Live Broadcast Section: LiveVideoCard or Active Video Stream */}
      <div style={{ marginBottom: 16 }}>
        {currentVideoId ? (
          <div
            style={{
              background: '#000000',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
              position: 'relative',
              border: '1.5px solid #fed7aa',
            }}
          >
            {/* Top Control Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  🔴 PLAYING LIVE BROADCAST
                </span>
                <span style={{ color: '#fed7aa', fontSize: 11.5 }}>
                  {streamInfo?.title || 'Euriska Cultural Live Darshan'}
                </span>
              </div>
              <button
                onClick={() => setActivePlayingVideoId(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                ✕ Switch to Card
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '56vh' }}>
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="Euriska Cultural Live Stream"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Floating Devotional Reactions Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }}
              >
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: `${r.x}%`,
                      fontSize: 30,
                      animation: 'floatUpAndFade 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                    }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <LiveVideoCard
            streamInfo={streamInfo}
            onWatchLive={(vid) => {
              setActivePlayingVideoId(vid || streamInfo?.youtubeVideoId || 'oU9IsBtGAJ4');
            }}
            onOpenAdminBroadcast={() => setShowAdminModal(true)}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Pinned Announcement */}
      {streamInfo?.pinnedMessage && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: '1px solid #fed7aa',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#9a3412',
            marginBottom: 14,
          }}
        >
          <Sparkles size={16} color="#ea580c" />
          <span style={{ flex: 1 }}>{streamInfo.pinnedMessage}</span>
        </div>
      )}

      {/* Devotional Reactions Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>
            OFFER DEVOTION:
          </span>
          {[
            { emoji: '🙏', label: 'Pranam' },
            { emoji: '🪔', label: 'Diya' },
            { emoji: '🌸', label: 'Pushpa' },
            { emoji: '🥥', label: 'Modak' },
          ].map((item) => (
            <button
              key={item.emoji}
              onClick={() => triggerReaction(item.emoji)}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 20,
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>{item.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
                {reactionsCount[item.emoji] || 0}
              </span>
            </button>
          ))}
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('prasad')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Utensils size={14} />
            <span>Book Evening Prasad Slot</span>
          </button>
        )}
      </div>

      {/* Tabs: Aarti Lyrics & Stream Details */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('schedule')}
            style={{
              flex: 1,
              minWidth: 150,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 800,
              color: activeTab === 'schedule' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'schedule' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Calendar size={15} />
            <span>📅 Daily Aarti Schedule (14-25 Sep)</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 800,
              color: activeTab === 'lyrics' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'lyrics' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <BookOpen size={15} />
            <span>📖 Live Aarti Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 800,
              color: activeTab === 'info' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'info' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={15} />
            <span>✨ Venue Details</span>
          </button>
        </div>

        <div style={{ padding: '18px 20px' }}>
          {activeTab === 'schedule' ? (
            <div>
              {/* Daily 8 AM & 8 PM Interactive Scheduler with 1-Click Launch */}
              <div style={{ marginBottom: 20 }}>
                <DailyLiveScheduler
                  onWatchLive={(vid) => {
                    setActivePlayingVideoId(vid || 'oU9IsBtGAJ4');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                    🐘 Ganeshotsav 2026 — Daily Aarti &amp; Festival Calendar
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Everyday: <strong>Morning Aarti @ 8:00 AM</strong> &amp; <strong>Evening Maha Aarti @ 8:00 PM</strong> at Main Mandap
                  </p>
                </div>

                <a
                  href={streamInfo?.channelUrl || 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Bell size={13} />
                  <span>Subscribe on YouTube</span>
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DAILY_FESTIVAL_SCHEDULE.map((item) => (
                  <div
                    key={item.day}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 16,
                      padding: '14px 16px',
                      background: item.day === 1 ? '#fff7ed' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'box-shadow 0.2s ease',
                      boxShadow: item.day === 1 ? '0 2px 10px rgba(234, 88, 12, 0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: item.badgeColor,
                            color: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: 13,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          }}
                        >
                          <span style={{ fontSize: 9, opacity: 0.85 }}>DAY</span>
                          <span>{item.day}</span>
                        </div>

                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                            📅 {item.date} ({item.dayName})
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: `${item.badgeColor}15`,
                          color: item.badgeColor,
                          border: `1px solid ${item.badgeColor}35`,
                          borderRadius: 999,
                          padding: '3px 10px',
                          fontSize: 10.5,
                          fontWeight: 800,
                          letterSpacing: 0.5,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Schedule Timings Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Clock size={14} color="#0284c7" />
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>Morning: </span>
                          <span>{item.morningAarti}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Clock size={14} color="#ea580c" />
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>Evening: </span>
                          <span>{item.eveningAarti}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Event highlight */}
                    {item.specialEvent && (
                      <div
                        style={{
                          background: 'rgba(249, 115, 22, 0.08)',
                          borderLeft: '3px solid #ea580c',
                          padding: '6px 10px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#9a3412',
                        }}
                      >
                        {item.specialEvent}
                      </div>
                    )}

                    {/* Actions row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('prasad')}
                          style={{
                            background: 'transparent',
                            border: '1px solid #fed7aa',
                            color: '#ea580c',
                            borderRadius: 8,
                            padding: '5px 10px',
                            fontSize: 11.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Utensils size={12} />
                          <span>Book Prasad Slot</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => setShowAdminModal(true)}
                          style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '5px 12px',
                            fontSize: 11.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Radio size={12} />
                          <span>Broadcast Live</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'lyrics' ? (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                {AARTI_LYRICS.map((aarti, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAartiIdx(idx)}
                    style={{
                      flexShrink: 0,
                      background: selectedAartiIdx === idx ? '#fff7ed' : '#f1f5f9',
                      color: selectedAartiIdx === idx ? '#c2410c' : '#475569',
                      border: `1.5px solid ${selectedAartiIdx === idx ? '#fed7aa' : '#e2e8f0'}`,
                      borderRadius: 12,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {aarti.title.split('(')[0]}
                  </button>
                ))}
              </div>

              <div
                style={{
                  background: '#fcfbf9',
                  border: '1px solid #f3ede2',
                  borderRadius: 16,
                  padding: '20px',
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: '#1e293b',
                  whiteSpace: 'pre-line',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {AARTI_LYRICS[selectedAartiIdx].marathi}
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                {streamInfo?.title || 'Shree Ganesh Evening Maha Aarti'}
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                {streamInfo?.description || 'Daily Aarti and cultural festival celebrations live from Majestique Euriska.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>📍 Location:</strong> Main Mandap, Club House Podium
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>⏰ Daily Aarti Timings:</strong> Morning 8:00 AM | Evening 8:00 PM
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>🎥 Official YouTube:</strong> Majestique Euriska Cultural
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>✉️ Contact Email:</strong> majestiqueeuriskacultural@gmail.com
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      <AdminLiveStreamModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onStreamUpdated={(updated) => setStreamInfo(updated)}
      />

      <style>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(-90px) scale(1.3);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-200px) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
