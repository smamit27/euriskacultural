import React from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import type { Program } from '../../types';

interface UpcomingProgramsProps {
  programs: Program[];
  onSelectProgram: (prog: Program) => void;
  onViewAll: () => void;
}

export const UpcomingPrograms: React.FC<UpcomingProgramsProps> = ({
  programs,
  onSelectProgram,
  onViewAll,
}) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-header">
        <h2 className="section-title">Upcoming Schedule</h2>
        <button onClick={onViewAll} className="btn-sm btn-outline" style={{ border: 'none', color: 'var(--primary)', cursor: 'pointer', background: 'none' }}>
          View All →
        </button>
      </div>

      <div className="horizontal-scroll-container">
        {programs.slice(0, 5).map((prog) => (
          <div
            key={prog.id}
            className="program-swipe-card"
            onClick={() => onSelectProgram(prog)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
              <div className="program-time-badge">
                <Clock size={13} />
                <span>{prog.time}</span>
              </div>
              {prog.date && (
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#ea580c',
                  background: '#ffedd5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #fed7aa',
                }}>
                  📅 {prog.date.slice(5).replace('-', '/')}
                </div>
              )}
            </div>

            <h3 className="program-card-title">{prog.title}</h3>

            <div className="program-card-stage" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} color="#f97316" />
              <span>{prog.stage}</span>
            </div>

            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary)',
                paddingTop: 8,
                borderTop: '1px dashed var(--border-light)',
              }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
