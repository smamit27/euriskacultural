import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
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
  { key: 'drawing', label: 'Drawing', shortLabel: 'Drawing', emoji: '🎨', badgeBg: '#fef3c7', color: '#b45309' },
  { key: 'skit1', label: 'Skit 1', shortLabel: 'Skit 1', emoji: '🎭', badgeBg: '#ede9fe', color: '#6d28d9' },
  { key: 'skit2', label: 'Skit 2', shortLabel: 'Skit 2', emoji: '🎬', badgeBg: '#f5f3ff', color: '#7c3aed' },
  { key: 'dance', label: 'Dance', shortLabel: 'Dance', emoji: '💃', badgeBg: '#fce7f3', color: '#be185d' },
  { key: 'fashionShow', label: 'Fashion Show', shortLabel: 'Fashion', emoji: '✨', badgeBg: '#fae8ff', color: '#a21caf' },
  { key: 'mimicry', label: 'Mimicry', shortLabel: 'Mimicry', emoji: '🎙️', badgeBg: '#e0f2fe', color: '#0369a1' },
  { key: 'singing', label: 'Singing', shortLabel: 'Singing', emoji: '🎤', badgeBg: '#ecfdf5', color: '#047857' },
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
    const newId = `kala-${Date.now()}`;
    const newEntry: KalakritiEntry = {
      ...data,
      id: newId,
      sn: nextSn,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    if (db) {
      try {
        await setDoc(doc(db, COLLECTIONS.KALAKRITI, newId), newEntry);
      } catch (err) {
        console.warn('Firestore save failed, saved locally:', err);
      }
    }

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
    current[idx] = { ...current[idx], ...updates };

    if (db) {
      try {
        await updateDoc(doc(db, COLLECTIONS.KALAKRITI, id), updates);
      } catch (err) {
        console.warn('Firestore update failed:', err);
      }
    }

    this.saveLocalEntries(current);
    return current[idx];
  }

  /**
   * Delete participant from Firestore & localStorage
   */
  async deleteEntry(id: string): Promise<void> {
    if (db) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.KALAKRITI, id));
      } catch (err) {
        console.warn('Firestore delete failed:', err);
      }
    }

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

    if (db) {
      try {
        await updateDoc(doc(db, COLLECTIONS.KALAKRITI, id), {
          [activity]: newVal,
        });
      } catch (err) {
        console.warn('Firestore toggle failed:', err);
      }
    }

    this.saveLocalEntries(current);
    return current[idx];
  }

  /**
   * Compute counts for each activity category
   */
  async getActivityCounts(): Promise<Record<KalakritiActivityKey, number>> {
    const entries = await this.getEntries();
    const counts: Record<KalakritiActivityKey, number> = {
      drawing: 0,
      skit1: 0,
      skit2: 0,
      dance: 0,
      fashionShow: 0,
      mimicry: 0,
      singing: 0,
      fancyDress: 0,
    };
    entries.forEach((e) => {
      if (e.drawing) counts.drawing++;
      if (e.skit1) counts.skit1++;
      if (e.skit2) counts.skit2++;
      if (e.dance) counts.dance++;
      if (e.fashionShow) counts.fashionShow++;
      if (e.mimicry) counts.mimicry++;
      if (e.singing) counts.singing++;
      if (e.fancyDress) counts.fancyDress++;
    });
    return counts;
  }
}

export const kalakritiService = new KalakritiService();
