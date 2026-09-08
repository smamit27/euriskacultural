import React from 'react';
import { Radio, Play, Eye, Settings, Tv } from 'lucide-react';
import type { LiveStreamInfo } from '../../types';

interface LiveStreamBannerProps {
  streamInfo: LiveStreamInfo | null;
  onWatchLive: () => void;
  onOpenAdminBroadcast?: () => void;
  isAdmin?: boolean;
}

export const LiveStreamBanner: React.FC<LiveStreamBannerProps> = ({
  streamInfo,
  onWatchLive,
  onOpenAdminBroadcast,
  isAdmin = false,
}) => {
  const isLive = streamInfo?.isLive ?? false;

  if (isLive) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #450a0a 100%)',
          borderRadius: 20,
          border: '1.5px solid #ef4444',
          padding: '16px 18px',
          marginBottom: 20,
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glowing live ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
                flexShrink: 0,
              }}
            >
              <Radio size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  🔴 LIVE NOW
                </span>
                {streamInfo?.viewerCount && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#86efac',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Eye size={12} />
                    <span>{streamInfo.viewerCount} Devotees Watching</span>
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', margin: '0 0 2px' }}>
                {streamInfo?.title || 'Shree Ganesh Evening Maha Aarti'}
              </h3>
              <p style={{ fontSize: 12, color: '#fed7aa', margin: 0, fontWeight: 500 }}>
                {streamInfo?.channelName || 'Majestique Euriska Cultural'} • Live Darshan
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && onOpenAdminBroadcast && (
              <button
                type="button"
                onClick={onOpenAdminBroadcast}
                title="Manage Stream"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Settings size={14} />
                <span>Control</span>
              </button>
            )}

            <button
              type="button"
              onClick={onWatchLive}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
              }}
            >
              <Play size={15} fill="#fff" />
              <span>Watch Live Stream</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not currently live: Sleek Live Stream Banner with Next Schedule
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
        borderRadius: 20,
        border: '1px solid #fed7aa',
        padding: '16px 18px',
        marginBottom: 20,
        boxShadow: '0 2px 12px rgba(249, 115, 22, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fed7aa',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🪔
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 8px',
                  borderRadius: 8,
                }}
              >
                DAILY LIVE AARTI
              </span>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                Morning 8:00 AM • Evening 8:00 PM
              </span>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 2px' }}>
              Majestique Euriska Live Darshan &amp; Broadcast
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
              Official channel: <strong>Majestique Euriska Cultural</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdmin && onOpenAdminBroadcast && (
            <button
              type="button"
              onClick={onOpenAdminBroadcast}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                borderRadius: 12,
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Radio size={14} color="#ea580c" />
              <span>Broadcast Live</span>
            </button>
          )}

          <button
            type="button"
            onClick={onWatchLive}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '9px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Tv size={14} />
            <span>Open Live Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
