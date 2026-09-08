import React, { useState } from 'react';
import { Employee } from '../types/payroll';
import { 
  UserPlus, 
  Mail, 
  Copy, 
  Check, 
  Shield, 
  Briefcase, 
  DollarSign, 
  Edit3, 
  ExternalLink,
  UserCheck,
  Building,
  KeyRound,
  X,
  UserMinus,
  Trash2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface EmployeeOnboardingManagerProps {
  employees: Employee[];
  onInviteEmployee: (email: string) => { employee: Employee; inviteUrl: string; tempPass: string };
  onUpdateEmployeeDetails: (empId: string, updated: Partial<Employee>) => void;
  onSimulateOnboardComplete?: (empId: string) => void;
  onDeleteEmployee?: (empId: string) => void;
  onOpenCandidateOnboard?: (emp: Employee) => void;
  onOpenCredentialsModal?: () => void;
}

export const EmployeeOnboardingManager: React.FC<EmployeeOnboardingManagerProps> = ({
  employees,
  onInviteEmployee,
  onUpdateEmployeeDetails,
  onDeleteEmployee,
  onOpenCandidateOnboard,
  onOpenCredentialsModal
}) => {
  const [newEmail, setNewEmail] = useState<string>('');
  const [inviteResult, setInviteResult] = useState<{ employee: Employee; inviteUrl: string; tempPass: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCreds, setCopiedCreds] = useState<boolean>(false);

  // Admin Salary Setup Modal
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'INTERN' | 'PROBATION' | 'CONTRACTOR'>('FULL_TIME');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [doj, setDoj] = useState<string>('2025-04-01');
  const [probationMonths, setProbationMonths] = useState<number>(6);
  const [isPermanent, setIsPermanent] = useState<boolean>(true);
  const [monthlyGross, setMonthlyGross] = useState<number>(25000);
  const [basicSalary, setBasicSalary] = useState<number>(12500);
  const [hraSalary, setHraSalary] = useState<number>(1292);
  const [conveyanceSalary, setConveyanceSalary] = useState<number>(904);
  const [medicalSalary, setMedicalSalary] = useState<number>(1033);
  const [ltaSalary, setLtaSalary] = useState<number>(1550);
  const [specialSalary, setSpecialSalary] = useState<number>(4721);
  const [isPfEligible, setIsPfEligible] = useState<boolean>(true);
  const [isEsiEligible, setIsEsiEligible] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<'ALL' | 'ACTIVE' | 'RESIGNED' | 'INTERN'>('ALL');

  // Resignation Modal State
  const [resigningEmp, setResigningEmp] = useState<Employee | null>(null);
  const [resignationDate, setResignationDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [lastWorkingDate, setLastWorkingDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [resignationRemarks, setResignationRemarks] = useState<string>('Personal reasons / career transition');

  // Delete Confirmation Modal State
  const [deletingEmp, setDeletingEmp] = useState<Employee | null>(null);

  const handleOpenResign = (emp: Employee) => {
    setResigningEmp(emp);
    setResignationDate(emp.employmentDetails?.resignationDate || new Date().toISOString().substring(0, 10));
    setLastWorkingDate(emp.employmentDetails?.lastWorkingDate || new Date().toISOString().substring(0, 10));
    setResignationRemarks(emp.employmentDetails?.resignationRemarks || 'Personal reasons / career transition');
  };

  const handleSaveResignation = () => {
    if (!resigningEmp) return;
    onUpdateEmployeeDetails(resigningEmp.id, {
      status: 'RESIGNED',
      employmentDetails: {
        ...resigningEmp.employmentDetails,
        resignationDate,
        lastWorkingDate,
        resignationRemarks
      }
    });
    setResigningEmp(null);
  };

  const handleReinstate = (emp: Employee) => {
    onUpdateEmployeeDetails(emp.id, {
      status: 'ACTIVE',
      employmentDetails: {
        ...emp.employmentDetails,
        resignationDate: undefined,
        lastWorkingDate: undefined,
        resignationRemarks: undefined
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingEmp) return;
    onDeleteEmployee?.(deletingEmp.id);
    setDeletingEmp(null);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    const res = onInviteEmployee(newEmail.trim());
    setInviteResult(res);
    setNewEmail('');
  };

  const handleCopyLink = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult.inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCreds = () => {
    if (!inviteResult) return;
    const text = `RIVOT Motors HRMS Login:\nPortal: ${inviteResult.inviteUrl}\nUsername: ${inviteResult.employee.email}\nTemp Password: ${inviteResult.tempPass}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const handleOpenSalaryEdit = (emp: Employee) => {
    setEditingEmp(emp);
    const d = emp.employmentDetails;
    const isIntern = d.employmentType === 'INTERN' || /intern/i.test(d.designation || '');
    setEmploymentType(isIntern ? 'INTERN' : (d.employmentType || 'FULL_TIME'));
    setDesignation(d.designation || (isIntern ? 'Engineering Intern' : 'Staff Engineer'));
    setDepartment(d.department || 'R&D EV Engineering');
    setDoj(d.dateOfJoining || '2025-04-01');
    setProbationMonths(d.probationMonths || 6);
    setIsPermanent(d.isPermanent);
    const gross = d.monthlyGross || (isIntern ? 12000 : 25000);
    setMonthlyGross(gross);

    if (isIntern) {
      setBasicSalary(d.basic || gross);
      setHraSalary(0);
      setConveyanceSalary(0);
      setMedicalSalary(0);
      setLtaSalary(0);
      setSpecialSalary(0);
      setIsPfEligible(false);
      setIsEsiEligible(false);
    } else {
      setBasicSalary(d.basic !== undefined ? d.basic : Math.round(gross * 0.50));
      setHraSalary(d.hra !== undefined ? d.hra : Math.round(gross * 0.05168));
      setConveyanceSalary(d.conveyance !== undefined ? d.conveyance : Math.round(gross * 0.03616));
      setMedicalSalary(d.medicalAllowance !== undefined ? d.medicalAllowance : Math.round(gross * 0.04132));
      setLtaSalary(d.lta !== undefined ? d.lta : Math.round(gross * 0.062));
      const allocated = (d.basic || Math.round(gross * 0.50)) + 
                        (d.hra || Math.round(gross * 0.05168)) + 
                        (d.conveyance || Math.round(gross * 0.03616)) + 
                        (d.medicalAllowance || Math.round(gross * 0.04132)) + 
                        (d.lta || Math.round(gross * 0.062));
      setSpecialSalary(d.specialAllowance !== undefined ? d.specialAllowance : Math.max(0, gross - allocated));
      setIsPfEligible(d.isPfEligible !== false);
      setIsEsiEligible(d.isEsiEligible !== undefined ? d.isEsiEligible : gross <= 21000);
    }
  };

  const calculateStatutoryBreakup = (val: number, type: 'FULL_TIME' | 'INTERN' | 'PROBATION' | 'CONTRACTOR') => {
    setMonthlyGross(val);
    if (type === 'INTERN') {
      setBasicSalary(val);
      setHraSalary(0);
      setConveyanceSalary(0);
      setMedicalSalary(0);
      setLtaSalary(0);
      setSpecialSalary(0);
      setIsPfEligible(false);
      setIsEsiEligible(false);
    } else {
      // Official RIVOT Master Breakup percentages
      const basic = Math.round(val * 0.50);
      const hra = Math.round(val * 0.05168);
      const conv = Math.round(val * 0.03616);
      const medical = Math.round(val * 0.04132);
      const lta = Math.round(val * 0.062);
      const special = Math.max(0, val - (basic + hra + conv + medical + lta));
      setBasicSalary(basic);
      setHraSalary(hra);
      setConveyanceSalary(conv);
      setMedicalSalary(medical);
      setLtaSalary(lta);
      setSpecialSalary(special);
      setIsPfEligible(true);
      setIsEsiEligible(val <= 21000);
    }
  };

  const handleGrossChange = (val: number) => {
    calculateStatutoryBreakup(val, employmentType);
  };

  const handleTypeChange = (newType: 'FULL_TIME' | 'INTERN' | 'PROBATION' | 'CONTRACTOR') => {
    setEmploymentType(newType);
    calculateStatutoryBreakup(monthlyGross, newType);
  };

  const handleSaveSalary = () => {
    if (!editingEmp) return;
    onUpdateEmployeeDetails(editingEmp.id, {
      status: 'ACTIVE',
      employmentDetails: {
        employmentType,
        designation,
        department,
        dateOfJoining: doj,
        probationMonths,
        isPermanent: employmentType === 'FULL_TIME' ? isPermanent : false,
        ctcAnnual: monthlyGross * 12,
        monthlyGross,
        basic: basicSalary,
        hra: hraSalary,
        conveyance: conveyanceSalary,
        medicalAllowance: medicalSalary,
        lta: ltaSalary,
        specialAllowance: specialSalary,
        isPfEligible,
        isEsiEligible,
        isPtEligible: monthlyGross >= 15000
      }
    });
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Fast Email Invitation */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/15 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Fast Employee Onboarding
              </span>
              <span className="text-xs text-gray-400">
                Email becomes username • Automated temp credentials
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Instant Staff Onboarding & Compensation Setup
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Simply enter the employee&apos;s email. The system generates an onboarding link and temporary password. 
              The employee logs in, resets their password, and completes personal, banking, PAN, and UAN details. 
              Once submitted, HR configures the salary and CTC structure.
            </p>
          </div>

          {/* Add Employee Form */}
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="employee@rivotmotors.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Send Invite</span>
            </button>
          </form>
        </div>

        {/* Invite Generated Card */}
        {inviteResult && (
          <div className="mt-6 p-4 rounded-xl bg-[#0B0D11] border border-[#FF5E0E]/40 text-xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Onboarding Link & Temp Password Generated for {inviteResult.employee.email}
              </span>
              <button
                onClick={() => setInviteResult(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#12161E] p-3 rounded-lg border border-[#262D3D]">
              <div>
                <span className="text-gray-400 text-[11px]">System Username:</span>
                <p className="font-mono text-white font-semibold">{inviteResult.employee.email}</p>
                <span className="text-gray-400 text-[11px] mt-2 block">Temporary Password:</span>
                <p className="font-mono text-[#FF5E0E] font-bold text-sm">{inviteResult.tempPass}</p>
              </div>

              <div>
                <span className="text-gray-400 text-[11px]">Onboarding URL:</span>
                <p className="font-mono text-gray-300 text-[11px] truncate">{inviteResult.inviteUrl}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 px-2.5 py-1 rounded text-xs"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleCopyCreds}
                    className="flex items-center gap-1 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-2.5 py-1 rounded text-xs font-semibold"
                  >
                    {copiedCreds ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCreds ? 'Copied All' : 'Copy All Credentials'}</span>
                  </button>
                  <button
                    onClick={() => onOpenCandidateOnboard?.(inviteResult.employee)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    title="Open the real candidate onboarding wizard to test employee registration"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open / Test Candidate Onboarding Form</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employees Directory Table */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#FF5E0E]" />
            <h3 className="text-sm font-bold text-white">Active Staff Directory & Compensation Master</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Filter */}
            <div className="flex bg-[#181D27] p-1 rounded-xl border border-[#262D3D] text-[11px]">
              <button
                onClick={() => setFilterRole('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterRole === 'ALL' ? 'bg-[#FF5E0E] text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({employees.length})
              </button>
              <button
                onClick={() => setFilterRole('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterRole === 'ACTIVE' ? 'bg-[#FF5E0E] text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Active ({employees.filter(e => e.status !== 'RESIGNED' && e.status !== 'EXITED').length})
              </button>
              <button
                onClick={() => setFilterRole('RESIGNED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterRole === 'RESIGNED' ? 'bg-rose-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Resigned ({employees.filter(e => e.status === 'RESIGNED' || e.status === 'EXITED').length})
              </button>
              <button
                onClick={() => setFilterRole('INTERN')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterRole === 'INTERN' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Interns ({employees.filter(e => e.employmentDetails.employmentType === 'INTERN' || /intern/i.test(e.employmentDetails.designation || '')).length})
              </button>
            </div>

            {/* Share Staff Passwords Button */}
            {onOpenCredentialsModal && (
              <button
                onClick={onOpenCredentialsModal}
                className="flex items-center gap-1.5 bg-[#FF5E0E]/15 hover:bg-[#FF5E0E]/25 border border-[#FF5E0E]/40 text-[#FF5E0E] text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm shrink-0"
                title="View and copy initial default passwords & staff login credentials"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Share Staff Passwords</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider border-b border-[#262D3D]">
              <tr>
                <th className="py-3 px-4">Code / Email</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">DOJ / Status</th>
                <th className="py-3 px-4">Monthly Gross</th>
                <th className="py-3 px-4">PF / Med / LTA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D3D] text-gray-300">
              {employees
                .filter(emp => {
                  const isIntern = emp.employmentDetails.employmentType === 'INTERN' || /intern/i.test(emp.employmentDetails.designation || '');
                  const isResigned = emp.status === 'RESIGNED' || emp.status === 'EXITED';
                  if (filterRole === 'ACTIVE') return !isResigned;
                  if (filterRole === 'RESIGNED') return isResigned;
                  if (filterRole === 'INTERN') return isIntern;
                  return true;
                })
                .map(emp => {
                  const isIntern = emp.employmentDetails.employmentType === 'INTERN' || /intern/i.test(emp.employmentDetails.designation || '');
                  const isProbation = !emp.employmentDetails.isPermanent && !isIntern;
                  const isResigned = emp.status === 'RESIGNED' || emp.status === 'EXITED';
                  const isOnboarding = emp.status === 'ONBOARDING';
                  const name = `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.trim();
                  const basic = emp.employmentDetails.basic || Math.round(emp.employmentDetails.monthlyGross * 0.5);
                  const pf = emp.employmentDetails.isPfEligible !== false && !isIntern 
                    ? Math.round(Math.min(basic, 15000) * 0.12)
                    : 0;

                  return (
                    <tr 
                      key={emp.id} 
                      className={isResigned ? "bg-rose-950/15 hover:bg-rose-950/25 transition-colors" : "hover:bg-[#181D27]/50 transition-colors"}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#FF5E0E]">{emp.empCode}</div>
                        <div className="text-[11px] text-gray-400">{emp.email}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {name ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{name}</span>
                            {isResigned && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                                Resigned
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenCandidateOnboard?.(emp)}
                            className="text-amber-400 hover:text-amber-300 italic font-medium flex items-center gap-1"
                          >
                            <span>Pending Onboarding Form</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{emp.employmentDetails.designation || 'Staff'}</div>
                        <div className="text-[10px] text-gray-400">{emp.employmentDetails.department || 'Operations'}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isIntern ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            Internship
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Full-Time
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-gray-400 text-[11px]">{emp.employmentDetails.dateOfJoining}</div>
                        {isResigned ? (
                          <span className="text-[10px] text-rose-400 font-semibold block">
                            LWD: {emp.employmentDetails.lastWorkingDate || 'Resigned'}
                          </span>
                        ) : isIntern ? (
                          <span className="text-[10px] text-indigo-400">Stipend Track</span>
                        ) : isProbation ? (
                          <span className="text-[10px] text-amber-400">Probation ({emp.employmentDetails.probationMonths}m)</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400">Permanent</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        ₹ {(emp.employmentDetails.monthlyGross || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        {isIntern ? (
                          <span className="text-gray-400">Stipend (Exempt)</span>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="text-emerald-400">PF: ₹{pf.toLocaleString('en-IN')}</div>
                            <div className="text-gray-400">Med: ₹{(emp.employmentDetails.medicalAllowance || 0).toLocaleString('en-IN')} | LTA: ₹{(emp.employmentDetails.lta || 0).toLocaleString('en-IN')}</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Complete Candidate Form Button if onboarding */}
                          {isOnboarding && (
                            <button
                              onClick={() => onOpenCandidateOnboard?.(emp)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-white px-2 py-1.5 rounded-lg bg-[#181D27] hover:bg-amber-500/20 border border-[#262D3D] transition-colors"
                              title="Complete Candidate Onboarding"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Form</span>
                            </button>
                          )}

                          {/* Salary & Role */}
                          <button
                            onClick={() => handleOpenSalaryEdit(emp)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#FF5E0E] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181D27] hover:bg-[#FF5E0E]/20 border border-[#262D3D] hover:border-[#FF5E0E]/40 transition-colors"
                            title="Configure Salary, CTC & Designation"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Salary & Role</span>
                          </button>

                          {/* Mark Resigned / Reinstate */}
                          {isResigned ? (
                            <button
                              onClick={() => handleReinstate(emp)}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181D27] hover:bg-emerald-600/30 border border-[#262D3D] transition-colors"
                              title="Reinstate this employee to Active status"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reinstate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenResign(emp)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181D27] hover:bg-amber-600/30 border border-[#262D3D] transition-colors"
                              title="Mark Employee as Resigned so they are excluded from monthly payroll"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Resign</span>
                            </button>
                          )}

                          {/* Delete Employee */}
                          <button
                            onClick={() => setDeletingEmp(emp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Salary Configuration Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#FF5E0E]" />
                  Configure Salary & Employment Details
                </h3>
                <p className="text-xs text-gray-400">
                  {editingEmp.personalDetails.firstName || editingEmp.email} ({editingEmp.empCode})
                </p>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Employment Type / Track</label>
                  <select
                    value={employmentType}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="FULL_TIME">Full-Time Employee</option>
                    <option value="INTERN">Internship Track (Stipend)</option>
                    <option value="PROBATION">Probationary Staff</option>
                    <option value="CONTRACTOR">Fixed Term Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={doj}
                    onChange={(e) => setDoj(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Probation / Training (Months)</label>
                  <input
                    type="number"
                    value={probationMonths}
                    onChange={(e) => setProbationMonths(parseInt(e.target.value) || 6)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Salary Structure */}
              <div className="bg-[#0B0D11] border border-[#262D3D] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF5E0E] uppercase tracking-wider block">
                    {employmentType === 'INTERN' ? 'Monthly Stipend Plan' : 'Monthly Statutory Salary Breakdown'}
                  </span>
                  {employmentType !== 'INTERN' && (
                    <button
                      type="button"
                      onClick={() => calculateStatutoryBreakup(monthlyGross, 'FULL_TIME')}
                      className="text-[10px] bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/40 text-[#FF5E0E] px-2 py-0.5 rounded font-semibold transition-colors"
                    >
                      Auto-Apply RIVOT % Formula
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">
                    {employmentType === 'INTERN' ? 'Monthly Stipend (INR)' : 'Monthly Gross Salary (INR)'}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={monthlyGross}
                    onChange={(e) => handleGrossChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono text-sm font-bold"
                  />
                </div>

                {employmentType === 'INTERN' ? (
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                    Interns receive a fixed monthly stipend of ₹{monthlyGross.toLocaleString('en-IN')}. Statutory EPF, ESIC, and corporate allowances (HRA/Medical/LTA) are waived under standard internship regulations.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-gray-400 mb-1">Basic (50% of Gross)</label>
                        <input
                          type="number"
                          value={basicSalary}
                          onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">HRA (5.168%)</label>
                        <input
                          type="number"
                          value={hraSalary}
                          onChange={(e) => setHraSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Conveyance / Transport</label>
                        <input
                          type="number"
                          value={conveyanceSalary}
                          onChange={(e) => setConveyanceSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Medical Allowance (4.132%)</label>
                        <input
                          type="number"
                          value={medicalSalary}
                          onChange={(e) => setMedicalSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">LTA Allowance (6.2%)</label>
                        <input
                          type="number"
                          value={ltaSalary}
                          onChange={(e) => setLtaSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Special Allowance</label>
                        <input
                          type="number"
                          value={specialSalary}
                          onChange={(e) => setSpecialSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Statutory PF & ESI Toggles */}
                    <div className="pt-2 border-t border-[#262D3D] grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-[#181D27] p-2 rounded-lg border border-[#262D3D]">
                        <input
                          type="checkbox"
                          checked={isPfEligible}
                          onChange={(e) => setIsPfEligible(e.target.checked)}
                          className="w-4 h-4 accent-[#FF5E0E]"
                        />
                        <div>
                          <span className="text-white font-medium block">EPF Deduction (12%)</span>
                          <span className="text-[10px] text-gray-400">Statutory 12% on Basic (cap ₹15k)</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-[#181D27] p-2 rounded-lg border border-[#262D3D]">
                        <input
                          type="checkbox"
                          checked={isEsiEligible}
                          onChange={(e) => setIsEsiEligible(e.target.checked)}
                          className="w-4 h-4 accent-[#FF5E0E]"
                        />
                        <div>
                          <span className="text-white font-medium block">ESIC Applicable (0.75%)</span>
                          <span className="text-[10px] text-gray-400">For gross wages ≤ ₹21,000</span>
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </div>

            </div>

            <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingEmp(null)}
                className="bg-[#181D27] hover:bg-[#202734] text-gray-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSalary}
                className="bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1"
              >
                <span>Save Compensation Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resignation / Exit Management Modal */}
      {resigningEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Mark Employee as Resigned</h3>
              </div>
              <button
                onClick={() => setResigningEmp(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
                <p className="font-semibold text-white">
                  {resigningEmp.personalDetails.firstName || resigningEmp.email} ({resigningEmp.empCode})
                </p>
                <p className="text-[11px] text-amber-300 mt-1">
                  Resigned employees are automatically excluded from payroll generation after their Last Working Date.
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Resignation Submission Date</label>
                <input
                  type="date"
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Last Working Date (LWD)</label>
                <input
                  type="date"
                  value={lastWorkingDate}
                  onChange={(e) => setLastWorkingDate(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Attendance and payroll will strictly ignore this employee in payroll cycles following this month.
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Resignation Remarks / Reason</label>
                <input
                  type="text"
                  value={resignationRemarks}
                  onChange={(e) => setResignationRemarks(e.target.value)}
                  placeholder="e.g. Higher education, Relocation, New opportunity"
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-end gap-2">
              <button
                onClick={() => setResigningEmp(null)}
                className="bg-[#181D27] hover:bg-[#202734] text-gray-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResignation}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Confirm Resignation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Confirmation Modal */}
      {deletingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-rose-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">Delete Employee Record</h3>
              </div>
              <button
                onClick={() => setDeletingEmp(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <p className="text-gray-300">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white">
                  {deletingEmp.personalDetails.firstName || deletingEmp.email} ({deletingEmp.empCode})
                </strong>{' '}
                from the staff directory?
              </p>
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px]">
                This will remove the employee profile and historical records from active management calculations.
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingEmp(null)}
                className="bg-[#181D27] hover:bg-[#202734] text-gray-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Employee</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
