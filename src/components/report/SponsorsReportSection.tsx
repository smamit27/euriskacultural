import React from 'react';
import { Crown, Sparkles, Building2, Phone, CheckCircle2, Award } from 'lucide-react';
import type { Sponsor } from '../../types';

interface SponsorsReportSectionProps {
  sponsors: Sponsor[];
}

export const SponsorsReportSection: React.FC<SponsorsReportSectionProps> = ({ sponsors }) => {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return {
          label: '👑 PLATINUM SEVA PATRON',
          bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
          color: '#c2410c',
          border: '#fed7aa',
        };
      case 'Gold':
        return {
          label: '✨ GOLD SEVA PATRON',
          bg: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
          color: '#7e22ce',
          border: '#e9d5ff',
        };
      default:
        return {
          label: '🌺 DEVOTIONAL SEVA PATRON',
          bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          color: '#15803d',
          border: '#bbf7d0',
        };
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        padding: '20px 18px',
        marginBottom: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff7ed',
              color: '#c2410c',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 4,
              border: '1px solid #fed7aa',
            }}
          >
            <Crown size={13} color="#ea580c" />
            <span>FESTIVAL PATRONS &amp; BENEFACTORS</span>
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            💎 Our Sponsors &amp; Seva Patrons
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            Special acknowledgment &amp; gratitude to society families sponsoring key festival arrangements.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            color: '#334155',
          }}
        >
          <Award size={15} color="#ea580c" />
          <span>{sponsors.length} Dedicated Seva Patrons</span>
        </div>
      </div>

      {/* Sponsor Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {sponsors.map((s) => {
          const badge = getTierBadge(s.tier);
          return (
            <div
              key={s.id}
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fcfbf9 100%)',
                border: `1.5px solid ${badge.border}`,
                borderRadius: 16,
                padding: '16px',
                position: 'relative',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Top Badge & Seva Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '3px 8px',
                      borderRadius: 8,
                      letterSpacing: 0.3,
                    }}
                  >
                    {badge.label}
                  </span>

                  {s.flatNumber && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#0f172a',
                        background: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Building2 size={12} color="#64748b" />
                      <span>{s.flatNumber}</span>
                    </span>
                  )}
                </div>

                {/* Devotee Name & Title */}
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                  {s.name || s.contactPerson}
                </h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ea580c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={14} />
                  <span>{s.sevaCategory || s.sevaType || 'Festival Seva Contribution'}</span>
                </div>

                {/* Description */}
                {s.description && (
                  <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.45, margin: '0 0 12px', fontWeight: 500 }}>
                    {s.description}
                  </p>
                )}
              </div>

              {/* Footer info */}
              <div
                style={{
                  paddingTop: 10,
                  borderTop: '1px dashed #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  color: '#64748b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
                  <CheckCircle2 size={13} />
                  <span>Devotional Seva Confirmed</span>
                </div>

                {s.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Phone size={11} />
                    <span>{s.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
