import React from 'react';
import { PlusCircle, ReceiptText, BarChart3, ArrowUpRight, ArrowDownRight, IndianRupee, Clock } from 'lucide-react';
import type { Building, FinancialSummary } from '../../types';
import { getNextEvent, daysUntil } from '../../services/eventsData';

interface AdminDashboardSummaryProps {
  financials: FinancialSummary;
  buildings: Building[];
  onAddContribution: () => void;
  onAddExpense: () => void;
  onViewReports: () => void;
  onSelectBuilding: (buildingId: string) => void;
}

export const AdminDashboardSummary: React.FC<AdminDashboardSummaryProps> = ({
  financials,
  buildings,
  onAddContribution,
  onAddExpense,
  onViewReports,
  onSelectBuilding,
}) => {
  // Format Indian Lakhs / Rupees
  const formatINR = (num: number) => {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  return (
    <div style={{ padding: '0 14px 20px' }}>
      {/* Admin Greeting */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{getGreeting()}</h2>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Cultural & Festive 2026–27 Admin Hub</p>
        </div>
      </div>

      {/* Next Festival Card */}
      {(() => {
        const next = getNextEvent();
        if (!next) return null;
        const days = daysUntil(next.date);
        const isOngoing = next.status === 'ONGOING';

        return (
          <div style={{
            background: next.gradient,
            borderRadius: 16,
            padding: '14px 16px',
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 6px 20px ${next.accentColor}40`,
          }}>
            {/* Decorative bg circle */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              {/* Left: event details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3,
                }}>
                  {isOngoing ? '🔴 Ongoing Festival' : '⏭ Next Festival'}
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 3 }}>
                  {next.emoji} {next.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  {next.tagline}
                </div>
                {/* Countdown or LIVE badge */}
                {isOngoing ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#dc2626', borderRadius: 20, padding: '3px 12px',
                    fontSize: 11, fontWeight: 900, color: '#fff',
                  }}>🔴 HAPPENING NOW</div>
                ) : days >= 0 ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 20, padding: '4px 14px',
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{days}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                      days<br />to go
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Right: event image or emoji */}
              {next.imageUrl ? (
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: '3px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}>
                  <img src={next.imageUrl} alt={next.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                </div>
              ) : (
                <div style={{ fontSize: 48, flexShrink: 0 }}>{next.emoji}</div>
              )}
            </div>
          </div>
        );
      })()}


      {/* Horizontally Scrollable Stats Cards */}
      <div
        className="horizontal-scroll-container"
        style={{ padding: '0 0 14px 0', margin: '0 -4px' }}
      >
        {/* Card 1: Collected */}
        <div
          style={{
            flex: '0 0 160px',
            background: 'linear-gradient(135deg, #065f46, #047857)',
            color: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' }}>
            Contributions
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
            {formatINR(financials.totalCollected)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#d1fae5', display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrowUpRight size={12} />
            <span>{financials.completionPercentage}% collected</span>
          </div>
        </div>

        {/* Card 2: Spent */}
        <div
          style={{
            flex: '0 0 160px',
            background: 'linear-gradient(135deg, #991b1b, #b91c1c)',
            color: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fecaca', textTransform: 'uppercase' }}>
            Total Spent
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
            {formatINR(financials.totalSpent)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fee2e2', display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrowDownRight size={12} />
            <span>Approved Bills</span>
          </div>
        </div>

        {/* Card 3: Balance */}
        <div
          style={{
            flex: '0 0 160px',
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            color: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(30, 27, 75, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
            Net Balance
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: '#a5f3fc' }}>
            {formatINR(financials.balance)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: 2 }}>
            <IndianRupee size={12} />
            <span>Safe Surplus</span>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div
          style={{
            flex: '0 0 160px',
            background: 'linear-gradient(135deg, #92400e, #b45309)',
            color: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fde68a', textTransform: 'uppercase' }}>
            Pending
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
            {formatINR(financials.totalPending)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fef3c7', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Clock size={12} />
            <span>{financials.pendingContributionsCount} flats follow-up</span>
          </div>
        </div>
      </div>

      {/* Building Collection Summary */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
            Building Collection
          </span>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Tap building to view flats
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {buildings.map((b) => {
            const percent = b.targetAmount > 0 ? Math.round(((b.collectedAmount || 0) / b.targetAmount) * 100) : 0;
            return (
              <div
                key={b.buildingId}
                onClick={() => onSelectBuilding(b.buildingId)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: '#0f172a' }}>{b.name}</span>
                  <span style={{ color: percent >= 80 ? '#059669' : '#d97706' }}>
                    {formatINR(b.collectedAmount || 0)} ({percent}%)
                  </span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(percent, 100)}%`,
                      background: percent >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Action Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div
          onClick={() => onSelectBuilding('ALL')}
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>PENDING FLATS</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309', marginTop: 2 }}>
            {financials.pendingContributionsCount} Flats
          </div>
        </div>

        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b' }}>BILLS TO APPROVE</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', marginTop: 2 }}>
            {financials.pendingExpensesCount} Expenses
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={onAddContribution}
          className="btn btn-primary"
          style={{ padding: '10px 12px', fontSize: 13 }}
        >
          <PlusCircle size={16} />
          <span>+ Contribution</span>
        </button>

        <button
          onClick={onAddExpense}
          className="btn btn-secondary"
          style={{ padding: '10px 12px', fontSize: 13, border: '1.5px solid #e2e8f0' }}
        >
          <ReceiptText size={16} />
          <span>+ Expense</span>
        </button>
      </div>

      <button
        onClick={onViewReports}
        className="btn btn-outline btn-block"
        style={{ marginTop: 10, fontSize: 13, height: 42 }}
      >
        <BarChart3 size={16} />
        <span>View Full Financial Reports</span>
      </button>
    </div>
  );
};
