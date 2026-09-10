import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock, MapPin, Share2, Bell, ExternalLink, Settings, Eye, Tv } from 'lucide-react';
import type { LiveStreamInfo } from '../../types';
import { liveScheduleService, OFFICIAL_YOUTUBE_LIVE_URL } from '../../services/liveScheduleService';
import { useToast } from '../../context/ToastContext';

interface LiveVideoCardProps {
  streamInfo?: LiveStreamInfo | null;
  onWatchLive?: (videoId?: string) => void;
  onOpenAdminBroadcast?: () => void;
  isAdmin?: boolean;
}

export const LiveVideoCard: React.FC<LiveVideoCardProps> = ({
  streamInfo,
  onWatchLive,
  onOpenAdminBroadcast,
  isAdmin = false,
}) => {
  const { showToast } = useToast();
  const [nextSlotInfo, setNextSlotInfo] = useState<ReturnType<typeof liveScheduleService.getCurrentOrNextSlot> | null>(null);

  useEffect(() => {
    const update = () => {
      setNextSlotInfo(liveScheduleService.getCurrentOrNextSlot());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLive = (streamInfo?.isLive ?? false) || (nextSlotInfo?.isLiveNow ?? false);
  const activeSlot = nextSlotInfo?.slot;
  const activeVideoId = streamInfo?.youtubeVideoId || activeSlot?.youtubeVideoId;
  const activeTitle = streamInfo?.title || activeSlot?.title || 'Majestique Euriska Ganeshotsav 2026 Live';
  const youtubeUrl = activeVideoId ? `https://www.youtube.com/watch?v=${activeVideoId}` : OFFICIAL_YOUTUBE_LIVE_URL;

  const handleShare = () => {
    const shareText = `🪔 Join Majestique Euriska Cultural's Live Ganeshotsav Darshan & Aarti!\n🔴 Watch Live: ${youtubeUrl}`;
    if (navigator.share) {
      navigator.share({ title: activeTitle, text: shareText, url: youtubeUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('Live stream link copied to clipboard!', 'success');
    }
  };

  const handlePlayClick = () => {
    if (onWatchLive) {
      onWatchLive(activeVideoId);
    } else {
      window.open(youtubeUrl, '_blank');
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 24,
        border: isLive ? '2px solid #ef4444' : '1.5px solid #fed7aa',
        boxShadow: isLive
          ? '0 12px 36px rgba(239, 68, 68, 0.28)'
          : '0 8px 30px rgba(249, 115, 22, 0.12)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 16:9 Thumbnail Visual Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '52%', // 16:9 approximate ratio
          background: '#0f172a',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handlePlayClick}
      >
        {/* Background Thumbnail Image */}
        <img
          src="/youtube_thumbnail.jpg"
          alt="Euriska Cultural Ganeshotsav 2026 Live"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Gradient Overlay for Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isLive
              ? 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.1) 40%, rgba(15,23,42,0.85) 100%)'
              : 'linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.15) 45%, rgba(15,23,42,0.88) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges Bar */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
            gap: 8,
          }}
        >
          {/* Status Badge */}
          {isLive ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ef4444',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 0.6,
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ffffff',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              <span>🔴 LIVE BROADCAST</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#fed7aa',
                border: '1px solid rgba(254, 215, 170, 0.4)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              <Clock size={12} color="#f97316" />
              <span>
                {nextSlotInfo
                  ? `Starts in ${liveScheduleService.formatCountdown(nextSlotInfo.timeRemainingMs)}`
                  : 'Upcoming Live Broadcast'}
              </span>
            </div>
          )}

          {/* Devotee Count / Channel Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isLive && streamInfo?.viewerCount ? (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#4ade80',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
              >
                <Eye size={12} />
                <span>{streamInfo.viewerCount} Watching</span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.4,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                14 - 25 SEP 2026
              </div>
            )}
          </div>
        </div>

        {/* Center Glowing Play Button Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: isLive
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isLive
                ? '0 0 28px rgba(239, 68, 68, 0.85)'
                : '0 0 24px rgba(234, 88, 12, 0.7)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Play size={28} fill="#ffffff" style={{ marginLeft: 3 }} />
          </div>
          <span
            style={{
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 1,
              textShadow: '0 2px 6px rgba(0,0,0,0.8)',
            }}
          >
            {isLive ? 'Watch Live Now' : 'Click to Join Broadcast'}
          </span>
        </div>

        {/* Bottom Thumbnail Overlay Info */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            right: 16,
            zIndex: 2,
            color: '#ffffff',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', marginBottom: 2 }}>
            {nextSlotInfo ? `📍 ${nextSlotInfo.festivalDayName}` : 'Majestique Euriska Cultural'}
          </div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 900,
              margin: 0,
              color: '#ffffff',
              lineHeight: 1.25,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {activeTitle}
          </h3>
        </div>
      </div>

      {/* Card Content & Action Bar */}
      <div style={{ padding: '16px 18px', background: '#ffffff' }}>
        {/* Timing & Venue Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
            fontSize: 12,
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#ea580c" />
            <span style={{ fontWeight: 800, color: '#0f172a' }}>
              {nextSlotInfo?.dayLabel || '14 Sep - 25 Sep 2026'}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#ea580c' }}>
              {activeSlot?.timeDisplay || '8:00 AM & 8:00 PM Daily'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
            <MapPin size={13} color="#94a3b8" />
            <span>Club House Mandap, Pune</span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Main Watch Button */}
          <button
            type="button"
            onClick={handlePlayClick}
            style={{
              flex: 2,
              minWidth: 150,
              background: isLive
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isLive
                ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                : '0 4px 14px rgba(234, 88, 12, 0.3)',
              transition: 'transform 0.15s ease',
            }}
          >
            {isLive ? (
              <>
                <Play size={16} fill="#ffffff" />
                <span>🔴 Watch Live Now</span>
              </>
            ) : (
              <>
                <Tv size={16} />
                <span>▶️ Join Live Portal</span>
              </>
            )}
          </button>

          {/* Direct YouTube Stream Link Button */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Stream on YouTube"
            style={{
              flex: 1,
              minWidth: 130,
              background: '#fee2e2',
              color: '#dc2626',
              border: '1.5px solid #fca5a5',
              borderRadius: 14,
              padding: '11px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <ExternalLink size={14} />
            <span>YouTube ↗</span>
          </a>

          {/* Google Calendar Reminder Button (for upcoming) */}
          {nextSlotInfo && !isLive && (
            <a
              href={liveScheduleService.generateGoogleCalendarUrl(
                nextSlotInfo.slot,
                nextSlotInfo.startTime
              )}
              target="_blank"
              rel="noopener noreferrer"
              title="Add to Google Calendar"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#475569',
                borderRadius: 14,
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <Bell size={16} />
            </a>
          )}

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            title="Share Live Stream"
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#475569',
              borderRadius: 14,
              padding: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Share2 size={16} />
          </button>

          {/* Admin Control Button */}
          {isAdmin && onOpenAdminBroadcast && (
            <button
              type="button"
              onClick={onOpenAdminBroadcast}
              title="Admin Broadcast Settings"
              style={{
                background: '#f1f5f9',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: 14,
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
