import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Lock, Unlock, Search,
  Download, CheckCircle2, Clock
} from 'lucide-react';
import { demographicsService, type DemographicResident, type CommunityBreakdown } from '../../services/demographicsService';
import { useToast } from '../../context/ToastContext';

export const DemographicsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Data state
  const [residents, setResidents] = useState<DemographicResident[]>([]);
  const [summary, setSummary] = useState<CommunityBreakdown[]>([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  // Filters
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (demographicsService.isSessionAuthenticated()) {
      setIsAuthenticated(true);
      loadData('ALL');
    }
  }, []);

  const loadData = async (wing: string) => {
    try {
      const allResidents = await demographicsService.getDemographicResidents();
      setResidents(allResidents);

      const sumData = await demographicsService.getCommunitySummary(wing);
      setSummary(sumData.breakdown);
      setTotalResidents(sumData.totalResidents);
      setTotalPaid(sumData.totalPaid);
    } catch (err) {
      console.error(err);
      showToast('Failed to load demographic data.', 'error');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demographicsService.verifyPasskey(passkeyInput)) {
      demographicsService.authenticateSession();
      setIsAuthenticated(true);
      setAuthError('');
      showToast('🔒 Confidential Portal unlocked successfully.', 'success');
      loadData(selectedWing);
    } else {
      setAuthError('Access Denied: Invalid confidential passkey.');
      showToast('Incorrect passkey.', 'error');
    }
  };

  const handleLock = () => {
    demographicsService.lockSession();
    setIsAuthenticated(false);
    setPasskeyInput('');
    showToast('Portal locked securely.', 'info');
  };

  const handleWingChange = (wing: string) => {
    setSelectedWing(wing);
    loadData(wing);
  };

  // Filtered residents
  const filteredResidents = residents.filter((r) => {
    if (selectedWing !== 'ALL' && r.buildingId !== selectedWing) return false;
    if (selectedCommunity !== 'ALL' && r.community !== selectedCommunity) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      return r.flatNumber.toLowerCase().includes(q) || r.residentName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Wing', 'Flat Number', 'Resident Name', 'Community', 'Status', 'Paid Amount (INR)'];
    const rows = filteredResidents.map((r) => [
      `Wing ${r.buildingId}`,
      r.flatNumber,
      `"${r.residentName.replace(/"/g, '""')}"`,
      r.community,
      r.status,
      r.amount,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Euriska_Confidential_Demographics_${selectedWing}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSV exported successfully.', 'success');
  };

  // 1. Password Protection Gate Screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            background: '#ffffff',
            borderRadius: 24,
            padding: '36px 28px',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.15)',
            border: '1.5px solid #fee2e2',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.2)',
            }}
          >
            <Lock size={32} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: 11,
              fontWeight: 900,
              padding: '4px 12px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}
          >
            <ShieldAlert size={14} /> Strictly Confidential
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
            Executive Demographics
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            This section contains sensitive society community &amp; cultural data. Enter the confidential access passkey to proceed.
          </p>

          <form onSubmit={handleAuthSubmit}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter confidential passkey"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: authError ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: 15,
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {authError && (
                <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                  {authError}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
              }}
            >
              <Unlock size={16} />
              <span>Unlock Confidential Portal</span>
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 11.5, color: '#94a3b8' }}>
            Authorized Committee &amp; Chairman Access Only
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Confidential Portal View
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 16px 40px 16px' }}>
      {/* Confidential Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 24,
          padding: '24px 22px',
          color: '#ffffff',
          marginBottom: 20,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldAlert size={12} /> Confidential • Committee Eyes Only
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                Passkey Authenticated
              </span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Society Community &amp; Demographic Roster
            </h1>
            <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>
              Multi-community resident participation &amp; cultural background breakdown for Euriska Housing Society.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Download size={15} color="#38bdf8" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLock}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Lock size={15} />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {summary.map((item) => (
          <div
            key={item.community}
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1.5px solid ${item.color}25`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span> {item.label}
                </span>
                <span
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                    fontWeight: 900,
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {item.percentage}% of Society
                </span>
              </div>

              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                {item.totalFlats}{' '}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Flats</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ color: '#059669' }}>🟢 Paid: {item.paidFlats}</span>
              <span style={{ color: '#d97706' }}>⏳ Pending: {item.pendingFlats}</span>
              <span style={{ color: '#0f172a' }}>₹{item.totalCollected.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Diversity Distribution Visual Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
            Overall Society Composition ({totalResidents} Total Residential Flats)
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
            Total Paid: {totalPaid} ({totalResidents > 0 ? Math.round((totalPaid / totalResidents) * 100) : 0}%)
          </span>
        </div>

        {/* Multi-segment Bar */}
        <div
          style={{
            height: 14,
            borderRadius: 8,
            display: 'flex',
            overflow: 'hidden',
            background: '#f1f5f9',
          }}
        >
          {summary.map((item) => (
            <div
              key={item.community}
              title={`${item.label}: ${item.totalFlats} flats (${item.percentage}%)`}
              style={{
                width: `${item.percentage}%`,
                background: item.color,
                transition: 'width 0.4s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
          {summary.map((item) => (
            <div key={item.community} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
              <span style={{ color: '#334155' }}>
                {item.icon} {item.label}: <strong>{item.totalFlats}</strong> ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {/* Top Filter Buttons & Search */}
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
          {/* Wing Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#f8fafc', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            {['ALL', 'A', 'B', 'C'].map((w) => (
              <button
                key={w}
                onClick={() => handleWingChange(w)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedWing === w ? '#0f172a' : 'transparent',
                  color: selectedWing === w ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                {w === 'ALL' ? 'All Wings' : `Wing ${w}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search flat or name..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Secondary Filter Pills (Community & Status) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Community:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HINDU', label: '🪔 Hindu' },
              { id: 'MUSLIM', label: '🕌 Muslim' },
              { id: 'CHRISTIAN', label: '⛪ Christian' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommunity(c.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: selectedCommunity === c.id ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                  background: selectedCommunity === c.id ? '#0f172a' : '#ffffff',
                  color: selectedCommunity === c.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PAID', label: '🟢 Paid' },
              { id: 'PENDING', label: '⏳ Pending' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: selectedStatus === s.id ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                  background: selectedStatus === s.id ? '#0f172a' : '#ffffff',
                  color: selectedStatus === s.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resident Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Flat</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Wing</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Resident / Family Name</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Community Category</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155' }}>Ganeshotsav Contribution</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, color: '#334155', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                    No resident records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r, idx) => {
                  const commBadge =
                    r.community === 'HINDU'
                      ? { label: '🪔 Hindu', color: '#ea580c', bg: '#fff7ed' }
                      : r.community === 'MUSLIM'
                      ? { label: '🕌 Muslim', color: '#059669', bg: '#ecfdf5' }
                      : { label: '⛪ Christian', color: '#2563eb', bg: '#eff6ff' };

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {r.flatNumber}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#64748b' }}>
                        Wing {r.buildingId}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                        {r.residentName}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            background: commBadge.bg,
                            color: commBadge.color,
                            fontSize: 12,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 14,
                            border: `1px solid ${commBadge.color}30`,
                          }}
                        >
                          {commBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {r.status === 'PAID' ? (
                          <span style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Paid
                          </span>
                        ) : (
                          <span style={{ color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {r.status === 'PAID' ? `₹${r.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          <span>Showing {filteredResidents.length} of {residents.length} residents</span>
          <span>Confidential Data • Protected under Euriska Society Bye-Laws</span>
        </div>
      </div>
    </div>
  );
};
