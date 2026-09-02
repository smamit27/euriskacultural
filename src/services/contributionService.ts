import { localStore } from './storageService';
import type {
  Contribution,
  Building,
  FinancialSummary,
  PaymentMode,
  ContributionStatus,
  Expense,
  FinancialReportData,
} from '../types';
import { COLLECTIONS, DEFAULT_EVENT_ID } from '../firebase/collections';
import { readCollection, writeDocument } from './firestoreService';
import { budgetService } from './budgetService';
import { expenseService } from './expenseService';

export const contributionService = {
  async getContributions(params?: {
    buildingId?: string;
    status?: ContributionStatus;
    paymentMode?: PaymentMode;
    search?: string;
  }): Promise<Contribution[]> {
    let list = await getStoredContributions();

    if (params?.buildingId && params.buildingId !== 'ALL') {
      list = list.filter((c) => c.buildingId === params.buildingId);
    }

    if (params?.status) {
      list = list.filter((c) => c.status === params.status);
    }

    if (params?.paymentMode) {
      list = list.filter((c) => c.paymentMode === params.paymentMode);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.flatNumber.toLowerCase().includes(q) ||
          c.residentName.toLowerCase().includes(q) ||
          (c.transactionId && c.transactionId.toLowerCase().includes(q)) ||
          (c.receiptNumber && c.receiptNumber.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getBuildingSummaries(): Promise<Building[]> {
    return buildSummaries(await getStoredContributions());
  },

  async getBuildingSummary(buildingId: string): Promise<Building | undefined> {
    const buildings = await this.getBuildingSummaries();
    return buildings.find((b) => b.buildingId === buildingId);
  },

  async addContribution(data: Omit<Contribution, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contribution> {
    const list = await getStoredContributions();
    const newId = `contrib-${Date.now()}`;
    const newRecord: Contribution = {
      ...data,
      id: newId,
      eventId: data.eventId || DEFAULT_EVENT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await writeDocument(COLLECTIONS.CONTRIBUTIONS, newRecord);
    list.unshift(newRecord);
    localStore.saveContributions(list);
    return newRecord;
  },

  async updateContribution(
    id: string,
    updates: Partial<Contribution>
  ): Promise<Contribution | null> {
    const list = await getStoredContributions();
    const index = list.findIndex((c) => c.id === id);

    const baseRecord = index !== -1 ? list[index] : ({ id } as Contribution);
    const isPending = updates.status === 'PENDING';
    const normExpected = updates.expectedAmount !== undefined && updates.expectedAmount !== 2000
      ? updates.expectedAmount
      : (baseRecord.expectedAmount !== undefined && baseRecord.expectedAmount !== 2000 ? baseRecord.expectedAmount : 1500);

    const updated: Contribution = {
      ...baseRecord,
      ...updates,
      id,
      expectedAmount: normExpected,
      paidAmount: isPending ? 0 : (updates.paidAmount !== undefined ? updates.paidAmount : (baseRecord.paidAmount || 1500)),
      paymentMode: isPending ? undefined : (updates.paymentMode !== undefined ? updates.paymentMode : baseRecord.paymentMode),
      paymentDate: isPending ? undefined : (updates.paymentDate !== undefined ? updates.paymentDate : baseRecord.paymentDate),
      receiptNumber: isPending ? undefined : (updates.receiptNumber !== undefined ? updates.receiptNumber : baseRecord.receiptNumber),
      transactionId: isPending ? undefined : (updates.transactionId !== undefined ? updates.transactionId : baseRecord.transactionId),
      updatedAt: new Date().toISOString(),
    };

    await writeDocument(COLLECTIONS.CONTRIBUTIONS, updated);
    if (index !== -1) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    localStore.saveContributions(list);
    return updated;
  },

  async markAsPaid(
    id: string,
    params: {
      amount: number;
      paymentMode: PaymentMode;
      transactionId?: string;
      remarks?: string;
      paidBy?: string;
    }
  ): Promise<Contribution | null> {
    const list = await getStoredContributions();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const target = list[index];
    const receiptNumber = `REC-2026-${target.flatNumber.replace('-', '')}`;
    const now = new Date().toISOString().split('T')[0];

    const updated: Contribution = {
      ...target,
      paidAmount: params.amount,
      paymentMode: params.paymentMode,
      transactionId:
        params.transactionId ||
        (params.paymentMode === 'ONLINE'
          ? `UPI-${Math.floor(10000000 + Math.random() * 90000000)}`
          : undefined),
      receiptNumber,
      paymentDate: now,
      status: 'PAID',
      remarks: params.remarks || target.remarks || 'Paid via mobile app',
      updatedAt: new Date().toISOString(),
      updatedBy: params.paidBy || 'Admin',
    };

    await writeDocument(COLLECTIONS.CONTRIBUTIONS, updated);
    list[index] = updated;
    localStore.saveContributions(list);
    return updated;
  },

  async deleteContribution(id: string): Promise<boolean> {
    const list = await getStoredContributions();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    localStore.saveContributions(list);
    // Note: Firestore deletion would need separate implementation if needed
    return true;
  },

  async getFinancialSummary(): Promise<FinancialSummary> {
    const contributions = await getStoredContributions();
    const expenses = (await readCollection<Expense>(COLLECTIONS.EXPENSES)) || localStore.getExpenses();

    const paidContribs = contributions.filter((c) => c.status === 'PAID');
    const pendingContribs = contributions.filter((c) => c.status === 'PENDING');

    const totalCollected = paidContribs.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const totalPending = pendingContribs.reduce((sum, c) => sum + (c.expectedAmount !== undefined ? c.expectedAmount : 1500), 0);
    
    const onlineCollected = paidContribs
      .filter((c) => c.paymentMode === 'ONLINE')
      .reduce((sum, c) => sum + (c.paidAmount || 0), 0);

    const cashCollected = paidContribs
      .filter((c) => c.paymentMode === 'CASH')
      .reduce((sum, c) => sum + (c.paidAmount || 0), 0);

    const approvedExpenses = expenses.filter((e) => e.status === 'APPROVED');
    const pendingExpenses = expenses.filter((e) => e.status === 'PENDING');
    const totalSpent = approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const otherIncomes = await budgetService.getOtherIncome();
    const otherIncomeTotal = otherIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalIncome = totalCollected + otherIncomeTotal;
    const balance = totalIncome - totalSpent;
    const targetAmount = totalCollected + totalPending;
    const completionPercentage = targetAmount > 0 ? Math.round((totalCollected / targetAmount) * 100) : 0;

    return {
      totalCollected,
      totalSpent,
      balance,
      totalPending,
      onlineCollected,
      cashCollected,
      targetAmount,
      completionPercentage,
      pendingExpensesCount: pendingExpenses.length,
      pendingContributionsCount: pendingContribs.length,
      otherIncome: otherIncomeTotal,
      totalIncome,
    };
  },

  async getCompleteFinancialReport(): Promise<FinancialReportData> {
    const contributions = await getStoredContributions();
    const expenses = await expenseService.getExpenses();
    const budgets = await budgetService.getBudgets();
    const otherIncomes = await budgetService.getOtherIncome();
    const buildings = await this.getBuildingSummaries();

    const paidContribs = contributions.filter((c) => c.status === 'PAID');
    const pendingContribs = contributions.filter((c) => c.status === 'PENDING');

    const totalCollected = paidContribs.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const totalPending = pendingContribs.reduce((sum, c) => sum + (c.expectedAmount !== undefined ? c.expectedAmount : 1500), 0);
    const otherIncome = otherIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalIncome = totalCollected + otherIncome;

    const approvedExpenses = expenses.filter((e) => e.status === 'APPROVED');
    const pendingExpenses = expenses.filter((e) => e.status === 'PENDING');
    const totalExpenses = approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentBalance = totalIncome - totalExpenses;

    const targetCollection = totalCollected + totalPending;
    const collectionPercentage = targetCollection > 0 ? Math.round((totalCollected / targetCollection) * 100) : 0;

    // Category breakdown
    const categoryBreakdown = await expenseService.getCategoryBreakdown();
    const budgetMap = new Map(budgets.map((b) => [b.category.toLowerCase(), b.budgetedAmount]));

    const categoryExpenses = categoryBreakdown.map((item) => {
      const budget = budgetMap.get(item.category.toLowerCase()) || 0;
      const difference = budget - item.amount;
      return {
        category: item.category,
        amount: item.amount,
        percentage: item.percentage,
        budget,
        difference,
        isOverBudget: item.amount > budget && budget > 0,
      };
    });

    // Add categories from budget that might not have any expenses yet
    budgets.forEach((b) => {
      if (!categoryExpenses.some((c) => c.category.toLowerCase() === b.category.toLowerCase())) {
        categoryExpenses.push({
          category: b.category,
          amount: 0,
          percentage: 0,
          budget: b.budgetedAmount,
          difference: b.budgetedAmount,
          isOverBudget: false,
        });
      }
    });

    const recentExpenses = expenses.slice(0, 5);

    return {
      totalCollected,
      totalPending,
      totalFlats: contributions.length || 231,
      paidFlatsCount: paidContribs.length,
      pendingFlatsCount: pendingContribs.length,
      totalExpenses,
      approvedExpensesCount: approvedExpenses.length,
      pendingExpensesCount: pendingExpenses.length,
      otherIncome,
      totalIncome,
      currentBalance,
      targetCollection,
      collectionPercentage,
      categoryExpenses,
      buildingSummaries: buildings,
      recentExpenses,
    };
  },

  async syncToFirebase(): Promise<{ success: number; failed: number; total: number }> {
    const contributions = await getStoredContributions();
    let successCount = 0;
    let failedCount = 0;

    for (const contribution of contributions) {
      try {
        await writeDocument(COLLECTIONS.CONTRIBUTIONS, contribution);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync contribution ${contribution.id}:`, error);
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      total: contributions.length,
    };
  },
};

async function getStoredContributions(): Promise<Contribution[]> {
  const local = localStore.getContributions();
  let list = local;

  try {
    const remote = await readCollection<Contribution>(COLLECTIONS.CONTRIBUTIONS);
    if (remote && remote.length > 0) {
      const remoteMap = new Map(remote.map((r) => [r.id, r]));
      const merged = local.map((item) => remoteMap.get(item.id) || item);
      remote.forEach((r) => {
        if (!local.some((l) => l.id === r.id)) {
          merged.push(r);
        }
      });
      list = merged;
    }
  } catch (err) {
    console.warn('Failed to load contributions from Firestore, using local cache:', err);
  }

  // Filter out non-residential refuge area flat (A-706)
  const filteredList = list.filter((item) => {
    const flatClean = (item.flatNumber || '').replace(/\s+/g, '').toUpperCase();
    const isRefuge =
      flatClean === 'A-706' ||
      flatClean === '706' ||
      item.id === 'contrib-A-706' ||
      (item.residentName || '').toLowerCase().includes('refuge');
    return !isRefuge;
  });

  // Normalize expected amounts and resident names
  return filteredList.map((item) => {
    const normExpected = item.expectedAmount !== undefined && item.expectedAmount !== 2000 ? item.expectedAmount : 1500;
    const isPending = item.status === 'PENDING';
    const isA1007 = (item.flatNumber || '').replace(/\s+/g, '').toUpperCase() === 'A-1007' || item.id === 'contrib-A-1007';
    return {
      ...item,
      residentName: isA1007 ? 'Mr. Amit Singh' : item.residentName,
      expectedAmount: normExpected,
      paidAmount: isPending ? 0 : (item.paidAmount !== undefined ? item.paidAmount : normExpected),
    };
  });
}

function buildSummaries(contributions: Contribution[]): Building[] {
  return localStore.getBuildings().map((building) => {
    const records = contributions.filter((item) => item.buildingId === building.buildingId);
    const paid = records.filter((item) => item.status === 'PAID');
    const pending = records.filter((item) => item.status === 'PENDING');
    const collectedAmount = paid.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    const pendingAmount = pending.reduce((sum, item) => sum + (item.expectedAmount !== undefined && item.expectedAmount !== 2000 ? item.expectedAmount : 1500), 0);

    return {
      ...building,
      expectedPerFlat: 1500,
      totalFlats: records.length,
      targetAmount: collectedAmount + pendingAmount,
      collectedAmount,
      pendingAmount,
      paidFlatsCount: paid.length,
      pendingFlatsCount: pending.length,
    };
  });
}
