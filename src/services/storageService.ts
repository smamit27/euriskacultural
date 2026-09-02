import {
  INITIAL_EVENT_INFO,
  INITIAL_BUILDINGS,
  INITIAL_PROGRAMS,
  INITIAL_PERFORMANCES,
  INITIAL_ALBUMS,
  INITIAL_GALLERY_IMAGES,
  INITIAL_EXPENSES,
  INITIAL_SPONSORS,
  INITIAL_VOLUNTEERS,
  INITIAL_TASKS,
  INITIAL_MAHA_PRASAD_RSVPS,
  generateSeedContributions,
} from './seedData';
import type {
  Building,
  Contribution,
  Expense,
  Program,
  Performance,
  GalleryAlbum,
  GalleryImage,
  Sponsor,
  Volunteer,
  Task,
  EventInfo,
} from '../types';

const STORAGE_KEYS = {
  EVENT_INFO: 'euriska_event_info',
  BUILDINGS: 'euriska_buildings',
  CONTRIBUTIONS: 'euriska_contributions',
  EXPENSES: 'euriska_expenses',
  PROGRAMS: 'euriska_programs',
  PERFORMANCES: 'euriska_performances',
  ALBUMS: 'euriska_albums',
  GALLERY_IMAGES: 'euriska_gallery_images',
  SPONSORS: 'euriska_sponsors',
  VOLUNTEERS: 'euriska_volunteers',
  TASKS: 'euriska_tasks',
  CURRENT_ROLE: 'euriska_user_role',
  SEED_VERSION: 'euriska_seed_version',
  MAHA_PRASAD_RSVP: 'euriska_maha_prasad_rsvp',
};

const CURRENT_SEED_VERSION = 'v13_mahaprasad_paid_flats';

class DataStore {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return defaultVal;
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  // Initialize store or migrate if version changed
  public init() {
    const savedVersion = localStorage.getItem(STORAGE_KEYS.SEED_VERSION);
    if (!localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS) || savedVersion !== CURRENT_SEED_VERSION) {
      // Clear out obsolete legacy storage keys from earlier builds
      const staleKeys = [
        'euriska_category_budgets',
        'euriska_other_income',
        'euriska_category_budgets_v2',
        'euriska_dummy_expenses',
        'euriska_expenses_seed',
        'euriska_festival_budgets_2026_v2',
      ];
      staleKeys.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });

      this.resetToInitialSeed();
      localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
    }
  }

  public resetToInitialSeed() {
    this.set(STORAGE_KEYS.EVENT_INFO, INITIAL_EVENT_INFO);
    this.set(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    this.set(STORAGE_KEYS.CONTRIBUTIONS, generateSeedContributions());
    this.set(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.set(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    this.set(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    this.set(STORAGE_KEYS.ALBUMS, INITIAL_ALBUMS);
    this.set(STORAGE_KEYS.GALLERY_IMAGES, INITIAL_GALLERY_IMAGES);
    this.set(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS);
    this.set(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    this.set(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.set(STORAGE_KEYS.MAHA_PRASAD_RSVP, INITIAL_MAHA_PRASAD_RSVPS);
    this.set(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
  }

  // Getters
  public getEventInfo(): EventInfo {
    return this.get(STORAGE_KEYS.EVENT_INFO, INITIAL_EVENT_INFO);
  }

  public getBuildings(): Building[] {
    return this.get(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
  }

  public getContributions(): Contribution[] {
    return this.get(STORAGE_KEYS.CONTRIBUTIONS, []);
  }

  public saveContributions(contributions: Contribution[]) {
    this.set(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    this.recalculateBuildingTotals();
  }

  public getExpenses(): Expense[] {
    return this.get(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  public saveExpenses(expenses: Expense[]) {
    this.set(STORAGE_KEYS.EXPENSES, expenses);
  }

  public getPrograms(): Program[] {
    return this.get(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
  }

  public savePrograms(programs: Program[]) {
    this.set(STORAGE_KEYS.PROGRAMS, programs);
  }

  public getPerformances(): Performance[] {
    return this.get(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
  }

  public savePerformances(performances: Performance[]) {
    this.set(STORAGE_KEYS.PERFORMANCES, performances);
  }

  public getAlbums(): GalleryAlbum[] {
    return this.get(STORAGE_KEYS.ALBUMS, INITIAL_ALBUMS);
  }

  public getGalleryImages(): GalleryImage[] {
    return this.get(STORAGE_KEYS.GALLERY_IMAGES, INITIAL_GALLERY_IMAGES);
  }

  public saveGalleryImages(images: GalleryImage[]) {
    this.set(STORAGE_KEYS.GALLERY_IMAGES, images);
  }

  public getSponsors(): Sponsor[] {
    return this.get(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS);
  }

  public saveSponsors(sponsors: Sponsor[]) {
    this.set(STORAGE_KEYS.SPONSORS, sponsors);
  }

  public getVolunteers(): Volunteer[] {
    return this.get(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
  }

  public saveVolunteers(volunteers: Volunteer[]) {
    this.set(STORAGE_KEYS.VOLUNTEERS, volunteers);
  }

  public getTasks(): Task[] {
    return this.get(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  public saveTasks(tasks: Task[]) {
    this.set(STORAGE_KEYS.TASKS, tasks);
  }

  public recalculateBuildingTotals() {
    const contributions = this.getContributions();
    const buildings = this.getBuildings();

    const updatedBuildings = buildings.map((bldg) => {
      const bldgContribs = contributions.filter((c) => c.buildingId === bldg.buildingId);
      const paid = bldgContribs.filter((c) => c.status === 'PAID');
      const pending = bldgContribs.filter((c) => c.status === 'PENDING');
      
      const collectedAmount = paid.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
      const pendingAmount = pending.reduce((sum, c) => sum + (c.expectedAmount !== undefined && c.expectedAmount !== 2000 ? c.expectedAmount : 1500), 0);

      return {
        ...bldg,
        expectedPerFlat: 1500,
        totalFlats: bldgContribs.length,
        targetAmount: collectedAmount + pendingAmount,
        collectedAmount,
        pendingAmount,
        paidFlatsCount: paid.length,
        pendingFlatsCount: pending.length,
      };
    });

    this.set(STORAGE_KEYS.BUILDINGS, updatedBuildings);
  }
}

export const localStore = new DataStore();
localStore.init();
