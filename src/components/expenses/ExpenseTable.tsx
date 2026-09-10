import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Banknote,
  ShieldCheck,
  Edit3,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
} from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseTableProps {
  expenses: Expense[];
  onApprove?: (expense: Expense) => void;
  onReject?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onViewBill: (billUrl: string) => void;
  canApprove: boolean;
}

type SortField = 'expenseDate' | 'vendor' | 'category' | 'amount' | 'status' | 'paymentMode';
type SortOrder = 'asc' | 'desc';

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onViewBill,
  canApprove,
}) => {
  const [sortField, setSortField] = useState<SortField>('expenseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedExpenses = useMemo(() => {
    const list = [...expenses];
    list.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'amount') {
        aVal = a.amount || 0;
        bVal = b.amount || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [expenses, sortField, sortOrder]);

  const totalAmount = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const approvedTotal = useMemo(
    () => expenses.filter((e) => e.status === 'APPROVED').reduce((s, e) => s + (e.amount || 0), 0),
    [expenses]
  );
  const pendingTotal = useMemo(
    () => expenses.filter((e) => e.status === 'PENDING').reduce((s, e) => s + (e.amount || 0), 0),
    [expenses]
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.4, marginLeft: 4 }} />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} style={{ color: '#ea580c', marginLeft: 4 }} />
    ) : (
      <ArrowDown size={12} style={{ color: '#ea580c', marginLeft: 4 }} />
    );
  };

  const getCategoryStyle = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('stage') || c.includes('decor')) {
      return { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' };
    }
    if (c.includes('sound') || c.includes('light')) {
      return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    }
    if (c.includes('food') || c.includes('cater') || c.includes('prasad')) {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    }
    if (c.includes('dhol') || c.includes('artist') || c.includes('performer')) {
      return { bg: '#f5f3ff', text: '#6b21a8', border: '#ddd6fe' };
    }
    if (c.includes('pooja') || c.includes('ritual')) {
      return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
    }
    if (c.includes('photo') || c.includes('video')) {
      return { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc' };
    }
    return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
  };

  const exportTableCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Invoice #', 'Category', 'Vendor', 'Description', 'Amount (INR)', 'Payment Mode', 'Status', 'Paid By', 'Bill Attached'];
    const rows = sortedExpenses.map((e) => [
      e.expenseDate,
      e.invoiceNumber || 'N/A',
      `"${e.category}"`,
      `"${e.vendor.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMode,
      e.status,
      e.paidBy || e.approvedBy || 'Sachin Singh',
      e.billUrl ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Euriska_Expenses_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (expenses.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '40px 20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>No expenses found</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          No expense records match your current search or filter criteria.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Table Toolbar / Metadata Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            Showing {sortedExpenses.length} {sortedExpenses.length === 1 ? 'record' : 'records'}
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span>Click headers to sort</span>
        </div>
        <button
          onClick={exportTableCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
          title="Export displayed table to CSV"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 840,
              fontSize: 12.5,
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: 11.5,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                <th
                  onClick={() => handleSort('expenseDate')}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span>Date & Inv</span>
                    {getSortIcon('expenseDate')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('category')}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span>Category</span>
                    {getSortIcon('category')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('vendor')}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    minWidth: 200,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span>Vendor & Description</span>
                    {getSortIcon('vendor')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('amount')}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('paymentMode')}
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span>Mode</span>
                    {getSortIcon('paymentMode')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>

                <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span>Receipt</span>
                </th>

                {canApprove && (
                  <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 120 }}>
                    <span>Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {sortedExpenses.map((expense, idx) => {
                const catStyle = getCategoryStyle(expense.category);
                const isApproved = expense.status === 'APPROVED';
                const isRejected = expense.status === 'REJECTED';
                const isPending = expense.status === 'PENDING';

                return (
                  <tr
                    key={expense.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa')}
                  >
                    {/* Date & Invoice */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>
                        {expense.expenseDate}
                      </div>
                      {expense.invoiceNumber ? (
                        <div
                          style={{
                            fontSize: 10.5,
                            color: '#64748b',
                            fontWeight: 600,
                            display: 'inline-block',
                            background: '#f1f5f9',
                            padding: '1px 5px',
                            borderRadius: 4,
                            marginTop: 3,
                          }}
                        >
                          #{expense.invoiceNumber}
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Voucher</div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: catStyle.bg,
                          color: catStyle.text,
                          border: `1px solid ${catStyle.border}`,
                          display: 'inline-block',
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>

                    {/* Vendor & Description */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>
                        {expense.vendor}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: '#475569',
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {expense.description}
                      </div>
                      {(expense.paidBy || expense.approvedBy) && (
                        <div
                          style={{
                            fontSize: 10.5,
                            color: '#059669',
                            fontWeight: 700,
                            marginTop: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <ShieldCheck size={11} />
                          <span>Paid By {expense.paidBy || expense.approvedBy}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'right',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a' }}>
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {expense.paymentMode === 'ONLINE' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 6,
                            background: '#e0e7ff',
                            color: '#3730a3',
                            border: '1px solid #c7d2fe',
                          }}
                        >
                          <Smartphone size={11} />
                          <span>UPI / ONLINE</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 6,
                            background: '#fef08a',
                            color: '#854d0e',
                            border: '1px solid #fde047',
                          }}
                        >
                          <Banknote size={11} />
                          <span>CASH</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: isApproved ? '#ecfdf5' : isRejected ? '#fef2f2' : '#fffbeb',
                          color: isApproved ? '#047857' : isRejected ? '#b91c1c' : '#b45309',
                          border: `1px solid ${
                            isApproved ? '#a7f3d0' : isRejected ? '#fecaca' : '#fde68a'
                          }`,
                        }}
                      >
                        {isApproved ? (
                          <CheckCircle2 size={11} />
                        ) : isRejected ? (
                          <XCircle size={11} />
                        ) : (
                          <Clock size={11} />
                        )}
                        <span>{expense.status}</span>
                      </span>
                    </td>

                    {/* Receipt / Bill */}
                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {expense.billUrl ? (
                        <button
                          onClick={() => onViewBill(expense.billUrl!)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="View Bill Attachment"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    {canApprove && (
                      <td
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          verticalAlign: 'top',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            justifyContent: 'center',
                          }}
                        >
                          {isPending && onApprove && (
                            <button
                              onClick={() => onApprove(expense)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #86efac',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Approve this expense"
                            >
                              <ShieldCheck size={12} />
                              <span>Approve</span>
                            </button>
                          )}

                          {isPending && onReject && (
                            <button
                              onClick={() => onReject(expense)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#b91c1c',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Reject this expense"
                            >
                              <span>Reject</span>
                            </button>
                          )}

                          {onEdit && (
                            <button
                              onClick={() => onEdit(expense)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px 6px',
                                borderRadius: 6,
                                border: '1px solid #fed7aa',
                                background: '#fff7ed',
                                color: '#c2410c',
                                cursor: 'pointer',
                              }}
                              title="Edit Expense Record"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(expense.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px 6px',
                                borderRadius: 6,
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                              }}
                              title="Delete Expense Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr
                style={{
                  background: '#f8fafc',
                  borderTop: '2px solid #e2e8f0',
                  fontWeight: 800,
                  fontSize: 12,
                  color: '#0f172a',
                }}
              >
                <td colSpan={3} style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span>TOTAL ({sortedExpenses.length} records)</span>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                      Approved: ₹{approvedTotal.toLocaleString('en-IN')}
                    </span>
                    {pendingTotal > 0 && (
                      <span style={{ fontSize: 11, color: '#d97706', fontWeight: 700 }}>
                        Pending: ₹{pendingTotal.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </td>
                <td colSpan={canApprove ? 4 : 3} style={{ padding: '12px 14px' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
