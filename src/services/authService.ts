import { auth, googleProvider, isFirebaseConfigured, db } from '../firebase/config';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auditService } from './auditService';
import type { UserProfile, UserRole } from '../types';

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
   * Fetch current portal password from Firebase Firestore 'settings/security'
   * If not found, initializes 'euriska2026' into Firebase Firestore.
   */
  async getPortalPasswordFromFirebase(): Promise<string> {
    if (db) {
      try {
        const docRef = doc(db, 'settings', 'security');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.portalPassword) return data.portalPassword;
        } else {
          // Initialize in Firestore
          await setDoc(docRef, {
            portalPassword: 'euriska2026',
            updatedAt: new Date().toISOString(),
          });
          return 'euriska2026';
        }
      } catch (err) {
        console.warn('Firebase security fetch failed, using fallback:', err);
      }
    }
    return localStorage.getItem(CUSTOM_PASSWORD_KEY) || 'euriska2026';
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
   * Verify password strictly against Firebase Firestore (ONLY euriska2026)
   */
  async verifyPassword(password: string): Promise<{ valid: boolean; role: UserRole }> {
    const trimmed = password.trim();
    if (!trimmed) return { valid: false, role: 'VIEWER' };

    const fbPassword = await this.getPortalPasswordFromFirebase();

    // Strictly match the Firebase password (e.g. euriska2026)
    if (trimmed === fbPassword || trimmed.toLowerCase() === fbPassword.toLowerCase()) {
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
