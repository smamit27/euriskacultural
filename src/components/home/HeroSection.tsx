import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight, Timer } from 'lucide-react';
import type { CulturalEvent } from '../../types';
import { getNextEvent, daysUntil } from '../../services/eventsData';

interface HeroSectionProps {
  onViewPrograms: () => void;
  onViewPerformances: () => void;
  onViewEvents: () => void;
}

// Per-event static config: background image, subtitle, date label, venue snippet
const EVENT_HERO_CONFIG: Record<string, {
  bg: string;
  subtitle: string;
  dateLabel: string;
  venue: string;
  tag: string;
}> = {
  'evt-ganesh-2026': {
    bg: 'url(https://images.unsplash.com/photo-1567591370554-b0d49a22ca3d?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Ganpati Bappa Morya! Join the community for 12 days of devotion, aarti, modak & grand immersion.',
    dateLabel: '14 Sep – 25 Sep 2026 • 6:00 PM Onwards',
    venue: 'Club house, Pune',
    tag: 'GANESH CHATURTHI 2026',
  },
  'evt-navratri-2026': {
    bg: 'url(https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Nine nights of Garba, Dandiya & devotion culminating in Dussehra. Dress up & celebrate Maa Durga together!',
    dateLabel: '11 Oct – 20 Oct 2026 • 7:00 PM Onwards',
    venue: 'Main Podium & Clubhouse Lawn, Pune',
    tag: 'SHARAD NAVRATRI 2026',
  },
  'evt-diwali-2026': {
    bg: 'url(https://images.unsplash.com/photo-1604591719594-54c3b507a4af?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Festival of Lights — illuminate our society with diyas, fireworks & a grand community feast.',
    dateLabel: '08 Nov 2026 • 6:00 PM Onwards',
    venue: 'Main Podium & All Buildings, Pune',
    tag: 'DIWALI 2026',
  },
  'evt-christmas-2026': {
    bg: 'url(https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Spread love, joy & peace. Join the carols, secret Santa & community dinner!',
    dateLabel: '25 Dec 2026 • 6:00 PM Onwards',
    venue: 'Clubhouse & Garden, Pune',
    tag: 'CHRISTMAS 2026',
  },
  'evt-eid-2027': {
    bg: 'url(https://images.unsplash.com/photo-1565374392096-69e7c3b8985d?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Eid Mubarak! Share sevaiyaan, greet neighbors & celebrate gratitude & togetherness.',
    dateLabel: '10 Mar 2027 • 10:00 AM Onwards',
    venue: 'Community Hall, Pune',
    tag: 'EID AL-FITR 2027',
  },
  'evt-holi-2027': {
    bg: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80)',
    subtitle: 'Holika Dahan & Dhulivandan! Play with organic colors & strengthen community bonds.',
    dateLabel: '21 Mar – 22 Mar 2027 • Holika Dahan & Colors',
    venue: 'Society Open Ground, Pune',
    tag: 'HOLI 2027',
  },
};

const DEFAULT_HERO = {
  bg: 'url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80)',
  subtitle: 'Celebrate Together — Dance, Music, Drama & Grand Community Feast!',
  dateLabel: '14 Sep – 25 Sep 2026 • 6:00 PM Onwards',
  venue: 'Main Stage & Clubhouse Lawn, Pune',
  tag: 'FESTIVAL OF JOY & TRADITION',
};

function CountdownRing({ days, accentColor }: { days: number; accentColor: string }) {
  const [count, setCount] = useState(days);
  useEffect(() => { setCount(days); }, [days]);

  if (count <= 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(8px)',
      borderRadius: 12, padding: '8px 14px',
      border: `1px solid ${accentColor}60`,
    }}>
      <Timer size={14} color={accentColor} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
          DAYS
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
        to go!
      </div>
    </div>
  );
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onViewPrograms,
  onViewPerformances,
  onViewEvents,
}) => {
  const nextEvent: CulturalEvent | null = getNextEvent();
  const cfg = nextEvent ? (EVENT_HERO_CONFIG[nextEvent.id] ?? DEFAULT_HERO) : DEFAULT_HERO;
  const days = nextEvent ? daysUntil(nextEvent.date) : 0;
  const isOngoing = nextEvent?.status === 'ONGOING';

  // Overlay gradient: use the event's accent color tinted dark
  const overlayGradient = nextEvent
    ? `linear-gradient(160deg, ${nextEvent.accentColor}dd 0%, rgba(0,0,0,0.72) 60%, rgba(0,0,0,0.88) 100%)`
    : 'linear-gradient(160deg, rgba(194,65,12,0.85) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.88) 100%)';

  return (
    <div className="hero-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background photo */}
      <div
        className="hero-bg-overlay"
        style={{ backgroundImage: cfg.bg }}
      />
      {/* Festival-colored gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: overlayGradient,
        zIndex: 1,
      }} />

      <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
        {/* Tag row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="hero-tag" style={{ margin: 0 }}>
            <Sparkles size={13} color="#fed7aa" />
            <span>{cfg.tag}</span>
          </div>
          {/* Ganesh image avatar if available */}
          {nextEvent?.imageUrl && (
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${nextEvent.accentColor}`,
              boxShadow: `0 0 16px ${nextEvent.accentColor}80`,
            }}>
              <img src={nextEvent.imageUrl} alt={nextEvent.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="hero-title" style={{ marginBottom: 2 }}>
          {nextEvent ? nextEvent.name.toUpperCase() : 'EURISKA'}
        </h1>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fed7aa', letterSpacing: 0.5, marginBottom: 8 }}>
          Euriska {nextEvent ? nextEvent.monthFull : 'Cultural & Festive 2026–27'}
        </div>

        <p className="hero-subtitle" style={{ marginBottom: 10 }}>
          {cfg.subtitle}
        </p>

        {/* Info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, fontSize: 12, color: '#e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#f97316" />
            <span>{cfg.dateLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#f97316" />
            <span>{cfg.venue}</span>
          </div>
        </div>

        {/* Bottom row: buttons + countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={isOngoing ? onViewPrograms : onViewEvents}
            className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
            <span>{isOngoing ? 'Live Schedule' : 'Explore Event'}</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={onViewPerformances}
            className="btn btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', fontSize: 13 }}
          >
            Artists
          </button>
          {!isOngoing && days > 0 && (
            <CountdownRing days={days} accentColor={nextEvent?.accentColor ?? '#f97316'} />
          )}
          {isOngoing && (
            <div style={{
              background: '#dc2626', color: '#fff',
              borderRadius: 10, padding: '6px 12px',
              fontSize: 11, fontWeight: 900, letterSpacing: 0.5,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>🔴 LIVE</div>
          )}
        </div>
      </div>
    </div>
  );
};
