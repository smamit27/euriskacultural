import React, { useState, useEffect } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { ExpenseCard } from '../expenses/ExpenseCard';
import { AddExpenseSheet } from '../expenses/AddExpenseSheet';
import { expenseService } from '../../services/expenseService';
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
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [billPreviewUrl, setBillPreviewUrl] = useState<string | null>(null);

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

      {/* Filter Row */}
      <div className="filter-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
          >
            {s === 'ALL' ? '📋 All' : s === 'APPROVED' ? '✅ Approved' : s === 'PENDING' ? '⏳ Pending' : '❌ Rejected'}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => {
              setEditTarget(null);
              setShowAddSheet(true);
            }}
            className="filter-chip"
            style={{ marginLeft: 'auto', background: '#fff7ed', borderColor: '#fed7aa', color: '#c2410c', fontWeight: 800 }}
          >
            <PlusCircle size={13} /> Add Expense
          </button>
        )}
      </div>

      {/* Expense Cards */}
      <div style={{ padding: '4px 14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>No expenses found</div>
          </div>
        ) : (
          expenses.map((expense) => (
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
          ))
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
