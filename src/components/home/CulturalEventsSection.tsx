import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CULTURAL_EVENTS, daysUntil } from '../../services/eventsData';
import type { CulturalEvent } from '../../types';

interface CulturalEventsSectionProps {
  onViewAll: () => void;
}

function CountdownBadge({ event }: { event: CulturalEvent }) {
  if (event.status === 'COMPLETED') {
    return (
      <span style={{
        fontSize: 10, fontWeight: 800, color: '#94a3b8',
        background: '#f1f5f9', borderRadius: 6, padding: '2px 7px',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>Done</span>
    );
  }
  if (event.status === 'ONGOING') {
    return (
      <span style={{
        fontSize: 10, fontWeight: 900, color: '#fff',
        background: 'linear-gradient(90deg,#16a34a,#15803d)',
        borderRadius: 6, padding: '2px 8px',
        textTransform: 'uppercase', letterSpacing: 0.5,
        animation: 'pulse 1.8s ease-in-out infinite',
      }}>🔴 LIVE</span>
    );
  }
  const days = daysUntil(event.date);
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: event.accentColor,
      background: '#fff', border: `1px solid ${event.accentColor}40`,
      borderRadius: 6, padding: '2px 7px',
    }}>
      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days}d away`}
    </span>
  );
}

export const CulturalEventsSection: React.FC<CulturalEventsSectionProps> = ({ onViewAll }) => {
  return (
    <div style={{ margin: '0 0 20px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
            🎉 Festive Calendar 2026–27
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 1 }}>
            Celebrating togetherness all year
          </div>
        </div>
        <button
          onClick={onViewAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 800, color: '#f97316',
            padding: '4px 0',
          }}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scroll Cards */}
      <div
        className="horizontal-scroll-container"
        style={{ padding: '4px 14px 12px', gap: 12 }}
      >
        {CULTURAL_EVENTS.map((event) => (
          <div
            key={event.id}
            onClick={onViewAll}
            style={{
              flex: '0 0 148px',
              background: event.cardBg,
              borderRadius: 18,
              padding: '14px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: `0 2px 12px ${event.accentColor}20`,
              border: `1px solid ${event.accentColor}25`,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Month badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: event.gradient,
              color: '#fff',
              borderRadius: 8, padding: '3px 10px',
              fontSize: 10, fontWeight: 900,
              letterSpacing: 1, textTransform: 'uppercase',
              width: 'fit-content',
            }}>
              {event.month}
            </div>

            {/* Image or Emoji */}
            {event.imageUrl ? (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${event.accentColor}40`,
                boxShadow: `0 4px 14px ${event.accentColor}35`,
                flexShrink: 0,
              }}>
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: 32, lineHeight: 1 }}>{event.emoji}</div>
            )}

            {/* Name */}
            <div style={{
              fontSize: 13, fontWeight: 900, color: event.accentColor,
              lineHeight: 1.2,
            }}>
              {event.name}
            </div>

            {/* Tagline */}
            <div style={{
              fontSize: 10.5, color: '#475569', fontWeight: 500,
              lineHeight: 1.4, flex: 1,
            }}>
              {event.tagline}
            </div>

            {/* Countdown */}
            <CountdownBadge event={event} />

            {/* Decorative corner circle */}
            <div style={{
              position: 'absolute', top: -14, right: -14,
              width: 60, height: 60,
              background: event.accentColor,
              opacity: 0.07,
              borderRadius: '50%',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};
