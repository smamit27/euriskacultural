import { contributionService } from './contributionService';

export interface SyncResult {
  contributions: { success: number; failed: number; total: number };
  expenses?: { success: number; failed: number; total: number };
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
}

export const syncService = {
  async syncAllDataToFirebase(): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Sync contributions
      const contribResult = await contributionService.syncToFirebase();

      // Determine overall status
      const hasFailures = contribResult.failed > 0;
      const status = hasFailures ? 'partial' : 'success';

      const result: SyncResult = {
        contributions: contribResult,
        timestamp,
        status,
      };

      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
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
