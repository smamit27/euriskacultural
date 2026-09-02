import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Trash2, FileText, HeartHandshake, Eye, Camera, CheckCircle2, RotateCcw } from 'lucide-react';
import type { MahaPrasadRSVP } from '../../types';

interface RSVPTableProps {
  rsvps: MahaPrasadRSVP[];
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onToggleRedeem: (rsvp: MahaPrasadRSVP) => void;
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
  onOpenScanner,
  onToggleRedeem,
  onEdit,
  onDelete,
  onViewPass,
  onDownloadSinglePDF,
  onExportCSV,
  onExportRosterPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wingFilter, setWingFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [checkInFilter, setCheckInFilter] = useState<'ALL' | 'ACTIVE' | 'REDEEMED'>('ALL');
  const [volunteerOnly, setVolunteerOnly] = useState(false);

  const filtered = rsvps.filter((item) => {
    const matchesSearch =
      item.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm));

    const matchesWing =
      wingFilter === 'ALL' ||
      item.buildingId === wingFilter ||
      item.flatNumber.startsWith(`${wingFilter}-`);

    const matchesVolunteer = !volunteerOnly || Boolean(item.isVolunteering);

    const matchesCheckIn =
      checkInFilter === 'ALL' ||
      (checkInFilter === 'REDEEMED' && Boolean(item.isRedeemed)) ||
      (checkInFilter === 'ACTIVE' && !item.isRedeemed);

    return matchesSearch && matchesWing && matchesVolunteer && matchesCheckIn;
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
            Real-time Maha Prasad headcount, QR pass generator &amp; gate check-in tracker
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenScanner}
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 15px',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Camera size={16} color="#fb923c" />
            <span>📷 Scan Devotee QR Pass</span>
          </button>

          <button
            onClick={onOpenAddModal}
            style={{
              background: 'linear-gradient(135deg, #c2410c, #ea580c)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 14px',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add Family RSVP</span>
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
            <span>Roster PDF</span>
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

        {/* Check-In Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setCheckInFilter('ALL')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: checkInFilter === 'ALL' ? '#0f172a' : '#ffffff',
              color: checkInFilter === 'ALL' ? '#ffffff' : '#64748b',
            }}
          >
            All Status
          </button>
          <button
            onClick={() => setCheckInFilter('ACTIVE')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: checkInFilter === 'ACTIVE' ? '#16a34a' : '#ffffff',
              color: checkInFilter === 'ACTIVE' ? '#ffffff' : '#64748b',
            }}
          >
            🟢 Unscanned
          </button>
          <button
            onClick={() => setCheckInFilter('REDEEMED')}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: checkInFilter === 'REDEEMED' ? '#dc2626' : '#ffffff',
              color: checkInFilter === 'REDEEMED' ? '#ffffff' : '#64748b',
            }}
          >
            🔴 Checked In
          </button>
        </div>

        {/* Volunteer Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setVolunteerOnly(false)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: !volunteerOnly ? '#0f172a' : '#ffffff',
              color: !volunteerOnly ? '#ffffff' : '#64748b',
            }}
          >
            All Devotees
          </button>
          <button
            onClick={() => setVolunteerOnly(true)}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              background: volunteerOnly ? '#2563eb' : '#ffffff',
              color: volunteerOnly ? '#ffffff' : '#64748b',
            }}
          >
            🙋‍♂️ Volunteers
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
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Feast Type</th>
              <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Gate Status</th>
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

                  {/* Feast Type Badge */}
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        fontWeight: 700,
                        fontSize: 11.5,
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      🍲 Satvik Maha Prasad
                    </span>
                  </td>

                  {/* Gate Status Cell */}
                  <td style={{ padding: '10px 12px' }}>
                    {r.isRedeemed ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fca5a5',
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '3px 7px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <CheckCircle2 size={12} color="#dc2626" />
                          <span>Redeemed</span>
                        </span>
                        <button
                          onClick={() => onToggleRedeem(r)}
                          title="Undo / Reset Check-In"
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            padding: '2px 5px',
                            color: '#64748b',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <RotateCcw size={10} />
                          <span>Undo</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onToggleRedeem(r)}
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #86efac',
                          fontWeight: 800,
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <span>🟢 Check In</span>
                      </button>
                    )}
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
