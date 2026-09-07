import * as XLSX from 'xlsx';
import { MonthlyPayrollRecord } from '../types/payroll';

export function exportRivotPayrollExcel(
  records: MonthlyPayrollRecord[],
  monthStr: string = '2026-08'
): void {
  const wb = XLSX.utils.book_new();

  // 1. Primary Sheet matching official "RIVOT Payroll 2025-26.xlsx" format
  const rivotMasterData = records.map((r, index) => {
    const medical = r.earnedMedical !== undefined ? r.earnedMedical : (r.earnedGross > 0 ? Math.round(r.earnedGross * 0.04132) : 0);
    const lta = r.earnedLTA !== undefined ? r.earnedLTA : (r.earnedGross > 0 ? Math.round(r.earnedGross * 0.062) : 0);
    const pfEmployer = (r.epfEmployerEPS + r.epfEmployerEPF) > 0 ? (r.epfEmployerEPS + r.epfEmployerEPF) : '';
    const loanInstallment = r.reimbursements > 0 ? r.reimbursements : '';
    const totalEarnings = r.earnedGross + (r.reimbursements || 0);

    return {
      'S.N.': index + 1,
      'Staff Name': r.empName,
      'Gross Salary': r.fixedGross,
      'This Month Payable': r.earnedGross,
      'Payable Days': r.paidDays,
      'Present Days': r.totalPresentDays,
      'Paid Leaves': r.totalApprovedLeaveDays > 0 ? r.totalApprovedLeaveDays : '',
      'Holiday & Weekoffs': r.totalWeeklyOffDays,
      'Sick Leave': '',
      'Basic': r.earnedBasic > 0 ? r.earnedBasic : '',
      'Special Allowance': r.earnedSpecial > 0 ? r.earnedSpecial : '',
      'HRA': r.earnedHRA > 0 ? r.earnedHRA : '',
      'Tranport': r.earnedConveyance > 0 ? r.earnedConveyance : '',
      'Medical': medical > 0 ? medical : '',
      'LTA': lta > 0 ? lta : '',
      'PF Employer': pfEmployer,
      'Loan Installment': loanInstallment,
      'Total Earnings': totalEarnings,
      'PT': r.pt > 0 ? r.pt : '-',
      'PF Employee': r.epfEmployee12 > 0 ? r.epfEmployee12 : '-',
      'Other Deduction': r.otherDeductions > 0 ? r.otherDeductions : '-',
      'Total Deductions': r.totalDeductions > 0 ? r.totalDeductions : '-',
      'Net Pay Amount': r.netPayable,
      'IFSC': r.ifsc,
      'Account No.': r.accountNo
    };
  });

  const wsRivot = XLSX.utils.json_to_sheet(rivotMasterData);
  XLSX.utils.book_append_sheet(wb, wsRivot, 'RIVOT Payroll 2025-26');

  // 2. EPF ECR Filing Format (Official EPFO Portal ECR specifications)
  const epfData = records.map(r => ({
    'UAN': r.uan,
    'Member Name': r.empName,
    'Gross Wages': r.earnedGross,
    'EPF Wages': r.epfWages,
    'EPS Wages': Math.min(r.epfWages, 15000),
    'EDLI Wages': Math.min(r.epfWages, 15000),
    'EE Share (12%)': r.epfEmployee12,
    'ER EPS Share (8.33%)': r.epfEmployerEPS,
    'ER EPF Share (3.67%)': r.epfEmployerEPF,
    'NCP Days': r.totalLOPDays,
    'Refund of Advances': 0
  }));
  const wsEpf = XLSX.utils.json_to_sheet(epfData);
  XLSX.utils.book_append_sheet(wb, wsEpf, 'EPF ECR Filing');

  // 3. ESIC Monthly Filing Format
  const esicData = records
    .filter(r => r.esiApplicable)
    .map(r => ({
      'IP Number': r.esicIp,
      'IP Name': r.empName,
      'No of Days': r.paidDays,
      'Total Monthly Wages': r.esiWages,
      'Employee Contribution (0.75%)': r.esiEmployee,
      'Employer Contribution (3.25%)': r.esiEmployer,
      'Total Contribution': r.esiEmployee + r.esiEmployer,
      'Reason Code': r.paidDays === 0 ? 'Leave without pay' : '0'
    }));
  const wsEsic = XLSX.utils.json_to_sheet(esicData);
  XLSX.utils.book_append_sheet(wb, wsEsic, 'ESIC Monthly');

  // 4. PT Karnataka Sheet
  const ptData = records.map((r, index) => ({
    'Sl No': index + 1,
    'Employee Code': r.empCode,
    'Name of Employee': r.empName,
    'Gross Earned Wages': r.earnedGross,
    'Karnataka PT Slab': r.earnedGross >= 15000 ? 'Gross >= 15,000' : 'Under Exemption Limit',
    'PT Deducted': r.pt
  }));
  const wsPt = XLSX.utils.json_to_sheet(ptData);
  XLSX.utils.book_append_sheet(wb, wsPt, 'PT Karnataka');

  // 5. Bank Transfer (NEFT / IMPS) Sheet
  const bankData = records.map((r, index) => ({
    'Sr No': index + 1,
    'Beneficiary Name': r.empName,
    'Beneficiary Account No': r.accountNo,
    'IFSC Code': r.ifsc,
    'Bank Name': r.bankName,
    'Net Transfer Amount': r.netPayable,
    'Remarks / Narration': `Salary ${monthStr} RIVOT MOTORS`
  }));
  const wsBank = XLSX.utils.json_to_sheet(bankData);
  XLSX.utils.book_append_sheet(wb, wsBank, 'Bank NEFT Transfer');

  // Trigger Excel file download
  XLSX.writeFile(wb, `RIVOT Payroll 2025-26.xlsx`);
}
