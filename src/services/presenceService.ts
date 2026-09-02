import { db, isFirebaseConfigured } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

export interface ActiveSession {
  sessionId: string;
  lastActive: number;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  deviceModel: string;
  os: string;
  browser: string;
  role: 'ADMIN' | 'RESIDENT';
  page: string;
}

const PRESENCE_COLLECTION = 'active_sessions';
const SESSION_STORAGE_KEY = 'euriska_visitor_session_id';
const ONLINE_THRESHOLD_MS = 60 * 1000; // Active within last 60 seconds

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

function parseDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceModel = 'Web Browser';

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    deviceModel = /iPhone/i.test(ua) ? 'iPhone' : /iPad/i.test(ua) ? 'iPad' : 'iOS Device';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    deviceModel = 'Android Phone';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    deviceModel = 'Mac';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    deviceModel = 'Windows PC';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    deviceModel = 'Linux Device';
  }

  if (/Chrome/i.test(ua) && !/Edge|Edg|OPR|Opera/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge';
  }

  return { deviceType, os, browser, deviceModel };
}

class PresenceManager {
  private sessionId = getOrCreateSessionId();
  private intervalId: any = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private listeners: ((sessions: ActiveSession[]) => void)[] = [];
  private currentSessions: ActiveSession[] = [];
  private currentPage = 'Home';
  private currentRole: 'ADMIN' | 'RESIDENT' = 'RESIDENT';

  init(role: 'ADMIN' | 'RESIDENT', page: string) {
    this.currentRole = role;
    this.currentPage = page;

    // Send first heartbeat
    this.sendHeartbeat();

    // Send heartbeat every 25 seconds
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.sendHeartbeat();
      }, 25000);
    }

    // Clean up on tab close
    window.addEventListener('beforeunload', () => {
      this.leave();
    });

    // Send heartbeat when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      }
    });

    // Start real-time Firestore listener
    this.startListening();
  }

  updateState(role: 'ADMIN' | 'RESIDENT', page: string) {
    this.currentRole = role;
    this.currentPage = page;
    this.sendHeartbeat();
  }

  private async sendHeartbeat() {
    if (!isFirebaseConfigured || !db) return;

    const { deviceType, os, browser, deviceModel } = parseDeviceInfo();
    const data: ActiveSession = {
      sessionId: this.sessionId,
      lastActive: Date.now(),
      deviceType,
      deviceModel,
      os,
      browser,
      role: this.currentRole,
      page: this.currentPage,
    };

    try {
      const docRef = doc(db, PRESENCE_COLLECTION, this.sessionId);
      await setDoc(docRef, data);
    } catch {
      // Ignore background network error
    }
  }

  private async leave() {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, PRESENCE_COLLECTION, this.sessionId);
      await deleteDoc(docRef);
    } catch {
      // Ignore
    }
  }

  private startListening() {
    if (this.unsubscribeFirestore) return;
    if (!isFirebaseConfigured || !db) return;

    try {
      const colRef = collection(db, PRESENCE_COLLECTION);
      this.unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        const now = Date.now();
        const activeList: ActiveSession[] = [];

        snapshot.forEach((docSnap) => {
          const s = docSnap.data() as ActiveSession;
          // Filter only sessions active within the last 60 seconds
          if (now - s.lastActive < ONLINE_THRESHOLD_MS) {
            activeList.push(s);
          }
        });

        // If local user isn't in remote yet, make sure count is at least 1
        if (!activeList.some((s) => s.sessionId === this.sessionId)) {
          const { deviceType, os, browser, deviceModel } = parseDeviceInfo();
          activeList.push({
            sessionId: this.sessionId,
            lastActive: now,
            deviceType,
            deviceModel,
            os,
            browser,
            role: this.currentRole,
            page: this.currentPage,
          });
        }

        this.currentSessions = activeList;
        this.notifyListeners();
      }, (error) => {
        console.warn('Presence listener error:', error);
      });
    } catch (err) {
      console.warn('Could not initialize presence listener:', err);
    }
  }

  subscribe(callback: (sessions: ActiveSession[]) => void) {
    this.listeners.push(callback);
    callback(this.currentSessions);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.currentSessions));
  }
}

export const presenceService = new PresenceManager();
