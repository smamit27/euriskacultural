import React from 'react';
import { Building2, CheckCircle2, Users } from 'lucide-react';
import type { Building } from '../../types';

interface BuildingContributionSectionProps {
  buildings: Building[];
  totalCollected: number;
  totalPending: number;
  totalFlats: number;
  paidFlatsCount: number;
  pendingFlatsCount: number;
  collectionPercentage: number;
  onSelectBuilding?: (buildingId: string) => void;
}

export const BuildingContributionSection: React.FC<BuildingContributionSectionProps> = ({
  buildings,
  totalCollected,
  totalPending,
  totalFlats,
  paidFlatsCount,
  pendingFlatsCount,
  collectionPercentage,
  onSelectBuilding,
}) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      padding: '20px 18px',
      marginBottom: 20,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Building2 size={20} color="#f97316" />
            <span>Contribution by Building</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Real-time collection progress across residential wings
          </p>
        </div>

        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
        }}>
          {collectionPercentage}% Society Total
        </div>
      </div>

      {/* Building Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {buildings.map((b) => {
          const target = b.targetAmount || ((b.totalFlats || 1) * (b.expectedPerFlat || 1500));
          const collected = b.collectedAmount || 0;
          const pending = b.pendingAmount || Math.max(0, target - collected);
          const paidCount = b.paidFlatsCount || 0;
          const totalWingFlats = b.totalFlats || 1;
          const pct = target > 0 ? Math.round((collected / target) * 100) : 0;

          const isHigh = pct >= 85;
          const barColor = isHigh ? '#10b981' : pct >= 70 ? '#f59e0b' : '#3b82f6';
          const bgLight = isHigh ? '#f0fdf4' : pct >= 70 ? '#fffbeb' : '#eff6ff';
          const borderLight = isHigh ? '#bbf7d0' : pct >= 70 ? '#fde68a' : '#bfdbfe';

          return (
            <div
              key={b.buildingId}
              onClick={() => onSelectBuilding && onSelectBuilding(b.buildingId)}
              style={{
                background: bgLight,
                border: `1.5px solid ${borderLight}`,
                borderRadius: 16,
                padding: '14px 16px',
                cursor: onSelectBuilding ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                  }}>
                    {b.buildingId}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {b.name}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: barColor }}>
                  {pct}%
                </div>
              </div>

              <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                ₹{collected.toLocaleString('en-IN')}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11.5,
                color: '#475569',
                marginBottom: 8,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <CheckCircle2 size={13} color="#059669" />
                  {paidCount} / {totalWingFlats} Flats
                </span>
                <span style={{ color: '#64748b' }}>
                  Pending: ₹{pending.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: 8,
                background: 'rgba(0,0,0,0.06)',
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: '100%',
                  background: barColor,
                  borderRadius: 999,
                  transition: 'width 0.8s ease-out',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Society Overall Summary Row Table */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={18} color="#0f172a" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              Total Society Collection
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {paidFlatsCount} of {totalFlats} Flats Paid ({pendingFlatsCount} Pending)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Collected</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#059669' }}>
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Pending</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#d97706' }}>
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
