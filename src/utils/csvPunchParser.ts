import { Employee, DailyAttendanceRecord, AttendanceStatus, LeaveApplication, Holiday } from '../types/payroll';

export interface RawPunchRecord {
  timestamp: string; // YYYY-MM-DD HH:mm:ss or ISO
  dateStr: string;   // YYYY-MM-DD
  timeStr: string;   // HH:mm:ss
  firstName: string;
  empId: string;
  email?: string;
  phone?: string;
}

/**
 * Checks if employee joined >= 2 years before target date
 */
export function isEmployeeSeniorExempt(dateOfJoiningStr?: string, targetDateStr?: string): boolean {
  if (!dateOfJoiningStr) return false;
  const joinDate = new Date(dateOfJoiningStr);
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  if (isNaN(joinDate.getTime()) || isNaN(targetDate.getTime())) return false;

  const diffMs = targetDate.getTime() - joinDate.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 2.0;
}

/**
 * Parses a standard or custom CSV line respecting quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Direct extraction of dateStr (YYYY-MM-DD) and timeStr (HH:mm:ss) from timestamp string
 * to prevent any timezone drift (e.g., UTC vs IST shifts)
 */
function extractDateTimeStrings(raw: string): { dateStr: string; timeStr: string; timestamp: string } | null {
  if (!raw) return null;
  const cleaned = raw.trim();

  // Pattern 1: YYYY-MM-DD HH:mm:ss (or YYYY/MM/DD)
  const matchYmd = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[\sT]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (matchYmd) {
    const year = matchYmd[1];
    const month = matchYmd[2].padStart(2, '0');
    const day = matchYmd[3].padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const hours = (matchYmd[4] || '00').padStart(2, '0');
    const minutes = (matchYmd[5] || '00').padStart(2, '0');
    const seconds = (matchYmd[6] || '00').padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    return {
      dateStr,
      timeStr,
      timestamp: `${dateStr}T${timeStr}.000Z`
    };
  }

  // Pattern 2: DD/MM/YYYY HH:mm:ss (or DD-MM-YYYY)
  const matchDmy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[\sT]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    const year = matchDmy[3];
    const dateStr = `${year}-${month}-${day}`;
    const hours = (matchDmy[4] || '00').padStart(2, '0');
    const minutes = (matchDmy[5] || '00').padStart(2, '0');
    const seconds = (matchDmy[6] || '00').padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    return {
      dateStr,
      timeStr,
      timestamp: `${dateStr}T${timeStr}.000Z`
    };
  }

  // Fallback to JS Date
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return {
      dateStr: `${year}-${month}-${day}`,
      timeStr: `${hours}:${minutes}:${seconds}`,
      timestamp: d.toISOString()
    };
  }

  return null;
}

/**
 * Detects the dominant month (YYYY-MM) from an array of raw punches
 */
export function detectBiometricMonth(rawPunches: RawPunchRecord[]): string | null {
  if (!rawPunches || rawPunches.length === 0) return null;
  const monthCounts: Record<string, number> = {};
  for (const p of rawPunches) {
    if (p.dateStr && p.dateStr.length >= 7) {
      const m = p.dateStr.substring(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    }
  }
  const sorted = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

/**
 * Directly detects the month (YYYY-MM) from the 2nd column of raw CSV lines
 */
export function detectMonthFromCSV2ndColumn(csvContent: string): string | null {
  if (!csvContent) return null;
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;

  const monthCounts: Record<string, number> = {};

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;
    // 2nd column is index 1
    const dt = extractDateTimeStrings(cols[1]);
    if (dt && dt.dateStr && dt.dateStr.length >= 7) {
      const m = dt.dateStr.substring(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    }
  }

  const sorted = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

/**
 * Groups punches by month (YYYY-MM)
 */
export function groupPunchesByMonth(rawPunches: RawPunchRecord[]): Record<string, RawPunchRecord[]> {
  const result: Record<string, RawPunchRecord[]> = {};
  for (const p of rawPunches) {
    const m = p.dateStr.substring(0, 7);
    if (!result[m]) result[m] = [];
    result[m].push(p);
  }
  return result;
}

/**
 * Parses the raw biometric CSV file with dynamic header detection
 * Supporting columns: Access time / Punch time in 2nd column, Name, ID, Card, Phone, Email
 */
export function parseBiometricCSV(csvContent: string): RawPunchRecord[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const rawPunches: RawPunchRecord[] = [];
  let startIndex = 0;

  // Check if first row is header
  const firstRowCols = parseCSVLine(lines[0]);
  const isHeader = firstRowCols.some(c =>
    /punch|time|date|name|id|employee|emp|access/i.test(c)
  );

  // Default indices matching device layout:
  // Col 0: Access number, Col 1: Access time, Col 2: Recognition method, Col 3: Name, Col 4: ID
  let timeColIdx = 1;
  let nameColIdx = 3;
  let idColIdx = 4;
  let phoneColIdx = 6;
  let emailColIdx = 7;

  if (isHeader) {
    startIndex = 1;
    const hCols = firstRowCols.map(c => c.toLowerCase().trim());
    const fTime = hCols.findIndex(c => /access\s*time|punch\s*time|timestamp|time|datetime/i.test(c));
    if (fTime !== -1) timeColIdx = fTime;

    const fId = hCols.findIndex(c => /^id$|emp.*id|employee.*id|user.*id|badge/i.test(c));
    if (fId !== -1) idColIdx = fId;

    const fName = hCols.findIndex(c => /^name$|employee.*name|emp.*name|staff.*name/i.test(c));
    if (fName !== -1) nameColIdx = fName;

    const fPhone = hCols.findIndex(c => /phone|mobile/i.test(c));
    if (fPhone !== -1) phoneColIdx = fPhone;

    const fEmail = hCols.findIndex(c => /email/i.test(c));
    if (fEmail !== -1) emailColIdx = fEmail;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    // 2nd column ALWAYS prioritized for date and time
    const punchTimeRaw = cols[timeColIdx] || cols[1] || '';
    const rawName = (cols[nameColIdx] || cols[3] || cols[2] || 'Staff').trim();
    const empId = (cols[idColIdx] || cols[4] || cols[0] || '').trim();
    const phone = cols[phoneColIdx] ? cols[phoneColIdx].trim() : '';
    const email = cols[emailColIdx] ? cols[emailColIdx].trim() : '';

    if (!punchTimeRaw || !empId) continue;

    const dt = extractDateTimeStrings(punchTimeRaw);
    if (!dt) continue;

    rawPunches.push({
      timestamp: dt.timestamp,
      dateStr: dt.dateStr,
      timeStr: dt.timeStr,
      firstName: rawName,
      empId,
      email,
      phone
    });
  }

  return rawPunches;
}

/**
 * Process biometric punches for a specific month and generate the full monthly attendance matrix
 * applying 9h/4h rules, 2-year seniority exemption, approved leaves, and weekly-off forfeiture.
 */
export function processMonthlyAttendance(
  month: string, // "YYYY-MM"
  rawPunches: RawPunchRecord[],
  employees: Employee[],
  approvedLeaves: LeaveApplication[] = [],
  existingOverrides: Record<string, DailyAttendanceRecord> = {}, // key: `${empId}_${date}`
  holidays: Holiday[] = [],
  employeeRestrictedHolidays?: Record<string, string[]> // empId -> array of chosen holiday IDs / names
): DailyAttendanceRecord[] {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed

  // Total days in the month
  const totalDays = new Date(year, monthIdx + 1, 0).getDate();

  // Index punches by employee ID variants, numeric IDs, 4/5-digit padding, and full/first names + date
  const punchMap = new Map<string, string[]>(); // key: `${key}_${date}` -> array of "HH:mm:ss"
  for (const p of rawPunches) {
    const rawId = p.empId.trim().toLowerCase();
    const cleanDigits = rawId.replace(/\D/g, '');
    const numId = cleanDigits ? parseInt(cleanDigits, 10) : null;
    const strippedId = rawId.replace(/^0+/, '') || '0';
    const padded4 = numId !== null ? String(numId).padStart(4, '0') : strippedId.padStart(4, '0');
    const padded5 = numId !== null ? String(numId).padStart(5, '0') : strippedId.padStart(5, '0');

    const fullName = p.firstName.trim().toLowerCase();

    const keys = new Set<string>([
      `${rawId}_${p.dateStr}`,
      `${strippedId}_${p.dateStr}`,
      `${padded4}_${p.dateStr}`,
      `${padded5}_${p.dateStr}`,
    ]);

    if (fullName) {
      keys.add(`name_${fullName}_${p.dateStr}`);
    }

    if (numId !== null) {
      keys.add(`${numId}_${p.dateStr}`);
    }

    if (p.email) {
      keys.add(`email_${p.email.toLowerCase().trim()}_${p.dateStr}`);
    }
    if (p.phone) {
      keys.add(`phone_${p.phone.replace(/\D/g, '')}_${p.dateStr}`);
    }

    for (const k of keys) {
      const list = punchMap.get(k) || [];
      list.push(p.timeStr);
      punchMap.set(k, list);
    }
  }

  const allRecords: DailyAttendanceRecord[] = [];

  for (const emp of employees) {
    const isSenior = isEmployeeSeniorExempt(emp.employmentDetails?.dateOfJoining, `${month}-15`);
    const empRecordsForMonth: DailyAttendanceRecord[] = [];

    // Track week-by-week: Sunday forfeiture rule
    // A week runs Monday to Saturday, followed by Sunday.
    // An unapproved absence or LOP in that week forfeits the Sunday.
    let weeklyLOPCount = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(year, monthIdx, day);
      const dayOfWeek = dayDate.getDay(); // 0 = Sunday, 6 = Saturday
      const overrideKey = `${emp.id}_${dateStr}`;
      const codeOverrideKey = `${emp.empCode.toLowerCase()}_${dateStr}`;

      // Check if admin manually modified
      const override = existingOverrides[overrideKey] || existingOverrides[codeOverrideKey];
      if (override) {
        empRecordsForMonth.push(override);
        if (override.status === 'ABSENT_LOP') {
          weeklyLOPCount++;
        }
        if (dayOfWeek === 0) {
          // Reset weekly counter on Sunday
          weeklyLOPCount = 0;
        }
        continue;
      }

      // Check approved leaves
      const hasApprovedLeave = approvedLeaves.some(l =>
        (l.empId === emp.id || l.empCode.toLowerCase() === emp.empCode.toLowerCase()) &&
        l.status === 'APPROVED' &&
        dateStr >= l.startDate &&
        dateStr <= l.endDate
      );

      // Check punch entries
      // Comprehensive multi-key lookup: exact code, numeric, 4/5 padded, emp.id, first name, full name, email, phone
      const empCodeRaw = emp.empCode.trim().toLowerCase();
      const empDigits = empCodeRaw.replace(/\D/g, '');
      const empNumId = empDigits ? parseInt(empDigits, 10) : null;
      const strippedEmpCode = empCodeRaw.replace(/^0+/, '') || '0';
      const paddedEmpCode4 = empNumId !== null ? String(empNumId).padStart(4, '0') : strippedEmpCode.padStart(4, '0');
      const paddedEmpCode5 = empNumId !== null ? String(empNumId).padStart(5, '0') : strippedEmpCode.padStart(5, '0');

      const empFirstName = emp.personalDetails?.firstName?.trim().toLowerCase() || '';
      const empLastName = emp.personalDetails?.lastName?.trim().toLowerCase() || '';
      const empFullName = `${empFirstName} ${empLastName}`.trim();
      const empEmail = emp.email?.toLowerCase().trim() || '';
      const empPhone = emp.personalDetails?.phone?.replace(/\D/g, '') || '';

      const lookupKeys = [
        `${empCodeRaw}_${dateStr}`,
        `${strippedEmpCode}_${dateStr}`,
        `${paddedEmpCode4}_${dateStr}`,
        `${paddedEmpCode5}_${dateStr}`,
        `${emp.id.toLowerCase()}_${dateStr}`,
        empNumId !== null ? `${empNumId}_${dateStr}` : '',
        empFullName ? `name_${empFullName}_${dateStr}` : '',
        empEmail ? `email_${empEmail}_${dateStr}` : '',
        empPhone ? `phone_${empPhone}_${dateStr}` : ''
      ].filter(Boolean);

      let punches: string[] = [];
      for (const lk of lookupKeys) {
        const found = punchMap.get(lk);
        if (found && found.length > 0) {
          punches = found;
          break;
        }
      }

      punches.sort();

      const firstPunch = punches.length > 0 ? punches[0].substring(0, 5) : null;
      const lastPunch = punches.length > 1 ? punches[punches.length - 1].substring(0, 5) : (punches.length === 1 ? punches[0].substring(0, 5) : null);

      let durationHours = 0;
      if (firstPunch && lastPunch && punches.length >= 2) {
        const [h1, m1] = firstPunch.split(':').map(Number);
        const [h2, m2] = lastPunch.split(':').map(Number);
        durationHours = Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
      } else if (punches.length === 1 && isSenior) {
        // Senior employee punched once, still treated as present per seniority exemption rule
        durationHours = 9.0;
      }

      let status: AttendanceStatus = 'ABSENT_LOP';
      let isWeeklyOffLost = false;

      // Check if scheduled Holiday
      const matchingHoliday = holidays.find(h => h.date === dateStr);
      if (matchingHoliday && matchingHoliday.isPaid) {
        if (matchingHoliday.isMandatory || matchingHoliday.type === 'MANDATORY') {
          // 5 Mandatory Holidays: All staff must take these leaves
          status = 'HOLIDAY';
        } else {
          // Restricted Holidays (RH):
          // Staff choose up to 3 restricted holidays from the list (e.g., Deepawali vs Bakrid)
          // Total leaves per employee capped at 8 (5 mandatory + 3 restricted)
          const chosenIds = employeeRestrictedHolidays?.[emp.id] || emp.selectedRestrictedHolidays || [];
          const isChosen = chosenIds.includes(matchingHoliday.id) ||
                           chosenIds.includes(matchingHoliday.name) ||
                           chosenIds.includes(matchingHoliday.date);
          if (isChosen) {
            status = 'HOLIDAY';
          }
        }
      } else if (dayOfWeek === 0) {
        // It's Sunday (Weekly off day)
        // Rule: "weekly off is only for people who have worked for full 6 days a week or present with approved leave. Unapproved leave, LoPs take away weekly off."
        if (weeklyLOPCount > 0) {
          status = 'WEEKLY_OFF_LOST';
          isWeeklyOffLost = true;
        } else {
          status = 'WEEKLY_OFF';
        }
        // Reset weekly LOP counter after Sunday
        weeklyLOPCount = 0;
      } else if (hasApprovedLeave) {
        status = 'APPROVED_LEAVE';
      } else if (punches.length > 0) {
        if (isSenior) {
          // Senior employee (> 2 years from joining) is exempt from 9h rule!
          status = 'PRESENT';
          if (durationHours === 0) durationHours = 9.0;
        } else {
          if (durationHours >= 9.0) {
            status = 'PRESENT';
          } else if (durationHours >= 4.0) {
            status = 'HALF_DAY';
            // Half day has 0.5 LOP, but let's check if it breaks weekly off
            // Typically unapproved full day absence breaks weekly off
          } else {
            status = 'ABSENT_LOP';
            weeklyLOPCount++;
          }
        }
      } else {
        // No punch and no approved leave on a working day
        status = 'ABSENT_LOP';
        weeklyLOPCount++;
      }

      empRecordsForMonth.push({
        date: dateStr,
        empId: emp.id,
        empCode: emp.empCode,
        empName: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.trim() || emp.email,
        firstPunch,
        lastPunch,
        totalHours: Math.round(durationHours * 10) / 10,
        status,
        isSeniorExempt: isSenior,
        isWeeklyOffLost
      });
    }

    allRecords.push(...empRecordsForMonth);
  }

  return allRecords;
}

/**
 * Generates sample CSV matching R-1788755798747-f9Ji.csv format
 */
export function generateSamplePunchCSV(month: string, employees: Employee[]): string {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const lines: string[] = [];
  // Standard Biometric Palm Vein Device CSV Header matching machine exports
  lines.push('Access number,Access time,Recognition method,Name,ID,Card number,Phone number,Email,Remarks');

  let punchCounter = 1788755000000;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIdx, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) continue; // Sunday office closed

    for (const emp of employees) {
      // Simulate attendance pattern:
      // Most days present: in ~08:40-09:20, out ~18:20-19:15 (>= 9h)
      const empNum = parseInt(emp.empCode.replace(/\D/g, '') || '1', 10);
      const isAbsent = 
        (day === 12 && empNum === 30) || 
        (day === 18 && empNum === 10) || 
        ((day === 3 || day === 4) && (empNum === 20 || emp.empCode === '0020' || emp.id === 'emp-0020'));
      const isHalfDay = (day === 7 && empNum === 31);

      if (isAbsent) continue;

      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const inMinute = 10 + ((day * 7 + empNum * 3) % 40);
      const outHour = isHalfDay ? 13 : 18;
      const outMinute = 15 + ((day * 3 + empNum * 5) % 40);

      const inTime = `${dateStr} 08:${String(inMinute).padStart(2, '0')}:12`;
      const outTime = `${dateStr} ${String(outHour).padStart(2, '0')}:${String(outMinute).padStart(2, '0')}:45`;

      const fullName = `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`.trim();
      const phone = emp.personalDetails.phone?.replace(/\D/g, '') || '';
      const card = emp.bankDetails?.accountNumber || '';

      // Punch 1 (Morning in)
      lines.push(`R-${punchCounter++}-f9Ji,${inTime},Palm vein,${fullName},${emp.empCode},${card},${phone},${emp.email},In`);
      // Punch 2 (Evening out)
      lines.push(`R-${punchCounter++}-f9Ji,${outTime},Palm vein,${fullName},${emp.empCode},${card},${phone},${emp.email},Out`);
    }
  }

  return lines.join('\n');
}
