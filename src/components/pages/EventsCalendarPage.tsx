import React from 'react';
import { CULTURAL_EVENTS, daysUntil } from '../../services/eventsData';
import type { CulturalEvent } from '../../types';

function StatusBadge({ event }: { event: CulturalEvent }) {
  if (event.status === 'ONGOING') {
    return (
      <span style={{
        fontSize: 10, fontWeight: 900, color: '#fff',
        background: 'linear-gradient(90deg,#16a34a,#15803d)',
        borderRadius: 20, padding: '3px 10px',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>🔴 Ongoing</span>
    );
  }
  if (event.status === 'COMPLETED') {
    return (
      <span style={{
        fontSize: 10, fontWeight: 800, color: '#94a3b8',
        background: '#f1f5f9', borderRadius: 20, padding: '3px 10px',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>✓ Completed</span>
    );
  }
  const days = daysUntil(event.date);
  const label = days === 0 ? '🎉 Today!' : days === 1 ? '⏰ Tomorrow!' : `${days} days away`;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800,
      color: event.accentColor,
      background: '#fff',
      border: `1.5px solid ${event.accentColor}50`,
      borderRadius: 20, padding: '3px 10px',
    }}>
      {label}
    </span>
  );
}

function formatDate(dateStr: string, endDate?: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const start = new Date(dateStr).toLocaleDateString('en-IN', opts);
  if (!endDate) return start;
  const end = new Date(endDate).toLocaleDateString('en-IN', opts);
  return `${start} – ${end}`;
}

import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

export const EventsCalendarPage: React.FC = () => {
  // Ganesh Chaturthi expanded by default, or toggle any festival
  const [expandedId, setExpandedId] = React.useState<string | null>('evt-ganesh-2026');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ padding: '0 14px 32px' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 20, padding: '20px 20px', marginBottom: 20,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -24, right: -24,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 40,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
          🎊 Euriska Presents
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
          Cultural &amp; Festive
        </h1>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24', lineHeight: 1.1, marginBottom: 6 }}>
          Calendar 2026–27
        </div>
        <div style={{ fontSize: 12, color: '#c7d2fe', lineHeight: 1.6 }}>
          Six grand celebrations for our Euriska family — <br />
          <strong style={{ color: '#e0e7ff' }}>Celebrating Togetherness</strong> all year round. Tap any festival to view its full schedule.
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CULTURAL_EVENTS.map((event, idx) => {
          const isExpanded = expandedId === event.id;
          const hasSchedule = event.scheduleItems && event.scheduleItems.length > 0;

          return (
            <div
              key={event.id}
              style={{
                background: event.cardBg,
                borderRadius: 18,
                border: `1.5px solid ${isExpanded ? event.accentColor : event.accentColor + '25'}`,
                overflow: 'hidden',
                boxShadow: isExpanded ? `0 6px 22px ${event.accentColor}30` : `0 3px 16px ${event.accentColor}18`,
                opacity: event.status === 'COMPLETED' ? 0.65 : 1,
                transition: 'all 0.25s ease',
              }}
            >
              {/* Card Header row (Clickable) */}
              <div
                onClick={() => toggleExpand(event.id)}
                style={{ display: 'flex', alignItems: 'stretch', cursor: 'pointer' }}
              >
                {/* Month Sidebar */}
                <div style={{
                  background: event.gradient,
                  minWidth: 72,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 8px',
                  gap: 6,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.85)', letterSpacing: 2, textTransform: 'uppercase' }}>
                    {event.month}
                  </div>
                  {event.imageUrl ? (
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2.5px solid rgba(255,255,255,0.6)',
                      boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
                    }}>
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: 30, lineHeight: 1 }}>{event.emoji}</div>
                  )}
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    #{String(idx + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '14px 14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: event.accentColor, lineHeight: 1.2 }}>
                      {event.name}
                    </div>
                    <StatusBadge event={event} />
                  </div>

                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 500, lineHeight: 1.5, marginBottom: 8 }}>
                    {event.tagline}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: '#fff',
                        background: event.accentColor,
                        borderRadius: 6, padding: '2px 8px',
                      }}>
                        📅 {formatDate(event.date, event.endDate)}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: event.accentColor,
                        background: '#fff',
                        border: `1px solid ${event.accentColor}30`,
                        borderRadius: 6, padding: '2px 8px',
                      }}>
                        {event.monthFull}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: event.accentColor,
                    }}>
                      <span>{isExpanded ? 'Hide Schedule' : 'View Schedule'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Schedule Timeline (one by one) */}
              {isExpanded && hasSchedule && (
                <div style={{
                  padding: '12px 14px 16px',
                  borderTop: `1px dashed ${event.accentColor}40`,
                  background: '#ffffff',
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: event.accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span>📋</span>
                    <span>{event.name} — Full Event Schedule & Activities</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {event.scheduleItems?.map((item) => (
                      <div
                        key={item.title}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          background: '#f8fafc',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: event.cardBg,
                          border: `1px solid ${event.accentColor}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {item.icon || '✨'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                              {item.title}
                            </div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 800,
                              color: event.accentColor,
                              background: '#fff',
                              border: `1px solid ${event.accentColor}30`,
                              padding: '2px 8px',
                              borderRadius: 6,
                              whiteSpace: 'nowrap',
                            }}>
                              <Clock size={11} />
                              <span>{item.time}</span>
                            </div>
                          </div>

                          {item.desc && (
                            <div style={{ fontSize: 12, color: '#475569', marginTop: 3, lineHeight: 1.45 }}>
                              {item.desc}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                              📅 {item.date}
                            </span>
                            {item.badge && (
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                color: event.accentColor,
                                background: event.cardBg,
                                borderRadius: 4,
                                padding: '1px 6px',
                              }}>
                                • {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 24, padding: '14px 16px',
        background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
        borderRadius: 14, border: '1px solid #fde68a',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 20, marginBottom: 4 }}>🏠</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>
          Euriska — Celebrating Togetherness
        </div>
        <div style={{ fontSize: 11, color: '#b45309', lineHeight: 1.6 }}>
          All events are open to all residents &amp; their guests. <br />
          Stay tuned for event details, ticket info &amp; volunteer slots!
        </div>
      </div>
    </div>
  );
};
