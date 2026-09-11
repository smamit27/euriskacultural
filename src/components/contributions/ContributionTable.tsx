import React from 'react';
import {
  CheckCircle2,
  Clock,
  Smartphone,
  Banknote,
  Edit3,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import type { Contribution } from '../../types';

interface ContributionTableProps {
  contributions: Contribution[];
  onMarkPaid: (contribution: Contribution) => void;
  onEdit: (contribution: Contribution) => void;
  onDelete: (contribution: Contribution) => void;
  isAdmin: boolean;
}

export const ContributionTable: React.FC<ContributionTableProps> = ({
  contributions,
  onMarkPaid,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  return (
    <div className="contribution-table-wrapper">
      <table className="contribution-table">
        <thead>
          <tr>
            <th>Flat</th>
            <th>Resident Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Payment Mode</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {contributions.map((c) => {
            const isPaid = c.status === 'PAID';
            return (
              <tr key={c.id} className={isPaid ? 'row-paid' : 'row-pending'}>
                <td>
                  <span className="table-flat-badge">{c.flatNumber}</span>
                </td>
                <td className="table-resident-name">{c.residentName}</td>
                <td>
                  {isPaid ? (
                    <span className="badge badge-paid">
                      <CheckCircle2 size={11} />
                      <span>PAID</span>
                    </span>
                  ) : (
                    <span className="badge badge-pending">
                      <Clock size={11} />
                      <span>PENDING</span>
                    </span>
                  )}
                </td>
                <td className="table-amount">
                  ₹{(isPaid ? c.paidAmount : c.expectedAmount).toLocaleString('en-IN')}
                  <span className="table-amount-label">
                    {isPaid ? 'paid' : 'expected'}
                  </span>
                </td>
                <td>
                  {isPaid ? (
                    c.paymentMode === 'ONLINE' ? (
                      <span className="badge badge-online">
                        <Smartphone size={11} />
                        <span>ONLINE</span>
                      </span>
                    ) : (
                      <span className="badge badge-cash">
                        <Banknote size={11} />
                        <span>CASH</span>
                      </span>
                    )
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                  )}
                </td>
                {isAdmin && (
                  <td>
                    <div className="table-actions">
                      {isPaid ? (
                        <>
                          <button
                            onClick={() => onEdit(c)}
                            className="btn btn-sm btn-secondary"
                            title="Edit"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onMarkPaid(c)}
                            className="btn btn-sm btn-primary"
                            title="Mark Paid"
                            style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ArrowRight size={12} />
                            <span>Mark Paid</span>
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
