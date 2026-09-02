import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, FileText } from 'lucide-react';
import { BuildingSelector } from '../contributions/BuildingSelector';
import { BuildingSummary } from '../contributions/BuildingSummary';
import { ContributionCard } from '../contributions/ContributionCard';
import { MarkPaidSheet } from '../contributions/MarkPaidSheet';
import { AddContributionSheet } from '../contributions/AddContributionSheet';
import { contributionService } from '../../services/contributionService';
import { pdfService } from '../../services/pdfService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Contribution, Building } from '../../types';

export const ContributionsPage: React.FC = () => {
  const { isAdmin, isTreasurer } = useAuth();
  const { showToast } = useToast();

  const [selectedBuilding, setSelectedBuilding] = useState('A');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [markPaidTarget, setMarkPaidTarget] = useState<Contribution | null>(null);
  const [editTarget, setEditTarget] = useState<Contribution | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contribution | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [contribs, bldgs] = await Promise.all([
      contributionService.getContributions({
        buildingId: selectedBuilding,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
      }),
      contributionService.getBuildingSummaries(),
    ]);
    setContributions(contribs);
    setBuildings(bldgs);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [selectedBuilding, statusFilter, search, isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
          Admin Access Only
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', maxWidth: 320, margin: '0 auto 16px', lineHeight: 1.5 }}>
          Society contributions and collection sheets are restricted to authorized Committee Admins &amp; Treasurers.
        </p>
      </div>
    );
  }

  const currentBuilding = buildings.find((b) => b.buildingId === selectedBuilding);
  const totalCollected = buildings.reduce((sum, b) => sum + (b.collectedAmount || 0), 0);
  const totalPending = buildings.reduce((sum, b) => sum + (b.pendingAmount || 0), 0);

  const handleMarkPaid = async (id: string, data: any) => {
    try {
      await contributionService.markAsPaid(id, data);
      showToast('✅ Contribution marked as paid!', 'success');
      loadData();
    } catch {
      showToast('Failed to update contribution.', 'error');
    }
  };

  const handleSaveContribution = async (data: any) => {
    try {
      if (editTarget) {
        await contributionService.updateContribution(editTarget.id, data);
        showToast('Contribution updated.', 'success');
      } else {
        await contributionService.addContribution({ ...data, eventId: 'EURISKA-CULTURAL-2026' });
        showToast('✅ Contribution added!', 'success');
      }
      setEditTarget(null);
      setShowAddSheet(false);
      loadData();
    } catch {
      showToast('Failed to save contribution.', 'error');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    try {
      const success = await contributionService.deleteContribution(id);
      if (success) {
        showToast('🗑️ Contribution deleted.', 'success');
        setDeleteTarget(null);
        loadData();
      } else {
        showToast('Failed to delete contribution.', 'error');
      }
    } catch {
      showToast('Failed to delete contribution.', 'error');
    }
  };

  return (
    <div>
      {/* Building Selector (always visible) */}
      <BuildingSelector
        selectedBuilding={selectedBuilding}
        onSelectBuilding={setSelectedBuilding}
      />

      {/* Building Summary Card */}
      <BuildingSummary
        building={currentBuilding}
        totalCollected={totalCollected}
        totalPending={totalPending}
        selectedBuilding={selectedBuilding}
      />

      {/* Search */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="🔍 Search flat number or resident name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

        {/* Status Filter Chips */}
        <div className="filter-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          {(['ALL', 'PAID', 'PENDING'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            >
              {s === 'ALL' ? '📋 All' : s === 'PAID' ? '✅ Paid' : '⏳ Pending'}
            </button>
          ))}

          <button
            onClick={() => {
              try {
                pdfService.exportContributionsPDF(contributions);
                showToast('📄 Contributions PDF report downloaded!', 'success');
              } catch {
                showToast('Failed to generate PDF.', 'error');
              }
            }}
            className="filter-chip"
            style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 800 }}
            title="Download Printable PDF Report"
          >
            <FileText size={13} /> Export PDF
          </button>

          {isTreasurer && (
            <button
              onClick={() => setShowAddSheet(true)}
              className="filter-chip"
              style={{ marginLeft: 'auto', background: '#fff7ed', borderColor: '#fed7aa', color: '#c2410c' }}
            >
              <PlusCircle size={13} /> Add New
            </button>
          )}
        </div>

      {/* Results count */}
      <div style={{ padding: '4px 14px 8px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
        {loading ? 'Loading...' : `${contributions.length} residents`}
      </div>

      {/* Contribution Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>Loading contributions...</div>
      ) : contributions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>No contributions found</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try a different filter or building</div>
        </div>
      ) : (
        <div className="contribution-card-list">
          {contributions.map((c) => (
            <ContributionCard
              key={c.id}
              contribution={c}
              onMarkPaid={(contrib) => setMarkPaidTarget(contrib)}
              onEdit={(contrib) => { setEditTarget(contrib); setShowAddSheet(true); }}
              onDelete={(contrib) => setDeleteTarget(contrib)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Mark Paid Sheet */}
      <MarkPaidSheet
        isOpen={!!markPaidTarget}
        onClose={() => setMarkPaidTarget(null)}
        contribution={markPaidTarget}
        onConfirm={handleMarkPaid}
      />

      {/* Add/Edit Contribution Sheet */}
      <AddContributionSheet
        isOpen={showAddSheet}
        onClose={() => { setShowAddSheet(false); setEditTarget(null); }}
        initialContribution={editTarget}
        onSave={handleSaveContribution}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 320,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Delete Contribution?
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              Are you sure you want to delete the contribution from {deleteTarget.residentName}
              {deleteTarget.flatNumber && ` (${deleteTarget.flatNumber})`}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-sm btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContribution(deleteTarget.id)}
                className="btn btn-sm btn-danger"
                style={{ flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
