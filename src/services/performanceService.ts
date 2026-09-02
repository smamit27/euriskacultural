import { localStore } from './storageService';
import type { Performance } from '../types';
import { DEFAULT_EVENT_ID } from '../firebase/collections';

export const performanceService = {
  async getPerformances(): Promise<Performance[]> {
    return localStore.getPerformances();
  },

  async getPerformanceById(id: string): Promise<Performance | undefined> {
    const list = localStore.getPerformances();
    return list.find((p) => p.id === id);
  },

  async registerPerformance(data: Omit<Performance, 'id' | 'status'>): Promise<Performance> {
    const list = localStore.getPerformances();
    const newRecord: Performance = {
      ...data,
      id: `perf-${Date.now()}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
      status: 'SCHEDULED',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    };

    list.unshift(newRecord);
    localStore.savePerformances(list);
    return newRecord;
  },
};
