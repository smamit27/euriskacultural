import { contributionService } from './contributionService';
import { rsvpService } from './rsvpService';
import { prasadService } from './prasadService';

export interface SyncResult {
  contributions: { success: number; failed: number; total: number };
  rsvps?: { success: number; failed: number; total: number };
  prasadSlots?: { success: number; failed: number; total: number };
  expenses?: { success: number; failed: number; total: number };
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
}

export const syncService = {
  async syncAllDataToFirebase(): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // 1. Sync contributions (All 138+ paid flats)
      const contribResult = await contributionService.syncToFirebase();

      // 2. Sync Maha Prasad RSVPs
      const rsvpResult = await rsvpService.syncToFirebase();
      const rsvps = {
        success: rsvpResult.success ? rsvpResult.count : 0,
        failed: rsvpResult.success ? 0 : rsvpResult.count,
        total: rsvpResult.count,
      };

      // 3. Sync Daily Prasad Slots
      let prasadCount = 0;
      try {
        const slots = await prasadService.getSlots();
        prasadCount = slots.length;
      } catch {
        // ignore
      }

      const hasFailures = contribResult.failed > 0 || !rsvpResult.success;
      const status = hasFailures ? 'partial' : 'success';

      const result: SyncResult = {
        contributions: contribResult,
        rsvps,
        prasadSlots: { success: prasadCount, failed: 0, total: prasadCount },
        timestamp,
        status,
      };

      console.log('Firebase Cloud Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Firebase Cloud Sync failed:', error);
      return {
        contributions: { success: 0, failed: 0, total: 0 },
        timestamp,
        status: 'failed',
      };
    }
  },

  async syncContributionsOnly(): Promise<SyncResult['contributions']> {
    try {
      const result = await contributionService.syncToFirebase();
      console.log('Contributions sync result:', result);
      return result;
    } catch (error) {
      console.error('Contributions sync failed:', error);
      return { success: 0, failed: 0, total: 0 };
    }
  },
};
