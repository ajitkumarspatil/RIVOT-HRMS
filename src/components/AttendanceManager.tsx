import React, { useState, useRef, useMemo } from 'react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  AttendanceStatus,
  LeaveApplication,
  Holiday
} from '../types/payroll';
import { 
  parseBiometricCSV, 
  processMonthlyAttendance, 
  generateSamplePunchCSV,
  detectBiometricMonth,
  detectMonthFromCSV2ndColumn,
  RawPunchRecord
} from '../utils/csvPunchParser';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Info,
  UserCheck,
  Calendar,
  Filter,
  Save,
  X,
  Trash2,
  RefreshCw,
  FileUp,
  FileCheck,
  ArrowRight
} from 'lucide-react';

interface AttendanceManagerProps {
  currentMonth: string;
  onMonthChange?: (month: string) => void;
  employees: Employee[];
  attendanceRecords: DailyAttendanceRecord[];
  onUpdateAttendance: (records: DailyAttendanceRecord[]) => void;
  onClearAttendance: () => void;
  onLoadSampleAttendance?: () => void;
  approvedLeaves: LeaveApplication[];
  onAddAdminOverride: (override: DailyAttendanceRecord) => void;
  holidays?: Holiday[];
  employeeRestrictedHolidays?: Record<string, string[]>;
  rawBiometricPunches?: RawPunchRecord[];
  onUpdateRawPunches?: (punches: RawPunchRecord[], newMonth?: string) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  currentMonth,
  onMonthChange,
  employees,
  attendanceRecords,
  onUpdateAttendance,
  onClearAttendance,
  onLoadSampleAttendance,
  approvedLeaves,
  onAddAdminOverride,
  holidays = [],
  employeeRestrictedHolidays = {},
  rawBiometricPunches = [],
  onUpdateRawPunches
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState<string>('ALL');
  const [editingRecord, setEditingRecord] = useState<DailyAttendanceRecord | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('PRESENT');
  const [newInTime, setNewInTime] = useState<string>('09:15');
  const [newOutTime, setNewOutTime] = useState<string>('18:30');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);

  // Dominant month detected in current raw biometric punches
  const punchFileMonth = useMemo(() => {
    if (!rawBiometricPunches || rawBiometricPunches.length === 0) return null;
    return detectBiometricMonth(rawBiometricPunches);
  }, [rawBiometricPunches]);

  const processCSVContent = (content: string, fileName: string) => {
    // 1. Detect month directly from the 2nd column of the CSV upload
    const monthFrom2ndCol = detectMonthFromCSV2ndColumn(content);
    const rawPunches = parseBiometricCSV(content);
    if (rawPunches.length === 0) {
      setUploadSuccessMessage(`Warning: No valid punch rows found in "${fileName}". Please ensure columns contain punch times and employee IDs.`);
      return;
    }

    // Direct month extraction from 2nd column timestamp
    const detectedMonth = monthFrom2ndCol || detectBiometricMonth(rawPunches);
    const targetMonth = detectedMonth || currentMonth;

    if (onUpdateRawPunches) {
      // Passes punches and detected targetMonth to App which updates active month and attendance atomically
      onUpdateRawPunches(rawPunches, targetMonth);
    } else {
      if (detectedMonth && detectedMonth !== currentMonth) {
        onMonthChange?.(detectedMonth);
      }
      const processed = processMonthlyAttendance(
        targetMonth, 
        rawPunches, 
        employees, 
        approvedLeaves, 
        {}, 
        holidays,
        employeeRestrictedHolidays
      );
      onUpdateAttendance(processed);
    }

    const uniqueRawEmpIds = new Set(rawPunches.map(p => p.empId));
    const dates = rawPunches.map(p => p.dateStr).sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    setUploadSuccessMessage(
      `Latest Biometric File Overwritten & Applied: "${fileName}" for ${targetMonth} loaded (${rawPunches.length.toLocaleString('en-IN')} punches across ${uniqueRawEmpIds.size} employees, ${minDate} to ${maxDate}). Any prior punch data for ${targetMonth} has been cleanly replaced.`
    );
    setTimeout(() => setUploadSuccessMessage(null), 10000);
  };

  // File Upload Handler via Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        processCSVContent(content, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadSuccessMessage('Please upload a .csv biometric file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        processCSVContent(content, file.name);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const csvContent = generateSamplePunchCSV(currentMonth, employees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `R-1788755798747-f9Ji_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    if (selectedEmpFilter !== 'ALL' && r.empId !== selectedEmpFilter && r.empCode !== selectedEmpFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'ALL') {
      if (selectedStatusFilter === 'LOST_WO' && r.status !== 'WEEKLY_OFF_LOST') return false;
      if (selectedStatusFilter === 'LOP' && r.status !== 'ABSENT_LOP') return false;
      if (selectedStatusFilter === 'HALF' && r.status !== 'HALF_DAY') return false;
      if (selectedStatusFilter === 'PRESENT' && r.status !== 'PRESENT') return false;
      if (selectedStatusFilter === 'SENIOR' && !r.isSeniorExempt) return false;
      if (selectedStatusFilter === 'OVERRIDE' && !r.adminOverride) return false;
    }
    return true;
  });

  // Calculate high level summary counts
  const totalDays = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const halfDayCount = attendanceRecords.filter(r => r.status === 'HALF_DAY').length;
  const lopCount = attendanceRecords.filter(r => r.status === 'ABSENT_LOP').length;
  const lostWeeklyOffs = attendanceRecords.filter(r => r.status === 'WEEKLY_OFF_LOST').length;
  const seniorPunches = attendanceRecords.filter(r => r.isSeniorExempt && r.status === 'PRESENT').length;

  const handleExecuteCleanRecords = () => {
    onClearAttendance();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedEmpFilter('ALL');
    setSelectedStatusFilter('ALL');
    setIsConfirmClearOpen(false);
    setUploadSuccessMessage(`All biometric attendance records for ${currentMonth} have been successfully cleared. Upload a fresh punch CSV anytime.`);
    setTimeout(() => setUploadSuccessMessage(null), 8000);
  };

  const handleOpenEdit = (rec: DailyAttendanceRecord) => {
    setEditingRecord(rec);
    setNewStatus(rec.status);
    setNewInTime(rec.firstPunch || '09:15');
    setNewOutTime(rec.lastPunch || '18:30');
    setOverrideReason(rec.adminOverride?.reason || 'Employee unintentional punch miss verified with department head');
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    let durationHours = 0;
    if (newInTime && newOutTime) {
      const [h1, m1] = newInTime.split(':').map(Number);
      const [h2, m2] = newOutTime.split(':').map(Number);
      durationHours = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
    }

    const updatedRecord: DailyAttendanceRecord = {
      ...editingRecord,
      status: newStatus,
      firstPunch: newInTime,
      lastPunch: newOutTime,
      totalHours: Math.round(durationHours * 10) / 10,
      adminOverride: {
        modifiedBy: 'Admin (RIVOT HR)',
        originalStatus: editingRecord.status,
        newStatus,
        reason: overrideReason,
        timestamp: new Date().toISOString()
      }
    };

    onAddAdminOverride(updatedRecord);
    setEditingRecord(null);
  };

  const getStatusBadge = (status: AttendanceStatus, isSenior: boolean, isWeeklyOffLost: boolean) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Present</span>
            {isSenior && <span className="ml-1 text-[9px] text-amber-300 font-normal">(&gt;2yr Exempt)</span>}
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Half Day (4-9h)</span>
          </span>
        );
      case 'ABSENT_LOP':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Loss of Pay (LOP)</span>
          </span>
        );
      case 'WEEKLY_OFF':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span>Weekly Off</span>
          </span>
        );
      case 'WEEKLY_OFF_LOST':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-900/30 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Weekly Off Forfeited (LOP in Week)</span>
          </span>
        );
      case 'APPROVED_LEAVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <span>Approved Leave</span>
          </span>
        );
      default:
        return <span className="text-xs text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upload & Instructions Card */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF5E0E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Automated Biometric Engine
              </span>
              <span className="text-xs text-gray-400">
                Shift: Minimum 9h Full Day / 4h Half Day
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Monthly Biometric Punch Upload & Attendance Engine
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Upload your biometric device CSV (<code className="text-orange-300">R-1788755798747-f9Ji.csv</code>). 
              Punches are extracted from column 2 (time), column 4 (first name), and column 5 (ID). 
              The system isolates the first and last punch of each day to compute full days, half days, and Loss of Pay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto Month Detection from 2nd Column Badge */}
            <div className="flex items-center gap-2 bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2 text-xs text-gray-300" title="Month is auto-detected directly from 2nd column timestamps of uploaded CSV">
              <Clock className="w-3.5 h-3.5 text-[#FF5E0E] shrink-0" />
              <span className="text-[11px] text-gray-400">Month Detection:</span>
              <span className="text-xs font-semibold text-emerald-400 font-mono">Auto (CSV Col 2)</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Punch CSV</span>
            </button>

            {attendanceRecords.length > 0 && (
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                title="Clear all parsed biometric attendance records to test fresh upload"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clean All Records</span>
              </button>
            )}

            {onLoadSampleAttendance && attendanceRecords.length === 0 && (
              <button
                onClick={onLoadSampleAttendance}
                className="flex items-center gap-2 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/50 text-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                title="Load synthetic biometric punch sample records"
              >
                <RefreshCw className="w-4 h-4 text-[#FF5E0E]" />
                <span>Load Demo Punches</span>
              </button>
            )}

            <button
              onClick={handleDownloadSampleCSV}
              className="flex items-center gap-2 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] hover:border-[#FF5E0E]/50 text-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              title="Download sample matching R-1788755798747-f9Ji.csv"
            >
              <Download className="w-4 h-4 text-[#FF5E0E]" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>

        {/* Month Mismatch Warning Banner */}
        {punchFileMonth && punchFileMonth !== currentMonth && (
          <div className="mt-5 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-amber-300 text-sm">
                  Active Month Mismatch: Uploaded Biometric CSV is for {punchFileMonth}
                </p>
                <p className="text-amber-200/90 text-xs mt-0.5 leading-relaxed">
                  You are currently viewing <strong className="text-white underline">{currentMonth}</strong>. 
                  Since the biometric CSV contains punches strictly for <strong>{punchFileMonth}</strong>, there are 0 punches found in {currentMonth}, which causes the system to evaluate every employee as <strong>Absent (LOP)</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => onMonthChange?.(punchFileMonth)}
              className="px-4 py-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white font-bold rounded-xl transition-all text-xs shrink-0 flex items-center gap-2 shadow-lg shadow-[#FF5E0E]/20"
            >
              <span>Switch to {punchFileMonth}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Aligned Active Punch Banner */}
        {punchFileMonth && punchFileMonth === currentMonth && (
          <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Active biometric punches accurately mapped to <strong>{currentMonth}</strong> ({rawBiometricPunches.length.toLocaleString('en-IN')} punches parsed).
              </span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Synced & Present
            </span>
          </div>
        )}

        {/* Drag and Drop Zone Banner */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-[#FF5E0E] bg-[#FF5E0E]/10 scale-[1.01]' 
              : 'border-[#262D3D] hover:border-[#FF5E0E]/50 hover:bg-[#181D27]/40 bg-[#0B0D11]/60'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-white">
                Drag and drop your biometric punch CSV here, or <span className="text-[#FF5E0E] underline">browse files</span>
              </p>
              <p className="text-[11px] text-gray-400">
                Supports standard biometric device export (columns: Time, Name, ID). E.g. <code className="text-orange-300">R-1788755798747-f9Ji.csv</code>
              </p>
            </div>
          </div>
        </div>

        {uploadSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-relaxed">{uploadSuccessMessage}</span>
          </div>
        )}

        {/* Attendance Rules Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#262D3D] text-xs">
          <div className="flex items-start gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-[#FF5E0E] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">9 Hours / 4 Hours Rule:</span>
              <p className="text-gray-400 text-[11px]">Duration between first and last punch &ge; 9h is Full Day; &ge; 4h is Half Day; &lt; 4h is LOP.</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-gray-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Seniority Exemption (&gt; 2 Years):</span>
              <p className="text-gray-400 text-[11px]">Staff with &ge; 2 years tenure from DOJ are exempt from minimum working hour requirements.</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-gray-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Weekly Off Forfeiture Rule:</span>
              <p className="text-gray-400 text-[11px]">Any unapproved LOP in a week takes away the subsequent Sunday weekly off!</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-gray-400 uppercase font-medium">Total Shift Days</span>
          <p className="text-xl font-bold text-white mt-1">{totalDays}</p>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-emerald-400 uppercase font-medium">Present (Full Day)</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{presentCount}</p>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-amber-400 uppercase font-medium">Half Days</span>
          <p className="text-xl font-bold text-amber-400 mt-1">{halfDayCount}</p>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-red-400 uppercase font-medium">Loss of Pay (LOP)</span>
          <p className="text-xl font-bold text-red-400 mt-1">{lopCount}</p>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-rose-300 uppercase font-medium">Lost Weekly Offs</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{lostWeeklyOffs}</p>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-3.5 rounded-xl">
          <span className="text-[11px] text-amber-300 uppercase font-medium">Senior Exempt Days</span>
          <p className="text-xl font-bold text-amber-300 mt-1">{seniorPunches}</p>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Filter Header */}
        <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF5E0E]" />
            <h3 className="text-sm font-bold text-white">Daily Attendance Matrix ({currentMonth})</h3>
            <span className="text-xs text-gray-500 font-mono">({filteredRecords.length} records)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Employee Filter */}
            <select
              value={selectedEmpFilter}
              onChange={(e) => setSelectedEmpFilter(e.target.value)}
              className="bg-[#181D27] border border-[#262D3D] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.personalDetails.firstName} {emp.personalDetails.lastName} ({emp.empCode})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#181D27] border border-[#262D3D] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF">Half Day</option>
              <option value="LOP">Loss of Pay (LOP)</option>
              <option value="LOST_WO">Forfeited Weekly Off</option>
              <option value="SENIOR">Senior Exempt (&gt;2 yrs)</option>
              <option value="OVERRIDE">Admin Overrides Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider sticky top-0 z-20 border-b border-[#262D3D]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Punch In (1st)</th>
                <th className="py-3 px-4">Punch Out (Last)</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D3D] text-gray-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#181D27] border border-[#262D3D] flex items-center justify-center mx-auto text-[#FF5E0E]">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          {attendanceRecords.length === 0 
                            ? 'Attendance Records Cleared — Ready for Biometric Upload' 
                            : 'No matching attendance records found'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {attendanceRecords.length === 0
                            ? 'All records have been cleared. Upload your biometric punch CSV file above to compute working hours, attendance status, and monthly payroll.'
                            : 'Adjust your employee or status filter to view other records.'}
                        </p>
                      </div>
                      {attendanceRecords.length === 0 && (
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF5E0E]/20"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Select Biometric CSV</span>
                          </button>
                          {onLoadSampleAttendance && (
                            <button
                              onClick={onLoadSampleAttendance}
                              className="inline-flex items-center gap-2 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#FF5E0E]" />
                              <span>Load Demo Data</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 100).map((r, idx) => (
                  <tr key={`${r.empId}_${r.date}_${idx}`} className="hover:bg-[#181D27]/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-gray-400 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{r.empName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{r.empCode}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {r.firstPunch ? (
                        <span className="text-emerald-400">{r.firstPunch}</span>
                      ) : (
                        <span className="text-gray-500">--:--</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {r.lastPunch ? (
                        <span className="text-amber-400">{r.lastPunch}</span>
                      ) : (
                        <span className="text-gray-500">--:--</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium">
                      {r.totalHours > 0 ? `${r.totalHours} hrs` : '--'}
                    </td>
                    <td className="py-2.5 px-4">
                      {getStatusBadge(r.status, r.isSeniorExempt, r.isWeeklyOffLost)}
                      {r.adminOverride && (
                        <span 
                          className="ml-2 text-[10px] text-orange-400 font-medium underline cursor-help"
                          title={`Modified by ${r.adminOverride.modifiedBy}: ${r.adminOverride.reason}`}
                        >
                          Overridden
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#FF5E0E] hover:text-white px-2 py-1 rounded bg-[#181D27] hover:bg-[#FF5E0E]/20 border border-[#262D3D] hover:border-[#FF5E0E]/40 transition-colors"
                        title="Edit unintentional missed punches or correct status"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredRecords.length > 100 && (
          <div className="p-3 bg-[#0B0D11] border-t border-[#262D3D] text-center text-xs text-gray-400">
            Showing first 100 records of {filteredRecords.length}. Filter by employee for focused view.
          </div>
        )}
      </div>

      {/* Admin Attendance Override Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#FF5E0E]" />
                  Admin Attendance Override
                </h3>
                <p className="text-xs text-gray-400">
                  {editingRecord.empName} ({editingRecord.empCode}) • {editingRecord.date}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#181D27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Adjusted Punch In</label>
                  <input
                    type="time"
                    value={newInTime}
                    onChange={(e) => setNewInTime(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Adjusted Punch Out</label>
                  <input
                    type="time"
                    value={newOutTime}
                    onChange={(e) => setNewOutTime(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Attendance Status Override</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white"
                >
                  <option value="PRESENT">Full Day Present (Paid)</option>
                  <option value="HALF_DAY">Half Day (4-9h)</option>
                  <option value="ABSENT_LOP">Loss of Pay (Absent / LOP)</option>
                  <option value="APPROVED_LEAVE">Approved Leave</option>
                  <option value="WEEKLY_OFF">Weekly Off (Sunday)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reason for Admin Modification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Unintentional punch miss due to hardware reset, verified with line supervisor."
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                />
              </div>

              <div className="p-3 bg-[#FF5E0E]/10 border border-[#FF5E0E]/30 rounded-xl text-orange-200 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#FF5E0E] shrink-0 mt-0.5" />
                <span>
                  Admin overrides are logged in the audit trail and directly update the Paid Days and LOP calculations in the monthly payroll.
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="bg-[#181D27] hover:bg-[#202734] text-gray-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clean All Records */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161E] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clean All Records for {currentMonth}?</h3>
                <p className="text-xs text-gray-400">Reset biometric punch data & attendance matrix</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-[#181D27] p-3.5 rounded-xl border border-[#262D3D]">
              This will clear all <strong className="text-white">{attendanceRecords.length}</strong> attendance records and raw punch timestamps for <strong className="text-rose-400">{currentMonth}</strong>. 
              This allows you to re-upload a fresh or updated biometric CSV without conflicts.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-4 py-2 bg-[#181D27] hover:bg-[#202734] text-gray-300 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanRecords}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Clean All Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
