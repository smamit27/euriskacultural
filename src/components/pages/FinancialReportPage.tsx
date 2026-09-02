import React, { useState, useEffect, useCallback } from 'react';
import { FinancialHero } from '../report/FinancialHero';
import { FinancialSummaryCards } from '../report/FinancialSummaryCards';
import { BuildingContributionSection } from '../report/BuildingContributionSection';
import { ExpenseCategoryChart } from '../report/ExpenseCategoryChart';
import { BudgetVsActualSection } from '../report/BudgetVsActualSection';
import { MoneyFlowInfographic } from '../report/MoneyFlowInfographic';
import { RecentExpensesFeed } from '../report/RecentExpensesFeed';
import { DetailedLedgerTabs } from '../report/DetailedLedgerTabs';
import { ManageBudgetModal } from '../report/ManageBudgetModal';
import { AddContributionSheet } from '../contributions/AddContributionSheet';
import { AddExpenseSheet } from '../expenses/AddExpenseSheet';
import { MarkPaidSheet } from '../contributions/MarkPaidSheet';
import { AdminLoginModal } from '../auth/AdminLoginModal';
import { contributionService } from '../../services/contributionService';
import { expenseService } from '../../services/expenseService';
import { pdfService } from '../../services/pdfService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { FinancialReportData, Contribution, Expense, Building } from '../../types';

export const FinancialReportPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Modals
  const [showManageBudget, setShowManageBudget] = useState(false);
  const [showAddContrib, setShowAddContrib] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedMarkPaid, setSelectedMarkPaid] = useState<Contribution | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [report, contribsList, expsList, bldgsList] = await Promise.all([
        contributionService.getCompleteFinancialReport(),
        contributionService.getContributions(),
        expenseService.getExpenses(),
        contributionService.getBuildingSummaries(),
      ]);

      setReportData(report);
      setContributions(contribsList);
      setExpenses(expsList);
      setBuildings(bldgsList);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Error loading financial report data:', e);
      showToast('Failed to load financial report data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Exports
  const handleExportPDF = () => {
    if (!reportData) return;
    try {
      pdfService.exportFinancialTransparencyReportPDF(reportData);
      showToast('📄 Financial Report PDF downloaded!', 'success');
    } catch {
      showToast('Could not generate PDF.', 'error');
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    try {
      pdfService.exportComprehensiveExcelCSV(reportData, contributions, expenses);
      showToast('📊 Complete Financial Statement (Excel/CSV) downloaded!', 'success');
    } catch {
      showToast('Could not generate CSV.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Handlers for Add / Edit / Delete
  const handleSaveContribution = async (data: any) => {
    try {
      await contributionService.addContribution({ ...data, eventId: 'EURISKA-CULTURAL-2026' });
      showToast('✅ Contribution recorded successfully!', 'success');
      setShowAddContrib(false);
      loadData();
    } catch {
      showToast('Failed to record contribution.', 'error');
    }
  };

  const handleSaveExpense = async (data: any) => {
    try {
      await expenseService.addExpense(data);
      showToast('✅ Expense submitted & saved!', 'success');
      setShowAddExpense(false);
      loadData();
    } catch {
      showToast('Failed to save expense.', 'error');
    }
  };

  const handleMarkPaidConfirm = async (id: string, data: any) => {
    try {
      await contributionService.markAsPaid(id, data);
      setSelectedMarkPaid(null);
      showToast('✅ Payment recorded successfully!', 'success');
      loadData();
    } catch {
      showToast('Failed to record payment.', 'error');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    try {
      await contributionService.deleteContribution(id);
      showToast('Contribution record removed.', 'info');
      loadData();
    } catch {
      showToast('Failed to delete contribution.', 'error');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      showToast('Expense record deleted.', 'info');
      loadData();
    } catch {
      showToast('Failed to delete expense.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: 440,
        margin: '0 auto',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          margin: '0 auto 16px',
          boxShadow: '0 8px 20px rgba(249, 115, 22, 0.3)',
        }}>
          🔒
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
          Admin Access Required
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          The Financial Transparency Report is currently restricted to committee administrators. Please authenticate with the admin password to view full ledgers, collection status, and expenses.
        </p>
        <button
          onClick={() => setShowAdminLogin(true)}
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
          }}
        >
          👑 Unlock Admin Portal
        </button>

        <AdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      </div>
    );
  }

  if (loading || !reportData) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🪔</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          Loading Financial Transparency Report...
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Connecting live to Google Cloud Firestore & local caches
        </div>
      </div>
    );
  }

  return (
    <div className="financial-report-page" style={{ padding: '0 14px 40px' }}>
      {/* 1. Hero Section */}
      <FinancialHero
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
        lastUpdated={lastUpdated}
        totalCollected={reportData.totalCollected}
        totalExpenses={reportData.totalExpenses}
        currentBalance={reportData.currentBalance}
        collectionPercentage={reportData.collectionPercentage}
      />

      {/* 2. Top Summary KPI Cards (4 Responsive Cards) */}
      <FinancialSummaryCards
        totalCollected={reportData.totalCollected}
        totalPending={reportData.totalPending}
        totalExpenses={reportData.totalExpenses}
        currentBalance={reportData.currentBalance}
        collectionPercentage={reportData.collectionPercentage}
        paidFlatsCount={reportData.paidFlatsCount}
        totalFlats={reportData.totalFlats}
        approvedExpensesCount={reportData.approvedExpensesCount}
        targetCollection={reportData.targetCollection}
      />

      {/* 3. Money Flow Infographic */}
      <MoneyFlowInfographic
        totalCollected={reportData.totalCollected}
        otherIncome={reportData.otherIncome}
        totalIncome={reportData.totalIncome}
        totalExpenses={reportData.totalExpenses}
        currentBalance={reportData.currentBalance}
      />

      {/* 4. Contribution by Building (A, B, C wings) */}
      <BuildingContributionSection
        buildings={buildings}
        totalCollected={reportData.totalCollected}
        totalPending={reportData.totalPending}
        totalFlats={reportData.totalFlats}
        paidFlatsCount={reportData.paidFlatsCount}
        pendingFlatsCount={reportData.pendingFlatsCount}
        collectionPercentage={reportData.collectionPercentage}
      />

      {/* 5. Expenses by Category (Interactive Donut Chart) */}
      <ExpenseCategoryChart
        categoryExpenses={reportData.categoryExpenses}
        totalExpenses={reportData.totalExpenses}
      />

      {/* 6. Budget vs Actual Comparison */}
      <BudgetVsActualSection
        items={reportData.categoryExpenses}
        totalExpenses={reportData.totalExpenses}
        onOpenManageBudget={() => {
          if (isAdmin) setShowManageBudget(true);
          else setShowAdminLogin(true);
        }}
      />

      {/* 7. Recent Expenses Quick Feed */}
      <RecentExpensesFeed
        expenses={expenses}
        onViewAll={() => {
          const el = document.getElementById('detailed-ledgers-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 8. Detailed Filterable Ledgers & Sub-tabs */}
      <div id="detailed-ledgers-section">
        <DetailedLedgerTabs
          contributions={contributions}
          expenses={expenses}
          buildings={buildings}
          reportData={reportData}
          onAddContribution={() => {
            if (isAdmin) setShowAddContrib(true);
            else setShowAdminLogin(true);
          }}
          onAddExpense={() => {
            if (isAdmin) setShowAddExpense(true);
            else setShowAdminLogin(true);
          }}
          onMarkPaid={(c) => {
            if (isAdmin) setSelectedMarkPaid(c);
            else setShowAdminLogin(true);
          }}
          onDeleteExpense={isAdmin ? handleDeleteExpense : undefined}
          onDeleteContribution={isAdmin ? handleDeleteContribution : undefined}
          onRefresh={loadData}
        />
      </div>

      {/* Admin Budget Management Modal */}
      <ManageBudgetModal
        isOpen={showManageBudget}
        onClose={() => setShowManageBudget(false)}
        onBudgetUpdated={loadData}
      />

      {/* Global Add Contribution Modal */}
      <AddContributionSheet
        isOpen={showAddContrib}
        onClose={() => setShowAddContrib(false)}
        onSave={handleSaveContribution}
      />

      {/* Global Add Expense Modal */}
      <AddExpenseSheet
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSave={handleSaveExpense}
      />

      {/* Mark Paid Sheet Modal */}
      {selectedMarkPaid && (
        <MarkPaidSheet
          isOpen={true}
          onClose={() => setSelectedMarkPaid(null)}
          contribution={selectedMarkPaid}
          onConfirm={handleMarkPaidConfirm}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </div>
  );
};
