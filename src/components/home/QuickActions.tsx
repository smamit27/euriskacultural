import React from 'react';
import { Calendar, Image, Mic, Palette, Flame, IndianRupee, Radio, Sparkles } from 'lucide-react';
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
        onClick={() => onNavigate('3d-hub')}
        role="button"
        tabIndex={0}
        style={{
          border: '1.5px solid #f59e0b',
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
        }}
      >
        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: '#fff' }}>
          <Sparkles size={24} />
        </div>
        <div>
          <div className="quick-action-title" style={{ color: '#b45309', fontWeight: 800 }}>✨ 3D Cultural Hub</div>
          <div className="quick-action-desc">3D Aarti, Deepotsav & Mandap</div>
        </div>
      </div>

      <div
        className="quick-action-card"
        onClick={() => onNavigate('livestream')}
        role="button"
        tabIndex={0}
        style={{ border: '1.5px solid #fecaca', background: '#fef2f2' }}
      >
        <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}>
          <Radio size={24} />
        </div>
        <div>
          <div className="quick-action-title" style={{ color: '#b91c1c' }}>🔴 Live Aarti &amp; Stream</div>
          <div className="quick-action-desc">Live Darshan &amp; broadcasts</div>
        </div>
      </div>

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
    </div>
  );
};
