import React from 'react';
import { Calendar, Image, Mic, Handshake, Palette, Flame, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  return (
    <div className="quick-actions-grid">
      <div
        className="quick-action-card"
        onClick={() => onNavigate('prasad')}
        role="button"
        tabIndex={0}
        style={{ border: '1.5px solid #fed7aa', background: '#fff7ed' }}
      >
        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' }}>
          <Flame size={24} />
        </div>
        <div>
          <div className="quick-action-title" style={{ color: '#c2410c' }}>🪔 Prasad Seva</div>
          <div className="quick-action-desc">Book 8 PM Aarti slot</div>
        </div>
      </div>

      {isAdmin && (
        <div
          className="quick-action-card"
          onClick={() => onNavigate('report')}
          role="button"
          tabIndex={0}
          style={{ border: '1.5px solid #bbf7d0', background: '#f0fdf4' }}
        >
          <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="quick-action-title" style={{ color: '#047857' }}>📊 Financial Report</div>
            <div className="quick-action-desc">Live collection & expenses</div>
          </div>
        </div>
      )}

      <div
        className="quick-action-card"
        onClick={() => onNavigate('kalakriti')}
        role="button"
        tabIndex={0}
      >
        <div className="quick-action-icon icon-orange">
          <Palette size={24} />
        </div>
        <div>
          <div className="quick-action-title">🎨 Kalakriti</div>
          <div className="quick-action-desc">Activity matrix & register</div>
        </div>
      </div>

      <div
        className="quick-action-card"
        onClick={() => onNavigate('programs')}
        role="button"
        tabIndex={0}
      >
        <div className="quick-action-icon icon-purple">
          <Calendar size={24} />
        </div>
        <div>
          <div className="quick-action-title">🎭 Programs</div>
          <div className="quick-action-desc">Live schedule & lineup</div>
        </div>
      </div>

      <div
        className="quick-action-card"
        onClick={() => onNavigate('gallery')}
        role="button"
        tabIndex={0}
      >
        <div className="quick-action-icon icon-orange">
          <Image size={24} />
        </div>
        <div>
          <div className="quick-action-title">📸 Gallery</div>
          <div className="quick-action-desc">Photos & moments</div>
        </div>
      </div>

      <div
        className="quick-action-card"
        onClick={() => onNavigate('performances')}
        role="button"
        tabIndex={0}
      >
        <div className="quick-action-icon icon-cyan">
          <Mic size={24} />
        </div>
        <div>
          <div className="quick-action-title">🎤 Perform</div>
          <div className="quick-action-desc">Artists & acts</div>
        </div>
      </div>

      <div
        className="quick-action-card"
        onClick={() => onNavigate('sponsors')}
        role="button"
        tabIndex={0}
      >
        <div className="quick-action-icon icon-emerald">
          <Handshake size={24} />
        </div>
        <div>
          <div className="quick-action-title">🤝 Sponsors</div>
          <div className="quick-action-desc">Partners & supporters</div>
        </div>
      </div>
    </div>
  );
};
