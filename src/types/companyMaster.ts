export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  senderEmail: string;
  senderName: string;
  isConfigured: boolean;
}

export interface CompanyMaster {
  companyName: string;
  tradeName: string;
  cin: string;
  pan: string;
  tan: string;
  gstin: string;
  pfEstablishmentCode: string;
  esicCode: string;
  ptRegistrationNo: string;
  registeredAddress: string;
  factoryAddress: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  customLogoDataUrl?: string; // Uploaded custom logo base64
  useCustomLogo: boolean;
  smtp: SmtpConfig;
  updatedAt?: string;
}

export const DEFAULT_COMPANY_MASTER: CompanyMaster = {
  companyName: 'RIVOT MOTORS PRIVATE LIMITED',
  tradeName: 'RIVOT',
  cin: 'U34100KA2023PTC176541',
  pan: 'AABCR7890K',
  tan: 'BLRR12345D',
  gstin: '29AABCR7890K1Z5',
  pfEstablishmentCode: 'BGBNG1234567000',
  esicCode: '31000123450000999',
  ptRegistrationNo: 'PT/KA/BLR/2023/9812',
  registeredAddress: 'Tech Park Hubballi & Electronic City Phase 1, Bengaluru, Karnataka, India - 560100',
  factoryAddress: 'Plot 42, Belur Industrial Area, Hubballi - Dharwad, Karnataka, India - 580011',
  contactEmail: 'payroll@rivotmotors.com',
  contactPhone: '+91 80 4567 8900',
  website: 'https://rivotmotors.com',
  useCustomLogo: false,
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: 'payroll@rivotmotors.com',
    senderEmail: 'payroll@rivotmotors.com',
    senderName: 'RIVOT Motors HR & Payroll',
    isConfigured: true
  }
};
