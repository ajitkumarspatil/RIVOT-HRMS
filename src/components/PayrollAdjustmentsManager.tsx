import React, { useState } from 'react';
import { Employee, EmployeeAdjustment, AdjustmentItem } from '../types/payroll';
import { Plus, Trash2, DollarSign, ArrowUpRight, ArrowDownLeft, Info, CheckCircle2 } from 'lucide-react';

interface PayrollAdjustmentsManagerProps {
  currentMonth: string;
  employees: Employee[];
  adjustments: Record<string, EmployeeAdjustment>;
  onAddAdjustment: (empId: string, type: 'reimbursement' | 'deduction', item: Omit<AdjustmentItem, 'id'>) => void;
  onRemoveAdjustment: (empId: string, type: 'reimbursement' | 'deduction', itemId: string) => void;
}

export const PayrollAdjustmentsManager: React.FC<PayrollAdjustmentsManagerProps> = ({
  currentMonth,
  employees,
  adjustments,
  onAddAdjustment,
  onRemoveAdjustment
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [itemType, setItemType] = useState<'reimbursement' | 'deduction'>('reimbursement');
  const [category, setCategory] = useState<string>('Travel / EV Road Trials');
  const [amount, setAmount] = useState<number>(1000);
  const [remarks, setRemarks] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const adjKey = `${selectedEmpId}_${currentMonth}`;
  const empAdj = adjustments[adjKey] || { empId: selectedEmpId, month: currentMonth, reimbursements: [], deductions: [] };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !remarks.trim()) return;

    onAddAdjustment(selectedEmpId, itemType, {
      category,
      amount,
      remarks
    });

    setRemarks('');
    setSuccessMsg(`Added ₹${amount.toLocaleString('en-IN')} ${itemType} for ${selectedEmp.personalDetails.firstName}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const totalReimb = empAdj.reimbursements.reduce((sum, r) => sum + r.amount, 0);
  const totalDeduct = empAdj.deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FF5E0E]" />
            <h2 className="text-lg font-bold text-white">Pre-Payroll Reimbursements & Deductions</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Add discretionary monthly adjustments, expense claims, travel reimbursements, or salary advance recoveries before finalizing the payroll and exporting the bank transfer sheet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">Select Staff:</label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="bg-[#181D27] border border-[#262D3D] text-xs text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF5E0E]"
          >
            {employees.map(e => (
              <option key={e.id} value={e.id}>
                {e.personalDetails.firstName} {e.personalDetails.lastName} ({e.empCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Entry Form */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5 space-y-4">
          <div className="border-b border-[#262D3D] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF5E0E]" />
              Add New Adjustment ({currentMonth})
            </h3>
            <p className="text-[11px] text-gray-400">
              For {selectedEmp.personalDetails.firstName} {selectedEmp.personalDetails.lastName}
            </p>
          </div>

          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Adjustment Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setItemType('reimbursement');
                    setCategory('Travel / EV Road Trials');
                  }}
                  className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                    itemType === 'reimbursement'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[#181D27] text-gray-400 border border-[#262D3D]'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Reimbursement (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemType('deduction');
                    setCategory('Salary Advance Recovery');
                  }}
                  className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                    itemType === 'deduction'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-[#181D27] text-gray-400 border border-[#262D3D]'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Deduction (-)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Category</label>
              {itemType === 'reimbursement' ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                >
                  <option value="Travel / EV Road Trials">Travel / EV Road Trials</option>
                  <option value="Battery Component Prototype Testing">Battery Component Prototype Testing</option>
                  <option value="Broadband & Telemetry Support">Broadband & Telemetry Support</option>
                  <option value="Fuel / Field Conveyance">Fuel / Field Conveyance</option>
                  <option value="Medical Reimbursement">Medical Reimbursement</option>
                  <option value="Client Visit / Entertainment">Client Visit / Entertainment</option>
                  <option value="Other Reimbursement">Other Reimbursement</option>
                </select>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                >
                  <option value="Salary Advance Recovery">Salary Advance Recovery</option>
                  <option value="Asset Damage / Lost Tooling">Asset Damage / Lost Tooling</option>
                  <option value="Security Uniform Deduction">Security Uniform Deduction</option>
                  <option value="Loan Installment">Loan Installment</option>
                  <option value="Late Disciplinary Deduction">Late Disciplinary Deduction</option>
                  <option value="Other Deduction">Other Deduction</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Amount (INR)</label>
              <input
                type="number"
                step="100"
                min="1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Remarks / Voucher Number</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Fuel bills verified by plant admin; voucher #EV-9821"
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF5E0E] hover:bg-[#E04E05] text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5E0E]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Employee Payroll</span>
            </button>
          </form>

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Current Adjustments for Selected Employee */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Summary Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
              <span className="text-xs text-gray-400">Total Reimbursements (Added)</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                + ₹ {totalReimb.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
              <span className="text-xs text-gray-400">Total Deductions (Subtracted)</span>
              <p className="text-xl font-bold text-rose-400 mt-1">
                - ₹ {totalDeduct.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Active Items Table */}
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Active Items for {selectedEmp.personalDetails.firstName} ({currentMonth})
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {empAdj.reimbursements.length + empAdj.deductions.length} Total Adjustments
              </span>
            </div>

            <div className="divide-y divide-[#262D3D] max-h-[400px] overflow-y-auto">
              {empAdj.reimbursements.length === 0 && empAdj.deductions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No adjustments configured for this employee in {currentMonth}.
                </div>
              ) : (
                <>
                  {/* Reimbursements */}
                  {empAdj.reimbursements.map(r => (
                    <div key={r.id} className="p-3.5 hover:bg-[#181D27]/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] border border-emerald-500/30">
                            Reimbursement
                          </span>
                          <span className="font-bold text-white">{r.category}</span>
                        </div>
                        <p className="text-gray-400 mt-0.5">{r.remarks}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          + ₹ {r.amount.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onRemoveAdjustment(selectedEmpId, 'reimbursement', r.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Deductions */}
                  {empAdj.deductions.map(d => (
                    <div key={d.id} className="p-3.5 hover:bg-[#181D27]/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold text-[10px] border border-rose-500/30">
                            Deduction
                          </span>
                          <span className="font-bold text-white">{d.category}</span>
                        </div>
                        <p className="text-gray-400 mt-0.5">{d.remarks}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-rose-400 text-sm">
                          - ₹ {d.amount.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onRemoveAdjustment(selectedEmpId, 'deduction', d.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
