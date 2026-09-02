import React from 'react';

interface BuildingSelectorProps {
  selectedBuilding: string; // 'A', 'B', 'C', 'ALL'
  onSelectBuilding: (building: string) => void;
}

export const BuildingSelector: React.FC<BuildingSelectorProps> = ({
  selectedBuilding,
  onSelectBuilding,
}) => {
  const options = [
    { id: 'A', label: 'Wing A' },
    { id: 'B', label: 'Wing B' },
    { id: 'C', label: 'Wing C' },
    { id: 'ALL', label: 'All Wings' },
  ];

  return (
    <div className="building-filter-bar">
      {options.map((opt) => {
        const isActive = selectedBuilding === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelectBuilding(opt.id)}
            className={`building-chip ${isActive ? 'active' : ''}`}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
