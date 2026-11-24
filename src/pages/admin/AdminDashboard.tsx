import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AnalyticsOverview, LandingPage, Advertisement } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import {
  Layers,
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  Megaphone,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Power,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [anRes, adsRes, usersRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminAds(),
        api.getAdminUsers(),
      ]);
      setAnalytics(anRes);
      setAds(adsRes.advertisements);
      setUsersCount(usersRes.users.length);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load admin overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAd = async (adId: string) => {
    try {
      const res = await api.toggleAdminAd(adId);
      showToast(res.message, 'success');
      setAds(prev => prev.map(a => a.id === adId ? res.advertisement : a));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle ad', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs text-slate-400">Loading administrative console...</p>
      </div>
    );
  }

  const activeAdsCount = ads.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Main Admin Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global metrics, advertisement propagation control, and platform activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/admin/landing-pages?create=true')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Landing Page</span>
          </button>
          <button
            onClick={() => navigate('/admin/advertisements')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Manage Ads
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Landing Pages</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            {analytics?.totalPages || 0}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {analytics?.publishedPages || 0} actively published
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Creators / Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            {usersCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Active accounts
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Traffic</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            {(analytics?.totalViews || 0).toLocaleString()} views
          </div>
          <span className="text-[11px] text-indigo-400 mt-1 block">
            {(analytics?.totalClicks || 0).toLocaleString()} CTA clicks ({analytics?.averageCtr || 0}% CTR)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Ads Placements</span>
            <Megaphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
            {activeAdsCount} / {ads.length}
          </div>
          <span className="text-[11px] text-amber-400 mt-1 block">
            Propagates to all generated pages
          </span>
        </div>
      </div>

      {/* Main Admin Advertisement Hub Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Main Admin Global Advertisements</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live advertisement engine. Normal creators cannot edit or disable these placements.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/advertisements')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Configure All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {ads.map((ad) => (
            <div key={ad.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{ad.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {ad.placement}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{ad.content}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Views: {ad.views || 0}</span>
                  <span>•</span>
                  <span>Clicks: {ad.clicks || 0}</span>
                  <span>•</span>
                  <span>Type: {ad.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAd(ad.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    ad.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{ad.status === 'active' ? 'Active' : 'Inactive'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Landing Pages */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Top Performing Landing Pages
          </h3>
          <button
            onClick={() => navigate('/admin/landing-pages')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Pages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {(analytics?.topPages || []).map((page) => (
            <div key={page.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">{page.productName}</h4>
                <p className="text-xs font-mono text-indigo-400">/p/{page.slug}</p>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <p className="font-bold text-white font-mono">{page.views} views</p>
                  <p className="text-[11px] text-emerald-400 font-mono">{page.clicks} clicks ({page.ctr}% CTR)</p>
                </div>
                <button
                  onClick={() => navigate(`/p/${page.slug}`)}
                  className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="View Live Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
