import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Volunteer } from '../../types';
import { volunteerService } from '../../services/volunteerService';

export const VolunteerList: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    volunteerService.getVolunteers().then((data) => {
      setVolunteers(data);
      setLoading(false);
    });
  }, []);

  const getStatusIcon = (status: Volunteer['status']) => {
    switch (status) {
      case 'ON_DUTY': return <span style={{ color: '#059669', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle2 size={13} /> ON DUTY</span>;
      case 'ASSIGNED': return <span style={{ color: '#d97706', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={13} /> ASSIGNED</span>;
      default: return <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><AlertCircle size={13} /> AVAILABLE</span>;
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading volunteers...</div>;

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Volunteers</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{volunteers.length} members powering Euriska 2026</p>
      </div>

      <div className="volunteer-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {volunteers.map((vol) => (
          <div key={vol.id} style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '12px 14px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{vol.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 1 }}>{vol.role}</div>
              </div>
              {getStatusIcon(vol.status)}
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#475569', marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                🏢 {vol.flatNumber}
              </span>
              <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                🕕 {vol.shiftTime}
              </span>
              {vol.tasksCount !== undefined && (
                <span style={{ background: '#fff7ed', color: '#f97316', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  📋 {vol.tasksCount} Tasks
                </span>
              )}
            </div>

            <a
              href={`tel:${vol.phone}`}
              className="btn btn-sm btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, textDecoration: 'none', color: '#059669', borderColor: '#bbf7d0' }}
            >
              <Phone size={13} />
              Call {vol.name.split(' ')[0]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
