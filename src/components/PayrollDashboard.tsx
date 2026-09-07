import React, { useState } from 'react';
import { 
  MonthlyPayrollRecord, 
  PayrollSummary, 
  Employee 
} from '../types/payroll';
import { CompanyMaster } from '../types/companyMaster';
import { exportRivotPayrollExcel } from '../utils/excelExporter';
import { generateEmployeePayslipPDF } from '../utils/pdfPayslipGenerator';
import { 
  FileSpreadsheet, 
  Download, 
  Calculator, 
  ShieldCheck, 
  Search, 
  CreditCard,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';

interface PayrollDashboardProps {
  currentMonth: string;
  payrollRecords: MonthlyPayrollRecord[];
  payrollSummary: PayrollSummary;
  employees: Employee[];
  onRecalculatePayroll: () => void;
  onSelectEmployeePayslip?: (record: MonthlyPayrollRecord) => void;
  companyMaster?: CompanyMaster;
}

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({
  currentMonth,
  payrollRecords,
  payrollSummary,
  onRecalculatePayroll,
  companyMaster
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MonthlyPayrollRecord | null>(null);

  const filteredRecords = payrollRecords.filter(r => 
    r.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    exportRivotPayrollExcel(payrollRecords, currentMonth);
    setExportNotice('Exported "RIVOT Payroll 2025-26.xlsx" with Master, EPF, ESIC, PT, and Bank sheets!');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const handleDownloadAllPayslips = () => {
    payrollRecords.forEach((record, idx) => {
      setTimeout(() => {
        generateEmployeePayslipPDF(record);
      }, idx * 250);
    });
    setExportNotice(`Generated ${payrollRecords.length} PDF payslips for download!`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Generation Action */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5E0E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Statutory Payroll Calculation Engine
              </span>
              <span className="text-xs text-gray-400">
                EPF • ESIC • PT (Karnataka) • Bank NEFT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              RIVOT Monthly Payroll & Statutory Compliance ({currentMonth})
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Automated salary computation applying pro-rata paid days, biometric shift penalties, senior exemptions, 
              statutory deductions (PF 12%, ESI 0.75%, PT ₹200), and discretionary adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRecalculatePayroll}
              className="flex items-center gap-2 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/50 text-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              title="Refresh and recalculate attendance & adjustments"
            >
              <Calculator className="w-4 h-4 text-[#FF5E0E]" />
              <span>Recalculate</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
              title="Download exact RIVOT Payroll 2025-26.xlsx format for PF, ESIC and PT filing"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export RIVOT Payroll 2025-26.xlsx</span>
            </button>

            <button
              onClick={handleDownloadAllPayslips}
              className="flex items-center gap-2 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              title="Download all employee PDF payslips"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>All Payslips (PDF)</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Net Pay */}
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl relative overflow-hidden">
          <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Net Disbursement</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            ₹ {payrollSummary.totalNetSalary.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Bank Transfer</span>
          </div>
        </div>

        {/* Total Gross */}
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-gray-400 uppercase font-semibold">Gross Earned Salary / CTC</span>
          <p className="text-2xl font-black text-white mt-1">
            ₹ {payrollSummary.totalGrossEarned.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <span>CTC Matches Gross: ₹ {payrollSummary.totalGrossEarned.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total EPF */}
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-blue-400 uppercase font-semibold">Total EPF Remittance</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            ₹ {(payrollSummary.totalPfEmployee + payrollSummary.totalPfEmployer).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
            <span>EE: ₹{payrollSummary.totalPfEmployee.toLocaleString('en-IN')} • ER: ₹{payrollSummary.totalPfEmployer.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total ESIC */}
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-amber-400 uppercase font-semibold">Total ESIC Contribution</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            ₹ {(payrollSummary.totalEsiEmployee + payrollSummary.totalEsiEmployer).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
            <span>EE: ₹{payrollSummary.totalEsiEmployee.toLocaleString('en-IN')} • ER: ₹{payrollSummary.totalEsiEmployer.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total PT */}
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-purple-400 uppercase font-semibold">Professional Tax (PT)</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            ₹ {payrollSummary.totalProfessionalTax.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
            <span>Karnataka PT Slab</span>
          </div>
        </div>

      </div>

      {/* Main Payroll Table */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Search & Title Header */}
        <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF5E0E]" />
            <h3 className="text-sm font-bold text-white">Monthly Master Payroll Register</h3>
            <span className="text-xs text-gray-500 font-mono">({filteredRecords.length} staff)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider sticky top-0 z-20 border-b border-[#262D3D]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Days (Paid / LOP)</th>
                <th className="py-3 px-4">Gross Earned</th>
                <th className="py-3 px-4">Basic Earned</th>
                <th className="py-3 px-4">PF (EE)</th>
                <th className="py-3 px-4">ESI (EE)</th>
                <th className="py-3 px-4">PT (KA)</th>
                <th className="py-3 px-4">Reimb. / Deduct.</th>
                <th className="py-3 px-4 font-bold text-emerald-400">Net Pay</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D3D] text-gray-300">
              {filteredRecords.map(r => (
                <tr key={r.empId} className="hover:bg-[#181D27]/60 transition-colors">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-white">{r.empName}</div>
                    <div className="text-[10px] text-[#FF5E0E] font-mono">{r.empCode}</div>
                  </td>

                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="text-white">{r.designation}</div>
                    <div className="text-[10px] text-gray-400">{r.department}</div>
                  </td>

                  <td className="py-2.5 px-4 font-mono">
                    <span className="text-emerald-400 font-bold">{r.paidDays}</span> / {r.totalMonthDays}
                    {r.totalLOPDays > 0 && (
                      <span className="text-rose-400 ml-1 text-[11px]">({r.totalLOPDays} LOP)</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 font-mono font-medium">
                    ₹ {r.earnedGross.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 font-mono">
                    ₹ {r.earnedBasic.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 font-mono text-blue-300">
                    ₹ {r.epfEmployee12.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 font-mono text-amber-300">
                    ₹ {r.esiEmployee.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 font-mono text-purple-300">
                    ₹ {r.pt.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    <span className="text-emerald-400">+{r.reimbursements}</span> / 
                    <span className="text-rose-400 ml-1">-{r.otherDeductions}</span>
                  </td>

                  <td className="py-2.5 px-4 font-mono font-black text-sm text-emerald-400">
                    ₹ {r.netPayable.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181D27] hover:bg-[#262D3D] border border-[#262D3D] transition-colors mr-1.5"
                      title="View Detailed Payslip"
                    >
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => generateEmployeePayslipPDF(r, companyMaster)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#FF5E0E] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#181D27] hover:bg-[#FF5E0E]/20 border border-[#262D3D] hover:border-[#FF5E0E]/40 transition-colors"
                      title="Download PDF Payslip"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="p-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex flex-wrap items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Excel file matches official RIVOT Master, EPF, ESIC, and PT Karnataka format.</span>
          </div>
          <span className="font-mono text-[11px]">
            Statutory Engine Ver 2025-26 • RIVOT MOTORS INDIA
          </span>
        </div>
      </div>

      {/* Interactive Payslip Modal Preview */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-xs text-gray-300 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262D3D] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5E0E]">
                  Digital Payslip Preview • {selectedRecord.month}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedRecord.empName} ({selectedRecord.empCode})
                </h3>
                <p className="text-[11px] text-gray-400">
                  {selectedRecord.designation} • {selectedRecord.department} • Paid Days: {selectedRecord.paidDays}/{selectedRecord.totalMonthDays}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg bg-[#181D27] hover:bg-[#262D3D] text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Take-Home Net Pay Header */}
            <div className="bg-[#181D27] p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Net Salary Payable</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹ {selectedRecord.netPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Bank: {selectedRecord.bankName} • A/C: {selectedRecord.accountNo} • IFSC: {selectedRecord.ifsc}
                </span>
              </div>
              <div className="text-right">
                <button
                  onClick={() => generateEmployeePayslipPDF(selectedRecord, companyMaster)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5E0E] hover:bg-[#FF5E0E]/90 text-white font-bold transition-colors shadow-lg shadow-[#FF5E0E]/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Breakdown Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Earnings */}
              <div className="bg-[#181D27] p-4 rounded-xl border border-[#262D3D] space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#262D3D]">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                    Gross Earnings (A)
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    ₹ {(selectedRecord.earnedGross + selectedRecord.reimbursements).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 text-gray-300">
                  <span>Basic Salary</span>
                  <span className="font-mono text-white">₹ {selectedRecord.earnedBasic.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-0.5 text-gray-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono text-white">₹ {selectedRecord.earnedHRA.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-0.5 text-gray-300">
                  <span>Conveyance Allowance</span>
                  <span className="font-mono text-white">₹ {selectedRecord.earnedConveyance.toLocaleString('en-IN')}</span>
                </div>
                {(selectedRecord.earnedMedical ?? 0) > 0 && (
                  <div className="flex justify-between py-0.5 text-gray-300">
                    <span>Medical Allowance</span>
                    <span className="font-mono text-white">₹ {selectedRecord.earnedMedical?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {(selectedRecord.earnedLTA ?? 0) > 0 && (
                  <div className="flex justify-between py-0.5 text-gray-300">
                    <span>Leave Travel Allowance (LTA)</span>
                    <span className="font-mono text-white">₹ {selectedRecord.earnedLTA?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5 text-gray-300">
                  <span>Special Allowance</span>
                  <span className="font-mono text-white">₹ {selectedRecord.earnedSpecial.toLocaleString('en-IN')}</span>
                </div>
                {selectedRecord.reimbursements > 0 && (
                  <div className="flex justify-between py-0.5 text-emerald-300 font-semibold border-t border-[#262D3D]">
                    <span>Reimbursements / Arrears</span>
                    <span className="font-mono">+ ₹ {selectedRecord.reimbursements.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Deductions & Employer Contributions */}
              <div className="bg-[#181D27] p-4 rounded-xl border border-[#262D3D] space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#262D3D]">
                  <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                    Statutory & Salary Deductions (B)
                  </span>
                  <span className="font-bold text-rose-400 font-mono">
                    - ₹ {selectedRecord.totalDeductions.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Employee Share */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">
                    <span>Employee Deductions</span>
                    <span className="font-mono">₹ {selectedRecord.totalEmployeeDeductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                      <span>Provident Fund (EPF 12%)</span>
                      <span className="font-mono text-rose-300">₹ {selectedRecord.epfEmployee12.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                      <span>Employee State Insurance (ESIC 0.75%)</span>
                      <span className="font-mono text-rose-300">₹ {selectedRecord.esiEmployee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-gray-300 text-xs">
                      <span>Professional Tax (PT Karnataka)</span>
                      <span className="font-mono text-rose-300">₹ {selectedRecord.pt.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedRecord.otherDeductions > 0 && (
                      <div className="flex justify-between py-0.5 text-rose-400 text-xs">
                        <span>Other Recoveries / Advance</span>
                        <span className="font-mono">- ₹ {selectedRecord.otherDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employer Statutory Section (CTC Component) */}
                <div className="pt-2 border-t border-[#262D3D] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <span>Employer Statutory Contribution (Part of CTC)</span>
                    <span className="font-mono text-amber-300">
                      ₹ {selectedRecord.totalEmployerStatutory.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                    <span>EPF Employer (3.67%)</span>
                    <span className="font-mono text-gray-300">Rs. {selectedRecord.epfEmployerEPF}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                    <span>EPS Pension (8.33%)</span>
                    <span className="font-mono text-gray-300">Rs. {selectedRecord.epfEmployerEPS}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                    <span>EDLI & Admin (1.0%)</span>
                    <span className="font-mono text-gray-300">Rs. {selectedRecord.epfAdminEDLI}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-400 text-[11px]">
                    <span>ESIC Employer (3.25%)</span>
                    <span className="font-mono text-gray-300">Rs. {selectedRecord.esiEmployer}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Reconciliation Note */}
            <div className="bg-[#0B0D11] border border-blue-500/20 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Statutory Compliance & CTC Reconciliation</span>
              </div>
              <p>
                <strong className="text-white">Total Monthly CTC:</strong> ₹{selectedRecord.fixedGross.toLocaleString('en-IN')} strictly matches <strong className="text-white">Gross Salary:</strong> ₹{selectedRecord.earnedGross.toLocaleString('en-IN')}.
              </p>
              <p>
                <strong className="text-white">Statutory & Compliance Remittance:</strong> Employer Contributions (₹{selectedRecord.totalEmployerStatutory.toLocaleString('en-IN')}) + Employee Deductions (₹{selectedRecord.totalEmployeeDeductions.toLocaleString('en-IN')}) = <strong className="text-rose-400">Total Deductions from CTC:</strong> ₹{selectedRecord.totalDeductions.toLocaleString('en-IN')}.
              </p>
              <p>
                <strong className="text-white">Net Take-Home:</strong> ₹{selectedRecord.earnedGross.toLocaleString('en-IN')} − ₹{selectedRecord.totalDeductions.toLocaleString('en-IN')} = <strong className="text-emerald-400">₹{selectedRecord.netPayable.toLocaleString('en-IN')}</strong>. Everything spent or remitted for statutory compliance when added together with net pay forms the complete Gross Salary.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
