import React from 'react';
import { BottomSheet } from './BottomSheet';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { UserRole } from '../../types';
import { Shield, Wallet, Users, Music, HandHeart, Eye, Check } from 'lucide-react';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: {
  role: UserRole;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Admin (Chairman)',
    desc: 'Full access: approve expenses, manage contributions, assign tasks, edit schedules',
    icon: <Shield size={20} color="#f97316" />,
  },
  {
    role: 'TREASURER',
    title: 'Treasurer (Finance Lead)',
    desc: 'Record contributions, add & track expenses, financial summaries & reports',
    icon: <Wallet size={20} color="#10b981" />,
  },
  {
    role: 'COMMITTEE_MEMBER',
    title: 'Managing Committee',
    desc: 'Review expenses, check building collection progress, approve schedules',
    icon: <Users size={20} color="#8b5cf6" />,
  },
  {
    role: 'EVENT_COORDINATOR',
    title: 'Cultural Coordinator',
    desc: 'Manage programs, stage lineup, performer registrations, photo gallery',
    icon: <Music size={20} color="#06b6d4" />,
  },
  {
    role: 'VOLUNTEER',
    title: 'Volunteer / Floor Lead',
    desc: 'View assigned shift, update task Kanban board, assist resident collection',
    icon: <HandHeart size={20} color="#f59e0b" />,
  },
  {
    role: 'VIEWER',
    title: 'Public / Resident',
    desc: 'View event schedule, performances, sponsors showcase, photo gallery',
    icon: <Eye size={20} color="#64748b" />,
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ isOpen, onClose }) => {
  const { role: activeRole, switchRole } = useAuth();
  const { showToast } = useToast();

  const handleSelectRole = (newRole: UserRole) => {
    switchRole(newRole);
    showToast(`Switched active profile to ${newRole.replace('_', ' ')}`, 'success');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Switch User Role">
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Select a role to test role-based permissions and tailored mobile interfaces:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROLES.map((item) => {
          const isSelected = activeRole === item.role;
          return (
            <div
              key={item.role}
              onClick={() => handleSelectRole(item.role)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: isSelected ? '2px solid #f97316' : '1px solid #e2e8f0',
                background: isSelected ? '#fff7ed' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: isSelected ? '#fed7aa' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#f97316',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
};
