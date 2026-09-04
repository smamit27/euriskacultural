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

export function isSameNetwork(ip1?: string, ip2?: string): boolean {
  if (!ip1 || !ip2) return false;
  const clean1 = ip1.trim();
  const clean2 = ip2.trim();
  if (clean1 === 'Unknown IP' || clean2 === 'Unknown IP' || !clean1 || !clean2) return false;

  // Exact match
  if (clean1 === clean2) return true;

  // If both are IPv4 addresses (e.g., same /24 router NAT subnet on home Wi-Fi)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m1 = clean1.match(ipv4Regex);
  const m2 = clean2.match(ipv4Regex);
  if (m1 && m2) {
    if (m1[1] === m2[1] && m1[2] === m2[2] && m1[3] === m2[3]) {
      return true;
    }
  }

  // If both are IPv6 addresses, compare /64 network prefix
  if (clean1.includes(':') && clean2.includes(':')) {
    const p1 = clean1.split(':').slice(0, 4).join(':');
    const p2 = clean2.split(':').slice(0, 4).join(':');
    if (p1 && p2 && p1 === p2) return true;
  }

  return false;
}

export async function fetchPublicIPAndLocation(): Promise<{ ip: string; location?: string }> {
  // Provider 1: ipify IPv4 (Forces consistent IPv4 format on all devices)
  try {
    const res = await fetch('https://api4.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip && data.ip !== '') {
        try {
          const locRes = await fetch(`https://ipwho.is/${data.ip}`, { signal: AbortSignal.timeout(1500) });
          if (locRes.ok) {
            const locData = await locRes.json();
            const loc = [locData.city, locData.region, locData.country].filter(Boolean).join(', ');
            return { ip: data.ip, location: loc || undefined };
          }
        } catch {}
        return { ip: data.ip };
      }
    }
  } catch {}

  // Provider 2: api.ipify.org fallback
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip && data.ip !== '') {
        return { ip: data.ip };
      }
    }
  } catch {}

  // Provider 3: icanhazip IPv4 plain text
  try {
    const res = await fetch('https://ipv4.icanhazip.com/', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const text = await res.text();
      const ip = text.trim();
      if (ip) return { ip };
    }
  } catch {}

  // Provider 4: ipwho.is (CORS-friendly free lookup)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const loc = [data.city, data.region, data.country].filter(Boolean).join(', ');
        return { ip: data.ip, location: loc || undefined };
      }
    }
  } catch {}

  // Provider 5: Cloudflare Trace
  try {
    const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const text = await res.text();
      const ipMatch = text.match(/ip=([^\n]+)/);
      const locMatch = text.match(/loc=([^\n]+)/);
      if (ipMatch && ipMatch[1]) {
        return { ip: ipMatch[1].trim(), location: locMatch ? locMatch[1].trim() : undefined };
      }
    }
  } catch {}

  return { ip: 'Unknown IP' };
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
