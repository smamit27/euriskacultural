import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Table, LayoutGrid, FileText } from 'lucide-react';
import { ExpenseCard } from '../expenses/ExpenseCard';
import { ExpenseTable } from '../expenses/ExpenseTable';
import { AddExpenseSheet } from '../expenses/AddExpenseSheet';
import { expenseService } from '../../services/expenseService';
import { pdfService } from '../../services/pdfService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Expense, ExpenseStatus } from '../../types';

export const ExpensesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExpenseStatus>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return (localStorage.getItem('euriska_expenses_view_mode') as 'table' | 'cards') || 'table';
  });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [billPreviewUrl, setBillPreviewUrl] = useState<string | null>(null);

  const handleSetViewMode = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('euriska_expenses_view_mode', mode);
  };

  const loadExpenses = async () => {
    setLoading(true);
    const data = await expenseService.getExpenses({
      status: statusFilter === 'ALL' ? undefined : (statusFilter as ExpenseStatus),
      search: search || undefined,
    });
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadExpenses();
    }
  }, [statusFilter, search, isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
          Admin Access Only
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', maxWidth: 320, margin: '0 auto 16px', lineHeight: 1.5 }}>
          Expense vouchers, vendor receipts, and budget tracking are restricted to authorized Society Admins &amp; Treasurers.
        </p>
      </div>
    );
  }

  const totalApproved = expenses.filter((e) => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);

  const handleApprove = async (expense: Expense) => {
    await expenseService.approveExpense(expense.id, 'Sachin Singh');
    showToast(`✅ Expense approved: ${expense.vendor}`, 'success');
    loadExpenses();
  };

  const handleReject = async (expense: Expense) => {
    await expenseService.rejectExpense(expense.id, 'Does not meet approval criteria');
    showToast(`Expense rejected.`, 'error');
    loadExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditTarget(expense);
    setShowAddSheet(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await expenseService.deleteExpense(id);
        showToast('🗑️ Expense deleted.', 'success');
        loadExpenses();
      } catch {
        showToast('Failed to delete expense.', 'error');
      }
    }
  };

  const handleSaveExpense = async (data: any) => {
    try {
      if (editTarget) {
        await expenseService.updateExpense(editTarget.id, data);
        showToast('✅ Expense record updated successfully!', 'success');
      } else {
        await expenseService.addExpense(data);
        showToast('✅ Expense added successfully!', 'success');
      }
      setEditTarget(null);
      setShowAddSheet(false);
      loadExpenses();
    } catch {
      showToast('Failed to save expense.', 'error');
    }
  };

  return (
    <div>
      {/* Summary Banner */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Expense Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Cultural &amp; Festive 2026–27 Budget Tracking</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Approved Spent</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#047857' }}>₹{totalApproved.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Pending Approval</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309' }}>₹{totalPending.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search vendor, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Filter Row & View Switcher */}
      <div
        className="filter-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            >
              {s === 'ALL' ? '📋 All' : s === 'APPROVED' ? '✅ Approved' : s === 'PENDING' ? '⏳ Pending' : '❌ Rejected'}
            </button>
          ))}

          <button
            onClick={() => {
              try {
                pdfService.exportExpensesPDF(expenses);
                showToast('📄 Expense ledger PDF downloaded!', 'success');
              } catch {
                showToast('Failed to generate PDF.', 'error');
              }
            }}
            className="filter-chip"
            style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            title="Download Expense Ledger PDF"
          >
            <FileText size={13} /> Export PDF
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {/* View Format Switcher: Table vs Cards */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => handleSetViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#ea580c' : '#64748b',
                fontWeight: viewMode === 'table' ? 800 : 600,
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.15s ease',
              }}
              title="Tabular Table View"
            >
              <Table size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => handleSetViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#ea580c' : '#64748b',
                fontWeight: viewMode === 'cards' ? 800 : 600,
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.15s ease',
              }}
              title="Cards View"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditTarget(null);
                setShowAddSheet(true);
              }}
              className="filter-chip"
              style={{
                background: '#fff7ed',
                borderColor: '#fed7aa',
                color: '#c2410c',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <PlusCircle size={13} /> Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Expense Content: Tabular Table or Cards */}
      <div style={{ padding: '4px 14px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading expenses...</div>
        ) : viewMode === 'table' ? (
          <ExpenseTable
            expenses={expenses}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewBill={(url) => setBillPreviewUrl(url)}
            canApprove={isAdmin}
          />
        ) : expenses.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>No expenses found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewBill={(url) => setBillPreviewUrl(url)}
                canApprove={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bill Preview Lightbox */}
      {billPreviewUrl && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', zIndex: 120, padding: 20,
          }}
          onClick={() => setBillPreviewUrl(null)}
        >
          <img
            src={billPreviewUrl}
            alt="Bill Preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
          />
          <div style={{ color: '#fff', marginTop: 12, fontSize: 13, fontWeight: 600 }}>
            Tap anywhere to close
          </div>
        </div>
      )}

      <AddExpenseSheet
        isOpen={showAddSheet}
        initialExpense={editTarget}
        onClose={() => {
          setEditTarget(null);
          setShowAddSheet(false);
        }}
        onSave={handleSaveExpense}
      />
    </div>
  );
};
