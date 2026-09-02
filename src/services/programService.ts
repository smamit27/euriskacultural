import { localStore } from './storageService';
import type { Program } from '../types';
import { DEFAULT_EVENT_ID } from '../firebase/collections';

export const programService = {
  async getPrograms(): Promise<Program[]> {
    const list = localStore.getPrograms();
    return list.sort((a, b) => a.order - b.order);
  },

  async getProgramById(id: string): Promise<Program | undefined> {
    const list = localStore.getPrograms();
    return list.find((p) => p.id === id);
  },

  async addProgram(data: Omit<Program, 'id'>): Promise<Program> {
    const list = localStore.getPrograms();
    const newRecord: Program = {
      ...data,
      id: `prog-${Date.now()}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.push(newRecord);
    localStore.savePrograms(list);
    return newRecord;
  },
};
