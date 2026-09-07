import React, { useState } from 'react';
import { RivotLogo } from './RivotLogo';
import { X, Download, Copy, Check, Info, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { generateRivotSvg } from '../utils/logoSvgGenerator';

interface LogoAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoAssetsModal: React.FC<LogoAssetsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'FULL' | 'EMBLEM'>('FULL');

  if (!isOpen) return null;

  const downloadSvgFile = (theme: 'white' | 'black', isEmblemOnly: boolean = false) => {
    const svgStr = generateRivotSvg(theme, true, !isEmblemOnly);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIVOT-New-Logo-${theme === 'white' ? 'White' : 'Black'}${isEmblemOnly ? '-Emblem' : ''}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPngFile = (theme: 'white' | 'black', isEmblemOnly: boolean = false) => {
    const svgStr = generateRivotSvg(theme, true, !isEmblemOnly);
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = isEmblemOnly ? 800 : 2400;
      const height = isEmblemOnly ? 800 : 500;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw background matching theme
        ctx.fillStyle = theme === 'white' ? '#000000' : '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Calculate positioning
        const padding = isEmblemOnly ? 80 : 120;
        const drawW = width - padding * 2;
        const drawH = isEmblemOnly ? drawW : drawW * (200 / 960);
        const startX = padding;
        const startY = (height - drawH) / 2;

        ctx.drawImage(img, startX, startY, drawW, drawH);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `RIVOT-New-Logo-${theme === 'white' ? 'White' : 'Black'}${isEmblemOnly ? '-Emblem' : ''}.png`;
        a.click();
      }
      URL.revokeObjectURL(blobURL);
    };

    img.src = blobURL;
  };

  const copySvgToClipboard = (theme: 'white' | 'black', isEmblemOnly: boolean = false) => {
    const svgStr = generateRivotSvg(theme, true, !isEmblemOnly);
    navigator.clipboard.writeText(svgStr);
    const key = `${theme}_${isEmblemOnly ? 'emblem' : 'full'}`;
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#12161E] border border-[#262D3D] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D3D] bg-[#0B0D11]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#181D27] border border-[#262D3D] flex items-center justify-center text-[#FF5E0E]">
              <RivotLogo theme="dark" size="sm" variant="emblem" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Official RIVOT Brand Identity Assets
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Approved 2026
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Official high-resolution vector SVGs &amp; PNGs matching RIVOT New Logo White &amp; Black masters
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

        {/* Tab Switcher */}
        <div className="flex border-b border-[#262D3D] bg-[#0E121A] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('FULL')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'FULL'
                ? 'border-[#FF5E0E] text-white bg-[#181D27]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#FF5E0E]" />
            Full Lockup (Emblem + Wordmark)
          </button>
          <button
            onClick={() => setActiveTab('EMBLEM')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'EMBLEM'
                ? 'border-[#FF5E0E] text-white bg-[#181D27]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5E0E]" />
            Circular Emblem Only (Favicon &amp; App Icon)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {activeTab === 'FULL' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Asset 1: White Logo on Black Background */}
              <div className="border border-[#262D3D] rounded-xl overflow-hidden flex flex-col bg-[#0B0D11]">
                <div className="px-4 py-2.5 bg-[#181D27] border-b border-[#262D3D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                    <span className="text-xs font-bold text-white">RIVOT New Logo White</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">White on Pure Black</span>
                </div>

                <div className="p-8 bg-[#000000] flex items-center justify-center min-h-[160px] border-b border-[#262D3D]">
                  <RivotLogo theme="dark" size="lg" />
                </div>

                <div className="p-4 bg-[#12161E] flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <p className="text-xs text-gray-300 font-medium">Dark Canvas Primary Asset</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Used for software interfaces, dark dashboards, vehicle telematics, and dark merch.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#262D3D]/60">
                    <button
                      onClick={() => copySvgToClipboard('white', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#1F2633] text-gray-200 hover:text-white hover:bg-[#2A3446] font-medium transition-colors"
                    >
                      {copied === 'white_full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'white_full' ? 'SVG Copied' : 'Copy SVG'}</span>
                    </button>
                    <button
                      onClick={() => downloadSvgFile('white', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#262D3D] text-gray-200 hover:text-white hover:bg-[#323B4E] font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => downloadPngFile('white', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#FF5E0E] text-white hover:bg-[#E04E05] font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG 4K</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Asset 2: Black Logo on White Background */}
              <div className="border border-[#262D3D] rounded-xl overflow-hidden flex flex-col bg-[#0B0D11]">
                <div className="px-4 py-2.5 bg-[#181D27] border-b border-[#262D3D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-black border border-gray-400"></span>
                    <span className="text-xs font-bold text-white">RIVOT New Logo Black</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Black on Pure White</span>
                </div>

                <div className="p-8 bg-[#FFFFFF] flex items-center justify-center min-h-[160px] border-b border-[#262D3D]">
                  <RivotLogo theme="light" size="lg" />
                </div>

                <div className="p-4 bg-[#12161E] flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <p className="text-xs text-gray-300 font-medium">Light Canvas / Print Master</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Used for PDF salary slips, formal bank letters, statutory returns, and white documents.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#262D3D]/60">
                    <button
                      onClick={() => copySvgToClipboard('black', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#1F2633] text-gray-200 hover:text-white hover:bg-[#2A3446] font-medium transition-colors"
                    >
                      {copied === 'black_full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'black_full' ? 'SVG Copied' : 'Copy SVG'}</span>
                    </button>
                    <button
                      onClick={() => downloadSvgFile('black', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#262D3D] text-gray-200 hover:text-white hover:bg-[#323B4E] font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => downloadPngFile('black', false)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-[#FF5E0E] text-white hover:bg-[#E04E05] font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG 4K</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Emblem 1: White Emblem on Dark */}
              <div className="border border-[#262D3D] rounded-xl overflow-hidden flex flex-col bg-[#0B0D11]">
                <div className="px-4 py-2.5 bg-[#181D27] border-b border-[#262D3D] flex items-center justify-between">
                  <span className="text-xs font-bold text-white">White Circular Emblem</span>
                  <span className="text-[10px] text-gray-400 font-mono">1:1 Square</span>
                </div>
                <div className="p-8 bg-[#000000] flex items-center justify-center min-h-[160px] border-b border-[#262D3D]">
                  <RivotLogo theme="dark" size="xl" variant="emblem" />
                </div>
                <div className="p-4 bg-[#12161E] flex items-center gap-2">
                  <button
                    onClick={() => copySvgToClipboard('white', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#1F2633] text-gray-200 hover:text-white font-medium"
                  >
                    {copied === 'white_emblem' ? 'Copied' : 'Copy SVG'}
                  </button>
                  <button
                    onClick={() => downloadSvgFile('white', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#262D3D] text-gray-200 hover:text-white font-medium"
                  >
                    Download SVG
                  </button>
                  <button
                    onClick={() => downloadPngFile('white', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#FF5E0E] text-white font-semibold hover:bg-[#E04E05]"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

              {/* Emblem 2: Black Emblem on Light */}
              <div className="border border-[#262D3D] rounded-xl overflow-hidden flex flex-col bg-[#0B0D11]">
                <div className="px-4 py-2.5 bg-[#181D27] border-b border-[#262D3D] flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Black Circular Emblem</span>
                  <span className="text-[10px] text-gray-400 font-mono">1:1 Square</span>
                </div>
                <div className="p-8 bg-[#FFFFFF] flex items-center justify-center min-h-[160px] border-b border-[#262D3D]">
                  <RivotLogo theme="light" size="xl" variant="emblem" />
                </div>
                <div className="p-4 bg-[#12161E] flex items-center gap-2">
                  <button
                    onClick={() => copySvgToClipboard('black', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#1F2633] text-gray-200 hover:text-white font-medium"
                  >
                    {copied === 'black_emblem' ? 'Copied' : 'Copy SVG'}
                  </button>
                  <button
                    onClick={() => downloadSvgFile('black', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#262D3D] text-gray-200 hover:text-white font-medium"
                  >
                    Download SVG
                  </button>
                  <button
                    onClick={() => downloadPngFile('black', true)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-[#FF5E0E] text-white font-semibold hover:bg-[#E04E05]"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Brand Identity Guidelines & Palette */}
          <div className="p-4 bg-[#0E121A] border border-[#262D3D] rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
              <Info className="w-4 h-4 text-[#FF5E0E]" />
              Official RIVOT Brand Specification Guidelines
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#12161E] rounded-lg border border-[#262D3D]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3.5 h-3.5 rounded bg-black border border-gray-500"></span>
                  <span className="font-bold text-white">Obsidian Black</span>
                </div>
                <p className="font-mono text-[11px] text-gray-400">HEX: #000000 / #0B0D11</p>
                <p className="text-[10px] text-gray-400 mt-1">Light canvas wordmark &amp; primary background</p>
              </div>

              <div className="p-3 bg-[#12161E] rounded-lg border border-[#262D3D]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3.5 h-3.5 rounded bg-white"></span>
                  <span className="font-bold text-white">Pure Arctic White</span>
                </div>
                <p className="font-mono text-[11px] text-gray-400">HEX: #FFFFFF</p>
                <p className="text-[10px] text-gray-400 mt-1">Dark canvas wordmark &amp; light background</p>
              </div>

              <div className="p-3 bg-[#12161E] rounded-lg border border-[#262D3D]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3.5 h-3.5 rounded bg-[#FF5E0E]"></span>
                  <span className="font-bold text-white">RIVOT Racing Orange</span>
                </div>
                <p className="font-mono text-[11px] text-gray-400">HEX: #FF5E0E</p>
                <p className="text-[10px] text-gray-400 mt-1">HRMS interactive accent &amp; status highlights</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                All vector paths are pre-scaled for infinite raster-free magnification. Static assets also available directly at <code className="text-gray-300 font-mono">/rivot-logo-white.svg</code> and <code className="text-gray-300 font-mono">/rivot-logo-black.svg</code>.
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0B0D11] border-t border-[#262D3D] flex items-center justify-between text-xs text-gray-400">
          <span>RIVOT MOTORS PRIVATE LIMITED • Brand Identity System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1F2633] text-gray-200 hover:text-white transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
