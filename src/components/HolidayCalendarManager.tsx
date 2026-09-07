import React, { useState, useMemo } from 'react';
import { Holiday, Employee } from '../types/payroll';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Sparkles,
  Search,
  RotateCcw,
  X,
  Users,
  Check,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  INITIAL_HOLIDAYS_2026, 
  MAX_TOTAL_ANNUAL_HOLIDAYS, 
  MANDATORY_HOLIDAY_COUNT, 
  MAX_RESTRICTED_HOLIDAYS_PER_EMPLOYEE 
} from '../data/holidays';

interface HolidayCalendarManagerProps {
  holidays: Holiday[];
  employees?: Employee[];
  employeeRestrictedHolidays?: Record<string, string[]>;
  onUpdateEmployeeRestrictedHolidays?: (empId: string, holidayIds: string[]) => void;
  onAddHoliday: (holiday: Holiday) => void;
  onUpdateHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
  onResetHolidays: () => void;
  onBatchImportHolidays: (holidays: Holiday[]) => void;
}

export const HolidayCalendarManager: React.FC<HolidayCalendarManagerProps> = ({
  holidays,
  employees = [],
  employeeRestrictedHolidays = {},
  onUpdateEmployeeRestrictedHolidays,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  onResetHolidays,
  onBatchImportHolidays
}) => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'ALLOCATIONS'>('CALENDAR');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  // Form State for Adding / Editing Holiday
  const [holidayDate, setHolidayDate] = useState<string>('2026-08-15');
  const [holidayName, setHolidayName] = useState<string>('');
  const [holidayType, setHolidayType] = useState<'NATIONAL' | 'FESTIVAL' | 'STATE' | 'MANDATORY' | 'RESTRICTED'>('RESTRICTED');
  const [holidayDesc, setHolidayDesc] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [ruleAlert, setRuleAlert] = useState<string | null>(null);

  // Staff Allocation Modal State
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Employee | null>(null);

  // Derive day of week from date
  const getDayOfWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Unknown';
    }
  };

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setHolidayDate(new Date().toISOString().split('T')[0]);
    setHolidayName('');
    setHolidayType('RESTRICTED');
    setHolidayDesc('');
    setIsMandatory(false);
    setIsPaid(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Holiday) => {
    setEditingHoliday(h);
    setHolidayDate(h.date);
    setHolidayName(h.name);
    setHolidayType((h.type as any) || 'RESTRICTED');
    setHolidayDesc(h.description || '');
    setIsMandatory(h.isMandatory || h.type === 'MANDATORY');
    setIsPaid(h.isPaid !== false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    const dayOfWeek = getDayOfWeek(holidayDate);
    const finalType = isMandatory ? 'MANDATORY' : holidayType;

    if (editingHoliday) {
      onUpdateHoliday({
        ...editingHoliday,
        name: holidayName.trim(),
        date: holidayDate,
        dayOfWeek,
        type: finalType,
        description: holidayDesc.trim(),
        isPaid,
        isMandatory
      });
      setNotice(`Updated holiday "${holidayName}"!`);
    } else {
      const newHol: Holiday = {
        id: `hol-${holidayDate}-${Date.now().toString().slice(-4)}`,
        name: holidayName.trim(),
        date: holidayDate,
        dayOfWeek,
        type: finalType,
        description: holidayDesc.trim(),
        isPaid,
        isMandatory
      };
      onAddHoliday(newHol);
      setNotice(`Added holiday "${holidayName}" to annual calendar!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNotice(null), 6000);
  };

  // Toggle restricted holiday for an employee with strict limit enforcement
  const handleToggleRestrictedHoliday = (empId: string, holId: string) => {
    if (!onUpdateEmployeeRestrictedHolidays) return;

    const currentChosen = employeeRestrictedHolidays[empId] || [];
    const isAlreadyChosen = currentChosen.includes(holId);

    if (isAlreadyChosen) {
      // Remove
      const next = currentChosen.filter(id => id !== holId);
      onUpdateEmployeeRestrictedHolidays(empId, next);
      setRuleAlert(null);
    } else {
      // Check limit: cannot cross MAX_RESTRICTED_HOLIDAYS_PER_EMPLOYEE (3)
      if (currentChosen.length >= MAX_RESTRICTED_HOLIDAYS_PER_EMPLOYEE) {
        setRuleAlert(
          `Rule Enforced: Total leaves cannot cross ${MAX_TOTAL_ANNUAL_HOLIDAYS} per employee (${MANDATORY_HOLIDAY_COUNT} mandatory + ${MAX_RESTRICTED_HOLIDAYS_PER_EMPLOYEE} restricted holidays). Please deselect an existing restricted holiday first.`
        );
        setTimeout(() => setRuleAlert(null), 6000);
        return;
      }
      const next = [...currentChosen, holId];
      onUpdateEmployeeRestrictedHolidays(empId, next);
      setRuleAlert(null);
    }
  };

  // Bulk / Preset Assigners
  const handleAssignPreset = (empId: string, presetType: 'DEEPAWALI' | 'BAKRID' | 'CUSTOM') => {
    if (!onUpdateEmployeeRestrictedHolidays) return;

    // Find Deepawali or Bakrid holiday IDs
    const deepawaliHol = holidays.find(h => /deepavali|diwali/i.test(h.name))?.id || 'hol-2026-11-08';
    const bakridHol = holidays.find(h => /bakrid|eid-ul-adha/i.test(h.name))?.id || 'hol-2026-05-27';
    const ramzanHol = holidays.find(h => /eid-ul-fitr|ramzan/i.test(h.name))?.id || 'hol-2026-03-21';
    const ganeshHol = holidays.find(h => /ganesh|vinayaka/i.test(h.name))?.id || 'hol-2026-09-04';
    const ugadiHol = holidays.find(h => /ugadi/i.test(h.name))?.id || 'hol-2026-03-19';
    const newYearHol = holidays.find(h => /new year/i.test(h.name))?.id || 'hol-2026-01-01';

    let selected: string[] = [];
    if (presetType === 'DEEPAWALI') {
      selected = [deepawaliHol, ganeshHol, ugadiHol].slice(0, 3);
    } else if (presetType === 'BAKRID') {
      selected = [bakridHol, ramzanHol, newYearHol].slice(0, 3);
    }

    onUpdateEmployeeRestrictedHolidays(empId, selected);
    setNotice(`Updated holiday choices for staff member (allocated 3 restricted leaves; total 8 leaves)`);
    setTimeout(() => setNotice(null), 4000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Holiday Name', 'Type', 'Mandatory Status', 'Description', 'Paid Status'];
    const rows = holidays.map(h => [
      h.date,
      h.dayOfWeek || '',
      `"${h.name}"`,
      h.type,
      h.isMandatory ? 'Mandatory (All Staff)' : 'Restricted (Choice)',
      `"${h.description || ''}"`,
      h.isPaid ? 'PAID' : 'UNPAID'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RIVOT_Holiday_Calendar_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Import
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const parsedHolidays: Holiday[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3 && parts[0] && parts[2]) {
          const date = parts[0];
          const name = parts[2];
          const isMand = /mandatory/i.test(parts[4] || '') || /national/i.test(parts[3] || '');
          parsedHolidays.push({
            id: `hol-${date}-${i}`,
            date,
            dayOfWeek: parts[1] || getDayOfWeek(date),
            name,
            type: isMand ? 'MANDATORY' : 'RESTRICTED',
            description: parts[5] || '',
            isPaid: (parts[6] || 'PAID').toUpperCase() === 'PAID',
            isMandatory: isMand
          });
        }
      }

      if (parsedHolidays.length > 0) {
        onBatchImportHolidays(parsedHolidays);
        setNotice(`Successfully imported ${parsedHolidays.length} holidays from CSV file!`);
        setTimeout(() => setNotice(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const mandatoryHolidays = holidays.filter(h => h.isMandatory || h.type === 'MANDATORY');
  const restrictedHolidays = holidays.filter(h => !h.isMandatory && h.type !== 'MANDATORY');

  // Filtered holidays for Master Calendar view
  const filteredHolidays = [...holidays]
    .filter(h => {
      const matchesSearch = 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.date.includes(searchTerm) ||
        (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesType = true;
      if (filterType === 'MANDATORY') matchesType = !!h.isMandatory || h.type === 'MANDATORY';
      else if (filterType === 'RESTRICTED') matchesType = !h.isMandatory && h.type !== 'MANDATORY';
      else if (filterType === 'NATIONAL') matchesType = h.type === 'NATIONAL' || h.type === 'MANDATORY';
      else if (filterType === 'FESTIVAL') matchesType = h.type === 'FESTIVAL' || h.type === 'RESTRICTED';
      else if (filterType === 'STATE') matchesType = h.type === 'STATE';

      return matchesSearch && matchesType;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Statutory Holiday Rule */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/15 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Holiday & Leave Rule Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold font-mono">
                Total Cap: Max 8 Leaves / Employee
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#FF5E0E]" />
              Annual Holiday Calendar & Restricted Choice Manager
            </h2>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              <strong>Rule Active:</strong> Total number of holiday leaves cannot cross <strong className="text-white font-mono">8 per employee</strong>. 
              Staff must take the <strong className="text-emerald-400">5 mandatory statutory leaves</strong>, plus any <strong className="text-purple-400">3 restricted holidays</strong> as per their individual choice from the added list (e.g., Hindu staff choose Deepawali, Muslim staff choose Bakrid, Christian staff choose Christmas, etc.).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              title="Download holidays as CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <label className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetHolidays}
              className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-400 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              title="Reset to official RIVOT Calendar with Deepawali & Bakrid"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {ruleAlert && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-semibold">{ruleAlert}</span>
          </div>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Available</span>
          <p className="text-2xl font-black text-white mt-1">{holidays.length}</p>
          <div className="text-[11px] text-gray-500 mt-1">Calendar Year 2026</div>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold">Mandatory Leaves</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{mandatoryHolidays.length} <span className="text-xs font-normal text-gray-400">/ 5 required</span></p>
          <div className="text-[11px] text-gray-500 mt-1">100% of Staff Entitled</div>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-purple-400 uppercase font-semibold">Restricted Choice List</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{restrictedHolidays.length} <span className="text-xs font-normal text-gray-400">options</span></p>
          <div className="text-[11px] text-gray-500 mt-1">Staff pick any 3 (Deepawali, Bakrid, etc.)</div>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl">
          <span className="text-[11px] text-[#FF5E0E] uppercase font-semibold">Employee Entitlement</span>
          <p className="text-2xl font-black text-[#FF5E0E] mt-1">8 Leaves</p>
          <div className="text-[11px] text-gray-500 mt-1">5 Mandatory + 3 Restricted</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Master Calendar vs Staff Holiday Choices */}
      <div className="flex border-b border-[#262D3D] gap-6">
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'CALENDAR'
              ? 'border-[#FF5E0E] text-[#FF5E0E]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Annual Master Holiday Schedule ({holidays.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALLOCATIONS')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ALLOCATIONS'
              ? 'border-[#FF5E0E] text-[#FF5E0E]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Holiday Allocations & Deepawali / Bakrid Choices ({employees.length} Staff)</span>
        </button>
      </div>

      {/* VIEW 1: Master Calendar */}
      {activeTab === 'CALENDAR' && (
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#FF5E0E]" />
              <h3 className="text-sm font-bold text-white">Master Holidays & Observances</h3>
              <span className="text-xs text-gray-500 font-mono">({filteredHolidays.length} displayed)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter Buttons */}
              <div className="flex bg-[#181D27] p-1 rounded-xl border border-[#262D3D] text-[11px]">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === 'ALL' ? 'bg-[#FF5E0E] text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({holidays.length})
                </button>
                <button
                  onClick={() => setFilterType('MANDATORY')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === 'MANDATORY' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  5 Mandatory ({mandatoryHolidays.length})
                </button>
                <button
                  onClick={() => setFilterType('RESTRICTED')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === 'RESTRICTED' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Restricted Choice ({restrictedHolidays.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search holiday name or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#181D27] border border-[#262D3D] text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-[#FF5E0E] w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0D11] text-gray-400 border-b border-[#262D3D]">
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Holiday Occasion</th>
                  <th className="py-3 px-4">Policy Classification</th>
                  <th className="py-3 px-4">Occasion Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2330]">
                {filteredHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No holidays match the selected filter. Click &quot;Add Holiday&quot; to register a new one.
                    </td>
                  </tr>
                ) : (
                  filteredHolidays.map(h => {
                    const isMand = h.isMandatory || h.type === 'MANDATORY';
                    const isSpecialDeepawaliOrBakrid = /deepavali|diwali|bakrid/i.test(h.name);

                    return (
                      <tr key={h.id} className={`hover:bg-[#181D27]/50 transition-colors ${isSpecialDeepawaliOrBakrid ? 'bg-amber-500/5' : ''}`}>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white block">{h.date}</span>
                          <span className="text-[10px] text-gray-400">{h.dayOfWeek}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{h.name}</span>
                            {isSpecialDeepawaliOrBakrid && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                                RH Choice
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isMand ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3" />
                              Mandatory (1 of 5)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1 w-fit">
                              <Star className="w-3 h-3" />
                              Restricted Choice (RH)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-[11px] max-w-xs truncate">
                          {h.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Paid Holiday
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(h)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#202734] rounded-lg transition-colors"
                              title="Edit Holiday Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteHoliday(h.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Staff Holiday Choices (Deepawali vs Bakrid Rule) */}
      {activeTab === 'ALLOCATIONS' && (
        <div className="space-y-4">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF5E0E]" />
                  Employee Restricted Holiday Selections
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Each staff member must have the 5 mandatory leaves, and can choose up to 3 restricted holidays (Total leaves capped at 8).
                </p>
              </div>
              <div className="text-xs text-gray-300 bg-[#181D27] px-3 py-1.5 rounded-xl border border-[#262D3D]">
                Rule: <span className="text-emerald-400 font-bold">5 Mandatory</span> + <span className="text-purple-400 font-bold">Max 3 Restricted</span> = <span className="text-[#FF5E0E] font-bold">8 Leaves</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {employees.map(emp => {
                const chosenIds = employeeRestrictedHolidays[emp.id] || emp.selectedRestrictedHolidays || [];
                const chosenHols = holidays.filter(h => chosenIds.includes(h.id) || chosenIds.includes(h.name) || chosenIds.includes(h.date));
                const totalLeaves = MANDATORY_HOLIDAY_COUNT + chosenHols.length;
                const hasDeepawali = chosenHols.some(h => /deepavali|diwali/i.test(h.name));
                const hasBakrid = chosenHols.some(h => /bakrid|eid-ul-adha/i.test(h.name));

                return (
                  <div 
                    key={emp.id}
                    className="bg-[#0B0D11] border border-[#262D3D] rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#FF5E0E]/40 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-xs">
                            {emp.personalDetails.firstName} {emp.personalDetails.lastName}
                          </p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {emp.empCode} • {emp.employmentDetails?.department || 'Staff'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#181D27] border border-[#262D3D] text-gray-200">
                          {totalLeaves} / 8 Leaves
                        </span>
                      </div>

                      {/* Mandatory Leaves Included Indicator */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>5 Statutory Mandatory Leaves (Assigned to all)</span>
                      </div>

                      {/* Chosen Restricted Holidays */}
                      <div className="mt-2 space-y-1.5">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                          Restricted Holidays ({chosenHols.length} / 3):
                        </span>
                        {chosenHols.length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic">No restricted holidays selected yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {chosenHols.map(ch => {
                              const isDeep = /deepavali|diwali/i.test(ch.name);
                              const isBak = /bakrid/i.test(ch.name);
                              return (
                                <span 
                                  key={ch.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    isDeep 
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                      : isBak 
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }`}
                                >
                                  {ch.name.split('/')[0].trim()}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons & Presets */}
                    <div className="pt-2 border-t border-[#1D2330] flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAssignPreset(emp.id, 'DEEPAWALI')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            hasDeepawali
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-[#181D27] text-gray-400 hover:text-white hover:bg-[#222938]'
                          }`}
                          title="Assign Deepawali choice group"
                        >
                          Deepawali
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignPreset(emp.id, 'BAKRID')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            hasBakrid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-[#181D27] text-gray-400 hover:text-white hover:bg-[#222938]'
                          }`}
                          title="Assign Bakrid choice group"
                        >
                          Bakrid
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStaffForEdit(emp)}
                        className="px-2.5 py-1 rounded-lg bg-[#FF5E0E]/15 hover:bg-[#FF5E0E]/25 text-[#FF5E0E] text-[10px] font-bold transition-all"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Staff Holiday Customization Modal */}
      {selectedStaffForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Restricted Holidays for {selectedStaffForEdit.personalDetails.firstName} {selectedStaffForEdit.personalDetails.lastName}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">
                  Employee Code: {selectedStaffForEdit.empCode} • Max 3 Restricted Holidays (Total 8 Leaves)
                </p>
              </div>
              <button
                onClick={() => setSelectedStaffForEdit(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Policy Rule Box */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                <strong>Statutory Leave Policy:</strong> Every employee is already assigned the 5 mandatory holidays (Republic Day, May Day, Independence Day, Gandhi Jayanti, Kannada Rajyotsava). Choose up to 3 restricted holidays below so total leaves do not cross 8.
              </div>

              {ruleAlert && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ruleAlert}</span>
                </div>
              )}

              {/* Counter */}
              {(() => {
                const currentChosen = employeeRestrictedHolidays[selectedStaffForEdit.id] || selectedStaffForEdit.selectedRestrictedHolidays || [];
                return (
                  <div className="flex items-center justify-between text-xs bg-[#0B0D11] p-3 rounded-xl border border-[#262D3D]">
                    <span className="text-gray-300">Selected Restricted Leaves:</span>
                    <span className={`font-mono font-bold ${currentChosen.length === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentChosen.length} / 3 Selected (Total: {5 + currentChosen.length} / 8 leaves)
                    </span>
                  </div>
                );
              })()}

              {/* List of Available Restricted Holidays */}
              <div className="space-y-2">
                <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                  Select from Added Restricted Holidays List:
                </span>
                {restrictedHolidays.map(rh => {
                  const currentChosen = employeeRestrictedHolidays[selectedStaffForEdit.id] || selectedStaffForEdit.selectedRestrictedHolidays || [];
                  const isSelected = currentChosen.includes(rh.id) || currentChosen.includes(rh.name) || currentChosen.includes(rh.date);

                  return (
                    <div
                      key={rh.id}
                      onClick={() => handleToggleRestrictedHoliday(selectedStaffForEdit.id, rh.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#FF5E0E]/15 border-[#FF5E0E] text-white'
                          : 'bg-[#0B0D11] border-[#262D3D] text-gray-300 hover:border-[#FF5E0E]/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{rh.name}</span>
                          <span className="font-mono text-[10px] text-gray-400">({rh.date}, {rh.dayOfWeek})</span>
                        </div>
                        <p className="text-[11px] text-gray-400">{rh.description}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#FF5E0E] border-[#FF5E0E] text-white' : 'border-[#384257]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-[#0B0D11] border-t border-[#262D3D] flex justify-end">
              <button
                onClick={() => setSelectedStaffForEdit(null)}
                className="px-4 py-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs font-bold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Master Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#FF5E0E]" />
                {editingHoliday ? 'Edit Holiday Details' : 'Add Annual Holiday'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Holiday Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5E0E]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Holiday Name / Occasion</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepavali / Bakrid / Eid-ul-Adha"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5E0E]"
                />
              </div>

              {/* Policy Classification: Mandatory vs Restricted Choice */}
              <div>
                <label className="block text-gray-400 mb-1">Holiday Classification (8 Leaves Rule)</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#262D3D] bg-[#181D27] cursor-pointer">
                    <input
                      type="radio"
                      name="holidayCategory"
                      checked={isMandatory}
                      onChange={() => {
                        setIsMandatory(true);
                        setHolidayType('MANDATORY');
                      }}
                      className="accent-[#FF5E0E]"
                    />
                    <div>
                      <span className="text-white font-bold block">Mandatory Statutory Leave (1 of 5)</span>
                      <span className="text-[10px] text-gray-400">All staff are entitled to this holiday by law.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#262D3D] bg-[#181D27] cursor-pointer">
                    <input
                      type="radio"
                      name="holidayCategory"
                      checked={!isMandatory}
                      onChange={() => {
                        setIsMandatory(false);
                        setHolidayType('RESTRICTED');
                      }}
                      className="accent-[#FF5E0E]"
                    />
                    <div>
                      <span className="text-white font-bold block">Restricted / Optional Holiday (Choice of 3)</span>
                      <span className="text-[10px] text-gray-400">Staff choose up to 3 restricted holidays (Deepawali, Bakrid, etc.).</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Occasion Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding holiday significance..."
                  value={holidayDesc}
                  onChange={(e) => setHolidayDesc(e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5E0E]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="accent-[#FF5E0E] w-4 h-4 rounded"
                  />
                  <span className="text-white font-medium block">Paid Holiday (No Loss of Pay)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#262D3D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#181D27] hover:bg-[#202734] text-gray-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#FF5E0E]/20"
                >
                  <span>{editingHoliday ? 'Save Changes' : 'Add to Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
