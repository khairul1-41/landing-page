import React from 'react';
import {
  Rocket,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sliders,
  Eye,
  CheckCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Star,
  Users,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-violet-600 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Production-Ready Landing Page Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1] font-['Space_Grotesk']">
              Build Sales Pages That <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">Actually Convert</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Launch beautiful, high-converting product landing pages with instant unique slugs, automated urgency elements, buyer trust seals, and a centralized Main Admin advertisement engine.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/create')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98"
              >
                <Rocket className="w-4 h-4" />
                <span>Generate Your Landing Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/p/lumina-pro-anc-headphones')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base transition-colors shadow-xs"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Explore Live Demo Page</span>
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Instant Unique Slugs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                5 High-Conversion Templates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Protected Main Admin Ads
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                EdgeOne Ready
              </span>
            </div>
          </div>

          {/* In-App PWA Install Banner */}
          <div className="mt-10 max-w-4xl mx-auto">
            <PWAInstallButton variant="banner" />
          </div>

          {/* Interactive Feature Showcase Card */}
          <div className="mt-10 max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-indigo-500/20 via-slate-200/40 dark:via-slate-800/40 to-transparent shadow-2xl">
            <div className="rounded-[22px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="ml-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                    https://launchcraft.app/p/lumina-pro-anc-headphones
                  </span>
                </div>
                <button
                  onClick={() => navigate('/p/lumina-pro-anc-headphones')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Showcase Banner */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Featured Layout • Modern Sleek
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight font-['Space_Grotesk']">
                    Lumina Sound Pro ANC Headphones
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Studio-grade acoustic precision with 45-hour battery, custom 40mm beryllium drivers, and hybrid active noise cancellation.
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">$199.99</span>
                    <span className="text-base text-slate-600 dark:text-slate-400 line-through">$299.99</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      Save 33%
                    </span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => navigate('/p/lumina-pro-anc-headphones')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      Test Live Conversion CTA
                    </button>
                    <button
                      onClick={() => navigate('/create')}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                    >
                      Generate Similar Page
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                    alt="Lumina Headphones"
                    className="w-full h-64 sm:h-72 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.9 (1,248 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Ready-to-Test Sample Pages */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk']">
              Explore Live Pre-Built Landing Pages
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every page is fully functional with live view counters, conversion tracking, custom template styling, and admin ads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                alt="Modern Sleek"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Modern Sleek
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">$199.99</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Lumina Pro ANC Headphones
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    Clean high-contrast minimalism with smooth hero gradients, crisp feature cards, and dynamic social proof.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">/p/lumina-pro-anc-headphones</span>
                  <button
                    onClick={() => navigate('/p/lumina-pro-anc-headphones')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                  >
                    <span>View Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80"
                alt="High-Converting Urgency"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Flash Urgency
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">$89.00</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    HyperPulse Smart Fitness Band
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    Real-time countdown timer, stock meter, pulsing action buttons, and military-grade durability badges.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">/p/hyperpulse-smart-fitness-band</span>
                  <button
                    onClick={() => navigate('/p/hyperpulse-smart-fitness-band')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
                  >
                    <span>View Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
                alt="Minimalist Luxury"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Minimalist Luxury
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">$68.00</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Solis Radiance Youth Elixir
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    Editorial typography, high-end botanical ingredients, clean certifications, and organic beauty trust seals.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">/p/solis-glow-vitamin-serum</span>
                  <button
                    onClick={() => navigate('/p/solis-glow-vitamin-serum')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-xs font-semibold transition-colors"
                  >
                    <span>View Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Highlights */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Enterprise Quality Standards
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 font-['Space_Grotesk']">
            Engineered for High Conversion & Strict Security
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Atomic Slug Engine
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time asynchronous slug availability checking, reserved system route guards, and zero duplicate collisions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Main Admin Ad Guard
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Advertisements are strictly controlled by the Main Admin. Normal users cannot tamper, inject code, or disable ads. Live zero-box fallback when inactive.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Conversion Telemetry
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track page views, CTA button clicks, and sponsor ad engagements directly from the user dashboard and admin analytics console.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/40 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Ready to Publish Your Next Bestseller?
            </h3>
            <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
              Generate a high-converting landing page in under 60 seconds with product image validation and customized layouts.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Start Page Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
