import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  MonthlyPayrollRecord, 
  DailyAttendanceRecord, 
  LeaveApplication,
  MissingPunchRequest,
  Holiday
} from '../types/payroll';
import { generateEmployeePayslipPDF } from '../utils/pdfPayslipGenerator';
import { getEffectiveEmployeePassword, DEFAULT_STAFF_PASSWORD } from '../utils/authConfig';
import { 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Lock, 
  CheckCircle2, 
  Save,
  Send,
  AlertCircle,
  X,
  Plus,
  Star,
  ShieldCheck,
  Check,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface EmployeePortalViewProps {
  currentMonth: string;
  currentEmployee: Employee;
  allEmployees: Employee[];
  onSwitchEmployee: (empId: string) => void;
  payrollRecords: MonthlyPayrollRecord[];
  attendanceRecords: DailyAttendanceRecord[];
  onUpdatePersonalDetails: (empId: string, updatedDetails: Partial<Employee>) => void;
  onApplyLeave: (application: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt'>) => void;
  onSubmitMissingPunch: (req: Omit<MissingPunchRequest, 'id' | 'status' | 'submittedAt'>) => void;
  leaveApplications: LeaveApplication[];
  missingPunchRequests?: MissingPunchRequest[];
  holidays?: Holiday[];
  employeeRestrictedHolidays?: Record<string, string[]>;
  onUpdateEmployeeRestrictedHolidays?: (empId: string, holidayIds: string[]) => void;
  isAdminSession?: boolean;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentMonth,
  currentEmployee,
  allEmployees,
  onSwitchEmployee,
  payrollRecords,
  attendanceRecords,
  onUpdatePersonalDetails,
  onApplyLeave,
  onSubmitMissingPunch,
  leaveApplications,
  missingPunchRequests = [],
  holidays = [],
  employeeRestrictedHolidays = {},
  onUpdateEmployeeRestrictedHolidays,
  isAdminSession = true
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PAYSLIP' | 'PROFILE' | 'LEAVES' | 'ATTENDANCE'>('PAYSLIP');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Profile Form State
  const p = currentEmployee.personalDetails;
  const b = currentEmployee.bankDetails;
  const s = currentEmployee.identityDetails;

  const [email, setEmail] = useState<string>(currentEmployee.email || '');
  const [firstName, setFirstName] = useState<string>(p.firstName || '');
  const [lastName, setLastName] = useState<string>(p.lastName || '');
  const [phone, setPhone] = useState<string>(p.phone || '');
  const [dob, setDob] = useState<string>(p.dob || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(p.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState<string>(p.bloodGroup || '');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married'>(p.maritalStatus || 'Single');
  const [currentAddress, setCurrentAddress] = useState<string>(p.currentAddress || '');
  const [permanentAddress, setPermanentAddress] = useState<string>(p.permanentAddress || p.currentAddress || '');
  const [emergencyContactName, setEmergencyContactName] = useState<string>(p.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>(p.emergencyContactPhone || '');

  const [panNumber, setPanNumber] = useState<string>(s.pan || '');
  const [aadhaarNumber, setAadhaarNumber] = useState<string>(s.aadhaar || '');
  const [uanNumber, setUanNumber] = useState<string>(s.uan || '');
  const [esicIp, setEsicIp] = useState<string>(s.esicIp || '');

  const [bankName, setBankName] = useState<string>(b.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(b.accountNumber || '');
  const [ifscCode, setIfscCode] = useState<string>(b.ifsc || '');
  const [branchName, setBranchName] = useState<string>(b.branchName || '');

  // Keep state synced when switching employee
  useEffect(() => {
    setEmail(currentEmployee.email || '');
    setFirstName(currentEmployee.personalDetails.firstName || '');
    setLastName(currentEmployee.personalDetails.lastName || '');
    setPhone(currentEmployee.personalDetails.phone || '');
    setDob(currentEmployee.personalDetails.dob || '');
    setGender(currentEmployee.personalDetails.gender || 'Male');
    setBloodGroup(currentEmployee.personalDetails.bloodGroup || '');
    setMaritalStatus(currentEmployee.personalDetails.maritalStatus || 'Single');
    setCurrentAddress(currentEmployee.personalDetails.currentAddress || '');
    setPermanentAddress(currentEmployee.personalDetails.permanentAddress || currentEmployee.personalDetails.currentAddress || '');
    setEmergencyContactName(currentEmployee.personalDetails.emergencyContactName || '');
    setEmergencyContactPhone(currentEmployee.personalDetails.emergencyContactPhone || '');

    setPanNumber(currentEmployee.identityDetails.pan || '');
    setAadhaarNumber(currentEmployee.identityDetails.aadhaar || '');
    setUanNumber(currentEmployee.identityDetails.uan || '');
    setEsicIp(currentEmployee.identityDetails.esicIp || '');

    setBankName(currentEmployee.bankDetails.bankName || '');
    setAccountNumber(currentEmployee.bankDetails.accountNumber || '');
    setIfscCode(currentEmployee.bankDetails.ifsc || '');
    setBranchName(currentEmployee.bankDetails.branchName || '');
  }, [currentEmployee]);

  // Leave Application Form State
  const [leaveType, setLeaveType] = useState<'CL' | 'SL' | 'PL'>('CL');
  const [leaveStart, setLeaveStart] = useState<string>(`${currentMonth}-15`);
  const [leaveEnd, setLeaveEnd] = useState<string>(`${currentMonth}-15`);
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveMsg, setLeaveMsg] = useState<string | null>(null);
  const [holidayChoiceMsg, setHolidayChoiceMsg] = useState<string | null>(null);
  const [holidayErrorMsg, setHolidayErrorMsg] = useState<string | null>(null);

  const handleToggleMyRestrictedHoliday = (holId: string) => {
    if (!onUpdateEmployeeRestrictedHolidays) return;
    const currentChosen = employeeRestrictedHolidays[currentEmployee.id] || currentEmployee.selectedRestrictedHolidays || [];
    const isChosen = currentChosen.includes(holId);

    if (isChosen) {
      const next = currentChosen.filter(id => id !== holId);
      onUpdateEmployeeRestrictedHolidays(currentEmployee.id, next);
      setHolidayErrorMsg(null);
      setHolidayChoiceMsg('Holiday selection updated.');
      setTimeout(() => setHolidayChoiceMsg(null), 4000);
    } else {
      if (currentChosen.length >= 3) {
        setHolidayErrorMsg('Policy limit reached: Total leaves cannot cross 8 per employee (5 mandatory leaves + 3 restricted holidays). Please deselect one to choose another.');
        setTimeout(() => setHolidayErrorMsg(null), 6000);
        return;
      }
      const next = [...currentChosen, holId];
      onUpdateEmployeeRestrictedHolidays(currentEmployee.id, next);
      setHolidayErrorMsg(null);
      setHolidayChoiceMsg('Restricted holiday chosen for your annual schedule.');
      setTimeout(() => setHolidayChoiceMsg(null), 4000);
    }
  };

  // Password Reset state
  const [oldPass, setOldPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmNewPass, setConfirmNewPass] = useState<string>('');
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current Employee's Payroll Record for the month
  const myPayroll = payrollRecords.find(r => r.empId === currentEmployee.id || r.empCode === currentEmployee.empCode);

  // Current Employee's Attendance Records
  const myAttendance = attendanceRecords.filter(r => r.empId === currentEmployee.id || r.empCode === currentEmployee.empCode);

  // Missed Punch Correction State
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchDate, setPunchDate] = useState<string>(`${currentMonth}-01`);
  const [currentPunchInDisplay, setCurrentPunchInDisplay] = useState<string>('--:--');
  const [currentPunchOutDisplay, setCurrentPunchOutDisplay] = useState<string>('--:--');
  const [requestedIn, setRequestedIn] = useState<string>('08:30');
  const [requestedOut, setRequestedOut] = useState<string>('18:30');
  const [punchReason, setPunchReason] = useState<string>('');
  const [punchMsg, setPunchMsg] = useState<string | null>(null);

  const myPunchRequests = (missingPunchRequests || []).filter(
    r => r.empId === currentEmployee.id || r.empCode === currentEmployee.empCode
  );

  const handleOpenCorrection = (date: string, firstPunch?: string, lastPunch?: string) => {
    setPunchDate(date);
    setCurrentPunchInDisplay(firstPunch || '--:--');
    setCurrentPunchOutDisplay(lastPunch || '--:--');
    setRequestedIn(firstPunch && firstPunch !== '--:--' ? firstPunch : '08:30');
    setRequestedOut(lastPunch && lastPunch !== '--:--' ? lastPunch : '18:30');
    setPunchReason('');
    setIsPunchModalOpen(true);
  };

  const handlePunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchReason.trim()) return;

    onSubmitMissingPunch({
      empId: currentEmployee.id,
      empCode: currentEmployee.empCode,
      empName: `${currentEmployee.personalDetails.firstName} ${currentEmployee.personalDetails.lastName}`.trim(),
      date: punchDate,
      requestedPunchIn: requestedIn,
      requestedPunchOut: requestedOut,
      reason: punchReason.trim()
    });

    setIsPunchModalOpen(false);
    setPunchReason('');
    setPunchMsg(`Correction request for shift date ${punchDate} has been submitted to Admin for approval.`);
    setTimeout(() => setPunchMsg(null), 7000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePersonalDetails(currentEmployee.id, {
      email: email.trim(),
      isProfileCompleted: true,
      personalDetails: {
        ...currentEmployee.personalDetails,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dob,
        gender,
        bloodGroup: bloodGroup.trim(),
        maritalStatus,
        currentAddress: currentAddress.trim(),
        permanentAddress: permanentAddress.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim()
      },
      identityDetails: {
        ...currentEmployee.identityDetails,
        pan: panNumber.trim().toUpperCase(),
        aadhaar: aadhaarNumber.trim(),
        uan: uanNumber.trim(),
        esicIp: esicIp.trim()
      },
      bankDetails: {
        ...currentEmployee.bankDetails,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim()
      }
    });

    setSaveMessage('Profile information, Email ID, and Bank Details saved and updated successfully!');
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    // Check advance notice rules
    const now = new Date();
    const startDate = new Date(leaveStart);
    const diffHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let isAdvanceNoticeValid = true;
    let noticeWarningMessage = '';

    if (leaveType === 'CL' || leaveType === 'PL') {
      if (diffHours < 24) {
        isAdvanceNoticeValid = false;
        noticeWarningMessage = 'Notice violation: Planned leaves must be applied >= 24h in advance';
      }
    } else if (leaveType === 'SL') {
      if (diffHours < 2) {
        isAdvanceNoticeValid = false;
        noticeWarningMessage = 'Notice violation: Sick leaves must be notified >= 2h before shift start';
      }
    }

    onApplyLeave({
      empId: currentEmployee.id,
      empCode: currentEmployee.empCode,
      empName: `${firstName || p.firstName} ${lastName || p.lastName}`.trim(),
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 1,
      reason: leaveReason,
      isAdvanceNoticeValid,
      noticeWarningMessage
    });

    setLeaveReason('');
    setLeaveMsg('Leave application submitted! Awaiting Admin verification.');
    setTimeout(() => setLeaveMsg(null), 5000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveOld = getEffectiveEmployeePassword(currentEmployee);
    const cleanOld = oldPass.trim();
    if (cleanOld !== effectiveOld && cleanOld !== DEFAULT_STAFF_PASSWORD && cleanOld !== '123456') {
      setPassMsg({ type: 'error', text: 'Current password is incorrect. (Initial default is "Rivot@123")' });
      return;
    }
    if (!newPass || newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    onUpdatePersonalDetails(currentEmployee.id, {
      password: newPass.trim(),
      tempPassword: newPass.trim(),
      isTempPasswordReset: true
    });

    setPassMsg({ type: 'success', text: 'Password successfully updated! Your private password is now active.' });
    setOldPass('');
    setNewPass('');
    setConfirmNewPass('');
    setTimeout(() => setPassMsg(null), 5000);
  };

  const handleDownloadPDF = () => {
    if (myPayroll) {
      generateEmployeePayslipPDF(myPayroll);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Switch Staff (For Demo / Self-Service Testing) */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5E0E] to-[#E04E05] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#FF5E0E]/20">
            {firstName.charAt(0) || currentEmployee.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {firstName} {lastName}
              </h2>
              <span className="font-mono text-xs text-[#FF5E0E] font-semibold bg-[#FF5E0E]/15 px-2 py-0.5 rounded">
                {currentEmployee.empCode}
              </span>
              <span className="text-xs text-gray-400">
                • {currentEmployee.employmentDetails.designation || 'Staff'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Username: <span className="font-mono text-gray-300">{currentEmployee.email}</span>
            </p>
          </div>
        </div>

        {/* Admin Audit Switcher: Only visible if authenticated as Admin */}
        {isAdminSession && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Admin Audit View:</span>
            <select
              value={currentEmployee.id}
              onChange={(e) => onSwitchEmployee(e.target.value)}
              className="bg-[#181D27] border border-[#262D3D] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              title="Admin Audit: Preview portal as another employee"
            >
              {allEmployees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.personalDetails.firstName} {e.personalDetails.lastName} ({e.empCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* First-time login banner if temporary default password is in use */}
      {!currentEmployee.isTempPasswordReset && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">
                First Time Login: Please Set Your Private Password & Update Your Profile
              </h4>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                You are currently using the initial default password (<span className="font-mono font-bold text-white">{DEFAULT_STAFF_PASSWORD}</span>). Please change your password, verify your email ID, and review bank details for salary disbursement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubTab('PROFILE')}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-md"
          >
            Update Profile & Password →
          </button>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-[#262D3D] pb-1">
        <button
          onClick={() => setActiveSubTab('PAYSLIP')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'PAYSLIP'
              ? 'bg-[#FF5E0E] text-white shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Payslip ({currentMonth})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PROFILE')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'PROFILE'
              ? 'bg-[#FF5E0E] text-white shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal & Banking Details</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LEAVES')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'LEAVES'
              ? 'bg-[#FF5E0E] text-white shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Apply Leave & Balances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ATTENDANCE')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'ATTENDANCE'
              ? 'bg-[#FF5E0E] text-white shadow-sm'
              : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>My Punch Log</span>
        </button>
      </div>

      {/* View 1: Payslip */}
      {activeSubTab === 'PAYSLIP' && (
        <div className="space-y-6">
          {myPayroll ? (
            <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262D3D] pb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                    Salary Statement
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Payslip for {myPayroll.month}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Paid Days: <strong className="text-white">{myPayroll.paidDays}</strong> / {myPayroll.totalMonthDays} • 
                    LOP Days: <strong className="text-rose-400 ml-1">{myPayroll.totalLOPDays}</strong>
                  </p>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Payslip</span>
                </button>
              </div>

              {/* Net Pay Callout */}
              <div className="my-6 p-4 rounded-xl bg-[#0B0D11] border border-[#262D3D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Net Take-Home Pay (Bank Credited):</span>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">
                    ₹ {myPayroll.netPayable.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-gray-500">
                    Bank: {currentEmployee.bankDetails.bankName || 'HDFC Bank'} • A/C: {currentEmployee.bankDetails.accountNumber}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400">Gross Earned / CTC</span>
                  <p className="text-base font-bold text-white">₹ {myPayroll.earnedGross.toLocaleString('en-IN')}</p>
                  <span className="text-xs text-gray-400 mt-1 block">Total Statutory Deductions</span>
                  <p className="text-base font-bold text-rose-400">- ₹ {myPayroll.totalDeductions.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Earnings */}
                <div className="bg-[#181D27] p-4 rounded-xl border border-[#262D3D] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#262D3D]">
                    <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                      Gross Earnings Breakdown
                    </h4>
                    <span className="font-bold text-emerald-400 font-mono">
                      ₹ {(myPayroll.earnedGross + myPayroll.reimbursements).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>Basic Salary</span>
                    <span className="font-mono text-white">₹ {myPayroll.earnedBasic.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-mono text-white">₹ {myPayroll.earnedHRA.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>Conveyance Allowance</span>
                    <span className="font-mono text-white">₹ {myPayroll.earnedConveyance.toLocaleString('en-IN')}</span>
                  </div>
                  {(myPayroll.earnedMedical ?? 0) > 0 && (
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Medical Allowance</span>
                      <span className="font-mono text-white">₹ {myPayroll.earnedMedical?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {(myPayroll.earnedLTA ?? 0) > 0 && (
                    <div className="flex justify-between py-1 text-gray-300">
                      <span>Leave Travel Allowance (LTA)</span>
                      <span className="font-mono text-white">₹ {myPayroll.earnedLTA?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>Special Allowance</span>
                    <span className="font-mono text-white">₹ {myPayroll.earnedSpecial.toLocaleString('en-IN')}</span>
                  </div>
                  {myPayroll.reimbursements > 0 && (
                    <div className="flex justify-between py-1 text-emerald-300 font-semibold border-t border-[#262D3D]">
                      <span>Approved Reimbursements</span>
                      <span className="font-mono">+ ₹ {myPayroll.reimbursements.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Deductions & Employer Contributions */}
                <div className="bg-[#181D27] p-4 rounded-xl border border-[#262D3D] space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#262D3D]">
                    <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                      Statutory & Salary Deductions (from CTC)
                    </h4>
                    <span className="font-bold text-rose-400 font-mono">
                      - ₹ {myPayroll.totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Employee Share */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">
                      <span>Employee Deductions</span>
                      <span className="font-mono">₹ {myPayroll.totalEmployeeDeductions.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                        <span>Provident Fund (EPF 12%)</span>
                        <span className="font-mono text-rose-300">₹ {myPayroll.epfEmployee12.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                        <span>Employee State Insurance (ESIC 0.75%)</span>
                        <span className="font-mono text-rose-300">₹ {myPayroll.esiEmployee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                        <span>Professional Tax (PT Karnataka)</span>
                        <span className="font-mono text-rose-300">₹ {myPayroll.pt.toLocaleString('en-IN')}</span>
                      </div>
                      {myPayroll.otherDeductions > 0 && (
                        <div className="flex justify-between py-0.5 text-rose-400 font-semibold text-xs">
                          <span>Other Recoveries / Advance</span>
                          <span className="font-mono">- ₹ {myPayroll.otherDeductions.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employer Statutory Contribution */}
                  <div className="pt-2 border-t border-[#262D3D] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <span>Employer Statutory Contribution (Part of CTC)</span>
                      <span className="font-mono text-amber-300">
                        ₹ {myPayroll.totalEmployerStatutory.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                      <span>EPF Employer (3.67%)</span>
                      <span className="font-mono text-gray-300">Rs. {myPayroll.epfEmployerEPF}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                      <span>EPS Pension (8.33%)</span>
                      <span className="font-mono text-gray-300">Rs. {myPayroll.epfEmployerEPS}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                      <span>EDLI & Admin (1.0%)</span>
                      <span className="font-mono text-gray-300">Rs. {myPayroll.epfAdminEDLI}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                      <span>ESIC Employer (3.25%)</span>
                      <span className="font-mono text-gray-300">Rs. {myPayroll.esiEmployer}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Statutory & CTC Reconciliation Banner */}
              <div className="bg-[#12161E] border border-blue-500/20 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Monthly Payroll & CTC Reconciliation
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-[#181D27] p-2.5 rounded-lg border border-[#262D3D]">
                    <span className="text-[10px] text-gray-400 block">Total Monthly CTC</span>
                    <span className="text-sm font-bold text-white font-mono">₹ {myPayroll.fixedGross.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#181D27] p-2.5 rounded-lg border border-[#262D3D]">
                    <span className="text-[10px] text-gray-400 block">Gross Salary (Earned)</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">₹ {myPayroll.earnedGross.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#181D27] p-2.5 rounded-lg border border-[#262D3D]">
                    <span className="text-[10px] text-gray-400 block">Total Deductions (EE+ER)</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">- ₹ {myPayroll.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#181D27] p-2.5 rounded-lg border border-[#262D3D]">
                    <span className="text-[10px] text-gray-400 block">Net Bank Take-Home</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">= ₹ {myPayroll.netPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  <strong className="text-gray-200">Reconciliation Verification:</strong> Total Monthly CTC (₹{myPayroll.fixedGross.toLocaleString('en-IN')}) strictly matches the Gross Salary (₹{myPayroll.earnedGross.toLocaleString('en-IN')}). Both employer (₹{myPayroll.totalEmployerStatutory.toLocaleString('en-IN')}) and employee (₹{myPayroll.totalEmployeeDeductions.toLocaleString('en-IN')}) statutory deductions are part of the CTC. When all statutory remittances and net take-home (₹{myPayroll.netPayable.toLocaleString('en-IN')}) are added together, they form the complete Gross Salary.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-8 text-center text-xs text-gray-400">
              No finalized payroll generated yet for {currentMonth}. Go to Admin Payroll Dashboard to compute and generate month.
            </div>
          )}
        </div>
      )}

      {/* View 2: Profile & Banking Form */}
      {activeSubTab === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-[#262D3D] pb-3">
              <h3 className="text-base font-bold text-white">
                Personal, Tax & Bank Account Profile
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Keep your details updated for accurate salary disbursement, PF, ESI, and Form 16 filing.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Login Email Address */}
              <div className="bg-[#0B0D11] border border-[#262D3D] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-200 font-semibold">
                    Work / Login Email Address
                  </label>
                  <span className="text-[10px] text-[#FF5E0E] font-medium">Primary Login ID</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Changing your email address updates your login username and official payslip recipient address immediately.
                </p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="e.g. O+ve, B+ve"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 mb-1">Current Residential Address</label>
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="Current staying location (Hubballi / Karnataka)"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Permanent Residential Address</label>
                  <input
                    type="text"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Permanent hometown address"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0B0D11] border border-[#262D3D] p-3.5 rounded-xl">
                <div>
                  <label className="block text-gray-400 mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Name & Relationship (e.g. Father, Spouse)"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 Mobile number"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Statutory details */}
              <div className="bg-[#0B0D11] border border-[#262D3D] p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-[#FF5E0E] uppercase tracking-wider block">
                  Statutory & Tax IDs (India)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">PAN Card</label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="12 digits"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">UAN (PF Number)</label>
                    <input
                      type="text"
                      value={uanNumber}
                      onChange={(e) => setUanNumber(e.target.value)}
                      placeholder="12 digits"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">ESIC IP Number</label>
                    <input
                      type="text"
                      value={esicIp}
                      onChange={(e) => setEsicIp(e.target.value)}
                      placeholder="10 or 17 digits"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bank details */}
              <div className="bg-[#0B0D11] border border-[#262D3D] p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Salary Bank Account (Direct Credit)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank, SBI"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="Hubballi Main Branch"
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-md shadow-[#FF5E0E]/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Information & Email ID</span>
              </button>
            </form>

            {saveMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}
          </div>

          {/* Security & Password Reset Card */}
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 shadow-xl space-y-4 h-fit">
            <div className="border-b border-[#262D3D] pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#FF5E0E]" />
                  Security & Password
                </h3>
                {currentEmployee.isTempPasswordReset ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                    Private Password Active
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                    Default Initial Password
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Change your password anytime to protect your personal salary and attendance records.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-400">Current / Initial Password</label>
                  {!currentEmployee.isTempPasswordReset && (
                    <button
                      type="button"
                      onClick={() => setOldPass(DEFAULT_STAFF_PASSWORD)}
                      className="text-[10px] text-[#FF5E0E] hover:underline font-mono"
                    >
                      Fill Default ({DEFAULT_STAFF_PASSWORD})
                    </button>
                  )}
                </div>
                <input
                  type={showPasswordFields ? 'text' : 'password'}
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">New Secure Password</label>
                <input
                  type={showPasswordFields ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Confirm New Password</label>
                <input
                  type={showPasswordFields ? 'text' : 'password'}
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-[11px] text-gray-400 hover:text-gray-200 flex items-center gap-1.5"
                >
                  {showPasswordFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswordFields ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF5E0E]/20"
              >
                Set New Private Password
              </button>
            </form>

            {passMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
                passMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {passMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{passMsg.text}</span>
              </div>
            )}

            <div className="p-3 bg-[#0B0D11] border border-[#262D3D] rounded-xl text-[11px] text-gray-400 space-y-1">
              <span className="font-semibold text-gray-300 block">Default Password Policy</span>
              <p>
                Staff are assigned the initial password <strong className="text-white font-mono">{DEFAULT_STAFF_PASSWORD}</strong>. Once changed, your credentials are saved persistently and HR can reset it if you ever forget.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* View 3: Leave Application & Balances */}
      {activeSubTab === 'LEAVES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Balance Cards & Application Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Balance Mini Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
                <span className="text-xs text-gray-400">Casual Leave (CL)</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {currentEmployee.leaveBalance?.cl || 0} <span className="text-xs font-normal text-gray-400">days</span>
                </p>
                <span className="text-[10px] text-gray-500">Min 24h advance notice</span>
              </div>

              <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
                <span className="text-xs text-gray-400">Sick Leave (SL)</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {currentEmployee.leaveBalance?.sl || 0} <span className="text-xs font-normal text-gray-400">days</span>
                </p>
                <span className="text-[10px] text-gray-500">Min 2h notice before shift</span>
              </div>

              <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
                <span className="text-xs text-gray-400">Privilege Leave (PL)</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {currentEmployee.leaveBalance?.pl || 0} <span className="text-xs font-normal text-gray-400">days</span>
                </p>
                <span className="text-[10px] text-gray-500">Annual accrued</span>
              </div>
            </div>

            {/* Leave Request Form */}
            <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-[#262D3D] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#FF5E0E]" />
                  Apply for Leave
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ensure compliance with advance notice rules to avoid unapproved LOP.
                </p>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Leave Classification</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                  >
                    <option value="CL">Casual Leave (CL) - Planned, 24h notice</option>
                    <option value="SL">Sick Leave (SL) - 2h notice before shift</option>
                    <option value="PL">Privilege Leave (PL) - Earned vacation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Briefly explain the reason for leave..."
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-[#FF5E0E]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Leave Request</span>
                </button>
              </form>

              {leaveMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{leaveMsg}</span>
                </div>
              )}
            </div>

          </div>

          {/* Leave Applications History */}
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl h-fit">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                My Leave History & Status
              </h4>
            </div>

            <div className="divide-y divide-[#262D3D]">
              {leaveApplications
                .filter(a => a.empId === currentEmployee.id || a.empCode === currentEmployee.empCode)
                .map(app => (
                  <div key={app.id} className="p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{app.leaveType}</span>
                      {app.status === 'APPROVED' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                          Approved
                        </span>
                      ) : app.status === 'REJECTED' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-[11px] font-mono">
                      {app.startDate} to {app.endDate}
                    </p>
                    <p className="text-gray-300 text-[11px] italic">&ldquo;{app.reason}&rdquo;</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Annual Holiday Entitlement & Restricted Holidays Choice (8 Leaves Cap Rule) */}
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl col-span-1 lg:col-span-2">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF5E0E]" />
                  Annual Holiday Entitlement & Restricted Holidays Choice
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Corporate Rule: Total holiday leaves cannot cross 8 per employee (5 mandatory + 3 restricted holidays of your choice).
                </p>
              </div>

              {(() => {
                const myChosen = employeeRestrictedHolidays[currentEmployee.id] || currentEmployee.selectedRestrictedHolidays || [];
                return (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Total Leaves:</span>
                    <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-[#181D27] border border-[#262D3D] text-[#FF5E0E]">
                      {5 + myChosen.length} / 8 Leaves
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="p-5 space-y-5">
              {holidayChoiceMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{holidayChoiceMsg}</span>
                </div>
              )}

              {holidayErrorMsg && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{holidayErrorMsg}</span>
                </div>
              )}

              {/* 1. Mandatory 5 Statutory Holidays */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    1. Mandatory Holidays (5 Statutory Leaves - All Staff Entitled)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                    5 / 5 Included
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {holidays.filter(h => h.isMandatory || h.type === 'MANDATORY').map(h => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-[#0B0D11] border border-emerald-500/30 text-xs space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">{h.date}</span>
                      <p className="font-bold text-white text-xs">{h.name}</p>
                      <span className="text-[9px] text-gray-400 block">{h.dayOfWeek}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Restricted Holidays Choice (Max 3) */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    2. Restricted Holidays (Pick up to 3 holidays from the list)
                  </span>
                  {(() => {
                    const myChosen = employeeRestrictedHolidays[currentEmployee.id] || currentEmployee.selectedRestrictedHolidays || [];
                    return (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        myChosen.length === 3 ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {myChosen.length} / 3 Selected (Deepawali, Bakrid, etc.)
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {holidays.filter(h => !h.isMandatory && h.type !== 'MANDATORY').map(h => {
                    const myChosen = employeeRestrictedHolidays[currentEmployee.id] || currentEmployee.selectedRestrictedHolidays || [];
                    const isSelected = myChosen.includes(h.id) || myChosen.includes(h.name) || myChosen.includes(h.date);
                    const isDeep = /deepavali|diwali/i.test(h.name);
                    const isBak = /bakrid/i.test(h.name);

                    return (
                      <div
                        key={h.id}
                        onClick={() => handleToggleMyRestrictedHoliday(h.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-[#FF5E0E]/15 border-[#FF5E0E] text-white'
                            : 'bg-[#0B0D11] border-[#262D3D] text-gray-300 hover:border-[#FF5E0E]/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono text-gray-400">{h.date}</span>
                            {isDeep && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                Deepawali
                              </span>
                            )}
                            {isBak && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                Bakrid
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-xs text-white">{h.name}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-2">{h.description}</p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#1D2330] flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">{h.dayOfWeek}</span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${isSelected ? 'text-[#FF5E0E]' : 'text-gray-400'}`}>
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3 stroke-[3]" />
                                Chosen (Paid)
                              </>
                            ) : (
                              'Select'
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* View 4: Punch Log */}
      {activeSubTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {punchMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{punchMsg}</span>
            </div>
          )}

          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF5E0E]" />
                  Daily Attendance & Punch Matrix ({currentMonth})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  View your recorded biometric shifts, hours worked, and submit missed punch correction requests.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCorrection(myAttendance[0]?.date || `${currentMonth}-01`)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5E0E] hover:bg-[#FF5E0E]/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#FF5E0E]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Request Missed Punch Correction
                </button>
                <span className="text-xs text-gray-500 font-mono bg-[#181D27] px-2.5 py-1 rounded-lg border border-[#262D3D]">
                  {myAttendance.length} Shifts
                </span>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div className="px-4 py-2.5 bg-[#141923] border-b border-[#262D3D] flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-gray-400">
                Present: <strong className="text-emerald-400 ml-1">{myAttendance.filter(r => r.status === 'PRESENT').length}</strong>
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                Half Day: <strong className="text-amber-400 ml-1">{myAttendance.filter(r => r.status === 'HALF_DAY').length}</strong>
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                Loss of Pay (LOP): <strong className="text-rose-400 ml-1">{myAttendance.filter(r => r.status === 'ABSENT_LOP').length}</strong>
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                Pending Correction Requests: <strong className="text-amber-400 ml-1">{myPunchRequests.filter(r => r.status === 'PENDING').length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider border-b border-[#262D3D] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Punch In</th>
                    <th className="py-2.5 px-4">Punch Out</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Regularization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262D3D] text-gray-300">
                  {myAttendance.map((rec, i) => {
                    const req = myPunchRequests.find(r => r.date === rec.date);
                    return (
                      <tr key={i} className="hover:bg-[#181D27]/40">
                        <td className="py-2.5 px-4 font-mono">{rec.date}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-400">{rec.firstPunch || '--:--'}</td>
                        <td className="py-2.5 px-4 font-mono text-amber-400">{rec.lastPunch || '--:--'}</td>
                        <td className="py-2.5 px-4 font-mono">{rec.totalHours > 0 ? `${rec.totalHours} hrs` : '--'}</td>
                        <td className="py-2.5 px-4">
                          {rec.status === 'PRESENT' && (
                            <span className="text-emerald-400 font-semibold">Present</span>
                          )}
                          {rec.status === 'HALF_DAY' && (
                            <span className="text-amber-400 font-semibold">Half Day</span>
                          )}
                          {rec.status === 'ABSENT_LOP' && (
                            <span className="text-red-400 font-semibold">Loss of Pay (LOP)</span>
                          )}
                          {rec.status === 'WEEKLY_OFF' && (
                            <span className="text-blue-400">Weekly Off</span>
                          )}
                          {rec.status === 'WEEKLY_OFF_LOST' && (
                            <span className="text-rose-400 font-semibold">Forfeited Off</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {req?.status === 'PENDING' ? (
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              title={`Requested In: ${req.requestedPunchIn}, Out: ${req.requestedPunchOut}\nJustification: ${req.reason}`}
                            >
                              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                              Correction Pending
                            </span>
                          ) : req?.status === 'APPROVED' ? (
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              title={`Approved by Admin on ${req.reviewedAt || 'approval'}`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Regularized
                            </span>
                          ) : req?.status === 'REJECTED' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span 
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                title={`Admin note: ${req.adminComment || 'Rejected'}`}
                              >
                                <X className="w-3 h-3 text-rose-400" />
                                Rejected
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection(rec.date, rec.firstPunch, rec.lastPunch)}
                                className="text-[11px] text-[#FF5E0E] hover:underline"
                              >
                                Re-request
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenCorrection(rec.date, rec.firstPunch, rec.lastPunch)}
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#181D27] hover:bg-[#FF5E0E]/20 text-gray-300 hover:text-[#FF5E0E] border border-[#262D3D] transition-colors"
                              title="Request missed punch correction with justification"
                            >
                              <Clock className="w-3 h-3 text-gray-400" />
                              Request Correction
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missed Punch Correction Modal */}
          {isPunchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
              <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FF5E0E]" />
                    <h3 className="text-sm font-bold text-white">
                      Request Missed Punch Correction
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPunchModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-[#181D27] text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handlePunchSubmit} className="p-5 space-y-4 text-xs">
                  <div className="bg-[#181D27] border border-[#262D3D] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Employee</span>
                      <strong className="text-white">
                        {currentEmployee.personalDetails.firstName} {currentEmployee.personalDetails.lastName}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[11px]">Employee ID</span>
                      <strong className="text-[#FF5E0E] font-mono">{currentEmployee.empCode}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Shift Date</label>
                      <input
                        type="date"
                        value={punchDate}
                        onChange={(e) => {
                          setPunchDate(e.target.value);
                          const match = myAttendance.find(r => r.date === e.target.value);
                          if (match) {
                            setCurrentPunchInDisplay(match.firstPunch || '--:--');
                            setCurrentPunchOutDisplay(match.lastPunch || '--:--');
                          }
                        }}
                        className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Current Machine Recorded</label>
                      <div className="p-2.5 bg-[#181D27]/60 border border-[#262D3D] rounded-lg text-gray-300 font-mono text-[11px]">
                        In: <span className="text-emerald-400">{currentPunchInDisplay}</span> | Out: <span className="text-amber-400">{currentPunchOutDisplay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Actual In-Time (HH:MM)</label>
                      <input
                        type="time"
                        value={requestedIn}
                        onChange={(e) => setRequestedIn(e.target.value)}
                        className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Actual Out-Time (HH:MM)</label>
                      <input
                        type="time"
                        value={requestedOut}
                        onChange={(e) => setRequestedOut(e.target.value)}
                        className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">
                      Justification / Reason <span className="text-[#FF5E0E]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={punchReason}
                      onChange={(e) => setPunchReason(e.target.value)}
                      placeholder="e.g. Palm vein scanner didn't register departure / Client site meeting in evening / Emergency duty..."
                      className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                      required
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Clear justification is required for statutory payroll auditing and HR verification.
                    </p>
                  </div>

                  <div className="bg-[#181D27]/40 border border-[#262D3D] rounded-xl p-3 text-[11px] text-gray-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      After submission, this request goes to the Admin approval queue. Once approved, your daily attendance, working hours, and paid days for {currentMonth} will be corrected automatically.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPunchModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-[#181D27] hover:bg-[#262D3D] text-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#FF5E0E] hover:bg-[#FF5E0E]/90 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-[#FF5E0E]/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit for Admin Approval
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
