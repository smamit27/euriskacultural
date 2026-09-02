import React from 'react';
import type { Building } from '../../types';

interface BuildingSummaryProps {
  building?: Building;
  buildings?: Building[];
  totalCollected: number;
  totalPending: number;
  selectedBuilding: string;
}

export const BuildingSummary: React.FC<BuildingSummaryProps> = ({
  building,
  buildings = [],
  totalCollected,
  totalPending,
  selectedBuilding,
}) => {
  const isAll = selectedBuilding === 'ALL' || !building;

  const target = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.targetAmount || 0), 0)
      : 480000
    : building?.targetAmount || 160000;

  const collected = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.collectedAmount || 0), 0)
      : totalCollected
    : building?.collectedAmount || 0;

  const pending = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.pendingAmount || 0), 0)
      : totalPending
    : building?.pendingAmount || 0;

  const paidFlats = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.paidFlatsCount || 0), 0)
      : 0
    : building?.paidFlatsCount || 0;

  const pendingFlats = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.pendingFlatsCount || 0), 0)
      : 0
    : building?.pendingFlatsCount || 0;

  const totalFlats = isAll
    ? buildings.length > 0
      ? buildings.reduce((sum, b) => sum + (b.totalFlats || 0), 0)
      : 96
    : building?.totalFlats || 32;

  const percentage = target > 0 ? Math.round((collected / target) * 100) : 0;

  const title = isAll
    ? 'ALL WINGS (A, B, C)'
    : `${building?.name || selectedBuilding + ' WING'}`;

  return (
    <div className="building-summary-box">
      <div className="building-summary-header">
        <h3 className="building-summary-title">{title}</h3>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: percentage >= 80 ? '#059669' : '#d97706',
          }}
        >
          {percentage}% Complete
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#059669',
              textTransform: 'uppercase',
            }}
          >
            Collected
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
            ₹{collected.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#d97706',
              textTransform: 'uppercase',
            }}
          >
            Pending
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#b45309' }}>
            ₹{pending.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Breakdown Chips: Received, Pending, and Total Flats */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            background: '#ecfdf5',
            color: '#047857',
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #a7f3d0',
            fontWeight: 700,
          }}
        >
          ✅ {paidFlats} Received ({percentage}%)
        </span>
        <span
          style={{
            background: '#fffbeb',
            color: '#b45309',
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #fde68a',
            fontWeight: 700,
          }}
        >
          ⏳ {pendingFlats} Pending Flats
        </span>
        <span
          style={{
            background: '#f1f5f9',
            color: '#475569',
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontWeight: 700,
          }}
        >
          🏢 {totalFlats} Total Flats
        </span>
      </div>

      <div className="progress-container">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
