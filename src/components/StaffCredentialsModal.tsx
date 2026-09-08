import React, { useState } from 'react';
import { Employee } from '../types/payroll';
import { 
  DEFAULT_STAFF_PASSWORD, 
  getEffectiveEmployeePassword, 
  generateStaffInviteMessage 
} from '../utils/authConfig';
import { 
  X, 
  Share2, 
  KeyRound, 
  Copy, 
  Check, 
  Search, 
  RotateCcw, 
  ExternalLink, 
  Sparkles,
  Download,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface StaffCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onResetEmployeePassword: (empId: string) => void;
}

export const StaffCredentialsModal: React.FC<StaffCredentialsModalProps> = ({
  isOpen,
  onClose,
  employees,
  onResetEmployeePassword
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedEmpId, setCopiedEmpId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [resetSuccessEmpId, setResetSuccessEmpId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeEmployees = employees.filter(e => e.status !== 'RESIGNED' && e.status !== 'EXITED');

  const filtered = activeEmployees.filter(e => {
    const q = searchTerm.toLowerCase();
    const name = `${e.personalDetails.firstName || ''} ${e.personalDetails.lastName || ''}`.toLowerCase();
    return e.empCode.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || name.includes(q);
  });

  const handleCopyInvite = (emp: Employee) => {
    const msg = generateStaffInviteMessage(emp);
    navigator.clipboard.writeText(msg);
    setCopiedEmpId(emp.id);
    setTimeout(() => setCopiedEmpId(null), 3000);
  };

  const handleCopyAll = () => {
    const header = 'Emp Code\tName\tDesignation\tEmail\tLogin Password\tStatus\n';
    const rows = activeEmployees.map(e => {
      const name = `${e.personalDetails.firstName || ''} ${e.personalDetails.lastName || ''}`.trim() || 'Employee';
      const desig = e.employmentDetails.designation || '-';
      const pass = getEffectiveEmployeePassword(e);
      const status = e.isTempPasswordReset ? 'Updated by Staff' : 'Initial Default';
      return `${e.empCode}\t${name}\t${desig}\t${e.email}\t${pass}\t${status}`;
    }).join('\n');

    navigator.clipboard.writeText(header + rows);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleResetPassword = (empId: string) => {
    onResetEmployeePassword(empId);
    setResetSuccessEmpId(empId);
    setTimeout(() => setResetSuccessEmpId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF5E0E]/15 border border-[#FF5E0E]/30 flex items-center justify-center text-[#FF5E0E]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Staff Login Credentials & Default Passwords</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] font-mono">
                  {activeEmployees.length} Staff
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Share initial login credentials with staff members so they can log in, update their password, and correct their details.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Info Bar */}
        <div className="p-4 bg-[#161C26] border-b border-[#262D3D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Standard First-Time Password:</span>
            <span className="px-2.5 py-1 rounded bg-[#0B0D11] border border-[#262D3D] font-mono font-bold text-[#FF5E0E]">
              {DEFAULT_STAFF_PASSWORD}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-md shadow-[#FF5E0E]/20"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Copied All Staff to Clipboard!' : 'Copy All Credentials (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Search filter */}
        <div className="p-4 border-b border-[#262D3D] bg-[#0E121A]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, employee code (e.g. 0020), or email..."
              className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0B0D11] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#262D3D] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">Emp Code</th>
                <th className="py-2.5 px-4">Employee Name</th>
                <th className="py-2.5 px-4">Login Email</th>
                <th className="py-2.5 px-4">Current Password</th>
                <th className="py-2.5 px-4">Password Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2633]">
              {filtered.map((emp) => {
                const pass = getEffectiveEmployeePassword(emp);
                const isReset = emp.isTempPasswordReset;
                const isCopied = copiedEmpId === emp.id;
                const isResetSuccess = resetSuccessEmpId === emp.id;
                const name = `${emp.personalDetails.firstName || ''} ${emp.personalDetails.lastName || ''}`.trim() || 'Pending Onboard';

                return (
                  <tr key={emp.id} className="hover:bg-[#181D27]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#FF5E0E]">
                      {emp.empCode}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{name}</div>
                      <div className="text-[11px] text-gray-400">{emp.employmentDetails.designation || 'Staff'}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-300">
                      {emp.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono bg-[#0B0D11] border border-[#262D3D] px-2 py-1 rounded text-white font-medium">
                        {pass}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isReset ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Custom Set</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>Default: {DEFAULT_STAFF_PASSWORD}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyInvite(emp)}
                          className="inline-flex items-center gap-1 text-[11px] bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                          title="Copy WhatsApp / Email Invitation Message with credentials"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FF5E0E]" />}
                          <span>{isCopied ? 'Copied!' : 'Share Invite'}</span>
                        </button>

                        <button
                          onClick={() => handleResetPassword(emp.id)}
                          className="inline-flex items-center gap-1 text-[11px] bg-[#181D27] hover:bg-rose-500/20 border border-[#262D3D] hover:border-rose-500/40 text-gray-400 hover:text-rose-300 px-2 py-1.5 rounded-lg transition-colors"
                          title="Reset employee password to default (Rivot@123)"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isResetSuccess ? 'Reset to Default!' : 'Reset'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-between text-xs text-gray-400">
          <span>
            Staff can update their email and password anytime from their personal profile page after logging in.
          </span>
          <button
            onClick={onClose}
            className="bg-[#181D27] hover:bg-[#202734] text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
