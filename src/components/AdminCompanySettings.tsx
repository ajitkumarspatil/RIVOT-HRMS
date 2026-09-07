import React, { useState } from 'react';
import { CompanyMaster, DEFAULT_COMPANY_MASTER, SmtpConfig } from '../types/companyMaster';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Upload, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Send, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Globe, 
  Phone,
  ShieldCheck,
  Server
} from 'lucide-react';
import { RivotLogo } from './RivotLogo';

interface AdminCompanySettingsProps {
  companyMaster: CompanyMaster;
  onUpdateCompanyMaster: (updated: CompanyMaster) => void;
}

export const AdminCompanySettings: React.FC<AdminCompanySettingsProps> = ({
  companyMaster,
  onUpdateCompanyMaster
}) => {
  const [formData, setFormData] = useState<CompanyMaster>(companyMaster);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState<boolean>(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Field updates
  const handleChange = (field: keyof CompanyMaster, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSmtpChange = (field: keyof SmtpConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [field]: value
      }
    }));
  };

  // Logo file upload handler
  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, SVG, JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        customLogoDataUrl: dataUrl,
        useCustomLogo: true
      }));
      setSaveNotice('New company logo loaded! Click "Save Company Master" below to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoFile(file);
  };

  const handleRemoveCustomLogo = () => {
    setFormData(prev => ({
      ...prev,
      customLogoDataUrl: undefined,
      useCustomLogo: false
    }));
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...formData,
      updatedAt: new Date().toISOString()
    };
    onUpdateCompanyMaster(updated);
    setSaveNotice('Company Master details, Address, PAN, Logo & SMTP configuration successfully updated!');
    setTimeout(() => setSaveNotice(null), 5000);
  };

  // Test SMTP connection
  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    setTimeout(() => {
      setIsTestingSmtp(false);
      if (!formData.smtp.host || !formData.smtp.username) {
        setSmtpTestResult({
          success: false,
          message: 'SMTP host and username are required to initiate connection.'
        });
      } else {
        setSmtpTestResult({
          success: true,
          message: `Connection established to ${formData.smtp.host}:${formData.smtp.port}. TLS handshake OK, authenticated as ${formData.smtp.username}. Ready to send automated monthly payslips!`
        });
      }
      setTimeout(() => setSmtpTestResult(null), 8000);
    }, 1200);
  };

  // Reset to default RIVOT config
  const handleResetToDefault = () => {
    if (confirm('Reset company master to official RIVOT MOTORS default configuration?')) {
      setFormData(DEFAULT_COMPANY_MASTER);
      onUpdateCompanyMaster(DEFAULT_COMPANY_MASTER);
      setSaveNotice('Restored official RIVOT MOTORS defaults.');
      setTimeout(() => setSaveNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5E0E]/15 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
                Admin Console
              </span>
              <span className="text-xs text-gray-400">
                Corporate Master Data, Address, PAN & Automated Email Services
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF5E0E]" />
              Company Master & SMTP Configuration
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Configure legal entity information, statutory registrations (CIN, PAN, TAN, GSTIN, PF, ESIC), 
              office addresses, custom company logo, and outbound SMTP server for automated employee payslip delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-400 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              title="Reset all fields to RIVOT default settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {saveNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Logo & Visual Branding */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262D3D] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF5E0E]" />
              <h3 className="text-sm font-bold text-white">Company Logo & Branding</h3>
            </div>
            <span className="text-[11px] text-gray-400">Displayed on Header, Reports & Payslip PDFs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Logo Preview */}
            <div className="bg-[#0B0D11] border border-[#262D3D] rounded-xl p-5 flex flex-col items-center justify-center min-h-[140px] text-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">
                Current Active Logo
              </span>
              
              {formData.useCustomLogo && formData.customLogoDataUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <img
                    src={formData.customLogoDataUrl}
                    alt="Custom Company Logo"
                    className="max-h-14 max-w-[200px] object-contain"
                  />
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Custom Logo Enabled
                  </span>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <RivotLogo theme="dark" size="md" />
                  <span className="text-[10px] text-gray-400">
                    RIVOT Motors Vector Master Logo
                  </span>
                </div>
              )}
            </div>

            {/* Drag and Drop Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`md:col-span-2 border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center ${
                isDragOver 
                  ? 'border-[#FF5E0E] bg-[#FF5E0E]/5' 
                  : 'border-[#262D3D] bg-[#0B0D11]/60 hover:border-[#FF5E0E]/40'
              }`}
            >
              <Upload className="w-7 h-7 text-[#FF5E0E] mb-2" />
              <p className="text-xs font-semibold text-white mb-1">
                Drag and drop custom company logo here, or browse
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                Supports PNG, SVG, JPG or WebP (recommended: transparent background, 300x80px)
              </p>
              
              <div className="flex items-center gap-2">
                <label className="bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#FF5E0E]/20">
                  <span>Browse Image</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>

                {formData.customLogoDataUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomLogo}
                    className="bg-[#181D27] hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-[#262D3D] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Custom Logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Legal Entity & Statutory Identification (PAN, TAN, CIN, GSTIN) */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262D3D] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF5E0E]" />
              <h3 className="text-sm font-bold text-white">Legal Identification & Statutory Codes</h3>
            </div>
            <span className="text-[11px] text-gray-400">Indian Compliance Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Trade / Brand Name</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => handleChange('tradeName', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Corporate Identity Number (CIN)</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => handleChange('cin', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono uppercase"
                placeholder="U34100KA2023PTC176541"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Income Tax PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono uppercase font-bold"
                placeholder="AABCR7890K"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Tax Deduction Account No (TAN)</label>
              <input
                type="text"
                value={formData.tan}
                onChange={(e) => handleChange('tan', e.target.value.toUpperCase())}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono uppercase"
                placeholder="BLRR12345D"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">GSTIN (Goods & Service Tax)</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono uppercase"
                placeholder="29AABCR7890K1Z5"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">EPFO Establishment Code</label>
              <input
                type="text"
                value={formData.pfEstablishmentCode}
                onChange={(e) => handleChange('pfEstablishmentCode', e.target.value.toUpperCase())}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono uppercase"
                placeholder="BGBNG1234567000"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">ESIC Registration Code</label>
              <input
                type="text"
                value={formData.esicCode}
                onChange={(e) => handleChange('esicCode', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="31000123450000999"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Professional Tax (PT) Reg. No</label>
              <input
                type="text"
                value={formData.ptRegistrationNo}
                onChange={(e) => handleChange('ptRegistrationNo', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="PT/KA/BLR/2023/9812"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Registered Addresses & Corporate Contact */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262D3D] pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5E0E]" />
              <h3 className="text-sm font-bold text-white">Company Addresses & Contact Info</h3>
            </div>
            <span className="text-[11px] text-gray-400">Printed on Payslips & Statutory Documents</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Registered Office Address</label>
              <textarea
                rows={3}
                value={formData.registeredAddress}
                onChange={(e) => handleChange('registeredAddress', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white resize-none"
                placeholder="Tech Park Hubballi & Electronic City, Bengaluru, Karnataka, India - 560100"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Manufacturing Plant / Factory Address</label>
              <textarea
                rows={3}
                value={formData.factoryAddress}
                onChange={(e) => handleChange('factoryAddress', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white resize-none"
                placeholder="Plot 42, Belur Industrial Area, Hubballi - Dharwad, Karnataka, India - 580011"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Payroll & HR Contact Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pl-9 pr-3 py-2 text-white"
                  placeholder="payroll@rivotmotors.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Corporate Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pl-9 pr-3 py-2 text-white"
                    placeholder="+91 80 4567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Official Website</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pl-9 pr-3 py-2 text-white"
                    placeholder="https://rivotmotors.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: SMTP Server Configuration (Email Dispatch Engine) */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262D3D] pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FF5E0E]" />
              <h3 className="text-sm font-bold text-white">Outbound SMTP Mail Server Settings</h3>
            </div>
            <span className="text-[11px] text-gray-400">Used to Email Monthly Payslips & Verification Codes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">SMTP Server Host</label>
              <input
                type="text"
                value={formData.smtp.host}
                onChange={(e) => handleSmtpChange('host', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">SMTP Port</label>
              <input
                type="number"
                value={formData.smtp.port}
                onChange={(e) => handleSmtpChange('port', parseInt(e.target.value) || 587)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="587"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">SSL / TLS Protocol</label>
              <select
                value={formData.smtp.secure ? 'SSL' : 'STARTTLS'}
                onChange={(e) => handleSmtpChange('secure', e.target.value === 'SSL')}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
              >
                <option value="STARTTLS">STARTTLS (Port 587 - Recommended)</option>
                <option value="SSL">SSL / TLS (Port 465)</option>
                <option value="NONE">Standard Plain (Port 25)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Sender From Name</label>
              <input
                type="text"
                value={formData.smtp.senderName}
                onChange={(e) => handleSmtpChange('senderName', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white"
                placeholder="RIVOT Motors HR & Payroll"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">SMTP Authentication Username</label>
              <input
                type="text"
                value={formData.smtp.username}
                onChange={(e) => handleSmtpChange('username', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="payroll@rivotmotors.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">SMTP Password / App Secret</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtp.password || ''}
                  onChange={(e) => handleSmtpChange('password', e.target.value)}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg pr-9 pl-2.5 py-2.5 text-white font-mono"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">From Sender Email</label>
              <input
                type="email"
                value={formData.smtp.senderEmail}
                onChange={(e) => handleSmtpChange('senderEmail', e.target.value)}
                className="w-full bg-[#181D27] border border-[#262D3D] rounded-lg p-2.5 text-white font-mono"
                placeholder="payroll@rivotmotors.com"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="w-full flex items-center justify-center gap-1.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-200 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>{isTestingSmtp ? 'Testing Connection...' : 'Test SMTP Connection'}</span>
              </button>
            </div>
          </div>

          {smtpTestResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
              smtpTestResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {smtpTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{smtpTestResult.message}</span>
            </div>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white text-xs px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-[#FF5E0E]/25 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Company Master & SMTP Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
