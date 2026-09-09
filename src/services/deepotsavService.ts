import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export interface LightedDiya {
  id: string;
  name: string;
  flatNo: string;
  message?: string;
  color?: string;
  timestamp: number;
  posX?: number;
  posZ?: number;
}

const LOCAL_STORAGE_KEY = 'euriska_deepotsav_diyas';

// Default starter community diyas
const INITIAL_DIYAS: LightedDiya[] = [
  { id: 'diya-1', name: 'Cultural Committee', flatNo: 'Euriska Core', message: 'May Lord Ganesha bring bliss & prosperity to all!', color: '#f59e0b', timestamp: Date.now() - 3600000 * 2, posX: 0, posZ: 0 },
  { id: 'diya-2', name: 'Sharma Family', flatNo: 'A-304', message: 'Happy Ganesh Utsav 2026!', color: '#ef4444', timestamp: Date.now() - 3600000, posX: -2.5, posZ: 1.5 },
  { id: 'diya-3', name: 'Patil Family', flatNo: 'B-102', message: 'Ganpati Bappa Morya!', color: '#ec4899', timestamp: Date.now() - 1800000, posX: 2.2, posZ: -1.8 },
  { id: 'diya-4', name: 'Deshmukh Family', flatNo: 'C-701', message: 'Peace and harmony for Euriska residents!', color: '#8b5cf6', timestamp: Date.now() - 900000, posX: -1.8, posZ: -2.2 },
  { id: 'diya-5', name: 'Youth Group', flatNo: 'Wing D', message: 'Joyous festivities to everyone!', color: '#10b981', timestamp: Date.now() - 300000, posX: 2.8, posZ: 2.0 },
];

export const deepotsavService = {
  getStoredDiyas(): LightedDiya[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return INITIAL_DIYAS;
  },

  subscribeDiyas(callback: (diyas: LightedDiya[]) => void): () => void {
    if (!db) {
      callback(this.getStoredDiyas());
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'deepotsav_diyas'),
        orderBy('timestamp', 'desc'),
        limit(60)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            callback(this.getStoredDiyas());
            return;
          }
          const diyas: LightedDiya[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Resident',
              flatNo: data.flatNo || '',
              message: data.message || '',
              color: data.color || '#f59e0b',
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              posX: data.posX ?? (Math.random() * 8 - 4),
              posZ: data.posZ ?? (Math.random() * 8 - 4),
            };
          });
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diyas));
          } catch {
            // ignore
          }
          callback(diyas);
        },
        (err) => {
          console.warn('Firestore deepotsav subscription fallback to local:', err);
          callback(this.getStoredDiyas());
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Error connecting to deepotsav collection:', err);
      callback(this.getStoredDiyas());
      return () => {};
    }
  },

  async lightDiya(name: string, flatNo: string, message: string = '', color: string = '#f59e0b'): Promise<LightedDiya> {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.2 + Math.random() * 3.5;
    const posX = Math.cos(angle) * radius;
    const posZ = Math.sin(angle) * radius;

    const newDiya: LightedDiya = {
      id: 'diya-' + Date.now(),
      name: name.trim() || 'Resident',
      flatNo: flatNo.trim() || 'Euriska',
      message: message.trim(),
      color,
      timestamp: Date.now(),
      posX,
      posZ,
    };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'deepotsav_diyas'), {
          name: newDiya.name,
          flatNo: newDiya.flatNo,
          message: newDiya.message,
          color: newDiya.color,
          timestamp: serverTimestamp(),
          posX: newDiya.posX,
          posZ: newDiya.posZ,
        });
        newDiya.id = docRef.id;
      } catch (e) {
        console.warn('Failed to save diya to Firestore, storing locally:', e);
      }
    }

    // Save locally
    const current = this.getStoredDiyas();
    const updated = [newDiya, ...current.filter((d) => d.id !== newDiya.id)].slice(0, 80);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return newDiya;
  },
};
