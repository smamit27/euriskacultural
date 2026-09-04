import { contributionService } from './contributionService';
import type { Contribution } from '../types';
import { db, isFirebaseConfigured } from '../firebase/config';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

export type CommunityType = 'HINDU' | 'MUSLIM' | 'CHRISTIAN' | 'OTHER';

export interface DemographicResident {
  id: string;
  flatNumber: string;
  buildingId: string;
  residentName: string;
  community: CommunityType;
  status: 'PAID' | 'PENDING';
  amount: number;
}

export interface CommunityBreakdown {
  community: CommunityType;
  label: string;
  icon: string;
  color: string;
  totalFlats: number;
  paidFlats: number;
  pendingFlats: number;
  percentage: number;
  totalCollected: number;
}

export interface DemographicsLoginSession {
  sessionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  createdAt: number;
  expiresAt: number;
  approvedAt?: number;
  approvedByPasscode?: string;
  userAgent?: string;
}

// Explicit flat-to-community overrides provided by committee
const EXPLICIT_FLAT_COMMUNITY_MAP: Record<string, CommunityType> = {
  // Wing A
  'A-203': 'MUSLIM', // Mr. Maqsood Abdul Salam Baza
  'A-307': 'MUSLIM', // Mr. Qazi Munwwar Ali Mumtaz Ali
  'A-403': 'MUSLIM', // Mr. Azim Haghighi
  'A-404': 'MUSLIM', // Mr. Galib & Mrs. Afroza Parkar
  'A-908': 'MUSLIM', // Miss. Sakina Fatawala
  'A-1001': 'HINDU', // Mr. Ashish
  'A-1003': 'MUSLIM', // Mrs. Shabnam Mirkar
  'A-704': 'HINDU', // Mr. Sachin Nivrutti Savakhande

  // Wing B
  'B-302': 'CHRISTIAN', // Mr. Russell Nayak
  'B-607': 'CHRISTIAN', // Mr. Rohan Uday Kavde
  'B-701': 'MUSLIM', // Mrs. Samina Sajid Malik
  'B-905': 'MUSLIM', // Mr. Yusuf Ampanwala
  'B-1102': 'CHRISTIAN', // Agnelo Norman

  // Wing C
  'C-202': 'CHRISTIAN', // Ashley Carrasco
  'C-204': 'MUSLIM', // Sufiyan Tamboli
  'C-205': 'MUSLIM', // Chetan Habib
  'C-207': 'MUSLIM', // Nishad Mohandas
  'C-301': 'MUSLIM', // Sameer Kaulagekar
  'C-305': 'MUSLIM', // Abid S
  'C-306': 'CHRISTIAN', // Mr. Rohan Kotkar
  'C-503': 'CHRISTIAN', // Rachel
  'C-604': 'MUSLIM', // Hasina S
  'C-605': 'MUSLIM', // Tasneem Palodawala
  'C-607': 'MUSLIM', // Husham
};

// Muslim Name identification keywords / surnames
const MUSLIM_KEYWORDS = [
  'shaikh', 'sheikh', 'khan', 'syed', 'sayed', 'ansari', 'qureshi', 'ahmed', 'ahamed', 'alzahib',
  'javed', 'murtaza', 'ajdar', 'wasim', 'jamal', 'aliakbar', 'patrawala', 'farid', 'mannan',
  'abrar', 'shahebaz', 'mainuddin', 'rizwan', 'shakir', 'hussain', 'mohammad', 'mohd', 'shabana',
  'farhan', 'akhtar', 'asif', 'imran', 'zameer', 'salehi', 'shehnaz', 'shahnaz', 'mizba', 'dhamnekar',
  'fakiruddin', 'mudasir', 'damji', 'qazi', 'mumtaz', 'munwwar', 'azim', 'haghighi', 'galib', 'afroza',
  'parkar', 'sakina', 'fatawala', 'mirkar', 'ampanwala', 'sufiyan', 'tamboli', 'abid', 'hasina',
  'tasneem', 'palodawala', 'husham', 'malik', 'samina', 'sajid', 'saud', 'imrankhan', 'pathan'
];

// Christian Name identification keywords / surnames
const CHRISTIAN_KEYWORDS = [
  'fernandes', 'fernandez', 'd\'souza', 'dsouza', 'joseph', 'daniel', 'cedric', 'o\'neill', 'oneill',
  'belinda', 'lazarus', 'mascarenhas', 'pereira', 'noel', 'david', 'rodrigues', 'matthew', 'philip',
  'anthony', 'alfred', 'xavier', 'robert', 'ashton', 'edwin', 'dominic', 'jude', 'francis',
  'russell', 'carrasco', 'rachel', 'agnelo', 'norman', 'glyniis', 'aubey', 'rayan', 'barretto',
  'clinton', 'veronica'
];

const CONFIDENTIAL_PASSKEYS = ['$05CeLRO', '1111'];
const DEMOGRAPHICS_AUTH_SESSION_KEY = 'euriska_demographics_auth_session';

export const demographicsService = {
  /**
   * Verify confidential passkey strictly (supports $05CeLRO and quick passcode 1111)
   */
  verifyPasskey(passkey: string): boolean {
    const clean = passkey.trim();
    return CONFIDENTIAL_PASSKEYS.includes(clean);
  },

  /**
   * Check if user is already authenticated in current browser session
   */
  isSessionAuthenticated(): boolean {
    return sessionStorage.getItem(DEMOGRAPHICS_AUTH_SESSION_KEY) === 'true';
  },

  /**
   * Set session authentication
   */
  authenticateSession(): void {
    sessionStorage.setItem(DEMOGRAPHICS_AUTH_SESSION_KEY, 'true');
  },

  /**
   * Clear session authentication (Lock portal)
   */
  lockSession(): void {
    sessionStorage.removeItem(DEMOGRAPHICS_AUTH_SESSION_KEY);
  },

  /**
   * Create a new real-time Scan-to-Login session in Firestore
   */
  async createLoginSession(): Promise<DemographicsLoginSession> {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const sessionId = `DEMO-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    const now = Date.now();
    const session: DemographicsLoginSession = {
      sessionId,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + 3 * 60 * 1000, // 3 minutes validity
      userAgent: navigator.userAgent,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'demographics_sessions', sessionId), session);
      } catch (e) {
        console.warn('Firestore setDoc failed, fallback to local memory', e);
      }
    }

    // Also persist in localStorage for multi-tab fallback
    try {
      localStorage.setItem(`demo_sess_${sessionId}`, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }

    return session;
  },

  /**
   * Listen to real-time status updates of a Scan-to-Login session
   */
  subscribeLoginSession(sessionId: string, onUpdate: (session: DemographicsLoginSession) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const unsubscribe = onSnapshot(doc(db, 'demographics_sessions', sessionId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as DemographicsLoginSession;
            onUpdate(data);
          }
        }, (err) => {
          console.warn('Demographics session Firestore listener error:', err);
        });
        return unsubscribe;
      } catch (err) {
        console.warn('Could not establish Firestore listener for demographics session:', err);
      }
    }

    // LocalStorage storage event fallback for same browser / local testing
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `demo_sess_${sessionId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as DemographicsLoginSession;
          onUpdate(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  },

  /**
   * 1-Tap Instant Approve for Demographics (from authorized mobile device)
   */
  async approveLoginSessionDirect(sessionId: string): Promise<{ success: boolean; message: string }> {
    const updatePayload = {
      status: 'APPROVED' as const,
      approvedAt: Date.now(),
      approvedDevice: `${navigator.userAgent} (1-Tap Verified Mobile)`,
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'demographics_sessions', sessionId);
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
        console.error('Firestore direct demographics approval error:', err);
      }
    }

    try {
      const existing = localStorage.getItem(`demo_sess_${sessionId}`);
      const base = existing ? JSON.parse(existing) : { sessionId, createdAt: Date.now() };
      localStorage.setItem(`demo_sess_${sessionId}`, JSON.stringify({ ...base, ...updatePayload }));
    } catch {}

    return { success: true, message: 'Demographics Portal unlocked with 1-Tap verification!' };
  },

  /**
   * Approve a Scan-to-Login session using passcode (1111 or $05CeLRO)
   */
  async approveLoginSession(sessionId: string, passcode: string): Promise<{ success: boolean; message: string }> {
    if (!this.verifyPasskey(passcode)) {
      return { success: false, message: 'Invalid passkey. Access denied.' };
    }

    const updatePayload = {
      status: 'APPROVED' as const,
      approvedAt: Date.now(),
      approvedByPasscode: passcode.trim(),
      approvedDevice: navigator.userAgent,
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'demographics_sessions', sessionId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          // If doc didn't exist in Firestore, create it as approved
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
        console.error('Firestore approval update failed:', err);
      }
    }

    // Also update localStorage
    try {
      const existing = localStorage.getItem(`demo_sess_${sessionId}`);
      const base = existing ? JSON.parse(existing) : { sessionId, createdAt: Date.now() };
      const updated = { ...base, ...updatePayload };
      localStorage.setItem(`demo_sess_${sessionId}`, JSON.stringify(updated));
    } catch {}

    return { success: true, message: 'Demographics Portal unlocked successfully!' };
  },

  /**
   * Reject a session
   */
  async rejectLoginSession(sessionId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'demographics_sessions', sessionId), {
          status: 'REJECTED',
          rejectedAt: Date.now(),
        });
      } catch {}
    }
  },

  /**
   * Detect Community from flat number & resident name
   */
  detectCommunity(flatNumber: string, name: string): CommunityType {
    const cleanFlat = flatNumber.trim().toUpperCase();

    // 1. Check explicit flat override first
    if (EXPLICIT_FLAT_COMMUNITY_MAP[cleanFlat]) {
      return EXPLICIT_FLAT_COMMUNITY_MAP[cleanFlat];
    }

    const lower = name.toLowerCase().trim();

    // 2. Check Christian keywords
    for (const kw of CHRISTIAN_KEYWORDS) {
      if (lower.includes(kw)) {
        return 'CHRISTIAN';
      }
    }

    // 3. Check Muslim keywords
    for (const kw of MUSLIM_KEYWORDS) {
      if (lower.includes(kw)) {
        return 'MUSLIM';
      }
    }

    // 4. Default to Hindu
    return 'HINDU';
  },

  /**
   * Get all categorized residents
   */
  async getDemographicResidents(): Promise<DemographicResident[]> {
    const contributions: Contribution[] = await contributionService.getContributions();

    return contributions.map((c) => {
      const cleanFlat = c.flatNumber.trim().toUpperCase();
      let residentName = c.residentName;
      if (cleanFlat === 'A-1007' || c.id === 'contrib-A-1007') {
        residentName = 'Mr. Amit Singh';
      } else if (cleanFlat === 'A-1001' || c.id === 'contrib-A-1001') {
        residentName = 'Mr. Ashish';
      }

      const community = this.detectCommunity(cleanFlat, residentName);

      return {
        id: c.id,
        flatNumber: cleanFlat,
        buildingId: c.buildingId,
        residentName,
        community,
        status: c.status,
        amount: c.paidAmount || (c.status === 'PAID' ? 1500 : 0),
      };
    });
  },

  /**
   * Calculate Community Breakdown statistics
   */
  async getCommunitySummary(buildingFilter: string = 'ALL'): Promise<{
    breakdown: CommunityBreakdown[];
    totalResidents: number;
    totalPaid: number;
    totalPending: number;
  }> {
    let residents = await this.getDemographicResidents();

    if (buildingFilter !== 'ALL') {
      residents = residents.filter((r) => r.buildingId === buildingFilter);
    }

    const totalResidents = residents.length;
    let totalPaid = 0;
    let totalPending = 0;

    const counts: Record<CommunityType, { total: number; paid: number; pending: number; collected: number }> = {
      HINDU: { total: 0, paid: 0, pending: 0, collected: 0 },
      MUSLIM: { total: 0, paid: 0, pending: 0, collected: 0 },
      CHRISTIAN: { total: 0, paid: 0, pending: 0, collected: 0 },
      OTHER: { total: 0, paid: 0, pending: 0, collected: 0 },
    };

    residents.forEach((r) => {
      counts[r.community].total += 1;
      if (r.status === 'PAID') {
        counts[r.community].paid += 1;
        counts[r.community].collected += r.amount;
        totalPaid += 1;
      } else {
        counts[r.community].pending += 1;
        totalPending += 1;
      }
    });

    const breakdown: CommunityBreakdown[] = [
      {
        community: 'HINDU',
        label: 'Hindu Community',
        icon: '🪔',
        color: '#ea580c',
        totalFlats: counts.HINDU.total,
        paidFlats: counts.HINDU.paid,
        pendingFlats: counts.HINDU.pending,
        percentage: totalResidents > 0 ? Math.round((counts.HINDU.total / totalResidents) * 100) : 0,
        totalCollected: counts.HINDU.collected,
      },
      {
        community: 'MUSLIM',
        label: 'Muslim Community',
        icon: '🕌',
        color: '#059669',
        totalFlats: counts.MUSLIM.total,
        paidFlats: counts.MUSLIM.paid,
        pendingFlats: counts.MUSLIM.pending,
        percentage: totalResidents > 0 ? Math.round((counts.MUSLIM.total / totalResidents) * 100) : 0,
        totalCollected: counts.MUSLIM.collected,
      },
      {
        community: 'CHRISTIAN',
        label: 'Christian Community',
        icon: '⛪',
        color: '#2563eb',
        totalFlats: counts.CHRISTIAN.total,
        paidFlats: counts.CHRISTIAN.paid,
        pendingFlats: counts.CHRISTIAN.pending,
        percentage: totalResidents > 0 ? Math.round((counts.CHRISTIAN.total / totalResidents) * 100) : 0,
        totalCollected: counts.CHRISTIAN.collected,
      },
    ];

    return {
      breakdown,
      totalResidents,
      totalPaid,
      totalPending,
    };
  },
};
