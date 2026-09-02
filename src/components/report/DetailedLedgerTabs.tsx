import React, { useState, useMemo } from 'react';
import {
  Search, IndianRupee, Receipt, Building2, Target, BarChart2,
  CheckCircle2, Clock, Plus, Trash2, ExternalLink
} from 'lucide-react';
import type { Contribution, Expense, Building, FinancialReportData } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DetailedLedgerTabsProps {
  contributions: Contribution[];
  expenses: Expense[];
  buildings: Building[];
  reportData: FinancialReportData;
  onAddContribution?: () => void;
  onAddExpense?: () => void;
  onMarkPaid?: (contribution: Contribution) => void;
  onDeleteExpense?: (id: string) => void;
  onDeleteContribution?: (id: string) => void;
  onRefresh?: () => void;
}

type TabKey = 'contributions' | 'expenses' | 'buildings' | 'budget' | 'summary';

export const DetailedLedgerTabs: React.FC<DetailedLedgerTabsProps> = ({
  contributions,
  expenses,
  buildings,
  reportData,
  onAddContribution,
  onAddExpense,
  onMarkPaid,
  onDeleteExpense,
  onDeleteContribution,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('contributions');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Filtered Contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      if (buildingFilter !== 'ALL' && c.buildingId !== buildingFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (modeFilter !== 'ALL' && c.paymentMode !== modeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchFlat = c.flatNumber.toLowerCase().includes(q);
        const matchName = c.residentName.toLowerCase().includes(q);
        const matchReceipt = c.receiptNumber?.toLowerCase().includes(q);
        return matchFlat || matchName || matchReceipt;
      }
      return true;
    });
  }, [contributions, buildingFilter, statusFilter, modeFilter, searchQuery]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && e.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (modeFilter !== 'ALL' && e.paymentMode !== modeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchVendor = e.vendor.toLowerCase().includes(q);
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchCat = e.category.toLowerCase().includes(q);
        return matchVendor || matchDesc || matchCat;
      }
      return true;
    });
  }, [expenses, statusFilter, categoryFilter, modeFilter, searchQuery]);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      padding: '20px 18px',
      marginBottom: 24,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }}>
      {/* Tab Navigation Pill Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 8,
        marginBottom: 16,
        borderBottom: '1px solid #e2e8f0',
      }}>
        {[
          { key: 'contributions', label: `Contributions (${contributions.length})`, icon: <IndianRupee size={15} /> },
          { key: 'expenses', label: `Expenses (${expenses.length})`, icon: <Receipt size={15} /> },
          { key: 'buildings', label: 'Building Report', icon: <Building2 size={15} /> },
          { key: 'budget', label: 'Budget vs Actual', icon: <Target size={15} /> },
          { key: 'summary', label: 'Full Financial Statement', icon: <BarChart2 size={15} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as TabKey);
                setSearchQuery('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#ffffff' : '#475569',
                background: isActive ? '#0f172a' : '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. CONTRIBUTIONS TAB */}
      {activeTab === 'contributions' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search flat (e.g. A-304) or resident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                }}
              />
            </div>

            {/* Wing Filter */}
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              <option value="ALL">All Buildings</option>
              <option value="A">A Building</option>
              <option value="B">B Building</option>
              <option value="C">C Building</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending Only</option>
            </select>

            {/* Payment Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              <option value="ALL">All Modes</option>
              <option value="ONLINE">UPI / Online</option>
              <option value="CASH">Cash</option>
            </select>

            {isAdmin && onAddContribution && (
              <button
                onClick={onAddContribution}
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 'auto',
                }}
              >
                <Plus size={14} />
                <span>Add Record</span>
              </button>
            )}
          </div>

          {/* Ledger Table */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600, fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Flat</th>
                  <th style={{ padding: '10px 12px' }}>Resident Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Mode</th>
                  <th style={{ padding: '10px 12px' }}>Receipt / Date</th>
                  {isAdmin && <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                      No matching contribution records found.
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((c, idx) => {
                    const isPaid = c.status === 'PAID';
                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                          {c.flatNumber}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                          {c.residentName}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: isPaid ? '#059669' : '#d97706' }}>
                          ₹{(isPaid ? c.paidAmount : (c.expectedAmount || 1500)).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: isPaid ? '#ecfdf5' : '#fffbeb',
                            color: isPaid ? '#047857' : '#b45309',
                            border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                          }}>
                            {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            <span>{c.status}</span>
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase' }}>
                          {isPaid ? c.paymentMode || 'ONLINE' : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11 }}>
                          {isPaid ? (
                            <div>
                              <div>{c.receiptNumber || 'REC-2026'}</div>
                              <div style={{ color: '#94a3b8' }}>{c.paymentDate || '2026-08-30'}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Pending</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              {!isPaid && onMarkPaid && (
                                <button
                                  onClick={() => onMarkPaid(c)}
                                  style={{
                                    background: '#dcfce7',
                                    border: '1px solid #86efac',
                                    color: '#059669',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Mark Paid
                                </button>
                              )}
                              {onDeleteContribution && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete contribution record for ${c.flatNumber}?`)) {
                                      onDeleteContribution(c.id);
                                    }
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: 2,
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search vendor or expense description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Cultural Program">Cultural Program</option>
              <option value="Prasad / Food">Prasad / Food</option>
              <option value="Decoration & Lighting">Decoration & Lighting</option>
              <option value="Sound System">Sound System</option>
              <option value="Printing & Publicity">Printing & Publicity</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              <option value="ALL">All Modes</option>
              <option value="ONLINE">UPI / Online</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque / Bank</option>
            </select>

            {isAdmin && onAddExpense && (
              <button
                onClick={onAddExpense}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 'auto',
                }}
              >
                <Plus size={14} />
                <span>Add Expense</span>
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620, fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px' }}>Vendor & Description</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Mode</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Receipt</th>
                  {isAdmin && <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                      No matching expenses found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e, idx) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                        {e.expenseDate}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '2px 7px',
                          borderRadius: 6,
                          color: '#334155',
                          whiteSpace: 'nowrap',
                        }}>
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{e.vendor}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{e.description}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>
                        ₹{(e.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>
                        {e.paymentMode}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {e.billUrl ? (
                          <a
                            href={e.billUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#2563eb',
                              fontSize: 11,
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <span>Bill</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 11 }}>N/A</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {onDeleteExpense && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete expense "${e.description}"?`)) {
                                  onDeleteExpense(e.id);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: 2,
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BUILDING REPORT TAB */}
      {activeTab === 'buildings' && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Building Wing Deep Comparison (A vs B vs C)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
            {buildings.map((b) => {
              const target = b.targetAmount || b.totalFlats * 1500;
              const collected = b.collectedAmount || 0;
              const pending = b.pendingAmount || Math.max(0, target - collected);
              const pct = target > 0 ? Math.round((collected / target) * 100) : 0;
              return (
                <div
                  key={b.buildingId}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{b.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: pct >= 85 ? '#059669' : '#d97706' }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    <div><strong>Total Flats:</strong> {b.totalFlats}</div>
                    <div><strong>Paid Flats:</strong> {b.paidFlatsCount || 0} ({pct}%)</div>
                    <div><strong>Pending Flats:</strong> {b.pendingFlatsCount || 0}</div>
                    <div><strong>Collected:</strong> ₹{collected.toLocaleString('en-IN')}</div>
                    <div><strong>Pending:</strong> ₹{pending.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. BUDGET TAB */}
      {activeTab === 'budget' && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Category Variance & Utilization Analysis
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500, fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Budget Target</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actual Spent</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Variance</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.categoryExpenses.map((c, idx) => (
                  <tr key={c.category} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{c.category}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>₹{c.budget.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{c.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: c.difference >= 0 ? '#059669' : '#dc2626' }}>
                      {c.difference >= 0 ? `+₹${c.difference.toLocaleString('en-IN')}` : `-₹${Math.abs(c.difference).toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: c.isOverBudget ? '#fef2f2' : '#ecfdf5',
                        color: c.isOverBudget ? '#dc2626' : '#047857',
                        border: `1px solid ${c.isOverBudget ? '#fecaca' : '#a7f3d0'}`,
                      }}>
                        {c.isOverBudget ? 'Over Budget' : 'Under Budget'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUMMARY STATEMENT TAB */}
      {activeTab === 'summary' && (
        <div style={{ padding: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            Executive Financial Statement (Euriska Cultural 2026–27)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Resident Contribution</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', marginTop: 4 }}>₹{reportData.totalCollected.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{reportData.paidFlatsCount} of {reportData.totalFlats} Flats Paid</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Other Income / Sponsors</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#d97706', marginTop: 4 }}>₹{reportData.otherIncome.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Sponsorships & Partner Support</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Gross Total Income</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb', marginTop: 4 }}>₹{reportData.totalIncome.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Combined Society Resources</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Approved Expenditure</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>₹{reportData.totalExpenses.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{reportData.approvedExpensesCount} Verified Invoices</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1.5px solid #a7f3d0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 800, textTransform: 'uppercase' }}>Net Available Balance</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#065f46', marginTop: 4 }}>₹{reportData.currentBalance.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>Available in Society Account</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
