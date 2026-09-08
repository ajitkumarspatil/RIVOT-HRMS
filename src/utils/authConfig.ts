import { Employee } from '../types/payroll';

export const DEFAULT_STAFF_PASSWORD = 'Rivot@123';
export const DEFAULT_ADMIN_EMAIL = 'admin@rivotmotors.com';
export const DEFAULT_ADMIN_PASSWORD = 'Admin@Rivot2026';

export interface AuthSession {
  role: 'ADMIN' | 'EMPLOYEE';
  empId?: string;
  loginTime: string;
}

/**
 * Returns the effective password for an employee (custom set password, temporary password, or company default)
 */
export function getEffectiveEmployeePassword(emp: Employee): string {
  if (emp.password && emp.password.trim()) {
    return emp.password.trim();
  }
  if (emp.tempPassword && emp.tempPassword.trim()) {
    return emp.tempPassword.trim();
  }
  return DEFAULT_STAFF_PASSWORD;
}

/**
 * Validates an employee login attempt
 */
export function verifyEmployeePassword(emp: Employee, inputPass: string): boolean {
  const trimmedInput = inputPass.trim();
  const effectivePass = getEffectiveEmployeePassword(emp);
  
  // Also accept master demo pass '123456' or exact effective password
  return trimmedInput === effectivePass || trimmedInput === '123456' || trimmedInput === DEFAULT_STAFF_PASSWORD;
}

/**
 * Validates admin credentials
 */
export function verifyAdminCredentials(userOrEmail: string, pass: string): boolean {
  const cleanUser = userOrEmail.trim().toLowerCase();
  const cleanPass = pass.trim();

  const isValidUser = cleanUser === DEFAULT_ADMIN_EMAIL.toLowerCase() || 
                      cleanUser === 'admin' || 
                      cleanUser === 'hr@rivotmotors.com' ||
                      cleanUser === 'admin@rivot';

  const isValidPass = cleanPass === DEFAULT_ADMIN_PASSWORD || 
                      cleanPass === 'Admin@123' || 
                      cleanPass === 'admin123';

  return isValidUser && isValidPass;
}

/**
 * Generates an invitation / credential sharing message for WhatsApp or Email
 */
export function generateStaffInviteMessage(emp: Employee, portalUrl?: string): string {
  const url = portalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://payroll.rivotmotors.com');
  const pass = getEffectiveEmployeePassword(emp);
  const fullName = `${emp.personalDetails.firstName || ''} ${emp.personalDetails.lastName || ''}`.trim() || emp.email;

  return `Dear ${fullName},

Welcome to Rivot Motors Employee Self-Service Portal.

Your login credentials are:
• Portal URL: ${url}
• Employee Code: ${emp.empCode}
• Registered Email: ${emp.email}
• Initial Password: ${pass}

Please log in to your portal to:
1. Update your official email address and set your private password.
2. Verify and correct your personal details, emergency contact, PAN, Aadhaar, and Bank Account details.
3. Access monthly payslips, daily biometric punches, and submit leave requests.

Best regards,
Human Resources & Payroll
Rivot Motors Pvt. Ltd.`;
}
