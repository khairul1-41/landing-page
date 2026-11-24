import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { AnalyticsOverview } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Megaphone,
  Loader2,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading conversion analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Platform Analytics & Conversion Funnel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time traffic telemetry, checkout link click-through rates, and partner advertisement performance.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Page Views</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {(data?.totalViews || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Live server logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CTA Actions</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
            {(data?.totalClicks || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Checkout button clicks</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Global Sales CTR</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 font-['Space_Grotesk']">
            {data?.averageCtr || 0}%
          </div>
          <span className="text-[11px] text-indigo-400/80 mt-1 block">Conversion efficiency</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Main Admin Ad Clicks</span>
            <Megaphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-['Space_Grotesk']">
            {(data?.totalAdClicks || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            {data?.totalAdViews || 0} impressions ({data?.adCtr || 0}% CTR)
          </span>
        </div>
      </div>

      {/* Top Pages Performance */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Top Performing Landing Pages
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="p-4">Product / Landing Page</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Impressions</th>
                <th className="p-4 text-right">CTA Clicks</th>
                <th className="p-4 text-right">Conversion CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.topPages || []).map((page) => (
                <tr key={page.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{page.productName}</td>
                  <td className="p-4 font-mono text-indigo-400">/p/{page.slug}</td>
                  <td className="p-4 text-right font-mono text-slate-300">{page.views}</td>
                  <td className="p-4 text-right font-mono text-emerald-400">{page.clicks}</td>
                  <td className="p-4 text-right font-mono font-bold text-white">{page.ctr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Telemetry Stream */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Telemetry Stream</span>
          </h3>
        </div>
        <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
          {(data?.recentEvents || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No events recorded yet.</div>
          ) : (
            data?.recentEvents.map((evt) => (
              <div key={evt.id} className="p-3.5 px-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      evt.eventType === 'cta_click'
                        ? 'bg-emerald-400'
                        : evt.eventType === 'ad_click'
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                    }`}
                  />
                  <span className="font-semibold text-white uppercase text-[10px] tracking-wider">
                    {evt.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {evt.landingPageSlug ? `/p/${evt.landingPageSlug}` : `Ad: ${evt.adId}`}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
