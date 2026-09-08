import React, { useState } from 'react';
import { Employee } from '../types/payroll';
import { RivotLogo } from './RivotLogo';
import { 
  User, 
  Lock, 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Sparkles, 
  X,
  UserPlus
} from 'lucide-react';

interface EmployeeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onLoginSuccess: (empId: string) => void;
  onOpenOnboardToken?: () => void;
}

export const EmployeeLoginModal: React.FC<EmployeeLoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  onLoginSuccess,
  onOpenOnboardToken
}) => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setErrorMsg('Please enter your Employee Code or Email address.');
      return;
    }

    // Match by empCode or email (case-insensitive)
    const match = employees.find(emp => 
      emp.empCode.toLowerCase() === cleanId || 
      emp.email.toLowerCase() === cleanId ||
      `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.toLowerCase().includes(cleanId)
    );

    if (!match) {
      setErrorMsg(`No employee found matching "${identifier}". Please check your Employee Code or Email.`);
      return;
    }

    if (match.status === 'RESIGNED' || match.status === 'EXITED') {
      setErrorMsg(`Employee ${match.empCode} (${match.personalDetails.firstName}) is marked as Resigned/Exited. Please contact HR.`);
      return;
    }

    setErrorMsg(null);
    onLoginSuccess(match.id);
  };

  const handleQuickSelect = (emp: Employee) => {
    setErrorMsg(null);
    onLoginSuccess(emp.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FF5E0E]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <RivotLogo theme="dark" size="sm" />
          <h2 className="text-xl font-bold text-white mt-1">
            RIVOT Employee Self-Service Portal
          </h2>
          <p className="text-xs text-gray-400 max-w-sm">
            Sign in with your Employee Code or official email to view payslips, biometric punches, and submit leave requests.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Employee ID or Work Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. RIVOT-EMP-101 or rahul.sharma@rivotmotors.com"
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Portal Password / PIN
              </label>
              <span className="text-[11px] text-gray-500 font-mono">Demo: Any or 123456</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Employee Portal</span>
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-[#262D3D] space-y-3">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E0E]" />
              <strong>Quick 1-Click Login (Demo Accounts):</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {employees
              .filter(e => e.status === 'ACTIVE')
              .slice(0, 4)
              .map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleQuickSelect(emp)}
                  className="p-2 rounded-xl bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-white truncate">
                    {emp.personalDetails.firstName} {emp.personalDetails.lastName}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center justify-between mt-0.5">
                    <span className="font-mono text-[#FF5E0E]">{emp.empCode}</span>
                    <span className="truncate max-w-[80px]">{emp.employmentDetails.designation || 'Staff'}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* New hire onboarding prompt */}
        {onOpenOnboardToken && (
          <div className="mt-4 p-3 rounded-xl bg-[#181D27] border border-[#262D3D] flex items-center justify-between gap-2">
            <div className="text-[11px] text-gray-300">
              Received a new hire invite link?
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOnboardToken();
              }}
              className="flex items-center gap-1 text-[11px] text-[#FF5E0E] hover:text-[#E04E05] font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Complete Onboarding</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
