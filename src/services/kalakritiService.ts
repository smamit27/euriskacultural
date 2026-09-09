import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { writeDocument, deleteDocument, writeBatchDocuments, subscribeCollection } from './firestoreService';
import type { KalakritiEntry, KalakritiActivityKey } from '../types';

const STORAGE_KEY = 'euriska_kalakriti_entries_live';

export const KALAKRITI_ACTIVITIES: {
  key: KalakritiActivityKey;
  label: string;
  shortLabel: string;
  emoji: string;
  badgeBg: string;
  color: string;
}[] = [
  { key: 'dance', label: 'Dance', shortLabel: 'Dance', emoji: '💃', badgeBg: '#fce7f3', color: '#be185d' },
  { key: 'fancyDress', label: 'Fancy Dress', shortLabel: 'Fancy Dress', emoji: '👑', badgeBg: '#fff7ed', color: '#c2410c' },
];

class KalakritiService {
  private getLocalEntries(): KalakritiEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveLocalEntries(entries: KalakritiEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }

  /**
   * Real-time subscription to Kalakriti roster
   */
  subscribeEntries(callback: (entries: KalakritiEntry[]) => void): () => void {
    // 1. Send initial local entries immediately
    const initial = this.getLocalEntries();
    if (initial.length > 0) {
      callback(initial);
    }
    this.getEntries().then((list) => {
      callback(list);
    });

    // 2. Real-time onSnapshot from Firestore
    return subscribeCollection<KalakritiEntry>(COLLECTIONS.KALAKRITI, async (remoteDocs) => {
      if (remoteDocs && remoteDocs.length > 0) {
        // Sort by sn
        const sorted = [...remoteDocs].sort((a, b) => (a.sn || 0) - (b.sn || 0));
        this.saveLocalEntries(sorted);
        callback(sorted);
      } else {
        const local = this.getLocalEntries();
        if (local.length > 0) {
          await writeBatchDocuments(COLLECTIONS.KALAKRITI, local);
          callback(local);
        } else {
          callback([]);
        }
      }
    });
  }

  /**
   * Fetch all Kalakriti participants.
   * Checks Firestore first, with fallback to localStorage.
   */
  async getEntries(): Promise<KalakritiEntry[]> {
    if (db) {
      try {
        const colRef = collection(db, COLLECTIONS.KALAKRITI);
        const q = query(colRef, orderBy('sn', 'asc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: KalakritiEntry[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as KalakritiEntry);
          });
          this.saveLocalEntries(list);
          return list;
        } else {
          // If Firestore is empty but local has entries, sync to Firestore
          const local = this.getLocalEntries();
          if (local.length > 0) {
            await writeBatchDocuments(COLLECTIONS.KALAKRITI, local);
          }
        }
      } catch (err) {
        console.warn('Firestore fetch failed, using local cache:', err);
      }
    }
    return this.getLocalEntries();
  }

  /**
   * Add a new participant to Firestore & localStorage
   */
  async addEntry(
    data: Omit<KalakritiEntry, 'id' | 'sn' | 'createdAt'>
  ): Promise<KalakritiEntry> {
    const current = await this.getEntries();
    const nextSn = current.length > 0 ? Math.max(...current.map((e) => e.sn)) + 1 : 1;
    const newId = `kala-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: KalakritiEntry = {
      ...data,
      id: newId,
      sn: nextSn,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore with automatic sanitization
    await writeDocument(COLLECTIONS.KALAKRITI, newEntry);

    // Save to localStorage
    current.push(newEntry);
    this.saveLocalEntries(current);
    return newEntry;
  }

  /**
   * Update participant details in Firestore & localStorage
   */
  async updateEntry(
    id: string,
    updates: Partial<KalakritiEntry>
  ): Promise<KalakritiEntry> {
    const current = this.getLocalEntries();
    const idx = current.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Entry not found');
    const updatedRecord = { ...current[idx], ...updates, id };
    current[idx] = updatedRecord;

    await writeDocument(COLLECTIONS.KALAKRITI, updatedRecord);
    this.saveLocalEntries(current);
    return current[idx];
  }

  /**
   * Delete participant from Firestore & localStorage
   */
  async deleteEntry(id: string): Promise<void> {
    await deleteDocument(COLLECTIONS.KALAKRITI, id);

    let current = this.getLocalEntries();
    current = current.filter((e) => e.id !== id);
    // Re-index serial numbers
    current.forEach((e, idx) => {
      e.sn = idx + 1;
    });
    this.saveLocalEntries(current);
  }

  /**
   * Toggle a specific activity for a participant
   */
  async toggleActivity(
    id: string,
    activity: KalakritiActivityKey
  ): Promise<KalakritiEntry> {
    const current = this.getLocalEntries();
    const idx = current.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Entry not found');
    const newVal = !current[idx][activity];
    current[idx][activity] = newVal;

    await writeDocument(COLLECTIONS.KALAKRITI, current[idx]);

    this.saveLocalEntries(current);
    return current[idx];
  }

  /**
   * Compute counts for each activity category
   */
  async getActivityCounts(): Promise<Record<KalakritiActivityKey, number>> {
    const entries = await this.getEntries();
    const counts: Record<KalakritiActivityKey, number> = {
      dance: 0,
      fancyDress: 0,
    };
    entries.forEach((e) => {
      if (e.dance) counts.dance++;
      if (e.fancyDress) counts.fancyDress++;
    });
    return counts;
  }
}

export const kalakritiService = new KalakritiService();
