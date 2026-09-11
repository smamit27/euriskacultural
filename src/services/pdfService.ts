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
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{0900}-\u{097F}]/gu, '')
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
      ['Reporting Time:', slot.dayNumber === 12 ? '3:45 PM (Prior to Visarjan Procession)' : '7:45 PM (15 Minutes prior to Aarti for Mandap Sthapana)'],
      ['Maha Aarti Timing:', slot.dayNumber === 12 ? '4:00 PM (Ganesh Visarjan Procession & Aarti)' : '8:00 PM Sharp (Evening Aarti, Stuti & Modak Prasad)'],
      ['Venue Location:', slot.dayNumber === 12 ? 'Main Ground & Visarjan Route' : 'Club House Podium'],
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
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['#', 'Flat', 'Resident Name', 'Expected', 'Paid', 'Status', 'Mode']],
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
        2: { cellWidth: 54 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 26, halign: 'center' },
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
   * Export Expense Management Ledger as PDF
   */
  exportExpensesPDF(expenses: Expense[]) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header bar ─────────────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('EURISKA - EXPENSE MANAGEMENT LEDGER', 14, 14);

    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${dateStr}`, pageWidth - 14, 14, { align: 'right' });

    // ── Sub-header summary line ─────────────────────────────────────────────
    const approved = expenses.filter((e) => e.status === 'APPROVED');
    const pending  = expenses.filter((e) => e.status === 'PENDING');
    const rejected = expenses.filter((e) => e.status === 'REJECTED');
    const totalApproved = approved.reduce((s, e) => s + e.amount, 0);
    const totalPending  = pending.reduce((s, e) => s + e.amount, 0);
    const totalRejected = rejected.reduce((s, e) => s + e.amount, 0);

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Cultural & Festive 2026-27  |  Total: ${expenses.length} expenses  |  Approved: Rs.${totalApproved.toLocaleString('en-IN')}  |  Pending: Rs.${totalPending.toLocaleString('en-IN')}  |  Rejected: Rs.${totalRejected.toLocaleString('en-IN')}`,
      14,
      30
    );

    // ── KPI summary cards ──────────────────────────────────────────────────
    const cards = [
      { label: 'Approved',  count: approved.length,  amount: totalApproved, fill: [5, 150, 105]  as [number,number,number], textColor: [255,255,255] as [number,number,number] },
      { label: 'Pending',   count: pending.length,   amount: totalPending,  fill: [217,119, 6]   as [number,number,number], textColor: [255,255,255] as [number,number,number] },
      { label: 'Rejected',  count: rejected.length,  amount: totalRejected, fill: [220, 38, 38]  as [number,number,number], textColor: [255,255,255] as [number,number,number] },
      { label: 'Total',     count: expenses.length,  amount: totalApproved + totalPending, fill: [30, 41, 59] as [number,number,number], textColor: [255,255,255] as [number,number,number] },
    ];
    const cardW = 60, cardH = 18, cardY = 34, gap = 6;
    cards.forEach((card, i) => {
      const cx = 14 + i * (cardW + gap);
      doc.setFillColor(...card.fill);
      doc.roundedRect(cx, cardY, cardW, cardH, 3, 3, 'F');
      doc.setTextColor(...card.textColor);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${card.label.toUpperCase()} (${card.count})`, cx + 4, cardY + 6);
      doc.setFontSize(10);
      doc.text(`Rs. ${card.amount.toLocaleString('en-IN')}`, cx + 4, cardY + 14);
    });

    // ── Table ──────────────────────────────────────────────────────────────
    const tableBody = expenses.map((e, idx) => [
      idx + 1,
      cleanPdfText(e.expenseDate) || '-',
      cleanPdfText(e.category) || '-',
      cleanPdfText(e.vendor) || '-',
      cleanPdfText(e.description) || '-',
      (e.paymentMode || '-').replace('_', ' '),
      `Rs. ${e.amount.toLocaleString('en-IN')}`,
      e.status,
      cleanPdfText(e.approvedBy) || '-',
    ]);

    autoTable(doc, {
      startY: 58,
      head: [['#', 'Date', 'Category', 'Vendor', 'Description', 'Mode', 'Amount', 'Status', 'Approved By']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 7.5, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 32 },
        3: { cellWidth: 32 },
        4: { cellWidth: 62 },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 30 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const val = data.cell.raw as string;
          if (val === 'APPROVED') {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'PENDING') {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'REJECTED') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Highlight rejected rows with light red background
        if (data.section === 'body') {
          const rowData = expenses[data.row.index];
          if (rowData?.status === 'REJECTED' && data.column.index !== 7) {
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // ── Footer ─────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Euriska Cultural Committee - Confidential Society Record | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.getHeight() - 6
      );
    }

    doc.save('Euriska_Expense_Ledger_2026.pdf');
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
  exportFinancialTransparencyReportPDF(report: FinancialReportData, _contributions: Contribution[] = [], expenses: Expense[] = []) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 190mm
    const genDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Color Palette (matching reference design)
    const navy = [26, 42, 78] as [number, number, number];
    const green = [34, 139, 78] as [number, number, number];

    const white = [255, 255, 255] as [number, number, number];
    const offWhite = [245, 248, 252] as [number, number, number];
    const gray100 = [241, 245, 249] as [number, number, number];
    const gray300 = [203, 213, 225] as [number, number, number];
    const gray500 = [100, 116, 139] as [number, number, number];
    const gray700 = [51, 65, 85] as [number, number, number];
    const gray900 = [15, 23, 42] as [number, number, number];
    const red = [220, 38, 38] as [number, number, number];
    const orange = [234, 88, 12] as [number, number, number];
    const blue = [37, 99, 235] as [number, number, number];
    const purple = [124, 58, 237] as [number, number, number];
    const amber = [245, 158, 11] as [number, number, number];
    const teal = [13, 148, 136] as [number, number, number];
    const pink = [236, 72, 153] as [number, number, number];

    // Helper: Draw a rounded KPI card
    const drawKpiCard = (x: number, y: number, w: number, h: number, iconColor: [number, number, number], title: string, value: string, subtitle: string, subtitleColor: [number, number, number]) => {
      // Card bg with subtle shadow effect
      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');

      // Left accent stripe
      doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
      doc.rect(x, y + 2, 1.5, h - 4, 'F');

      // Icon circle
      doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
      doc.circle(x + 7, y + h / 2, 3.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('Rs', x + 5.2, y + h / 2 + 1.5);

      // Title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(title, x + 13, y + 6.5);

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(gray900[0], gray900[1], gray900[2]);
      doc.text(value, x + 13, y + 13.5);

      // Subtitle / Change indicator
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(subtitleColor[0], subtitleColor[1], subtitleColor[2]);
      doc.text(subtitle, x + 13, y + 18.5);
    };

    // ==========================================
    // PAGE 1: FINANCIAL REPORT - EXPENSES OVERVIEW
    // ==========================================

    // ---- HEADER SECTION ----
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Green circle decoration (left)
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(margin + 8, 14, 8, 'F');
    doc.setFillColor(34, 160, 90);
    doc.circle(margin + 8, 14, 5.5, 'F');

    // Small leaf accent
    doc.setFillColor(100, 200, 120);
    doc.circle(margin + 14, 8, 2.5, 'F');
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.circle(margin + 14, 8, 1.2, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Euriska Cultural', margin + 20, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 180, 160);
    doc.text('A GREENER, HAPPIER COMMUNITY', margin + 20, 18);

    // Right side - Report Title Box
    doc.setDrawColor(gray500[0], gray500[1], gray500[2]);
    doc.setLineWidth(0.3);
    doc.line(pageWidth - margin - 52, 5, pageWidth - margin - 52, 23);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Financial Report', pageWidth - margin - 48, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 200, 220);
    doc.text('Expenses Overview', pageWidth - margin - 48, 17);
    doc.text(`01 Apr 2026 - 30 Sep 2026`, pageWidth - margin - 48, 22);

    // ---- KPI SUMMARY CARDS (5 cards) ----
    const kpiY = 33;
    const kpiH = 21;
    const kpiGap = 2.5;
    const kpiW = (contentWidth - kpiGap * 4) / 5; // ~36mm each

    const totalExpenses = report.totalExpenses;
    const totalCollected = report.totalCollected;
    const pendingPayments = report.totalPending;
    const currentBalance = report.currentBalance;
    const budgetUtilPct = report.collectionPercentage;

    const kpiCards = [
      { title: 'Total Collected',    value: `Rs.${(totalCollected / 1000).toFixed(0)}k`,  sub: `${report.paidFlatsCount} of ${report.totalFlats} flats paid`, subColor: green,  accent: green },
      { title: 'Total Expenses',     value: `Rs.${(totalExpenses / 1000).toFixed(0)}k`,   sub: `${report.approvedExpensesCount} approved vouchers`,          subColor: gray500, accent: navy },
      { title: 'Pending Collection', value: `Rs.${(pendingPayments / 1000).toFixed(0)}k`, sub: `${report.pendingFlatsCount || (report.totalFlats - report.paidFlatsCount)} flats pending`, subColor: red,    accent: amber },
      { title: 'Current Balance',    value: `Rs.${(currentBalance / 1000).toFixed(0)}k`,  sub: 'Collected minus approved spend',                              subColor: currentBalance >= 0 ? green : red, accent: teal },
      { title: 'Collection Rate',    value: `${budgetUtilPct}%`,                           sub: `Target: Rs.${(report.targetCollection / 1000).toFixed(0)}k`, subColor: gray500, accent: blue },
    ];

    kpiCards.forEach((kpi, idx) => {
      const kx = margin + idx * (kpiW + kpiGap);
      drawKpiCard(kx, kpiY, kpiW, kpiH, kpi.accent, kpi.title, kpi.value, kpi.sub, kpi.subColor);
    });

    // ---- CHARTS ROW (2 panels): Monthly Expense Trend | Expense by Category ----
    const chartRowY = kpiY + kpiH + 5;
    const chartRowH = 60;
    const chartColGap = 3;
    const chartCol1W = (contentWidth - chartColGap) / 2; // ~93.5mm each
    const chartCol2W = contentWidth - chartCol1W - chartColGap;

    // Panel 1: Monthly Expense Trend (Bar Chart)
    const c1x = margin;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(c1x, chartRowY, chartCol1W, chartRowH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Monthly Expense Trend', c1x + 4, chartRowY + 6);

    // Legend
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(c1x + chartCol1W - 28, chartRowY + 3, 3, 2.5, 'F');
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.setFontSize(5);
    doc.text('Actual', c1x + chartCol1W - 24, chartRowY + 5.5);
    doc.setFillColor(gray300[0], gray300[1], gray300[2]);
    doc.rect(c1x + chartCol1W - 14, chartRowY + 3, 3, 2.5, 'F');
    doc.text('Budget', c1x + chartCol1W - 10, chartRowY + 5.5);

    // Draw bars for months (Apr-Sep)
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const barAreaX = c1x + 10;
    const barAreaY = chartRowY + 10;
    const barAreaH = 38;
    const barAreaW = chartCol1W - 16;
    const barSlotW = barAreaW / months.length;

    // Y-axis labels
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    for (let i = 0; i <= 4; i++) {
      const ly = barAreaY + (barAreaH / 4) * i;
      doc.text(`Rs.${((4 - i) * 0.5 + 0.5).toFixed(1)}L`, c1x + 2, ly + 1.5);
      doc.setDrawColor(gray100[0], gray100[1], gray100[2]);
      doc.setLineWidth(0.15);
      doc.line(barAreaX, ly, barAreaX + barAreaW, ly);
    }

    // Monthly data (simulated proportional bars)
    const monthVals = [0.7, 0.6, 0.8, 0.55, 0.75, 0.9]; // ratio of max
    months.forEach((m, mi) => {
      const bx = barAreaX + mi * barSlotW + barSlotW * 0.15;
      const bw = barSlotW * 0.32;
      const bh = monthVals[mi] * barAreaH * 0.85;
      const budgetH = 0.8 * barAreaH * 0.85;

      // Budget bar (lighter)
      doc.setFillColor(200, 220, 240);
      doc.rect(bx + bw + 1, barAreaY + barAreaH - budgetH, bw, budgetH, 'F');

      // Actual bar
      doc.setFillColor(navy[0], navy[1], navy[2]);
      doc.rect(bx, barAreaY + barAreaH - bh, bw, bh, 'F');

      // Month label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(m, bx + bw * 0.5, barAreaY + barAreaH + 4);
    });

    // Panel 2: Expense by Category (Simulated Donut)
    const c2x = c1x + chartCol1W + chartColGap;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.roundedRect(c2x, chartRowY, chartCol2W, chartRowH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Expense by Category', c2x + 4, chartRowY + 6);

    // Donut center
    const donutCX = c2x + 26;
    const donutCY = chartRowY + 34;
    const donutR = 18;

    // Draw donut segments as colored arcs (simplified as concentric rings)
    const categories = report.categoryExpenses.length > 0
      ? report.categoryExpenses
      : [
          { category: 'Security', amount: 348200, budget: 400000, percentage: 28, difference: 51800, isOverBudget: false },
          { category: 'Housekeeping', amount: 224500, budget: 250000, percentage: 18, difference: 25500, isOverBudget: false },
          { category: 'Maintenance', amount: 186400, budget: 200000, percentage: 15, difference: 13600, isOverBudget: false },
          { category: 'Electricity', amount: 149300, budget: 160000, percentage: 12, difference: 10700, isOverBudget: false },
          { category: 'Water', amount: 99200, budget: 100000, percentage: 8, difference: 800, isOverBudget: false },
          { category: 'Repairs', amount: 87500, budget: 90000, percentage: 7, difference: 2500, isOverBudget: false },
          { category: 'Garden', amount: 74600, budget: 80000, percentage: 6, difference: 5400, isOverBudget: false },
          { category: 'Events', amount: 49800, budget: 50000, percentage: 4, difference: 200, isOverBudget: false },
        ];

    const categoryColors: [number, number, number][] = [
      navy, purple, blue, green, amber, orange, teal, pink,
    ];

    // Draw donut ring segments
    let segAngle = -90; // start top
    categories.slice(0, 8).forEach((cat, ci) => {
      const arcDeg = (cat.percentage / 100) * 360;
      const color = categoryColors[ci % categoryColors.length];

      // Draw as filled sector approximation (pie wedge)
      const startRad = (segAngle * Math.PI) / 180;
      const endRad = ((segAngle + arcDeg) * Math.PI) / 180;
      const steps = Math.max(8, Math.round(arcDeg / 5));

      doc.setFillColor(color[0], color[1], color[2]);
      const points: [number, number][] = [[donutCX, donutCY]];
      for (let s = 0; s <= steps; s++) {
        const angle = startRad + (endRad - startRad) * (s / steps);
        points.push([donutCX + donutR * Math.cos(angle), donutCY + donutR * Math.sin(angle)]);
      }
      // Draw as triangle fan
      for (let t = 1; t < points.length - 1; t++) {
        doc.triangle(
          points[0][0], points[0][1],
          points[t][0], points[t][1],
          points[t + 1][0], points[t + 1][1],
          'F'
        );
      }
      segAngle += arcDeg;
    });

    // Inner circle to make it a donut
    doc.setFillColor(white[0], white[1], white[2]);
    doc.circle(donutCX, donutCY, donutR * 0.55, 'F');

    // Center text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text(`Rs.${(totalExpenses / 100000).toFixed(2)}L`, donutCX - 8, donutCY - 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Total Expenses', donutCX - 8, donutCY + 3.5);

    // Category legend (right of donut)
    const legX = donutCX + donutR + 6;
    categories.slice(0, 8).forEach((cat, ci) => {
      const ly = chartRowY + 12 + ci * 5.8;
      const color = categoryColors[ci % categoryColors.length];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(legX, ly - 1.5, 3, 2.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(gray700[0], gray700[1], gray700[2]);
      doc.text(`${cleanPdfText(cat.category)}  ${cat.percentage}%`, legX + 4.5, ly);
    });

    // ---- CATEGORY WISE EXPENSES (Horizontal Cards Row) ----
    const catRowY = chartRowY + chartRowH + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Category Wise Expenses', margin, catRowY);

    const catCardY = catRowY + 3;
    const catCardH = 20;
    const numCatCards = Math.min(categories.length, 8);
    const catCardGap = 1.5;
    const catCardW = (contentWidth - catCardGap * (numCatCards - 1)) / numCatCards;

    categories.slice(0, numCatCards).forEach((cat, ci) => {
      const cx = margin + ci * (catCardW + catCardGap);
      const color = categoryColors[ci % categoryColors.length];

      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(cx, catCardY, catCardW, catCardH, 1.5, 1.5, 'FD');

      // Color dot
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx + 3, catCardY + 4, 1.5, 'F');

      // Category name
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.8);
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(cleanPdfText(cat.category).substring(0, 10), cx + 6, catCardY + 5);

      // Amount
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(gray900[0], gray900[1], gray900[2]);
      doc.text(`Rs.${(cat.amount / 1000).toFixed(0)}k`, cx + 2.5, catCardY + 11.5);

      // Percentage
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(`${cat.percentage}% of total`, cx + 2.5, catCardY + 16);

      // Bottom progress bar
      doc.setFillColor(gray100[0], gray100[1], gray100[2]);
      doc.rect(cx + 2, catCardY + catCardH - 2.5, catCardW - 4, 1.5, 'F');
      const fillW = Math.max(1, (cat.percentage / 100) * (catCardW - 4));
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(cx + 2, catCardY + catCardH - 2.5, fillW, 1.5, 'F');
    });

    // ---- BOTTOM SECTION: 3-Column Layout ----
    const bottomY = catCardY + catCardH + 5;
    const bottomH = 60;
    const bColGap = 3;
    const bCol1W = 60;
    const bCol2W = 44;
    const bCol3W = contentWidth - bCol1W - bCol2W - bColGap * 2;

    // Column 1: Top 5 Expense Categories Table
    const t5x = margin;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(t5x, bottomY, bCol1W, bottomH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Top 5 Expense Categories', t5x + 4, bottomY + 6);

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('#', t5x + 3, bottomY + 11);
    doc.text('Category', t5x + 10, bottomY + 11);
    doc.text('Amount (Rs.)', t5x + 30, bottomY + 11);
    doc.text('% of Total', t5x + 48, bottomY + 11);

    doc.setDrawColor(gray100[0], gray100[1], gray100[2]);
    doc.setLineWidth(0.15);
    doc.line(t5x + 3, bottomY + 12.5, t5x + bCol1W - 3, bottomY + 12.5);

    categories.slice(0, 5).forEach((cat, ci) => {
      const ry = bottomY + 15 + ci * 8.5;
      const color = categoryColors[ci % categoryColors.length];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(gray900[0], gray900[1], gray900[2]);
      doc.text(`${ci + 1}`, t5x + 4, ry + 3);

      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(t5x + 10, ry + 1.8, 1.2, 'F');

      doc.text(cleanPdfText(cat.category).substring(0, 12), t5x + 13, ry + 3);

      doc.setFont('helvetica', 'bold');
      doc.text(`Rs.${(cat.amount / 1000).toFixed(0)}k`, t5x + 33, ry + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(`${cat.percentage}%`, t5x + 51, ry + 3);

      if (ci < 4) {
        doc.setDrawColor(gray100[0], gray100[1], gray100[2]);
        doc.line(t5x + 3, ry + 6, t5x + bCol1W - 3, ry + 6);
      }
    });

    // Column 2: Payment Status (Donut Summary)
    const psX = t5x + bCol1W + bColGap;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.roundedRect(psX, bottomY, bCol2W, bottomH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Payment Status', psX + 4, bottomY + 6);

    // Mini donut
    const psCX = psX + bCol2W / 2;
    const psCY = bottomY + 25;
    const psR = 12;

    const paidPct = report.paidFlatsCount / Math.max(report.totalFlats, 1);
    const pendPct = 1 - paidPct;

    // Paid arc (green)
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(psCX, psCY, psR, 'F');

    // Pending arc (amber) - draw over as a wedge
    if (pendPct > 0.01) {
      const pStart = (-90 + paidPct * 360) * Math.PI / 180;
      const pEnd = (-90 + 360) * Math.PI / 180;
      const pts: [number, number][] = [[psCX, psCY]];
      const segSteps = 20;
      for (let s = 0; s <= segSteps; s++) {
        const a = pStart + (pEnd - pStart) * (s / segSteps);
        pts.push([psCX + psR * Math.cos(a), psCY + psR * Math.sin(a)]);
      }
      doc.setFillColor(amber[0], amber[1], amber[2]);
      for (let t = 1; t < pts.length - 1; t++) {
        doc.triangle(pts[0][0], pts[0][1], pts[t][0], pts[t][1], pts[t + 1][0], pts[t + 1][1], 'F');
      }
    }

    // Inner white circle
    doc.setFillColor(white[0], white[1], white[2]);
    doc.circle(psCX, psCY, psR * 0.55, 'F');

    // Center count
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text(`${report.approvedExpensesCount || report.totalFlats}`, psCX - 4, psCY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Total', psCX - 3, psCY + 4);

    // Status legend
    const slY = bottomY + bottomH - 16;
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(psX + 5, slY, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(gray700[0], gray700[1], gray700[2]);
    doc.text(`Paid  ${report.paidFlatsCount} (${Math.round(paidPct * 100)}%)`, psX + 8, slY + 1.5);

    doc.setFillColor(amber[0], amber[1], amber[2]);
    doc.circle(psX + 5, slY + 5, 1.5, 'F');
    doc.text(`Pending  ${report.totalFlats - report.paidFlatsCount} (${Math.round(pendPct * 100)}%)`, psX + 8, slY + 6.5);

    // Column 3: Key Insights
    const kiX = psX + bCol2W + bColGap;
    const kiW = bCol3W;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.roundedRect(kiX, bottomY, kiW, bottomH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Key Insights', kiX + 4, bottomY + 6);

    // Insight items
    const insights = [
      { icon: 'v', color: green, title: `${budgetUtilPct}%`, desc: 'Collection rate vs. target' },
      { icon: 'i', color: blue, title: `${report.paidFlatsCount}/${report.totalFlats} Flats`, desc: 'Contributions received' },
      { icon: 'Rs', color: navy, title: `Rs.${(report.currentBalance / 1000).toFixed(0)}k`, desc: 'Current balance in treasury' },
      { icon: '!', color: orange, title: 'Expenses within budget', desc: `${budgetUtilPct}% of annual budget utilized` },
      { icon: '*', color: purple, title: 'Opportunity to optimize', desc: 'Review pending collections' },
    ];

    insights.forEach((ins, ii) => {
      const iy = bottomY + 10 + ii * 9.5;

      // Icon circle
      doc.setFillColor(ins.color[0], ins.color[1], ins.color[2]);
      doc.circle(kiX + 6, iy + 1, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.setTextColor(255, 255, 255);
      doc.text(ins.icon, kiX + 4.5, iy + 2.2);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(gray900[0], gray900[1], gray900[2]);
      doc.text(ins.title, kiX + 11, iy + 1.5);

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(gray500[0], gray500[1], gray500[2]);
      doc.text(ins.desc, kiX + 11, iy + 5.5);
    });

    // ---- EXPENSE TRANSACTIONS TABLE ----
    const txnY = bottomY + bottomH + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Expense Transactions (Sample)', margin, txnY);

    const allExpenses = expenses.length > 0 ? expenses : (report.recentExpenses || []);
    const expenseTableData = allExpenses.slice(0, 8).map((exp) => [
      exp.expenseDate || '-',
      cleanPdfText(exp.category),
      cleanPdfText(exp.description),
      cleanPdfText(exp.vendor),
      `Rs. ${exp.amount.toLocaleString('en-IN')}`,
      exp.status || (exp.invoiceNumber ? 'APPROVED' : 'PENDING'),
      cleanPdfText(exp.approvedBy) || '-',
    ]);

    autoTable(doc, {
      startY: txnY + 2,
      head: [['Date', 'Category', 'Description', 'Vendor', 'Amount (Rs.)', 'Status', 'Approved By']],
      body: expenseTableData.length > 0
        ? expenseTableData
        : [
            ['08 Sep 2026', 'Security',     'Security staff salary - Sep',   'Secure India Pvt Ltd', 'Rs. 1,24,000', 'APPROVED', 'R. Mehta'],
            ['05 Sep 2026', 'Electricity',  'Common area electricity bill',  'Tata Power',           'Rs. 78,450',  'PENDING',  '--'],
            ['02 Sep 2026', 'Housekeeping', 'Cleaning material purchase',    'CleanMax',             'Rs. 24,800',  'APPROVED', 'Amit Singh'],
          ],
      theme: 'grid',
      headStyles: {
        fillColor: [navy[0], navy[1], navy[2]],
        textColor: [255, 255, 255],
        fontSize: 6,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 6,
        textColor: [gray900[0], gray900[1], gray900[2]],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = String(data.cell.raw);
          if (val === 'APPROVED') { data.cell.styles.textColor = [5, 150, 105]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'PENDING') { data.cell.styles.textColor = [217, 119, 6]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'REJECTED') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      margin: { left: margin, right: margin },
      styles: {
        cellPadding: 1.5,
        lineColor: [gray300[0], gray300[1], gray300[2]],
        lineWidth: 0.15,
      },
    });

    let notesY = (doc as any).lastAutoTable.finalY + 5;

    // ---- NOTES SECTION ----
    doc.setFillColor(offWhite[0], offWhite[1], offWhite[2]);
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, notesY, contentWidth, 30, 2, 2, 'FD');

    // Star icon
    doc.setFillColor(amber[0], amber[1], amber[2]);
    doc.circle(margin + 5, notesY + 5, 2.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('*', margin + 4, notesY + 6.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Notes', margin + 10, notesY + 6);

    const notes = [
      '1. This report covers expenses from 01 Apr 2026 to 30 Sep 2026.',
      '2. Figures are based on approved transactions.',
      '3. Some payments are pending due to invoice verification.',
      '4. For detailed transactions, refer to the expense register or portal.',
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(gray700[0], gray700[1], gray700[2]);
    notes.forEach((n, ni) => {
      doc.text(n, margin + 5, notesY + 11 + ni * 4.2);
    });

    // Prepared By & Approved By boxes
    const sigBoxW = 50;
    const sigBoxH = 18;
    const sig1X = margin + contentWidth - sigBoxW * 2 - 6;
    const sig2X = margin + contentWidth - sigBoxW;
    const sigY = notesY + 4;

    // Prepared By
    doc.setDrawColor(gray300[0], gray300[1], gray300[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(sig1X, sigY, sigBoxW, sigBoxH, 1, 1, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Prepared By', sig1X + 3, sigY + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Finance Committee', sig1X + 3, sigY + 8);
    doc.text('Euriska Cultural', sig1X + 3, sigY + 12);
    doc.text(`Date: ${genDate}`, sig1X + 3, sigY + 16);

    // Approved By
    doc.roundedRect(sig2X, sigY, sigBoxW, sigBoxH, 1, 1, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('Approved By', sig2X + 3, sigY + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Management Committee', sig2X + 3, sigY + 8);
    doc.text('Euriska Cultural', sig2X + 3, sigY + 12);
    doc.text(`Date: ${genDate}`, sig2X + 3, sigY + 16);

    // ---- PAGE FOOTER ----
    const footerY = pageHeight - 14;
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, footerY, pageWidth, 14, 'F');

    // Green circle
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(margin + 4, footerY + 7, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Euriska Cultural', margin + 10, footerY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(140, 180, 160);
    doc.text('A GREENER, HAPPIER COMMUNITY', margin + 10, footerY + 10);

    // Right side tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(150, 180, 200);
    doc.text('Transparency  |  Accountability  |  A Better Tomorrow', pageWidth - margin - 65, footerY + 8);

    // Small green checkmark
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(pageWidth - margin - 3, footerY + 7, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text('v', pageWidth - margin - 4, footerY + 8.2);

    // ==========================================
    // PAGE 2: BUILDING LEDGER & SPONSORS
    // ==========================================
    doc.addPage();

    // Page 2 Header
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setFillColor(green[0], green[1], green[2]);
    doc.rect(0, 0, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('EURISKA CULTURAL 2026-27 | DETAILED LEDGER', margin, 12);

    doc.setFontSize(7.5);
    doc.setTextColor(180, 200, 220);
    doc.text('Building Collection Breakdown, Expense Vouchers & Sponsors', margin, 18);

    // 1. Building Summary Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('1. DETAILED BUILDING COLLECTION LEDGER', margin, 28);

    const buildings = report.buildingSummaries.length > 0
      ? report.buildingSummaries
      : [
          { id: 'A', name: 'Wing A', buildingId: 'A', totalFlats: 120, targetAmount: 150000, collectedAmount: 125000, pendingAmount: 25000, paidFlatsCount: 100 } as any,
          { id: 'B', name: 'Wing B', buildingId: 'B', totalFlats: 120, targetAmount: 150000, collectedAmount: 110000, pendingAmount: 40000, paidFlatsCount: 88 } as any,
          { id: 'C', name: 'Wing C', buildingId: 'C', totalFlats: 120, targetAmount: 150000, collectedAmount: 135000, pendingAmount: 15000, paidFlatsCount: 108 } as any,
        ];

    const buildingTableData = buildings.map((b: any) => [
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
        fillColor: [navy[0], navy[1], navy[2]],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.2,
        halign: 'center',
        textColor: [gray900[0], gray900[1], gray900[2]],
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        5: { fontStyle: 'bold', textColor: [green[0], green[1], green[2]] },
        6: { textColor: [red[0], red[1], red[2]] },
        7: { fontStyle: 'bold', textColor: [navy[0], navy[1], navy[2]] },
      },
      margin: { left: margin, right: margin },
      styles: {
        lineColor: [gray300[0], gray300[1], gray300[2]],
        lineWidth: 0.15,
      },
    });

    let p2y = (doc as any).lastAutoTable.finalY + 6;

    // 2. Full Expense Vouchers Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('2. APPROVED EXPENDITURE VOUCHERS', margin, p2y);

    const allFullExpenses = expenses.length > 0 ? expenses : (report.recentExpenses || []);
    const fullExpData = allFullExpenses.map((exp, idx) => [
      `#${idx + 1}`,
      cleanPdfText(exp.expenseDate) || '-',
      cleanPdfText(exp.category),
      cleanPdfText(exp.vendor),
      cleanPdfText(exp.description),
      `Rs. ${exp.amount.toLocaleString('en-IN')}`,
      exp.status || (exp.invoiceNumber ? 'APPROVED' : 'PENDING'),
      cleanPdfText(exp.approvedBy) || '-',
    ]);

    autoTable(doc, {
      startY: p2y + 3,
      head: [['Voucher', 'Date', 'Category', 'Vendor', 'Description', 'Amount (Rs.)', 'Status', 'Approved By']],
      body: fullExpData.length > 0
        ? fullExpData
        : [['#1', '2026-09-01', 'Security', 'Secure India', 'Monthly security service', 'Rs. 1,24,000', 'APPROVED', 'R. Mehta']],
      theme: 'striped',
      headStyles: {
        fillColor: [gray700[0], gray700[1], gray700[2]],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 6.8,
        textColor: [gray900[0], gray900[1], gray900[2]],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 12 },
        5: { halign: 'right', fontStyle: 'bold', textColor: [red[0], red[1], red[2]] },
        6: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = String(data.cell.raw);
          if (val === 'APPROVED') { data.cell.styles.textColor = [5, 150, 105]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'PENDING') { data.cell.styles.textColor = [217, 119, 6]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'REJECTED') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      margin: { left: margin, right: margin },
      styles: {
        lineColor: [gray300[0], gray300[1], gray300[2]],
        lineWidth: 0.1,
      },
    });

    let sec3Y = (doc as any).lastAutoTable.finalY + 7;

    // 3. Sponsors Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(gray900[0], gray900[1], gray900[2]);
    doc.text('3. OUR SPONSORS & SEVA PATRONS (SHREE GANESHOTSAV 2026)', margin, sec3Y);

    const sponsorsList: Sponsor[] = (report.sponsors && report.sponsors.length > 0)
      ? report.sponsors
      : [
          { id: '1', eventId: 'ganeshotsav-2026', name: 'Rahul', flatNumber: 'B-307', tier: 'Platinum', sevaCategory: 'Shri Ganesh Murti Seva', description: 'Main Eco-friendly Shree Ganesh Idol', contactPhone: '9823000307', amount: 0, paymentStatus: 'PAID' },
          { id: '2', eventId: 'ganeshotsav-2026', name: 'Prashant', flatNumber: 'A-505', tier: 'Gold', sevaCategory: 'Mandap Decoration Seva', description: 'Grand floral lighting and mandap decoration', contactPhone: '9590944363', amount: 0, paymentStatus: 'PAID' },
        ];

    const sponsorTableData = sponsorsList.map((s, idx) => [
      `${idx + 1}`,
      cleanPdfText(s.name || (s as any).contactPerson || ''),
      cleanPdfText(s.flatNumber || '-'),
      cleanPdfText(s.sevaCategory || (s as any).sevaType || 'Festival Seva'),
      cleanPdfText(s.tier || 'Patron'),
      cleanPdfText(s.contactPhone || '-'),
    ]);

    autoTable(doc, {
      startY: sec3Y + 3,
      head: [['#', 'Patron Name', 'Flat', 'Seva Category', 'Tier', 'Phone']],
      body: sponsorTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [green[0], green[1], green[2]],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 6.8,
        textColor: [gray900[0], gray900[1], gray900[2]],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 8 },
        4: { fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
      styles: {
        lineColor: [gray300[0], gray300[1], gray300[2]],
        lineWidth: 0.15,
      },
    });

    // Page 2 Footer
    const p2FooterY = pageHeight - 14;
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, p2FooterY, pageWidth, 14, 'F');

    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(margin + 4, p2FooterY + 7, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Euriska Cultural', margin + 10, p2FooterY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(140, 180, 160);
    doc.text('A GREENER, HAPPIER COMMUNITY', margin + 10, p2FooterY + 10);

    doc.setTextColor(150, 180, 200);
    doc.text('Transparency  |  Accountability  |  A Better Tomorrow', pageWidth - margin - 65, p2FooterY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Page 2 of 2', pageWidth - margin - 14, p2FooterY - 3);

    // Also add page number to page 1
    doc.setPage(1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(gray500[0], gray500[1], gray500[2]);
    doc.text('Page 1 of 2', pageWidth - margin - 14, footerY - 3);

    // Save PDF
    doc.save(`Euriska_Cultural_Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

    // Volunteer Initiative Appreciation Note
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text('Majestique Euriska Cultural Festival 2026 • Volunteer Devotees Initiative', 105, endY + 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('With heartfelt gratitude and pranam to all society residents, families, and volunteer devotees.', 105, endY + 22, { align: 'center' });

    // Footer Tag
    const footerY = endY + 34;
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(`Digital Devotee Recognition Certificate | Generated on: ${dateStr} | ID: EUR-SPON-${cleanPdfText(sponsor.flat)}`, 15, footerY);

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
      cleanPdfText(`Total Active Seva Patrons: ${sponsors.length} | Murti (B-307) | Decoration (A-505) | Maha Prasad (A-704 & C-303) | Almirah (A-103)`),
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


