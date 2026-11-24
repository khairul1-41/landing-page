import React from 'react';
import { Rocket, ShieldCheck, Zap, Globe, Heart } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group inline-flex"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-lg font-['Space_Grotesk']">
                Launch<span className="text-indigo-400">Craft</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The high-converting sales landing page generator designed for creators, direct-to-consumer brands, and digital marketers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tencent EdgeOne & Node.js Ready</span>
            </div>
          </div>

          {/* Generator Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Generator</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => navigate('/create')} className="hover:text-white transition-colors">
                  Create Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/p/lumina-pro-anc-headphones')} className="hover:text-white transition-colors">
                  Sample: Modern Sleek
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/p/hyperpulse-smart-fitness-band')} className="hover:text-white transition-colors">
                  Sample: Flash Urgency
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/p/solis-glow-vitamin-serum')} className="hover:text-white transition-colors">
                  Sample: Minimalist Luxury
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
                  Creator Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                  Account Login / Register
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Access Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/advertisements')} className="hover:text-white transition-colors">
                  Advertisement Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Infrastructure & Security */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Security & Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero-leak admin role isolation, atomic slug reservation, server-side data verification, and strict ad injection protection.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                ABAC Hardened
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <Globe className="w-3 h-3 text-sky-400" />
                Edge CDN Cache
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            © {new Date().getFullYear()} LaunchCraft Platform. All rights reserved. Built for production scale.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Server Response: 200 OK</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for High Conversions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
