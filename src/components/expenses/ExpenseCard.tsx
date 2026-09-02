import React from 'react';
import { CheckCircle2, Clock, XCircle, FileText, Smartphone, Banknote, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  onApprove?: (expense: Expense) => void;
  onReject?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onViewBill: (billUrl: string) => void;
  canApprove: boolean;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onViewBill,
  canApprove,
}) => {
  const getStatusBadge = () => {
    switch (expense.status) {
      case 'APPROVED':
        return (
          <span className="badge badge-approved" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge badge-rejected" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <XCircle size={12} />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            <span>PENDING APPROVAL</span>
          </span>
        );
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 14,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {expense.category}
        </span>
        {getStatusBadge()}
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
        {expense.vendor}
      </div>

      <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
        {expense.description}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
        <span style={{ fontSize: 19, fontWeight: 900, color: '#0f172a' }}>
          ₹{expense.amount.toLocaleString('en-IN')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {expense.paymentMode === 'ONLINE' ? (
            <span className="badge badge-online">
              <Smartphone size={11} />
              <span>UPI / ONLINE</span>
            </span>
          ) : (
            <span className="badge badge-cash">
              <Banknote size={11} />
              <span>CASH</span>
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#64748b',
          borderTop: '1px dashed #e2e8f0',
          paddingTop: 8,
          marginTop: 2,
        }}
      >
        <span>Date: {expense.expenseDate}</span>
        {expense.invoiceNumber && <span>Inv: #{expense.invoiceNumber}</span>}
      </div>

      {/* Bill Attachment & Approval / Edit Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {expense.billUrl ? (
          <button
            onClick={() => onViewBill(expense.billUrl!)}
            className="btn-sm btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, padding: '4px 10px', color: '#2563eb' }}
          >
            <FileText size={13} />
            <span>View Bill Preview</span>
          </button>
        ) : (
          <span style={{ fontSize: 11, color: '#94a3b8' }}>No bill attached</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          {canApprove && onEdit && (
            <button
              onClick={() => onEdit(expense)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 8,
                border: '1px solid #fed7aa',
                background: '#fff7ed',
                color: '#c2410c',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Edit Expense Record"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          )}

          {canApprove && onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 8px',
                borderRadius: 8,
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

          {canApprove && expense.status === 'PENDING' && (
            <>
              {onReject && (
                <button
                  onClick={() => onReject(expense)}
                  className="btn btn-sm btn-danger"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(expense)}
                  className="btn btn-sm btn-success"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  <ShieldCheck size={13} />
                  <span>Approve</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {expense.approvedBy && (
        <div style={{ fontSize: 10.5, color: '#059669', fontStyle: 'italic', marginTop: 2 }}>
          ✓ Verified & Approved by {expense.approvedBy}
        </div>
      )}
    </div>
  );
};
