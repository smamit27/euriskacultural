import React from 'react';
import { Target, CheckCircle, AlertTriangle, Edit3, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pdfService } from '../../services/pdfService';

interface BudgetVsActualItem {
  category: string;
  budget: number;
  amount: number;
  difference: number;
  isOverBudget: boolean;
  percentage: number;
}

interface BudgetVsActualSectionProps {
  items: BudgetVsActualItem[];
  totalExpenses: number;
  onOpenManageBudget?: () => void;
}

export const BudgetVsActualSection: React.FC<BudgetVsActualSectionProps> = ({
  items,
  totalExpenses,
  onOpenManageBudget,
}) => {
  const { isAdmin } = useAuth();

  const totalBudget = items.reduce((sum, i) => sum + (i.budget || 0), 0);
  const totalVariance = totalBudget - totalExpenses;
  const isOverallUnder = totalVariance >= 0;

  const handleDownloadPDF = () => {
    pdfService.exportBudgetVsActualPDF(items, totalBudget, totalExpenses);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Target size={20} color="#059669" />
            <span>Budget vs Actual Spending</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Comparison of allocated funds against verified expenses
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            background: totalBudget === 0 ? '#f8fafc' : isOverallUnder ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${totalBudget === 0 ? '#e2e8f0' : isOverallUnder ? '#a7f3d0' : '#fecaca'}`,
            color: totalBudget === 0 ? '#64748b' : isOverallUnder ? '#047857' : '#dc2626',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}>
            {totalBudget === 0 ? (
              <span>Target: Not Configured (₹0)</span>
            ) : (
              <>
                {isOverallUnder ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                <span>Overall: {isOverallUnder ? `+₹${totalVariance.toLocaleString('en-IN')} (Within Budget)` : `-₹${Math.abs(totalVariance).toLocaleString('en-IN')} (Over Budget)`}</span>
              </>
            )}
          </div>

          <button
            onClick={handleDownloadPDF}
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FileDown size={13} />
            <span>Download PDF</span>
          </button>

          {isAdmin && onOpenManageBudget && (
            <button
              onClick={onOpenManageBudget}
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#c2410c',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Edit3 size={13} />
              <span>Edit Budgets</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Category
              </th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Budget
              </th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Actual Spent
              </th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Difference
              </th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const diff = item.difference;
              const isOver = item.isOverBudget;
              const hasBudget = (item.budget || 0) > 0;
              const hasSpent = (item.amount || 0) > 0;

              let diffStr = '₹0';
              if (hasBudget || hasSpent) {
                diffStr = diff >= 0 ? `+₹${diff.toLocaleString('en-IN')}` : `-₹${Math.abs(diff).toLocaleString('en-IN')}`;
              }

              return (
                <tr
                  key={item.category}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    {item.category}
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, color: hasBudget ? '#64748b' : '#94a3b8', textAlign: 'right', fontWeight: 600 }}>
                    ₹{(item.budget || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px', fontSize: 13.5, color: '#0f172a', textAlign: 'right', fontWeight: 900 }}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontSize: 13,
                    textAlign: 'right',
                    fontWeight: 800,
                    color: !hasBudget && !hasSpent ? '#64748b' : isOver ? '#dc2626' : '#059669',
                  }}>
                    {diffStr}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {!hasBudget && !hasSpent ? (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: '#f1f5f9',
                        color: '#64748b',
                      }}>
                        —
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: isOver ? '#fef2f2' : '#ecfdf5',
                        color: isOver ? '#b91c1c' : '#047857',
                        border: `1px solid ${isOver ? '#fecaca' : '#a7f3d0'}`,
                      }}>
                        <span>{isOver ? '🔴' : '🟢'}</span>
                        <span>{isOver ? 'Over Budget' : 'Under Budget'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 900, color: '#0f172a' }}>
                TOTAL
              </td>
              <td style={{ padding: '12px', fontSize: 13.5, color: '#0f172a', textAlign: 'right', fontWeight: 800 }}>
                ₹{totalBudget.toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '12px', fontSize: 14, color: '#0f172a', textAlign: 'right', fontWeight: 900 }}>
                ₹{totalExpenses.toLocaleString('en-IN')}
              </td>
              <td style={{
                padding: '12px',
                fontSize: 13.5,
                textAlign: 'right',
                fontWeight: 900,
                color: totalBudget === 0 && totalExpenses === 0 ? '#64748b' : isOverallUnder ? '#059669' : '#dc2626',
              }}>
                {totalBudget === 0 && totalExpenses === 0 ? '₹0' : isOverallUnder ? `+₹${totalVariance.toLocaleString('en-IN')}` : `-₹${Math.abs(totalVariance).toLocaleString('en-IN')}`}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: totalBudget === 0 && totalExpenses === 0 ? '#64748b' : isOverallUnder ? '#047857' : '#b91c1c',
                }}>
                  {totalBudget === 0 && totalExpenses === 0 ? '—' : isOverallUnder ? '🟢 Within Budget' : '🔴 Over Budget'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
