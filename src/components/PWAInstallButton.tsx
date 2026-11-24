import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Smartphone, Check, X, Share, PlusSquare, ArrowUpRight, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'mobile' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone app, suppress or show active badge
  if (isInstalled) {
    if (variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Check className="w-3.5 h-3.5" />
          <span>App Active</span>
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  // 1. Mobile Drawer Variant
  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 active:scale-98 transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span>Install LaunchCraft App</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25">
            PWA
          </span>
        </button>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
        {showGuideModal && <GenericInstallModal onClose={() => setShowGuideModal(false)} />}
      </>
    );
  }

  // 2. Banner Variant (e.g. for Home Page or Dashboard)
  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-violet-950/90 text-white border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30 shrink-0">
              <img src="/icon.svg" alt="App Icon" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base font-['Space_Grotesk'] text-white">
                  Install LaunchCraft App
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Android & Desktop
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Add LaunchCraft to your home screen or desktop dock for instant offline access and app-like performance.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install LaunchCraft App</span>
          </button>
        </div>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
        {showGuideModal && <GenericInstallModal onClose={() => setShowGuideModal(false)} />}
      </>
    );
  }

  // 3. Navbar Variant (Default)
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-102 active:scale-98 ${className}`}
        title="Install LaunchCraft as Native App on Android, iOS or Desktop"
      >
        <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      {showGuideModal && <GenericInstallModal onClose={() => setShowGuideModal(false)} />}
    </>
  );
};

// Modal for iOS Safari Users
function IOSInstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold font-['Space_Grotesk']">Install on iPhone / iPad</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Apple iOS Safari allows installation directly without app stores:
        </p>

        <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Tap Share Button</p>
              <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                In Safari, tap the <Share className="w-3.5 h-3.5 text-sky-500 inline" /> icon at bottom of screen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Select "Add to Home Screen"</p>
              <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-indigo-500 inline" /> <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Launch from Home Screen</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                LaunchCraft will open in full-screen standalone app mode.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

// Modal for Desktop Chrome / Edge / Firefox when automatic prompt hasn't triggered
function GenericInstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold font-['Space_Grotesk']">Install App</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-2 space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
            <img src="/icon.svg" alt="App Icon" className="w-10 h-10 rounded-lg" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">LaunchCraft PWA</h4>
          <p className="text-xs text-slate-500">
            Install on your desktop or mobile device to open as a standalone app.
          </p>
        </div>

        <div className="text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-600 dark:text-slate-300">
          <p>
            • In <strong>Chrome/Edge on Desktop</strong>: Click the install icon (🖥️ or ⬇️) in your browser address bar.
          </p>
          <p>
            • In <strong>Chrome on Android</strong>: Tap the three dots menu (⋮) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
