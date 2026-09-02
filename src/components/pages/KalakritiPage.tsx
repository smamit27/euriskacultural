import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Check,
  Filter,
  Sparkles,
  Download,
  Trash2,
  Edit2,
  Users,
  Database,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  kalakritiService,
  KALAKRITI_ACTIVITIES,
} from '../../services/kalakritiService';
import { pdfService } from '../../services/pdfService';
import { RegisterKalakritiModal } from '../kalakriti/RegisterKalakritiModal';
import { useToast } from '../../context/ToastContext';
import type { KalakritiEntry, KalakritiActivityKey } from '../../types';

export const KalakritiPage: React.FC = () => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<KalakritiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<KalakritiActivityKey | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KalakritiEntry | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickFlat, setQuickFlat] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [activityCounts, setActivityCounts] = useState<Record<KalakritiActivityKey, number>>({
    drawing: 0,
    skit1: 0,
    skit2: 0,
    dance: 0,
    fashionShow: 0,
    mimicry: 0,
    singing: 0,
    fancyDress: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Clean up old static test key if present
      localStorage.removeItem('euriska_kalakriti_entries');
      const list = await kalakritiService.getEntries();
      setEntries(list);
      const counts = await kalakritiService.getActivityCounts();
      setActivityCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEntry = async (data: Omit<KalakritiEntry, 'id' | 'sn' | 'createdAt'>) => {
    if (editingEntry) {
      await kalakritiService.updateEntry(editingEntry.id, data);
      showToast('✅ Kalakriti entry updated & saved!', 'success');
      setEditingEntry(null);
    } else {
      await kalakritiService.addEntry(data);
      showToast('🎉 Participant registered & saved to database!', 'success');
    }
    loadData();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    await kalakritiService.addEntry({
      name: quickName.trim(),
      flatNumber: quickFlat.trim() || undefined,
      drawing: false,
      skit1: false,
      skit2: false,
      dance: false,
      fashionShow: false,
      mimicry: false,
      singing: false,
      fancyDress: false,
    });

    setQuickName('');
    setQuickFlat('');
    showToast(`✅ ${quickName.trim()} added! Tap columns to check activities.`, 'success');
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      await kalakritiService.deleteEntry(id);
      showToast('Entry removed from database.', 'info');
      loadData();
    }
  };

  const handleToggleCell = async (id: string, actKey: KalakritiActivityKey) => {
    await kalakritiService.toggleActivity(id, actKey);
    loadData();
  };

  // Filtered list
  const filteredEntries = entries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.flatNumber && item.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedActivity === 'ALL') return true;
    return item[selectedActivity] === true;
  });

  const exportCSV = () => {
    if (entries.length === 0) {
      showToast('No entries to export yet.', 'info');
      return;
    }
    const headers = ['S.N', 'Name', 'Flat', 'Drawing', 'Skit 1', 'Skit 2', 'Dance', 'Fashion Show', 'Mimicry', 'Singing', 'Fancy Dress'];
    const rows = entries.map((e) => [
      e.sn,
      `"${e.name}"`,
      `"${e.flatNumber || ''}"`,
      e.drawing ? 'YES' : 'NO',
      e.skit1 ? 'YES' : 'NO',
      e.skit2 ? 'YES' : 'NO',
      e.dance ? 'YES' : 'NO',
      e.fashionShow ? 'YES' : 'NO',
      e.mimicry ? 'YES' : 'NO',
      e.singing ? 'YES' : 'NO',
      e.fancyDress ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Euriska_Kalakriti_Participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 CSV downloaded successfully!', 'success');
  };

  const exportPDF = () => {
    if (entries.length === 0) {
      showToast('No entries to export yet.', 'info');
      return;
    }
    try {
      pdfService.exportKalakritiPDF(entries);
      showToast('📄 Kalakriti PDF downloaded successfully!', 'success');
    } catch {
      showToast('Failed to generate Kalakriti PDF.', 'error');
    }
  };

  return (
    <div style={{ padding: '0 14px 24px' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #c026d3, #ea580c)',
          borderRadius: 20,
          padding: '20px 18px',
          color: '#fff',
          marginBottom: 16,
          boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            <Sparkles size={13} color="#fed7aa" />
            <span>Euriska Talent &amp; Cultural Activity Hub</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '2px 0 6px', letterSpacing: -0.5 }}>
            🎨 KALAKRITI
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.4 }}>
            Community talent participation matrix. Feed participant entries across Drawing, Skit 1, Skit 2, Dance, Fashion Show, Mimicry, Singing &amp; Fancy Dress.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>
              <Users size={16} />
              <span>{entries.length} Participants</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.3)', borderRadius: 12, padding: '6px 12px', fontSize: 12, fontWeight: 800 }}>
              <Database size={14} color="#a7f3d0" />
              <span>Live Database Connected</span>
            </div>

            <button
              onClick={() => {
                setEditingEntry(null);
                setIsModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                color: '#7c3aed',
                border: 'none',
                borderRadius: 12,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Plus size={16} />
              <span>+ Add Entry Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Row Toggle */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          style={{
            background: showQuickAdd ? '#ede9fe' : '#f8fafc',
            border: '1.5px solid #cbd5e1',
            color: showQuickAdd ? '#6d28d9' : '#475569',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>⚡ Fast Inline Add</span>
          <span>{showQuickAdd ? '▲' : '▼'}</span>
        </button>

        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          💡 Tip: Tap any activity cell in the table to toggle ✅ / —
        </span>
      </div>

      {/* Quick Add Form Box */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAdd}
          style={{
            background: '#ffffff',
            border: '1.5px solid #7c3aed30',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 14,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
          }}
        >
          <input
            type="text"
            required
            placeholder="Participant Name *"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            style={{
              flex: '2 1 160px',
              height: 38,
              padding: '0 12px',
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Flat (e.g. A-101)"
            value={quickFlat}
            onChange={(e) => setQuickFlat(e.target.value)}
            style={{
              flex: '1 1 100px',
              height: 38,
              padding: '0 12px',
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!quickName.trim()}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              background: quickName.trim() ? '#7c3aed' : '#cbd5e1',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              cursor: quickName.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            + Add Row
          </button>
        </form>
      )}

      {/* Activity Count Pills / Quick Filter */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={13} />
          <span>FILTER BY ACTIVITY ({entries.length} Total Registered)</span>
        </div>
        <div
          className="horizontal-scroll-container"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
        >
          <button
            onClick={() => setSelectedActivity('ALL')}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 20,
              border: selectedActivity === 'ALL' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              background: selectedActivity === 'ALL' ? '#7c3aed' : '#ffffff',
              color: selectedActivity === 'ALL' ? '#ffffff' : '#334155',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            All ({entries.length})
          </button>
          {KALAKRITI_ACTIVITIES.map((act) => {
            const count = activityCounts[act.key] || 0;
            const isSelected = selectedActivity === act.key;
            return (
              <button
                key={act.key}
                onClick={() => setSelectedActivity(act.key)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: isSelected ? `2px solid ${act.color}` : '1px solid #e2e8f0',
                  background: isSelected ? act.color : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <span>{act.emoji}</span>
                <span>{act.label}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : act.badgeBg,
                    color: isSelected ? '#fff' : act.color,
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Search participant or flat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 12,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={exportPDF}
          title="Download Printable PDF Report"
          style={{
            height: 40,
            padding: '0 12px',
            borderRadius: 12,
            border: '1.5px solid #fed7aa',
            background: '#fff7ed',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <FileText size={15} />
          <span>Export PDF</span>
        </button>

        <button
          onClick={exportCSV}
          title="Download Excel / CSV"
          style={{
            height: 40,
            padding: '0 12px',
            borderRadius: 12,
            border: '1.5px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Kalakriti Table View */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              textAlign: 'left',
              minWidth: 780,
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 10px', fontWeight: 900, color: '#475569', width: 50, textAlign: 'center' }}>
                  S.N
                </th>
                <th
                  style={{
                    padding: '12px 14px',
                    fontWeight: 900,
                    color: '#0f172a',
                    minWidth: 150,
                    position: 'sticky',
                    left: 0,
                    background: '#f8fafc',
                    zIndex: 2,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.03)',
                  }}
                >
                  Name
                </th>
                {KALAKRITI_ACTIVITIES.map((act) => (
                  <th
                    key={act.key}
                    style={{
                      padding: '12px 8px',
                      fontWeight: 800,
                      color: act.color,
                      textAlign: 'center',
                      minWidth: 75,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{act.emoji}</div>
                    <div style={{ fontSize: 11 }}>{act.shortLabel}</div>
                  </th>
                ))}
                <th style={{ padding: '12px 10px', fontWeight: 800, color: '#64748b', textAlign: 'center', width: 70 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>⏳</div>
                    <div style={{ fontWeight: 800 }}>Loading Kalakriti entries...</div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
                    <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16, marginBottom: 4 }}>
                      No participants entered yet
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', maxWidth: 360, margin: '0 auto 16px' }}>
                      Ready for your data! Add participants using the button below or the <strong>Fast Inline Add</strong> bar.
                    </div>
                    <button
                      onClick={() => {
                        setEditingEntry(null);
                        setIsModalOpen(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                      }}
                    >
                      + Add First Participant
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* S.N */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                      {entry.sn}
                    </td>

                    {/* Name & Flat (Sticky Column) */}
                    <td
                      style={{
                        padding: '10px 14px',
                        position: 'sticky',
                        left: 0,
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        zIndex: 1,
                        boxShadow: '2px 0 5px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{entry.name}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                        {entry.flatNumber && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#ea580c',
                              background: '#fff7ed',
                              padding: '1px 6px',
                              borderRadius: 6,
                            }}
                          >
                            {entry.flatNumber}
                          </span>
                        )}
                        {entry.ageGroup && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#64748b',
                            }}
                          >
                            {entry.ageGroup}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Activity Columns — Clickable to toggle */}
                    {KALAKRITI_ACTIVITIES.map((act) => {
                      const isChecked = entry[act.key];
                      return (
                        <td
                          key={act.key}
                          onClick={() => handleToggleCell(entry.id, act.key)}
                          title={`Tap to toggle ${act.label}`}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          {isChecked ? (
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: act.badgeBg,
                                color: act.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                margin: '0 auto',
                                transition: 'transform 0.1s',
                              }}
                            >
                              <Check size={16} strokeWidth={3} />
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 16 }}>—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsModalOpen(true);
                          }}
                          title="Edit"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: 4,
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.name)}
                          title="Delete"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: 4,
                          }}
                        >
                          <Trash2 size={14} />
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

      {/* Footer Info / Registration Prompt */}
      <div
        style={{
          marginTop: 16,
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Realtime Storage Active</span>
          </div>
          <div style={{ fontSize: 12, color: '#c2410c' }}>
            All participant registrations are saved directly to Cloud Firestore &amp; synchronized instantly.
          </div>
        </div>
        <button
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          + Add Entry Form
        </button>
      </div>

      {/* Registration / Edit Modal */}
      <RegisterKalakritiModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialData={editingEntry}
      />
    </div>
  );
};
