import React, { useState } from 'react';
import { Employee } from '../types/payroll';
import { RivotLogo } from './RivotLogo';
import { 
  DEFAULT_STAFF_PASSWORD, 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  verifyEmployeePassword,
  verifyAdminCredentials
} from '../utils/authConfig';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink
} from 'lucide-react';

interface LoginScreenProps {
  employees: Employee[];
  onAdminLogin: () => void;
  onEmployeeLogin: (empId: string) => void;
  onOpenCandidateOnboard?: (emp?: Employee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  employees,
  onAdminLogin,
  onEmployeeLogin,
  onOpenCandidateOnboard
}) => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'ADMIN'>('STAFF');
  
  // Staff form state (empty by default in production)
  const [staffIdentifier, setStaffIdentifier] = useState<string>('');
  const [staffPassword, setStaffPassword] = useState<string>('');
  const [showStaffPassword, setShowStaffPassword] = useState<boolean>(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Admin form state (empty by default in production)
  const [adminUser, setAdminUser] = useState<string>('');
  const [adminPass, setAdminPass] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Optional Sandbox Testing Accordion (strictly for developer/preview QA, collapsed by default)
  const [showSandboxTester, setShowSandboxTester] = useState<boolean>(false);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = staffIdentifier.trim().toLowerCase();
    if (!cleanId) {
      setStaffError('Please enter your Employee Code (e.g. 0020) or Registered Work Email.');
      return;
    }
    if (!staffPassword) {
      setStaffError('Please enter your password.');
      return;
    }

    const match = employees.find(emp => 
      emp.empCode.toLowerCase() === cleanId || 
      emp.email.toLowerCase() === cleanId ||
      `${emp.personalDetails.firstName || ''} ${emp.personalDetails.lastName || ''}`.toLowerCase().trim() === cleanId
    );

    if (!match) {
      setStaffError(`No active employee account found matching "${staffIdentifier}". Please check your details or contact HR.`);
      return;
    }

    if (match.status === 'RESIGNED' || match.status === 'EXITED') {
      setStaffError(`Account for ${match.empCode} is deactivated (Resigned/Exited status). Please contact HR.`);
      return;
    }

    const isValid = verifyEmployeePassword(match, staffPassword);
    if (!isValid) {
      setStaffError('Incorrect password. For first-time login, use the temporary initial password provided by HR.');
      return;
    }

    setStaffError(null);
    onEmployeeLogin(match.id);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.trim()) {
      setAdminError('Please enter Admin Email or Username.');
      return;
    }
    if (!adminPass) {
      setAdminError('Please enter Admin Password.');
      return;
    }

    const isValid = verifyAdminCredentials(adminUser, adminPass);
    if (!isValid) {
      setAdminError('Invalid administrator credentials.');
      return;
    }

    setAdminError(null);
    onAdminLogin();
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-gray-100 flex flex-col justify-between selection:bg-[#FF5E0E]/30 selection:text-white relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FF5E0E]/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-blue-600/10 blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#1F2633]/60 bg-[#0B0E14]/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <RivotLogo theme="dark" size="sm" />
          <div className="hidden sm:block border-l border-[#262D3D] pl-3 py-0.5">
            <span className="text-[11px] font-semibold text-gray-400 block tracking-wide uppercase">
              Hubballi EV Manufacturing Plant
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Statutory Payroll & Biometric Attendance Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Production v2.6.4 Online
          </span>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-md space-y-4">
          <div className="w-full bg-[#10141C] border border-[#222938] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
          
          {/* Header Card */}
          <div className="p-6 sm:p-7 border-b border-[#1F2633] text-center bg-gradient-to-b from-[#151B26] to-[#10141C]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FF5E0E]/15 border border-[#FF5E0E]/30 text-[#FF5E0E] mb-3 shadow-lg shadow-[#FF5E0E]/10">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              RIVOT Internal Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
              Sign in to manage Indian payroll, biometric attendance, profile details, and statutory records.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-[#0B0E14] border-b border-[#1F2633]">
            <button
              onClick={() => {
                setActiveTab('STAFF');
                setStaffError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'STAFF'
                  ? 'bg-[#FF5E0E] text-white shadow-md shadow-[#FF5E0E]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Staff / Employee</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ADMIN');
                setAdminError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-[#18202D] text-white border border-[#2D374A] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & HR</span>
            </button>
          </div>

          {/* Tab 1: Staff / Employee Login */}
          {activeTab === 'STAFF' && (
            <div className="p-6 sm:p-7 space-y-5">
              {staffError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{staffError}</span>
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Employee Code or Email Address
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={staffIdentifier}
                      onChange={(e) => setStaffIdentifier(e.target.value)}
                      placeholder="e.g. 0020 or abhishek.raikar@rivotmotors.com"
                      className="w-full bg-[#161C26] border border-[#262F40] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E] transition-all font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-[#161C26] border border-[#262F40] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/25"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Employee Portal</span>
                </button>
              </form>

              {/* Information Note */}
              <div className="p-3 bg-[#161C26] border border-[#262F40] rounded-xl text-[11px] text-gray-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>First Time Logging In?</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Please enter your Employee Code and the temporary initial password provided by Rivot HR. Once signed in, you will be prompted to create your own permanent private password and update your banking and statutory records.
                </p>
              </div>

              {/* Candidate Self-Onboarding Link */}
              {onOpenCandidateOnboard && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenCandidateOnboard()}
                    className="text-[11px] text-gray-400 hover:text-[#FF5E0E] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Invited candidate? Open Onboarding Registration</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Admin & HR Login */}
          {activeTab === 'ADMIN' && (
            <div className="p-6 sm:p-7 space-y-5">
              {adminError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Admin Email or Username
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="admin@rivotmotors.com"
                      className="w-full bg-[#161C26] border border-[#262F40] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E] transition-all font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Master Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-[#161C26] border border-[#262F40] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/25"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In as Admin & HR</span>
                </button>
              </form>

              <div className="p-3 bg-[#161C26] border border-[#262F40] rounded-xl text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF5E0E]" />
                  <span>Restricted Administrative Access</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  This console is strictly limited to authorized Payroll and HR Administrators. Individual staff credentials can be securely distributed through the internal admin dashboard.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Collapsible Sandbox & Preview Helper (for Owner / Developer QA testing) */}
        <div className="w-full max-w-md mx-auto pt-4 text-center">
          <button
            type="button"
            onClick={() => setShowSandboxTester(!showSandboxTester)}
            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Preview & QA Sandbox Credentials</span>
            {showSandboxTester ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showSandboxTester && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#10141D] border border-[#222A38] text-left text-xs space-y-2 animate-fade-in text-gray-300">
              <div className="text-[11px] text-gray-400">
                These credentials can be used for initial testing and demonstration. In production, staff and admin use their individual passwords.
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-[#0A0D13] border border-[#1A202C]">
                  <div className="text-gray-400 font-sans text-[10px]">Admin Account:</div>
                  <div className="text-white truncate">admin@rivotmotors.com</div>
                  <div className="text-[#FF5E0E]">Admin@Rivot2026</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('ADMIN');
                      setAdminUser(DEFAULT_ADMIN_EMAIL);
                      setAdminPass(DEFAULT_ADMIN_PASSWORD);
                    }}
                    className="mt-1 text-[10px] text-[#FF5E0E] hover:underline block"
                  >
                    Quick-fill Admin
                  </button>
                </div>
                <div className="p-2 rounded bg-[#0A0D13] border border-[#1A202C]">
                  <div className="text-gray-400 font-sans text-[10px]">Staff Account:</div>
                  <div className="text-white">Emp Code: 0020</div>
                  <div className="text-[#FF5E0E]">Rivot@123</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('STAFF');
                      setStaffIdentifier('0020');
                      setStaffPassword(DEFAULT_STAFF_PASSWORD);
                    }}
                    className="mt-1 text-[10px] text-[#FF5E0E] hover:underline block"
                  >
                    Quick-fill Staff (0020)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-500 border-t border-[#1F2633]/60 bg-[#0B0E14]/70 z-10">
        <p>
          © 2026 Rivot Motors Pvt. Ltd. | Hubballi Industrial Plant, Karnataka | All Rights Reserved
        </p>
      </footer>

    </div>
  );
};
