import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ArrowRight, Play } from 'lucide-react';
import type { Performance } from '../../types';
import { performanceService } from '../../services/performanceService';

interface PerformanceListProps {
  onSelectPerformance: (perf: Performance) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Traditional Dance': { bg: '#fdf4ff', text: '#7e22ce' },
  'Bollywood Dance': { bg: '#fff7ed', text: '#c2410c' },
  'Vocal Music': { bg: '#ecfdf5', text: '#047857' },
  'Instrumental': { bg: '#eff6ff', text: '#1d4ed8' },
  'Drama/Skit': { bg: '#fef2f2', text: '#b91c1c' },
  'Kids Special': { bg: '#fffbeb', text: '#b45309' },
  'Fashion Show': { bg: '#f0fdf4', text: '#15803d' },
};

export const PerformanceList: React.FC<PerformanceListProps> = ({ onSelectPerformance }) => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceService.getPerformances().then((data) => {
      setPerformances(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading artists...</div>
  );

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Performances</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Meet the talented performers of Euriska 2026</p>
      </div>

      <div className="performance-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {performances.map((perf) => {
          const catColor = CATEGORY_COLORS[perf.category] || { bg: '#f1f5f9', text: '#334155' };
          return (
            <div
              key={perf.id}
              onClick={() => onSelectPerformance(perf)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s',
              }}
            >
              {/* Performance image */}
              <div style={{ position: 'relative', height: 180 }}>
                <img
                  src={perf.imageUrl}
                  alt={perf.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 12,
                  right: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    background: catColor.bg,
                    color: catColor.text,
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}>
                    {perf.category}
                  </span>
                  {perf.videoUrl && (
                    <span style={{
                      background: 'rgba(255,255,255,0.9)',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Play size={12} fill="#dc2626" />
                      Watch
                    </span>
                  )}
                </div>
              </div>

              {/* Info section */}
              <div style={{ padding: '12px 14px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>
                  {perf.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', marginBottom: 6 }}>
                  <Users size={13} color="#8b5cf6" />
                  <span style={{ fontWeight: 600 }}>{perf.performer}</span>
                  {perf.groupName && <span style={{ color: '#94a3b8' }}>• {perf.groupName}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={12} color="#f97316" />{perf.time.split('•')[0].trim()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={12} color="#f97316" />{perf.stage}
                    </span>
                  </div>
                  <span style={{ color: '#f97316', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                    View <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
