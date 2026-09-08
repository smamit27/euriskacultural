import React, { useState, useEffect } from 'react';
import {
  Radio,
  Eye,
  Sparkles,
  Utensils,
  BookOpen,
  Share2,
  Settings,
} from 'lucide-react';
import { liveStreamService, AARTI_LYRICS } from '../../services/liveStreamService';
import { AdminLiveStreamModal } from '../livestream/AdminLiveStreamModal';
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

export const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [streamInfo, setStreamInfo] = useState<LiveStreamInfo | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'info'>('lyrics');
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

      {/* Main Video Player Box */}
      <div
        style={{
          background: '#000000',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative',
          marginBottom: 14,
          aspectRatio: '16/9',
          maxHeight: '56vh',
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
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                marginBottom: 12,
              }}
            >
              🪔
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 6px' }}>
              Daily Live Aarti Scheduled: 8:00 PM
            </h2>
            <p style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 480, margin: '0 0 16px', lineHeight: 1.5 }}>
              Live video broadcast will appear here during daily evening Aarti, Ganpati Aagman, and Kalakriti performances.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href={streamInfo?.channelUrl || 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                }}
              >
                <span>▶ Visit YouTube Channel</span>
              </a>

              {isAdmin && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <Radio size={16} />
                  <span>Go Live / Paste Stream URL</span>
                </button>
              )}
            </div>
          </div>
        )}

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
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('lyrics')}
            style={{
              flex: 1,
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
            <span>Festival Details &amp; Venue</span>
          </button>
        </div>

        <div style={{ padding: '18px 20px' }}>
          {activeTab === 'lyrics' ? (
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
                  <strong>⏰ Aarti Timings:</strong> Morning 8:00 AM | Evening 8:00 PM
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>🎥 Official Channel:</strong> Majestique Euriska Cultural
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#334155' }}>
                  <strong>✉️ Email:</strong> majestiqueeuriskacultural@gmail.com
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
