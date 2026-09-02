import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
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

export async function writeDocument<T extends { id: string }>(name: string, data: T): Promise<void> {
  if (!db) return;
  const sanitized = sanitizeForFirestore(data);
  await setDoc(doc(db, name, data.id), sanitized, { merge: true });
}

export async function deleteDocument(name: string, id: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, name, id));
  } catch (error) {
    console.warn(`Unable to delete document ${id} from ${name}:`, error);
  }
}

