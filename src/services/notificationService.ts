import type { LiveStreamInfo } from '../types';

const NOTIFICATION_PREF_KEY = 'euriska_notifications_enabled';
const LAST_NOTIFIED_STREAM_KEY = 'euriska_last_notified_stream_id';

class NotificationService {
  /**
   * Check if the browser supports notifications
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission state
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Check if notifications are enabled by user
   */
  isEnabled(): boolean {
    return this.getPermission() === 'granted';
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(NOTIFICATION_PREF_KEY, 'true');
        this.playDevotionalChime();
        this.sendTestNotification();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  /**
   * Plays a pleasant harmonic temple bell chime using Web Audio API
   */
  playDevotionalChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const frequencies = [528, 792, 1056]; // Harmonics resembling a brass temple bell
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15 / (idx + 1), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8 + idx * 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + 2.5);
      });
    } catch {
      // Audio context might be restricted before user gesture; safe to ignore
    }
  }

  /**
   * Sends a test welcome notification
   */
  sendTestNotification(): void {
    if (!this.isEnabled()) return;

    try {
      const n = new Notification('🔔 Notifications Enabled!', {
        body: 'You will receive instant alerts when Daily Aarti & Live Darshan begins from Mandap.',
        icon: '/euriska_logo.png',
        badge: '/euriska_logo.png',
        tag: 'euriska-welcome',
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('Test notification failed:', e);
    }
  }

  /**
   * Broadcast Live Stream Notification to resident's device
   */
  sendLiveStreamNotification(streamInfo: LiveStreamInfo, onNavigate?: () => void): void {
    if (!this.isEnabled() || !streamInfo.isLive) return;

    // Prevent duplicate spam for the same stream broadcast session
    const sessionKey = `${streamInfo.youtubeVideoId || streamInfo.id}_${streamInfo.startedAt || 'live'}`;
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_STREAM_KEY);
    if (lastNotified === sessionKey) {
      return;
    }

    localStorage.setItem(LAST_NOTIFIED_STREAM_KEY, sessionKey);
    this.playDevotionalChime();

    try {
      const title = `🔴 LIVE NOW: ${streamInfo.title || 'Shree Ganesh Evening Maha Aarti'}`;
      const body = streamInfo.pinnedMessage || 'Daily Aarti & Live Darshan has started from Majestique Euriska Mandap. Tap to watch!';

      const notification = new Notification(title, {
        body,
        icon: '/euriska_logo.png',
        badge: '/euriska_logo.png',
        tag: 'euriska-livestream-active',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        if (onNavigate) {
          onNavigate();
        } else {
          window.location.href = '/livestream';
        }
        notification.close();
      };
    } catch (err) {
      console.warn('Failed to send live stream notification:', err);
    }
  }
}

export const notificationService = new NotificationService();
