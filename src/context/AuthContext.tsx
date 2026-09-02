import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isTreasurer: boolean;
  isVolunteer: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  switchRole: (newRole: UserRole) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => authService.getCurrentRole());
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((profile) => {
      setUser(profile);
      if (profile) {
        setRoleState(profile.role);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const loginAdmin = async (password: string): Promise<boolean> => {
    const success = await authService.loginAdmin(password);
    if (success) {
      setRoleState('SUPER_ADMIN');
      setUser(authService.getCurrentUser());
    }
    return success;
  };

  const logoutAdmin = () => {
    authService.logoutAdmin();
    setRoleState('VIEWER');
    setUser(authService.getCurrentUser());
  };

  const switchRole = (newRole: UserRole) => {
    authService.setRole(newRole);
    setRoleState(newRole);
    setUser(authService.getCurrentUser());
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const profile = await authService.loginWithGoogle();
      setUser(profile);
      setRoleState(profile.role);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      logoutAdmin();
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = ['SUPER_ADMIN', 'TREASURER', 'COMMITTEE_MEMBER', 'EVENT_COORDINATOR'].includes(role);
  const isTreasurer = ['SUPER_ADMIN', 'TREASURER'].includes(role);
  const isVolunteer = ['SUPER_ADMIN', 'VOLUNTEER', 'EVENT_COORDINATOR'].includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isTreasurer,
        isVolunteer,
        loginAdmin,
        logoutAdmin,
        switchRole,
        loginWithGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
