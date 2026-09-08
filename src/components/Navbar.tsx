import React from 'react';
import { RivotLogo } from './RivotLogo';
import { 
  Calendar, 
  Download, 
  Terminal, 
  UserCheck, 
  FileSpreadsheet, 
  FileText,
  ShieldCheck,
  User,
  Sun,
  Moon,
  LogIn,
  KeyRound,
  LogOut,
  Share2
} from 'lucide-react';
import { MonthlyPayrollRecord } from '../types/payroll';
import { CompanyMaster } from '../types/companyMaster';
import { exportRivotPayrollExcel } from '../utils/excelExporter';

interface NavbarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  activeRole: 'ADMIN' | 'EMPLOYEE';
  onRoleChange: (role: 'ADMIN' | 'EMPLOYEE') => void;
  onOpenDeployModal: () => void;
  onOpenLogoModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenCredentialsModal?: () => void;
  onLogout?: () => void;
  payrollRecords: MonthlyPayrollRecord[];
  onBatchPayslips: () => void;
  selectedEmpId?: string;
  onSelectEmployee?: (empId: string) => void;
  employees: { id: string; name: string; code: string }[];
  companyMaster?: CompanyMaster;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isAdminSession?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  activeRole,
  onRoleChange,
  onOpenDeployModal,
  onOpenLogoModal,
  onOpenLoginModal,
  onOpenCredentialsModal,
  onLogout,
  payrollRecords,
  onBatchPayslips,
  selectedEmpId,
  onSelectEmployee,
  employees,
  companyMaster,
  theme = 'dark',
  onToggleTheme,
  isAdminSession = true
}) => {
  return (
    <header className="bg-[#0B0D11] border-b border-[#262D3D] sticky top-0 z-40 px-4 lg:px-8 py-3 select-none transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {companyMaster?.useCustomLogo && companyMaster.customLogoDataUrl ? (
              <img
                src={companyMaster.customLogoDataUrl}
                alt={companyMaster.companyName || 'Company Logo'}
                className="h-8 max-w-[180px] object-contain"
              />
            ) : (
              <RivotLogo theme={theme === 'light' ? 'light' : 'dark'} size="sm" />
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          
          {/* Light / Dark Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center p-2 rounded-lg bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-300 hover:text-white transition-all shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          )}

          {/* Payroll Month Picker */}
          <div className="flex items-center bg-[#12161E] border border-[#262D3D] rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-[#FF5E0E] mr-1.5 shrink-0" />
            <span className="text-gray-400 mr-1.5 hidden sm:inline">Payroll Month:</span>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            />
          </div>

          {/* Admin Exclusive Action Buttons */}
          {isAdminSession && (
            <>
              {/* Quick Action: Export Excel */}
              <button
                onClick={() => exportRivotPayrollExcel(payrollRecords, currentMonth)}
                disabled={payrollRecords.length === 0}
                className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/50 text-gray-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
                title="Download formatted 'RIVOT Payroll 2025-26.xlsx' with Master, EPF, ESIC, and PT sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export</span> Excel
              </button>

              {/* Quick Action: Batch Payslips */}
              <button
                onClick={onBatchPayslips}
                disabled={payrollRecords.length === 0}
                className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
                title="Download PDF payslips for all active employees"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Batch</span> Payslips
              </button>

              {/* Deploy Script Button */}
              <button
                onClick={onOpenDeployModal}
                className="flex items-center gap-1.5 bg-[#FF5E0E]/15 hover:bg-[#FF5E0E]/25 border border-[#FF5E0E]/40 text-[#FF5E0E] text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm"
                title="Get the one-click deployment bash script for Ubuntu VM"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Ubuntu Deploy</span>
              </button>

              {/* Share Staff Passwords Button (Visible only to Admin) */}
              {onOpenCredentialsModal && (
                <button
                  onClick={onOpenCredentialsModal}
                  className="flex items-center gap-1.5 bg-[#FF5E0E]/15 hover:bg-[#FF5E0E]/25 border border-[#FF5E0E]/40 text-[#FF5E0E] text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm"
                  title="View & Share Staff Login Credentials and Default Passwords"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Share Staff Passwords</span>
                </button>
              )}
            </>
          )}

          {/* Role Toggle: Only Admin can toggle into Admin or Staff view. Regular staff are strictly locked to Staff Portal */}
          {isAdminSession ? (
            <div className="flex items-center bg-[#12161E] p-1 rounded-lg border border-[#262D3D]">
              <button
                onClick={() => onRoleChange('ADMIN')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeRole === 'ADMIN'
                    ? 'bg-[#FF5E0E] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => onRoleChange('EMPLOYEE')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeRole === 'EMPLOYEE'
                    ? 'bg-[#FF5E0E] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#12161E] border border-[#262D3D] text-[#FF5E0E] font-medium font-mono">
              <User className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </div>
          )}

          {/* If in Employee mode AND logged in as Admin, allow switching simulated employee for auditing */}
          {isAdminSession && activeRole === 'EMPLOYEE' && onSelectEmployee && (
            <select
              value={selectedEmpId}
              onChange={(e) => onSelectEmployee(e.target.value)}
              className="bg-[#181D27] border border-[#262D3D] text-xs text-orange-400 rounded-lg px-2 py-1.5 focus:outline-none"
              title="Admin Audit: Preview portal as another employee"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code})
                </option>
              ))}
            </select>
          )}

          {/* Production Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-[#181D27] hover:bg-rose-500/20 border border-[#262D3D] hover:border-rose-500/40 text-gray-300 hover:text-rose-300 text-xs px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
