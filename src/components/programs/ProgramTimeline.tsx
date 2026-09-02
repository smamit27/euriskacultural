import React, { useState, useEffect } from 'react';
import { Search, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import type { Program } from '../../types';
import { programService } from '../../services/programService';

interface ProgramTimelineProps {
  onSelectProgram: (prog: Program) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Ceremony: '🪔',
  Dance: '💃',
  Music: '🎵',
  Drama: '🎭',
  Feast: '🍽️',
  Games: '🎮',
  Award: '🏆',
};

export const ProgramTimeline: React.FC<ProgramTimelineProps> = ({ onSelectProgram }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    programService.getPrograms().then((data) => {
      setPrograms(data);
      setLoading(false);
    });
  }, []);

  const filtered = programs.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.stage.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Event Schedule</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Cultural & Festive Calendar 2026–27 • Full Program Lineup</p>
      </div>

      {/* Search */}
      <div className="search-container" style={{ padding: '0 0 12px 0' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search programs or stage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
          Loading schedule...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>No programs found</div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline vertical line */}
          <div style={{
            position: 'absolute',
            left: 19,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'linear-gradient(to bottom, #f97316, #8b5cf6)',
            opacity: 0.3,
            borderRadius: 999,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 44 }}>
            {filtered.map((prog, idx) => (
              <div key={prog.id} style={{ position: 'relative' }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: -32,
                  top: 16,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: idx === 0 ? '#f97316' : '#e2e8f0',
                  border: idx === 0 ? '3px solid #fed7aa' : '2px solid #cbd5e1',
                  boxShadow: idx === 0 ? '0 0 0 4px rgba(249,115,22,0.15)' : 'none',
                }} />

                <div
                  onClick={() => onSelectProgram(prog)}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${idx === 0 ? '#fed7aa' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: idx === 0 ? '0 4px 12px rgba(249,115,22,0.1)' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[prog.category] || '✨'}</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        {prog.time}
                      </div>
                    </div>
                    {prog.date && (
                      <span style={{
                        background: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}>
                        📅 {prog.date}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: 4 }}>
                    {prog.title}
                  </h3>

                  {prog.description && (
                    <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45, marginBottom: 8 }}>
                      {prog.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                      <MapPin size={12} color="#f97316" />
                      <span>{prog.stage}</span>
                    </div>
                    {prog.performers && prog.performers.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                        <Users size={11} />
                        <span>{prog.performers[0]}</span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#94a3b8',
                  }}>
                    <span>{prog.durationMinutes} min</span>
                    <span style={{ color: '#f97316', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View Details <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
