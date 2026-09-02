import React from 'react';
import type { Building } from '../../types';

interface BuildingSummaryProps {
  building?: Building;
  totalCollected: number;
  totalPending: number;
  selectedBuilding: string;
}

export const BuildingSummary: React.FC<BuildingSummaryProps> = ({
  building,
  totalCollected,
  totalPending,
  selectedBuilding,
}) => {
  const target = building ? building.targetAmount : 480000;
  const collected = building ? building.collectedAmount || 0 : totalCollected;
  const pending = building ? building.pendingAmount || 0 : totalPending;
  const percentage = target > 0 ? Math.round((collected / target) * 100) : 0;

  const title = selectedBuilding === 'ALL' ? 'ALL BUILDINGS (A, B, C)' : `${building?.name || selectedBuilding + ' BUILDING'}`;

  return (
    <div className="building-summary-box">
      <div className="building-summary-header">
        <h3 className="building-summary-title">{title}</h3>
        <span style={{ fontSize: 13, fontWeight: 800, color: percentage >= 80 ? '#059669' : '#d97706' }}>
          {percentage}% Complete
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Collected</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
            ₹{collected.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Pending</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309' }}>
            ₹{pending.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {building && (
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6 }}>
            ✅ {building.paidFlatsCount || 0} Received ({percentage}%)
          </span>
          <span style={{ background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: 6 }}>
            ⏳ {building.pendingFlatsCount || 0} Pending
          </span>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6 }}>
            🏢 {building.totalFlats || 0} Total Flats
          </span>
        </div>
      )}

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
