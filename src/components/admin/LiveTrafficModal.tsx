import React from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Users, Smartphone, Laptop, Tablet, Eye, Activity, Shield } from 'lucide-react';
import type { ActiveSession } from '../../services/presenceService';

interface LiveTrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ActiveSession[];
}

export const LiveTrafficModal: React.FC<LiveTrafficModalProps> = ({
  isOpen,
  onClose,
  sessions,
}) => {
  const totalCount = sessions.length;
  const mobileCount = sessions.filter((s) => s.deviceType === 'Mobile').length;
  const desktopCount = sessions.filter((s) => s.deviceType === 'Desktop').length;
  const tabletCount = sessions.filter((s) => s.deviceType === 'Tablet').length;
  const adminCount = sessions.filter((s) => s.role === 'ADMIN').length;
  const residentCount = totalCount - adminCount;

  // Group by page
  const pageMap = new Map<string, number>();
  sessions.forEach((s) => {
    const p = s.page || 'Home';
    pageMap.set(p, (pageMap.get(p) || 0) + 1);
  });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="👥 Live Portal Visitors">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Main Stat Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#ffffff',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Active Right Now
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{totalCount} {totalCount === 1 ? 'Person' : 'People'} Online</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              Live real-time heartbeat across all devices
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={26} color="#ffffff" />
          </div>
        </div>

        {/* Device Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <Smartphone size={18} color="#ea580c" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{mobileCount}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Mobile</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <Laptop size={18} color="#0284c7" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{desktopCount}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Desktop</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <Tablet size={18} color="#7c3aed" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{tabletCount}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Tablet</div>
          </div>
        </div>

        {/* Roles Breakdown */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              flex: 1,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Shield size={16} color="#ea580c" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>
              {adminCount} Admin{adminCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Users size={16} color="#16a34a" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              {residentCount} Resident{residentCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Page Locations */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
            Current Page Locations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from(pageMap.entries()).map(([pageName, count]) => (
              <div
                key={pageName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={14} color="#64748b" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{pageName}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#e0f2fe',
                    color: '#0369a1',
                  }}
                >
                  {count} {count === 1 ? 'visitor' : 'visitors'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions List */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
            Connected Clients
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {sessions.map((s, idx) => (
              <div
                key={s.sessionId || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{s.deviceModel}</span>
                  <span style={{ color: '#64748b' }}>({s.os} • {s.browser})</span>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: s.role === 'ADMIN' ? '#ea580c' : '#059669',
                    background: s.role === 'ADMIN' ? '#fff7ed' : '#ecfdf5',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {s.role === 'ADMIN' ? '👑 Admin' : 'Resident'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
