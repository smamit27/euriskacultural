import React from 'react';
import { Users } from 'lucide-react';
import type { ActiveSession } from '../../services/presenceService';

interface LivePresenceBadgeProps {
  sessions: ActiveSession[];
  onClick?: () => void;
}

export const LivePresenceBadge: React.FC<LivePresenceBadgeProps> = ({
  sessions,
  onClick,
}) => {
  const count = sessions.length || 1;

  return (
    <button
      onClick={onClick}
      title="Click to view live active visitors"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: 20,
        padding: '3px 8px',
        fontSize: 11.5,
        fontWeight: 800,
        color: '#047857',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }}
      />
      <Users size={12} color="#059669" />
      <span>{count} Online</span>
    </button>
  );
};
