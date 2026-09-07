import { jsPDF } from 'jspdf';
import { MonthlyPayrollRecord } from '../types/payroll';
import { CompanyMaster, DEFAULT_COMPANY_MASTER } from '../types/companyMaster';

export function generateEmployeePayslipPDF(record: MonthlyPayrollRecord, companyMaster?: CompanyMaster): void {
  const company = companyMaster || DEFAULT_COMPANY_MASTER;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Banner Background (Deep Charcoal with Orange accent border)
  doc.setFillColor(11, 13, 17); // Dark black/charcoal
  doc.rect(10, y, pageWidth - 20, 26, 'F');

  // RIVOT Orange top accent bar
  doc.setFillColor(255, 94, 14); // #FF5E0E Rivot Orange
  doc.rect(10, y, pageWidth - 20, 2, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(company.companyName || 'RIVOT MOTORS PRIVATE LIMITED', 16, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 185, 195);
  doc.text(`CIN: ${company.cin || 'U34100KA2023PTC176541'} | PAN: ${company.pan || 'AABCR7890K'} | TAN: ${company.tan || 'BLRR12345D'}`, 16, y + 15.5);
  doc.text(`Address: ${company.registeredAddress || 'Tech Park Hubballi & Electronic City, Bengaluru, Karnataka'}`, 16, y + 20.5);

  // Month Badge
  doc.setFillColor(255, 94, 14);
  doc.roundedRect(pageWidth - 62, y + 7.5, 48, 12.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYSLIP', pageWidth - 47, y + 12.5, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`${record.month}`, pageWidth - 47, y + 17, { align: 'center' });

  y += 32;

  // Employee Information Box
  doc.setDrawColor(220, 224, 230);
  doc.setFillColor(248, 249, 251);
  doc.rect(10, y, pageWidth - 20, 36, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 94, 14);
  doc.text('EMPLOYEE PARTICULARS & COMPLIANCE DETAILS', 14, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(60, 64, 72);

  // Left Column
  const col1X = 14;
  const col2X = 55;
  const col3X = 105;
  const col4X = 145;

  let rowY = y + 12;
  doc.setFont('helvetica', 'bold'); doc.text('Employee Code:', col1X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.empCode, col2X, rowY);
  doc.setFont('helvetica', 'bold'); doc.text('Bank Name:', col3X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.bankName, col4X, rowY);

  rowY += 5.5;
  doc.setFont('helvetica', 'bold'); doc.text('Employee Name:', col1X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.empName, col2X, rowY);
  doc.setFont('helvetica', 'bold'); doc.text('Bank Account No:', col3X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.accountNo, col4X, rowY);

  rowY += 5.5;
  doc.setFont('helvetica', 'bold'); doc.text('Designation:', col1X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.designation, col2X, rowY);
  doc.setFont('helvetica', 'bold'); doc.text('Bank IFSC:', col3X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.ifsc, col4X, rowY);

  rowY += 5.5;
  doc.setFont('helvetica', 'bold'); doc.text('Department:', col1X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.department, col2X, rowY);
  doc.setFont('helvetica', 'bold'); doc.text('PAN Number:', col3X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.pan, col4X, rowY);

  rowY += 5.5;
  doc.setFont('helvetica', 'bold'); doc.text('EPFO UAN:', col1X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.uan, col2X, rowY);
  doc.setFont('helvetica', 'bold'); doc.text('ESIC IP No:', col3X, rowY);
  doc.setFont('helvetica', 'normal'); doc.text(record.esicIp, col4X, rowY);

  y += 40;

  // Attendance Metrics Strip
  doc.setFillColor(235, 238, 243);
  doc.rect(10, y, pageWidth - 20, 14, 'F');
  doc.setDrawColor(200, 205, 215);
  doc.rect(10, y, pageWidth - 20, 14, 'S');

  const statCols = [
    { label: 'Calendar Days', val: record.totalMonthDays },
    { label: 'Present Days', val: record.totalPresentDays },
    { label: 'Half Days', val: record.totalHalfDays },
    { label: 'Weekly Offs', val: record.totalWeeklyOffDays },
    { label: 'Approved Leaves', val: record.totalApprovedLeaveDays },
    { label: 'Loss of Pay (LOP)', val: record.totalLOPDays },
    { label: 'Paid Days', val: record.paidDays }
  ];

  const colWidth = (pageWidth - 20) / statCols.length;
  statCols.forEach((stat, i) => {
    const x = 10 + i * colWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 24, 30);
    doc.text(String(stat.val), x + colWidth / 2, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 105, 115);
    doc.text(stat.label, x + colWidth / 2, y + 10.5, { align: 'center' });
  });

  y += 18;

  // Salary Table (Earnings vs Deductions)
  const tableTop = y;
  const tableWidth = pageWidth - 20;
  const halfWidth = tableWidth / 2;

  // Table Headers
  doc.setFillColor(30, 35, 45);
  doc.rect(10, tableTop, halfWidth, 7, 'F');
  doc.rect(10 + halfWidth, tableTop, halfWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS', 14, tableTop + 5);
  doc.text('AMOUNT (INR)', 10 + halfWidth - 5, tableTop + 5, { align: 'right' });

  doc.text('DEDUCTIONS', 14 + halfWidth, tableTop + 5);
  doc.text('AMOUNT (INR)', 10 + tableWidth - 5, tableTop + 5, { align: 'right' });

  // Items
  const earnings: Array<{ name: string; earned: number; isHeader?: boolean }> = [
    { name: 'Basic Salary', earned: record.earnedBasic },
    { name: 'House Rent Allowance (HRA)', earned: record.earnedHRA },
    { name: 'Conveyance Allowance', earned: record.earnedConveyance },
    { name: 'Medical Allowance', earned: record.earnedMedical || 0 },
    { name: 'Leave Travel Allowance (LTA)', earned: record.earnedLTA || 0 },
    { name: 'Special Allowance', earned: record.earnedSpecial },
    ...(record.reimbursements > 0 ? [{ name: 'Reimbursements / Arrears', earned: record.reimbursements }] : [])
  ].filter(e => e.earned > 0 || e.name === 'Basic Salary');

  const totalEmployerContribution = record.epfEmployerEPF + record.epfEmployerEPS + record.epfAdminEDLI + record.esiEmployer;

  const deductions: Array<{ name: string; amt: number; isHeader?: boolean; isEmployer?: boolean }> = [
    // Employee Deductions (Subtracted from Gross Salary)
    { name: 'Provident Fund (EPF 12%)', amt: record.epfEmployee12 },
    { name: 'Employee State Insurance (ESI 0.75%)', amt: record.esiEmployee },
    { name: 'Professional Tax (PT Karnataka)', amt: record.pt },
    ...(record.tds > 0 ? [{ name: 'Income Tax (TDS)', amt: record.tds }] : []),
    ...(record.otherDeductions > 0 ? [{ name: 'Other Deductions / Advances', amt: record.otherDeductions }] : []),
    // Employer Statutory Contribution (CTC Component - Shown under Deductions)
    { name: 'EMPLOYER STATUTORY (CTC COMPONENT):', amt: 0, isHeader: true },
    { name: 'EPF Employer (3.67%)', amt: record.epfEmployerEPF, isEmployer: true },
    { name: 'EPS Pension (8.33%)', amt: record.epfEmployerEPS, isEmployer: true },
    { name: 'EDLI & Admin', amt: record.epfAdminEDLI, isEmployer: true },
    { name: 'ESIC Employer (3.25%)', amt: record.esiEmployer, isEmployer: true }
  ];

  const maxRows = Math.max(earnings.length, deductions.length);
  let itemY = tableTop + 7;
  const rowHeight = 5.6;

  doc.setFontSize(7.5);
  doc.setTextColor(40, 44, 52);

  for (let i = 0; i < maxRows; i++) {
    // Zebra background
    if (i % 2 === 0) {
      doc.setFillColor(250, 251, 253);
      doc.rect(10, itemY, tableWidth, rowHeight, 'F');
    }

    // Left - Earnings
    if (i < earnings.length) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 44, 52);
      doc.text(earnings[i].name, 14, itemY + 3.8);
      doc.text(`Rs. ${earnings[i].earned.toLocaleString('en-IN')}`, 10 + halfWidth - 5, itemY + 3.8, { align: 'right' });
    }

    // Right - Deductions
    if (i < deductions.length) {
      const item = deductions[i];
      if (item.isHeader) {
        doc.setFillColor(241, 245, 249);
        doc.rect(10 + halfWidth, itemY, halfWidth, rowHeight, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(item.name, 14 + halfWidth, itemY + 3.8);
        doc.setFontSize(7.5);
      } else if (item.isEmployer) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 85, 95);
        doc.text(item.name, 14 + halfWidth, itemY + 3.8);
        doc.text(`Rs. ${item.amt.toLocaleString('en-IN')}`, 10 + tableWidth - 5, itemY + 3.8, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 44, 52);
        doc.text(item.name, 14 + halfWidth, itemY + 3.8);
        doc.text(`Rs. ${item.amt.toLocaleString('en-IN')}`, 10 + tableWidth - 5, itemY + 3.8, { align: 'right' });
      }
    }

    itemY += rowHeight;
  }

  // Subtotals
  doc.setFillColor(240, 242, 247);
  doc.rect(10, itemY, halfWidth, 7, 'F');
  doc.rect(10 + halfWidth, itemY, halfWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 25, 35);
  doc.text('Gross Earnings (A)', 14, itemY + 4.8);
  doc.text(`Rs. ${(record.earnedGross + record.reimbursements).toLocaleString('en-IN')}`, 10 + halfWidth - 5, itemY + 4.8, { align: 'right' });

  doc.text('Total Statutory Deductions (B)', 14 + halfWidth, itemY + 4.8);
  doc.text(`Rs. ${record.totalDeductions.toLocaleString('en-IN')}`, 10 + tableWidth - 5, itemY + 4.8, { align: 'right' });

  // Border outline for table
  doc.setDrawColor(200, 205, 215);
  doc.rect(10, tableTop, halfWidth, (itemY + 7) - tableTop, 'S');
  doc.rect(10 + halfWidth, tableTop, halfWidth, (itemY + 7) - tableTop, 'S');

  y = itemY + 11;

  // NET PAYABLE HIGHLIGHT BLOCK
  doc.setFillColor(15, 23, 42);
  doc.rect(10, y, pageWidth - 20, 18, 'F');

  doc.setFillColor(255, 94, 14);
  doc.rect(10, y, 3.5, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('NET SALARY PAYABLE (A - B):', 18, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 140, 66);
  doc.text(`INR ${record.netPayable.toLocaleString('en-IN')}`, 18, y + 13.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Amount in Words: ${record.netPayableWords}`, pageWidth - 14, y + 10.5, { align: 'right' });

  y += 22;

  // STATUTORY & CTC RECONCILIATION SUMMARY BOX
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(10, y, pageWidth - 20, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`TOTAL MONTHLY CTC: Rs. ${record.fixedGross.toLocaleString('en-IN')} (MATCHES GROSS SALARY) • ALL STATUTORY REMITTANCES INCLUDED`, 14, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const erDetailed = `Employer Statutory: EPF 3.67%: Rs. ${record.epfEmployerEPF} | EPS 8.33%: Rs. ${record.epfEmployerEPS} | EDLI/Admin: Rs. ${record.epfAdminEDLI} | ESIC 3.25%: Rs. ${record.esiEmployer}`;
  doc.text(erDetailed, 14, y + 9.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  const ctcReconciliation = `Reconciliation: Net Pay (Rs. ${record.netPayable.toLocaleString('en-IN')}) + All Statutory Remittances (Rs. ${record.totalDeductions.toLocaleString('en-IN')}) = Complete Gross Salary / CTC (Rs. ${record.earnedGross.toLocaleString('en-IN')})`;
  doc.text(ctcReconciliation, 14, y + 14);

  y += 22;

  // Signatures & Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 115, 125);
  doc.text('Note: This document is a digitally generated payslip authorized by RIVOT MOTORS HR & Accounts System.', 10, y + 4);
  doc.text('For queries regarding salary or tax deductions, contact: payroll@rivotmotors.com', 10, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 55);
  doc.text('Authorized Signatory', pageWidth - 45, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('RIVOT Motors HR Division', pageWidth - 45, y + 8);

  // Download
  doc.save(`Payslip_${record.empCode}_${record.month}.pdf`);
}
