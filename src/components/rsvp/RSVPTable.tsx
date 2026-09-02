import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Trash2, FileText, HeartHandshake, Eye } from 'lucide-react';
import type { MahaPrasadRSVP } from '../../types';

interface RSVPTableProps {
  rsvps: MahaPrasadRSVP[];
  onOpenAddModal: () => void;
  onEdit: (rsvp: MahaPrasadRSVP) => void;
  onDelete: (id: string, flatNumber: string) => void;
  onViewPass: (rsvp: MahaPrasadRSVP) => void;
  onDownloadSinglePDF: (rsvp: MahaPrasadRSVP) => void;
  onExportCSV: () => void;
  onExportRosterPDF: () => void;
}

export const RSVPTable: React.FC<RSVPTableProps> = ({
  rsvps,
  onOpenAddModal,
  onEdit,
  onDelete,
  onViewPass,
  onDownloadSinglePDF,
  onExportCSV,
  onExportRosterPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wingFilter, setWingFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'REGULAR' | 'JAIN'>('ALL');

  const filtered = rsvps.filter((item) => {
    const matchesSearch =
      item.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm));

    const matchesWing =
      wingFilter === 'ALL' ||
      item.buildingId === wingFilter ||
      item.flatNumber.startsWith(`${wingFilter}-`);

    const matchesDiet =
      dietFilter === 'ALL' || item.dietaryPreference === dietFilter;

    return matchesSearch && matchesWing && matchesDiet;
  });

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        padding: '20px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Table Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 2px 0' }}>
            Registered Society Families ({filtered.length} Flats)
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            Real-time headcount roster for Maha Prasad (24 Sep 2026, 8-10 PM).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAddModal}
            style={{
              background: 'linear-gradient(135deg, #c2410c, #ea580c)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>+ Add Family RSVP</span>
          </button>

          <button
            onClick={onExportRosterPDF}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
            title="Download Roster PDF"
          >
            <FileText size={14} color="#ea580c" />
            <span>PDF Roster</span>
          </button>

          <button
            onClick={onExportCSV}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
            title="Download Excel / CSV"
          >
            <Download size={14} color="#059669" />
            <span>CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
          background: '#f8fafc',
          padding: '10px 12px',
          borderRadius: 12,
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
          <input
            type="text"
            placeholder="Search by Flat or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Wing Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(['ALL', 'A', 'B', 'C'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWingFilter(w)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: wingFilter === w ? '#ea580c' : '#ffffff',
                color: wingFilter === w ? '#ffffff' : '#475569',
                boxShadow: wingFilter === w ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none',
              }}
            >
              {w === 'ALL' ? 'All Wings' : `Wing ${w}`}
            </button>
          ))}
        </div>

        {/* Dietary Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setDietFilter('ALL')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: dietFilter === 'ALL' ? '#0f172a' : '#ffffff',
              color: dietFilter === 'ALL' ? '#ffffff' : '#64748b',
            }}
          >
            All Diets
          </button>
          <button
            onClick={() => setDietFilter('REGULAR')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: dietFilter === 'REGULAR' ? '#059669' : '#ffffff',
              color: dietFilter === 'REGULAR' ? '#ffffff' : '#64748b',
            }}
          >
            Satvik
          </button>
          <button
            onClick={() => setDietFilter('JAIN')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: dietFilter === 'JAIN' ? '#ca8a04' : '#ffffff',
              color: dietFilter === 'JAIN' ? '#ffffff' : '#64748b',
            }}
          >
            🥗 Jain
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Flat</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Devotee / Family</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569', textAlign: 'center' }}>Headcount</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Dietary</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Time Slot</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Volunteer</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No RSVPs found matching your search. Click "+ Add Family RSVP" to register!
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr
                  key={r.id || idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Flat Badge */}
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        color: '#9a3412',
                        fontWeight: 900,
                        fontSize: 13,
                        padding: '3px 8px',
                        borderRadius: 6,
                        display: 'inline-block',
                      }}
                    >
                      {r.flatNumber}
                    </span>
                  </td>

                  {/* Devotee Name & Phone */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                      {r.residentName}
                    </div>
                    {r.phone && (
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                        📞 {r.phone}
                      </div>
                    )}
                    {r.notes && (
                      <div style={{ fontSize: 11, color: '#b45309', fontStyle: 'italic', marginTop: 2 }}>
                        Note: {r.notes}
                      </div>
                    )}
                  </td>

                  {/* Headcount */}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#1e293b',
                        fontWeight: 900,
                        fontSize: 14,
                        padding: '3px 10px',
                        borderRadius: 20,
                        display: 'inline-block',
                      }}
                    >
                      {r.totalHeadcount}
                    </span>
                    <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                      {r.adultsCount}A + {r.childrenCount}K
                    </div>
                  </td>

                  {/* Dietary Badge */}
                  <td style={{ padding: '10px 12px' }}>
                    {r.dietaryPreference === 'JAIN' ? (
                      <span
                        style={{
                          background: '#fefce8',
                          color: '#854d0e',
                          border: '1px solid #fde047',
                          fontWeight: 700,
                          fontSize: 11.5,
                          padding: '2px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        🥗 Jain
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          fontWeight: 700,
                          fontSize: 11.5,
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        🍲 Satvik
                      </span>
                    )}
                  </td>

                  {/* Time Slot */}
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    {r.timeSlot || '8:00 PM - 10:00 PM'}
                  </td>

                  {/* Volunteer Badge */}
                  <td style={{ padding: '10px 12px' }}>
                    {r.isVolunteering ? (
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <HeartHandshake size={12} /> Helper
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => onViewPass(r)}
                        title="View & Share Pass"
                        style={{
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          borderRadius: 6,
                          padding: '4px 8px',
                          color: '#c2410c',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        <Eye size={12} />
                        <span>Pass</span>
                      </button>

                      <button
                        onClick={() => onDownloadSinglePDF(r)}
                        title="Download Pass PDF"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 6px',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={13} />
                      </button>

                      <button
                        onClick={() => onEdit(r)}
                        title="Edit RSVP"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 6px',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => onDelete(r.id, r.flatNumber)}
                        title="Remove RSVP"
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 6,
                          padding: '4px 6px',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
