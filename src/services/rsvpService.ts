import { readCollection, writeDocument, deleteDocument, subscribeCollection, writeBatchDocuments } from './firestoreService';
import { contributionService } from './contributionService';
import { INITIAL_MAHA_PRASAD_RSVPS } from './seedData';
import { COLLECTIONS } from '../firebase/collections';
import type { MahaPrasadRSVP, MahaPrasadSummary } from '../types';

const STORAGE_KEY = 'euriska_maha_prasad_rsvp_v3';
const COLLECTION_NAME = COLLECTIONS.MAHA_PRASAD_RSVPS || 'maha_prasad_rsvps';

function normalizeFlatId(flatNumber: string): string {
  const clean = flatNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-');
  return `rsvp-${clean}`;
}

export const rsvpService = {
  /**
   * Real-time subscription to Maha Prasad RSVP roster
   */
  subscribeRSVPs(callback: (rsvps: MahaPrasadRSVP[]) => void): () => void {
    // 1. Send initial memory/local data immediately
    this.getRSVPs().then((initial) => {
      callback(initial);
    });

    // 2. Listen to real-time updates from Firestore
    return subscribeCollection<MahaPrasadRSVP>(COLLECTION_NAME, async (remoteDocs) => {
      if (!remoteDocs || remoteDocs.length === 0) {
        // If Firestore is empty, sync initial baseline to Firestore
        await this.syncToFirebase();
        const current = await this.getRSVPs();
        callback(current);
        return;
      }

      // Merge Firestore remote documents with paid contribution flats
      const merged = await this.mergeWithPaidFlats(remoteDocs);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      callback(merged);
    });
  },

  /**
   * Helper to merge a list of RSVPs with all paid contribution flats
   */
  async mergeWithPaidFlats(baseRSVPs: MahaPrasadRSVP[]): Promise<MahaPrasadRSVP[]> {
    const rsvpMap = new Map<string, MahaPrasadRSVP>();

    // Baseline from seed data
    INITIAL_MAHA_PRASAD_RSVPS.forEach((item) => {
      const cleanFlat = item.flatNumber.trim().toUpperCase();
      rsvpMap.set(cleanFlat, {
        ...item,
        id: normalizeFlatId(cleanFlat),
        residentName: cleanFlat === 'A-1007' ? 'Mr. Amit Singh' : item.residentName,
      });
    });

    // Merge base / remote entries (which have priority over seed)
    baseRSVPs.forEach((item) => {
      const cleanFlat = item.flatNumber.trim().toUpperCase();
      rsvpMap.set(cleanFlat, {
        ...item,
        id: normalizeFlatId(cleanFlat),
        residentName: cleanFlat === 'A-1007' ? 'Mr. Amit Singh' : item.residentName,
      });
    });

    // Ensure all paid flats from contributionService are enrolled
    try {
      const contributions = await contributionService.getContributions();
      const paidFlats = contributions.filter((c) => c.status === 'PAID' && (c.paidAmount || 0) > 0);

      paidFlats.forEach((paid) => {
        const cleanFlat = paid.flatNumber.trim().toUpperCase();
        if (!rsvpMap.has(cleanFlat)) {
          const now = '2026-08-20T10:00:00Z';
          rsvpMap.set(cleanFlat, {
            id: normalizeFlatId(cleanFlat),
            buildingId: paid.buildingId as 'A' | 'B' | 'C',
            flatNumber: cleanFlat,
            residentName: cleanFlat === 'A-1007' ? 'Mr. Amit Singh' : paid.residentName,
            phone: '',
            adultsCount: 2,
            childrenCount: 0,
            totalHeadcount: 2,
            dietaryPreference: 'SATVIK',
            timeSlot: '8:00 PM - 10:00 PM',
            isVolunteering: false,
            notes: '',
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    } catch (err) {
      console.warn('Could not sync paid flats:', err);
    }

    const result = Array.from(rsvpMap.values());
    result.sort((a, b) => {
      if (a.buildingId !== b.buildingId) return a.buildingId.localeCompare(b.buildingId);
      const numA = parseInt(a.flatNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.flatNumber.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    return result;
  },

  /**
   * Fetch all Maha Prasad RSVPs
   */
  async getRSVPs(): Promise<MahaPrasadRSVP[]> {
    // 1. Fetch remote Firestore entries first
    let remote: MahaPrasadRSVP[] = [];
    try {
      const remoteData = await readCollection<MahaPrasadRSVP>(COLLECTION_NAME);
      if (remoteData && remoteData.length > 0) {
        remote = remoteData;
      }
    } catch (err) {
      console.warn('Could not load RSVPs from Firestore:', err);
    }

    // 2. Fetch local storage if remote empty
    if (remote.length === 0) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          remote = JSON.parse(stored);
        }
      } catch {
        remote = [];
      }
    }

    const merged = await this.mergeWithPaidFlats(remote);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }

    return merged;
  },

  /**
   * Sync all RSVP records directly into Firestore database
   */
  async syncToFirebase(): Promise<{ success: boolean; count: number }> {
    try {
      const rsvps = await this.getRSVPs();
      await writeBatchDocuments(COLLECTION_NAME, rsvps);
      return { success: true, count: rsvps.length };
    } catch (err) {
      console.error('Failed to sync RSVPs to Firebase:', err);
      return { success: false, count: 0 };
    }
  },

  /**
   * Add or update an RSVP entry in Firestore & local state
   */
  async saveRSVP(data: {
    id?: string;
    buildingId: 'A' | 'B' | 'C';
    flatNumber: string;
    residentName: string;
    phone: string;
    adultsCount: number;
    childrenCount: number;
    dietaryPreference?: string;
    timeSlot?: string;
    isVolunteering?: boolean;
    notes?: string;
  }): Promise<MahaPrasadRSVP> {
    const cleanFlat = data.flatNumber.trim().toUpperCase();
    const id = normalizeFlatId(cleanFlat);
    const totalHeadcount = (Number(data.adultsCount) || 0) + (Number(data.childrenCount) || 0);

    const now = new Date().toISOString();
    const record: MahaPrasadRSVP = {
      id,
      buildingId: data.buildingId,
      flatNumber: cleanFlat,
      residentName: cleanFlat === 'A-1007' ? 'Mr. Amit Singh' : data.residentName.trim(),
      phone: data.phone.trim(),
      adultsCount: Number(data.adultsCount) || 0,
      childrenCount: Number(data.childrenCount) || 0,
      totalHeadcount,
      dietaryPreference: 'SATVIK',
      timeSlot: data.timeSlot || '8:00 PM - 10:00 PM',
      isVolunteering: Boolean(data.isVolunteering),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    // Update local cache immediately
    try {
      const list = await this.getRSVPs();
      const idx = list.findIndex((r) => r.id === id || r.flatNumber === cleanFlat);
      if (idx !== -1) {
        record.createdAt = list[idx].createdAt || now;
        record.isRedeemed = list[idx].isRedeemed;
        record.redeemedAt = list[idx].redeemedAt;
        record.redeemedBy = list[idx].redeemedBy;
        list[idx] = record;
      } else {
        list.push(record);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Write directly to Firestore document
    try {
      await writeDocument(COLLECTION_NAME, record);
    } catch (e) {
      console.warn('Firestore write failed for saveRSVP:', e);
    }

    return record;
  },

  /**
   * Delete an RSVP entry from Firestore
   */
  async deleteRSVP(id: string): Promise<boolean> {
    try {
      const list = await this.getRSVPs();
      const filtered = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }

    try {
      await deleteDocument(COLLECTION_NAME, id);
    } catch {
      // ignore
    }

    return true;
  },

  /**
   * Scan & Redeem a Maha Prasad Pass
   */
  async redeemRSVP(
    tokenOrFlat: string,
    redeemedBy: string = 'Admin / Gate Volunteer'
  ): Promise<{ success: boolean; rsvp?: MahaPrasadRSVP; alreadyRedeemed?: boolean; error?: string }> {
    const list = await this.getRSVPs();
    const cleanToken = tokenOrFlat.trim().toUpperCase();

    // Find by exact id, flat number, or token format EUR-MAHA-PASS:FLAT:ID
    const found = list.find(
      (r) =>
        r.id.toUpperCase() === cleanToken ||
        r.flatNumber.toUpperCase() === cleanToken ||
        cleanToken.includes(r.flatNumber.toUpperCase()) ||
        cleanToken.includes(r.id.toUpperCase())
    );

    if (!found) {
      return {
        success: false,
        error: `Devotee flat (${cleanToken}) not found in RSVP list. Please register family first.`,
      };
    }

    if (found.isRedeemed) {
      return {
        success: false,
        alreadyRedeemed: true,
        rsvp: found,
        error: `Pass already EXPIRED / REDEEMED at ${new Date(found.redeemedAt || found.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Duplicate scan prevented.`,
      };
    }

    const now = new Date().toISOString();
    found.isRedeemed = true;
    found.redeemedAt = now;
    found.redeemedBy = redeemedBy;
    found.updatedAt = now;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    try {
      await writeDocument(COLLECTION_NAME, found);
    } catch (e) {
      console.warn('Firestore update failed for redemption:', e);
    }

    return {
      success: true,
      rsvp: found,
    };
  },

  /**
   * Reset pass redemption (undo check-in)
   */
  async resetRedemption(id: string): Promise<boolean> {
    const list = await this.getRSVPs();
    const found = list.find((r) => r.id === id);
    if (!found) return false;

    const now = new Date().toISOString();
    found.isRedeemed = false;
    found.redeemedAt = undefined;
    found.redeemedBy = undefined;
    found.updatedAt = now;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    try {
      await writeDocument(COLLECTION_NAME, found);
    } catch (e) {
      console.warn('Firestore update failed for reset redemption:', e);
    }

    return true;
  },

  /**
   * Calculate aggregated summary metrics
   */
  calculateSummary(list: MahaPrasadRSVP[]): MahaPrasadSummary {
    const totalAdults = list.reduce((acc, r) => acc + (r.adultsCount || 0), 0);
    const totalChildren = list.reduce((acc, r) => acc + (r.childrenCount || 0), 0);
    const totalHeadcount = totalAdults + totalChildren;
    const totalFamilies = list.length;
    const volunteersCount = list.filter((r) => r.isVolunteering).length;

    const redeemedEntries = list.filter((r) => r.isRedeemed);
    const redeemedCount = redeemedEntries.reduce((acc, r) => acc + (r.totalHeadcount || 0), 0);
    const redeemedFamiliesCount = redeemedEntries.length;

    const buildingBreakdown = {
      A: {
        families: list.filter((r) => r.buildingId === 'A' || r.flatNumber.startsWith('A-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'A' || r.flatNumber.startsWith('A-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
        redeemedHeadcount: list
          .filter((r) => (r.buildingId === 'A' || r.flatNumber.startsWith('A-')) && r.isRedeemed)
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
      B: {
        families: list.filter((r) => r.buildingId === 'B' || r.flatNumber.startsWith('B-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'B' || r.flatNumber.startsWith('B-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
        redeemedHeadcount: list
          .filter((r) => (r.buildingId === 'B' || r.flatNumber.startsWith('B-')) && r.isRedeemed)
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
      C: {
        families: list.filter((r) => r.buildingId === 'C' || r.flatNumber.startsWith('C-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'C' || r.flatNumber.startsWith('C-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
        redeemedHeadcount: list
          .filter((r) => (r.buildingId === 'C' || r.flatNumber.startsWith('C-')) && r.isRedeemed)
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
    };

    return {
      totalHeadcount,
      totalAdults,
      totalChildren,
      totalFamilies,
      satvikCount: totalHeadcount,
      volunteersCount,
      redeemedCount,
      redeemedFamiliesCount,
      buildingBreakdown,
    };
  },

  /**
   * Export RSVP Roster as CSV / Excel
   */
  exportRSVPRosterCSV(rsvps: MahaPrasadRSVP[]): void {
    const lines: string[] = [];
    lines.push('\uFEFF"EURISKA GANESHOTSAV 2026 - MAHA PRASAD RSVP ROSTER"');
    lines.push('"Date: Thursday, 24th September 2026 | Timing: 8:00 PM - 10:00 PM | Venue: Club House Podium"');
    lines.push(`"Generated on: ${new Date().toLocaleString('en-IN')}"`);
    lines.push('');

    const summary = this.calculateSummary(rsvps);
    lines.push('"EXECUTIVE SUMMARY"');
    lines.push(`"Total Devotees Headcount",${summary.totalHeadcount}`);
    lines.push(`"Total Registered Families",${summary.totalFamilies}`);
    lines.push(`"Adults Count",${summary.totalAdults}`);
    lines.push(`"Children Count (<12 yrs)",${summary.totalChildren}`);
    lines.push(`"Feast Type","Pure Satvik Maha Prasad"`);
    lines.push(`"Volunteer Helpers",${summary.volunteersCount}`);
    lines.push('');

    lines.push('"DETAILED RESIDENT RSVP LIST"');
    lines.push('"#","Wing","Flat No","Resident Name","Phone","Adults","Children","Total Headcount","Feast Type","Time Slot","Volunteering?","Notes"');

    rsvps.forEach((r, idx) => {
      lines.push(
        `${idx + 1},"${r.buildingId}","${r.flatNumber}","${r.residentName}","${r.phone || ''}",${r.adultsCount},${r.childrenCount},${r.totalHeadcount},"Satvik Maha Prasad","${r.timeSlot || '8:00 PM - 10:00 PM'}","${r.isVolunteering ? 'YES (Volunteer)' : 'No'}","${(r.notes || '').replace(/"/g, '""')}"`
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Euriska_Maha_Prasad_RSVP_Roster_24Sep2026.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
