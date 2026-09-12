import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  Building2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  FileText,
  Download,
  Users,
  Sparkles,
  Receipt,
} from 'lucide-react';

import {
  ALL_BUILDINGS_2025_26,
  COMBINED_2025_26_SUMMARY,
  OTHER_INCOME_2025_26,
  OTHER_INCOME_2025_26_TOTAL,
  GRAND_TOTAL_2025_26,
  EXPENSES_2025_26,
  EXPENSES_2025_26_TOTAL,
  SURPLUS_2025_26,
  type PrevYearFlat,
} from '../../services/seedData2025';
import { contributionService } from '../../services/contributionService';
import { readCollection } from '../../services/firestoreService';
import { COLLECTIONS } from '../../firebase/collections';
import type { Contribution } from '../../types';
import {
  exportYoYComparisonPDF,
  exportPrevYearContributionsPDF,
  exportNewContributorsPDF,
  exportPrevYearExpensesPDF,
  downloadElementAsImage,
  type ExportListItem,
  type NewContributorExportItem,
} from '../../services/reportExportService';

// ─── Canonical Flat Key Normalizer ──────────────────────────────────────────
/**
 * Normalizes any flat representation to a set of canonical keys (e.g. "A-1005", "A1005")
 * Handles combined flats (e.g. "A-704 & C-303") and flat+building combinations.
 */
function extractCanonicalFlatKeys(flatNumber?: string, buildingId?: string): string[] {
  if (!flatNumber) return [];
  const clean = flatNumber.trim().toUpperCase();
  const keys = new Set<string>();

  // Direct clean representation without spaces
  keys.add(clean.replace(/\s+/g, ''));

  // Multi-flat pattern e.g. "A-704 & C-303"
  const multiMatch = clean.match(/[ABC]\s*[-_]?\s*\d+/g);
  if (multiMatch && multiMatch.length > 0) {
    multiMatch.forEach((m) => {
      const p = m.replace(/\s+/g, '').match(/^([ABC])[-_]?(\d+)$/);
      if (p) {
        keys.add(`${p[1]}-${p[2]}`);
        keys.add(`${p[1]}${p[2]}`);
      }
    });
  }

  // Single standard flat e.g. "A-1005", "A1005", "A - 1005"
  const single = clean.match(/^([ABC])\s*[-_]?\s*(\d+)$/);
  if (single) {
    keys.add(`${single[1]}-${single[2]}`);
    keys.add(`${single[1]}${single[2]}`);
  } else {
    // Pure digits e.g. "1005" with building "A"
    const digits = clean.match(/^(\d+)$/);
    if (digits && buildingId) {
      const b = buildingId.trim().toUpperCase().charAt(0);
      keys.add(`${b}-${digits[1]}`);
      keys.add(`${b}${digits[1]}`);
    }
  }

  return Array.from(keys);
}

// ─── PreviousYearReport ───────────────────────────────────────────────────────
/**
 * Read-only archive view for the Euriska Cultural 2025-26 financial year.
 * Shows A, B, and C Buildings with wing selector, YoY comparison, and PDF/Image exports.
 * Data for 2025-26 is sourced from static local archive (seedData2025.ts).
 * Data for 2026-27 is loaded live from Firebase Firestore server and matched by unique flat number.
 */
type ActiveTab = 'new_this_year' | 'paid_both' | 'pending_this_year' | 'all_comparison' | 'expenses' | 'contributions';

export const PreviousYearReport: React.FC = () => {
  const [activeTab, setActiveTab]       = useState<ActiveTab>('new_this_year');
  const [selectedBuildingId, setSelectedBuildingId] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [cmpBuilding, setCmpBuilding]   = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [cmpSearch, setCmpSearch]       = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // ── 2026-27 live contributions: loaded from Firebase Firestore server (and local cache) ───
  const [currentYearPaidSet, setCurrentYearPaidSet] = useState<Set<string>>(new Set());
  const [live2026Contributions, setLive2026Contributions] = useState<Contribution[]>([]);
  const [cmpLoading, setCmpLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchLive2026Contributions = async () => {
    setCmpLoading(true);
    try {
      // 1. Direct live fetch from Firebase Firestore collection
      const remote = await readCollection<Contribution>(COLLECTIONS.CONTRIBUTIONS);
      // 2. Fetch merged contributions from contributionService (handles local fallback)
      const merged = await contributionService.getContributions();

      const combined = [...(merged || []), ...(remote || [])];
      const paidSet = new Set<string>();
      const deduped2026 = new Map<string, Contribution>();

      combined.forEach((c) => {
        if (!c.flatNumber) return;
        const isPaid =
          c.status === 'PAID' ||
          (typeof c.status === 'string' && c.status.toUpperCase() === 'PAID') ||
          (typeof c.paidAmount === 'number' && c.paidAmount > 0);

        if (isPaid) {
          const keys = extractCanonicalFlatKeys(c.flatNumber, c.buildingId);
          keys.forEach((k) => paidSet.add(k));

          const primaryKey = keys.find((k) => k.includes('-')) || keys[0] || c.flatNumber.toUpperCase();
          if (!deduped2026.has(primaryKey)) {
            deduped2026.set(primaryKey, c);
          } else {
            const existing = deduped2026.get(primaryKey)!;
            if ((c.paidAmount || 0) > (existing.paidAmount || 0)) {
              deduped2026.set(primaryKey, c);
            }
          }
        }
      });

      setCurrentYearPaidSet(paidSet);
      setLive2026Contributions(Array.from(deduped2026.values()));
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Error fetching live 2026-27 contributions:', err);
    } finally {
      setCmpLoading(false);
    }
  };

  useEffect(() => {
    fetchLive2026Contributions();
  }, []);

  // ── 2025-26 Lookups (canonical flat keys) ──────────────────────────────────
  const lastYearPaidSet = useMemo(() => {
    const set = new Set<string>();
    ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) => {
      flats
        .filter((f) => f.status === 'PAID')
        .forEach((f) => {
          const keys = extractCanonicalFlatKeys(f.flat, buildingId);
          keys.forEach((k) => set.add(k));
        });
    });
    return set;
  }, []);

  const lastYearAllFlatsMap = useMemo(() => {
    const map = new Map<string, PrevYearFlat & { building: string }>();
    ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) => {
      flats.forEach((f) => {
        const keys = extractCanonicalFlatKeys(f.flat, buildingId);
        keys.forEach((k) => map.set(k, { ...f, building: buildingId }));
      });
    });
    return map;
  }, []);

  // ── Comparison Lists (matched by unique Flat Number) ────────────────────────
  type CmpFlat = PrevYearFlat & { building: string; flatId: string; status2026: 'PAID' | 'PENDING' };

  type NewThisYearFlat = {
    flatId: string;
    building: string;
    name: string;
    amount2026: number;
    mode2026: string;
    status2025Label: string;
    status2026: 'PAID';
  };


  // 1. NEW THIS YEAR: Paid in 2026-27, but did NOT pay in 2025-26
  const newThisYear = useMemo<NewThisYearFlat[]>(() => {
    if (cmpLoading && live2026Contributions.length === 0) return [];
    const list: NewThisYearFlat[] = [];

    live2026Contributions.forEach((c) => {
      const keys = extractCanonicalFlatKeys(c.flatNumber, c.buildingId);
      const paidLastYear = keys.some((k) => lastYearPaidSet.has(k));

      if (!paidLastYear) {
        const matchingKey = keys.find((k) => lastYearAllFlatsMap.has(k));
        const lastYearRecord = matchingKey ? lastYearAllFlatsMap.get(matchingKey) : undefined;

        let bldg = c.buildingId ? c.buildingId.toUpperCase() : '';
        if (!bldg || bldg.length > 1) {
          const match = c.flatNumber.match(/^([ABC])[-_]?/i);
          bldg = match ? match[1].toUpperCase() : (lastYearRecord?.building || 'A');
        }

        const flatNumOnly = c.flatNumber.replace(/^[ABC][-_]?/i, '').trim();
        const flatId = `${bldg}-${flatNumOnly}`;

        const status2025Label = lastYearRecord
          ? 'Pending in 2025–26 (₹0)'
          : 'New Resident in 2026–27';

        list.push({
          flatId,
          building: bldg,
          name: c.residentName || lastYearRecord?.name || 'Resident',
          amount2026: c.paidAmount || 1500,
          mode2026: c.paymentMode || 'ONLINE',
          status2025Label,
          status2026: 'PAID',
        });
      }
    });

    return list.sort((a, b) => {
      if (a.building !== b.building) return a.building.localeCompare(b.building);
      const numA = parseInt(a.flatId.replace(/^[ABC]-/i, ''), 10) || 0;
      const numB = parseInt(b.flatId.replace(/^[ABC]-/i, ''), 10) || 0;
      return numA - numB;
    });
  }, [live2026Contributions, cmpLoading, lastYearPaidSet, lastYearAllFlatsMap]);

  // Filtered New This Year list
  const filteredNewThisYear = useMemo(() => {
    return newThisYear.filter((f) => {
      if (cmpBuilding !== 'ALL' && f.building !== cmpBuilding) return false;
      if (cmpSearch.trim()) {
        const q = cmpSearch.toLowerCase().trim();
        return f.flatId.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [newThisYear, cmpBuilding, cmpSearch]);

  const newCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
    newThisYear.forEach((f) => { counts[f.building] = (counts[f.building] || 0) + 1; });
    return counts;
  }, [newThisYear]);

  // 2. Flats that paid in 2025-26 AND have already paid in 2026-27 (Loyal recurring contributors)
  const paidBothYears = useMemo<CmpFlat[]>(() => {
    if (cmpLoading && currentYearPaidSet.size === 0) return [];
    const result: CmpFlat[] = [];
    ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) => {
      flats
        .filter((f) => f.status === 'PAID')
        .forEach((f) => {
          const keyWithHyphen = `${buildingId}-${f.flat}`.trim().toUpperCase();
          const keyNoHyphen   = `${buildingId}${f.flat}`.trim().toUpperCase();
          const isPaidCurrentYear =
            currentYearPaidSet.has(keyWithHyphen) ||
            currentYearPaidSet.has(keyNoHyphen);

          if (isPaidCurrentYear) {
            result.push({ ...f, building: buildingId, flatId: `${buildingId}-${f.flat}`, status2026: 'PAID' });
          }
        });
    });
    return result;
  }, [currentYearPaidSet, cmpLoading]);

  // 3. Flats that paid in 2025-26 but are PENDING in 2026-27 (Pending Follow-up list)
  const notPaidThisYear = useMemo<CmpFlat[]>(() => {
    if (cmpLoading && currentYearPaidSet.size === 0) return [];
    const result: CmpFlat[] = [];
    ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) => {
      flats
        .filter((f) => f.status === 'PAID')
        .forEach((f) => {
          const keyWithHyphen = `${buildingId}-${f.flat}`.trim().toUpperCase();
          const keyNoHyphen   = `${buildingId}${f.flat}`.trim().toUpperCase();
          const isPaidCurrentYear =
            currentYearPaidSet.has(keyWithHyphen) ||
            currentYearPaidSet.has(keyNoHyphen);

          if (!isPaidCurrentYear) {
            result.push({ ...f, building: buildingId, flatId: `${buildingId}-${f.flat}`, status2026: 'PENDING' });
          }
        });
    });
    return result;
  }, [currentYearPaidSet, cmpLoading]);

  // 4. All 2025-26 contributors (170 flats) with side-by-side 2026-27 status
  const allLastYearPayers = useMemo<CmpFlat[]>(() => {
    const result: CmpFlat[] = [];
    ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) => {
      flats
        .filter((f) => f.status === 'PAID')
        .forEach((f) => {
          const keyWithHyphen = `${buildingId}-${f.flat}`.trim().toUpperCase();
          const keyNoHyphen   = `${buildingId}${f.flat}`.trim().toUpperCase();
          const isPaidCurrentYear =
            currentYearPaidSet.has(keyWithHyphen) ||
            currentYearPaidSet.has(keyNoHyphen);

          result.push({
            ...f,
            building: buildingId,
            flatId: `${buildingId}-${f.flat}`,
            status2026: isPaidCurrentYear ? 'PAID' : 'PENDING',
          });
        });
    });
    return result;
  }, [currentYearPaidSet]);

  // Selected comparison view list based on activeTab
  const currentCmpList = useMemo(() => {
    if (activeTab === 'paid_both') return paidBothYears;
    if (activeTab === 'pending_this_year') return notPaidThisYear;
    return allLastYearPayers;
  }, [activeTab, paidBothYears, notPaidThisYear, allLastYearPayers]);

  // Filtered by building + search query
  const filteredCmp = useMemo(() => {
    return currentCmpList.filter((f) => {
      if (cmpBuilding !== 'ALL' && f.building !== cmpBuilding) return false;
      if (cmpSearch.trim()) {
        const q = cmpSearch.toLowerCase().trim();
        return f.flatId.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentCmpList, cmpBuilding, cmpSearch]);

  // Per-building counts for active comparison view
  const cmpCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
    currentCmpList.forEach((f) => { counts[f.building] = (counts[f.building] || 0) + 1; });
    return counts;
  }, [currentCmpList]);

  // Resolve active flat list and building prefix for 2025-26 ledger
  const { activeFlats, summary } = useMemo(() => {
    if (selectedBuildingId === 'ALL') {
      const allFlats: (PrevYearFlat & { building: string })[] = [];
      ALL_BUILDINGS_2025_26.forEach(({ buildingId, flats }) =>
        flats.forEach((f) => allFlats.push({ ...f, building: buildingId })),
      );
      return { activeFlats: allFlats, summary: COMBINED_2025_26_SUMMARY };
    }
    const bldg = ALL_BUILDINGS_2025_26.find((b) => b.buildingId === selectedBuildingId)!;
    return {
      activeFlats: bldg.flats.map((f) => ({ ...f, building: selectedBuildingId })),
      summary: bldg.summary,
    };
  }, [selectedBuildingId]);

  // Apply search + status filter on 2025-26 ledger
  const filtered = useMemo(() => {
    return activeFlats.filter((f) => {
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const flatLabel = `${f.building}-${f.flat}`.toLowerCase();
        return flatLabel.includes(q) || f.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeFlats, statusFilter, search]);

  const filteredTotal = useMemo(
    () => filtered.filter((f) => f.status === 'PAID').reduce((s, f) => s + f.amount, 0),
    [filtered],
  );

  const s = summary;

  // ── Export Handlers ────────────────────────────────────────────────────────
  const handleExportComparisonPDF = () => {
    if (activeTab === 'new_this_year') {
      const items: NewContributorExportItem[] = filteredNewThisYear.map((f) => ({
        flatId: f.flatId,
        name: f.name,
        building: f.building,
        amount2026: f.amount2026,
        mode2026: f.mode2026,
        status2025Label: f.status2025Label,
      }));

      exportNewContributorsPDF({
        title: 'New Contributors Added in 2026-27 (Did Not Pay in 2025-26)',
        subtitle: `${cmpBuilding === 'ALL' ? 'All Buildings' : `${cmpBuilding} Building`} | Records: ${filteredNewThisYear.length}`,
        items,
        filename: `Euriska_New_Contributors_2026_${cmpBuilding}.pdf`,
        total2026Amount: filteredNewThisYear.reduce((sum, f) => sum + f.amount2026, 0),
      });
      return;
    }

    let title = 'Flats Paid in Both Years (2025-26 & 2026-27)';
    let filename = 'Euriska_Paid_Both_Years_2026.pdf';
    if (activeTab === 'pending_this_year') {
      title = 'Follow-up List: Paid in 2025-26, Not Yet Paid in 2026-27';
      filename = 'Euriska_Pending_Followup_2026.pdf';
    } else if (activeTab === 'all_comparison') {
      title = 'All 2025-26 Contributors - Year-over-Year Status';
      filename = 'Euriska_YoY_Comparison_All_2026.pdf';
    }

    const items: ExportListItem[] = filteredCmp.map((f) => ({
      flatId: f.flatId,
      name: f.name,
      building: f.building,
      amount2025: f.amount,
      mode2025: f.mode,
      status2026: f.status2026,
    }));

    exportYoYComparisonPDF({
      title,
      subtitle: `${cmpBuilding === 'ALL' ? 'All Buildings' : `${cmpBuilding} Building`} | Records: ${filteredCmp.length}`,
      items,
      filename,
      total2025Amount: filteredCmp.reduce((sum, f) => sum + f.amount, 0),
    });
  };

  const handleExportComparisonImage = async () => {
    setIsExportingImage(true);
    let filename = 'Euriska_New_Contributors_2026.png';
    if (activeTab === 'paid_both') {
      filename = 'Euriska_Paid_Both_Years_2026.png';
    } else if (activeTab === 'pending_this_year') {
      filename = 'Euriska_Pending_Followup_2026.png';
    } else if (activeTab === 'all_comparison') {
      filename = 'Euriska_YoY_Comparison_All_2026.png';
    }

    const success = await downloadElementAsImage('yoy-comparison-card', filename);
    setIsExportingImage(false);
    if (success) {
      setExportSuccessMsg('✅ High-resolution image downloaded! Ready to share on WhatsApp.');
      setTimeout(() => setExportSuccessMsg(''), 4000);
    }
  };

  const handleExportContributionsPDF = () => {
    exportPrevYearContributionsPDF({
      buildingTitle: selectedBuildingId === 'ALL' ? 'All Buildings (A + B + C)' : `${selectedBuildingId} Building`,
      items: filtered,
      filename: `Euriska_2025_26_Contributions_${selectedBuildingId}.pdf`,
      summary: s,
    });
  };

  const handleExportContributionsImage = async () => {
    setIsExportingImage(true);
    const success = await downloadElementAsImage(
      'contributions-2025-card',
      `Euriska_2025_26_Ledger_${selectedBuildingId}.png`
    );
    setIsExportingImage(false);
    if (success) {
      setExportSuccessMsg('✅ High-resolution ledger image downloaded!');
      setTimeout(() => setExportSuccessMsg(''), 4000);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!expenseSearch.trim()) return EXPENSES_2025_26;
    const q = expenseSearch.toLowerCase().trim();
    return EXPENSES_2025_26.filter(
      (e) =>
        e.particulars.toLowerCase().includes(q) ||
        (e.remarks && e.remarks.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }, [expenseSearch]);

  const handleExportExpensesPDF = () => {
    exportPrevYearExpensesPDF({
      items: filteredExpenses,
      filename: 'Euriska_2025_26_Expenses.pdf',
      totalExpense: EXPENSES_2025_26_TOTAL,
      totalIncome: GRAND_TOTAL_2025_26,
      netSurplus: SURPLUS_2025_26,
    });
  };

  const handleExportExpensesImage = async () => {
    setIsExportingImage(true);
    const success = await downloadElementAsImage(
      'expenses-2025-card',
      'Euriska_2025_26_Expenses.png'
    );
    setIsExportingImage(false);
    if (success) {
      setExportSuccessMsg('✅ High-resolution expenses image downloaded!');
      setTimeout(() => setExportSuccessMsg(''), 4000);
    }
  };

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* ── Top Tab Selector ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {([
          { key: 'new_this_year',     label: '✨ New Added This Year',   count: newThisYear.length,                badgeColor: '#7c3aed', activeBg: '#f5f3ff', activeBorder: '#8b5cf6', activeColor: '#6d28d9' },
          { key: 'paid_both',         label: '✅ Paid Both Years',       count: paidBothYears.length,              badgeColor: '#059669', activeBg: '#ecfdf5', activeBorder: '#10b981', activeColor: '#047857' },
          { key: 'pending_this_year', label: '⚠️ Pending This Year',     count: notPaidThisYear.length,            badgeColor: '#dc2626', activeBg: '#fef2f2', activeBorder: '#ef4444', activeColor: '#dc2626' },
          { key: 'all_comparison',    label: '🔄 All Comparison',        count: allLastYearPayers.length,          badgeColor: '#4f46e5', activeBg: '#eef2ff', activeBorder: '#6366f1', activeColor: '#4338ca' },
          { key: 'expenses',          label: '💸 2025–26 Expenses',       count: EXPENSES_2025_26.length,           badgeColor: '#db2777', activeBg: '#fdf2f8', activeBorder: '#ec4899', activeColor: '#be185d' },
          { key: 'contributions',     label: '📋 2025–26 Archive Ledger',count: COMBINED_2025_26_SUMMARY.paidCount,badgeColor: '#2563eb', activeBg: '#eff6ff', activeBorder: '#3b82f6', activeColor: '#1e40af' },
        ] as { key: ActiveTab; label: string; count: number; badgeColor: string; activeBg: string; activeBorder: string; activeColor: string }[]).map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCmpSearch(''); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 12, fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
                border: isActive ? `2px solid ${tab.activeBorder}` : '1.5px solid #e2e8f0',
                background: isActive ? tab.activeBg : '#fafafa',
                color: isActive ? tab.activeColor : '#64748b',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 900,
                padding: '1px 7px', borderRadius: 999,
                background: isActive ? tab.badgeColor : '#e2e8f0',
                color: isActive ? '#ffffff' : '#475569',
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Comparison Tab Section (New Added / Paid Both Years / Pending / All) ── */}
      {activeTab !== 'contributions' && activeTab !== 'expenses' && (
        <div>

          {/* Loading spinner while Firebase data fetches */}
          {cmpLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#64748b', gap: 12 }}>
              <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Fetching 2026–27 live data from Firebase…</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!cmpLoading && (
            <div>
              {/* Dynamic Header Banner based on activeTab */}
              {activeTab === 'new_this_year' ? (
                <div style={{
                  background: 'linear-gradient(135deg, #3b0764 0%, #581c87 50%, #7e22ce 100%)',
                  borderRadius: 18, padding: '20px 20px 18px', marginBottom: 18,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(126, 34, 206, 0.25)',
                }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Sparkles size={18} color="#f472b6" />
                        <span style={{
                          fontSize: 11, fontWeight: 800, color: '#f5d0fe',
                          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                          padding: '2px 8px', borderRadius: 999, letterSpacing: 0.4
                        }}>
                          NEW CONTRIBUTORS ADDED
                        </span>
                      </div>
                      <h2 style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
                        New Contributors Added This Year (2026–27)
                      </h2>
                      <p style={{ fontSize: 12, color: '#e9d5ff', margin: 0, lineHeight: 1.5 }}>
                        Flats that contributed this year (2026–27) but did <strong>NOT</strong> contribute last year (2025–26).
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 2 }}>
                        NEW THIS YEAR
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#fef08a', lineHeight: 1 }}>
                        {newThisYear.length}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                        total new flats joined
                      </div>
                    </div>
                  </div>

                  {/* Metric Bar */}
                  <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 12.5, color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💰 Total Collection from New Members:</span>
                      <span style={{ color: '#4ade80', fontWeight: 900, fontSize: 13.5 }}>
                        ₹{newThisYear.reduce((s, f) => s + f.amount2026, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#e9d5ff', fontWeight: 700 }}>
                      A Wing: <strong style={{ color: '#ffffff' }}>{newCounts.A}</strong> · B Wing: <strong style={{ color: '#ffffff' }}>{newCounts.B}</strong> · C Wing: <strong style={{ color: '#ffffff' }}>{newCounts.C}</strong>
                    </div>
                  </div>

                  {/* Sync live Firebase status */}
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                      <span>Live Firebase Server Synced (Unique Flat Numbers)</span>
                      {lastSyncTime && <span>· Last updated at {lastSyncTime}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={fetchLive2026Contributions}
                      disabled={cmpLoading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.15)', color: '#ffffff',
                        fontSize: 11.5, fontWeight: 700, cursor: cmpLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RefreshCw size={12} style={{ animation: cmpLoading ? 'spin 1s linear infinite' : 'none' }} />
                      {cmpLoading ? 'Checking Firebase…' : 'Sync Live Data'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: activeTab === 'paid_both'
                    ? 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)'
                    : activeTab === 'pending_this_year'
                    ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #7f1d1d 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
                  borderRadius: 18, padding: '20px 20px 18px', marginBottom: 18,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {activeTab === 'paid_both' && <CheckCircle2 size={18} color="#a7f3d0" />}
                        {activeTab === 'pending_this_year' && <AlertTriangle size={18} color="#fca5a5" />}
                        {activeTab === 'all_comparison' && <Users size={18} color="#c7d2fe" />}
                        <span style={{
                          fontSize: 11, fontWeight: 800,
                          color: activeTab === 'paid_both' ? '#a7f3d0' : activeTab === 'pending_this_year' ? '#fca5a5' : '#c7d2fe',
                          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                          padding: '2px 8px', borderRadius: 999, letterSpacing: 0.4
                        }}>
                          {activeTab === 'paid_both' && 'LOYAL RECURRING CONTRIBUTORS'}
                          {activeTab === 'pending_this_year' && 'FOLLOW-UP LIST'}
                          {activeTab === 'all_comparison' && 'YEAR-OVER-YEAR OVERVIEW'}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
                        {activeTab === 'paid_both' && 'Paid in Both Years — 2025–26 & 2026–27'}
                        {activeTab === 'pending_this_year' && 'Paid in 2025–26, Not Yet Paid in 2026–27'}
                        {activeTab === 'all_comparison' && 'All 2025–26 Contributors — 2026–27 Status'}
                      </h2>
                      <p style={{ fontSize: 12, color: activeTab === 'paid_both' ? '#a7f3d0' : activeTab === 'pending_this_year' ? '#fca5a5' : '#c7d2fe', margin: 0, lineHeight: 1.5 }}>
                        {activeTab === 'paid_both' && 'These residents contributed last year and have already paid for the current 2026–27 festival.'}
                        {activeTab === 'pending_this_year' && 'These residents contributed last year but are currently PENDING for 2026–27.'}
                        {activeTab === 'all_comparison' && 'Tracking all 170 flats that contributed in 2025–26 against live Firebase 2026–27 records.'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 2 }}>
                        {activeTab === 'paid_both' && 'PAID BOTH YEARS'}
                        {activeTab === 'pending_this_year' && 'PENDING FOLLOW-UPS'}
                        {activeTab === 'all_comparison' && 'PAID / PENDING'}
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                        {activeTab === 'paid_both' && paidBothYears.length}
                        {activeTab === 'pending_this_year' && notPaidThisYear.length}
                        {activeTab === 'all_comparison' && `${paidBothYears.length} / ${notPaidThisYear.length}`}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        out of {COMBINED_2025_26_SUMMARY.paidCount} who paid in 2025–26
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>2026–27 Retention Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#4ade80' }}>
                        {paidBothYears.length} / {COMBINED_2025_26_SUMMARY.paidCount}
                        {' '}({Math.round((paidBothYears.length / COMBINED_2025_26_SUMMARY.paidCount) * 100)}%)
                      </span>
                    </div>
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round((paidBothYears.length / COMBINED_2025_26_SUMMARY.paidCount) * 100)}%`,
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        borderRadius: 999,
                      }} />
                    </div>
                  </div>

                  {/* Sync live Firebase status */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                      <span>Live Firebase Server Synced (Unique Flat Numbers)</span>
                      {lastSyncTime && <span>· Last updated at {lastSyncTime}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={fetchLive2026Contributions}
                      disabled={cmpLoading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.15)', color: '#ffffff',
                        fontSize: 11.5, fontWeight: 700, cursor: cmpLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RefreshCw size={12} style={{ animation: cmpLoading ? 'spin 1s linear infinite' : 'none' }} />
                      {cmpLoading ? 'Checking Firebase…' : 'Sync Live Data'}
                    </button>
                  </div>
                </div>
              )}

              {/* Building breakdown chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {(['ALL', 'A', 'B', 'C'] as const).map((bid) => {
                  const count = activeTab === 'new_this_year'
                    ? (bid === 'ALL' ? newThisYear.length : (newCounts[bid] ?? 0))
                    : (bid === 'ALL' ? currentCmpList.length : (cmpCounts[bid] ?? 0));
                  const isActive = cmpBuilding === bid;
                  return (
                    <button
                      key={bid}
                      type="button"
                      onClick={() => { setCmpBuilding(bid); setCmpSearch(''); }}
                      style={{
                        padding: '7px 13px', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 12,
                        border: isActive ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                        background: isActive ? '#0f172a' : '#ffffff',
                        color: isActive ? '#ffffff' : '#64748b',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {bid === 'ALL' ? '🏢 All Buildings' : `${bid} Building`} · <strong>{count}</strong>
                    </button>
                  );
                })}
              </div>

              {/* Sub-view toggle pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                  { key: 'new_this_year', label: '✨ New Added This Year', count: newThisYear.length, activeBg: '#f5f3ff', activeBorder: '#8b5cf6', activeColor: '#6d28d9' },
                  { key: 'paid_both', label: '✅ Paid Both Years', count: paidBothYears.length, activeBg: '#ecfdf5', activeBorder: '#10b981', activeColor: '#047857' },
                  { key: 'pending_this_year', label: '⚠️ Pending This Year', count: notPaidThisYear.length, activeBg: '#fef2f2', activeBorder: '#ef4444', activeColor: '#dc2626' },
                  { key: 'all_comparison', label: '🔄 All 170 Flats', count: allLastYearPayers.length, activeBg: '#eef2ff', activeBorder: '#6366f1', activeColor: '#4338ca' },
                ].map((pill) => {
                  const isCur = activeTab === pill.key;
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => { setActiveTab(pill.key as ActiveTab); setCmpSearch(''); }}
                      style={{
                        padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                        border: isCur ? `2px solid ${pill.activeBorder}` : '1px solid #e2e8f0',
                        background: isCur ? pill.activeBg : '#fafafa',
                        color: isCur ? pill.activeColor : '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {pill.label} · <strong>{pill.count}</strong>
                    </button>
                  );
                })}
              </div>

              {/* Search + Action Buttons (Download PDF & Save as Image) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search flat (A-104) or resident name..."
                    value={cmpSearch}
                    onChange={(e) => setCmpSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportComparisonPDF}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      background: '#0f172a', color: '#ffffff',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: '1px solid #334155',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FileText size={14} color="#38bdf8" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportComparisonImage}
                    disabled={isExportingImage}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      background: '#ffffff', color: '#0f172a',
                      fontSize: 12, fontWeight: 700, cursor: isExportingImage ? 'wait' : 'pointer',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Download size={14} color="#059669" />
                    <span>{isExportingImage ? 'Generating Image…' : 'Save as Image'}</span>
                  </button>
                </div>
              </div>

              {exportSuccessMsg && (
                <div style={{
                  background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                  padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, marginBottom: 12,
                }}>
                  {exportSuccessMsg}
                </div>
              )}

              {/* Table Card (Capturable via HTML2Canvas for Image Export) */}
              <div
                id="yoy-comparison-card"
                style={{
                  background: '#ffffff',
                  border: activeTab === 'new_this_year' ? '1.5px solid #ddd6fe' : activeTab === 'paid_both' ? '1.5px solid #a7f3d0' : activeTab === 'pending_this_year' ? '1.5px solid #fecaca' : '1.5px solid #cbd5e1',
                  borderRadius: 18, padding: '16px',
                  boxShadow: activeTab === 'new_this_year' ? '0 2px 10px rgba(124,58,237,0.08)' : activeTab === 'paid_both' ? '0 2px 10px rgba(5,150,105,0.08)' : activeTab === 'pending_this_year' ? '0 2px 10px rgba(220,38,38,0.08)' : '0 2px 10px rgba(0,0,0,0.05)',
                }}
              >
                {/* ── Table Header Summary ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a' }}>
                      {activeTab === 'new_this_year' && `✨ New Contributors Added in 2026–27 — ${filteredNewThisYear.length} resident${filteredNewThisYear.length !== 1 ? 's' : ''}`}
                      {activeTab === 'paid_both' && `✅ Paid in Both Years (2025–26 & 2026–27) — ${filteredCmp.length} resident${filteredCmp.length !== 1 ? 's' : ''}`}
                      {activeTab === 'pending_this_year' && `⚠️ Pending Follow-up List (Paid in 2025–26, Pending in 2026–27) — ${filteredCmp.length} resident${filteredCmp.length !== 1 ? 's' : ''}`}
                      {activeTab === 'all_comparison' && `🔄 All 2025–26 Contributors — 2026–27 Status — ${filteredCmp.length} resident${filteredCmp.length !== 1 ? 's' : ''}`}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      {activeTab === 'new_this_year' && 'Residents who contributed this year (2026–27) but did NOT contribute in 2025–26.'}
                      {activeTab === 'paid_both' && 'Residents who generously contributed last year and have confirmed payment this year.'}
                      {activeTab === 'pending_this_year' && 'Residents who paid last year but are currently PENDING for 2026–27.'}
                      {activeTab === 'all_comparison' && 'Complete side-by-side comparison of 2025–26 vs 2026–27 contributions.'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                    Euriska Cultural Committee
                  </div>
                </div>

                {/* ── Active Table (New This Year vs Comparison) ── */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  {activeTab === 'new_this_year' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontSize: 12.5 }}>
                      <thead>
                        <tr style={{
                          background: '#f5f3ff',
                          borderBottom: '1.5px solid #e2e8f0',
                          textAlign: 'left', fontWeight: 800,
                          color: '#5b21b6'
                        }}>
                          <th style={{ padding: '10px 12px', width: 40, textAlign: 'center' }}>#</th>
                          <th style={{ padding: '10px 12px' }}>Flat</th>
                          <th style={{ padding: '10px 12px' }}>Resident Name</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>2026–27 Paid</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>Mode</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>2025–26 Status</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNewThisYear.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: '#94a3b8' }}>No new contributors matching filters.</td></tr>
                        ) : filteredNewThisYear.map((f, idx) => (
                          <tr key={f.flatId} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '9px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>{idx + 1}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 800, color: '#0f172a' }}>{f.flatId}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1e293b' }}>{f.name}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              ₹{f.amount2026.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                {f.mode2026}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{
                                fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
                              }}>
                                {f.status2025Label}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                                background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
                              }}>
                                <Sparkles size={10} /> NEW
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {filteredNewThisYear.length > 0 && (
                        <tfoot>
                          <tr style={{ background: '#f5f3ff', borderTop: '2px solid #ddd6fe' }}>
                            <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 900, color: '#4c1d95' }}>
                              {filteredNewThisYear.length} new resident{filteredNewThisYear.length !== 1 ? 's' : ''} total
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#059669' }}>
                              ₹{filteredNewThisYear.reduce((s, f) => s + f.amount2026, 0).toLocaleString('en-IN')} (2026–27)
                            </td>
                            <td colSpan={3} />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460, fontSize: 12.5 }}>
                      <thead>
                        <tr style={{
                          background: activeTab === 'paid_both' ? '#ecfdf5' : activeTab === 'pending_this_year' ? '#fef2f2' : '#f8fafc',
                          borderBottom: '1.5px solid #e2e8f0',
                          textAlign: 'left', fontWeight: 800,
                          color: activeTab === 'paid_both' ? '#065f46' : activeTab === 'pending_this_year' ? '#7f1d1d' : '#1e293b'
                        }}>
                          <th style={{ padding: '10px 12px', width: 40, textAlign: 'center' }}>#</th>
                          <th style={{ padding: '10px 12px' }}>Flat</th>
                          <th style={{ padding: '10px 12px' }}>Resident Name</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>Paid (2025–26)</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>2026–27 Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCmp.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: '#94a3b8' }}>No matching records.</td></tr>
                        ) : filteredCmp.map((f, idx) => (
                          <tr key={f.flatId} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '9px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>{idx + 1}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 800, color: '#0f172a' }}>{f.flatId}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1e293b' }}>{f.name}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                              ₹{f.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              {f.status2026 === 'PAID' ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                                  background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0',
                                }}>
                                  <CheckCircle2 size={11} /> PAID
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                                  background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                                }}>
                                  <Clock size={11} /> PENDING
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {filteredCmp.length > 0 && (
                        <tfoot>
                          <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                            <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 900, color: '#0f172a' }}>
                              {filteredCmp.length} resident{filteredCmp.length !== 1 ? 's' : ''} total
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#059669' }}>
                              ₹{filteredCmp.reduce((s, f) => s + f.amount, 0).toLocaleString('en-IN')} (2025–26)
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Expenses Tab Section ────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #831843 0%, #9d174d 40%, #be185d 100%)',
            borderRadius: 18, padding: '20px 22px', marginBottom: 18,
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(190, 24, 93, 0.25)',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Receipt size={18} color="#fbcfe8" />
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#fbcfe8',
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                    padding: '2px 8px', borderRadius: 999, letterSpacing: 0.4
                  }}>
                    FINANCIAL YEAR 2025–26 EXPENDITURE
                  </span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
                  2025–26 Expenses &amp; Surplus Statement
                </h2>
                <p style={{ fontSize: 12, color: '#fce7f3', margin: 0, lineHeight: 1.5 }}>
                  Detailed breakdown of 16 expenditure items for the previous year cultural festival.
                </p>
              </div>

              <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: 11, color: '#fbcfe8', fontWeight: 700, marginBottom: 2 }}>TOTAL EXPENSES</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                  ₹{EXPENSES_2025_26_TOTAL.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: '#fbcfe8', marginTop: 2 }}>
                  across {EXPENSES_2025_26.length} heads
                </div>
              </div>
            </div>

            {/* Financial Summary Cards (Income, Expense, Net Surplus) */}
            <div style={{
              marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10,
              paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#fbcfe8', fontWeight: 700 }}>📥 Total Income</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                  ₹{GRAND_TOTAL_2025_26.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Flats + Other Income</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#fbcfe8', fontWeight: 700 }}>📤 Total Expenses</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fecdd3', marginTop: 2 }}>
                  ₹{EXPENSES_2025_26_TOTAL.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>16 Expenditure Heads</div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(110, 231, 183, 0.4)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 700 }}>💰 Net Surplus Balance</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', marginTop: 2 }}>
                  + ₹{SURPLUS_2025_26.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 10, color: '#a7f3d0', marginTop: 2 }}>Positive Savings Carried Forward ✅</div>
              </div>
            </div>
          </div>

          {/* Search & Export Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search expense (Dhol, Tractor, Sound, Pooja)..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportExpensesPDF}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  background: '#0f172a', color: '#ffffff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: '1px solid #334155',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={14} color="#f472b6" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportExpensesImage}
                disabled={isExportingImage}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  background: '#ffffff', color: '#0f172a',
                  fontSize: 12, fontWeight: 700, cursor: isExportingImage ? 'wait' : 'pointer',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={14} color="#db2777" />
                <span>{isExportingImage ? 'Generating Image…' : 'Save as Image'}</span>
              </button>
            </div>
          </div>

          {exportSuccessMsg && (
            <div style={{
              background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, marginBottom: 12,
            }}>
              {exportSuccessMsg}
            </div>
          )}

          {/* Table Card (Capturable via HTML2Canvas for Image Export) */}
          <div
            id="expenses-2025-card"
            style={{
              background: '#ffffff',
              border: '1.5px solid #fbcfe8',
              borderRadius: 18, padding: '16px',
              boxShadow: '0 2px 10px rgba(190, 24, 93, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                  💸 2025–26 Expense Ledger — {filteredExpenses.length} head{filteredExpenses.length !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  Official committee estimates &amp; payments for the 2025–26 cultural festival.
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                Euriska Cultural Committee
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460, fontSize: 12.5 }}>
                <thead>
                  <tr style={{
                    background: '#fdf2f8',
                    borderBottom: '1.5px solid #fbcfe8',
                    textAlign: 'left', fontWeight: 800,
                    color: '#9d174d'
                  }}>
                    <th style={{ padding: '10px 12px', width: 40, textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Particulars</th>
                    <th style={{ padding: '10px 12px' }}>Remarks</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Estimated Exp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: '#94a3b8' }}>No matching expenses found.</td></tr>
                  ) : filteredExpenses.map((e, idx) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{e.particulars}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {e.remarks ? (
                          <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 700,
                            padding: '2px 8px', borderRadius: 6,
                            background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
                          }}>
                            {e.remarks}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>
                        {e.category || 'General'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#be185d', fontSize: 13 }}>
                        ₹{e.estimatedExp.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#fdf2f8', borderTop: '2px solid #fbcfe8' }}>
                    <td colSpan={4} style={{ padding: '12px 14px', fontWeight: 900, color: '#831843', fontSize: 13 }}>
                      Total Estimated Expenses ({filteredExpenses.length} items)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#be185d', fontSize: 15 }}>
                      ₹{filteredExpenses.reduce((s, e) => s + e.estimatedExp, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Income vs Expenses Summary Card */}
            <div style={{
              marginTop: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: 0.4 }}>PROFIT &amp; LOSS SUMMARY (2025–26)</div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 3 }}>
                  Total Income (₹{GRAND_TOTAL_2025_26.toLocaleString('en-IN')}) − Total Expenses (₹{EXPENSES_2025_26_TOTAL.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>NET SURPLUS BALANCE</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                  + ₹{SURPLUS_2025_26.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contributions Tab ───────────────────────────────────────────── */}
      {activeTab === 'contributions' && (
        <div>


          {/* ── Archive Banner ─────────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 60%, #1a4a7a 100%)',
            borderRadius: 18, padding: '20px 20px 18px', marginBottom: 18,
            position: 'relative', overflow: 'hidden',
          }}>

        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 40, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📁</span>
              <span style={{
                fontSize: 10.5, fontWeight: 800, color: '#93c5fd',
                background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.3)',
                padding: '2px 8px', borderRadius: 999, letterSpacing: 0.5,
              }}>READ-ONLY ARCHIVE</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '0 0 4px' }}>
              Euriska Cultural 2025–26
            </h2>
            <p style={{ fontSize: 12.5, color: '#93c5fd', margin: 0 }}>
              {selectedBuildingId === 'ALL' ? 'All Buildings — A + B + C' : `${selectedBuildingId} Building — Previous Year Records`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, marginBottom: 2 }}>TOTAL COLLECTED</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>
              ₹{s.totalCollected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>
              {s.paidCount} of {s.totalFlats} flats paid
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700 }}>Collection Progress</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#4ade80' }}>{s.collectionPct}%</span>
          </div>
          <div style={{ height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${s.collectionPct}%`,
              background: 'linear-gradient(90deg, #4ade80, #22c55e)',
              borderRadius: 999, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── Building Wing Selector ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {([
          { id: 'ALL', label: '🏢 All Buildings', count: COMBINED_2025_26_SUMMARY.totalFlats },
          ...ALL_BUILDINGS_2025_26.map((b) => ({ id: b.buildingId, label: `${b.buildingId} Building`, count: b.summary.totalFlats })),
        ] as { id: string; label: string; count: number }[]).map((tab) => {
          const isActive = selectedBuildingId === tab.id;
          const bSummary = tab.id === 'ALL'
            ? COMBINED_2025_26_SUMMARY
            : ALL_BUILDINGS_2025_26.find((b) => b.buildingId === tab.id)!.summary;
          return (
            <button
              key={tab.id}
              onClick={() => { setSelectedBuildingId(tab.id as any); setSearch(''); setStatusFilter('ALL'); }}
              style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '10px 16px', borderRadius: 14, cursor: 'pointer',
                border: isActive ? '2px solid #1e40af' : '2px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#fafafa',
                transition: 'all 0.18s ease', minWidth: 100,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 800, color: isActive ? '#1e40af' : '#475569' }}>{tab.label}</span>
              <span style={{ fontSize: 10.5, color: isActive ? '#3b82f6' : '#94a3b8', marginTop: 2 }}>
                ₹{bSummary.totalCollected.toLocaleString('en-IN')} · {bSummary.paidCount}/{bSummary.totalFlats} paid
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { icon: <IndianRupee size={15} color="#059669" />, label: 'Collected',      value: `₹${s.totalCollected.toLocaleString('en-IN')}`, bg: '#ecfdf5', border: '#bbf7d0', color: '#047857' },
          { icon: <CheckCircle2 size={15} color="#2563eb" />, label: 'Paid Flats',    value: `${s.paidCount} / ${s.totalFlats}`,              bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: <Clock size={15} color="#d97706" />,        label: 'Pending Flats', value: s.pendingCount.toString(),                        bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
          { icon: <TrendingUp size={15} color="#7c3aed" />,   label: 'Collection %',  value: `${s.collectionPct}%`,                           bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
          { icon: <Building2 size={15} color="#0891b2" />,    label: '₹/Flat (Exp.)', value: `₹${s.expectedPerFlat.toLocaleString('en-IN')}`, bg: '#ecfeff', border: '#a5f3fc', color: '#0e7490' },
        ].map((card) => (
          <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 14, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              {card.icon}
              <span style={{ fontSize: 10, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ── Ledger Table ───────────────────────────────────────────────── */}
      <div
        id="contributions-2025-card"
        style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 18, padding: '18px 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        {/* Table header row with Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
              {selectedBuildingId === 'ALL' ? 'All Buildings' : `${selectedBuildingId} Building`} — Flat-wise Ledger
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
              Showing {filtered.length} records
              {filtered.length < activeFlats.length ? ` (filtered from ${activeFlats.length})` : ''}
              {' '}· Visible total: <strong>₹{filteredTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportContributionsPDF}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 9,
                background: '#1e3a5f', color: '#ffffff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1px solid #2d5986',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={14} color="#93c5fd" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportContributionsImage}
              disabled={isExportingImage}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 9,
                background: '#ffffff', color: '#0f172a',
                fontSize: 12, fontWeight: 700, cursor: isExportingImage ? 'wait' : 'pointer',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={14} color="#059669" />
              <span>{isExportingImage ? 'Generating…' : 'Save as Image'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={selectedBuildingId === 'ALL' ? 'Search flat (A-304, B-102...) or name...' : `Search flat (${selectedBuildingId}-304) or name...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                borderRadius: 10, border: '1px solid #cbd5e1',
                fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PAID' | 'PENDING')}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600, background: '#fff' }}
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500, fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Flat</th>
                <th style={{ padding: '10px 12px' }}>Resident Name</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Mode</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: '#94a3b8' }}>No matching records found.</td></tr>
              ) : (
                filtered.map((f, idx) => {
                  const isPaid = f.status === 'PAID';
                  const flatLabel = `${f.building}-${f.flat}`;
                  return (
                    <tr key={flatLabel} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>{flatLabel}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{f.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: isPaid ? '#059669' : '#d97706' }}>
                        {isPaid ? `₹${f.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                          background: isPaid ? '#ecfdf5' : '#fffbeb',
                          color: isPaid ? '#047857' : '#b45309',
                          border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                        }}>
                          {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          <span>{f.status}</span>
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase' }}>
                        {isPaid ? (f.mode || 'ONLINE') : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 900, color: '#0f172a', fontSize: 12.5 }}>
                    {filtered.filter((f) => f.status === 'PAID').length} paid flat(s) shown
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#059669', fontSize: 13 }}>
                    ₹{filteredTotal.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Other / Special Contributions ─────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 18, padding: '18px 16px', marginTop: 18,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🪔</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>Other / Special Contributions</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
              Donations, sponsorships, carry-forwards &amp; Daan Peti — entered separately
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1.5px solid #86efac', borderRadius: 12,
            padding: '8px 16px', textAlign: 'right',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d', letterSpacing: 0.3 }}>OTHER INCOME TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#047857' }}>₹{OTHER_INCOME_2025_26_TOTAL.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420, fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>Description</th>
                <th style={{ padding: '10px 12px' }}>Reference / Source</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Mode</th>
              </tr>
            </thead>
            <tbody>
              {OTHER_INCOME_2025_26.map((entry, idx) => {
                const modeColors: Record<string, { bg: string; color: string; border: string }> = {
                  ONLINE:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                  CASH:     { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
                  TRANSFER: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
                };
                const mc = modeColors[entry.mode] ?? modeColors.ONLINE;
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 700, fontSize: 11 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{entry.description}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>{entry.reference ?? '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#047857', fontSize: 13 }}>
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 10, fontWeight: 800,
                        padding: '2px 8px', borderRadius: 999,
                        background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`,
                      }}>{entry.mode}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                <td colSpan={3} style={{ padding: '10px 12px', fontWeight: 900, color: '#0f172a' }}>
                  {OTHER_INCOME_2025_26.length} entries
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#047857', fontSize: 13 }}>
                  ₹{OTHER_INCOME_2025_26_TOTAL.toLocaleString('en-IN')}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Financial Summary & Net Surplus Banner ─────────────────── */}
      <div style={{
        marginTop: 18,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 18, padding: '20px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.4, marginBottom: 4 }}>2025–26 FINANCIAL BALANCE STATEMENT</div>
          <div style={{ fontSize: 12.5, color: '#cbd5e1', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <span>📥 Gross Income: <strong style={{ color: '#4ade80' }}>₹{GRAND_TOTAL_2025_26.toLocaleString('en-IN')}</strong></span>
            <span>•</span>
            <span>📤 Total Expenses: <strong style={{ color: '#f472b6' }}>₹{EXPENSES_2025_26_TOTAL.toLocaleString('en-IN')}</strong></span>
          </div>
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>
            Flat contributions: ₹{COMBINED_2025_26_SUMMARY.totalCollected.toLocaleString('en-IN')} + Other income: ₹{OTHER_INCOME_2025_26_TOTAL.toLocaleString('en-IN')} across 16 expenditure heads
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#86efac', letterSpacing: 0.5 }}>NET SURPLUS BALANCE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', lineHeight: 1, marginTop: 2 }}>
              + ₹{SURPLUS_2025_26.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>Carried Forward to 2026–27</div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6',
              border: '1px solid rgba(244, 114, 182, 0.4)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            View Expenses →
          </button>
        </div>
      </div>

      </div>
    )}

    </div>
  );
};
