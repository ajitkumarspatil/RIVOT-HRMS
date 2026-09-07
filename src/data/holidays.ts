import { Holiday } from '../types/payroll';

export const MAX_TOTAL_ANNUAL_HOLIDAYS = 8;
export const MANDATORY_HOLIDAY_COUNT = 5;
export const MAX_RESTRICTED_HOLIDAYS_PER_EMPLOYEE = 3;

export const INITIAL_HOLIDAYS_2026: Holiday[] = [
  // -------------------------------------------------------------
  // 5 MANDATORY PAID HOLIDAYS (Applicable to 100% of employees)
  // -------------------------------------------------------------
  {
    id: 'hol-2026-01-26',
    name: 'Republic Day',
    date: '2026-01-26',
    dayOfWeek: 'Monday',
    type: 'MANDATORY',
    description: 'Constitution of India celebration (Mandatory National Holiday)',
    isPaid: true,
    isMandatory: true
  },
  {
    id: 'hol-2026-05-01',
    name: 'May Day / International Workers Day',
    date: '2026-05-01',
    dayOfWeek: 'Friday',
    type: 'MANDATORY',
    description: 'Labour Day celebration (Statutory Karnataka Paid Holiday)',
    isPaid: true,
    isMandatory: true
  },
  {
    id: 'hol-2026-08-15',
    name: 'Independence Day',
    date: '2026-08-15',
    dayOfWeek: 'Saturday',
    type: 'MANDATORY',
    description: 'National Independence Day (Mandatory National Holiday)',
    isPaid: true,
    isMandatory: true
  },
  {
    id: 'hol-2026-10-02',
    name: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    dayOfWeek: 'Friday',
    type: 'MANDATORY',
    description: 'Father of the Nation Birthday (Mandatory National Holiday)',
    isPaid: true,
    isMandatory: true
  },
  {
    id: 'hol-2026-11-01',
    name: 'Kannada Rajyotsava',
    date: '2026-11-01',
    dayOfWeek: 'Sunday',
    type: 'MANDATORY',
    description: 'Karnataka State Formation Day (Statutory State Mandatory Holiday)',
    isPaid: true,
    isMandatory: true
  },

  // -------------------------------------------------------------
  // RESTRICTED / OPTIONAL HOLIDAYS (Employees choose any 3 from list)
  // Rule: Total leaves capped at 8 per employee (5 mandatory + 3 restricted)
  // -------------------------------------------------------------
  {
    id: 'hol-2026-01-01',
    name: "New Year's Day",
    date: '2026-01-01',
    dayOfWeek: 'Thursday',
    type: 'RESTRICTED',
    description: 'First day of the Gregorian new year',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-01-15',
    name: 'Makara Sankranti / Pongal',
    date: '2026-01-15',
    dayOfWeek: 'Thursday',
    type: 'RESTRICTED',
    description: 'Harvest Festival across Karnataka and Southern India',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-02-16',
    name: 'Maha Shivaratri',
    date: '2026-02-16',
    dayOfWeek: 'Monday',
    type: 'RESTRICTED',
    description: 'Great Night of Shiva devotional festival',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-03-19',
    name: 'Chandramana Ugadi',
    date: '2026-03-19',
    dayOfWeek: 'Thursday',
    type: 'RESTRICTED',
    description: 'Karnataka & Telugu New Year Day',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-03-21',
    name: 'Eid-ul-Fitr (Ramzan)',
    date: '2026-03-21',
    dayOfWeek: 'Saturday',
    type: 'RESTRICTED',
    description: 'Islamic festival marking the end of the fasting month of Ramadan',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-04-03',
    name: 'Good Friday',
    date: '2026-04-03',
    dayOfWeek: 'Friday',
    type: 'RESTRICTED',
    description: 'Christian day of penance and remembrance',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-04-14',
    name: 'Dr. B.R. Ambedkar Jayanti',
    date: '2026-04-14',
    dayOfWeek: 'Tuesday',
    type: 'RESTRICTED',
    description: 'Birth anniversary of Babasaheb Ambedkar',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-05-27',
    name: 'Bakrid / Eid-ul-Adha',
    date: '2026-05-27',
    dayOfWeek: 'Wednesday',
    type: 'RESTRICTED',
    description: 'Feast of the Sacrifice observed by Islamic staff',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-09-04',
    name: 'Varasiddhi Vinayaka Vrata / Ganesh Chaturthi',
    date: '2026-09-04',
    dayOfWeek: 'Friday',
    type: 'RESTRICTED',
    description: 'Ganesh Chaturthi celebrations',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-10-20',
    name: 'Vijayadashami / Ayudha Pooja',
    date: '2026-10-20',
    dayOfWeek: 'Tuesday',
    type: 'RESTRICTED',
    description: 'Ayudha Pooja & Dasara celebrations in Karnataka',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-11-08',
    name: 'Deepavali / Naraka Chaturdashi',
    date: '2026-11-08',
    dayOfWeek: 'Sunday',
    type: 'RESTRICTED',
    description: 'Festival of Lights celebrations observed by Hindu staff',
    isPaid: true,
    isMandatory: false
  },
  {
    id: 'hol-2026-12-25',
    name: 'Christmas Day',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    type: 'RESTRICTED',
    description: 'Christmas celebrations',
    isPaid: true,
    isMandatory: false
  }
];
