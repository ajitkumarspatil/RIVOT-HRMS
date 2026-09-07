import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Download, ShieldCheck, Globe, Server, CheckCircle2 } from 'lucide-react';

interface UbuntuDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UbuntuDeployModal: React.FC<UbuntuDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const curlCommand = `curl -sSL https://hrms.rivotmotors.com/deploy-ubuntu.sh -o deploy.sh && chmod +x deploy.sh && sudo ./deploy.sh`;
  const manualGitClone = `git clone https://github.com/rivotmotors/rivot-hrms.git /var/www/rivot-hrms
cd /var/www/rivot-hrms
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const downloadScriptFile = () => {
    const scriptUrl = '/deploy-ubuntu.sh';
    const a = document.createElement('a');
    a.href = scriptUrl;
    a.download = 'deploy-ubuntu.sh';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5E0E]/15 border border-[#FF5E0E]/30 text-[#FF5E0E]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ubuntu VM Automated Deployment Engine
              </h3>
              <p className="text-xs text-gray-400">
                Turn-key script for <span className="text-[#FF5E0E] font-mono">https://hrms.rivotmotors.com</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181D27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-gray-300">

          {/* Quick Steps Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#181D27] p-3.5 rounded-xl border border-[#262D3D]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF5E0E] mb-1">
                <span className="w-5 h-5 rounded-full bg-[#FF5E0E]/20 flex items-center justify-center text-[10px]">1</span>
                <span>Launch Ubuntu VM</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Launch Ubuntu 22.04 or 24.04 LTS on AWS, GCP, or DigitalOcean (2GB+ RAM).
              </p>
            </div>

            <div className="bg-[#181D27] p-3.5 rounded-xl border border-[#262D3D]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF5E0E] mb-1">
                <span className="w-5 h-5 rounded-full bg-[#FF5E0E]/20 flex items-center justify-center text-[10px]">2</span>
                <span>Point DNS 'A' Record</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Point <code className="text-orange-300">hrms.rivotmotors.com</code> to the VM Public IP address.
              </p>
            </div>

            <div className="bg-[#181D27] p-3.5 rounded-xl border border-[#262D3D]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF5E0E] mb-1">
                <span className="w-5 h-5 rounded-full bg-[#FF5E0E]/20 flex items-center justify-center text-[10px]">3</span>
                <span>Run Automated Script</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Script provisions Node.js, Nginx, Let's Encrypt SSL, PM2 daemon & firewall!
              </p>
            </div>
          </div>

          {/* One-Click Terminal Execution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#FF5E0E]" />
                Automated One-Line Script Execution (SSH Terminal):
              </label>
              <button
                onClick={downloadScriptFile}
                className="text-xs text-[#FF5E0E] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download deploy-ubuntu.sh</span>
              </button>
            </div>

            <div className="relative bg-[#0B0D11] border border-[#262D3D] rounded-xl p-3 font-mono text-xs text-orange-200">
              <code>{curlCommand}</code>
              <button
                onClick={() => copyToClipboard(curlCommand, 'curl')}
                className="absolute right-2.5 top-2.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedCmd === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'curl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Alternative: Git Clone Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300">
              Or Run from Git Repository:
            </label>
            <div className="relative bg-[#0B0D11] border border-[#262D3D] rounded-xl p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap">
              {manualGitClone}
              <button
                onClick={() => copyToClipboard(manualGitClone, 'git')}
                className="absolute right-2.5 top-2.5 bg-[#181D27] hover:bg-[#202734] border border-[#262D3D] text-gray-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedCmd === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'git' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* What the automated script handles */}
          <div className="bg-[#181D27] border border-[#262D3D] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Infrastructure Provisions Included:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>Node.js v20 LTS & NPM</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>Nginx Reverse Proxy on Port 80 & 443</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>Let's Encrypt SSL (HTTPS) Auto-Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>PM2 Process Supervisor & Systemd Auto-Boot</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>UFW Firewall (Port 22, 80, 443 opened)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E0E]" />
                <span>100MB File Upload Limit for Biometric CSVs</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            RIVOT MOTORS IT & DevOps Infrastructure
          </span>
          <button
            onClick={onClose}
            className="bg-[#262D3D] hover:bg-[#323B4E] text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
