import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { ACOSettings } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import {
  Sparkles,
  Search,
  BarChart3,
  Zap,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  MousePointerClick,
  Bell,
  Smartphone,
  Gift,
  RefreshCw,
} from 'lucide-react';

export const AdminACO: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aco, setAco] = useState<ACOSettings>({
    seoTitleTemplate: '{{productName}} | Official Offer',
    defaultKeywords: 'deal, official launch, high conversion',
    googleVerificationCode: '',
    allowSearchIndexing: true,
    enableStructuredData: true,
    metaPixelId: '',
    ga4MeasurementId: '',
    tiktokPixelId: '',
    autoSocialProofToast: true,
    autoStickyMobileCheckout: true,
    autoExitIntentOffer: false,
    smartAdRotation: true,
  });

  useEffect(() => {
    api
      .getAdminACO()
      .then((res) => {
        setAco(res.aco);
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : 'Failed to load ACO settings', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateAdminACO(aco);
      setAco(res.aco);
      showToast(res.message, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save ACO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading ACO & SEO optimization settings...</p>
      </div>
    );
  }

  const previewTitle = (aco.seoTitleTemplate || '{{productName}} | Official Offer')
    .replace('{{productName}}', 'Lumina Sound Pro ANC Headphones')
    .replace('{{siteName}}', 'LaunchCraft');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACO Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            ACO & SEO Optimization Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Ad & Conversion Optimization (ACO), tracking pixels, smart ad rotation, and global Search Engine Optimization (SEO).
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Ad & Conversion Optimization (ACO) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                1. Ad & Conversion Optimization (ACO) Boosters
              </h2>
              <p className="text-[11px] text-slate-400">
                Automatically enhance generated landing pages with proven conversion boosters and ad delivery rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Auto Social Proof Buyer Toasts</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Shows verified recent purchase popups on public landing pages to increase buyer trust.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.autoSocialProofToast}
                onChange={(e) => setAco({ ...aco, autoSocialProofToast: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Auto Sticky Mobile Checkout Bar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Keeps price and Buy CTA accessible on mobile screens (yields cleanly when sticky ad is active).
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.autoStickyMobileCheckout}
                onChange={(e) => setAco({ ...aco, autoStickyMobileCheckout: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-start gap-3">
                <Gift className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Auto Exit-Intent Offer Popup</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Displays a limited-time reminder offer modal if a visitor is about to leave the page.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.autoExitIntentOffer}
                onChange={(e) => setAco({ ...aco, autoExitIntentOffer: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Smart Ad Rotation</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automatically rotates between multiple active Main Admin ads in the same placement slot.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.smartAdRotation}
                onChange={(e) => setAco({ ...aco, smartAdRotation: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Section 2: Analytics & Ad Pixels */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                2. Tracking Pixels & Attribution IDs
              </h2>
              <p className="text-[11px] text-slate-400">
                Attach global tracking identifiers for Meta Ads, Google Analytics 4, and TikTok Ads across landing pages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={aco.metaPixelId}
                onChange={(e) => setAco({ ...aco, metaPixelId: e.target.value })}
                placeholder="e.g. 123456789012345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google Analytics 4 (GA4) ID
              </label>
              <input
                type="text"
                value={aco.ga4MeasurementId}
                onChange={(e) => setAco({ ...aco, ga4MeasurementId: e.target.value })}
                placeholder="e.g. G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={aco.tiktokPixelId}
                onChange={(e) => setAco({ ...aco, tiktokPixelId: e.target.value })}
                placeholder="e.g. CXXXXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: SEO & Search Engine Optimization */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Search className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                3. Search Engine Optimization (SEO) & Schema
              </h2>
              <p className="text-[11px] text-slate-400">
                Control how generated landing pages appear in Google search results and social share previews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SEO Title Template
              </label>
              <input
                type="text"
                value={aco.seoTitleTemplate}
                onChange={(e) => setAco({ ...aco, seoTitleTemplate: e.target.value })}
                placeholder="{{productName}} | Official Offer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tokens supported: <code className="text-amber-300">{'{{productName}}'}</code>,{' '}
                <code className="text-amber-300">{'{{siteName}}'}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google Site Verification Code
              </label>
              <input
                type="text"
                value={aco.googleVerificationCode}
                onChange={(e) => setAco({ ...aco, googleVerificationCode: e.target.value })}
                placeholder="Verification token for Search Console"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Meta Keywords
            </label>
            <input
              type="text"
              value={aco.defaultKeywords}
              onChange={(e) => setAco({ ...aco, defaultKeywords: e.target.value })}
              placeholder="deal, official launch, verified product, discount"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Allow Search Engine Indexing</p>
                  <p className="text-[11px] text-slate-400">Sets robots meta to index, follow by default.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.allowSearchIndexing}
                onChange={(e) => setAco({ ...aco, allowSearchIndexing: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div className="flex items-start gap-2.5">
                <MousePointerClick className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Enable Product JSON-LD Rich Schema</p>
                  <p className="text-[11px] text-slate-400">
                    Outputs structured price, rating, and availability markup for Google rich snippets.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={aco.enableStructuredData}
                onChange={(e) => setAco({ ...aco, enableStructuredData: e.target.checked })}
                className="mt-1 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Live SERP Preview */}
          <div className="p-4 rounded-xl bg-white text-slate-900 space-y-1 border border-slate-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Google Search Preview
            </p>
            <p className="text-xs text-emerald-700 font-mono">
              https://yourdomain.com/p/lumina-pro-anc-headphones
            </p>
            <h4 className="text-base font-semibold text-blue-700 hover:underline leading-snug">
              {previewTitle}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2">
              Studio-Grade Acoustic Precision with 45-Hour Battery & Active Noise Cancellation. Save 33% today with verified buyer protection.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save ACO & SEO Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
