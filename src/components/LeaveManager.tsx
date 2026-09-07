import React, { useState } from 'react';
import { Employee, LeaveApplication } from '../types/payroll';
import { 
  Calendar, 
  Plus, 
  Minus, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  UserCheck,
  Award
} from 'lucide-react';

interface LeaveManagerProps {
  currentMonth: string;
  employees: Employee[];
  leaveApplications: LeaveApplication[];
  onUpdateLeaveBalance: (empId: string, category: 'cl' | 'sl' | 'pl', delta: number, reason: string) => void;
  onAutoCreditMonthlyLeaves: () => { creditedCount: number; skippedCount: number };
  onReviewLeaveApplication: (appId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => void;
  onApplyLeave?: (application: Partial<LeaveApplication>) => void;
}

export const LeaveManager: React.FC<LeaveManagerProps> = ({
  currentMonth,
  employees,
  leaveApplications,
  onUpdateLeaveBalance,
  onAutoCreditMonthlyLeaves,
  onReviewLeaveApplication
}) => {
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'APPLICATIONS'>('BALANCES');
  const [creditAlert, setCreditAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [adjustModalEmp, setAdjustModalEmp] = useState<Employee | null>(null);
  const [adjustCategory, setAdjustCategory] = useState<'cl' | 'sl' | 'pl'>('cl');
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const handleTriggerAutoCredit = () => {
    const res = onAutoCreditMonthlyLeaves();
    setCreditAlert({
      message: `Proportionate leaves automatically credited for ${res.creditedCount} permanent staff for ${currentMonth}. (${res.skippedCount} staff skipped due to active probation period).`,
      type: 'success'
    });
    setTimeout(() => setCreditAlert(null), 6000);
  };

  const handleOpenAdjust = (emp: Employee, cat: 'cl' | 'sl' | 'pl') => {
    setAdjustModalEmp(emp);
    setAdjustCategory(cat);
    setAdjustDelta(1);
    setAdjustReason('Annual adjustment / manager discretion');
  };

  const handleConfirmAdjust = (type: 'ADD' | 'DEDUCT') => {
    if (!adjustModalEmp) return;
    const finalDelta = type === 'ADD' ? Math.abs(adjustDelta) : -Math.abs(adjustDelta);
    onUpdateLeaveBalance(adjustModalEmp.id, adjustCategory, finalDelta, adjustReason);
    setAdjustModalEmp(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Auto-Credit Action */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/15 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Automated Accrual Engine
              </span>
              <span className="text-xs text-gray-400">
                18 Annual Leaves (Jan - Dec Proportional = 1.5/mo)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Leave Quota, Auto-Credit & Approval Governance
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Leaves are credited proportionately each month (0.5 CL, 0.5 SL, 0.5 PL). 
              Per company policy, leaves are exclusively credited to <strong>permanent employees after probation completion</strong>. 
              Planned leaves require &ge; 24h notice; sick leaves require &ge; 2h advance notice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerAutoCredit}
              className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
              title="Add 1.5 proportionate leaves to all eligible non-probationary staff for this month"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Credit Leaves ({currentMonth})</span>
            </button>
          </div>
        </div>

        {creditAlert && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{creditAlert.message}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#262D3D] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BALANCES')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'BALANCES'
                ? 'bg-[#FF5E0E] text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Staff Leave Quotas & Adjustments</span>
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all relative ${
              activeTab === 'APPLICATIONS'
                ? 'bg-[#FF5E0E] text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#12161E] border border-[#262D3D]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Leave Applications Queue</span>
            {leaveApplications.filter(a => a.status === 'PENDING').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Staff Leave Balances */}
      {activeTab === 'BALANCES' && (
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Staff Leave Balance Register</h3>
              <span className="text-xs text-gray-500">CL = Casual, SL = Sick, PL = Privilege/Earned</span>
            </div>
            <span className="text-xs text-[#FF5E0E] font-medium">
              Admin Discretion Controls Enabled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider border-b border-[#262D3D]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Employment Status</th>
                  <th className="py-3 px-4">Date of Joining</th>
                  <th className="py-3 px-4">Casual Leave (CL)</th>
                  <th className="py-3 px-4">Sick Leave (SL)</th>
                  <th className="py-3 px-4">Privilege Leave (PL)</th>
                  <th className="py-3 px-4">Total Balance</th>
                  <th className="py-3 px-4 text-right">Admin Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262D3D] text-gray-300">
                {employees.map(emp => {
                  const isProbation = !emp.employmentDetails.isPermanent;
                  const totalLeaves = (emp.leaveBalance?.cl || 0) + (emp.leaveBalance?.sl || 0) + (emp.leaveBalance?.pl || 0);

                  return (
                    <tr key={emp.id} className="hover:bg-[#181D27]/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {emp.personalDetails.firstName} {emp.personalDetails.lastName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {emp.empCode} • {emp.employmentDetails.designation}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isProbation ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                            On Probation (Ineligible)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            Permanent (Active Accrual)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-400">
                        {emp.employmentDetails.dateOfJoining}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white text-sm">
                          {emp.leaveBalance?.cl || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">days</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white text-sm">
                          {emp.leaveBalance?.sl || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">days</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white text-sm">
                          {emp.leaveBalance?.pl || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">days</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-[#FF5E0E] text-sm">
                        {totalLeaves} days
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAdjust(emp, 'cl')}
                            className="px-2 py-1 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-[10px] font-medium text-gray-200 rounded hover:border-[#FF5E0E]/40"
                            title="Add/Deduct CL"
                          >
                            &plusmn; CL
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(emp, 'sl')}
                            className="px-2 py-1 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-[10px] font-medium text-gray-200 rounded hover:border-[#FF5E0E]/40"
                            title="Add/Deduct SL"
                          >
                            &plusmn; SL
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(emp, 'pl')}
                            className="px-2 py-1 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-[10px] font-medium text-gray-200 rounded hover:border-[#FF5E0E]/40"
                            title="Add/Deduct PL"
                          >
                            &plusmn; PL
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
      )}

      {/* Tab 2: Leave Applications Queue */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Leave Requests & Notice Compliance Queue</h3>
            <span className="text-xs text-gray-500">
              Planned leaves must be &ge; 24h in advance; sick leaves &ge; 2h before day start
            </span>
          </div>

          <div className="divide-y divide-[#262D3D]">
            {leaveApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No leave applications submitted yet.
              </div>
            ) : (
              leaveApplications.map(app => (
                <div key={app.id} className="p-4 hover:bg-[#181D27]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.empName}</span>
                      <span className="font-mono text-gray-400">({app.empCode})</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-semibold text-[10px] border border-indigo-500/30">
                        {app.leaveType} • {app.daysCount} Day(s)
                      </span>
                      {app.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] border border-emerald-500/30">
                          Approved
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-semibold text-[10px] border border-red-500/30">
                          Rejected
                        </span>
                      )}
                      {app.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold text-[10px] border border-amber-500/30">
                          Pending Review
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300">
                      <strong>Dates:</strong> {app.startDate} to {app.endDate} • <strong>Reason:</strong> {app.reason}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Applied: <strong className="text-gray-300">{app.appliedAt}</strong></span>
                      {app.isAdvanceNoticeValid ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Advance Notice Compliant</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          <span>{app.noticeWarningMessage || 'Notice window violated'}</span>
                        </span>
                      )}
                    </div>

                    {app.adminComment && (
                      <p className="text-[11px] text-gray-400 italic">
                        Admin Note: &ldquo;{app.adminComment}&rdquo;
                      </p>
                    )}
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onReviewLeaveApplication(app.id, 'APPROVED', 'Approved by HR')}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onReviewLeaveApplication(app.id, 'REJECTED', 'Rejected due to shift requirement')}
                        className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin Adjust Modal */}
      {adjustModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
              <h3 className="text-sm font-bold text-white">
                Adjust Leave Quota for {adjustModalEmp.personalDetails.firstName}
              </h3>
              <button
                onClick={() => setAdjustModalEmp(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Leave Category</label>
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value as any)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                >
                  <option value="cl">Casual Leave (CL)</option>
                  <option value="sl">Sick Leave (SL)</option>
                  <option value="pl">Privilege Leave (PL)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Number of Days</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="15"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reason / Justification</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Compensatory off granted / Correction"
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-end gap-2">
              <button
                onClick={() => handleConfirmAdjust('DEDUCT')}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
              >
                <Minus className="w-3 h-3" />
                <span>Reduce Leave</span>
              </button>
              <button
                onClick={() => handleConfirmAdjust('ADD')}
                className="bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
