import React, { useState } from 'react';
import { ChefHat, ChevronDown, ChevronUp, Sparkles, Scale } from 'lucide-react';

interface CateringEstimatorProps {
  totalHeadcount: number;
  jainCount: number;
}

export const CateringEstimator: React.FC<CateringEstimatorProps> = ({
  totalHeadcount,
  jainCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Portion estimation ratios based on standard Indian community catering per person
  // Adults + Kids with 10% safety buffer for unexpected walk-ins
  const countWithBuffer = Math.max(1, Math.ceil(totalHeadcount * 1.1));

  const estimates = [
    {
      item: 'Puri / Masala Puri',
      quantity: `${(countWithBuffer * 4).toLocaleString('en-IN')} pcs`,
      rawMaterial: `Wheat Flour: ~${Math.ceil((countWithBuffer * 4 * 25) / 1000)} kg | Oil: ~${Math.ceil((countWithBuffer * 15) / 1000)} L`,
      icon: '🫓',
    },
    {
      item: 'Jeera Rice / Masale Bhaat',
      quantity: `${Math.ceil((countWithBuffer * 120) / 1000)} kg (Cooked)`,
      rawMaterial: `Raw Basmati / Kolam: ~${Math.ceil((countWithBuffer * 60) / 1000)} kg`,
      icon: '🍚',
    },
    {
      item: 'Maharashtrian Katachi Amti / Dal',
      quantity: `${Math.ceil((countWithBuffer * 140) / 1000)} Litres`,
      rawMaterial: `Toor Dal: ~${Math.ceil((countWithBuffer * 30) / 1000)} kg | Spices & Tadka`,
      icon: '🍲',
    },
    {
      item: 'Paneer Butter Masala / Veg Mix',
      quantity: `${Math.ceil((countWithBuffer * 130) / 1000)} kg (Curry)`,
      rawMaterial: `Paneer: ~${Math.ceil((countWithBuffer * 40) / 1000)} kg | Veggies: ~${Math.ceil((countWithBuffer * 45) / 1000)} kg`,
      icon: '🥘',
    },
    {
      item: 'Ukadiche Modak / Gulab Jamun Sweet',
      quantity: `${(countWithBuffer * 2).toLocaleString('en-IN')} pcs`,
      rawMaterial: `Rice Flour/Khoya: ~${Math.ceil((countWithBuffer * 2 * 30) / 1000)} kg | Coconut/Sugar`,
      icon: '🥟',
    },
    {
      item: 'Papad, Pickle, Koshimbir & Water',
      quantity: `${countWithBuffer} Portions`,
      rawMaterial: `Water Bottles/Dispenser: ~${Math.ceil(countWithBuffer * 0.4)} L | Papad: ${countWithBuffer} pcs`,
      icon: '🥗',
    },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #fed7aa',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 24,
        boxShadow: '0 2px 10px rgba(234, 88, 12, 0.05)',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#ea580c',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChefHat size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Catering &amp; Food Raw Material Estimator
              </span>
              <span
                style={{
                  background: '#ffedd5',
                  color: '#c2410c',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Sparkles size={11} /> Auto Planner
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Estimated preparation requirements for{' '}
              <strong style={{ color: '#ea580c' }}>{totalHeadcount} RSVP Devotees</strong> (+10% safety buffer: {countWithBuffer} servings)
              {jainCount > 0 && <span> • 🥗 Separate {jainCount} Jain portions</span>}
            </div>
          </div>
        </div>

        <button
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <span>{isExpanded ? 'Hide Details' : 'View Estimates'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 18, borderTop: '1px dashed #fed7aa', paddingTop: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 12,
            }}
          >
            {estimates.map((est, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 24 }}>{est.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>
                      {est.item}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#b45309' }}>
                      {est.quantity}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#78350f', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Scale size={12} color="#a16207" />
                    <span>{est.rawMaterial}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '10px 14px',
              marginTop: 14,
              fontSize: 11.5,
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Note for Catering Committee:</strong> Quantities include standard 10% safety buffer for walk-ins. Separate stainless steel containers should be reserved for the {jainCount} Jain meals without root vegetables, onion, or garlic.
          </div>
        </div>
      )}
    </div>
  );
};
