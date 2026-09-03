import { contributionService } from './contributionService';
import type { Contribution } from '../types';

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

const CONFIDENTIAL_PASSKEY = '$05CeLRO';
const DEMOGRAPHICS_AUTH_SESSION_KEY = 'euriska_demographics_auth_session';

// Muslim Name identification keywords / surnames
const MUSLIM_KEYWORDS = [
  'shaikh', 'sheikh', 'khan', 'syed', 'sayed', 'ansari', 'qureshi', 'ahmed', 'ahamed', 'alzahib',
  'javed', 'murtaza', 'ajdar', 'wasim', 'jamal', 'aliakbar', 'patrawala', 'farid', 'mannan',
  'abrar', 'shahebaz', 'mainuddin', 'rizwan', 'shakir', 'hussain', 'mohammad', 'mohd', 'shabana',
  'farhan', 'akhtar', 'asif', 'imran', 'zameer', 'salehi', 'shehnaz', 'shahnaz', 'mizba', 'dhamnekar',
  'fakiruddin', 'mudasir', 'damji'
];

// Christian Name identification keywords / surnames
const CHRISTIAN_KEYWORDS = [
  'fernandes', 'fernandez', 'd\'souza', 'dsouza', 'joseph', 'daniel', 'cedric', 'o\'neill', 'oneill',
  'belinda', 'lazarus', 'mascarenhas', 'pereira', 'noel', 'david', 'rodrigues', 'matthew', 'philip',
  'anthony', 'alfred', 'xavier', 'robert', 'ashton', 'edwin', 'dominic', 'jude', 'francis'
];

export const demographicsService = {
  /**
   * Verify confidential passkey strictly
   */
  verifyPasskey(passkey: string): boolean {
    return passkey.trim() === CONFIDENTIAL_PASSKEY;
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
   * Detect Community from resident name
   */
  detectCommunity(name: string): CommunityType {
    const lower = name.toLowerCase().trim();

    // Check Christian first
    for (const kw of CHRISTIAN_KEYWORDS) {
      if (lower.includes(kw)) {
        return 'CHRISTIAN';
      }
    }

    // Check Muslim
    for (const kw of MUSLIM_KEYWORDS) {
      if (lower.includes(kw)) {
        return 'MUSLIM';
      }
    }

    // Default to Hindu
    return 'HINDU';
  },

  /**
   * Get all categorized residents
   */
  async getDemographicResidents(): Promise<DemographicResident[]> {
    const contributions: Contribution[] = await contributionService.getContributions();

    return contributions.map((c) => {
      const cleanFlat = c.flatNumber.trim().toUpperCase();
      const residentName = cleanFlat === 'A-1007' || c.id === 'contrib-A-1007' ? 'Mr. Amit Singh' : c.residentName;
      const community = this.detectCommunity(residentName);

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
