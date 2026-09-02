import React, { useState } from 'react';
import { Clock, ArrowRight, Receipt, X } from 'lucide-react';
import type { Expense } from '../../types';

interface RecentExpensesFeedProps {
  expenses: Expense[];
  onViewAll: () => void;
}

export const RecentExpensesFeed: React.FC<RecentExpensesFeedProps> = ({
  expenses,
  onViewAll,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);

  const getCategoryBadgeStyle = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('prasad') || c.includes('food') || c.includes('catering')) {
      return { bg: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed' };
    }
    if (c.includes('decor') || c.includes('lighting')) {
      return { bg: '#ecfeff', border: '#a5f3fc', text: '#0891b2' };
    }
    if (c.includes('sound') || c.includes('light')) {
      return { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' };
    }
    if (c.includes('cultural') || c.includes('dance') || c.includes('artist') || c.includes('dhol')) {
      return { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' };
    }
    if (c.includes('print')) {
      return { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' };
    }
    return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      padding: '20px 18px',
      marginBottom: 20,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Clock size={20} color="#ea580c" />
            <span>Recent Expenses</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Latest verified transactions and vendor payments
          </p>
        </div>

        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#f97316',
            fontWeight: 800,
            fontSize: 12.5,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          <span>View All Transactions</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Expense Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {expenses.slice(0, 5).map((e) => {
          const badge = getCategoryBadgeStyle(e.category);
          const dateObj = new Date(e.expenseDate);
          const formattedDate = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : e.expenseDate;

          return (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 200px' }}>
                <div style={{
                  minWidth: 46,
                  height: 46,
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.1,
                  flexShrink: 0,
                }}>
                  <span>{formattedDate.split(' ')[0]}</span>
                  <span style={{ fontSize: 9.5, color: '#64748b', textTransform: 'uppercase' }}>
                    {formattedDate.split(' ')[1] || 'AUG'}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: badge.text,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}>
                      {e.category}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      • {e.vendor}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {e.description}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                    ₹{(e.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {e.paymentMode}
                  </div>
                </div>

                {e.billUrl && (
                  <button
                    onClick={() => setSelectedReceipt(e)}
                    title="View Receipt / Bill"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#0f172a',
                    }}
                  >
                    <Receipt size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  Receipt / Invoice
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedReceipt.vendor} • ₹{selectedReceipt.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{
                maxHeight: 360,
                overflow: 'hidden',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                marginBottom: 14,
              }}>
                <img
                  src={selectedReceipt.billUrl}
                  alt="Receipt"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                />
              </div>

              <div style={{
                fontSize: 12.5,
                color: '#475569',
                textAlign: 'left',
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
              }}>
                <div><strong>Description:</strong> {selectedReceipt.description}</div>
                <div><strong>Invoice No:</strong> {selectedReceipt.invoiceNumber || 'N/A'}</div>
                <div><strong>Date:</strong> {selectedReceipt.expenseDate}</div>
              </div>
            </div>

            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
