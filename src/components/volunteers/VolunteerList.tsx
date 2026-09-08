import React, { useState, useEffect } from 'react';
import { Users, FileDown, Phone } from 'lucide-react';
import type { Volunteer } from '../../types';
import { volunteerService } from '../../services/volunteerService';
import { pdfService } from '../../services/pdfService';

export const VolunteerList: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    volunteerService.getVolunteers().then((data) => {
      setVolunteers(data);
      setLoading(false);
    });
  }, []);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await pdfService.exportVolunteersRosterPDF(volunteers);
    } catch (error) {
      console.error('Failed to export volunteers PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading volunteers...</div>;

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Users size={22} color="#ea580c" />
            <span>Volunteers</span>
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{volunteers.length} members • Euriska 2026</p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading || volunteers.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
            opacity: downloading ? 0.7 : 1,
            transition: 'transform 0.15s, opacity 0.15s',
          }}
        >
          <FileDown size={16} />
          <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
        </button>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        {volunteers.map((vol, idx) => (
          <div
            key={vol.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: idx < volunteers.length - 1 ? '1px solid #f1f5f9' : 'none',
              background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: '#fff7ed',
                color: '#ea580c',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fed7aa',
                flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {vol.name}
                </div>
                {vol.phone && (
                  <a
                    href={`tel:${vol.phone.replace(/\s+/g, '')}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0284c7',
                      textDecoration: 'none',
                      marginTop: 2,
                    }}
                  >
                    <Phone size={12} />
                    <span>{vol.phone}</span>
                  </a>
                )}
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              color: '#1e293b',
              flexShrink: 0,
            }}>
              {vol.flatNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
