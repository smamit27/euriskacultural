import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrasadSlot, PrasadBooking, Contribution, KalakritiEntry, Expense, FinancialReportData } from '../types';

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
    doc.text('Daily Evening Aarti: 8:00 PM  |  Venue: Club House Podium', 14, 30);

    // Summary Chip Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(14, 42, 182, 12, 3, 3, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(
      `Festival: 14–25 Sep 2026 (12 Days) | ${totalFamiliesCount} Families Registered | ${openDaysCount} Open Days`,
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

      if (bookings.length === 0) {
        return [
          `Day ${idx + 1}`,
          `${s.dateDisplay}\n(${s.dayLabel.split('-')[0].trim()})`,
          '[OPEN SLOT]',
          'Open for Devotee Families',
          'Modak & Fruits',
        ];
      }

      const flatsStr = bookings.map((b) => b.flatNumber).join('\n');
      const devoteesStr = bookings
        .map((b) => `${b.residentName}${b.phone ? ` (${b.phone})` : ''}`)
        .join('\n');
      const prasadStr = bookings.map((b) => b.prasadItem || 'Modak & Fruits').join('\n');

      return [
        `Day ${idx + 1}`,
        `${s.dateDisplay}\n(${s.dayLabel.split('-')[0].trim()})`,
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
        `Generated from Euriska Cultural Portal (${dateStr})  |  Ganpati Bappa Morya!`,
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

    // Load Logos
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

    // Center Header Text
    doc.setTextColor(254, 215, 170); // Warm gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('|| SHRI GANESHAYA NAMAHA ||', 105, 22, { align: 'center' });

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

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
      `Day ${slot.dayNumber}  |  ${slot.dateDisplay}  |  ${slot.dayLabel}`,
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
      ['Flat Number:', activeBooking.flatNumber || 'N/A'],
      ['Devotee / Host Family:', activeBooking.residentName || 'Devotee Family'],
      ['Contact Phone:', activeBooking.phone || 'Registered Society Resident'],
      ['Prasad Seva Offering:', activeBooking.prasadItem || 'Traditional Modak, Sweets & Fresh Fruits'],
      ['Reporting Time:', '7:45 PM (15 Minutes prior to Aarti for Mandap Sthapana)'],
      ['Maha Aarti Timing:', '8:00 PM Sharp (Evening Aarti, Stuti & Modak Prasad)'],
      ['Venue Location:', 'Club House Podium'],
    ];

    if (activeBooking.notes) {
      details.push(['Special Notes / Requests:', activeBooking.notes]);
    }

    autoTable(doc, {
      startY: 84,
      body: details,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
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

    // Devotee Instructions & Protocol Box (Dynamic positioning)
    const boxY = endY + 6;
    const boxHeight = 44;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, boxY, 182, boxHeight, 3, 3, 'FD');

    // Box Header
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(16, boxY + 2, 75, 7, 2, 2, 'F');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Seva Instructions for Host Family:', 18, boxY + 7);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('1. Please bring the prepared Prasad to the Club House Podium by 7:45 PM.', 18, boxY + 15);
    doc.text('2. Offerings must be purely vegetarian (Modak, Peda, Kheer, Panchamrit, dry fruits, fresh fruits).', 18, boxY + 22);
    doc.text('3. Host family will lead the 8:00 PM Evening Aarti, Thal, and Prasad distribution with the pandit.', 18, boxY + 29);
    doc.text('4. In case of any schedule change or emergency, please inform the Cultural Committee in advance.', 18, boxY + 36);

    // Festive Blessing Banner
    const blessingY = boxY + boxHeight + 8;
    doc.setFillColor(255, 247, 237);
    doc.setDrawColor(251, 146, 60);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, blessingY, 182, 14, 2, 2, 'FD');

    doc.setTextColor(194, 65, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('|| GANPATI BAPPA MORYA ||', 105, blessingY + 9.5, { align: 'center' });

    // Official Pass Footer & Verification Badge
    const footerY = blessingY + 20;

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
    doc.roundedRect(132, footerY - 5, 64, 12, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const passRef = `EUR-PRASAD-${activeBooking.flatNumber || 'SLOT'}-D${slot.dayNumber}`;
    doc.text(`PASS ID: ${passRef}`, 164, footerY + 2.5, { align: 'center' });

    doc.save(`Euriska_Prasad_Pass_${activeBooking.flatNumber || 'Slot'}_Day${slot.dayNumber}.pdf`);
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

    // Header
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 297, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURISKA — KALAKRITI TALENT MATRIX (2026)', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Total Registered Performers: ${entries.length}  |  Cultural & Talent Registrations`, 14, 20);

    const headers = [
      'S.N',
      'Name',
      'Flat',
      'Drawing',
      'Skit 1',
      'Skit 2',
      'Dance',
      'Fashion',
      'Mimicry',
      'Singing',
      'Fancy Dress',
    ];

    const body = entries.map((p, idx) => [
      p.sn || idx + 1,
      p.name,
      p.flatNumber || '-',
      p.drawing ? '✓' : '-',
      p.skit1 ? '✓' : '-',
      p.skit2 ? '✓' : '-',
      p.dance ? '✓' : '-',
      p.fashionShow ? '✓' : '-',
      p.mimicry ? '✓' : '-',
      p.singing ? '✓' : '-',
      p.fancyDress ? '✓' : '-',
    ]);

    autoTable(doc, {
      startY: 34,
      head: [headers],
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [234, 88, 12],
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
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
        2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Euriska_Kalakriti_Participants_2026.pdf`);
  },

  /**
   * Export Contributions & Financial Collection Sheet as PDF
   */
  exportContributionsPDF(contributions: Contribution[]) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const paidList = contributions.filter((c) => c.status === 'PAID');
    const totalCollected = paidList.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const pendingList = contributions.filter((c) => c.status === 'PENDING');

    // Header
    doc.setFillColor(3, 105, 161); // Sky blue #0369a1
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURISKA — SOCIETY CONTRIBUTIONS REPORT', 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(
      `Total Collected: Rs. ${totalCollected.toLocaleString('en-IN')} (${paidList.length} Paid)  |  Pending: ${pendingList.length} Flats`,
      14,
      24
    );

    const body = contributions.map((c) => [
      c.flatNumber,
      c.residentName,
      c.status === 'PAID' ? `Rs. ${(c.paidAmount || 0).toLocaleString('en-IN')}` : `Rs. ${(c.expectedAmount || 2000).toLocaleString('en-IN')}`,
      c.status,
      c.status === 'PAID' ? (c.paymentMode || 'ONLINE') : '-',
      c.status === 'PAID' ? (c.receiptNumber || '-') : '-',
      c.status === 'PAID' ? (c.paymentDate || '-') : '-',
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['Flat', 'Resident Name', 'Amount', 'Status', 'Mode', 'Receipt No.', 'Payment Date']],
      body: body,
      theme: 'grid',
      headStyles: {
        fillColor: [3, 105, 161],
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
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 46, halign: 'left', fontStyle: 'bold' },
        2: { cellWidth: 24 },
        3: { cellWidth: 20, fontStyle: 'bold' },
        4: { cellWidth: 20 },
        5: { cellWidth: 32 },
        6: { cellWidth: 22 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'PAID') {
            data.cell.styles.textColor = [5, 150, 105];
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Euriska_Contributions_Report_2026.pdf`);
  },

  /**
   * Export Full Financial Transparency Infographic Report as PDF
   */
  exportFinancialTransparencyReportPDF(report: FinancialReportData) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;

    // Premium Cultural Navy & Saffron Header
    doc.setFillColor(15, 23, 42); // Deep navy #0f172a
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Saffron Gold Accent bar
    doc.setFillColor(249, 115, 22); // Saffron #f97316
    doc.rect(0, 40, pageWidth, 2.5, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EURISKA CULTURAL 2026–27', 14, 15);

    doc.setFontSize(13);
    doc.setTextColor(254, 215, 170); // Warm gold #fed7aa
    doc.text('FINANCIAL TRANSPARENCY & AUDIT REPORT', 14, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // Slate light
    doc.text('Together We Celebrate, Together We Build  •  Society Cultural Committee', 14, 32);

    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    doc.text(`Published: ${nowStr}`, pageWidth - 14, 32, { align: 'right' });

    // 4 Summary Metric Boxes
    const boxY = 48;
    const boxWidth = 43;
    const boxHeight = 22;
    const gap = 3.3;

    const cards = [
      {
        title: 'TOTAL CONTRIBUTION',
        val: `Rs. ${report.totalCollected.toLocaleString('en-IN')}`,
        sub: `${report.paidFlatsCount} Families Paid`,
        color: [5, 150, 105], // Green
        bg: [236, 253, 245],
      },
      {
        title: 'TOTAL EXPENSES',
        val: `Rs. ${report.totalExpenses.toLocaleString('en-IN')}`,
        sub: `${report.approvedExpensesCount} Transactions`,
        color: [220, 38, 38], // Red
        bg: [254, 242, 242],
      },
      {
        title: 'CURRENT BALANCE',
        val: `Rs. ${report.currentBalance.toLocaleString('en-IN')}`,
        sub: 'Net Available Fund',
        color: [37, 99, 235], // Blue
        bg: [239, 246, 255],
      },
      {
        title: 'COLLECTION STATUS',
        val: `${report.collectionPercentage}%`,
        sub: 'of Target Achieved',
        color: [217, 119, 6], // Amber
        bg: [254, 243, 199],
      },
    ];

    cards.forEach((c, idx) => {
      const x = 14 + idx * (boxWidth + gap);
      doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
      doc.setDrawColor(c.color[0], c.color[1], c.color[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, boxY, boxWidth, boxHeight, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.title, x + boxWidth / 2, boxY + 5.5, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(c.val, x + boxWidth / 2, boxY + 13, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.sub, x + boxWidth / 2, boxY + 18.5, { align: 'center' });
    });

    // Money Flow Bar Box
    const flowY = 74;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, flowY, 182, 14, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `MONEY FLOW:  Contributions (Rs. ${report.totalCollected.toLocaleString('en-IN')})  +  Other Income (Rs. ${report.otherIncome.toLocaleString('en-IN')})  =  Total Income (Rs. ${report.totalIncome.toLocaleString('en-IN')})  -  Expenses (Rs. ${report.totalExpenses.toLocaleString('en-IN')})  =  Current Balance (Rs. ${report.currentBalance.toLocaleString('en-IN')})`,
      pageWidth / 2,
      flowY + 8.5,
      { align: 'center' }
    );

    // Section 1: Building Breakdown Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Contribution by Building', 14, 94);

    const bldgBody = (report.buildingSummaries || []).map((b) => {
      const target = b.targetAmount || (b.totalFlats * (b.expectedPerFlat || 1500));
      const pct = target > 0 ? Math.round(((b.collectedAmount || 0) / target) * 100) : 0;
      return [
        b.name,
        `${b.totalFlats} Flats`,
        `${b.paidFlatsCount || 0} Flats`,
        `${b.pendingFlatsCount || 0} Flats`,
        `Rs. ${(b.collectedAmount || 0).toLocaleString('en-IN')}`,
        `Rs. ${(b.pendingAmount || 0).toLocaleString('en-IN')}`,
        `${pct}%`,
      ];
    });

    // Total row
    const totPct = report.collectionPercentage;
    bldgBody.push([
      'TOTAL SOCIETY',
      `${report.totalFlats} Flats`,
      `${report.paidFlatsCount} Flats`,
      `${report.pendingFlatsCount} Flats`,
      `Rs. ${report.totalCollected.toLocaleString('en-IN')}`,
      `Rs. ${report.totalPending.toLocaleString('en-IN')}`,
      `${totPct}%`,
    ]);

    autoTable(doc, {
      startY: 97,
      head: [['Building Wing', 'Total Flats', 'Paid Flats', 'Pending Flats', 'Collected (Rs.)', 'Pending (Rs.)', 'Collection %']],
      body: bldgBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 32 },
        4: { fontStyle: 'bold', textColor: [5, 150, 105] },
        5: { textColor: [217, 119, 6] },
        6: { fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === bldgBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Section 2: Category Expenses & Budget vs Actual Table
    const lastTableEnd = (doc as any).lastAutoTable.finalY || 140;
    const sec2Y = lastTableEnd + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Expenses Breakdown & Budget vs Actual', 14, sec2Y);

    const expBody = (report.categoryExpenses || []).map((cat) => {
      const statusText = cat.isOverBudget ? 'OVER BUDGET' : 'UNDER BUDGET';
      const diffSign = cat.difference >= 0 ? `+Rs. ${cat.difference.toLocaleString('en-IN')}` : `-Rs. ${Math.abs(cat.difference).toLocaleString('en-IN')}`;
      return [
        cat.category,
        `Rs. ${cat.budget.toLocaleString('en-IN')}`,
        `Rs. ${cat.amount.toLocaleString('en-IN')}`,
        `${cat.percentage}%`,
        diffSign,
        statusText,
      ];
    });

    // Total expense row
    const totalBudget = (report.categoryExpenses || []).reduce((sum, c) => sum + c.budget, 0);
    const totalExpDiff = totalBudget - report.totalExpenses;
    expBody.push([
      'TOTAL EXPENSES',
      `Rs. ${totalBudget.toLocaleString('en-IN')}`,
      `Rs. ${report.totalExpenses.toLocaleString('en-IN')}`,
      '100%',
      totalExpDiff >= 0 ? `+Rs. ${totalExpDiff.toLocaleString('en-IN')}` : `-Rs. ${Math.abs(totalExpDiff).toLocaleString('en-IN')}`,
      totalExpDiff >= 0 ? 'WITHIN BUDGET' : 'OVER BUDGET',
    ]);

    autoTable(doc, {
      startY: sec2Y + 3,
      head: [['Category', 'Budget (Rs.)', 'Actual Spent (Rs.)', 'Share %', 'Variance (Diff)', 'Status']],
      body: expBody,
      theme: 'grid',
      headStyles: {
        fillColor: [194, 65, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 44 },
        1: { halign: 'right' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.row.index === expBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [254, 243, 199];
          }
          if (data.column.index === 5) {
            const val = String(data.cell.raw || '');
            if (val.includes('OVER')) {
              data.cell.styles.textColor = [220, 38, 38];
            } else {
              data.cell.styles.textColor = [5, 150, 105];
            }
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Footer on all pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      doc.text(
        `Euriska Cultural & Festive Portal 2026–27  •  Generated on ${dateStr}  •  https://euriskacultural.web.app/report`,
        14,
        290
      );
      doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
    }

    doc.save(`Euriska_Financial_Transparency_Report_2026.pdf`);
  },

  /**
   * Export Contributions ledger to CSV
   */
  exportContributionsCSV(contributions: Contribution[]) {
    const headers = ['Flat', 'Building', 'Resident Name', 'Paid Amount', 'Expected Amount', 'Status', 'Payment Mode', 'Transaction ID', 'Receipt Number', 'Payment Date', 'Remarks'];
    const rows = contributions.map((c) => [
      `"${c.flatNumber}"`,
      `"${c.buildingId}"`,
      `"${c.residentName.replace(/"/g, '""')}"`,
      c.status === 'PAID' ? c.paidAmount || 0 : 0,
      c.expectedAmount || 1500,
      `"${c.status}"`,
      `"${c.paymentMode || ''}"`,
      `"${c.transactionId || ''}"`,
      `"${c.receiptNumber || ''}"`,
      `"${c.paymentDate || ''}"`,
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    downloadFile(csvContent, 'Euriska_Contributions_Ledger_2026.csv', 'text/csv;charset=utf-8;');
  },

  /**
   * Export Expenses ledger to CSV
   */
  exportExpensesCSV(expenses: Expense[]) {
    const headers = ['Date', 'Category', 'Vendor', 'Description', 'Amount', 'Mode', 'Invoice Number', 'Status', 'Approved By', 'Remarks'];
    const rows = expenses.map((e) => [
      `"${e.expenseDate}"`,
      `"${e.category}"`,
      `"${e.vendor.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount || 0,
      `"${e.paymentMode || ''}"`,
      `"${e.invoiceNumber || ''}"`,
      `"${e.status}"`,
      `"${e.approvedBy || ''}"`,
      `"${(e.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    downloadFile(csvContent, 'Euriska_Expenses_Ledger_2026.csv', 'text/csv;charset=utf-8;');
  },

  /**
   * Comprehensive Excel-compatible Multi-section CSV Export
   */
  exportComprehensiveExcelCSV(report: FinancialReportData, contributions: Contribution[], expenses: Expense[]) {
    const lines: string[] = [
      '\uFEFF"EURISKA CULTURAL 2026–27 — COMPLETE FINANCIAL STATEMENT"',
      `"Generated On","${new Date().toLocaleString('en-IN')}"`,
      '',
      '"--- 1. EXECUTIVE FINANCIAL SUMMARY ---"',
      `"Total Contributions Collected","Rs. ${report.totalCollected}"`,
      `"Other Incomes / Sponsorships","Rs. ${report.otherIncome}"`,
      `"Total Income","Rs. ${report.totalIncome}"`,
      `"Total Approved Expenses","Rs. ${report.totalExpenses}"`,
      `"Current Available Balance","Rs. ${report.currentBalance}"`,
      `"Collection Target Status","${report.collectionPercentage}% (${report.paidFlatsCount}/${report.totalFlats} Flats Paid)"`,
      '',
      '"--- 2. BUILDING-WISE SUMMARY ---"',
      '"Building Wing","Total Flats","Paid Flats","Pending Flats","Collected Amount","Pending Amount","Collection %"',
    ];

    (report.buildingSummaries || []).forEach((b) => {
      const target = b.targetAmount || b.totalFlats * 1500;
      const pct = target > 0 ? Math.round(((b.collectedAmount || 0) / target) * 100) : 0;
      lines.push(`"${b.name}",${b.totalFlats},${b.paidFlatsCount || 0},${b.pendingFlatsCount || 0},${b.collectedAmount || 0},${b.pendingAmount || 0},${pct}%`);
    });

    lines.push('');
    lines.push('"--- 3. CATEGORY BUDGET VS ACTUAL ---"');
    lines.push('"Category","Budget (Rs.)","Actual Spent (Rs.)","Share %","Variance Difference","Status"');
    (report.categoryExpenses || []).forEach((c) => {
      lines.push(`"${c.category}",${c.budget},${c.amount},${c.percentage}%,${c.difference},"${c.isOverBudget ? 'OVER BUDGET' : 'UNDER BUDGET'}"`);
    });

    lines.push('');
    lines.push('"--- 4. DETAILED APPROVED EXPENSES ---"');
    lines.push('"Date","Category","Vendor","Description","Amount","Mode","Invoice Number"');
    expenses
      .filter((e) => e.status === 'APPROVED')
      .forEach((e) => {
        lines.push(`"${e.expenseDate}","${e.category}","${e.vendor.replace(/"/g, '""')}","${e.description.replace(/"/g, '""')}",${e.amount},"${e.paymentMode}","${e.invoiceNumber || ''}"`);
      });

    lines.push('');
    lines.push('"--- 5. CONTRIBUTIONS LEDGER ---"');
    lines.push('"Flat","Building","Resident Name","Paid Amount","Status","Mode","Payment Date"');
    contributions.forEach((c) => {
      lines.push(`"${c.flatNumber}","${c.buildingId}","${c.residentName.replace(/"/g, '""')}",${c.paidAmount || 0},"${c.status}","${c.paymentMode || ''}","${c.paymentDate || ''}"`);
    });

    const csvContent = lines.join('\r\n');
    downloadFile(csvContent, 'Euriska_Complete_Financial_Statement_2026.csv', 'text/csv;charset=utf-8;');
  },

  /**
   * Export Dedicated Festival Budget vs Actual Spending PDF
   */
  exportBudgetVsActualPDF(
    categoryExpenses: {
      category: string;
      amount: number;
      percentage: number;
      budget: number;
      difference: number;
      isOverBudget: boolean;
    }[],
    totalBudget: number,
    totalExpenses: number
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalVariance = totalBudget - totalExpenses;
    const isOverallUnder = totalVariance >= 0;

    // Header Background
    doc.setFillColor(15, 23, 42); // Slate #0f172a
    doc.rect(0, 0, 210, 36, 'F');

    // Accent line
    doc.setFillColor(249, 115, 22); // Orange #f97316
    doc.rect(0, 36, 210, 2, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EURISKA', 14, 13);

    doc.setFontSize(12);
    doc.text('FESTIVAL BUDGET VS ACTUAL SPENDING REPORT (2026–27)', 14, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Official Financial Transparency Statement  |  Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 14, 28);

    // KPI Cards Row
    const cardY = 44;
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
    doc.setTextColor(15, 23, 42);
    const utilPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
    doc.text(`${utilPct}% (${isOverallUnder ? 'Within Budget' : 'Over Budget'})`, 155, cardY + 13);

    // Table Data
    const tableBody = categoryExpenses.map((item, idx) => {
      const diff = item.difference;
      const diffStr = diff >= 0 ? `+Rs. ${diff.toLocaleString('en-IN')}` : `-Rs. ${Math.abs(diff).toLocaleString('en-IN')}`;
      const statusStr = item.budget === 0 && item.amount === 0 ? 'Not Spent (Rs. 0)' : item.isOverBudget ? 'OVER BUDGET' : 'WITHIN BUDGET';

      return [
        String(idx + 1),
        item.category,
        `Rs. ${(item.budget || 0).toLocaleString('en-IN')}`,
        `Rs. ${(item.amount || 0).toLocaleString('en-IN')}`,
        diffStr,
        item.budget > 0 ? `${Math.round(((item.amount || 0) / item.budget) * 100)}%` : '0%',
        statusStr,
      ];
    });

    // Total row
    tableBody.push([
      '—',
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

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Euriska Cultural Festival Budget Report 2026–27  •  Generated on ${new Date().toLocaleString('en-IN')}`, 14, 290);
    doc.text('EURISKA CULTURAL • 100% TRANSPARENCY', 196, 290, { align: 'right' });

    doc.save(`Euriska_Budget_Vs_Actual_Spending_2026.pdf`);
  },
};

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
