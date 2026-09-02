import React, { useEffect, useState } from 'react';
import { IndianRupee, ReceiptText, Wallet, TrendingUp } from 'lucide-react';

interface FinancialSummaryCardsProps {
  totalCollected: number;
  totalPending: number;
  totalExpenses: number;
  currentBalance: number;
  collectionPercentage: number;
  paidFlatsCount: number;
  totalFlats: number;
  approvedExpensesCount: number;
  targetCollection: number;
}

// Smooth animated number hook
function useCountUp(target: number, duration: number = 1000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  totalCollected,
  totalExpenses,
  currentBalance,
  collectionPercentage,
  paidFlatsCount,
  totalFlats,
  approvedExpensesCount,
}) => {
  const animatedCollected = useCountUp(totalCollected, 1200);
  const animatedExpenses = useCountUp(totalExpenses, 1200);
  const animatedBalance = useCountUp(currentBalance, 1200);
  const animatedPercentage = useCountUp(collectionPercentage, 1000);

  return (
    <div className="financial-summary-cards-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12,
      marginBottom: 20,
    }}>
      {/* 1. Total Contribution */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1.5px solid #bbf7d0',
        borderRadius: 16,
        padding: '16px 14px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.08)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Contribution
          </span>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
          }}>
            <IndianRupee size={17} />
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#064e3b', letterSpacing: '-0.5px' }}>
          ₹{animatedCollected.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{paidFlatsCount} Families</span>
          <span>•</span>
          <span>{totalFlats} Flats</span>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
        border: '1.5px solid #fecaca',
        borderRadius: 16,
        padding: '16px 14px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.08)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Expenses
          </span>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
          }}>
            <ReceiptText size={17} />
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#7f1d1d', letterSpacing: '-0.5px' }}>
          ₹{animatedExpenses.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 11.5, color: '#991b1b', fontWeight: 600, marginTop: 4 }}>
          {approvedExpensesCount} Verified Transactions
        </div>
      </div>

      {/* 3. Current Balance */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
        border: '1.5px solid #bfdbfe',
        borderRadius: 16,
        padding: '16px 14px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.08)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Balance
          </span>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}>
            <Wallet size={17} />
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>
          ₹{animatedBalance.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
          Available Balance
        </div>
      </div>

      {/* 4. Collection Status */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: 16,
        padding: '16px 14px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.08)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Collection Status
          </span>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
          }}>
            <TrendingUp size={17} />
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#78350f', letterSpacing: '-0.5px' }}>
          {animatedPercentage}%
        </div>
        <div style={{ fontSize: 11.5, color: '#b45309', fontWeight: 600, marginTop: 4 }}>
          of Target Achieved
        </div>
      </div>
    </div>
  );
};
