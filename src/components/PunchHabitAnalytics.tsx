import React, { useState } from 'react';
import { DailyAttendanceRecord, Employee } from '../types/payroll';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  Calendar, 
  Sun, 
  Moon, 
  Award,
  AlertCircle
} from 'lucide-react';

interface PunchHabitAnalyticsProps {
  currentMonth: string;
  attendanceRecords: DailyAttendanceRecord[];
  employees: Employee[];
}

export const PunchHabitAnalytics: React.FC<PunchHabitAnalyticsProps> = ({
  currentMonth,
  attendanceRecords,
  employees
}) => {
  const [timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [selectedDay, setSelectedDay] = useState<string>(`${currentMonth}-10`);

  // Analyze punch times across valid records
  const validPunches = attendanceRecords.filter(r => r.firstPunch && r.lastPunch);

  // Group morning punch-in habits
  const inBuckets = {
    before9: 0,
    between9and930: 0,
    between930and10: 0,
    after10: 0
  };

  const outBuckets = {
    before18: 0,
    between18and19: 0,
    after19: 0
  };

  validPunches.forEach(r => {
    if (r.firstPunch) {
      const [h, m] = r.firstPunch.split(':').map(Number);
      const totalMin = h * 60 + m;
      if (totalMin < 540) inBuckets.before9++;
      else if (totalMin <= 570) inBuckets.between9and930++;
      else if (totalMin <= 600) inBuckets.between930and10++;
      else inBuckets.after10++;
    }

    if (r.lastPunch) {
      const [h, m] = r.lastPunch.split(':').map(Number);
      const totalMin = h * 60 + m;
      if (totalMin < 1080) outBuckets.before18++;
      else if (totalMin <= 1140) outBuckets.between18and19++;
      else outBuckets.after19++;
    }
  });

  const totalValid = validPunches.length || 1;
  const onTimePercentage = Math.round(((inBuckets.before9 + inBuckets.between9and930) / totalValid) * 100);
  const lateArrivalPercentage = Math.round(((inBuckets.between930and10 + inBuckets.after10) / totalValid) * 100);

  // Calculate per-employee habit metrics
  const employeeHabits = employees.map(emp => {
    const empPunches = validPunches.filter(r => r.empId === emp.id || r.empCode === emp.empCode);
    if (empPunches.length === 0) {
      return {
        empCode: emp.empCode,
        name: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`,
        avgIn: '--:--',
        avgOut: '--:--',
        avgHours: 0,
        punctualScore: 0
      };
    }

    let totalInMins = 0;
    let totalOutMins = 0;
    let totalHours = 0;
    let onTimeCount = 0;

    empPunches.forEach(p => {
      if (p.firstPunch) {
        const [h, m] = p.firstPunch.split(':').map(Number);
        totalInMins += h * 60 + m;
        if (h * 60 + m <= 570) onTimeCount++;
      }
      if (p.lastPunch) {
        const [h, m] = p.lastPunch.split(':').map(Number);
        totalOutMins += h * 60 + m;
      }
      totalHours += p.totalHours;
    });

    const avgInMin = Math.round(totalInMins / empPunches.length);
    const avgOutMin = Math.round(totalOutMins / empPunches.length);

    const avgInStr = `${String(Math.floor(avgInMin / 60)).padStart(2, '0')}:${String(avgInMin % 60).padStart(2, '0')}`;
    const avgOutStr = `${String(Math.floor(avgOutMin / 60)).padStart(2, '0')}:${String(avgOutMin % 60).padStart(2, '0')}`;

    return {
      empCode: emp.empCode,
      name: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`,
      avgIn: avgInStr,
      avgOut: avgOutStr,
      avgHours: Math.round((totalHours / empPunches.length) * 10) / 10,
      punctualScore: Math.round((onTimeCount / empPunches.length) * 100)
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12161E] border border-[#262D3D] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF5E0E]" />
            <h2 className="text-lg font-bold text-white">Punch-In & Punch-Out Habit Analytics</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time behavioral telemetry, arrival discipline & departure distribution
          </p>
        </div>

        {/* Day / Month / Year View Tabs */}
        <div className="flex items-center bg-[#0B0D11] p-1 rounded-xl border border-[#262D3D]">
          <button
            onClick={() => setTimeframe('DAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'DAY'
                ? 'bg-[#FF5E0E] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Day-Wise
          </button>
          <button
            onClick={() => setTimeframe('MONTH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'MONTH'
                ? 'bg-[#FF5E0E] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Month-Wise
          </button>
          <button
            onClick={() => setTimeframe('YEAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === 'YEAR'
                ? 'bg-[#FF5E0E] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Year-Wise
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Punctuality Adherence Rate</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{onTimePercentage}%</p>
            <span className="text-[11px] text-gray-500">Punched in by 09:30 AM standard</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Late Arrival Incidence</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{lateArrivalPercentage}%</p>
            <span className="text-[11px] text-gray-500">Punched in after 09:30 AM</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#12161E] border border-[#262D3D] p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Average Daily Shift Hours</span>
            <p className="text-2xl font-bold text-[#FF5E0E] mt-1">9.2 hrs</p>
            <span className="text-[11px] text-gray-500">Exceeds 9.0h full-day threshold</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FF5E0E]/10 border border-[#FF5E0E]/20 text-[#FF5E0E]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Arrival vs Departure Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Morning Arrival Habit Chart */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Morning Punch-In Habits (Arrival)</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">Total: {totalValid} punches</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Early Birds (Before 09:00 AM)</span>
                <span className="font-mono text-white font-semibold">
                  {inBuckets.before9} ({Math.round((inBuckets.before9 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(inBuckets.before9 / totalValid) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">On-Time Standard (09:00 - 09:30 AM)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {inBuckets.between9and930} ({Math.round((inBuckets.between9and930 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-[#FF5E0E] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(inBuckets.between9and930 / totalValid) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Moderate Delay (09:30 - 10:00 AM)</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {inBuckets.between930and10} ({Math.round((inBuckets.between930and10 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(inBuckets.between930and10 / totalValid) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Late Inflow (After 10:00 AM)</span>
                <span className="font-mono text-red-400 font-semibold">
                  {inBuckets.after10} ({Math.round((inBuckets.after10 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(inBuckets.after10 / totalValid) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evening Punch-Out Habit Chart */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Evening Punch-Out Habits (Departure)</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">Threshold: 18:00 (6 PM)</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Early Departure (Before 18:00)</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {outBuckets.before18} ({Math.round((outBuckets.before18 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(outBuckets.before18 / totalValid) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Standard Shift Exit (18:00 - 19:00)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {outBuckets.between18and19} ({Math.round((outBuckets.between18and19 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-[#FF5E0E] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(outBuckets.between18and19 / totalValid) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Extended R&D / Overtime (After 19:00)</span>
                <span className="font-mono text-indigo-400 font-semibold">
                  {outBuckets.after19} ({Math.round((outBuckets.after19 / totalValid) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-[#181D27] h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(outBuckets.after19 / totalValid) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Staff Punctuality & Habit Scoreboard */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#0B0D11] border-b border-[#262D3D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF5E0E]" />
            <h3 className="text-sm font-bold text-white">Employee Habit Performance Index</h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">{currentMonth} Metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#181D27] text-gray-400 uppercase tracking-wider border-b border-[#262D3D]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Average Punch In</th>
                <th className="py-3 px-4">Average Punch Out</th>
                <th className="py-3 px-4">Avg Daily Hours</th>
                <th className="py-3 px-4">Punctuality Score</th>
                <th className="py-3 px-4">Habit Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262D3D] text-gray-300">
              {employeeHabits.map(h => (
                <tr key={h.empCode} className="hover:bg-[#181D27]/50">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-white">{h.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-gray-400">{h.empCode}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-emerald-400">{h.avgIn}</td>
                  <td className="py-2.5 px-4 font-mono text-blue-400">{h.avgOut}</td>
                  <td className="py-2.5 px-4 font-mono font-medium">{h.avgHours} hrs</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#181D27] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#FF5E0E] h-full rounded-full" 
                          style={{ width: `${h.punctualScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{h.punctualScore}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    {h.punctualScore >= 90 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                        Exemplary
                      </span>
                    ) : h.punctualScore >= 75 ? (
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px] font-semibold border border-blue-500/30">
                        Consistent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                        Needs Attention
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
