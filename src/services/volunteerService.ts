import { localStore } from './storageService';
import type { Volunteer, Task, Sponsor, TaskStatus } from '../types';
import { DEFAULT_EVENT_ID, COLLECTIONS } from '../firebase/collections';
import { readCollection, writeDocument, writeBatchDocuments } from './firestoreService';

export const volunteerService = {
  async getVolunteers(buildingId?: string): Promise<Volunteer[]> {
    const remote = await readCollection<Volunteer>(COLLECTIONS.VOLUNTEERS);
    let list = remote && remote.length > 0 ? remote : localStore.getVolunteers();
    
    if (remote && remote.length > 0) {
      localStore.saveVolunteers(list);
    } else if (list.length > 0) {
      // Sync local baseline to Firestore
      await writeBatchDocuments(COLLECTIONS.VOLUNTEERS, list);
    }

    if (buildingId && buildingId !== 'ALL') {
      list = list.filter((v) => v.buildingId === buildingId);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },

  async addVolunteer(data: Omit<Volunteer, 'id'>): Promise<Volunteer> {
    const list = localStore.getVolunteers();
    const newRecord: Volunteer = {
      ...data,
      id: `vol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.push(newRecord);
    localStore.saveVolunteers(list);
    await writeDocument(COLLECTIONS.VOLUNTEERS, newRecord);
    return newRecord;
  },
};

export const taskService = {
  async getTasks(status?: TaskStatus): Promise<Task[]> {
    const remote = await readCollection<Task>(COLLECTIONS.TASKS);
    let list = remote && remote.length > 0 ? remote : localStore.getTasks();

    if (remote && remote.length > 0) {
      localStore.saveTasks(list);
    } else if (list.length > 0) {
      await writeBatchDocuments(COLLECTIONS.TASKS, list);
    }

    if (status) {
      list = list.filter((t) => t.status === status);
    }
    return list;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const list = localStore.getTasks();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    list[index].status = status;
    localStore.saveTasks(list);
    await writeDocument(COLLECTIONS.TASKS, list[index]);
    return list[index];
  },

  async addTask(data: Omit<Task, 'id'>): Promise<Task> {
    const list = localStore.getTasks();
    const newRecord: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.unshift(newRecord);
    localStore.saveTasks(list);
    await writeDocument(COLLECTIONS.TASKS, newRecord);
    return newRecord;
  },
};

export const sponsorService = {
  async getSponsors(): Promise<Sponsor[]> {
    const remote = await readCollection<Sponsor>(COLLECTIONS.SPONSORS);
    let list = remote && remote.length > 0 ? remote : localStore.getSponsors();

    if (remote && remote.length > 0) {
      localStore.saveSponsors(list);
    } else if (list.length > 0) {
      await writeBatchDocuments(COLLECTIONS.SPONSORS, list);
    }
    return list;
  },

  async addSponsor(data: Omit<Sponsor, 'id'>): Promise<Sponsor> {
    const list = localStore.getSponsors();
    const newRecord: Sponsor = {
      ...data,
      id: `spon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.push(newRecord);
    localStore.saveSponsors(list);
    await writeDocument(COLLECTIONS.SPONSORS, newRecord);
    return newRecord;
  },
};
