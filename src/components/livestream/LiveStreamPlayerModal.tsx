import React, { useState } from 'react';
import {
  X,
  Eye,
  Sparkles,
  Utensils,
  BookOpen,
  Share2,
  Clock,
  Calendar,
} from 'lucide-react';
import { AARTI_LYRICS } from '../../services/liveStreamService';
import { DailyLiveScheduler } from './DailyLiveScheduler';
import { useToast } from '../../context/ToastContext';
import type { LiveStreamInfo } from '../../types';

interface LiveStreamPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamInfo: LiveStreamInfo | null;
  onOpenPrasadBooking?: () => void;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export const LiveStreamPlayerModal: React.FC<LiveStreamPlayerModalProps> = ({
  isOpen,
  onClose,
  streamInfo,
  onOpenPrasadBooking,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'schedule' | 'info'>('schedule');
  const [selectedAartiIdx, setSelectedAartiIdx] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [reactionsCount, setReactionsCount] = useState<Record<string, number>>({
    '🙏': 128,
    '🪔': 96,
    '🌸': 84,
    '🥥': 62,
  });

  if (!isOpen) return null;

  const videoId = streamInfo?.youtubeVideoId;
  const isLive = streamInfo?.isLive ?? false;

  const triggerReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal offset
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
      text: `🔴 Watch live: ${streamInfo?.title || 'Shree Ganesh Maha Aarti'} on Euriska Cultural Portal!`,
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          maxWidth: 780,
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isLive ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span>LIVE DARSHAN</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#334155',
                  color: '#e2e8f0',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <Clock size={12} />
                <span>OFFLINE REPLAY</span>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                {streamInfo?.title || 'Shree Ganesh Evening Maha Aarti'}
              </h3>
              <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Majestique Euriska Cultural</span>
                {isLive && streamInfo?.viewerCount && (
                  <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                    <Eye size={11} />
                    <span>{streamInfo.viewerCount} Watching</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleShare}
              title="Share Live Stream"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
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
              <Share2 size={16} />
            </button>

            <button
              onClick={onClose}
              title="Close Stream"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
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
        </div>

        {/* Video Player Container */}
        <div
          style={{
            position: 'relative',
            background: '#000',
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: '48vh',
            overflow: 'hidden',
          }}
        >
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Euriska Cultural Live Stream"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
                color: '#fff',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(249, 115, 22, 0.2)',
                  color: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginBottom: 10,
                }}
              >
                🪔
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>
                Next Live Aarti Scheduled: Daily 8:00 PM
              </h4>
              <p style={{ fontSize: 12, color: '#cbd5e1', maxWidth: 420, margin: '0 0 14px' }}>
                Live streaming begins during evening Aarti &amp; cultural stage shows from Majestique Euriska Club House.
              </p>
              {streamInfo?.channelEmail && (
                <div style={{ fontSize: 11, color: '#fed7aa', fontWeight: 600 }}>
                  Official Broadcast: {streamInfo.channelName} ({streamInfo.channelEmail})
                </div>
              )}
            </div>
          )}

          {/* Floating Reactions Rendering Area */}
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
                  bottom: 10,
                  left: `${r.x}%`,
                  fontSize: 28,
                  animation: 'floatUpAndFade 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Announcement Bar */}
        {streamInfo?.pinnedMessage && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              borderBottom: '1px solid #fed7aa',
              padding: '7px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#9a3412',
            }}
          >
            <Sparkles size={14} color="#ea580c" />
            <span style={{ flex: 1 }}>{streamInfo.pinnedMessage}</span>
          </div>
        )}

        {/* Devotional Reactions Bar */}
        <div
          style={{
            padding: '10px 16px',
            background: '#fafafa',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 20,
                  padding: '4px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span>{item.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#334155' }}>
                  {reactionsCount[item.emoji] || 0}
                </span>
              </button>
            ))}
          </div>

          {onOpenPrasadBooking && (
            <button
              onClick={() => {
                onClose();
                onOpenPrasadBooking();
              }}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
              }}
            >
              <Utensils size={13} />
              <span>Book Prasad Seva</span>
            </button>
          )}
        </div>

        {/* Bottom Drawer Tabs: Daily Schedule, Aarti Lyrics & Stream Info */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('schedule')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'schedule' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'schedule' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <Calendar size={14} />
            <span>📅 Daily Schedule (8 AM &amp; 8 PM)</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'lyrics' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'lyrics' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <BookOpen size={14} />
            <span>📖 Aarti Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'info' ? '#ea580c' : '#64748b',
              borderBottom: activeTab === 'info' ? '2.5px solid #ea580c' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={14} />
            <span>Festive Details</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '14px 18px', overflowY: 'auto', maxHeight: 260, flex: 1, background: '#ffffff' }}>
          {activeTab === 'schedule' ? (
            <DailyLiveScheduler compact onWatchLive={() => showToast('Enjoy the live stream!', 'success')} />
          ) : activeTab === 'lyrics' ? (
            <div>
              {/* Aarti Selector Chips */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
                {AARTI_LYRICS.map((aarti, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAartiIdx(idx)}
                    style={{
                      flexShrink: 0,
                      background: selectedAartiIdx === idx ? '#fff7ed' : '#f1f5f9',
                      color: selectedAartiIdx === idx ? '#c2410c' : '#475569',
                      border: `1px solid ${selectedAartiIdx === idx ? '#fed7aa' : '#e2e8f0'}`,
                      borderRadius: 10,
                      padding: '5px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {aarti.title.split('(')[0]}
                  </button>
                ))}
              </div>

              {/* Marathi Lyrics Text */}
              <div
                style={{
                  background: '#fcfbf9',
                  border: '1px solid #f3ede2',
                  borderRadius: 14,
                  padding: '14px',
                  fontSize: 13,
                  lineHeight: 1.8,
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
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {streamInfo?.title}
              </h4>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: '0 0 12px' }}>
                {streamInfo?.description || 'Daily Aarti and cultural festival celebrations live from Majestique Euriska.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, fontSize: 11, color: '#334155' }}>
                  <strong>📍 Location:</strong> Main Mandap, Club House Podium
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, fontSize: 11, color: '#334155' }}>
                  <strong>⏰ Aarti Timings:</strong> Morning 8:00 AM | Evening 8:00 PM
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, fontSize: 11, color: '#334155' }}>
                  <strong>🎥 Broadcast Stream:</strong> Majestique Euriska Cultural
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, fontSize: 11, color: '#334155' }}>
                  <strong>✉️ Contact:</strong> majestiqueeuriskacultural@gmail.com
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(-80px) scale(1.3);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-180px) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
