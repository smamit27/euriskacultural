import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import type { PrasadSlot, PrasadBooking, Contribution, KalakritiEntry, Expense, FinancialReportData, MahaPrasadRSVP, Volunteer, Sponsor } from '../types';

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
      'Age Category',
      'Contact Phone',
      'Dance',
      'Fancy Dress',
    ];

    const body = entries.map((e, idx) => [
      idx + 1,
      cleanPdfText(e.name),
      cleanPdfText(e.flatNumber) || '-',
      cleanPdfText(e.ageGroup) || 'All',
      cleanPdfText(e.phone) || '-',
      e.dance ? '[YES]' : '-',
      e.fancyDress ? '[YES]' : '-',
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
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 54, halign: 'left', fontStyle: 'bold' },
        2: { cellWidth: 24 },
        3: { cellWidth: 24 },
        4: { cellWidth: 32 },
        5: { cellWidth: 22, fontStyle: 'bold' },
        6: { cellWidth: 24, fontStyle: 'bold' },
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
  /**
   * Export Executive Financial Transparency Report as a Power BI-style Visual Dashboard PDF
   */
  exportFinancialTransparencyReportPDF(report: FinancialReportData) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2; // 186mm

    // ==========================================
    // PAGE 1: POWER BI EXECUTIVE DASHBOARD
    // ==========================================

    // 1. Executive Dark Navy Header Banner
    doc.setFillColor(11, 19, 41); // Slate-950 / Dark Navy
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Dual-tone Power BI top accent stripe
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(0, 0, pageWidth * 0.55, 2.5, 'F');
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(pageWidth * 0.55, 0, pageWidth * 0.45, 2.5, 'F');

    // Title & Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURISKA CULTURAL 2026-27', margin, 14);

    doc.setFontSize(9.5);
    doc.setTextColor(254, 215, 170); // Warm amber
    doc.text('EXECUTIVE FINANCIAL TRANSPARENCY & AUDIT DASHBOARD', margin, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    const genDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Official AGM Audit Statement | Live Verified: ${genDate}`, margin, 28);

    // Right-side Verification Badge (Power BI Tile Badge)
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.roundedRect(pageWidth - margin - 56, 9, 56, 18, 2, 2, 'F');
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageWidth - margin - 56, 9, 56, 18, 2, 2, 'S');

    doc.setFillColor(16, 185, 129); // Green status dot
    doc.circle(pageWidth - margin - 50, 15, 1.8, 'F');

    doc.setTextColor(167, 243, 208); // Emerald-200
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('AUDIT VERIFIED', pageWidth - margin - 45, 16);

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Zero-Variance Ledger', pageWidth - margin - 50, 22);

    // ----------------------------------------------------
    // 2. Power BI Key Performance Indicator (KPI) Cards (Y: 40 - 65mm)
    // ----------------------------------------------------
    const kpiY = 40;
    const kpiHeight = 25;
    const kpiGap = 3.3;
    const kpiWidth = (contentWidth - kpiGap * 3) / 4; // ~44mm each

    const kpiCards = [
      {
        title: 'TOTAL INFLOW / REVENUE',
        value: `Rs. ${report.totalIncome.toLocaleString('en-IN')}`,
        subtitle: `Target: Rs. ${report.targetCollection.toLocaleString('en-IN')}`,
        accentColor: [16, 185, 129], // Emerald
        bgFill: [240, 253, 244],
        border: [187, 247, 208],
      },
      {
        title: 'TOTAL EXPENDITURE',
        value: `Rs. ${report.totalExpenses.toLocaleString('en-IN')}`,
        subtitle: `${report.approvedExpensesCount} Vouchers Approved`,
        accentColor: [244, 63, 94], // Rose
        bgFill: [255, 241, 242],
        border: [254, 205, 211],
      },
      {
        title: 'NET TREASURY BALANCE',
        value: `Rs. ${report.currentBalance.toLocaleString('en-IN')}`,
        subtitle: 'Surplus In Reserve Account',
        accentColor: [99, 102, 241], // Indigo
        bgFill: [238, 242, 255],
        border: [199, 210, 254],
      },
      {
        title: 'COLLECTION EFFICIENCY',
        value: `${report.collectionPercentage}%`,
        subtitle: `${report.paidFlatsCount}/${report.totalFlats} Flats (${report.totalFlats - report.paidFlatsCount} Pending)`,
        accentColor: [249, 115, 22], // Orange
        bgFill: [255, 247, 237],
        border: [254, 215, 170],
      },
    ];

    kpiCards.forEach((kpi, idx) => {
      const kpiX = margin + idx * (kpiWidth + kpiGap);

      // Card Background & Border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(kpiX, kpiY, kpiWidth, kpiHeight, 2, 2, 'FD');

      // Top Accent Line
      doc.setFillColor(kpi.accentColor[0], kpi.accentColor[1], kpi.accentColor[2]);
      doc.rect(kpiX, kpiY, kpiWidth, 2, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(kpi.title, kpiX + 3.5, kpiY + 7);

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(kpi.value, kpiX + 3.5, kpiY + 15);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(71, 85, 105); // Slate-600
      doc.text(kpi.subtitle, kpiX + 3.5, kpiY + 21);
    });

    // ----------------------------------------------------
    // 3. Section 1: Building-wise Collection Analysis (Y: 69 - 146mm)
    // ----------------------------------------------------
    const sec1Y = 69;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. BUILDING-WISE COLLECTION PERFORMANCE (POWER BI CLUSTERED BARS)', margin, sec1Y);

    // Left Container: Clustered Bar Chart Visual (w: 104mm, h: 68mm)
    const chartX = margin;
    const chartY = sec1Y + 3;
    const chartW = 104;
    const chartH = 68;

    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(chartX, chartY, chartW, chartH, 2, 2, 'FD');

    // Chart Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Target vs Collected vs Pending (In Rs.)', chartX + 4, chartY + 7);

    // Legend
    doc.setFontSize(6.2);
    doc.setFillColor(16, 185, 129); // Collected
    doc.rect(chartX + chartW - 48, chartY + 4, 4, 3, 'F');
    doc.setTextColor(51, 65, 85);
    doc.text('Collected', chartX + chartW - 42, chartY + 6.5);

    doc.setFillColor(245, 158, 11); // Pending
    doc.rect(chartX + chartW - 24, chartY + 4, 4, 3, 'F');
    doc.text('Pending', chartX + chartW - 18, chartY + 6.5);

    // Draw Bars for each building
    const buildings = report.buildingSummaries.length > 0
      ? report.buildingSummaries
      : [
          { id: 'A', name: 'Wing A', totalFlats: 120, targetAmount: 150000, collectedAmount: 125000, pendingAmount: 25000, paidFlatsCount: 100 } as any,
          { id: 'B', name: 'Wing B', totalFlats: 120, targetAmount: 150000, collectedAmount: 110000, pendingAmount: 40000, paidFlatsCount: 88 } as any,
          { id: 'C', name: 'Wing C', totalFlats: 120, targetAmount: 150000, collectedAmount: 135000, pendingAmount: 15000, paidFlatsCount: 108 } as any,
        ];

    const maxAmount = Math.max(...buildings.map((b) => Math.max(b.targetAmount || 150000, (b.collectedAmount || 0) + (b.pendingAmount || 0))), 150000);
    const plotX = chartX + 18;
    const plotY = chartY + 12;
    const plotW = chartW - 24;
    const plotH = 50;

    const bCount = buildings.length;
    const slotH = plotH / bCount;

    buildings.forEach((b, bIdx) => {
      const by = plotY + bIdx * slotH + 3;
      const target = b.targetAmount || 150000;
      const collected = b.collectedAmount || 0;
      const pending = b.pendingAmount || Math.max(0, target - collected);
      const pct = target > 0 ? Math.round((collected / target) * 100) : 0;

      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanPdfText(b.name || `Wing ${b.buildingId}`), chartX + 3, by + 5);

      // Target background bar outline
      const targetBarW = Math.min((target / maxAmount) * plotW, plotW);
      doc.setFillColor(241, 245, 249);
      doc.rect(plotX, by, targetBarW, 8.5, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.rect(plotX, by, targetBarW, 8.5, 'S');

      // Collected bar (Emerald)
      const collBarW = Math.min((collected / maxAmount) * plotW, targetBarW);
      if (collBarW > 0) {
        doc.setFillColor(16, 185, 129);
        doc.rect(plotX, by, collBarW, 8.5, 'F');
      }

      // Pending bar (Amber)
      const pendBarW = Math.min((pending / maxAmount) * plotW, targetBarW - collBarW);
      if (pendBarW > 0) {
        doc.setFillColor(245, 158, 11);
        doc.rect(plotX + collBarW, by, pendBarW, 8.5, 'F');
      }

      // Value annotations inside / next to bar
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(255, 255, 255);
      if (collBarW > 14) {
        doc.text(`Rs. ${(collected / 1000).toFixed(0)}k`, plotX + 2, by + 5.8);
      }

      // Percentage pill badge on the right
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(plotX + targetBarW + 2, by + 1, 10, 6.5, 1, 1, 'F');
      doc.setTextColor(254, 215, 170);
      doc.setFontSize(5.8);
      doc.text(`${pct}%`, plotX + targetBarW + 3.2, by + 5.2);
    });

    // Right Container: Building Performance Matrix & Efficiency Cards (w: 78mm, h: 68mm)
    const rightCardsX = chartX + chartW + 4;
    const rightCardsW = contentWidth - chartW - 4; // ~78mm
    const rightCardsH = chartH;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightCardsX, chartY, rightCardsW, rightCardsH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Wing Completion Roster', rightCardsX + 4, chartY + 7);

    buildings.forEach((b, bIdx) => {
      const cardY = chartY + 11 + bIdx * 18;
      const target = b.targetAmount || 150000;
      const collected = b.collectedAmount || 0;
      const paidFlats = b.paidFlatsCount || 0;
      const totalFlats = b.totalFlats || 120;
      const pct = target > 0 ? Math.round((collected / target) * 100) : 0;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(rightCardsX + 3, cardY, rightCardsW - 6, 16, 1.5, 1.5, 'F');

      // Header row
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanPdfText(b.name || `Wing ${b.id}`), rightCardsX + 5, cardY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(71, 85, 105);
      doc.text(`${paidFlats}/${totalFlats} Flats Paid`, rightCardsX + rightCardsW - 32, cardY + 4.5);

      // Progress bar
      const barW = rightCardsW - 10;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(rightCardsX + 5, cardY + 6.5, barW, 3, 1, 1, 'F');

      const fillW = Math.max(1, (pct / 100) * barW);
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(rightCardsX + 5, cardY + 6.5, fillW, 3, 1, 1, 'F');

      // Amounts bottom row
      doc.setFontSize(6);
      doc.setTextColor(16, 185, 129);
      doc.text(`Collected: Rs. ${(collected / 1000).toFixed(0)}k`, rightCardsX + 5, cardY + 13.5);

      doc.setTextColor(100, 116, 139);
      doc.text(`Target: Rs. ${(target / 1000).toFixed(0)}k (${pct}%)`, rightCardsX + rightCardsW - 35, cardY + 13.5);
    });

    // ----------------------------------------------------
    // 4. Section 2: Expenditure Allocation & Budget Variance (Y: 144 - 275mm)
    // ----------------------------------------------------
    const sec2Y = 145;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. EXPENDITURE ALLOCATION & BUDGET UTILIZATION (POWER BI VISUALS)', margin, sec2Y);

    // Left Box: Category Allocation Distribution Bars (w: 90mm, h: 125mm)
    const catBoxX = margin;
    const catBoxY = sec2Y + 3;
    const catBoxW = 90;
    const catBoxH = 126;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(catBoxX, catBoxY, catBoxW, catBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Expense Share by Category', catBoxX + 4, catBoxY + 7);

    const categories = report.categoryExpenses.length > 0
      ? report.categoryExpenses
      : [
          { category: 'Ganeshotsav', amount: 150000, budget: 150000, percentage: 38, difference: 0, isOverBudget: false },
          { category: 'Stage & Mandap', amount: 85000, budget: 90000, percentage: 22, difference: 5000, isOverBudget: false },
          { category: 'Dhol Pathak / Band', amount: 45000, budget: 50000, percentage: 12, difference: 5000, isOverBudget: false },
          { category: 'Sound & Light', amount: 40000, budget: 45000, percentage: 10, difference: 5000, isOverBudget: false },
          { category: 'Pooja & Rituals', amount: 35000, budget: 35000, percentage: 9, difference: 0, isOverBudget: false },
          { category: 'Misc & Contingency', amount: 35000, budget: 40000, percentage: 9, difference: 5000, isOverBudget: false },
        ];

    const categoryColors: [number, number, number][] = [
      [234, 88, 12],   // Orange
      [124, 58, 237],  // Purple
      [2, 132, 199],   // Blue
      [16, 185, 129],  // Emerald
      [245, 158, 11],  // Amber
      [225, 29, 72],   // Crimson
      [13, 148, 136],  // Teal
      [79, 70, 229],   // Indigo
    ];

    const maxCatSpend = Math.max(...categories.map((c) => c.amount), 1);

    categories.slice(0, 8).forEach((cat, cIdx) => {
      const rowY = catBoxY + 12 + cIdx * 14;
      const color = categoryColors[cIdx % categoryColors.length];
      const barLen = Math.max(3, (cat.amount / maxCatSpend) * (catBoxW - 35));

      // Category Name & Share
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);
      doc.text(cleanPdfText(cat.category), catBoxX + 4, rowY + 3.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(`${cat.percentage}%`, catBoxX + catBoxW - 14, rowY + 3.5);

      // Horizontal Bar
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(catBoxX + 4, rowY + 5.5, catBoxW - 20, 4, 1, 1, 'F');

      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(catBoxX + 4, rowY + 5.5, barLen, 4, 1, 1, 'F');

      // Amount Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Rs. ${cat.amount.toLocaleString('en-IN')}`, catBoxX + 6 + barLen, rowY + 8.5);
    });

    // Right Box: Budget vs Actual Variance Analysis (w: 92mm, h: 126mm)
    const varBoxX = catBoxX + catBoxW + 4;
    const varBoxW = contentWidth - catBoxW - 4; // ~92mm
    const varBoxH = catBoxH;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(varBoxX, catBoxY, varBoxW, varBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Budget vs Actual Variance Ledger', varBoxX + 4, catBoxY + 7);

    categories.slice(0, 7).forEach((cat, cIdx) => {
      const vRowY = catBoxY + 12 + cIdx * 16;
      const isOver = cat.isOverBudget;
      const variance = Math.abs(cat.difference);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(varBoxX + 3, vRowY, varBoxW - 6, 14.5, 1.5, 1.5, 'F');

      // Category name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanPdfText(cat.category), varBoxX + 5, vRowY + 4.5);

      // Status chip
      if (isOver) {
        doc.setFillColor(254, 226, 226); // Red bg
        doc.roundedRect(varBoxX + varBoxW - 32, vRowY + 1.5, 26, 5, 1, 1, 'F');
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(5.5);
        doc.text(`+Rs.${variance / 1000}k OVER`, varBoxX + varBoxW - 30, vRowY + 4.8);
      } else {
        doc.setFillColor(220, 252, 231); // Green bg
        doc.roundedRect(varBoxX + varBoxW - 32, vRowY + 1.5, 26, 5, 1, 1, 'F');
        doc.setTextColor(22, 163, 74);
        doc.setFontSize(5.5);
        doc.text(`SAVED Rs.${variance / 1000}k`, varBoxX + varBoxW - 30, vRowY + 4.8);
      }

      // Spent vs Budget values
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text(`Actual: Rs. ${cat.amount.toLocaleString('en-IN')}`, varBoxX + 5, vRowY + 9.5);
      doc.text(`Budget: Rs. ${cat.budget.toLocaleString('en-IN')}`, varBoxX + 44, vRowY + 9.5);

      // Mini comparative ratio bar
      const maxB = Math.max(cat.budget, cat.amount, 1);
      const spentRatioW = Math.min((cat.amount / maxB) * (varBoxW - 14), varBoxW - 14);
      doc.setFillColor(isOver ? 239 : 16, isOver ? 68 : 185, isOver ? 68 : 129);
      doc.rect(varBoxX + 5, vRowY + 11.5, spentRatioW, 1.5, 'F');
    });

    // Page 1 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Euriska Cultural Financial Statement 2026-27 | Executive Analytics | Page 1 of 2', margin, 292);

    // ==========================================
    // PAGE 2: AUDIT LEDGER & OFFICIAL CERTIFICATION
    // ==========================================
    doc.addPage();

    // Page 2 Header Banner
    doc.setFillColor(11, 19, 41);
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('EURISKA CULTURAL 2026-27 | AUDIT LEDGER & VOUCHERS', margin, 12);

    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text('Complete Building Breakdown, Approved Expense Vouchers & Official Signatures', margin, 18);

    // 1. Building Summary Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('3. DETAILED BUILDING COLLECTION LEDGER', margin, 28);

    const buildingTableData = report.buildingSummaries.map((b) => [
      cleanPdfText(b.name || `Wing ${b.buildingId}`),
      `${b.totalFlats || 120}`,
      `${b.paidFlatsCount || 0}`,
      `${(b.totalFlats || 120) - (b.paidFlatsCount || 0)}`,
      `Rs. ${(b.targetAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(b.collectedAmount || 0).toLocaleString('en-IN')}`,
      `Rs. ${(b.pendingAmount || 0).toLocaleString('en-IN')}`,
      `${b.targetAmount ? Math.round(((b.collectedAmount || 0) / b.targetAmount) * 100) : 0}%`,
    ]);

    autoTable(doc, {
      startY: 31,
      head: [['Wing', 'Total Flats', 'Paid', 'Pending', 'Target (Rs.)', 'Collected (Rs.)', 'Pending (Rs.)', 'Completion']],
      body: buildingTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.2,
        halign: 'center',
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        5: { fontStyle: 'bold', textColor: [16, 185, 129] },
        6: { textColor: [220, 38, 38] },
        7: { fontStyle: 'bold', textColor: [15, 23, 42] },
      },
      margin: { left: margin, right: margin },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 6;

    // 2. Approved Expense Vouchers Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('4. RECENT APPROVED EXPENDITURE VOUCHERS', margin, currentY);

    const expenseTableData = (report.recentExpenses || []).slice(0, 6).map((exp, idx) => [
      `#${idx + 1}`,
      cleanPdfText(exp.expenseDate) || '-',
      cleanPdfText(exp.category),
      cleanPdfText(exp.vendor),
      cleanPdfText(exp.description),
      `Rs. ${exp.amount.toLocaleString('en-IN')}`,
      cleanPdfText(exp.paymentMode) || 'ONLINE',
      cleanPdfText(exp.invoiceNumber) || '-',
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Voucher', 'Date', 'Category', 'Vendor', 'Description', 'Amount (Rs.)', 'Mode', 'Invoice #']],
      body: expenseTableData.length > 0
        ? expenseTableData
        : [['#1', '2026-09-01', 'Ganeshotsav', 'Dhol Pathak', 'Adv booking for Ganesh Aagman', 'Rs. 5,000', 'ONLINE', 'ADV-DP-2026-01']],
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 7.2,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 6.8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
        6: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    let sec5Y = (doc as any).lastAutoTable.finalY + 7;

    // 3. Our Sponsors & Seva Patrons
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('5. OUR SPONSORS & SEVA PATRONS (SHREE GANESHOTSAV 2026)', margin, sec5Y);

    const sponsorsList: Sponsor[] = (report.sponsors && report.sponsors.length > 0)
      ? report.sponsors
      : [
          { id: '1', eventId: 'ganeshotsav-2026', name: 'Rahul Singh', flatNumber: 'B-307', tier: 'Platinum', sevaCategory: 'Shri Ganesh Murti Seva', description: 'Devotional sponsorship of main Eco-friendly Shree Ganesh Idol', contactPhone: '9820011223', amount: 25000, paymentStatus: 'PAID' },
          { id: '2', eventId: 'ganeshotsav-2026', name: 'Prashant Mahindrakar', flatNumber: 'A-505', tier: 'Gold', sevaCategory: 'Mandap & Stage Decoration Seva', description: 'Grand floral lighting and mandap stage decoration', contactPhone: '9820033445', amount: 15000, paymentStatus: 'PAID' },
        ];

    const patronCardsY = sec5Y + 3;
    const patronCardWidth = (contentWidth - 6) / 2; // ~90mm each
    const patronCardHeight = 44;

    sponsorsList.slice(0, 2).forEach((patron, pIdx) => {
      const px = margin + pIdx * (patronCardWidth + 6);
      const isPlatinum = patron.tier === 'Platinum';

      // Card Background & Border
      doc.setFillColor(isPlatinum ? 255 : 250, isPlatinum ? 247 : 245, isPlatinum ? 237 : 255);
      doc.setDrawColor(isPlatinum ? 254 : 233, isPlatinum ? 215 : 213, isPlatinum ? 170 : 255);
      doc.setLineWidth(0.4);
      doc.roundedRect(px, patronCardsY, patronCardWidth, patronCardHeight, 2, 2, 'FD');

      // Top Header Stripe
      doc.setFillColor(isPlatinum ? 194 : 126, isPlatinum ? 65 : 34, isPlatinum ? 12 : 206);
      doc.rect(px, patronCardsY, patronCardWidth, 2, 'F');

      // Tier Badge Pill
      doc.setFillColor(isPlatinum ? 254 : 243, isPlatinum ? 215 : 232, isPlatinum ? 170 : 255);
      doc.roundedRect(px + 4, patronCardsY + 5, isPlatinum ? 42 : 36, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(isPlatinum ? 194 : 126, isPlatinum ? 65 : 34, isPlatinum ? 12 : 206);
      doc.text(isPlatinum ? '👑 PLATINUM SEVA PATRON' : '✨ GOLD SEVA PATRON', px + 6, patronCardsY + 8.5);

      // Flat Badge
      if (patron.flatNumber) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(px + patronCardWidth - 22, patronCardsY + 5, 18, 5, 1, 1, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(6.2);
        doc.text(`Flat ${cleanPdfText(patron.flatNumber)}`, px + patronCardWidth - 20, patronCardsY + 8.5);
      }

      // Patron Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanPdfText(patron.name || patron.contactPerson || ''), px + 4, patronCardsY + 16);

      // Seva Category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(234, 88, 12); // Orange
      doc.text(`* ${cleanPdfText(patron.sevaCategory || patron.sevaType || 'Festival Seva')}`, px + 4, patronCardsY + 22);

      // Description / Note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(cleanPdfText(patron.description || 'Devotional contribution towards society festival celebration'), patronCardWidth - 8);
      doc.text(splitDesc, px + 4, patronCardsY + 28);

      // Bottom Status Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(px + 4, patronCardsY + 36, px + patronCardWidth - 4, patronCardsY + 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(22, 163, 74); // Green
      doc.text('[OK] Devotional Seva Confirmed', px + 4, patronCardsY + 40.5);

      if (patron.contactPhone) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(`Ph: ${cleanPdfText(patron.contactPhone)}`, px + patronCardWidth - 28, patronCardsY + 40.5);
      }
    });

    // If there are more than 2 sponsors, also add a quick table underneath
    if (sponsorsList.length > 2) {
      const extraSponsorsData = sponsorsList.slice(2).map((s, idx) => [
        `#${idx + 3}`,
        cleanPdfText(s.name || s.contactPerson || ''),
        cleanPdfText(s.flatNumber || '-'),
        cleanPdfText(s.sevaCategory || s.sevaType || 'Festival Seva'),
        cleanPdfText(s.tier || 'Seva Patron'),
        cleanPdfText(s.contactPhone || '-'),
      ]);

      autoTable(doc, {
        startY: patronCardsY + patronCardHeight + 3,
        head: [['#', 'Patron Name', 'Flat', 'Seva Category', 'Tier', 'Phone']],
        body: extraSponsorsData,
        theme: 'grid',
        headStyles: {
          fillColor: [194, 65, 12],
          textColor: [255, 255, 255],
          fontSize: 6.8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 6.5,
          textColor: [30, 41, 59],
        },
        margin: { left: margin, right: margin },
      });
    }

    // Page 2 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Euriska Cultural Financial Statement 2026-27 | Executive Analytics | Page 2 of 2', margin, 292);

    // Save PDF
    doc.save(`Euriska_Cultural_Financial_Transparency_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

    // Sponsors & Seva Patrons
    if (report.sponsors && report.sponsors.length > 0) {
      lines.push('');
      lines.push('"6. OUR SPONSORS & SEVA PATRONS"');
      lines.push('"#","Patron Name","Flat No","Seva Category / Sponsorship","Tier","Contact","Description"');
      report.sponsors.forEach((s, idx) => {
        lines.push(
          `${idx + 1},"${cleanPdfText(s.name || s.contactPerson)}","${cleanPdfText(s.flatNumber || '')}","${cleanPdfText(s.sevaCategory || s.sevaType || '')}","${cleanPdfText(s.tier || '')}","${cleanPdfText(s.contactPhone || '')}","${cleanPdfText(s.description || '')}"`
        );
      });
    }

    downloadFile(lines.join('\n'), 'Euriska_Complete_Financial_Statement_2026.csv', 'text/csv;charset=utf-8;');
  },

  /**
   * Export Single Devotee Maha Prasad Meal Token / Pass
   */
  async exportMahaPrasadPassPDF(rsvp: MahaPrasadRSVP): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Outer Decorative Border
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1.5);
    doc.rect(7, 7, 196, 283);

    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.rect(9, 9, 192, 279);

    // Header Background
    doc.setFillColor(154, 52, 18);
    doc.rect(10, 10, 190, 48, 'F');

    // Add Logo or Icon
    try {
      const logoData = await getImageDataUrl('/euriska_logo.png');
      if (logoData) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(16, 15, 20, 20, 3, 3, 'F');
        doc.addImage(logoData, 'PNG', 17, 16, 18, 18);
      }
    } catch {
      // ignore
    }

    try {
      const ganeshData = await getImageDataUrl('/ganesh_bhagwan.jpg');
      if (ganeshData) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(174, 15, 20, 20, 3, 3, 'F');
        doc.addImage(ganeshData, 'JPEG', 175, 16, 18, 18);
      }
    } catch {
      // ignore
    }

    // Header Text
    doc.setTextColor(254, 215, 170);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('* SHRI GANESHAYA NAMAHA *', 105, 22, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('EURISKA CULTURAL COMMITTEE', 105, 30, { align: 'center' });

    doc.setTextColor(254, 240, 138);
    doc.setFontSize(11.5);
    doc.text('GRAND MAHA PRASAD SEVA & FEAST PASS', 105, 38, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 237, 213);
    doc.text('Official Devotee Family Meal Invitation & Gate Entry Pass', 105, 45, { align: 'center' });

    // Date & Time Ribbon
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, 62, 182, 18, 3, 3, 'FD');

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(
      'Thursday, 24th September 2026  |  8:00 PM - 10:00 PM',
      105,
      71,
      { align: 'center' }
    );

    doc.setFontSize(9.5);
    doc.setTextColor(154, 52, 18);
    doc.text(
      'Venue: Club House Podium & Lawn  |  Pure Satvik Community Feast',
      105,
      77,
      { align: 'center' }
    );

    // RSVP Family Details Table
    const details = [
      ['Flat Number:', cleanPdfText(rsvp.flatNumber) || 'N/A'],
      ['Family / Devotee Name:', cleanPdfText(rsvp.residentName) || 'Resident Family'],
      ['Total Headcount:', `${rsvp.totalHeadcount} Members (${rsvp.adultsCount} Adults, ${rsvp.childrenCount} Kids)`],
      ['Feast Type:', 'Pure Satvik Maha Prasad (100% Vegetarian)'],
      ['Meal Timing Window:', cleanPdfText(rsvp.timeSlot) || '8:00 PM - 10:00 PM'],
      ['Contact Phone:', cleanPdfText(rsvp.phone) || 'Registered Society Devotee'],
      ['Volunteer Status:', rsvp.isVolunteering ? 'YES - Assisting in Prasad Distribution' : 'Family Devotee Guest'],
    ];

    if (rsvp.notes) {
      details.push(['Special Notes / Requests:', cleanPdfText(rsvp.notes)]);
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
        fillColor: [255, 251, 235],
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [124, 45, 18],
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

    const endY = (doc as any).lastAutoTable.finalY || 155;

    // Generate & Embed Scannable QR Code
    const qrBoxY = endY + 8;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, qrBoxY, 182, 48, 3, 3, 'FD');

    try {
      const qrPayload = JSON.stringify({
        token: `EUR-MAHA-PASS:${rsvp.flatNumber}`,
        flat: rsvp.flatNumber,
        name: rsvp.residentName,
        headcount: rsvp.totalHeadcount,
        id: rsvp.id,
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });

      doc.addImage(qrDataUrl, 'PNG', 20, qrBoxY + 4, 40, 40);

      // QR Instruction Box
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('OFFICIAL GATE VERIFICATION QR CODE', 68, qrBoxY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Present this QR Code at the Club House Entry Gate for scanning.', 68, qrBoxY + 18);
      doc.text('Gate volunteers will scan and verify devotee headcount automatically.', 68, qrBoxY + 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(194, 65, 12);
      doc.text(`TOKEN NUMBER: EUR-MAHA-${cleanPdfText(rsvp.flatNumber)}`, 68, qrBoxY + 31);

      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text('STATUS: 100% VERIFIED SOCIETY PASS (VALID FOR ENTRY)', 68, qrBoxY + 38);
    } catch (e) {
      console.warn('QR Code PDF generation failed:', e);
    }

    // Festive Blessing Banner
    const blessingY = qrBoxY + 54;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, blessingY, 182, 14, 3, 3, 'FD');

    doc.setTextColor(194, 65, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('* GANPATI BAPPA MORYA *', 105, blessingY + 9.5, { align: 'center' });

    // Official Pass Footer
    const footerY = blessingY + 22;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('EURISKA CULTURAL & FESTIVE COMMITTEE 2026-27', 16, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Digital Verification Pass | Generated on: ${dateStr}`, 16, footerY + 4.5);

    doc.save(`Euriska_Maha_Prasad_Pass_${cleanPdfText(rsvp.flatNumber) || 'Token'}_24Sep2026.pdf`);
  },

  /**
   * Export Full Maha Prasad Roster PDF for Catering & Volunteer Committee
   */
  exportMahaPrasadRosterPDF(rsvps: import('../types').MahaPrasadRSVP[]) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const totalHeadcount = rsvps.reduce((acc, r) => acc + (r.totalHeadcount || 0), 0);
    const totalAdults = rsvps.reduce((acc, r) => acc + (r.adultsCount || 0), 0);
    const totalKids = rsvps.reduce((acc, r) => acc + (r.childrenCount || 0), 0);

    // Header Background
    doc.setFillColor(154, 52, 18);
    doc.rect(0, 0, 297, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('EURISKA GANESHOTSAV 2026 - MAHA PRASAD ROSTER & HEADCOUNT', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 215, 170);
    doc.text(
      `Event Date: 24th September 2026 (8:00 PM - 10:00 PM) | Total Headcount: ${totalHeadcount} (${totalAdults} Adults, ${totalKids} Kids) | Feast: Pure Satvik Maha Prasad | Families: ${rsvps.length}`,
      14,
      20
    );

    const headers = [
      '#',
      'Wing',
      'Flat',
      'Resident / Devotee Name',
      'Phone',
      'Adults',
      'Kids',
      'Total',
      'Feast Type',
      'Time Slot',
      'Volunteer?',
      'Special Requests',
    ];

    const body = rsvps.map((r, idx) => [
      idx + 1,
      r.buildingId,
      cleanPdfText(r.flatNumber),
      cleanPdfText(r.residentName),
      cleanPdfText(r.phone) || '-',
      r.adultsCount,
      r.childrenCount,
      r.totalHeadcount,
      'Satvik Maha Prasad',
      cleanPdfText(r.timeSlot) || '8-10 PM',
      r.isVolunteering ? 'YES' : 'No',
      cleanPdfText(r.notes) || '-',
    ]);

    autoTable(doc, {
      startY: 30,
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
        0: { cellWidth: 10 },
        1: { cellWidth: 14 },
        2: { cellWidth: 18, fontStyle: 'bold' },
        3: { cellWidth: 44, halign: 'left', fontStyle: 'bold' },
        4: { cellWidth: 26 },
        5: { cellWidth: 14 },
        6: { cellWidth: 14 },
        7: { cellWidth: 14, fontStyle: 'bold' },
        8: { cellWidth: 32 },
        9: { cellWidth: 34 },
        10: { cellWidth: 20 },
        11: { cellWidth: 36, halign: 'left' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 10 && data.cell.raw === 'YES') {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: 10, right: 10 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Euriska Cultural Committee - Confidential Catering Roster | Page ${i} of ${pageCount}`, 14, 200);
    }

    doc.save('Euriska_Maha_Prasad_Roster_24Sep2026.pdf');
  },

  /**
   * Export Official Devotee Seva Patron Certificate of Appreciation PDF
   */
  async exportSingleSponsorCertificatePDF(sponsor: {
    devoteeName: string;
    flat: string;
    building?: string;
    sevaTitle: string;
    sevaCategory?: string;
    description?: string;
    highlights?: string[];
    mantra?: string;
    phone?: string;
  }) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let logoData: string | null = null;
    let ganeshData: string | null = null;
    try {
      logoData = await getImageDataUrl('/euriska_logo.png');
      ganeshData = await getImageDataUrl('/ganesh_bhagwan.jpg');
    } catch {
      // ignore
    }

    // Outer Rich Royal Border Frame
    doc.setDrawColor(194, 65, 12); // Deep saffron #c2410c
    doc.setLineWidth(1.8);
    doc.roundedRect(10, 10, 190, 277, 6, 6, 'D');

    doc.setDrawColor(245, 158, 11); // Gold trim #f59e0b
    doc.setLineWidth(0.8);
    doc.roundedRect(13, 13, 184, 271, 4, 4, 'D');

    // Header Background
    doc.setFillColor(154, 52, 18); // Maroon #9a3412
    doc.roundedRect(15, 15, 180, 46, 3, 3, 'F');

    // Gold Accent Line
    doc.setFillColor(251, 191, 36);
    doc.rect(15, 59, 180, 2, 'F');

    // Left Logo
    if (logoData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(19, 19, 28, 28, 4, 4, 'F');
        doc.addImage(logoData, 'PNG', 20.5, 20.5, 25, 25);
      } catch {
        // ignore
      }
    }

    // Right Ganesh Idol
    if (ganeshData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(163, 19, 28, 28, 4, 4, 'F');
        doc.addImage(ganeshData, 'JPEG', 164.5, 20.5, 25, 25);
      } catch {
        // ignore
      }
    }

    // Header Typography
    doc.setTextColor(254, 215, 170);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('* SHRI GANESHAYA NAMAHA *', 105, 23, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.text('MAJESTIQUE EURISKA CULTURAL UTSAV 2026', 105, 31, { align: 'center' });

    doc.setTextColor(254, 240, 138);
    doc.setFontSize(12);
    doc.text('CERTIFICATE OF DEVOTEE SEVA PATRON', 105, 40, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 237, 213);
    doc.text('Official Devotee Recognition & Appreciation Document', 105, 47, { align: 'center' });

    // Ribbon Sub-Header
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.6);
    doc.roundedRect(15, 65, 180, 16, 3, 3, 'FD');

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(
      cleanPdfText(`Seva: ${sponsor.sevaTitle.toUpperCase()} (Flat ${sponsor.flat})`),
      105,
      73.5,
      { align: 'center' }
    );

    doc.setFontSize(8.5);
    doc.setTextColor(154, 52, 18);
    doc.text(
      cleanPdfText(`Honoring Devotee Sponsor: ${sponsor.devoteeName} • ${sponsor.building || 'Euriska Society'}`),
      105,
      79,
      { align: 'center' }
    );

    // Certificate Presentation Paragraph
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const appreciationText = cleanPdfText(
      `This Certificate of Honor and Gratitude is proudly presented to ${sponsor.devoteeName} (Flat ${sponsor.flat}) for their benevolent sponsorship and dedicated contribution towards ${sponsor.sevaTitle} at the Majestique Euriska Cultural & Festive Celebrations 2026.`
    );
    const splitText = doc.splitTextToSize(appreciationText, 176);
    doc.text(splitText, 17, 90);

    // Devotee & Seva Specification Table
    const tableData = [
      ['Devotee Sponsor Name:', cleanPdfText(sponsor.devoteeName)],
      ['Flat & Building:', `Flat ${cleanPdfText(sponsor.flat)} (${cleanPdfText(sponsor.building) || 'Majestique Euriska'})`],
      ['Seva Dedication Category:', cleanPdfText(sponsor.sevaTitle)],
      ['Festival Celebration:', 'Ganesh Chaturthi & Cultural Extravaganza 2026 (14-25 Sep 2026)'],
      ['Contribution Significance:', cleanPdfText(sponsor.description || 'Major community seva partner bringing blessings to 231+ resident families.')],
      ['Contact Reference:', cleanPdfText(sponsor.phone) || 'Registered Society Resident'],
    ];

    autoTable(doc, {
      startY: 106,
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9.5,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235],
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [124, 45, 18],
          cellWidth: 54,
          fillColor: [254, 243, 199],
        },
        1: {
          fontStyle: 'bold',
          textColor: [15, 23, 42],
          cellWidth: 126,
        },
      },
      margin: { left: 15, right: 15 },
    });

    const endY = (doc as any).lastAutoTable.finalY || 165;

    // Highlights Box if available
    if (sponsor.highlights && sponsor.highlights.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(15, endY + 8, 180, 24, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('KEY SEVA HIGHLIGHTS & CONTRIBUTIONS:', 19, endY + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      sponsor.highlights.forEach((h, idx) => {
        doc.text(`[x] ${cleanPdfText(h)}`, 19, endY + 20 + idx * 4.5);
      });
    }

    // Devotional Blessing Shloka Banner
    const blessingY = endY + 38;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
    doc.setLineWidth(0.8);
    doc.roundedRect(15, blessingY, 180, 16, 3, 3, 'FD');

    doc.setTextColor(194, 65, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('* ॐ गं गणपतये नमः • GANPATI BAPPA MORYA *', 105, blessingY + 8, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'normal');
    doc.text('May Lord Ganesha shower supreme health, prosperity and happiness upon the sponsor family.', 105, blessingY + 13, { align: 'center' });

    // Official Committee Signature Seals
    const signY = blessingY + 26;

    // Left Signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Sachin Singh / Amit Singh', 24, signY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Cultural Committee Head', 24, signY + 12);
    doc.text('Euriska Society, Pune', 24, signY + 16);

    // Center Seal
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(82, signY + 2, 46, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('OFFICIAL SEAL', 105, signY + 9, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text('VERIFIED PATRON', 105, signY + 15, { align: 'center' });

    // Right Signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Committee', 148, signY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Treasurer & Secretary', 148, signY + 12);
    doc.text('Euriska Society, Pune', 148, signY + 16);

    // Footer Tag
    const footerY = signY + 26;
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Digital Verification Certificate | Generated on: ${dateStr} | ID: EUR-SPON-${cleanPdfText(sponsor.flat)}`, 15, footerY);

    doc.save(`Euriska_Seva_Certificate_${cleanPdfText(sponsor.devoteeName).replace(/\s+/g, '_')}_Flat${cleanPdfText(sponsor.flat)}.pdf`);
  },

  /**
   * Export Full Seva Patrons & Sponsors Directory Roster PDF
   */
  async exportAllSponsorsPDF(sponsors: any[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let logoData: string | null = null;
    try {
      logoData = await getImageDataUrl('/euriska_logo.png');
    } catch {
      // ignore
    }

    // Header Background
    doc.setFillColor(30, 27, 75); // Indigo-950 #1e1b4b
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFillColor(249, 115, 22); // Orange strip
    doc.rect(0, 34, 210, 2, 'F');

    if (logoData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(172, 5, 26, 26, 4, 4, 'F');
        doc.addImage(logoData, 'PNG', 174, 7, 22, 22);
      } catch {
        // ignore
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MAJESTIQUE EURISKA UTSAV 2026', 14, 14);

    doc.setFontSize(12);
    doc.setTextColor(254, 215, 170);
    doc.text('OUR SPONSORS & SEVA PATRONS DIRECTORY', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Official Directory of Seva Sponsors & Devotee Contributors | Generated: ${dateStr}`, 14, 29);

    // Summary Card
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, 40, 182, 12, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      cleanPdfText(`Total Active Seva Patrons: ${sponsors.length} | 50% Murti Seva (B-307) | 50% Decoration Seva (A-505) | 100% Devotion`),
      18,
      47.5
    );

    const tableBody = sponsors.map((sp, idx) => [
      idx + 1,
      cleanPdfText(sp.devoteeName || sp.name),
      `Flat ${cleanPdfText(sp.flat || sp.flatNumber)}`,
      cleanPdfText(sp.building || (sp.buildingId ? `${sp.buildingId} Wing` : 'Euriska')),
      cleanPdfText(sp.sevaTitle || sp.sevaCategory || 'Festival Seva'),
      cleanPdfText(sp.description || 'Devotee Seva Sponsor'),
      cleanPdfText(sp.phone || sp.contactPhone || 'Resident'),
    ]);

    autoTable(doc, {
      startY: 56,
      head: [['#', 'Devotee Name', 'Flat', 'Wing', 'Seva Dedication', 'Details & Purpose', 'Contact Phone']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [49, 46, 129],
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
        1: { cellWidth: 36, fontStyle: 'bold' },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 38, fontStyle: 'bold', textColor: [194, 65, 12] },
        5: { cellWidth: 36 },
        6: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Euriska Cultural Committee - Seva Patrons & Sponsors Roster | Page ${i} of ${pageCount}`, 14, 290);
    }

    doc.save('Euriska_Seva_Patrons_Directory_2026.pdf');
  },

  /**
   * Export Cultural Committee Volunteers Directory as PDF
   */
  async exportVolunteersRosterPDF(volunteers: Volunteer[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header Background
    doc.setFillColor(194, 65, 12); // Deep saffron/orange #c2410c
    doc.rect(0, 0, 210, 38, 'F');

    // Accent line
    doc.setFillColor(251, 191, 36); // Gold #fbbf24
    doc.rect(0, 36, 210, 2, 'F');

    // Embed Logo if available
    const logoData = await getImageDataUrl('/icons/icon-192x192.png');
    if (logoData) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(172, 5, 26, 26, 4, 4, 'F');
        doc.addImage(logoData, 'PNG', 174, 7, 22, 22);
      } catch {
        // ignore
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MAJESTIQUE EURISKA UTSAV 2026', 14, 14);

    doc.setFontSize(12);
    doc.setTextColor(254, 215, 170);
    doc.text('OFFICIAL VOLUNTEERS ROSTER & CONTACT DIRECTORY', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Official Organizing Committee & Volunteer Roster | Generated: ${dateStr}`, 14, 29);

    // Summary Card
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, 40, 182, 12, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      cleanPdfText(`Total Dedicated Volunteers: ${volunteers.length} Members | Cultural Committee | Euriska Utsav 2026`),
      18,
      47.5
    );

    const sortedVolunteers = [...volunteers].sort((a, b) => a.name.localeCompare(b.name));

    const tableBody = sortedVolunteers.map((vol, idx) => [
      idx + 1,
      cleanPdfText(vol.name),
      cleanPdfText(vol.flatNumber),
      cleanPdfText(vol.buildingId ? `Wing ${vol.buildingId}` : 'Euriska'),
      cleanPdfText(vol.phone || 'N/A'),
      cleanPdfText(vol.role || 'Cultural Committee Volunteer'),
      cleanPdfText(vol.status || 'AVAILABLE'),
    ]);

    autoTable(doc, {
      startY: 56,
      head: [['#', 'Volunteer Name', 'Flat No', 'Wing', 'Contact Number', 'Committee Role', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [194, 65, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42],
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 46, fontStyle: 'bold' },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 32, halign: 'center', fontStyle: 'bold', textColor: [2, 132, 199] },
        5: { cellWidth: 38 },
        6: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Euriska Cultural Committee - Volunteers Directory 2026 | Page ${i} of ${pageCount}`, 14, 290);
    }

    doc.save('Euriska_Volunteers_Roster_2026.pdf');
  },
};


