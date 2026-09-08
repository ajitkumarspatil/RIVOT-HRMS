import React, { useState } from 'react';
import { Employee } from '../types/payroll';
import { RivotLogo } from './RivotLogo';
import { 
  CheckCircle2, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  Building,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';

interface CandidateOnboardingViewProps {
  employee: Employee;
  onCompleteOnboarding: (empId: string, completedData: Partial<Employee>) => void;
  onCancel?: () => void;
}

export const CandidateOnboardingView: React.FC<CandidateOnboardingViewProps> = ({
  employee,
  onCompleteOnboarding,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [firstName, setFirstName] = useState<string>(employee.personalDetails.firstName || '');
  const [lastName, setLastName] = useState<string>(employee.personalDetails.lastName || '');
  const [phone, setPhone] = useState<string>(employee.personalDetails.phone || '');
  const [dob, setDob] = useState<string>(employee.personalDetails.dob || '1996-05-15');
  const [gender, setGender] = useState<string>(employee.personalDetails.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState<string>(employee.personalDetails.bloodGroup || 'O+');
  const [maritalStatus, setMaritalStatus] = useState<string>(employee.personalDetails.maritalStatus || 'Single');
  const [currentAddress, setCurrentAddress] = useState<string>(employee.personalDetails.currentAddress || 'Bengaluru, Karnataka');
  const [emergencyContactName, setEmergencyContactName] = useState<string>(employee.personalDetails.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>(employee.personalDetails.emergencyContactPhone || '');

  // Identity State
  const [pan, setPan] = useState<string>(employee.identityDetails.pan || '');
  const [aadhaar, setAadhaar] = useState<string>(employee.identityDetails.aadhaar || '');
  const [uan, setUan] = useState<string>(employee.identityDetails.uan || '');
  const [esicIp, setEsicIp] = useState<string>(employee.identityDetails.esicIp || '');

  // Banking State
  const [accountNumber, setAccountNumber] = useState<string>(employee.bankDetails.accountNumber || '');
  const [bankName, setBankName] = useState<string>(employee.bankDetails.bankName || 'HDFC Bank');
  const [ifsc, setIfsc] = useState<string>(employee.bankDetails.ifsc || 'HDFC0000240');
  const [branch, setBranch] = useState<string>(employee.bankDetails.branch || 'Koramangala, Bengaluru');

  // Security State
  const [password, setPassword] = useState<string>('Rivot@2026');
  const [confirmPassword, setConfirmPassword] = useState<string>('Rivot@2026');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Please enter your full legal name.');
      setStep(1);
      return;
    }
    if (!phone.trim()) {
      setValidationError('Please enter a valid mobile phone number.');
      setStep(1);
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      setStep(4);
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      setStep(4);
      return;
    }

    setValidationError(null);

    const completed: Partial<Employee> = {
      isProfileCompleted: true,
      isTempPasswordReset: true,
      status: 'ACTIVE',
      personalDetails: {
        ...employee.personalDetails,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dob,
        gender,
        bloodGroup,
        maritalStatus,
        currentAddress,
        permanentAddress: currentAddress,
        emergencyContactName: emergencyContactName.trim() || 'Parent/Spouse',
        emergencyContactPhone: emergencyContactPhone.trim() || phone.trim()
      },
      identityDetails: {
        ...employee.identityDetails,
        pan: pan.trim() || `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        aadhaar: aadhaar.trim() || 'XXXX-XXXX-1234',
        uan: uan.trim() || '101234567890',
        esicIp: esicIp.trim() || '5200123456'
      },
      bankDetails: {
        ...employee.bankDetails,
        accountNumber: accountNumber.trim() || '50100234567890',
        bankName: bankName.trim() || 'HDFC Bank',
        ifsc: ifsc.trim().toUpperCase() || 'HDFC0000240',
        branch: branch.trim() || 'Bengaluru Main'
      }
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onCompleteOnboarding(employee.id, completed);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-gray-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5E0E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <RivotLogo theme="dark" size="md" />
          <div>
            <span className="px-3 py-1 rounded-full bg-[#FF5E0E]/20 text-[#FF5E0E] text-xs font-bold uppercase tracking-wider">
              RIVOT MOTORS • Candidate Onboarding Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Welcome to the RIVOT Family!
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg mx-auto">
              Please complete your employee profile and statutory details to set up your payroll and biometric shift account.
            </p>
          </div>
        </div>

        {/* Candidate Invite Info Banner */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5E0E]/20 text-[#FF5E0E] flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Assigned Employee Code & Email</div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>{employee.empCode}</span>
                <span className="text-gray-500">•</span>
                <span className="text-emerald-400">{employee.email}</span>
              </div>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#181D27] border border-[#262D3D] transition-colors"
            >
              Exit to Admin Dashboard
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { s: 1, label: 'Personal', icon: User },
            { s: 2, label: 'Identity & PAN', icon: ShieldCheck },
            { s: 3, label: 'Bank Details', icon: CreditCard },
            { s: 4, label: 'Portal Password', icon: Lock }
          ].map(item => (
            <button
              key={item.s}
              onClick={() => setStep(item.s as 1 | 2 | 3 | 4)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                step === item.s 
                  ? 'bg-[#FF5E0E]/15 border-[#FF5E0E] text-white shadow-lg shadow-[#FF5E0E]/10' 
                  : step > item.s 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-[#12161E] border-[#262D3D] text-gray-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[11px] font-bold truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Onboarding Form Box */}
        <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-[#262D3D] pb-3">
                <h2 className="text-base font-bold text-white">Step 1: Personal Details</h2>
                <p className="text-xs text-gray-400">Legal details as appearing on official government records.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Vikram"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Patil"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E0E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E0E]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E0E]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5E0E]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Residential Address</label>
                <textarea
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="Flat/House, Street, Area, City, Pincode"
                  rows={2}
                  className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
                >
                  <span>Continue to Identity Proofs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Identity & Statutory */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-[#262D3D] pb-3">
                <h2 className="text-base font-bold text-white">Step 2: Statutory & Tax Identification</h2>
                <p className="text-xs text-gray-400">Required for monthly PF return, ESIC contribution, and Form 16 TDS filing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">PAN Card Number *</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono uppercase placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">10-digit alphanumeric permanent account number</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Aadhaar Card Number *</label>
                  <input
                    type="text"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-1234"
                    maxLength={14}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">12-digit UIDAI number</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Universal Account Number (UAN - EPF)</label>
                  <input
                    type="text"
                    value={uan}
                    onChange={(e) => setUan(e.target.value)}
                    placeholder="e.g. 101234567890 (if existing)"
                    maxLength={12}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Leave blank if this is your first employment</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">ESIC IP Number</label>
                  <input
                    type="text"
                    value={esicIp}
                    onChange={(e) => setEsicIp(e.target.value)}
                    placeholder="e.g. 5200123456 (if applicable)"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">For gross salaries &lt;= ₹21,000</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-[#181D27]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
                >
                  <span>Continue to Bank Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Banking Details */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-[#262D3D] pb-3">
                <h2 className="text-base font-bold text-white">Step 3: Salary Bank Account</h2>
                <p className="text-xs text-gray-400">Salary will be credited electronically via automated Bank NEFT / RTGS transfer.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 50100234567890"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0000240"
                    maxLength={11}
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white font-mono uppercase placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Koramangala 4th Block, Bengaluru"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-[#181D27]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-[#FF5E0E] hover:bg-[#E04E05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#FF5E0E]/20"
                >
                  <span>Continue to Security & Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Portal Password & Submission */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div className="border-b border-[#262D3D] pb-3">
                <h2 className="text-base font-bold text-white">Step 4: Create Portal Password</h2>
                <p className="text-xs text-gray-400">Choose a private password to access your monthly payslips, attendance records, and leave requests.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">New Portal Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#181D27] border border-[#262D3D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E0E]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FF5E0E]/10 border border-[#FF5E0E]/30 rounded-xl text-orange-200 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF5E0E] shrink-0 mt-0.5" />
                <span>
                  By submitting, you certify that the provided identification and bank details are accurate. 
                  Your profile status will immediately transition to <strong>Active</strong> and you will be logged into your employee portal.
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-[#181D27]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitted ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      <span>Activating Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration & Activate Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
