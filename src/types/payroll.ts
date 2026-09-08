export interface PersonalDetails {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  maritalStatus: 'Single' | 'Married';
  currentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface IdentityDetails {
  pan: string;
  aadhaar: string;
  uan: string;
  esicIp: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branchName: string;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'INTERN';
export type EmploymentType = 'FULL_TIME' | 'PROBATION' | 'INTERN' | 'CONTRACTOR';

export interface EmploymentDetails {
  employmentType?: EmploymentType;
  designation: string;
  department: string;
  dateOfJoining: string; // YYYY-MM-DD
  probationMonths: number; // usually 6
  isPermanent: boolean;
  ctcAnnual: number;
  monthlyGross: number;
  basic: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  lta: number;
  specialAllowance: number;
  isPfEligible?: boolean;
  isEsiEligible?: boolean;
  isPtEligible?: boolean;
  stipendAmount?: number; // for interns
  resignationDate?: string; // YYYY-MM-DD
  lastWorkingDate?: string; // YYYY-MM-DD
  resignationRemarks?: string;
}

export interface LeaveBalance {
  cl: number; // Casual Leave
  sl: number; // Sick Leave
  pl: number; // Privilege / Earned Leave
  lastCreditedMonth: string; // YYYY-MM
}

export interface Employee {
  id: string;
  empCode: string;
  email: string;
  password?: string;
  tempPassword?: string;
  isTempPasswordReset: boolean;
  isProfileCompleted: boolean;
  onboardingToken?: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'EXITED' | 'RESIGNED';
  personalDetails: PersonalDetails;
  identityDetails: IdentityDetails;
  bankDetails: BankDetails;
  employmentDetails: EmploymentDetails;
  leaveBalance: LeaveBalance;
  selectedRestrictedHolidays?: string[]; // Holiday IDs chosen from restricted holiday list (max 3, total holidays capped at 8 with 5 mandatory)
}

export type AttendanceStatus =
  | 'PRESENT'        // >= 9 hours or senior exempt
  | 'HALF_DAY'       // 4 - 8.99 hours
  | 'ABSENT_LOP'     // < 4 hours or missed
  | 'WEEKLY_OFF'     // Sunday if qualified
  | 'WEEKLY_OFF_LOST' // Sunday lost due to LOP in the week
  | 'APPROVED_LEAVE' // CL/SL/PL
  | 'HOLIDAY';

export interface DailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  empId: string;
  empCode: string;
  empName: string;
  firstPunch: string | null; // "09:15"
  lastPunch: string | null;  // "18:30"
  totalHours: number;
  status: AttendanceStatus;
  isSeniorExempt: boolean; // >= 2 years tenure
  isWeeklyOffLost: boolean;
  notes?: string;
  adminOverride?: {
    modifiedBy: string;
    originalStatus: AttendanceStatus;
    newStatus: AttendanceStatus;
    reason: string;
    timestamp: string;
  };
}

export interface MissingPunchRequest {
  id: string;
  empId: string;
  empCode: string;
  empName: string;
  date: string;
  requestedPunchIn: string;
  requestedPunchOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  adminComment?: string;
  reviewedAt?: string;
}

export interface LeaveApplication {
  id: string;
  empId: string;
  empCode: string;
  empName: string;
  leaveType: 'CL' | 'SL' | 'PL';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  appliedAt: string;
  isAdvanceNoticeValid: boolean; // planned >= 24h, sick >= 2h before day start
  noticeWarningMessage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
}

export interface AdjustmentItem {
  id: string;
  category: string;
  amount: number;
  remarks: string;
}

export interface EmployeeAdjustment {
  empId: string;
  month: string; // YYYY-MM
  reimbursements: AdjustmentItem[];
  deductions: AdjustmentItem[];
}

export interface MonthlyPayrollRecord {
  month: string; // "2025-04"
  empId: string;
  empCode: string;
  empName: string;
  designation: string;
  department: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  pan: string;
  uan: string;
  esicIp: string;

  // Attendance metrics
  totalMonthDays: number;
  totalPresentDays: number;
  totalHalfDays: number;
  totalWeeklyOffDays: number;
  totalApprovedLeaveDays: number;
  totalLOPDays: number;
  paidDays: number;

  // Fixed Monthly Salary Structure
  fixedGross: number;
  fixedBasic: number;
  fixedHRA: number;
  fixedConveyance: number;
  fixedMedical: number;
  fixedLTA: number;
  fixedSpecial: number;

  // Earned Pro-rata Amounts
  earnedBasic: number;
  earnedHRA: number;
  earnedConveyance: number;
  earnedMedical: number;
  earnedLTA: number;
  earnedSpecial: number;
  earnedGross: number;

  employmentType?: EmploymentType;

  // Deductions
  epfWages: number;
  epfEmployee12: number;
  epfEmployerEPS: number;
  epfEmployerEPF: number;
  epfAdminEDLI: number;

  esiApplicable: boolean;
  esiWages: number;
  esiEmployee: number;
  esiEmployer: number;

  pt: number;
  tds: number;
  otherDeductions: number;
  totalEmployeeDeductions: number;
  totalEmployerStatutory: number;
  totalDeductions: number;

  // Reimbursements & Net
  reimbursements: number;
  netPayable: number;
  netPayableWords: string;

  status: 'DRAFT' | 'FINALIZED' | 'DISBURSED';
}

export interface PayrollSummary {
  totalGrossEarned: number;
  totalNetSalary: number;
  totalPfEmployee: number;
  totalPfEmployer: number;
  totalEsiEmployee: number;
  totalEsiEmployer: number;
  totalProfessionalTax: number;
  totalTds: number;
  totalEmployerStatutory: number;
  totalStatutoryRemittance: number;
  totalCostToCompany: number;
}

export type PayrollRecord = MonthlyPayrollRecord;

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek?: string;
  type: 'NATIONAL' | 'STATE' | 'FESTIVAL' | 'MANDATORY' | 'RESTRICTED';
  description?: string;
  isPaid: boolean;
  isMandatory?: boolean; // 5 mandatory leaves (applicable to all staff) vs restricted holidays
}
