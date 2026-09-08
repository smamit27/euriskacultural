import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Clock, MapPin, Bell } from 'lucide-react';

interface EventScheduleCarouselProps {
  onViewAllPrograms: () => void;
}

interface ScheduleSlide {
  id: string;
  tag: string;
  dateBadge: {
    month: string;
    day: string;
    dayName: string;
  };
  title: string;
  subtitle: string;
  time: string;
  stage: string;
  bgImage: string;
  gradientOverlay: string;
  accentColor: string;
  textColor: string;
  badgeBg: string;
  highlights: {
    icon: string;
    label: string;
    time?: string;
  }[];
  aartiNotice?: string;
}

const SCHEDULE_SLIDES: ScheduleSlide[] = [
  {
    id: 'slide-aagman',
    tag: '|| ॐ श्री गणेशाय नमः || • DAY 1',
    dateBadge: {
      month: 'SEP',
      day: '14',
      dayName: 'MON',
    },
    title: 'Shri Ganesh Aagman',
    subtitle: 'Grand welcome procession with traditional Dhol Tasha beats, Sthapana ceremony & welcome aarti.',
    time: '5:00 PM onwards',
    stage: 'Main Entrance & Club House',
    bgImage: '/ganesh_bhagwan.jpg',
    gradientOverlay: 'linear-gradient(135deg, rgba(124, 45, 18, 0.88) 0%, rgba(194, 65, 12, 0.84) 50%, rgba(234, 88, 12, 0.82) 100%)',
    accentColor: '#fde047',
    textColor: '#ffffff',
    badgeBg: 'rgba(254, 240, 138, 0.25)',
    highlights: [
      { icon: '🚩', label: 'Grand Aagman Procession', time: '5:00 PM' },
      { icon: '🥁', label: 'Euriska Dhol Tasha Pathak' },
      { icon: '🪔', label: 'Evening Welcome Aarti', time: '8:00 PM' },
    ],
    aartiNotice: 'Daily Aarti: Morning 9:00 AM • Evening 8:00 PM',
  },
  {
    id: 'slide-carnival',
    tag: 'FESTIVE CARNIVAL • DAY 6',
    dateBadge: {
      month: 'SEP',
      day: '19',
      dayName: 'SAT',
    },
    title: 'Festive Carnival & Food Stalls',
    subtitle: 'Exciting kids drawing competition, live Radio City 91.1 FM entertainment & delicious food stalls.',
    time: '3:00 PM onwards',
    stage: 'Amphitheatre, Main Stage & Food Lawn',
    bgImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    gradientOverlay: 'linear-gradient(135deg, rgba(6, 95, 70, 0.88) 0%, rgba(13, 148, 136, 0.84) 50%, rgba(2, 132, 199, 0.82) 100%)',
    accentColor: '#a7f3d0',
    textColor: '#ffffff',
    badgeBg: 'rgba(167, 243, 208, 0.25)',
    highlights: [
      { icon: '🎨', label: 'Drawing Competition', time: '3:00 – 5:00 PM' },
      { icon: '🎙️', label: 'City cha Bappa with Radio City 91.1 FM', time: '6:00 PM onwards' },
      { icon: '🍿', label: 'Festive Food Stalls & Chaats', time: '7:00 PM onwards' },
    ],
    aartiNotice: 'Evening Aarti at 8:00 PM • Modak Prasad Distribution',
  },
  {
    id: 'slide-kalakriti',
    tag: 'YOUR TALENT OUR STAGE! • DAY 7',
    dateBadge: {
      month: 'SEP',
      day: '20',
      dayName: 'SUN',
    },
    title: 'Kalakriti – Talent Show',
    subtitle: 'High-energy cultural stage show featuring dance, music, classical Lavani, singing and community drama.',
    time: '6:00 PM onwards',
    stage: 'Grand Main Stage Podium',
    bgImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    gradientOverlay: 'linear-gradient(135deg, rgba(76, 29, 149, 0.9) 0%, rgba(124, 58, 237, 0.84) 50%, rgba(219, 39, 119, 0.82) 100%)',
    accentColor: '#fbcfe8',
    textColor: '#ffffff',
    badgeBg: 'rgba(251, 207, 232, 0.25)',
    highlights: [
      { icon: '💃', label: 'Classical & Bollywood Dance', time: '6:00 PM' },
      { icon: '🎵', label: 'Solo & Duet Singing Acts' },
      { icon: '🎭', label: 'Drama, Skits & Comedy Showcase' },
    ],
    aartiNotice: 'Evening Aarti at 8:00 PM with Special Modak Bhog',
  },
  {
    id: 'slide-satyanarayan-mahaprasad',
    tag: 'SACRED FEAST & POOJA • DAY 11',
    dateBadge: {
      month: 'SEP',
      day: '24',
      dayName: 'THU',
    },
    title: 'Shri Satyanarayan Katha & Mahaprasad',
    subtitle: 'Auspicious Satyanarayan Katha recitation followed by a grand traditional community dinner for all residents.',
    time: '4:00 PM & 8:00 PM',
    stage: 'Club House & Dining Grounds',
    bgImage: 'https://images.unsplash.com/photo-1609137144827-0248439ce8a5?auto=format&fit=crop&w=1200&q=80',
    gradientOverlay: 'linear-gradient(135deg, rgba(133, 77, 14, 0.9) 0%, rgba(202, 138, 4, 0.85) 50%, rgba(217, 119, 6, 0.82) 100%)',
    accentColor: '#fef08a',
    textColor: '#ffffff',
    badgeBg: 'rgba(254, 240, 138, 0.28)',
    highlights: [
      { icon: '🪔', label: 'Shri Satyanarayan Katha', time: '4:00 PM onwards' },
      { icon: '🔔', label: 'Special Pre-Visarjan Maha Aarti', time: '8:00 PM' },
      { icon: '🍽️', label: 'Grand Mahaprasad (Dinner)', time: '8:00 PM onwards' },
    ],
    aartiNotice: 'Full Multi-Course Feast • 8:00 PM to 10:00 PM',
  },
  {
    id: 'slide-visarjan',
    tag: 'ANANT CHATURDASHI • FINAL FAREWELL',
    dateBadge: {
      month: 'SEP',
      day: '25',
      dayName: 'FRI',
    },
    title: 'Shri Ganesh Visarjan',
    subtitle: 'Grand immersion procession with Gulal, Lezim, Dhol Tasha beats and heartfelt farewell to Ganpati Bappa.',
    time: '4:00 PM onwards',
    stage: 'Society Grounds & Visarjan Route',
    bgImage: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=1200&q=80',
    gradientOverlay: 'linear-gradient(135deg, rgba(153, 27, 27, 0.9) 0%, rgba(220, 38, 38, 0.85) 50%, rgba(234, 88, 12, 0.82) 100%)',
    accentColor: '#fed7aa',
    textColor: '#ffffff',
    badgeBg: 'rgba(254, 215, 170, 0.25)',
    highlights: [
      { icon: '🥁', label: 'Dhol Tasha & Lezim Pathak', time: '4:00 PM' },
      { icon: '✨', label: 'Gulal & Floral Farewell' },
      { icon: '🌊', label: 'Final Visarjan Maha Aarti', time: 'Evening' },
    ],
    aartiNotice: 'Pudhchya Varshi Lavkar Ya! • Bappa Morya!',
  },
  {
    id: 'slide-daily-aarti',
    tag: 'DAILY DEVOTIONAL SCHEDULE (14–25 SEP)',
    dateBadge: {
      month: 'DAILY',
      day: '12',
      dayName: 'DAYS',
    },
    title: 'Daily Aarti & Prasad Seva',
    subtitle: 'Join us twice every day for sacred community prayers, chanting, and fresh Modak Prasad distribution.',
    time: '9:00 AM & 8:00 PM',
    stage: 'Club House Podium',
    bgImage: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
    gradientOverlay: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(49, 46, 129, 0.86) 50%, rgba(67, 56, 202, 0.84) 100%)',
    accentColor: '#c7d2fe',
    textColor: '#ffffff',
    badgeBg: 'rgba(199, 210, 254, 0.25)',
    highlights: [
      { icon: '☀️', label: 'Morning Aarti', time: '9:00 AM' },
      { icon: '🌙', label: 'Evening Aarti', time: '8:00 PM' },
      { icon: '🪔', label: 'Modak Prasad by Devotee Host Families' },
    ],
    aartiNotice: '12 Days Prasad Seva • Book Your Family Slot',
  },
];

export const EventScheduleCarousel: React.FC<EventScheduleCarouselProps> = ({ onViewAllPrograms }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SCHEDULE_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SCHEDULE_SLIDES.length) % SCHEDULE_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SCHEDULE_SLIDES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slide = SCHEDULE_SLIDES[currentIndex];

  return (
    <div style={{ margin: '0 14px 20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={18} color="#ea580c" />
          <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
            Ganeshotsav 2026 Schedule
          </span>
        </div>
        <button
          onClick={onViewAllPrograms}
          style={{
            background: 'none',
            border: 'none',
            color: '#ea580c',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {/* Main Carousel Card Container with Photographic Background */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          borderRadius: 22,
          color: slide.textColor,
          padding: '18px 16px 16px',
          overflow: 'hidden',
          boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
          minHeight: 285,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Background Image with Zoom / Fade transition */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${slide.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.62) contrast(1.1)',
            transform: 'scale(1.04)',
            transition: 'all 0.6s ease-in-out',
            zIndex: 1,
          }}
        />

        {/* Gradient Tint Overlay for perfect readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.gradientOverlay,
            zIndex: 2,
            transition: 'background 0.5s ease',
          }}
        />

        {/* Top Tag & Date Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, position: 'relative', zIndex: 3 }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: slide.badgeBg,
              color: slide.accentColor,
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.6,
              marginBottom: 8,
              border: `1px solid ${slide.accentColor}50`,
              backdropFilter: 'blur(6px)',
            }}>
              {slide.tag}
            </div>
            <h2 style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 4px 0',
              lineHeight: 1.25,
              textShadow: '0 2px 8px rgba(0,0,0,0.45)',
            }}>
              {slide.title}
            </h2>
          </div>

          {/* Date Badge */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.45)',
            borderRadius: 14,
            padding: '6px 12px',
            textAlign: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 900, color: slide.accentColor, letterSpacing: 0.8 }}>
              {slide.dateBadge.month}
            </div>
            <div style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              {slide.dateBadge.day}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)' }}>
              {slide.dateBadge.dayName}
            </div>
          </div>
        </div>

        {/* Time & Venue meta info */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.95)',
          margin: '8px 0 10px 0',
          position: 'relative',
          zIndex: 3,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: 8 }}>
            <Clock size={13} color={slide.accentColor} />
            <span>{slide.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: 8 }}>
            <MapPin size={13} color={slide.accentColor} />
            <span>{slide.stage}</span>
          </div>
        </div>

        {/* Highlights List with Glassmorphism */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 14,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          margin: '2px 0 12px 0',
          position: 'relative',
          zIndex: 3,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          {slide.highlights.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 700,
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span style={{ color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              </div>
              {item.time && (
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: slide.accentColor,
                  background: 'rgba(255,255,255,0.18)',
                  padding: '2px 6px',
                  borderRadius: 6,
                  flexShrink: 0,
                }}>
                  {item.time}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar: Aarti Notice + Slide Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.25)',
          paddingTop: 10,
          position: 'relative',
          zIndex: 3,
        }}>
          {slide.aartiNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 800,
              color: slide.accentColor,
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}>
              <Bell size={12} />
              <span>{slide.aartiNotice}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous Slide"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next Slide"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
      }}>
        {SCHEDULE_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}: ${s.title}`}
            style={{
              width: currentIndex === idx ? 24 : 7,
              height: 7,
              borderRadius: 4,
              background: currentIndex === idx ? '#ea580c' : '#cbd5e1',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
