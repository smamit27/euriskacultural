import React, { useState, useEffect } from 'react';
import {
  Clock,
  ExternalLink,
  Play,
  CheckCircle,
  Bell,
  Share2,
  Tv,
} from 'lucide-react';
import {
  liveScheduleService,
  OFFICIAL_YOUTUBE_LIVE_URL,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from '../../services/liveScheduleService';
import type { ScheduledDayInfo, DailyScheduleSlot } from '../../services/liveScheduleService';
import { useToast } from '../../context/ToastContext';

interface DailyLiveSchedulerProps {
  onWatchLive: (videoId?: string) => void;
  compact?: boolean;
}

export const DailyLiveScheduler: React.FC<DailyLiveSchedulerProps> = ({
  onWatchLive,
  compact = false,
}) => {
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<ScheduledDayInfo[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [nextSlotInfo, setNextSlotInfo] = useState<ReturnType<typeof liveScheduleService.getCurrentOrNextSlot> | null>(null);

  // Load festival schedule & real-time countdown ticking
  useEffect(() => {
    const refresh = () => {
      const festivalDays = liveScheduleService.getFestivalSchedule();
      setSchedule(festivalDays);
      setNextSlotInfo(liveScheduleService.getCurrentOrNextSlot());
    };

    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial selection: match today if within festival, otherwise Day 1 (14 Sep)
  useEffect(() => {
    if (schedule.length > 0) {
      const todayIdx = schedule.findIndex((d) => d.isToday);
      if (todayIdx !== -1) {
        setSelectedDayIdx(todayIdx);
      } else {
        setSelectedDayIdx(0); // Default to Day 1 (14 Sep)
      }
    }
  }, [schedule.length]);

  const selectedDay = schedule[selectedDayIdx] || schedule[0];

  const handle1ClickLaunch = (slot: DailyScheduleSlot, status: 'live' | 'upcoming' | 'completed') => {
    onWatchLive(slot.youtubeVideoId);
    if (status === 'live') {
      showToast(`🔴 Joining ${slot.title}!`, 'success');
    } else {
      showToast(`✨ Opening ${slot.title} portal!`, 'info');
    }
  };

  const handleShareSlot = (slot: DailyScheduleSlot, dayLabel: string) => {
    const streamUrl = slot.youtubeUrl || OFFICIAL_YOUTUBE_LIVE_URL;
    const text = `🪔 Join Majestique Euriska Cultural's "${slot.title}" (${slot.timeDisplay}) on ${dayLabel}!\n🔴 Watch Live: ${streamUrl}`;
    if (navigator.share) {
      navigator.share({ title: slot.title, text, url: streamUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('Live stream YouTube link copied to clipboard!', 'success');
    }
  };

  if (!selectedDay) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 22,
        border: '1.5px solid #fed7aa',
        padding: compact ? '16px' : '20px 22px',
        boxShadow: '0 8px 30px rgba(249, 115, 22, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top ambient bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #ef4444 100%)',
        }}
      />

      {/* Header with Live Next Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🪔
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: '#ea580c',
                  background: '#fff7ed',
                  padding: '2px 8px',
                  borderRadius: 8,
                  letterSpacing: 0.5,
                  border: '1px solid #ffedd5',
                }}
              >
                GANESHOTSAV 2026 LIVE SCHEDULE
              </span>
              {nextSlotInfo?.isLiveNow && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: '#fff',
                    background: '#ef4444',
                    padding: '2px 8px',
                    borderRadius: 8,
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  🔴 BROADCASTING NOW
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
              Daily Live Aarti &amp; Darshan Schedule
            </h3>
          </div>
        </div>

        {/* Live Next Session Banner Badge */}
        {nextSlotInfo && (
          <div
            onClick={() => onWatchLive(nextSlotInfo?.slot.youtubeVideoId)}
            style={{
              background: nextSlotInfo.isLiveNow
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#fff',
              borderRadius: 14,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: nextSlotInfo.isLiveNow
                ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                : '0 2px 8px rgba(15, 23, 42, 0.2)',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: nextSlotInfo.isLiveNow ? '#fef08a' : '#94a3b8', fontWeight: 800 }}>
                {nextSlotInfo.isLiveNow ? '🔴 ACTIVE LIVE STREAM' : `⏳ NEXT (${nextSlotInfo.dayLabel})`}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.3 }}>
                {nextSlotInfo.isLiveNow
                  ? `${nextSlotInfo.slot.type === 'morning' ? 'Morning 8:00 AM' : 'Evening'} Live`
                  : liveScheduleService.formatCountdown(nextSlotInfo.timeRemainingMs)}
              </div>
            </div>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={14} fill="#fff" />
            </div>
          </div>
        )}
      </div>

      {/* Festival Date Tabs: 14 Sep (5 PM) to 25 Sep (4 PM) */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 10,
          marginBottom: 14,
          scrollbarWidth: 'none',
        }}
      >
        {schedule.map((day, idx) => {
          const isSelected = selectedDayIdx === idx;
          const hasLiveNow = day.slots.some((s) => s.status === 'live');

          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #ea580c, #c2410c)'
                  : day.isToday
                  ? '#fff7ed'
                  : '#f8fafc',
                color: isSelected ? '#ffffff' : day.isToday ? '#ea580c' : '#475569',
                border: isSelected
                  ? '1.5px solid #ea580c'
                  : day.isToday
                  ? '1.5px solid #fed7aa'
                  : '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minWidth: 92,
                position: 'relative',
                boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {hasLiveNow && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #fff',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, opacity: isSelected ? 0.9 : 0.7, fontWeight: 700 }}>
                  Day {day.dayNumber}
                </span>
                {day.dayNumber === 1 && <span style={{ fontSize: 9 }}>🐘</span>}
                {day.dayNumber === 12 && <span style={{ fontSize: 9 }}>🌊</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 900 }}>{day.dayShort}</span>
              <span style={{ fontSize: 10, opacity: isSelected ? 0.9 : 0.7 }}>
                {day.dayNumber === 1 ? '5:00 PM' : day.dayNumber === 12 ? '4:00 PM' : '8 AM & 8 PM'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Festival Theme Banner */}
      {selectedDay.festivalDayName && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>
              {selectedDay.dayNumber === 1 ? '🐘' : selectedDay.dayNumber === 12 ? '🌊' : '🪔'}
            </span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#9a3412' }}>
                {selectedDay.festivalDayName}
              </span>
              <div style={{ fontSize: 11, color: '#c2410c', fontWeight: 600 }}>
                {selectedDay.dayNumber === 1
                  ? 'Starts at 5:00 PM with Ganesh Aagman Miravnuk & 8:00 PM First Maha Aarti'
                  : selectedDay.dayNumber === 12
                  ? 'Starts at 4:00 PM with Anant Chaturdashi Ganesh Visarjan Miravnuk'
                  : 'Daily Morning Pooja (8:00 AM) & Evening Maha Aarti (8:00 PM)'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', background: '#fff', padding: '3px 8px', borderRadius: 8, border: '1px solid #fed7aa' }}>
            {selectedDay.formattedDate}
          </span>
        </div>
      )}

      {/* Selected Day Slots Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 12,
        }}
      >
        {selectedDay.slots.map(({ slot, startTime, status, timeRemainingMs }) => {
          const isSlotLive = status === 'live';
          const isSlotCompleted = status === 'completed';

          return (
            <div
              key={slot.id}
              style={{
                borderRadius: 18,
                border: isSlotLive
                  ? '2px solid #ef4444'
                  : isSlotCompleted
                  ? '1px solid #e2e8f0'
                  : '1px solid #fed7aa',
                background: isSlotLive
                  ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #450a0a 100%)'
                  : isSlotCompleted
                  ? '#f8fafc'
                  : 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
                padding: '16px 18px',
                color: isSlotLive ? '#ffffff' : '#0f172a',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSlotLive
                  ? '0 8px 24px rgba(239, 68, 68, 0.25)'
                  : '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Top Slot Header */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{slot.icon}</span>
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          color: isSlotLive ? '#fef08a' : slot.accentColor,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {slot.subtitle}
                      </span>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: isSlotLive ? '#ffffff' : '#1e293b',
                        }}
                      >
                        {slot.timeDisplay}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isSlotLive ? (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '3px 10px',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#fff',
                          animation: 'pulse 1.5s infinite',
                        }}
                      />
                      <span>LIVE NOW</span>
                    </span>
                  ) : isSlotCompleted ? (
                    <span
                      style={{
                        background: '#e2e8f0',
                        color: '#475569',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CheckCircle size={12} color="#16a34a" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Clock size={11} />
                      <span>Starts in {liveScheduleService.formatCountdown(timeRemainingMs)}</span>
                    </span>
                  )}
                </div>

                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    margin: '4px 0',
                    color: isSlotLive ? '#ffffff' : '#0f172a',
                  }}
                >
                  {slot.title}
                </h4>

                <p
                  style={{
                    fontSize: 12,
                    color: isSlotLive ? '#cbd5e1' : '#64748b',
                    margin: '0 0 10px',
                    lineHeight: 1.4,
                  }}
                >
                  {slot.description}
                </p>

                {/* Festival Video Thumbnail Banner */}
                <div
                  onClick={() => handle1ClickLaunch(slot, status)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '36%',
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: 10,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src="/youtube_thumbnail.jpg"
                    alt={slot.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fef08a',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {slot.youtubeVideoId ? `YouTube Live • ${slot.youtubeVideoId}` : 'Majestique Euriska Mandap'}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isSlotLive ? '#ef4444' : '#ea580c',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      <Play size={13} fill="#fff" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Click Action Buttons Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 6,
                  paddingTop: 10,
                  borderTop: isSlotLive
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid #f1f5f9',
                }}
              >
                {/* 1-Click Primary Action Button */}
                <button
                  type="button"
                  onClick={() => handle1ClickLaunch(slot, status)}
                  style={{
                    flex: 1,
                    background: isSlotLive
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : isSlotCompleted
                      ? '#0f172a'
                      : 'linear-gradient(135deg, #ea580c, #c2410c)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: isSlotLive
                      ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                      : '0 2px 8px rgba(234, 88, 12, 0.25)',
                  }}
                >
                  {isSlotLive ? (
                    <>
                      <Play size={14} fill="#fff" />
                      <span>🔴 Watch Live Now</span>
                    </>
                  ) : isSlotCompleted ? (
                    <>
                      <Tv size={14} />
                      <span>View Darshan Portal</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="#fff" />
                      <span>▶️ Click to Start &amp; Join</span>
                    </>
                  )}
                </button>

                {/* Google Calendar Reminder Button (for upcoming) */}
                {!isSlotCompleted && (
                  <a
                    href={liveScheduleService.generateGoogleCalendarUrl(slot, startTime)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Add to Google Calendar Reminder"
                    style={{
                      background: isSlotLive ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                      color: isSlotLive ? '#fff' : '#475569',
                      border: isSlotLive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1',
                      borderRadius: 12,
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    <Bell size={15} />
                  </a>
                )}

                {/* Direct YouTube Stream Link Button */}
                {slot.youtubeUrl && (
                  <a
                    href={slot.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open on YouTube"
                    style={{
                      background: isSlotLive ? '#ef4444' : '#fee2e2',
                      color: isSlotLive ? '#fff' : '#dc2626',
                      border: isSlotLive ? '1px solid #ef4444' : '1px solid #fecaca',
                      borderRadius: 12,
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShareSlot(slot, selectedDay.dayLabel)}
                  title="Share Session"
                  style={{
                    background: isSlotLive ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc',
                    color: isSlotLive ? '#fff' : '#475569',
                    border: isSlotLive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Info & YouTube Channel Direct Link */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px dashed #fed7aa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔔 14th Sep (5 PM Aagman), 15th–24th Sep (8 AM &amp; 8 PM Daily), 25th Sep (4 PM Visarjan).</span>
        </div>

        <a
          href={OFFICIAL_YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#dc2626',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <span>Subscribe on YouTube</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
