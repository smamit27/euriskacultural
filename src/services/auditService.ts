import { db, isFirebaseConfigured } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

export interface LoginLogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  status: 'SUCCESS' | 'FAILED';
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  deviceModel: string;
  os: string;
  browser: string;
  ip: string;
  location?: string;
  userAgent: string;
  screenSize: string;
}

const AUDIT_COLLECTION = 'admin_login_logs';
const LOCAL_AUDIT_KEY = 'euriska_admin_login_logs';

function parseDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceModel = 'Web Browser';

  // Device Type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // OS Detection
  if (/iPhone/i.test(ua)) {
    os = 'iOS';
    deviceModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    deviceModel = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    deviceModel = 'Android Device';
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

  // Browser Detection
  if (/Chrome/i.test(ua) && !/Edge|Edg|OPR|Opera/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/OPR|Opera/i.test(ua)) {
    browser = 'Opera';
  }

  const screenSize = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;

  return { deviceType, os, browser, deviceModel, screenSize };
}

export async function fetchPublicIPAndLocation(): Promise<{ ip: string; location?: string }> {
  // Provider 1: ipapi.co (IP + City + State + Country)
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const loc = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
        return { ip: data.ip, location: loc || undefined };
      }
    }
  } catch {}

  // Provider 2: ipwho.is (CORS-friendly free lookup)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const loc = [data.city, data.region, data.country].filter(Boolean).join(', ');
        return { ip: data.ip, location: loc || undefined };
      }
    }
  } catch {}

  // Provider 3: ipify
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) return { ip: data.ip };
    }
  } catch {}

  return { ip: 'Active Client Device' };
}

function getLocalLogs(): LoginLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(logs: LoginLogEntry[]) {
  try {
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
}

export const auditService = {
  /**
   * Log an Admin login event to Firebase Firestore with IP & Device
   */
  async logAdminLogin(status: 'SUCCESS' | 'FAILED'): Promise<void> {
    const { deviceType, os, browser, deviceModel, screenSize } = parseDeviceInfo();
    const { ip, location } = await fetchPublicIPAndLocation();

    const now = new Date();
    const timeFormatted = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    const entry: LoginLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      status,
      deviceType,
      deviceModel,
      os,
      browser,
      ip,
      location,
      userAgent: navigator.userAgent,
      screenSize,
    };

    // Save locally
    const local = getLocalLogs();
    local.unshift(entry);
    saveLocalLogs(local);

    // Save to Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, AUDIT_COLLECTION, entry.id);
        await setDoc(docRef, entry);
      } catch (err) {
        console.warn('Firebase audit log write failed:', err);
      }
    }
  },

  /**
   * Retrieve login history from Firebase Firestore
   */
  async getLoginLogs(): Promise<LoginLogEntry[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: LoginLogEntry[] = [];
          snapshot.forEach((d) => list.push(d.data() as LoginLogEntry));
          saveLocalLogs(list);
          return list;
        }
      } catch (err) {
        console.warn('Firebase audit logs fetch error, using local fallback:', err);
      }
    }
    return getLocalLogs();
  },

  /**
   * Real-time subscription to login logs
   */
  subscribeLoginLogs(callback: (logs: LoginLogEntry[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
        return onSnapshot(q, (snapshot) => {
          const list: LoginLogEntry[] = [];
          snapshot.forEach((d) => list.push(d.data() as LoginLogEntry));
          saveLocalLogs(list);
          callback(list);
        }, (err) => {
          console.warn('Audit logs realtime listener error:', err);
          callback(getLocalLogs());
        });
      } catch {
        callback(getLocalLogs());
      }
    }
    callback(getLocalLogs());
    return () => {};
  },
};
