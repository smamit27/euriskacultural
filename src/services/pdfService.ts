import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrasadSlot, PrasadBooking, Contribution, KalakritiEntry, Expense, FinancialReportData } from '../types';

/**
 * Strips and replaces non-ASCII/Unicode glyphs (em-dashes, en-dashes, special quotes, emojis, etc.)
 * that cause mojibake / corrupted characters (like Ø>Ý_) in standard jsPDF Helvetica fonts.
 */
function cleanPdfText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[•·]/g, '|')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function getImageDataUrl(src: string): Promise<string | null> {
  try {
    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, 500);

      const img = new Image();
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const data = canvas.toDataURL('image/png');
            resolve(data);
            return;
          }
        } catch {
          // ignore canvas extraction error
        }
        resolve(null);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      img.src = src;
    });
  } catch {
    return null;
  }
}

export const pdfService = {
  /**
   * Export Full Ganpati Prasad Seva (12 Days) Schedule as PDF
   */
  async exportPrasadSchedulePDF(slots: PrasadSlot[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const bookedDaysCount = slots.filter((s) => s.isBooked).length;
    const openDaysCount = slots.length - bookedDaysCount;
    const totalFamiliesCount = slots.reduce(
      (acc, s) => acc + (s.bookings && s.bookings.length > 0 ? s.bookings.length : s.isBooked ? 1 : 0),
      0
    );

    // Header Background
    doc.setFillColor(194, 65, 12); // Deep saffron/orange #c2410c
    doc.rect(0, 0, 210, 38, 'F');

    // Accent line
    doc.setFillColor(251, 191, 36); // Gold #fbbf24
    doc.rect(0, 36, 210, 2, 'F');

    // Embed Logo if available
    try {
      const logoData = await getImageDataUrl('/euriska_logo.png');
      if (logoData) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(172, 5, 26, 26, 4, 4, 'F');
        doc.addImage(logoData, 'PNG', 174, 7, 22, 22);
      }
    } catch {
      // ignore
    }

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EURISKA CULTURAL COMMITTEE', 14, 15);

    doc.setFontSize(13);
    doc.setTextColor(254, 215, 170);
    doc.text('GANPATI PRASAD SEVA SCHEDULE (2026)', 14, 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Daily Evening Aarti: 8:00 PM | Venue: Club House Podium', 14, 30);

    // Summary Chip Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(14, 42, 182, 12, 3, 3, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(
      cleanPdfText(`Festival: 14-25 Sep 2026 (12 Days) | ${totalFamiliesCount} Families Registered | ${openDaysCount} Open Days`),
      18,
      50
    );

    // Table Data preparation
    const tableBody = slots.map((s, idx) => {
      const bookings =
        s.bookings && s.bookings.length > 0
          ? s.bookings
          : s.isBooked
          ? [
              {
                id: '1',
                flatNumber: s.flatNumber || '',
                residentName: s.residentName || '',
                phone: s.phone || '',
                prasadItem: s.prasadItem || '',
              },
            ]
          : [];

      const cleanDate = cleanPdfText(s.dateDisplay);
      const cleanDay = cleanPdfText(s.dayLabel.split('-')[0].trim());

      if (bookings.length === 0) {
        return [
          `Day ${idx + 1}`,
          `${cleanDate}\n(${cleanDay})`,
          '[OPEN SLOT]',
          'Open for Devotee Families',
          'Modak & Fruits',
        ];
      }

      const flatsStr = bookings.map((b) => cleanPdfText(b.flatNumber)).join('\n');
      const devoteesStr = bookings
        .map((b) => `${cleanPdfText(b.residentName)}${b.phone ? ` (${cleanPdfText(b.phone)})` : ''}`)
        .join('\n');
      const prasadStr = bookings.map((b) => cleanPdfText(b.prasadItem || 'Modak & Fruits')).join('\n');

      return [
        `Day ${idx + 1}`,
        `${cleanDate}\n(${cleanDay})`,
        flatsStr,
        devoteesStr,
        prasadStr,
      ];
    });

    autoTable(doc, {
      startY: 58,
      head: [['Day', 'Date & Day', 'Flat No.', 'Devotee / Resident', 'Prasad Offering']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [194, 65, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 56 },
        4: { cellWidth: 50 },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowData = slots[data.row.index];
          if (data.column.index === 2) {
            if (rowData && rowData.isBooked) {
              data.cell.styles.textColor = [194, 65, 12];
            } else {
              data.cell.styles.textColor = [5, 150, 105];
            }
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      doc.text(
        cleanPdfText(`Generated from Euriska Cultural Portal (${dateStr}) | Ganpati Bappa Morya!`),
        14,
        290
      );
      doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
    }

    doc.save(`Euriska_Ganpati_Prasad_Schedule_2026.pdf`);
  },

  /**
   * Export Single Devotee Prasad Seva Confirmation & Invitation Pass (Receipt PDF)
   */
  async exportSinglePrasadPassPDF(slot: PrasadSlot, specificBooking?: PrasadBooking) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const activeBooking =
      specificBooking ||
      (slot.bookings && slot.bookings.length > 0 ? slot.bookings[0] : null) || {
        id: '1',
        flatNumber: slot.flatNumber || 'N/A',
        residentName: slot.residentName || 'Devotee Family',
        phone: slot.phone || '',
        prasadItem: slot.prasadItem || 'Traditional Modak, Sweets & Fresh Fruits',
        notes: slot.notes || '',
      };

    // Load Logos safely
    let logoData: string | null = null;
    let ganeshData: string | null = null;
    try {
      logoData = await getImageDataUrl('/euriska_logo.png');
      ganeshData = await getImageDataUrl('/ganesh_bhagwan.jpg');
    } catch {
      // ignore
    }

    // Outer Decorative Double Border Frame
    doc.setDrawColor(194, 65, 12); // Saffron #c2410c
    doc.setLineWidth(1.4);
    doc.roundedRect(10, 10, 190, 277, 5, 5, 'D');

    doc.setDrawColor(245, 158, 11); // Gold trim #f59e0b
    doc.setLineWidth(0.6);
    doc.roundedRect(12.5, 12.5, 185, 272, 4, 4, 'D');

    // Header Background Fill
    doc.setFillColor(154, 52, 18); // Deep festive maroon #9a3412
    doc.roundedRect(14, 14, 182, 44, 3, 3, 'F');

    // Gold accent divider in header
    doc.setFillColor(251, 191, 36);
    doc.rect(14, 56, 182, 2, 'F');

    // Embed Euriska Logo on Left
    if (logoData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(18, 18, 28, 28, 4, 4, 'F');
        doc.setDrawColor(254, 215, 170);
        doc.setLineWidth(0.5);
        doc.roundedRect(18, 18, 28, 28, 4, 4, 'D');
        doc.addImage(logoData, 'PNG', 19.5, 19.5, 25, 25);
      } catch (err) {
        console.warn('Could not render logo in PDF:', err);
      }
    }

    // Embed Dagdusheth Ganesh Idol on Right
    if (ganeshData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(164, 18, 28, 28, 4, 4, 'F');
        doc.setDrawColor(254, 215, 170);
        doc.setLineWidth(0.5);
        doc.roundedRect(164, 18, 28, 28, 4, 4, 'D');
        doc.addImage(ganeshData, 'JPEG', 165.5, 19.5, 25, 25);
      } catch (err) {
        console.warn('Could not render ganesh idol in PDF:', err);
      }
    }

    // Center Header Text (Using clean ASCII to prevent character encoding issues)
    doc.setTextColor(254, 215, 170); // Warm gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('* SHRI GANESHAYA NAMAHA *', 105, 22, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.text('EURISKA CULTURAL COMMITTEE', 105, 30, { align: 'center' });

    doc.setTextColor(254, 240, 138); // Bright festive gold
    doc.setFontSize(11.5);
    doc.text('GANESHOTSAV 2026 - PRASAD SEVA & AARTI PASS', 105, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 237, 213);
    doc.text('Official Devotee Seva Confirmation & Invitation', 105, 45, { align: 'center' });

    // Date & Aarti Ribbon
    doc.setFillColor(254, 243, 199); // Gold amber
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, 62, 182, 18, 3, 3, 'FD');

    const cleanDate = cleanPdfText(slot.dateDisplay);
    const cleanDayLabel = cleanPdfText(slot.dayLabel);

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(
      `Day ${slot.dayNumber}  |  ${cleanDate}  |  ${cleanDayLabel}`,
      105,
      71,
      { align: 'center' }
    );

    doc.setFontSize(9.5);
    doc.setTextColor(154, 52, 18);
    doc.text(
      'Daily Evening Maha Aarti @ 8:00 PM Sharp  |  Venue: Club House Podium',
      105,
      77,
      { align: 'center' }
    );

    // Devotee Details Table
    const details = [
      ['Flat Number:', cleanPdfText(activeBooking.flatNumber) || 'N/A'],
      ['Devotee / Host Family:', cleanPdfText(activeBooking.residentName) || 'Devotee Family'],
      ['Contact Phone:', cleanPdfText(activeBooking.phone) || 'Registered Society Resident'],
      ['Prasad Seva Offering:', cleanPdfText(activeBooking.prasadItem) || 'Traditional Modak, Sweets & Fresh Fruits'],
      ['Reporting Time:', '7:45 PM (15 Minutes prior to Aarti for Mandap Sthapana)'],
      ['Maha Aarti Timing:', '8:00 PM Sharp (Evening Aarti, Stuti & Modak Prasad)'],
      ['Venue Location:', 'Club House Podium'],
    ];

    if (activeBooking.notes) {
      details.push(['Special Notes / Requests:', cleanPdfText(activeBooking.notes)]);
    }

    autoTable(doc, {
      startY: 84,
      body: details,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235], // Subtle gold tint
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [124, 45, 18], // Brown-maroon
          cellWidth: 54,
          fillColor: [254, 243, 199],
        },
        1: {
          fontStyle: 'bold',
          textColor: [15, 23, 42],
          cellWidth: 128,
        },
      },
      margin: { left: 14, right: 14 },
    });

    const endY = (doc as any).lastAutoTable.finalY || 160;

    // Festive Blessing Banner (Positioned directly below details without instructions box)
    const blessingY = endY + 14;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, blessingY, 182, 18, 3, 3, 'FD');

    doc.setTextColor(194, 65, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('* GANPATI BAPPA MORYA *', 105, blessingY + 11.5, { align: 'center' });

    // Official Pass Footer & Verification Badge
    const footerY = blessingY + 30;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('EURISKA CULTURAL & FESTIVE COMMITTEE 2026-27', 16, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Digital Verification Pass | Generated on: ${dateStr}`, 16, footerY + 5);

    // Pass Reference Tag on Right
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(130, footerY - 5, 66, 12, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const passRef = `EUR-PRASAD-${cleanPdfText(activeBooking.flatNumber) || 'SLOT'}-D${slot.dayNumber}`;
    doc.text(`PASS ID: ${passRef}`, 163, footerY + 2.5, { align: 'center' });

    doc.save(`Euriska_Prasad_Pass_${cleanPdfText(activeBooking.flatNumber) || 'Slot'}_Day${slot.dayNumber}.pdf`);
  },

  /**
   * Export Kalakriti Participants Matrix as PDF
   */
  exportKalakritiPDF(entries: KalakritiEntry[]) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header Background
    doc.setFillColor(124, 45, 18); // Maroon
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('EURISKA - KALAKRITI TALENT MATRIX (2026)', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 215, 170);
    doc.text(
      `Participants Roster (${entries.length} Registered) | Generated: ${new Date().toLocaleDateString('en-IN')}`,
      14,
      19
    );

    const headers = [
      'S.N.',
      'Participant Name',
      'Flat',
      'Age',
      'Phone',
      'Drawing',
      'Skit 1',
      'Skit 2',
      'Dance',
      'Fashion',
      'Mimicry',
      'Singing',
      'Fancy Dress',
    ];

    const body = entries.map((e, idx) => [
      idx + 1,
      cleanPdfText(e.name),
      cleanPdfText(e.flatNumber) || '-',
      cleanPdfText(e.ageGroup) || 'All',
      cleanPdfText(e.phone) || '-',
      e.drawing ? '[Y]' : '-',
      e.skit1 ? '[Y]' : '-',
      e.skit2 ? '[Y]' : '-',
      e.dance ? '[Y]' : '-',
      e.fashionShow ? '[Y]' : '-',
      e.mimicry ? '[Y]' : '-',
      e.singing ? '[Y]' : '-',
      e.fancyDress ? '[Y]' : '-',
    ]);

    autoTable(doc, {
      startY: 28,
      head: [headers],
      body,
      theme: 'grid',
      headStyles: {
        fillColor: [194, 65, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [15, 23, 42],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
        2: { cellWidth: 18 },
        3: { cellWidth: 16 },
        4: { cellWidth: 26 },
      },
      margin: { left: 10, right: 10 },
    });

    doc.save('Euriska_Kalakriti_Talent_Matrix_2026.pdf');
  },

  /**
   * Export Contributions Ledger as PDF
   */
  exportContributionsPDF(contributions: Contribution[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalCollected = contributions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const paidCount = contributions.filter((c) => c.status === 'PAID').length;
    const pendingCount = contributions.filter((c) => c.status === 'PENDING').length;

    // Header Background
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURISKA - SOCIETY CONTRIBUTIONS REPORT', 14, 14);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Festival: Cultural & Festive Calendar 2026-27 | Generated: ${new Date().toLocaleDateString('en-IN')}`,
      14,
      22
    );

    // Summary Chip Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 36, 182, 12, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      `Total Collected: Rs. ${totalCollected.toLocaleString('en-IN')} | Paid Flats: ${paidCount} | Pending: ${pendingCount}`,
      18,
      44
    );

    const tableBody = contributions.map((c, idx) => [
      idx + 1,
      cleanPdfText(c.flatNumber) || '-',
      cleanPdfText(c.residentName) || '-',
      `Rs. ${(c.expectedAmount || 1500).toLocaleString('en-IN')}`,
      `Rs. ${(c.paidAmount || 0).toLocaleString('en-IN')}`,
      c.status === 'PAID' ? 'PAID' : 'PENDING',
      c.paymentMode || '-',
      c.receiptNumber || c.transactionId || '-',
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['#', 'Flat', 'Resident Name', 'Expected', 'Paid', 'Status', 'Mode', 'Ref / Receipt']],
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
        1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 46 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 28 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          if (data.cell.raw === 'PAID') {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [217, 119, 6];
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
      doc.text(`Euriska Cultural Committee - Confidential Society Record | Page ${i} of ${pageCount}`, 14, 290);
    }

    doc.save('Euriska_Contributions_Ledger_2026.pdf');
  },

  /**
   * Export Budget vs Actual Spending PDF
   */
  exportBudgetVsActualPDF(categoryExpenses: any[], totalBudget: number, totalExpenses: number) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalVariance = totalBudget - totalExpenses;
    const isOverallUnder = totalVariance >= 0;

    // Header Background
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFillColor(249, 115, 22); // Orange strip
    doc.rect(0, 34, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('EURISKA CULTURAL 2026-27', 14, 13);

    doc.setFontSize(11);
    doc.setTextColor(254, 215, 170);
    doc.text('FESTIVAL BUDGET VS ACTUAL SPENDING REPORT', 14, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Financial Transparency & AGM Audit Statement | Generated: ${dateStr}`, 14, 28);

    // Summary Metric Cards
    const cardY = 42;
    const cardW = 42;
    const cardH = 18;

    // 1. Total Budget
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL ALLOCATED BUDGET', 17, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${totalBudget.toLocaleString('en-IN')}`, 17, cardY + 13);

    // 2. Actual Spent
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(60, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL ACTUAL SPENT', 63, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38);
    doc.text(`Rs. ${totalExpenses.toLocaleString('en-IN')}`, 63, cardY + 13);

    // 3. Variance / Balance
    doc.setFillColor(isOverallUnder ? 236 : 254, isOverallUnder ? 253 : 242, isOverallUnder ? 245 : 242);
    doc.setDrawColor(isOverallUnder ? 167 : 254, isOverallUnder ? 243 : 202, isOverallUnder ? 208 : 202);
    doc.roundedRect(106, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isOverallUnder ? 4 : 185, isOverallUnder ? 120 : 28, isOverallUnder ? 87 : 28);
    doc.text('NET VARIANCE / BALANCE', 109, cardY + 5.5);
    doc.setFontSize(11);
    doc.text(`${isOverallUnder ? '+' : '-'}Rs. ${Math.abs(totalVariance).toLocaleString('en-IN')}`, 109, cardY + 13);

    // 4. Overall Status
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(152, cardY, cardW + 2, cardH, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('BUDGET UTILIZATION', 155, cardY + 5.5);
    doc.setFontSize(11);
    const utilPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
    doc.text(`${utilPct}% (${isOverallUnder ? 'Within Budget' : 'Over Budget'})`, 155, cardY + 13);

    // Table Data
    const tableBody = categoryExpenses.map((item, idx) => {
      const diff = item.difference;
      const diffStr = diff >= 0 ? `+Rs. ${diff.toLocaleString('en-IN')}` : `-Rs. ${Math.abs(diff).toLocaleString('en-IN')}`;
      const statusStr = item.budget === 0 && item.amount === 0 ? 'Not Spent (Rs. 0)' : item.isOverBudget ? 'OVER BUDGET' : 'WITHIN BUDGET';

      return [
        String(idx + 1),
        cleanPdfText(item.category),
        `Rs. ${(item.budget || 0).toLocaleString('en-IN')}`,
        `Rs. ${(item.amount || 0).toLocaleString('en-IN')}`,
        diffStr,
        item.budget > 0 ? `${Math.round(((item.amount || 0) / item.budget) * 100)}%` : '0%',
        statusStr,
      ];
    });

    // Total row
    tableBody.push([
      '-',
      'TOTAL ALLOCATED CULTURAL FUND',
      `Rs. ${totalBudget.toLocaleString('en-IN')}`,
      `Rs. ${totalExpenses.toLocaleString('en-IN')}`,
      `${isOverallUnder ? '+' : '-'}Rs. ${Math.abs(totalVariance).toLocaleString('en-IN')}`,
      `${utilPct}%`,
      isOverallUnder ? 'WITHIN BUDGET' : 'OVER BUDGET',
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['#', 'Festival / Event Category', 'Allocated Budget', 'Actual Spent', 'Variance', 'Util %', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [15, 23, 42],
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const isTotalRow = data.row.index === tableBody.length - 1;
          if (isTotalRow) {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.fontStyle = 'bold';
            if (data.column.index === 4) {
              data.cell.styles.textColor = isOverallUnder ? [5, 150, 105] : [220, 38, 38];
            }
          } else {
            if (data.column.index === 4) {
              const rowItem = categoryExpenses[data.row.index];
              if (rowItem) {
                data.cell.styles.textColor = rowItem.difference >= 0 ? [5, 150, 105] : [220, 38, 38];
              }
            }
            if (data.column.index === 6) {
              const rowItem = categoryExpenses[data.row.index];
              if (rowItem) {
                data.cell.styles.textColor = rowItem.isOverBudget ? [185, 28, 28] : [4, 120, 87];
              }
            }
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    doc.save('Euriska_Budget_Vs_Actual_Spending_2026.pdf');
  },

  /**
   * Export Comprehensive Financial Transparency & Audit Report PDF
   */
  exportFinancialTransparencyReportPDF(report: FinancialReportData) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Cover / Header Banner
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 42, 'F');

    doc.setFillColor(249, 115, 22); // Orange strip
    doc.rect(0, 40, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EURISKA CULTURAL 2026-27', 14, 15);

    doc.setFontSize(11);
    doc.setTextColor(254, 215, 170);
    doc.text('FINANCIAL TRANSPARENCY & AUDIT REPORT', 14, 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const genDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Official AGM Audit Statement | Generated: ${genDate}`, 14, 31);

    // Key Financial Metrics Grid
    autoTable(doc, {
      startY: 48,
      head: [['Total Income', 'Total Expenses', 'Net Balance', 'Collection Rate']],
      body: [
        [
          `Rs. ${report.totalIncome.toLocaleString('en-IN')}`,
          `Rs. ${report.totalExpenses.toLocaleString('en-IN')}`,
          `Rs. ${report.currentBalance.toLocaleString('en-IN')}`,
          `${report.collectionPercentage}% (${report.paidFlatsCount}/${report.totalFlats} Flats)`,
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        textColor: [15, 23, 42],
      },
      margin: { left: 14, right: 14 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // Building Summaries Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. BUILDING-WISE COLLECTION BREAKDOWN', 14, currentY);

    const buildingRows = report.buildingSummaries.map((b) => [
      cleanPdfText(b.name),
      `${b.paidFlatsCount || 0} / ${b.totalFlats}`,
      `Rs. ${(b.collectedAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(b.pendingAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(b.targetAmount || 0).toLocaleString('en-IN')}`,
      `${b.targetAmount ? Math.round(((b.collectedAmount || 0) / b.targetAmount) * 100) : 0}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Building / Wing', 'Paid / Total', 'Collected', 'Pending', 'Target', 'Completion']],
      body: buildingRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Category Expenses Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. CATEGORY-WISE EXPENDITURE LEDGER', 14, currentY);

    const expenseRows = report.categoryExpenses.map((cat) => [
      cleanPdfText(cat.category),
      `Rs. ${cat.amount.toLocaleString('en-IN')}`,
      `Rs. ${cat.budget.toLocaleString('en-IN')}`,
      cat.isOverBudget
        ? `+Rs. ${Math.abs(cat.difference).toLocaleString('en-IN')} Over`
        : `Rs. ${cat.difference.toLocaleString('en-IN')} Saved`,
      `${cat.percentage}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Expense Category', 'Actual Spent', 'Budget', 'Variance', '% of Total']],
      body: expenseRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    doc.addPage();

    // Recent Expenses Audit List
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. RECENT APPROVED EXPENSE VOUCHERS', 14, 18);

    const expenseDetailRows = report.recentExpenses.map((exp, idx) => [
      idx + 1,
      cleanPdfText(exp.expenseDate) || '-',
      cleanPdfText(exp.category),
      cleanPdfText(exp.vendor),
      cleanPdfText(exp.description),
      `Rs. ${exp.amount.toLocaleString('en-IN')}`,
      exp.paymentMode || '-',
      exp.invoiceNumber || '-',
    ]);

    autoTable(doc, {
      startY: 22,
      head: [['#', 'Date', 'Category', 'Vendor', 'Description', 'Amount', 'Mode', 'Invoice #']],
      body: expenseDetailRows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Euriska Cultural Financial Statement 2026-27 | Page ${i} of ${pageCount}`, 14, 290);
    }

    doc.save('Euriska_Cultural_Financial_Report_2026.pdf');
  },

  /**
   * Export Comprehensive Excel CSV Statement
   */
  exportComprehensiveExcelCSV(report: FinancialReportData, contributions: Contribution[], expenses: Expense[]) {
    const lines: string[] = [];

    // Header
    lines.push('\uFEFF"EURISKA CULTURAL 2026-27 - COMPLETE FINANCIAL STATEMENT"');
    lines.push(`"Generated: ${new Date().toLocaleString('en-IN')}"`);
    lines.push('');

    // Executive Summary
    lines.push('"1. EXECUTIVE FINANCIAL SUMMARY"');
    lines.push('"Metric","Amount (INR)","Details"');
    lines.push(`"Total Income",${report.totalIncome},"Contributions + Other Income"`);
    lines.push(`"Total Expenses",${report.totalExpenses},"Total Approved Outflow"`);
    lines.push(`"Net Cash Balance",${report.currentBalance},"Surplus in Society Account"`);
    lines.push(`"Collection Rate","${report.collectionPercentage}%","${report.paidFlatsCount} of ${report.totalFlats} Flats Paid"`);
    lines.push('');

    // Building Summary
    lines.push('"2. BUILDING-WISE BREAKDOWN"');
    lines.push('"Building","Paid Flats","Total Flats","Collected (INR)","Pending (INR)","Target (INR)","Completion %"');
    report.buildingSummaries.forEach((b) => {
      const pct = b.targetAmount ? Math.round(((b.collectedAmount || 0) / b.targetAmount) * 100) : 0;
      lines.push(
        `"${cleanPdfText(b.name)}",${b.paidFlatsCount || 0},${b.totalFlats},${b.collectedAmount || 0},${b.pendingAmount || 0},${b.targetAmount || 0},"${pct}%"`
      );
    });
    lines.push('');

    // Category Expenses
    lines.push('"3. EXPENSE BUDGET VS ACTUAL"');
    lines.push('"Category","Actual Spent (INR)","Budget (INR)","Variance (INR)","Status","% of Total"');
    report.categoryExpenses.forEach((c) => {
      lines.push(
        `"${cleanPdfText(c.category)}",${c.amount},${c.budget},${c.difference},"${c.isOverBudget ? 'OVER' : 'UNDER'}","${c.percentage}%"`
      );
    });
    lines.push('');

    // All Contributions
    lines.push('"4. ALL RESIDENT CONTRIBUTIONS LEDGER"');
    lines.push('"#","Building","Flat No","Resident Name","Expected (INR)","Paid (INR)","Status","Payment Mode","Reference / Receipt"');
    contributions.forEach((c, idx) => {
      lines.push(
        `${idx + 1},"${c.buildingId}","${cleanPdfText(c.flatNumber)}","${cleanPdfText(c.residentName)}",${c.expectedAmount || 1500},${c.paidAmount || 0},"${c.status}","${c.paymentMode || ''}","${c.receiptNumber || c.transactionId || ''}"`
      );
    });
    lines.push('');

    // All Expenses
    lines.push('"5. ALL EXPENSES VOUCHERS"');
    lines.push('"#","Date","Category","Vendor","Description","Amount (INR)","Payment Mode","Invoice Number"');
    expenses.forEach((e, idx) => {
      lines.push(
        `${idx + 1},"${e.expenseDate}","${cleanPdfText(e.category)}","${cleanPdfText(e.vendor)}","${cleanPdfText(e.description)}",${e.amount},"${e.paymentMode || ''}","${e.invoiceNumber || ''}"`
      );
    });

    downloadFile(lines.join('\n'), 'Euriska_Complete_Financial_Statement_2026.csv', 'text/csv;charset=utf-8;');
  },
};
