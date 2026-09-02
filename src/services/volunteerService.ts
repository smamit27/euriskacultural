import { localStore } from './storageService';
import type { Volunteer, Task, Sponsor, TaskStatus } from '../types';
import { DEFAULT_EVENT_ID } from '../firebase/collections';

export const volunteerService = {
  async getVolunteers(buildingId?: string): Promise<Volunteer[]> {
    let list = localStore.getVolunteers();
    if (buildingId && buildingId !== 'ALL') {
      list = list.filter((v) => v.buildingId === buildingId);
    }
    return list;
  },

  async addVolunteer(data: Omit<Volunteer, 'id'>): Promise<Volunteer> {
    const list = localStore.getVolunteers();
    const newRecord: Volunteer = {
      ...data,
      id: `vol-${Date.now()}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.push(newRecord);
    localStore.saveVolunteers(list);
    return newRecord;
  },
};

export const taskService = {
  async getTasks(status?: TaskStatus): Promise<Task[]> {
    let list = localStore.getTasks();
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
    return list[index];
  },

  async addTask(data: Omit<Task, 'id'>): Promise<Task> {
    const list = localStore.getTasks();
    const newRecord: Task = {
      ...data,
      id: `task-${Date.now()}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.unshift(newRecord);
    localStore.saveTasks(list);
    return newRecord;
  },
};

export const sponsorService = {
  async getSponsors(): Promise<Sponsor[]> {
    return localStore.getSponsors();
  },

  async addSponsor(data: Omit<Sponsor, 'id'>): Promise<Sponsor> {
    const list = localStore.getSponsors();
    const newRecord: Sponsor = {
      ...data,
      id: `spon-${Date.now()}`,
      eventId: data.eventId || DEFAULT_EVENT_ID,
    };
    list.push(newRecord);
    localStore.saveSponsors(list);
    return newRecord;
  },
};
