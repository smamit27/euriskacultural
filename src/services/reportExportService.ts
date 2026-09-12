import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { PrevYearFlat, PrevYearExpense } from './seedData2025';

export interface ExportListItem {
  flatId: string;
  name: string;
  building: string;
  amount2025: number;
  mode2025?: string;
  status2026: 'PAID' | 'PENDING';
}

export interface NewContributorExportItem {
  flatId: string;
  name: string;
  building: string;
  amount2026: number;
  mode2026?: string;
  status2025Label: string;
}


function cleanPdfText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[•·]/g, '|')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{0900}-\u{097F}]/gu, '')
    .trim();
}

/**
 * Downloads a DOM element as a crisp, high-resolution PNG image (WhatsApp/Mobile ready).
 */
export async function downloadElementAsImage(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found for image export`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for sharp retina text & borders
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export element as image:', err);
    return false;
  }
}

/**
 * Exports YoY comparison list as a styled, professional PDF document.
 */
export function exportYoYComparisonPDF(options: {
  title: string;
  subtitle: string;
  items: ExportListItem[];
  filename: string;
  total2025Amount: number;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('EURISKA CULTURAL - YEAR-OVER-YEAR REPORT', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `${cleanPdfText(options.title)} | Generated: ${new Date().toLocaleDateString('en-IN')}`,
    14,
    22
  );

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 36, pageWidth - 28, 12, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const paidCount = options.items.filter((i) => i.status2026 === 'PAID').length;
  const pendingCount = options.items.filter((i) => i.status2026 === 'PENDING').length;
  doc.text(
    `Total Records: ${options.items.length} | 2026-27 Paid: ${paidCount} | 2026-27 Pending: ${pendingCount} | 2025-26 Collection: Rs. ${options.total2025Amount.toLocaleString('en-IN')}`,
    18,
    44
  );

  const tableBody = options.items.map((item, idx) => [
    idx + 1,
    cleanPdfText(item.flatId),
    cleanPdfText(item.name),
    `Rs. ${item.amount2025.toLocaleString('en-IN')}`,
    cleanPdfText(item.mode2025 || 'ONLINE'),
    item.status2026 === 'PAID' ? 'PAID (2026-27)' : 'PENDING (2026-27)',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Flat', 'Resident Name', '2025-26 Paid', 'Mode', '2026-27 Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 70 },
      3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 32, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (String(data.cell.raw).includes('PAID')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Euriska Cultural Committee - Confidential Society Record | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 7
    );
  }

  doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}

/**
 * Exports the 2025-26 contributions ledger as a PDF.
 */
export function exportPrevYearContributionsPDF(options: {
  buildingTitle: string;
  items: (PrevYearFlat & { building: string })[];
  filename: string;
  summary: { totalCollected: number; paidCount: number; pendingCount: number };
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 58, 95); // Royal Navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('EURISKA CULTURAL 2025-26 - ARCHIVE LEDGER', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `${cleanPdfText(options.buildingTitle)} | Archive Date: 2025-26 Festival Year`,
    14,
    22
  );

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 36, pageWidth - 28, 12, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    `Total Flats: ${options.items.length} | Paid: ${options.summary.paidCount} | Pending: ${options.summary.pendingCount} | Total Collection: Rs. ${options.summary.totalCollected.toLocaleString('en-IN')}`,
    18,
    44
  );

  const tableBody = options.items.map((item, idx) => [
    idx + 1,
    `${item.building}-${item.flat}`,
    cleanPdfText(item.name),
    item.status === 'PAID' ? `Rs. ${item.amount.toLocaleString('en-IN')}` : '-',
    cleanPdfText(item.mode || (item.status === 'PAID' ? 'ONLINE' : '-')),
    item.status,
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Flat', 'Resident Name', 'Amount (2025-26)', 'Mode', 'Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 70 },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'PAID') {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [156, 163, 175];
          data.cell.styles.fontStyle = 'normal';
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Euriska Cultural Committee - Confidential Society Archive Record | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 7
    );
  }

  doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}

/**
 * Exports New Contributors (Paid 2026-27, Not Paid 2025-26) as a styled, professional PDF document.
 */
export function exportNewContributorsPDF(options: {
  title: string;
  subtitle: string;
  items: NewContributorExportItem[];
  filename: string;
  total2026Amount: number;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner - Royal Purple Slate
  doc.setFillColor(30, 27, 75); // Indigo-950
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('EURISKA CULTURAL - NEW CONTRIBUTORS REPORT', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(216, 180, 254);
  doc.text(
    `${cleanPdfText(options.title)} | Generated: ${new Date().toLocaleDateString('en-IN')}`,
    14,
    22
  );

  // Summary box
  doc.setFillColor(245, 243, 255); // Violet-50
  doc.setDrawColor(221, 214, 254); // Violet-200
  doc.roundedRect(14, 36, pageWidth - 28, 12, 2, 2, 'FD');

  doc.setTextColor(109, 40, 217); // Violet-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    `Total New Contributors Added: ${options.items.length} | 2026-27 Collection from New Contributors: Rs. ${options.total2026Amount.toLocaleString('en-IN')}`,
    18,
    44
  );

  const tableBody = options.items.map((item, idx) => [
    idx + 1,
    cleanPdfText(item.flatId),
    cleanPdfText(item.name),
    `Rs. ${item.amount2026.toLocaleString('en-IN')}`,
    cleanPdfText(item.mode2026 || 'ONLINE'),
    cleanPdfText(item.status2025Label),
    'PAID (2026-27)',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Flat', 'Resident Name', '2026-27 Paid', 'Mode', '2025-26 Status', '2026-27 Status']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217], // Violet-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 62 },
      3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        data.cell.styles.textColor = [5, 150, 105]; // Emerald
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = [100, 116, 139]; // Slate-500
      }
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Euriska Cultural Committee - New Resident Contributors Archive | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 7
    );
  }

  doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}

/**
 * Exports 2025-26 Expenses list as a styled, professional PDF document.
 */
export function exportPrevYearExpensesPDF(options: {
  items: PrevYearExpense[];
  filename: string;
  totalExpense: number;
  totalIncome: number;
  netSurplus: number;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner - Rose Slate
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('EURISKA CULTURAL - 2025-26 EXPENSES REPORT', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(244, 114, 182); // Rose-400
  doc.text(
    `Financial Year 2025-26 Expense Ledger | Generated: ${new Date().toLocaleDateString('en-IN')}`,
    14,
    22
  );

  // Summary box
  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(254, 205, 211); // Rose-200
  doc.roundedRect(14, 36, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setTextColor(190, 18, 60); // Rose-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    `Total Income: Rs. ${options.totalIncome.toLocaleString('en-IN')}  |  Total Expenses: Rs. ${options.totalExpense.toLocaleString('en-IN')}  |  Net Surplus: Rs. ${options.netSurplus.toLocaleString('en-IN')}`,
    18,
    45
  );

  const tableBody = options.items.map((item, idx) => [
    idx + 1,
    cleanPdfText(item.particulars),
    cleanPdfText(item.remarks || '-'),
    cleanPdfText(item.category || 'General'),
    `Rs. ${item.estimatedExp.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['#', 'Particulars', 'Remarks', 'Category', 'Estimated Expense']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [190, 24, 93], // Pink-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 35, fontStyle: 'italic' },
      3: { cellWidth: 45 },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Euriska Cultural Committee - 2025-26 Financial Archive | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 7
    );
  }

  doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}



