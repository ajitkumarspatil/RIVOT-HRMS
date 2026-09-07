import React, { useState, useMemo, useEffect } from 'react';
import { 
  Employee, 
  MonthlyPayrollRecord, 
  DailyAttendanceRecord, 
  LeaveApplication, 
  MissingPunchRequest,
  EmployeeAdjustment,
  AdjustmentItem,
  PayrollSummary,
  Holiday
} from './types/payroll';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_APPLICATIONS, 
  INITIAL_MISSING_PUNCH_REQUESTS, 
  INITIAL_ADJUSTMENTS 
} from './data/seedData';
import { calculateMonthlyPayroll } from './utils/indianPayrollEngine';
import { generateSamplePunchCSV, parseBiometricCSV, processMonthlyAttendance, detectBiometricMonth, RawPunchRecord } from './utils/csvPunchParser';
import { generateEmployeePayslipPDF } from './utils/pdfPayslipGenerator';
import { exportRivotPayrollExcel } from './utils/excelExporter';
import { CompanyMaster, DEFAULT_COMPANY_MASTER } from './types/companyMaster';
import { INITIAL_HOLIDAYS_2026 } from './data/holidays';
import { AUGUST_2026_CSV } from './data/augustBiometricCSV';
import { useTheme } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { PayrollDashboard } from './components/PayrollDashboard';
import { AttendanceManager } from './components/AttendanceManager';
import { PunchHabitAnalytics } from './components/PunchHabitAnalytics';
import { LeaveManager } from './components/LeaveManager';
import { MissingPunchManager } from './components/MissingPunchManager';
import { EmployeeOnboardingManager } from './components/EmployeeOnboardingManager';
import { PayrollAdjustmentsManager } from './components/PayrollAdjustmentsManager';
import { HolidayCalendarManager } from './components/HolidayCalendarManager';
import { AdminCompanySettings } from './components/AdminCompanySettings';
import { EmployeePortalView } from './components/EmployeePortalView';
import { UbuntuDeployModal } from './components/UbuntuDeployModal';
import { LogoAssetsModal } from './components/LogoAssetsModal';

import { 
  FileSpreadsheet, 
  Clock, 
  BarChart3, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  Users,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Building2
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState<string>('2026-07');
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [activeAdminTab, setActiveAdminTab] = useState<
    'PAYROLL' | 'ATTENDANCE' | 'ANALYTICS' | 'LEAVES' | 'REGULARIZATION' | 'EMPLOYEES' | 'ADJUSTMENTS' | 'HOLIDAYS' | 'COMPANY_SETTINGS'
  >('ATTENDANCE');

  // Modals state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);

  // Company Master & Statutory Settings State
  const [companyMaster, setCompanyMaster] = useState<CompanyMaster>(() => {
    try {
      const saved = localStorage.getItem('rivot_company_master');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_MASTER;
    } catch {
      return DEFAULT_COMPANY_MASTER;
    }
  });

  // Annual Holiday Calendar State
  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    try {
      const saved = localStorage.getItem('rivot_holidays');
      return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS_2026;
    } catch {
      return INITIAL_HOLIDAYS_2026;
    }
  });

  // Core Data Collections
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [activeEmpId, setActiveEmpId] = useState<string>(INITIAL_EMPLOYEES[0]?.id || '');
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveApplication[]>(INITIAL_LEAVE_APPLICATIONS);
  const [missingPunchRequests, setMissingPunchRequests] = useState<MissingPunchRequest[]>(INITIAL_MISSING_PUNCH_REQUESTS);
  const [adjustments, setAdjustments] = useState<Record<string, EmployeeAdjustment>>(INITIAL_ADJUSTMENTS);

  // Employee Selected Restricted Holidays (Max 3 per employee, 5 mandatory + 3 restricted = max 8 leaves)
  const [employeeRestrictedHolidays, setEmployeeRestrictedHolidays] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('rivot_emp_restricted_holidays');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'emp-0020': ['hol-2026-11-08', 'hol-2026-09-04', 'hol-2026-03-19'], // Abhishek Raikar (Deepavali, Ganesh Chaturthi, Ugadi)
      'emp-0030': ['hol-2026-11-08', 'hol-2026-01-15', 'hol-2026-10-20'], // Annayya Hiremath (Deepavali, Makara Sankranti, Ayudha Pooja)
      'emp-0016': ['hol-2026-05-27', 'hol-2026-03-21', 'hol-2026-01-01'], // Asif (Bakrid, Eid-ul-Fitr, New Year)
      'emp-0010': ['hol-2026-05-27', 'hol-2026-03-21', 'hol-2026-12-25'], // Mustafa (Bakrid, Eid-ul-Fitr, Christmas)
      'emp-0003': ['hol-2026-11-08', 'hol-2026-09-04', 'hol-2026-10-20'], // Chandrakant (Deepavali, Ganesh Chaturthi, Ayudha Pooja)
      'emp-0007': ['hol-2026-11-08', 'hol-2026-01-15', 'hol-2026-03-19'], // Devanna (Deepavali, Makara Sankranti, Ugadi)
    };
  });

  // Multi-Month Punch Cache & Attendance State
  const [punchesByMonth, setPunchesByMonth] = useState<Record<string, RawPunchRecord[]>>(() => {
    try {
      const augPunches = parseBiometricCSV(generateSamplePunchCSV('2026-08', INITIAL_EMPLOYEES));
      return {
        '2026-08': augPunches
      };
    } catch {
      return {};
    }
  });

  const [rawBiometricPunches, setRawBiometricPunches] = useState<RawPunchRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>([]);

  // Initialize initial month attendance on mount
  useEffect(() => {
    let initialPunches = punchesByMonth[currentMonth];
    if (!initialPunches || initialPunches.length === 0) {
      const rawCSV = generateSamplePunchCSV(currentMonth, employees);
      initialPunches = parseBiometricCSV(rawCSV);
      setPunchesByMonth(prev => ({ ...prev, [currentMonth]: initialPunches }));
    }

    setRawBiometricPunches(initialPunches);
    const processed = processMonthlyAttendance(
      currentMonth,
      initialPunches,
      employees,
      approvedLeaves,
      adjustments,
      holidays,
      employeeRestrictedHolidays
    );
    setAttendanceRecords(processed);
  }, []);

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);

    let punches = punchesByMonth[newMonth];
    if (!punches || punches.length === 0) {
      const rawCSV = generateSamplePunchCSV(newMonth, employees);
      punches = parseBiometricCSV(rawCSV);
      setPunchesByMonth(prev => ({ ...prev, [newMonth]: punches }));
    }

    setRawBiometricPunches(punches);
    const processed = processMonthlyAttendance(
      newMonth,
      punches,
      employees,
      approvedLeaves,
      adjustments,
      holidays,
      employeeRestrictedHolidays
    );
    setAttendanceRecords(processed);
  };

  const handleClearAttendance = () => {
    setRawBiometricPunches([]);
    setAttendanceRecords([]);
    setPunchesByMonth(prev => {
      const next = { ...prev };
      delete next[currentMonth];
      return next;
    });
  };

  const handleUpdateRawPunches = (punches: RawPunchRecord[], explicitMonth?: string) => {
    // 1. Detect month directly from the 2nd column dates in punches
    const detected = detectBiometricMonth(punches);
    const targetMonth = detected || explicitMonth || currentMonth;

    // 2. Cache punches under detected target month
    setPunchesByMonth(prev => ({
      ...prev,
      [targetMonth]: punches
    }));

    // 3. Update active punches and active month
    setRawBiometricPunches(punches);
    if (targetMonth !== currentMonth) {
      setCurrentMonth(targetMonth);
    }

    // 4. Recalculate attendance records for targetMonth
    const processed = processMonthlyAttendance(
      targetMonth,
      punches,
      employees,
      approvedLeaves,
      adjustments,
      holidays,
      employeeRestrictedHolidays
    );
    setAttendanceRecords(processed);
  };

  const handleLoadSampleAttendance = () => {
    const rawCSV = generateSamplePunchCSV(currentMonth, employees);
    const punches = parseBiometricCSV(rawCSV);
    handleUpdateRawPunches(punches, currentMonth);
  };

  // Compute attendance stats per employee
  const attendanceStatsByEmp = useMemo(() => {
    const stats: Record<string, {
      totalMonthDays: number;
      totalPresentDays: number;
      totalHalfDays: number;
      totalWeeklyOffDays: number;
      totalApprovedLeaveDays: number;
      totalLOPDays: number;
      paidDays: number;
    }> = {};

    employees.forEach(emp => {
      const records = attendanceRecords.filter(r => r.empId === emp.id || r.empCode === emp.empCode);
      const totalMonthDays = records.length || 31;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const half = records.filter(r => r.status === 'HALF_DAY').length;
      const wo = records.filter(r => r.status === 'WEEKLY_OFF').length;
      const holidayDays = records.filter(r => r.status === 'HOLIDAY').length;
      const leave = records.filter(r => r.status === 'APPROVED_LEAVE').length;
      const lop = records.filter(r => r.status === 'ABSENT_LOP' || r.status === 'WEEKLY_OFF_LOST').length;

      const paidDays = present + (half * 0.5) + wo + holidayDays + leave;

      stats[emp.id] = {
        totalMonthDays,
        totalPresentDays: present,
        totalHalfDays: half,
        totalWeeklyOffDays: wo,
        totalApprovedLeaveDays: leave,
        totalLOPDays: lop,
        paidDays: Math.min(totalMonthDays, Math.round(paidDays * 10) / 10)
      };
    });

    return stats;
  }, [employees, attendanceRecords]);

  // Calculate Monthly Payroll Records
  const payrollRecords: MonthlyPayrollRecord[] = useMemo(() => {
    return employees.map(emp => {
      const stats = attendanceStatsByEmp[emp.id] || {
        totalMonthDays: 31,
        totalPresentDays: 26,
        totalHalfDays: 0,
        totalWeeklyOffDays: 4,
        totalApprovedLeaveDays: 1,
        totalLOPDays: 0,
        paidDays: 31
      };
      const adj = adjustments[`${emp.id}_${currentMonth}`];
      return calculateMonthlyPayroll(emp, currentMonth, stats, adj);
    });
  }, [employees, currentMonth, attendanceStatsByEmp, adjustments]);

  // Compute Payroll Summary KPIs
  const payrollSummary: PayrollSummary = useMemo(() => {
    return payrollRecords.reduce((acc, r) => {
      acc.totalGrossEarned += r.earnedGross;
      acc.totalNetSalary += r.netPayable;
      acc.totalPfEmployee += r.epfEmployee12;
      acc.totalPfEmployer += (r.epfEmployerEPS + r.epfEmployerEPF);
      acc.totalEsiEmployee += r.esiEmployee;
      acc.totalEsiEmployer += r.esiEmployer;
      acc.totalProfessionalTax += r.pt;
      acc.totalTds += r.tds;
      acc.totalEmployerStatutory += r.totalEmployerStatutory;
      acc.totalStatutoryRemittance += (r.epfEmployee12 + r.epfEmployerEPS + r.epfEmployerEPF + r.epfAdminEDLI + r.esiEmployee + r.esiEmployer + r.pt + r.tds);
      // Total monthly CTC strictly matches the complete gross salary
      acc.totalCostToCompany += r.earnedGross;
      return acc;
    }, {
      totalGrossEarned: 0,
      totalNetSalary: 0,
      totalPfEmployee: 0,
      totalPfEmployer: 0,
      totalEsiEmployee: 0,
      totalEsiEmployer: 0,
      totalProfessionalTax: 0,
      totalTds: 0,
      totalEmployerStatutory: 0,
      totalStatutoryRemittance: 0,
      totalCostToCompany: 0
    });
  }, [payrollRecords]);

  // Handlers for Admin Attendance Overrides
  const handleAddAdminOverride = (updatedRecord: DailyAttendanceRecord) => {
    setAttendanceRecords(prev => 
      prev.map(r => (r.empId === updatedRecord.empId && r.date === updatedRecord.date) ? updatedRecord : r)
    );
  };

  // Handlers for Leaves
  const handleUpdateLeaveBalance = (empId: string, category: 'cl' | 'sl' | 'pl', delta: number, reason: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp;
      const current = emp.leaveBalance[category] || 0;
      return {
        ...emp,
        leaveBalance: {
          ...emp.leaveBalance,
          [category]: Math.max(0, Math.round((current + delta) * 10) / 10)
        }
      };
    }));
  };

  const handleAutoCreditMonthlyLeaves = () => {
    let credited = 0;
    let skipped = 0;
    setEmployees(prev => prev.map(emp => {
      // Leave rule: leaves are only added to permanent employees after completion of probation
      if (!emp.employmentDetails.isPermanent) {
        skipped++;
        return emp;
      }
      credited++;
      return {
        ...emp,
        leaveBalance: {
          ...emp.leaveBalance,
          cl: Math.round(((emp.leaveBalance.cl || 0) + 0.5) * 10) / 10,
          sl: Math.round(((emp.leaveBalance.sl || 0) + 0.5) * 10) / 10,
          pl: Math.round(((emp.leaveBalance.pl || 0) + 0.5) * 10) / 10,
          lastCreditedMonth: currentMonth
        }
      };
    }));
    return { creditedCount: credited, skippedCount: skipped };
  };

  const handleReviewLeaveApplication = (appId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    setApprovedLeaves(prev => prev.map(app => {
      if (app.id !== appId) return app;
      return {
        ...app,
        status,
        adminComment: comment
      };
    }));
  };

  const handleApplyLeave = (app: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt'>) => {
    const newApp: LeaveApplication = {
      ...app,
      id: `leave_${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toLocaleString('en-IN')
    };
    setApprovedLeaves(prev => [newApp, ...prev]);
  };

  // Handlers for Missing Punch
  const handleReviewMissingPunch = (requestId: string, status: 'APPROVED' | 'REJECTED', adminComment?: string) => {
    const target = missingPunchRequests.find(r => r.id === requestId);
    if (!target) return;

    setMissingPunchRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status,
        adminComment,
        reviewedAt: new Date().toISOString()
      };
    }));

    // If approved, update the daily attendance record
    if (status === 'APPROVED') {
      const [h1, m1] = target.requestedPunchIn.split(':').map(Number);
      const [h2, m2] = target.requestedPunchOut.split(':').map(Number);
      const duration = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);

      setAttendanceRecords(prev => prev.map(r => {
        if ((r.empId === target.empId || r.empCode === target.empCode) && r.date === target.date) {
          return {
            ...r,
            firstPunch: target.requestedPunchIn,
            lastPunch: target.requestedPunchOut,
            totalHours: Math.round(duration * 10) / 10,
            status: duration >= 9 ? 'PRESENT' : duration >= 4 ? 'HALF_DAY' : 'ABSENT_LOP',
            adminOverride: {
              modifiedBy: 'Admin Approval (Regularization)',
              originalStatus: r.status,
              newStatus: duration >= 9 ? 'PRESENT' : 'HALF_DAY',
              reason: target.reason,
              timestamp: new Date().toISOString()
            }
          };
        }
        return r;
      }));
    }
  };

  const handleSubmitMissingPunch = (req: Omit<MissingPunchRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newReq: MissingPunchRequest = {
      ...req,
      id: `punch_req_${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString('en-IN')
    };
    setMissingPunchRequests(prev => [newReq, ...prev]);
  };

  // Handlers for Employee Onboarding
  const handleInviteEmployee = (email: string) => {
    const codeNum = 100 + employees.length + 1;
    const empCode = `RIVOT-EMP-${codeNum}`;
    const tempPass = `RIVOT#${Math.floor(1000 + Math.random() * 9000)}`;
    const inviteUrl = `https://hrms.rivotmotors.com/onboard?token=rivot_tok_${Date.now()}`;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      empCode,
      email,
      tempPassword: tempPass,
      isTempPasswordReset: false,
      isProfileCompleted: false,
      status: 'ONBOARDING',
      personalDetails: {
        firstName: '',
        lastName: '',
        phone: '',
        dob: '1995-01-01',
        gender: 'Other',
        bloodGroup: 'O+',
        maritalStatus: 'Single',
        currentAddress: '',
        permanentAddress: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
      },
      identityDetails: {
        pan: '',
        aadhaar: '',
        uan: '',
        esicIp: ''
      },
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifsc: '',
        branchName: ''
      },
      employmentDetails: {
        designation: 'Staff Associate',
        department: 'Operations & EV Engineering',
        dateOfJoining: new Date().toISOString().split('T')[0],
        probationMonths: 6,
        isPermanent: false,
        employmentType: 'FULL_TIME',
        ctcAnnual: 600000,
        monthlyGross: 50000,
        basic: 22500,
        hra: 9000,
        conveyance: 1600,
        specialAllowance: 16900,
        medicalAllowance: 0,
        lta: 0,
        isPfEligible: true,
        isEsiEligible: false
      },
      leaveBalance: {
        cl: 0,
        sl: 0,
        pl: 0,
        lastCreditedMonth: currentMonth
      }
    };

    setEmployees(prev => [...prev, newEmp]);
    return { employee: newEmp, inviteUrl, tempPass };
  };

  const handleUpdateEmployeeDetails = (empId: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, ...updated } : emp));
  };

  // Handlers for Pre-Payroll Adjustments
  const handleAddAdjustment = (empId: string, type: 'reimbursement' | 'deduction', item: Omit<AdjustmentItem, 'id'>) => {
    const key = `${empId}_${currentMonth}`;
    const current = adjustments[key] || { empId, month: currentMonth, reimbursements: [], deductions: [] };
    const newItem: AdjustmentItem = {
      ...item,
      id: `adj_${Date.now()}`
    };

    const updatedAdj: EmployeeAdjustment = {
      ...current,
      [type === 'reimbursement' ? 'reimbursements' : 'deductions']: [
        ...current[type === 'reimbursement' ? 'reimbursements' : 'deductions'],
        newItem
      ]
    };

    setAdjustments(prev => ({ ...prev, [key]: updatedAdj }));
  };

  const handleRemoveAdjustment = (empId: string, type: 'reimbursement' | 'deduction', itemId: string) => {
    const key = `${empId}_${currentMonth}`;
    const current = adjustments[key];
    if (!current) return;

    const listKey = type === 'reimbursement' ? 'reimbursements' : 'deductions';
    const updatedAdj: EmployeeAdjustment = {
      ...current,
      [listKey]: current[listKey].filter(i => i.id !== itemId)
    };

    setAdjustments(prev => ({ ...prev, [key]: updatedAdj }));
  };

  // Handlers for Company Master & Holidays
  const handleUpdateCompanyMaster = (updated: CompanyMaster) => {
    setCompanyMaster(updated);
    localStorage.setItem('rivot_company_master', JSON.stringify(updated));
  };

  const handleUpdateEmployeeRestrictedHolidays = (empId: string, holidayIds: string[]) => {
    // Total leaves cap: 8 per employee (5 mandatory + 3 restricted)
    const capped = holidayIds.slice(0, 3);
    const updated = {
      ...employeeRestrictedHolidays,
      [empId]: capped
    };
    setEmployeeRestrictedHolidays(updated);
    try {
      localStorage.setItem('rivot_emp_restricted_holidays', JSON.stringify(updated));
    } catch {}

    // Recalculate attendance immediately
    const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
    const processed = processMonthlyAttendance(
      currentMonth,
      punches,
      employees,
      approvedLeaves,
      adjustments,
      holidays,
      updated
    );
    setAttendanceRecords(processed);
  };

  const handleAddHoliday = (newHoliday: Holiday) => {
    setHolidays(prev => {
      const updated = [...prev, newHoliday];
      localStorage.setItem('rivot_holidays', JSON.stringify(updated));
      const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
      const processed = processMonthlyAttendance(
        currentMonth,
        punches,
        employees,
        approvedLeaves,
        adjustments,
        updated,
        employeeRestrictedHolidays
      );
      setAttendanceRecords(processed);
      return updated;
    });
  };

  const handleUpdateHoliday = (updatedHoliday: Holiday) => {
    setHolidays(prev => {
      const updated = prev.map(h => h.id === updatedHoliday.id ? updatedHoliday : h);
      localStorage.setItem('rivot_holidays', JSON.stringify(updated));
      const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
      const processed = processMonthlyAttendance(
        currentMonth,
        punches,
        employees,
        approvedLeaves,
        adjustments,
        updated,
        employeeRestrictedHolidays
      );
      setAttendanceRecords(processed);
      return updated;
    });
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('rivot_holidays', JSON.stringify(updated));
      const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
      const processed = processMonthlyAttendance(
        currentMonth,
        punches,
        employees,
        approvedLeaves,
        adjustments,
        updated,
        employeeRestrictedHolidays
      );
      setAttendanceRecords(processed);
      return updated;
    });
  };

  const handleResetHolidays = () => {
    setHolidays(INITIAL_HOLIDAYS_2026);
    localStorage.setItem('rivot_holidays', JSON.stringify(INITIAL_HOLIDAYS_2026));
    const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
    const processed = processMonthlyAttendance(
      currentMonth,
      punches,
      employees,
      approvedLeaves,
      adjustments,
      INITIAL_HOLIDAYS_2026,
      employeeRestrictedHolidays
    );
    setAttendanceRecords(processed);
  };

  const handleBatchImportHolidays = (imported: Holiday[]) => {
    setHolidays(prev => {
      const existingIds = new Set(prev.map(h => h.id));
      const filteredNew = imported.filter(h => !existingIds.has(h.id));
      const updated = [...prev, ...filteredNew];
      localStorage.setItem('rivot_holidays', JSON.stringify(updated));
      const punches = punchesByMonth[currentMonth] || rawBiometricPunches;
      const processed = processMonthlyAttendance(
        currentMonth,
        punches,
        employees,
        approvedLeaves,
        adjustments,
        updated,
        employeeRestrictedHolidays
      );
      setAttendanceRecords(processed);
      return updated;
    });
  };

  const currentEmployee = employees.find(e => e.id === activeEmpId) || employees[0];

  return (
    <div className="min-h-screen bg-[#0B0D11] text-gray-100 flex flex-col font-sans selection:bg-[#FF5E0E]/30 selection:text-white transition-colors">
      
      {/* Universal Top Header */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        payrollRecords={payrollRecords}
        onBatchPayslips={() => {
          payrollRecords.forEach((r, idx) => {
            setTimeout(() => generateEmployeePayslipPDF(r, companyMaster), idx * 200);
          });
        }}
        selectedEmpId={activeEmpId}
        onSelectEmployee={setActiveEmpId}
        employees={employees.map(e => ({
          id: e.id,
          name: `${e.personalDetails.firstName} ${e.personalDetails.lastName}`.trim() || e.email,
          code: e.empCode
        }))}
        companyMaster={companyMaster}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Admin Navigation Bar */}
        {activeRole === 'ADMIN' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#262D3D]">
            <button
              onClick={() => setActiveAdminTab('PAYROLL')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'PAYROLL'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Payroll Register</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('ATTENDANCE')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'ATTENDANCE'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Biometric Attendance</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('ANALYTICS')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'ANALYTICS'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Habit Analytics</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('LEAVES')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'LEAVES'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Leave Accruals & Quotas</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('REGULARIZATION')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap relative ${
                activeAdminTab === 'REGULARIZATION'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Missing Punches</span>
              {missingPunchRequests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('EMPLOYEES')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'EMPLOYEES'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff & Compensation</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('ADJUSTMENTS')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'ADJUSTMENTS'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Reimbursements & Deductions</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('HOLIDAYS')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'HOLIDAYS'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Annual Holidays</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('COMPANY_SETTINGS')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeAdminTab === 'COMPANY_SETTINGS'
                  ? 'bg-[#FF5E0E] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company Master & SMTP</span>
            </button>
          </div>
        )}

        {/* View Switcher based on Active Role & Tab */}
        {activeRole === 'ADMIN' ? (
          <>
            {activeAdminTab === 'PAYROLL' && (
              <PayrollDashboard
                currentMonth={currentMonth}
                payrollRecords={payrollRecords}
                payrollSummary={payrollSummary}
                employees={employees}
                companyMaster={companyMaster}
                onRecalculatePayroll={() => {
                  const rawCSV = generateSamplePunchCSV(currentMonth, employees);
                  const punches = parseBiometricCSV(rawCSV);
                  const processed = processMonthlyAttendance(
                    currentMonth, 
                    punches, 
                    employees, 
                    approvedLeaves, 
                    adjustments, 
                    holidays, 
                    employeeRestrictedHolidays
                  );
                  setAttendanceRecords(processed);
                }}
              />
            )}

            {activeAdminTab === 'ATTENDANCE' && (
              <AttendanceManager
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
                employees={employees}
                attendanceRecords={attendanceRecords}
                onUpdateAttendance={setAttendanceRecords}
                onClearAttendance={handleClearAttendance}
                onLoadSampleAttendance={handleLoadSampleAttendance}
                approvedLeaves={approvedLeaves}
                onAddAdminOverride={handleAddAdminOverride}
                holidays={holidays}
                employeeRestrictedHolidays={employeeRestrictedHolidays}
                rawBiometricPunches={rawBiometricPunches}
                onUpdateRawPunches={handleUpdateRawPunches}
              />
            )}

            {activeAdminTab === 'ANALYTICS' && (
              <PunchHabitAnalytics
                currentMonth={currentMonth}
                attendanceRecords={attendanceRecords}
                employees={employees}
              />
            )}

            {activeAdminTab === 'LEAVES' && (
              <LeaveManager
                currentMonth={currentMonth}
                employees={employees}
                leaveApplications={approvedLeaves}
                onUpdateLeaveBalance={handleUpdateLeaveBalance}
                onAutoCreditMonthlyLeaves={handleAutoCreditMonthlyLeaves}
                onReviewLeaveApplication={handleReviewLeaveApplication}
                onApplyLeave={handleApplyLeave}
              />
            )}

            {activeAdminTab === 'REGULARIZATION' && (
              <MissingPunchManager
                currentMonth={currentMonth}
                employees={employees}
                missingPunchRequests={missingPunchRequests}
                onReviewRequest={handleReviewMissingPunch}
                onSubmitRequest={handleSubmitMissingPunch}
                isAdmin={true}
                activeEmployeeId={activeEmpId}
              />
            )}

            {activeAdminTab === 'EMPLOYEES' && (
              <EmployeeOnboardingManager
                employees={employees}
                onInviteEmployee={handleInviteEmployee}
                onUpdateEmployeeDetails={handleUpdateEmployeeDetails}
              />
            )}

            {activeAdminTab === 'ADJUSTMENTS' && (
              <PayrollAdjustmentsManager
                currentMonth={currentMonth}
                employees={employees}
                adjustments={adjustments}
                onAddAdjustment={handleAddAdjustment}
                onRemoveAdjustment={handleRemoveAdjustment}
              />
            )}

            {activeAdminTab === 'HOLIDAYS' && (
              <HolidayCalendarManager
                holidays={holidays}
                employees={employees}
                employeeRestrictedHolidays={employeeRestrictedHolidays}
                onUpdateEmployeeRestrictedHolidays={handleUpdateEmployeeRestrictedHolidays}
                onAddHoliday={handleAddHoliday}
                onUpdateHoliday={handleUpdateHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                onResetHolidays={handleResetHolidays}
                onBatchImportHolidays={handleBatchImportHolidays}
              />
            )}

            {activeAdminTab === 'COMPANY_SETTINGS' && (
              <AdminCompanySettings
                companyMaster={companyMaster}
                onUpdateCompanyMaster={handleUpdateCompanyMaster}
              />
            )}
          </>
        ) : (
          /* Employee Self-Service Portal */
          <EmployeePortalView
            currentMonth={currentMonth}
            currentEmployee={currentEmployee}
            allEmployees={employees}
            onSwitchEmployee={setActiveEmpId}
            payrollRecords={payrollRecords}
            attendanceRecords={attendanceRecords}
            onUpdatePersonalDetails={handleUpdateEmployeeDetails}
            onApplyLeave={handleApplyLeave}
            onSubmitMissingPunch={handleSubmitMissingPunch}
            leaveApplications={approvedLeaves}
            missingPunchRequests={missingPunchRequests}
            holidays={holidays}
            employeeRestrictedHolidays={employeeRestrictedHolidays}
            onUpdateEmployeeRestrictedHolidays={handleUpdateEmployeeRestrictedHolidays}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0B0D11] border-t border-[#262D3D] py-4 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} RIVOT MOTORS PRIVATE LIMITED • HRMS & Statutory Payroll Automation
          </span>
          <span className="font-mono text-gray-400">
            Domain: https://hrms.rivotmotors.com
          </span>
        </div>
      </footer>

      {/* Ubuntu VM Deployment Modal */}
      <UbuntuDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Logo Assets Modal */}
      <LogoAssetsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

    </div>
  );
}
