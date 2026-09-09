import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInAnonymously, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCZeboR_JxDVN0Xre0HX_4ZCBKZcKf3C88',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'euriskacultural.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'euriskacultural',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'euriskacultural.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '383180274376',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:383180274376:web:0cbe1790c9699850dc43fd',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-L3Z0R0XQDE',
};

export const isFirebaseConfigured = true;

export const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export async function ensureFirebaseSession() {
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    // If anonymous auth is not enabled in Firebase Console, continue without auth session
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged((user) => {
        unsub();
        resolve(user);
      });
    });
  }
}

// Auto-run session check
if (typeof window !== 'undefined') {
  ensureFirebaseSession().catch(() => {});
}
