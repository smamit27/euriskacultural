import { localStore } from './storageService';
import type { Expense, ExpenseCategory, ExpenseStatus } from '../types';
import { COLLECTIONS, DEFAULT_EVENT_ID } from '../firebase/collections';
import { readCollection, writeDocument, deleteDocument } from './firestoreService';

export const STANDARD_EXPENSE_CATEGORIES = [
  'Ganesh Chaturthi',
  'Navratri',
  'Diwali',
  'Christmas',
  'Eid',
  'Holi',
] as const;

export function normalizeExpenseCategory(category: string): string {
  const c = (category || '').toLowerCase().trim();
  if (c.includes('ganesh') || c.includes('aagman') || c.includes('aarti') || c.includes('prasad') || c.includes('modak') || c.includes('visarjan')) return 'Ganesh Chaturthi';
  if (c.includes('navratri') || c.includes('garba') || c.includes('dussehra') || c.includes('durga')) return 'Navratri';
  if (c.includes('diwali') || c.includes('deepavali') || c.includes('light') || c.includes('firework')) return 'Diwali';
  if (c.includes('christmas') || c.includes('santa') || c.includes('carol') || c.includes('xmas')) return 'Christmas';
  if (c.includes('eid') || c.includes('ramadan') || c.includes('iftar') || c.includes('sevai')) return 'Eid';
  if (c.includes('holi') || c.includes('dahan') || c.includes('color') || c.includes('rangwali')) return 'Holi';
  return 'Ganesh Chaturthi';
}

async function getStoredExpenses(): Promise<Expense[]> {
  const dummyIds = new Set(['exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5', 'exp-6', 'exp-7']);
  const local = localStore.getExpenses().filter((e) => !dummyIds.has(e.id));
  try {
    const remote = await readCollection<Expense>(COLLECTIONS.EXPENSES);
    if (remote && remote.length > 0) {
      const filteredRemote = remote.filter((e) => !dummyIds.has(e.id));
      const remoteMap = new Map(filteredRemote.map((r) => [r.id, r]));
      const merged = local.map((item) => remoteMap.get(item.id) || item);
      filteredRemote.forEach((r) => {
        if (!local.some((l) => l.id === r.id)) {
          merged.push(r);
        }
      });
      return merged;
    }
  } catch (err) {
    console.warn('Failed to load expenses from Firestore, using local cache:', err);
  }
  return local;
}

export const expenseService = {
  async getExpenses(params?: {
    status?: ExpenseStatus;
    category?: ExpenseCategory | string;
    search?: string;
  }): Promise<Expense[]> {
    let list = await getStoredExpenses();

    if (params?.status) {
      list = list.filter((e) => e.status === params.status);
    }

    if (params?.category && params.category !== 'ALL') {
      const targetCat = params.category.toLowerCase();
      list = list.filter(
        (e) =>
          e.category.toLowerCase() === targetCat ||
          normalizeExpenseCategory(e.category).toLowerCase() === targetCat
      );
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.vendor.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  },

  async addExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const list = await getStoredExpenses();
    const newId = `exp-${Date.now()}`;
    const newRecord: Expense = {
      ...data,
      id: newId,
      eventId: data.eventId || DEFAULT_EVENT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newRecord);
    localStore.saveExpenses(list);
    try {
      await writeDocument(COLLECTIONS.EXPENSES, newRecord);
    } catch (e) {
      console.warn('Failed to write expense to Firestore:', e);
    }
    return newRecord;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const list = await getStoredExpenses();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated: Expense = {
      ...list[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    localStore.saveExpenses(list);
    try {
      await writeDocument(COLLECTIONS.EXPENSES, updated);
    } catch (e) {
      console.warn('Failed to update expense in Firestore:', e);
    }
    return updated;
  },

  async approveExpense(id: string, approverName: string): Promise<Expense | null> {
    return this.updateExpense(id, {
      status: 'APPROVED',
      approvedBy: approverName,
      approvedAt: new Date().toISOString(),
    });
  },

  async rejectExpense(id: string, reason?: string): Promise<Expense | null> {
    const list = await getStoredExpenses();
    const target = list.find((e) => e.id === id);
    return this.updateExpense(id, {
      status: 'REJECTED',
      remarks: reason ? `Rejected: ${reason}` : target?.remarks,
    });
  },

  async deleteExpense(id: string): Promise<boolean> {
    const list = await getStoredExpenses();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    localStore.saveExpenses(list);
    try {
      await deleteDocument(COLLECTIONS.EXPENSES, id);
    } catch (e) {
      console.warn('Failed to delete expense from Firestore:', e);
    }
    return true;
  },

  async getCategoryBreakdown(): Promise<{ category: string; amount: number; percentage: number; count: number }[]> {
    const list = (await getStoredExpenses()).filter((e) => e.status === 'APPROVED');
    const total = list.reduce((sum, e) => sum + (e.amount || 0), 0);

    const map: Record<string, { amount: number; count: number }> = {};
    STANDARD_EXPENSE_CATEGORIES.forEach((cat) => {
      map[cat] = { amount: 0, count: 0 };
    });

    list.forEach((e) => {
      const standardCat = normalizeExpenseCategory(e.category);
      if (!map[standardCat]) {
        map[standardCat] = { amount: 0, count: 0 };
      }
      map[standardCat].amount += e.amount || 0;
      map[standardCat].count += 1;
    });

    return Object.entries(map).map(([category, info]) => ({
      category,
      amount: info.amount,
      count: info.count,
      percentage: total > 0 ? Math.round((info.amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  },
};
