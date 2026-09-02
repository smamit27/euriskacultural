import { db, isFirebaseConfigured } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { PrasadSlot, PrasadBooking } from '../types';

const PRASAD_COLLECTION = 'prasad_slots';
const LOCAL_STORAGE_KEY = 'euriska_prasad_slots_live_v2';

// Default 12 days of Ganesh Chaturthi 2026 (Sep 14 to Sep 25, 8:00 PM)
const DEFAULT_SLOTS: PrasadSlot[] = [
  {
    id: '2026-09-14',
    dayNumber: 1,
    date: '2026-09-14',
    dateDisplay: 'Mon, 14 Sep 2026',
    dayLabel: 'Day 1 — Ganesh Sthapana & Aagman (5:00 PM)',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad (Aagman @ 5 PM)',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-15',
    dayNumber: 2,
    date: '2026-09-15',
    dateDisplay: 'Tue, 15 Sep 2026',
    dayLabel: 'Day 2 — Evening Aarti & Bhajan',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-16',
    dayNumber: 3,
    date: '2026-09-16',
    dateDisplay: 'Wed, 16 Sep 2026',
    dayLabel: 'Day 3 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-17',
    dayNumber: 4,
    date: '2026-09-17',
    dateDisplay: 'Thu, 17 Sep 2026',
    dayLabel: 'Day 4 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-18',
    dayNumber: 5,
    date: '2026-09-18',
    dateDisplay: 'Fri, 18 Sep 2026',
    dayLabel: 'Day 5 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-19',
    dayNumber: 6,
    date: '2026-09-19',
    dateDisplay: 'Sat, 19 Sep 2026',
    dayLabel: 'Day 6 — Kalakriti Cultural Activities & Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti (Activities from 6:00 PM)',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-20',
    dayNumber: 7,
    date: '2026-09-20',
    dateDisplay: 'Sun, 20 Sep 2026',
    dayLabel: 'Day 7 — Cultural Stage Performances & Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti (Performances from 6:30 PM)',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-21',
    dayNumber: 8,
    date: '2026-09-21',
    dateDisplay: 'Mon, 21 Sep 2026',
    dayLabel: 'Day 8 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-22',
    dayNumber: 9,
    date: '2026-09-22',
    dateDisplay: 'Tue, 22 Sep 2026',
    dayLabel: 'Day 9 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-23',
    dayNumber: 10,
    date: '2026-09-23',
    dateDisplay: 'Wed, 23 Sep 2026',
    dayLabel: 'Day 10 — Evening Aarti',
    time: '8:00 PM',
    aartiName: 'Evening Maha Aarti & Prasad',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-24',
    dayNumber: 11,
    date: '2026-09-24',
    dateDisplay: 'Thu, 24 Sep 2026',
    dayLabel: 'Day 11 — Maha Prasad Community Dinner (8:30 PM)',
    time: '8:00 PM',
    aartiName: 'Maha Aarti (8 PM) & Maha Prasad Dinner (~8:30 PM)',
    isBooked: false,
    bookings: [],
  },
  {
    id: '2026-09-25',
    dayNumber: 12,
    date: '2026-09-25',
    dateDisplay: 'Fri, 25 Sep 2026',
    dayLabel: 'Day 12 — Ganesh Visarjan Procession (4:00 PM)',
    time: '8:00 PM',
    aartiName: 'Final Visarjan Maha Aarti (Visarjan @ 4 PM)',
    isBooked: false,
    bookings: [],
  },
];

function getLocalCache(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('euriska_prasad_slots_live');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCache(cache: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save prasad slots cache:', e);
  }
}

/**
 * Normalizes raw slot data from Firestore or cache to always include a valid `bookings` array
 */
function normalizeSlot(base: PrasadSlot, raw: any): PrasadSlot {
  if (!raw) return { ...base, bookings: [] };

  let bookings: PrasadBooking[] = [];

  if (Array.isArray(raw.bookings) && raw.bookings.length > 0) {
    bookings = raw.bookings.map((b: any, idx: number) => ({
      id: b.id || `pb-${base.id}-${idx}`,
      flatNumber: (b.flatNumber || '').trim().toUpperCase(),
      residentName: (b.residentName || '').trim(),
      phone: (b.phone || '').trim(),
      prasadItem: (b.prasadItem || 'Modak & Fruits').trim(),
      notes: (b.notes || '').trim(),
      bookedAt: b.bookedAt || new Date().toISOString(),
    }));
  } else if (raw.flatNumber && raw.residentName) {
    // Legacy single booking fallback
    bookings = [
      {
        id: raw.bookingId || `legacy-${base.id}`,
        flatNumber: (raw.flatNumber || '').trim().toUpperCase(),
        residentName: (raw.residentName || '').trim(),
        phone: (raw.phone || '').trim(),
        prasadItem: (raw.prasadItem || 'Modak & Fruits').trim(),
        notes: (raw.notes || '').trim(),
        bookedAt: raw.bookedAt || new Date().toISOString(),
      },
    ];
  }

  const isBooked = bookings.length > 0;
  const primary = bookings[0];

  return {
    ...base,
    ...raw,
    bookings,
    isBooked,
    flatNumber: primary ? primary.flatNumber : undefined,
    residentName: primary ? primary.residentName : undefined,
    phone: primary ? primary.phone : undefined,
    prasadItem: primary ? primary.prasadItem : undefined,
    notes: primary ? primary.notes : undefined,
    bookedAt: primary ? primary.bookedAt : undefined,
  };
}

export const prasadService = {
  /**
   * Fetch all 12 Prasad slots with live Firebase bookings merged
   */
  async getSlots(): Promise<PrasadSlot[]> {
    const baseSlots = DEFAULT_SLOTS.map((s) => ({ ...s, bookings: [] as PrasadBooking[] }));
    const localCache = getLocalCache();

    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, PRASAD_COLLECTION));
        const firestoreMap: Record<string, any> = {};
        querySnapshot.forEach((docSnap) => {
          firestoreMap[docSnap.id] = docSnap.data();
        });

        // Update local cache
        saveLocalCache(firestoreMap);

        return baseSlots.map((slot) => {
          const remote = firestoreMap[slot.id];
          return normalizeSlot(slot, remote);
        });
      } catch (err) {
        console.warn('Firebase prasad fetch error, using local fallback:', err);
      }
    }

    // Fallback using local cache
    return baseSlots.map((slot) => {
      const cached = localCache[slot.id];
      return normalizeSlot(slot, cached);
    });
  },

  /**
   * Add a new family booking or update an existing booking on a date slot
   */
  async addOrUpdateBooking(
    slotId: string,
    booking: {
      id?: string;
      flatNumber: string;
      residentName: string;
      phone?: string;
      prasadItem?: string;
      notes?: string;
    }
  ): Promise<void> {
    const slots = await this.getSlots();
    const currentSlot = slots.find((s) => s.id === slotId) || {
      ...DEFAULT_SLOTS.find((s) => s.id === slotId)!,
      bookings: [],
      isBooked: false,
    };

    const existingBookings = [...(currentSlot.bookings || [])];
    const newOrUpdatedBooking: PrasadBooking = {
      id: booking.id || `pb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      flatNumber: booking.flatNumber.trim().toUpperCase(),
      residentName: booking.residentName.trim(),
      phone: booking.phone?.trim() || '',
      prasadItem: booking.prasadItem?.trim() || 'Modak & Fruits',
      notes: booking.notes?.trim() || '',
      bookedAt: new Date().toISOString(),
    };

    if (booking.id) {
      const idx = existingBookings.findIndex((b) => b.id === booking.id);
      if (idx >= 0) {
        existingBookings[idx] = { ...existingBookings[idx], ...newOrUpdatedBooking };
      } else {
        existingBookings.push(newOrUpdatedBooking);
      }
    } else {
      existingBookings.push(newOrUpdatedBooking);
    }

    const slotDoc = {
      id: slotId,
      bookings: existingBookings,
      isBooked: true,
      flatNumber: existingBookings[0].flatNumber,
      residentName: existingBookings[0].residentName,
      phone: existingBookings[0].phone,
      prasadItem: existingBookings[0].prasadItem,
      notes: existingBookings[0].notes,
      updatedAt: new Date().toISOString(),
    };

    // Update local cache
    const cache = getLocalCache();
    cache[slotId] = slotDoc;
    saveLocalCache(cache);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, PRASAD_COLLECTION, slotId);
        await setDoc(docRef, slotDoc, { merge: true });
      } catch (err) {
        console.error('Firebase prasad booking error:', err);
        throw err;
      }
    }
  },

  /**
   * Delete a specific family booking from a slot
   */
  async deleteBooking(slotId: string, bookingId: string): Promise<void> {
    const slots = await this.getSlots();
    const currentSlot = slots.find((s) => s.id === slotId);
    if (!currentSlot) return;

    const remainingBookings = (currentSlot.bookings || []).filter((b) => b.id !== bookingId);

    const cache = getLocalCache();

    if (remainingBookings.length === 0) {
      delete cache[slotId];
      saveLocalCache(cache);

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, PRASAD_COLLECTION, slotId);
          await deleteDoc(docRef);
        } catch (err) {
          console.error('Firebase prasad cancel error:', err);
          throw err;
        }
      }
    } else {
      const slotDoc = {
        id: slotId,
        bookings: remainingBookings,
        isBooked: true,
        flatNumber: remainingBookings[0].flatNumber,
        residentName: remainingBookings[0].residentName,
        phone: remainingBookings[0].phone,
        prasadItem: remainingBookings[0].prasadItem,
        notes: remainingBookings[0].notes,
        updatedAt: new Date().toISOString(),
      };

      cache[slotId] = slotDoc;
      saveLocalCache(cache);

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, PRASAD_COLLECTION, slotId);
          await setDoc(docRef, slotDoc, { merge: true });
        } catch (err) {
          console.error('Firebase prasad delete booking error:', err);
          throw err;
        }
      }
    }
  },

  /**
   * Legacy wrapper for booking a slot
   */
  async bookSlot(
    slotId: string,
    booking: {
      id?: string;
      flatNumber: string;
      residentName: string;
      phone?: string;
      prasadItem?: string;
      notes?: string;
    }
  ): Promise<void> {
    return this.addOrUpdateBooking(slotId, booking);
  },

  /**
   * Cancel / Reset an entire Prasad Slot (all families)
   */
  async cancelSlot(slotId: string): Promise<void> {
    // Update local cache
    const cache = getLocalCache();
    delete cache[slotId];
    saveLocalCache(cache);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, PRASAD_COLLECTION, slotId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('Firebase prasad cancel error:', err);
        throw err;
      }
    }
  },
};
