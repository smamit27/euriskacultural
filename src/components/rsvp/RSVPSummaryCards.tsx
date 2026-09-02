import React from 'react';
import { Users, UserCheck, HeartHandshake, UtensilsCrossed, Building2 } from 'lucide-react';
import type { MahaPrasadSummary } from '../../types';

interface RSVPSummaryCardsProps {
  summary: MahaPrasadSummary;
  totalSocietyFlats?: number;
}

export const RSVPSummaryCards: React.FC<RSVPSummaryCardsProps> = ({
  summary,
  totalSocietyFlats = 231,
}) => {
  const familyParticipationPct = Math.round((summary.totalFamilies / totalSocietyFlats) * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Primary KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 16,
        }}
      >
        {/* Total Devotees Headcount */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: '1.5px solid #fed7aa',
            borderRadius: 16,
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(194, 65, 12, 0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Devotees
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#9a3412', lineHeight: 1.1 }}>
            {summary.totalHeadcount}
          </div>
          <div style={{ fontSize: 12, color: '#c2410c', marginTop: 4, fontWeight: 600 }}>
            {summary.totalAdults} Adults + {summary.totalChildren} Kids (&lt;12y)
          </div>
        </div>

        {/* Registered Families */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1.5px solid #bbf7d0',
            borderRadius: 16,
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RSVP Families
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#166534', lineHeight: 1.1 }}>
            {summary.totalFamilies}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginLeft: 4 }}>
              / {totalSocietyFlats} Flats
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 4, fontWeight: 600 }}>
            {familyParticipationPct}% Society Participation
          </div>
        </div>

        {/* Pure Satvik Maha Prasad */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fefce8, #fef08a)',
            border: '1.5px solid #fde047',
            borderRadius: 16,
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(133, 77, 14, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Feast Type
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ca8a04', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed size={18} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#854d0e', lineHeight: 1.2 }}>
            Satvik Maha Prasad
          </div>
          <div style={{ fontSize: 12, color: '#a16207', marginTop: 4, fontWeight: 700 }}>
            🍲 100% Pure Vegetarian Community Feast
          </div>
        </div>

        {/* Gate Check-In & Redemption */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1.5px solid #86efac',
            borderRadius: 16,
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gate Check-In
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#15803d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#166534', lineHeight: 1.1 }}>
            {summary.redeemedCount || 0}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginLeft: 4 }}>
              / {summary.totalHeadcount} Served
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#166534', marginTop: 4, fontWeight: 700 }}>
            {summary.redeemedFamiliesCount || 0} Families Scanned &amp; Served
          </div>
        </div>

        {/* Seva Volunteers */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1.5px solid #bfdbfe',
            borderRadius: 16,
            padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(30, 64, 175, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seva Volunteers
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1e40af', lineHeight: 1.1 }}>
            {summary.volunteersCount}
          </div>
          <div style={{ fontSize: 12, color: '#1d4ed8', marginTop: 4, fontWeight: 600 }}>
            Serving &amp; Queue Volunteers
          </div>
        </div>
      </div>

      {/* Building-wise Breakdown Strip */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={18} color="#64748b" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Wing-Wise Headcount:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
              Wing A
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {summary.buildingBreakdown.A.headcount} Devotees
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              ({summary.buildingBreakdown.A.families} Flats)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 800, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
              Wing B
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {summary.buildingBreakdown.B.headcount} Devotees
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              ({summary.buildingBreakdown.B.families} Flats)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
              Wing C
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {summary.buildingBreakdown.C.headcount} Devotees
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              ({summary.buildingBreakdown.C.families} Flats)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
