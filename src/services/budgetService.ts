import { COLLECTIONS } from '../firebase/collections';
import { readCollection, writeDocument } from './firestoreService';
import type { CategoryBudget, OtherIncome } from '../types';

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Ganesh Chaturthi', budgetedAmount: 150000, notes: '14 Sep – 25 Sep: Aagman, Daily Aarti, Modak, Cultural & Visarjan' },
  { category: 'Navratri', budgetedAmount: 15000, notes: '11 Oct – 20 Oct: 9 Nights Garba & Dandiya Utsav' },
  { category: 'Diwali', budgetedAmount: 25000, notes: '08 Nov: Festival of Lights, Diyas & Community Feast' },
  { category: 'Christmas', budgetedAmount: 15000, notes: '25 Dec: Carols, Secret Santa & Community Celebration' },
  { category: 'Eid', budgetedAmount: 25000, notes: '10 Mar 2027: Eid al-Fitr Sevaiyaan & Community Gathering' },
  { category: 'Holi', budgetedAmount: 25000, notes: '21–22 Mar 2027: Holika Dahan & Dhulivandan Colors Celebration' },
];

export const DEFAULT_OTHER_INCOME: OtherIncome[] = [];

const BUDGET_STORAGE_KEY = 'euriska_festival_budgets_2026_v3';
const OTHER_INCOME_STORAGE_KEY = 'euriska_other_income_v2';

export const budgetService = {
  async getBudgets(): Promise<CategoryBudget[]> {
    try {
      const remote = await readCollection<CategoryBudget & { id: string }>(COLLECTIONS.BUDGETS);
      if (remote && remote.length > 0) {
        return remote.map((b) => ({
          category: b.category,
          budgetedAmount: Number(b.budgetedAmount) || 0,
          notes: b.notes || '',
        }));
      }
    } catch (e) {
      console.warn('Could not read budgets from Firestore, falling back to local:', e);
    }

    try {
      const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }

    return DEFAULT_CATEGORY_BUDGETS;
  },

  async updateBudget(category: string, amount: number, notes?: string): Promise<CategoryBudget> {
    const list = await this.getBudgets();
    const index = list.findIndex((b) => b.category.toLowerCase() === category.toLowerCase());
    const updated: CategoryBudget = {
      category,
      budgetedAmount: Math.max(0, amount),
      notes: notes || (index !== -1 ? list[index].notes : ''),
    };

    if (index !== -1) {
      list[index] = updated;
    } else {
      list.push(updated);
    }

    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(list));
      const docId = `budget-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await writeDocument(COLLECTIONS.BUDGETS, {
        id: docId,
        ...updated,
      });
    } catch (e) {
      console.warn('Failed to persist budget:', e);
    }

    return updated;
  },

  async saveAllBudgets(budgets: CategoryBudget[]): Promise<void> {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
      for (const b of budgets) {
        const docId = `budget-${b.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        await writeDocument(COLLECTIONS.BUDGETS, {
          id: docId,
          ...b,
        });
      }
    } catch (e) {
      console.warn('Failed to save all budgets:', e);
    }
  },

  async getOtherIncome(): Promise<OtherIncome[]> {
    try {
      const remote = await readCollection<OtherIncome>(COLLECTIONS.OTHER_INCOME);
      if (remote && remote.length > 0) {
        return remote.filter((r) => r.id !== 'inc-1');
      }
    } catch (e) {
      console.warn('Could not read other income from Firestore, falling back to local:', e);
    }

    try {
      const stored = localStorage.getItem(OTHER_INCOME_STORAGE_KEY);
      if (stored) {
        const parsed: OtherIncome[] = JSON.parse(stored);
        return parsed.filter((r) => r.id !== 'inc-1');
      }
    } catch {
      // Fallback
    }

    return DEFAULT_OTHER_INCOME;
  },

  async addOtherIncome(income: Omit<OtherIncome, 'id'>): Promise<OtherIncome> {
    const list = await this.getOtherIncome();
    const newRecord: OtherIncome = {
      ...income,
      id: `inc-${Date.now()}`,
    };
    list.unshift(newRecord);

    try {
      localStorage.setItem(OTHER_INCOME_STORAGE_KEY, JSON.stringify(list));
      await writeDocument(COLLECTIONS.OTHER_INCOME, newRecord);
    } catch (e) {
      console.warn('Failed to persist other income:', e);
    }

    return newRecord;
  },
};
