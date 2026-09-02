import { readCollection, writeDocument, deleteDocument } from './firestoreService';
import { INITIAL_MAHA_PRASAD_RSVPS } from './seedData';
import type { MahaPrasadRSVP, MahaPrasadSummary } from '../types';

const STORAGE_KEY = 'euriska_maha_prasad_rsvp';
const COLLECTION_NAME = 'maha_prasad_rsvp';

export const rsvpService = {
  /**
   * Fetch all Maha Prasad RSVPs (Firestore with LocalStorage cache fallback)
   */
  async getRSVPs(): Promise<MahaPrasadRSVP[]> {
    let local: MahaPrasadRSVP[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        local = JSON.parse(stored);
        const localFlats = new Set(local.map((r) => r.flatNumber));
        let hasNew = false;
        INITIAL_MAHA_PRASAD_RSVPS.forEach((item) => {
          if (!localFlats.has(item.flatNumber)) {
            local.push(item);
            hasNew = true;
          }
        });
        if (hasNew) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
        }
      } else {
        local = INITIAL_MAHA_PRASAD_RSVPS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      }
    } catch {
      local = INITIAL_MAHA_PRASAD_RSVPS;
    }

    try {
      const remote = await readCollection<MahaPrasadRSVP>(COLLECTION_NAME);
      if (remote && remote.length > 0) {
        const remoteMap = new Map<string, MahaPrasadRSVP>(remote.map((r: MahaPrasadRSVP) => [r.id, r]));
        const merged: MahaPrasadRSVP[] = local.map((item) => remoteMap.get(item.id) || item);
        remote.forEach((r: MahaPrasadRSVP) => {
          if (!local.some((l) => l.id === r.id)) {
            merged.push(r);
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Could not load RSVPs from Firestore, using local cache:', err);
    }

    return local;
  },

  /**
   * Add or update an RSVP entry
   */
  async saveRSVP(data: {
    id?: string;
    buildingId: 'A' | 'B' | 'C';
    flatNumber: string;
    residentName: string;
    phone: string;
    adultsCount: number;
    childrenCount: number;
    dietaryPreference: 'REGULAR' | 'JAIN';
    timeSlot?: string;
    isVolunteering?: boolean;
    notes?: string;
  }): Promise<MahaPrasadRSVP> {
    const list = await this.getRSVPs();
    const cleanFlat = data.flatNumber.trim().toUpperCase();
    const id = data.id || `rsvp-${cleanFlat.replace(/[^A-Z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const totalHeadcount = (Number(data.adultsCount) || 0) + (Number(data.childrenCount) || 0);

    const now = new Date().toISOString();
    const record: MahaPrasadRSVP = {
      id,
      buildingId: data.buildingId,
      flatNumber: cleanFlat,
      residentName: data.residentName.trim(),
      phone: data.phone.trim(),
      adultsCount: Number(data.adultsCount) || 0,
      childrenCount: Number(data.childrenCount) || 0,
      totalHeadcount,
      dietaryPreference: data.dietaryPreference || 'REGULAR',
      timeSlot: data.timeSlot || '8:00 PM - 9:00 PM',
      isVolunteering: Boolean(data.isVolunteering),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    const idx = list.findIndex((r) => r.id === id || r.flatNumber === cleanFlat);
    if (idx !== -1) {
      record.createdAt = list[idx].createdAt || now;
      list[idx] = record;
    } else {
      list.push(record);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    try {
      await writeDocument(COLLECTION_NAME, record);
    } catch (e) {
      console.warn('Firestore write failed:', e);
    }

    return record;
  },

  /**
   * Delete an RSVP entry
   */
  async deleteRSVP(id: string): Promise<boolean> {
    const list = await this.getRSVPs();
    const filtered = list.filter((r) => r.id !== id);

    try {
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
   * Calculate aggregated summary metrics
   */
  calculateSummary(list: MahaPrasadRSVP[]): MahaPrasadSummary {
    const totalAdults = list.reduce((acc, r) => acc + (r.adultsCount || 0), 0);
    const totalChildren = list.reduce((acc, r) => acc + (r.childrenCount || 0), 0);
    const totalHeadcount = totalAdults + totalChildren;
    const totalFamilies = list.length;

    const jainCount = list
      .filter((r) => r.dietaryPreference === 'JAIN')
      .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0);

    const regularCount = totalHeadcount - jainCount;
    const volunteersCount = list.filter((r) => r.isVolunteering).length;

    const buildingBreakdown = {
      A: {
        families: list.filter((r) => r.buildingId === 'A' || r.flatNumber.startsWith('A-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'A' || r.flatNumber.startsWith('A-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
      B: {
        families: list.filter((r) => r.buildingId === 'B' || r.flatNumber.startsWith('B-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'B' || r.flatNumber.startsWith('B-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
      C: {
        families: list.filter((r) => r.buildingId === 'C' || r.flatNumber.startsWith('C-')).length,
        headcount: list
          .filter((r) => r.buildingId === 'C' || r.flatNumber.startsWith('C-'))
          .reduce((acc, r) => acc + (r.totalHeadcount || 0), 0),
      },
    };

    return {
      totalHeadcount,
      totalAdults,
      totalChildren,
      totalFamilies,
      jainCount,
      regularCount,
      volunteersCount,
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
    lines.push(`"Jain Meal Headcount",${summary.jainCount}`);
    lines.push(`"Regular Satvik Headcount",${summary.regularCount}`);
    lines.push(`"Volunteer Helpers",${summary.volunteersCount}`);
    lines.push('');

    lines.push('"DETAILED RESIDENT RSVP LIST"');
    lines.push('"#","Wing","Flat No","Resident Name","Phone","Adults","Children","Total Headcount","Dietary Preference","Time Slot","Volunteering?","Notes"');

    rsvps.forEach((r, idx) => {
      lines.push(
        `${idx + 1},"${r.buildingId}","${r.flatNumber}","${r.residentName}","${r.phone || ''}",${r.adultsCount},${r.childrenCount},${r.totalHeadcount},"${r.dietaryPreference === 'JAIN' ? 'JAIN (No Onion/Garlic)' : 'REGULAR SATVIK'}","${r.timeSlot || '8-10 PM'}","${r.isVolunteering ? 'YES (Volunteer)' : 'No'}","${(r.notes || '').replace(/"/g, '""')}"`
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
