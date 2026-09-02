import React from 'react';
import { Plus, Minus, Equal, Coins } from 'lucide-react';

interface MoneyFlowInfographicProps {
  totalCollected: number;
  otherIncome: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
}

export const MoneyFlowInfographic: React.FC<MoneyFlowInfographicProps> = ({
  totalCollected,
  otherIncome,
  totalIncome,
  totalExpenses,
  currentBalance,
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: 20,
      padding: '22px 18px',
      marginBottom: 20,
      color: '#ffffff',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.3)',
      border: '1px solid #334155',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontSize: 17,
          fontWeight: 800,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Coins size={20} color="#f59e0b" />
          <span>Money Flow Infographic</span>
        </h2>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          Step-by-step mathematical flow of society funds from collection to current balance
        </p>
      </div>

      {/* Desktop Horizontal Flow / Mobile Vertical Flow */}
      <div className="money-flow-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        {/* Step 1: Resident Contributions */}
        <div style={{
          flex: '1 1 140px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contributions
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
            Resident Collection
          </div>
        </div>

        {/* Math Symbol: Plus */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#f59e0b',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          flexShrink: 0,
          margin: '0 auto',
        }}>
          <Plus size={16} strokeWidth={3} />
        </div>

        {/* Step 2: Other Income / Sponsorships */}
        <div style={{
          flex: '1 1 140px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#fde68a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Other Income
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
            ₹{otherIncome.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
            Sponsors & Partner
          </div>
        </div>

        {/* Math Symbol: Equals */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#38bdf8',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          flexShrink: 0,
          margin: '0 auto',
        }}>
          <Equal size={16} strokeWidth={3} />
        </div>

        {/* Step 3: Total Income */}
        <div style={{
          flex: '1 1 140px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1.5px solid #38bdf8',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#bae6fd', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Income
          </div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
            Gross Society Pool
          </div>
        </div>

        {/* Math Symbol: Minus */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#f87171',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          flexShrink: 0,
          margin: '0 auto',
        }}>
          <Minus size={16} strokeWidth={3} />
        </div>

        {/* Step 4: Total Expenses */}
        <div style={{
          flex: '1 1 140px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1.5px solid #f87171',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#f87171', margin: '4px 0' }}>
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
            Verified Bills
          </div>
        </div>

        {/* Math Symbol: Equals */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#34d399',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          flexShrink: 0,
          margin: '0 auto',
        }}>
          <Equal size={16} strokeWidth={3} />
        </div>

        {/* Step 5: Current Balance */}
        <div style={{
          flex: '1 1 160px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.35))',
          border: '2px solid #34d399',
          borderRadius: 14,
          padding: '12px 14px',
          textAlign: 'center',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Balance
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399', margin: '4px 0' }}>
            ₹{currentBalance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10.5, color: '#d1fae5', fontWeight: 700 }}>
            ✨ Net Available
          </div>
        </div>
      </div>
    </div>
  );
};
