import React from 'react';
import { CheckCircle2, Clock, Smartphone, Banknote, Edit3, ArrowRight, Trash2 } from 'lucide-react';
import type { Contribution } from '../../types';

interface ContributionCardProps {
  contribution: Contribution;
  onMarkPaid: (contribution: Contribution) => void;
  onEdit: (contribution: Contribution) => void;
  onDelete: (contribution: Contribution) => void;
  isAdmin: boolean;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  contribution,
  onMarkPaid,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const isPaid = contribution.status === 'PAID';

  return (
    <div className="resident-card">
      <div className="resident-card-header">
        <span className="flat-badge">{contribution.flatNumber}</span>
        {isPaid ? (
          <span className="badge badge-paid">
            <CheckCircle2 size={12} />
            <span>PAID</span>
          </span>
        ) : (
          <span className="badge badge-pending">
            <Clock size={12} />
            <span>PENDING</span>
          </span>
        )}
      </div>

      <div className="resident-name">{contribution.residentName}</div>

      <div className="resident-amount-row">
        <span className="resident-amount">
          ₹{(isPaid ? contribution.paidAmount : contribution.expectedAmount).toLocaleString('en-IN')}
        </span>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          {isPaid ? 'Amount Paid' : 'Expected Contribution'}
        </span>
      </div>

      {isPaid ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {contribution.paymentMode === 'ONLINE' ? (
              <span className="badge badge-online">
                <Smartphone size={11} />
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="badge badge-cash">
                <Banknote size={11} />
                <span>CASH</span>
              </span>
            )}

            {contribution.transactionId && (
              <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 500 }}>
                {contribution.transactionId}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
            {contribution.paymentDate && <span>Paid on: {contribution.paymentDate}</span>}
            {contribution.receiptNumber && <span>Rec: #{contribution.receiptNumber}</span>}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11.5, color: '#b45309', fontWeight: 500, marginTop: 2 }}>
          {contribution.remarks || 'Awaiting contribution collection'}
        </div>
      )}

      {isAdmin && (
        <div className="card-actions-row">
          {isPaid ? (
            <>
              <button
                onClick={() => onEdit(contribution)}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: 12 }}
              >
                <Edit3 size={13} />
                <span>Edit Record</span>
              </button>
              <button
                onClick={() => onDelete(contribution)}
                className="btn btn-sm btn-danger"
                style={{ fontSize: 12 }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onMarkPaid(contribution)}
                className="btn btn-sm btn-primary"
                style={{ fontSize: 12 }}
              >
                <span>Mark Paid</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => onDelete(contribution)}
                className="btn btn-sm btn-danger"
                style={{ fontSize: 12 }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
