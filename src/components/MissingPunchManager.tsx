import React, { useState } from 'react';
import { MissingPunchRequest, Employee } from '../types/payroll';
import { Clock, Check, X, AlertCircle, CheckCircle2, User, Send, Calendar } from 'lucide-react';

interface MissingPunchManagerProps {
  currentMonth: string;
  employees: Employee[];
  missingPunchRequests: MissingPunchRequest[];
  onReviewRequest: (requestId: string, status: 'APPROVED' | 'REJECTED', adminComment?: string) => void;
  onSubmitRequest: (req: Omit<MissingPunchRequest, 'id' | 'status' | 'submittedAt'>) => void;
  isAdmin: boolean;
  activeEmployeeId?: string;
}

export const MissingPunchManager: React.FC<MissingPunchManagerProps> = ({
  currentMonth,
  employees,
  missingPunchRequests,
  onReviewRequest,
  onSubmitRequest,
  isAdmin,
  activeEmployeeId
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(activeEmployeeId || (employees[0]?.id || ''));
  const [date, setDate] = useState<string>(`${currentMonth}-12`);
  const [requestedIn, setRequestedIn] = useState<string>('09:15');
  const [requestedOut, setRequestedOut] = useState<string>('18:45');
  const [reason, setReason] = useState<string>('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId) || employees[0];
    if (!emp || !reason.trim()) return;

    onSubmitRequest({
      empId: emp.id,
      empCode: emp.empCode,
      empName: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.trim(),
      date,
      requestedPunchIn: requestedIn,
      requestedPunchOut: requestedOut,
      reason
    });

    setReason('');
    setSubmittedNotice(`Missing punch regularization submitted for ${date}. Sent to Admin for verification.`);
    setTimeout(() => setSubmittedNotice(null), 5000);
  };

  const pendingRequests = missingPunchRequests.filter(r => r.status === 'PENDING');
  const pastRequests = missingPunchRequests.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF5E0E]" />
            <h2 className="text-lg font-bold text-white">Missing Punch Regularization Portal</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Employees can manually submit their actual arrival and departure times with justifications. 
            All submissions require strict admin authorization before attendance hours and weekly offs are credited.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#181D27] border border-[#262D3D] text-gray-300">
            Pending Admin Approvals: <strong className="text-amber-400 ml-1">{pendingRequests.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Submission Form & Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submit Form */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5 space-y-4">
          <div className="border-b border-[#262D3D] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FF5E0E]" />
              Submit Missing Punch Request
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Enter actual in/out times and valid justification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isAdmin && (
              <div>
                <label className="block text-gray-400 mb-1">Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.personalDetails.firstName} {e.personalDetails.lastName} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-400 mb-1">Incident Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-400 mb-1">Actual Punch In</label>
                <input
                  type="time"
                  value={requestedIn}
                  onChange={(e) => setRequestedIn(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Actual Punch Out</label>
                <input
                  type="time"
                  value={requestedOut}
                  onChange={(e) => setRequestedOut(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Reason for Missed Punch</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Biometric reader down at Hubballi gate 2 / Client site test..."
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5E0E]/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Admin Approval</span>
            </button>
          </form>

          {submittedNotice && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submittedNotice}</span>
            </div>
          )}
        </div>

        {/* Requests Review List (Col 2 & 3) */}
        <div className="lg:col-span-2 bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Regularization Authorization Queue</h3>
            <span className="text-xs text-gray-500 font-mono">
              {pendingRequests.length} Pending
            </span>
          </div>

          <div className="divide-y divide-[#262D3D] flex-1 overflow-y-auto max-h-[500px]">
            {missingPunchRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No missing punch requests recorded.
              </div>
            ) : (
              missingPunchRequests.map(req => (
                <div key={req.id} className="p-4 hover:bg-[#181D27]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.empName}</span>
                      <span className="font-mono text-gray-400">({req.empCode})</span>
                      <span className="font-mono text-[#FF5E0E] font-semibold">{req.date}</span>

                      {req.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold text-[10px] border border-amber-500/30">
                          Pending Approval
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] border border-emerald-500/30">
                          Approved & Applied
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-semibold text-[10px] border border-red-500/30">
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-gray-300">
                      <span>Claimed In: <strong className="font-mono text-emerald-400">{req.requestedPunchIn}</strong></span>
                      <span>Claimed Out: <strong className="font-mono text-amber-400">{req.requestedPunchOut}</strong></span>
                      <span>Submitted: <span className="text-gray-400">{req.submittedAt}</span></span>
                    </div>

                    <p className="text-gray-300 italic">
                      Reason: &ldquo;{req.reason}&rdquo;
                    </p>

                    {req.adminComment && (
                      <p className="text-[11px] text-gray-400">
                        Admin Note: &ldquo;{req.adminComment}&rdquo;
                      </p>
                    )}
                  </div>

                  {req.status === 'PENDING' && isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onReviewRequest(req.id, 'APPROVED', 'Verified by Admin')}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onReviewRequest(req.id, 'REJECTED', 'Unverified punch claim')}
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

      </div>

    </div>
  );
};
