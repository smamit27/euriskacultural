import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { budgetService } from '../../services/budgetService';
import { useToast } from '../../context/ToastContext';
import type { CategoryBudget } from '../../types';

interface ManageBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetUpdated: () => void;
}

export const ManageBudgetModal: React.FC<ManageBudgetModalProps> = ({
  isOpen,
  onClose,
  onBudgetUpdated,
}) => {
  const { showToast } = useToast();
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      budgetService.getBudgets().then(setBudgets);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (index: number, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    const next = [...budgets];
    next[index] = { ...next[index], budgetedAmount: num };
    setBudgets(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await budgetService.saveAllBudgets(budgets);
      showToast('✅ Category budgets saved successfully!', 'success');
      onBudgetUpdated();
      onClose();
    } catch {
      showToast('Failed to save budgets.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (b.budgetedAmount || 0), 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        maxWidth: 520,
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={16} color="#f97316" />
              <span>Manage Category Budgets</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Set annual cultural allocation targets for Euriska 2026
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgets.map((b, idx) => (
                <div
                  key={b.category}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                      {b.category}
                    </div>
                    {b.notes && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                        {b.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ position: 'relative', width: 140, flexShrink: 0 }}>
                    <span style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#64748b',
                    }}>
                      ₹
                    </span>
                    <input
                      type="text"
                      value={b.budgetedAmount ? b.budgetedAmount.toLocaleString('en-IN') : ''}
                      onChange={(e) => handleAmountChange(idx, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 24px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: '#0f172a',
                        textAlign: 'right',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary Footer Box */}
            <div style={{
              marginTop: 16,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#c2410c' }}>
                Total Allocated Budget
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#9a3412' }}>
                ₹{totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#f97316',
                border: 'none',
                borderRadius: 10,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 800,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Budgets'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
