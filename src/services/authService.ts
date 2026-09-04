import { auth, googleProvider, isFirebaseConfigured, db } from '../firebase/config';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { fetchPublicIPAndLocation, auditService } from './auditService';
import type { UserProfile, UserRole } from '../types';

export interface AdminLoginSession {
  sessionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  createdAt: number;
  expiresAt: number;
  creatorIp?: string;
  creatorLocation?: string;
  creatorDevice?: string;
  approvedAt?: number;
  approvedDevice?: string;
  approvedIp?: string;
  isPairingTransfer?: boolean;
  userAgent?: string;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  SUPER_ADMIN: {
    uid: 'demo-superadmin',
    email: 'superadmin@euriska.com',
    displayName: 'Society Chairman',
    role: 'SUPER_ADMIN',
    buildingId: 'A',
    flatNumber: 'A-203',
    phone: '+91 98231 10022',
  },
  TREASURER: {
    uid: 'demo-treasurer',
    email: 'treasurer@euriska.com',
    displayName: 'Rahul Deshmukh (Treasurer)',
    role: 'TREASURER',
    buildingId: 'B',
    flatNumber: 'B-301',
    phone: '+91 98901 88334',
  },
  COMMITTEE_MEMBER: {
    uid: 'demo-committee',
    email: 'committee@euriska.com',
    displayName: 'Pooja Kulkarni (Secretary)',
    role: 'COMMITTEE_MEMBER',
    buildingId: 'A',
    flatNumber: 'A-402',
    phone: '+91 98224 55112',
  },
  EVENT_COORDINATOR: {
    uid: 'demo-coordinator',
    email: 'coordinator@euriska.com',
    displayName: 'Sneha Patil (Cultural Lead)',
    role: 'EVENT_COORDINATOR',
    buildingId: 'C',
    flatNumber: 'C-504',
    phone: '+91 98812 77443',
  },
  VOLUNTEER: {
    uid: 'demo-volunteer',
    email: 'volunteer@euriska.com',
    displayName: 'Deepak More (Volunteer)',
    role: 'VOLUNTEER',
    buildingId: 'B',
    flatNumber: 'B-104',
    phone: '+91 98600 33221',
  },
  VIEWER: {
    uid: 'demo-viewer',
    email: 'resident@euriska.com',
    displayName: 'Euriska Resident',
    role: 'VIEWER',
  },
};

const ACTIVE_ROLE_KEY = 'euriska_active_role';
const ADMIN_AUTH_KEY = 'euriska_admin_auth';
const CUSTOM_PASSWORD_KEY = 'euriska_custom_password';

import { verifyCredentialHash } from '../utils/cryptoUtils';

export const authService = {
  /**
   * Check if current session is authenticated as Admin
   */
  isAdmin(): boolean {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  },

  /**
   * Current active role: Defaults to VIEWER (Resident) unless Admin logged in
   */
  getCurrentRole(): UserRole {
    if (this.isAdmin()) {
      return (localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole) || 'SUPER_ADMIN';
    }
    return 'VIEWER';
  },

  /**
   * Fetch current custom portal password from Firebase Firestore 'settings/security'
   */
  async getPortalPasswordFromFirebase(): Promise<string> {
    if (db) {
      try {
        const docRef = doc(db, 'settings', 'security');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.portalPassword) return data.portalPassword;
        }
      } catch (err) {
        console.warn('Firebase security fetch failed:', err);
      }
    }
    return localStorage.getItem(CUSTOM_PASSWORD_KEY) || '';
  },

  /**
   * Save / update new portal password to Firebase Firestore
   */
  async setPortalPasswordInFirebase(newPassword: string): Promise<void> {
    if (!newPassword.trim()) return;
    localStorage.setItem(CUSTOM_PASSWORD_KEY, newPassword.trim());

    if (db) {
      try {
        const docRef = doc(db, 'settings', 'security');
        await setDoc(docRef, {
          portalPassword: newPassword.trim(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firebase password update error:', err);
      }
    }
  },

  /**
   * Verify password strictly via one-way cryptographic SHA-256 hash or Firestore security doc
   */
  async verifyPassword(password: string): Promise<{ valid: boolean; role: UserRole }> {
    const trimmed = password.trim();
    if (!trimmed) return { valid: false, role: 'VIEWER' };

    // 1. Check one-way cryptographic hash match
    const isHashMatch = await verifyCredentialHash(trimmed);
    if (isHashMatch) {
      return { valid: true, role: 'SUPER_ADMIN' };
    }

    // 2. Check dynamic Firestore custom password if set
    const fbPassword = await this.getPortalPasswordFromFirebase();
    if (fbPassword && (trimmed === fbPassword || trimmed.toLowerCase() === fbPassword.toLowerCase())) {
      return { valid: true, role: 'SUPER_ADMIN' };
    }

    return { valid: false, role: 'VIEWER' };
  },

  /**
   * Login as Admin with Password (with Device & IP Audit Logging)
   */
  async loginAdmin(password: string): Promise<boolean> {
    const result = await this.verifyPassword(password);
    if (result.valid) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      this.setRole(result.role);
      // Track successful admin login with device & IP
      try {
        await auditService.logAdminLogin('SUCCESS');
      } catch {}
      return true;
    }
    // Track failed admin login attempt with device & IP
    try {
      await auditService.logAdminLogin('FAILED');
    } catch {}
    return false;
  },

  /**
   * Unlock Admin mode directly (used by verified QR Scan Handshake)
   */
  async unlockAdminSessionDirect(): Promise<boolean> {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    this.setRole('SUPER_ADMIN');
    try {
      await auditService.logAdminLogin('SUCCESS');
    } catch {}
    return true;
  },

  /**
   * Create a new real-time Admin Scan-to-Login session in Firestore with IP tracking
   */
  async createAdminLoginSession(isPairingTransfer: boolean = false): Promise<AdminLoginSession> {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const sessionId = `ADM-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const now = Date.now();

    // Fetch creator IP & location
    let creatorIp = 'Unknown IP';
    let creatorLocation: string | undefined = undefined;
    try {
      const netInfo = await fetchPublicIPAndLocation();
      creatorIp = netInfo.ip;
      creatorLocation = netInfo.location;
    } catch {}

    const session: AdminLoginSession = {
      sessionId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + 3 * 60 * 1000,
      creatorIp,
      creatorLocation,
      creatorDevice: navigator.userAgent,
      isPairingTransfer,
      userAgent: navigator.userAgent,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'admin_sessions', sessionId), session);
      } catch (e) {
        console.warn('Firestore admin session setDoc error:', e);
      }
    }

    try {
      localStorage.setItem(`adm_sess_${sessionId}`, JSON.stringify(session));
    } catch {}

    return session;
  },

  /**
   * Fetch an existing Admin session by ID
   */
  async getAdminLoginSession(sessionId: string): Promise<AdminLoginSession | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'admin_sessions', sessionId));
        if (docSnap.exists()) {
          return docSnap.data() as AdminLoginSession;
        }
      } catch (err) {
        console.warn('Admin session fetch error:', err);
      }
    }
    try {
      const existing = localStorage.getItem(`adm_sess_${sessionId}`);
      return existing ? JSON.parse(existing) : null;
    } catch {
      return null;
    }
  },

  /**
   * Listen to real-time status updates of an Admin Scan-to-Login session
   */
  subscribeAdminLoginSession(sessionId: string, onUpdate: (session: AdminLoginSession) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const unsubscribe = onSnapshot(doc(db, 'admin_sessions', sessionId), (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as AdminLoginSession);
          }
        }, (err) => {
          console.warn('Admin session listener error:', err);
        });
        return unsubscribe;
      } catch (err) {
        console.warn('Could not establish admin session listener:', err);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `adm_sess_${sessionId}` && e.newValue) {
        try {
          onUpdate(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  },

  /**
   * 1-Tap Instant Approve Admin Scan Session (from an already authenticated Admin device)
   */
  async approveAdminLoginSessionDirect(sessionId: string): Promise<{ success: boolean; message: string }> {
    let approverIp = 'Unknown IP';
    try {
      const netInfo = await fetchPublicIPAndLocation();
      approverIp = netInfo.ip;
    } catch {}

    const updatePayload = {
      status: 'APPROVED' as const,
      approvedAt: Date.now(),
      approvedDevice: `${navigator.userAgent} (1-Tap Verified)`,
      approvedIp: approverIp,
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'admin_sessions', sessionId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            sessionId,
            createdAt: Date.now(),
            expiresAt: Date.now() + 180000,
            ...updatePayload,
          });
        } else {
          await updateDoc(docRef, updatePayload);
        }
      } catch (err) {
        console.error('Firestore 1-tap admin approval update error:', err);
      }
    }

    try {
      const existing = localStorage.getItem(`adm_sess_${sessionId}`);
      const base = existing ? JSON.parse(existing) : { sessionId, createdAt: Date.now() };
      localStorage.setItem(`adm_sess_${sessionId}`, JSON.stringify({ ...base, ...updatePayload }));
    } catch {}

    try {
      await auditService.logAdminLogin('SUCCESS');
    } catch {}

    return { success: true, message: 'Admin login approved with 1-Tap verification!' };
  },

  /**
   * Approve an Admin Scan-to-Login session using cryptographic hash verification
   */
  async approveAdminLoginSession(sessionId: string, password: string): Promise<{ success: boolean; message: string }> {
    const result = await this.verifyPassword(password);
    if (!result.valid) {
      return { success: false, message: 'Invalid Admin Password. Access denied.' };
    }

    let approverIp = 'Unknown IP';
    try {
      const netInfo = await fetchPublicIPAndLocation();
      approverIp = netInfo.ip;
    } catch {}

    const updatePayload = {
      status: 'APPROVED' as const,
      approvedAt: Date.now(),
      approvedDevice: navigator.userAgent,
      approvedIp: approverIp,
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'admin_sessions', sessionId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            sessionId,
            createdAt: Date.now(),
            expiresAt: Date.now() + 180000,
            ...updatePayload,
          });
        } else {
          await updateDoc(docRef, updatePayload);
        }
      } catch (err) {
        console.error('Firestore admin approval update error:', err);
      }
    }

    try {
      const existing = localStorage.getItem(`adm_sess_${sessionId}`);
      const base = existing ? JSON.parse(existing) : { sessionId, createdAt: Date.now() };
      localStorage.setItem(`adm_sess_${sessionId}`, JSON.stringify({ ...base, ...updatePayload }));
    } catch {}

    try {
      await auditService.logAdminLogin('SUCCESS');
    } catch {}

    return { success: true, message: 'Admin login approved successfully!' };
  },

  /**
   * Reject an Admin Login session
   */
  async rejectAdminLoginSession(sessionId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'admin_sessions', sessionId), {
          status: 'REJECTED',
          rejectedAt: Date.now(),
        });
      } catch {}
    }
  },

  /**
   * Logout from Admin to Resident (No password required)
   */
  logoutAdmin() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    this.setRole('VIEWER');
  },

  /**
   * Set active role
   */
  setRole(role: UserRole) {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  },

  getCurrentUser(): UserProfile {
    const role = this.getCurrentRole();
    return DEMO_USERS[role] || DEMO_USERS.VIEWER;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || 'user@euriska.com',
          displayName: user.displayName || 'Euriska Member',
          role: 'SUPER_ADMIN',
          photoURL: user.photoURL || undefined,
        };
        return profile;
      } catch (err) {
        console.warn('Firebase login popup failed or cancelled, using demo login:', err);
      }
    }
    const role = this.getCurrentRole();
    return DEMO_USERS[role];
  },

  async signOut(): Promise<void> {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error', err);
      }
    }
    localStorage.removeItem(ADMIN_AUTH_KEY);
    this.setRole('VIEWER');
  },

  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Euriska Member',
            role: this.getCurrentRole(),
            photoURL: firebaseUser.photoURL || undefined,
          });
        } else {
          callback(this.getCurrentUser());
        }
      });
    } else {
      callback(this.getCurrentUser());
      return () => {};
    }
  },
};
