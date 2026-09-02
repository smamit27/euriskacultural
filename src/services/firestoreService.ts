import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  });
  return clean;
}

export async function readCollection<T>(name: string): Promise<T[] | null> {
  if (!db) return null;

  try {
    const snapshot = await getDocs(collection(db, name));
    if (snapshot.empty) return null;
    return snapshot.docs.map((item) => item.data() as T);
  } catch (error) {
    console.warn(`Unable to read ${name} from Firestore.`, error);
    return null;
  }
}

export function subscribeCollection<T>(name: string, callback: (items: T[]) => void): () => void {
  if (!db) return () => {};

  try {
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as T);
        callback(items);
      },
      (error) => {
        console.warn(`Realtime subscription error on ${name}:`, error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn(`Failed to initialize subscription on ${name}:`, error);
    return () => {};
  }
}

export async function writeDocument<T extends { id: string }>(name: string, data: T): Promise<void> {
  if (!db) return;
  const sanitized = sanitizeForFirestore(data);
  await setDoc(doc(db, name, data.id), sanitized, { merge: true });
}

export async function writeBatchDocuments<T extends { id: string }>(name: string, items: T[]): Promise<void> {
  const firestore = db;
  if (!firestore || items.length === 0) return;
  try {
    // Firestore allows max 500 writes per batch
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(firestore);
      chunk.forEach((item) => {
        const sanitized = sanitizeForFirestore(item);
        batch.set(doc(firestore, name, item.id), sanitized, { merge: true });
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn(`Batch write to ${name} failed:`, error);
  }
}

export async function deleteDocument(name: string, id: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, name, id));
  } catch (error) {
    console.warn(`Unable to delete document ${id} from ${name}:`, error);
  }
}

