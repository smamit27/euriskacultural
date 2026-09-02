import React, { useState } from 'react';
import { PieChart, Sparkles } from 'lucide-react';

interface CategoryExpenseItem {
  category: string;
  amount: number;
  percentage: number;
  budget?: number;
  difference?: number;
}

interface ExpenseCategoryChartProps {
  categoryExpenses: CategoryExpenseItem[];
  totalExpenses: number;
  onSelectCategory?: (category: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  'Ganesh Chaturthi': { bg: '#ea580c', border: '#c2410c', text: '#9a3412', gradient: '#f97316' },
  'Navratri': { bg: '#d97706', border: '#b45309', text: '#92400e', gradient: '#f59e0b' },
  'Diwali': { bg: '#8b5cf6', border: '#7c3aed', text: '#6d28d9', gradient: '#a78bfa' },
  'Christmas': { bg: '#059669', border: '#047857', text: '#065f46', gradient: '#10b981' },
  'Eid': { bg: '#0891b2', border: '#0e7490', text: '#155e75', gradient: '#06b6d4' },
  'Holi': { bg: '#0284c7', border: '#0369a1', text: '#075985', gradient: '#38bdf8' },
};

const DEFAULT_COLOR = { bg: '#d97706', border: '#b45309', text: '#92400e', gradient: '#f59e0b' };

export const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({
  categoryExpenses,
  totalExpenses,
  onSelectCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Prepare SVG Donut slices
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const slices = React.useMemo(() => {
    // Filter items with amount > 0 for chart, or fallback to uniform if 0
    const activeItems = categoryExpenses.filter((c) => c.amount > 0);
    const itemsToRender = activeItems.length > 0 ? activeItems : categoryExpenses;
    let runningPercent = 0;

    return itemsToRender.map((item) => {
      const percent = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : item.percentage || 0;
      const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((runningPercent / 100) * circumference);
      runningPercent += percent;

      const color = CATEGORY_COLORS[item.category] || DEFAULT_COLOR;

      return {
        ...item,
        percent: Math.round(percent),
        strokeDasharray,
        strokeDashoffset,
        color,
      };
    });
  }, [categoryExpenses, totalExpenses, circumference]);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      padding: '20px 18px',
      marginBottom: 20,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <PieChart size={20} color="#8b5cf6" />
            <span>Expenses by Category</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Complete breakdown across 6 cultural expenditure areas
          </p>
        </div>

        <div style={{
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          color: '#6d28d9',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <Sparkles size={12} />
          <span>Interactive Donut</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        {/* SVG Donut Chart with Center Total */}
        <div style={{
          position: 'relative',
          width: 200,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          >
            {/* Background Track Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="24"
            />

            {/* Donut Slices */}
            {slices.map((slice) => {
              const isSelected = activeCategory === slice.category;
              return (
                <circle
                  key={slice.category}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color.bg}
                  strokeWidth={isSelected ? '28' : '24'}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    opacity: activeCategory && !isSelected ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setActiveCategory(slice.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                  onClick={() => {
                    setActiveCategory(activeCategory === slice.category ? null : slice.category);
                    if (onSelectCategory) onSelectCategory(slice.category);
                  }}
                />
              );
            })}
          </svg>

          {/* Center Total Text */}
          <div style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: 120,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              {activeCategory || 'TOTAL EXPENSES'}
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.2,
              marginTop: 2,
            }}>
              ₹{(activeCategory
                ? (categoryExpenses.find((c) => c.category === activeCategory)?.amount || 0)
                : totalExpenses
              ).toLocaleString('en-IN')}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: activeCategory ? '#8b5cf6' : '#059669',
              marginTop: 2,
            }}>
              {activeCategory
                ? `${categoryExpenses.find((c) => c.category === activeCategory)?.percentage || 0}% of Total`
                : '100% Utilized'}
            </div>
          </div>
        </div>

        {/* Category Breakdown Tiles / Legend */}
        <div style={{
          flex: '1 1 260px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {categoryExpenses.map((cat) => {
            const color = CATEGORY_COLORS[cat.category] || DEFAULT_COLOR;
            const isSelected = activeCategory === cat.category;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setActiveCategory(cat.category)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() => {
                  setActiveCategory(isSelected ? null : cat.category);
                  if (onSelectCategory) onSelectCategory(cat.category);
                }}
                style={{
                  background: isSelected ? `${color.bg}15` : '#f8fafc',
                  border: `1.5px solid ${isSelected ? color.bg : '#e2e8f0'}`,
                  borderRadius: 12,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: color.bg,
                      display: 'inline-block',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                      {cat.category}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: color.text,
                    background: '#fff',
                    padding: '1px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                  }}>
                    {cat.percentage}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 900, color: '#0f172a' }}>
                  <span>₹{cat.amount.toLocaleString('en-IN')}</span>
                  {cat.budget && (
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: '#64748b' }}>
                      Budget: ₹{cat.budget.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
