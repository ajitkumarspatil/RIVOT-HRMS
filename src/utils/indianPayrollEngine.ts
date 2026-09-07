import { Employee, MonthlyPayrollRecord, EmployeeAdjustment } from '../types/payroll';

/**
 * Calculates Professional Tax based on Karnataka / General India slabs
 */
export function calculatePT(grossEarned: number, state: string = 'Karnataka'): number {
  if (state === 'Karnataka') {
    return grossEarned >= 15000 ? 200 : 0;
  }
  if (state === 'Maharashtra') {
    if (grossEarned <= 7500) return 0;
    if (grossEarned <= 10000) return 175;
    return 200;
  }
  // Standard India default
  return grossEarned >= 15000 ? 200 : 0;
}

/**
 * Converts numbers to Indian Currency Words (e.g., 42500 => "Rupees Forty-Two Thousand Five Hundred Only")
 */
export function amountInWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Rupees Zero Only';

  function convertTwoDigits(val: number): string {
    if (val < 20) return a[val];
    const ten = Math.floor(val / 10);
    const unit = val % 10;
    return b[ten] + (unit ? ' ' + a[unit] : '');
  }

  function convertThreeDigits(val: number): string {
    const hundred = Math.floor(val / 100);
    const rest = val % 100;
    let res = '';
    if (hundred) res += a[hundred] + ' Hundred';
    if (rest) {
      if (res) res += ' and ';
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundredAndRest = n % 1000;

  let words = '';
  if (crore) words += convertThreeDigits(crore) + ' Crore ';
  if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) words += convertTwoDigits(thousand) + ' Thousand ';
  if (hundredAndRest) words += convertThreeDigits(hundredAndRest);

  return 'Rupees ' + words.trim() + ' Only';
}

/**
 * Calculates pro-rata salary and statutory deductions for an employee for a specific month
 */
export function calculateMonthlyPayroll(
  emp: Employee,
  month: string, // "YYYY-MM"
  attendanceStats: {
    totalMonthDays: number;
    totalPresentDays: number;
    totalHalfDays: number;
    totalWeeklyOffDays: number;
    totalApprovedLeaveDays: number;
    totalLOPDays: number;
    paidDays: number;
  },
  adjustment?: EmployeeAdjustment
): MonthlyPayrollRecord {
  const { totalMonthDays, paidDays } = attendanceStats;
  const factor = totalMonthDays > 0 ? Math.min(1, Math.max(0, paidDays / totalMonthDays)) : 1;

  const empDetails = emp.employmentDetails;
  const isIntern = empDetails.employmentType === 'INTERN';
  const fixedGross = empDetails.monthlyGross;

  // Salary Component Breakdown
  // If intern, they receive a monthly stipend without standard corporate allowance breakdown unless configured
  let fixedBasic = 0;
  let fixedHRA = 0;
  let fixedConveyance = 0;
  let fixedMedical = 0;
  let fixedLTA = 0;
  let fixedSpecial = 0;

  if (isIntern) {
    fixedBasic = empDetails.basic || fixedGross;
    fixedSpecial = 0;
  } else {
    // Official RIVOT Salary Breakup Formula matching RIVOT Payroll 2025-26.xlsx:
    // Basic: 50% of Gross
    fixedBasic = empDetails.basic || Math.round(fixedGross * 0.50);
    // HRA: 5.168% of Gross (or explicit)
    fixedHRA = empDetails.hra !== undefined ? empDetails.hra : Math.round(fixedGross * 0.05168);
    // Conveyance / Transport: 3.616% of Gross (or explicit)
    fixedConveyance = empDetails.conveyance !== undefined ? empDetails.conveyance : Math.round(fixedGross * 0.03616);
    // Medical Allowance: 4.132% of Gross (or explicit)
    fixedMedical = empDetails.medicalAllowance !== undefined ? empDetails.medicalAllowance : Math.round(fixedGross * 0.04132);
    // LTA (Leave Travel Allowance): 6.2% of Gross (or explicit)
    fixedLTA = empDetails.lta !== undefined ? empDetails.lta : Math.round(fixedGross * 0.062);
    // Special Allowance: Remaining balancing figure ensuring components EXACTLY equal fixedGross
    const allocated = fixedBasic + fixedHRA + fixedConveyance + fixedMedical + fixedLTA;
    fixedSpecial = Math.max(0, fixedGross - allocated);
  }

  // Earned amounts pro-rated to paid days
  // Overall earned gross is strictly pro-rated from fixedGross:
  const earnedGross = Math.round(fixedGross * factor);
  const earnedBasic = Math.round(fixedBasic * factor);
  const earnedHRA = Math.round(fixedHRA * factor);
  const earnedConveyance = Math.round(fixedConveyance * factor);
  const earnedMedical = Math.round(fixedMedical * factor);
  const earnedLTA = Math.round(fixedLTA * factor);
  // earnedSpecial absorbs any minor rounding discrepancy so that the sum of components identically equals earnedGross:
  const earnedAllocated = earnedBasic + earnedHRA + earnedConveyance + earnedMedical + earnedLTA;
  const earnedSpecial = isIntern ? 0 : Math.max(0, earnedGross - earnedAllocated);

  // EPF Calculation
  // Standard statutory wage cap is ₹15,000 for PF calculation unless employee opts for actual
  // Interns are legally exempt from PF unless explicitly enabled
  const isPfEligible = !isIntern && empDetails.isPfEligible !== false;
  const epfWages = isPfEligible ? Math.min(earnedBasic, 15000) : 0;
  const epfEmployee12 = isPfEligible ? Math.round(epfWages * 0.12) : 0;
  const epfEmployerEPS = isPfEligible ? Math.min(Math.round(epfWages * 0.0833), 1250) : 0;
  const epfEmployerEPF = isPfEligible ? Math.max(0, epfEmployee12 - epfEmployerEPS) : 0;
  const epfAdminEDLI = isPfEligible ? Math.round(epfWages * 0.01) : 0; // 0.5% admin + 0.5% EDLI

  // ESI Calculation
  // Statutory rule: applicable only if monthly gross <= 21,000 and not an intern
  const esiApplicable = !isIntern && fixedGross <= 21000 && empDetails.isEsiEligible !== false;
  const esiWages = esiApplicable ? earnedGross : 0;
  const esiEmployee = esiApplicable ? Math.ceil(earnedGross * 0.0075) : 0;
  const esiEmployer = esiApplicable ? Math.ceil(earnedGross * 0.0325) : 0;

  // Professional Tax (Karnataka: ₹200 if gross >= 15,000)
  const pt = calculatePT(earnedGross, 'Karnataka');

  // Adjustments (Reimbursements and other deductions / loan installments)
  let totalReimbursements = 0;
  let totalOtherDeductions = 0;

  if (adjustment) {
    totalReimbursements = adjustment.reimbursements.reduce((sum, item) => sum + (item.amount || 0), 0);
    totalOtherDeductions = adjustment.deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  // Estimated TDS (simplified estimation or 0 if under basic exemption)
  const annualEstimated = earnedGross * 12;
  let tds = 0;
  if (annualEstimated > 700000) {
    tds = Math.round((annualEstimated - 700000) * 0.10 / 12);
  }

  // Statutory and Employee Deductions:
  // 1. Employee deductions (EPF 12%, ESIC 0.75%, PT, TDS, advances)
  const totalEmployeeDeductions = epfEmployee12 + esiEmployee + pt + tds + totalOtherDeductions;

  // 2. Employer statutory contributions (EPF 3.67%, EPS 8.33%, EDLI & Admin 1%, ESIC 3.25%)
  // Employer contributions are made part of the CTC and deducted from the gross salary pool
  const totalEmployerStatutory = epfEmployerEPF + epfEmployerEPS + epfAdminEDLI + esiEmployer;

  // 3. Complete deductions: both employer & employee deductions are part of the CTC
  const totalDeductions = totalEmployeeDeductions + totalEmployerStatutory;

  // 4. Net take-home salary: Gross earned minus all statutory remittances (EE + ER) and deductions
  const netPayable = Math.max(0, earnedGross - totalDeductions + totalReimbursements);

  return {
    month,
    empId: emp.id,
    empCode: emp.empCode,
    empName: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.trim() || emp.email,
    designation: emp.employmentDetails.designation || (isIntern ? 'Engineering Intern' : 'Staff'),
    department: emp.employmentDetails.department || 'Engineering',
    employmentType: emp.employmentDetails.employmentType || (isIntern ? 'INTERN' : 'FULL_TIME'),
    bankName: emp.bankDetails.bankName || 'HDFC Bank',
    accountNo: emp.bankDetails.accountNumber || 'Pending Update',
    ifsc: emp.bankDetails.ifsc || 'HDFC0001234',
    pan: emp.identityDetails.pan || 'PAN PENDING',
    uan: emp.identityDetails.uan || 'UAN PENDING',
    esicIp: emp.identityDetails.esicIp || 'ESIC PENDING',

    totalMonthDays: attendanceStats.totalMonthDays,
    totalPresentDays: attendanceStats.totalPresentDays,
    totalHalfDays: attendanceStats.totalHalfDays,
    totalWeeklyOffDays: attendanceStats.totalWeeklyOffDays,
    totalApprovedLeaveDays: attendanceStats.totalApprovedLeaveDays,
    totalLOPDays: attendanceStats.totalLOPDays,
    paidDays,

    fixedGross,
    fixedBasic,
    fixedHRA,
    fixedConveyance,
    fixedMedical,
    fixedLTA,
    fixedSpecial,

    earnedBasic,
    earnedHRA,
    earnedConveyance,
    earnedMedical,
    earnedLTA,
    earnedSpecial,
    earnedGross,

    epfWages,
    epfEmployee12,
    epfEmployerEPS,
    epfEmployerEPF,
    epfAdminEDLI,

    esiApplicable,
    esiWages,
    esiEmployee,
    esiEmployer,

    pt,
    tds,
    otherDeductions: totalOtherDeductions,
    totalEmployeeDeductions,
    totalEmployerStatutory,
    totalDeductions,

    reimbursements: totalReimbursements,
    netPayable,
    netPayableWords: amountInWords(netPayable),

    status: 'DRAFT'
  };
}
