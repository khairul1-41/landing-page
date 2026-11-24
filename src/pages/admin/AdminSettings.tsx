import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { SiteSettings } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import { Settings, Save, Globe, ShieldCheck, Server, Loader2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState('LaunchCraft');
  const [defaultSiteUrl, setDefaultSiteUrl] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [adDisclosureNotice, setAdDisclosureNotice] = useState('');
  const [edgeOneCdnEnabled, setEdgeOneCdnEnabled] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSettings();
      const s = res.settings;
      setSiteName(s.siteName);
      setDefaultSiteUrl(s.defaultSiteUrl || window.location.origin);
      setMetaDescription(s.metaDescription);
      setSupportEmail(s.supportEmail);
      setAdDisclosureNotice(s.adDisclosureNotice);
      setEdgeOneCdnEnabled(s.edgeOneCdnEnabled ?? true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAdminSettings({
        siteName,
        defaultSiteUrl,
        metaDescription,
        supportEmail,
        adDisclosureNotice,
        edgeOneCdnEnabled,
      });
      showToast('Platform settings saved successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
          Website & Infrastructure Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure production domain endpoints, Tencent EdgeOne CDN parameters, and global ad disclosures.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Platform Branding & Domain</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Canonical Base URL (No Hardcoding)
              </label>
              <input
                type="url"
                required
                value={defaultSiteUrl}
                onChange={(e) => setDefaultSiteUrl(e.target.value)}
                placeholder="https://yourdomain.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Dynamically supports current production domain, EdgeOne, or staging environments.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Global Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Platform Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
            />
          </div>
        </div>

        {/* Advertisement Disclosure */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Advertisement Compliance & Policy</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Global Ad Disclosure Label
            </label>
            <input
              type="text"
              value={adDisclosureNotice}
              onChange={(e) => setAdDisclosureNotice(e.target.value)}
              placeholder="Sponsored Placement • Verified Merchant Partner"
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Displayed on all generated landing pages above or below Main Admin advertisements.
            </p>
          </div>
        </div>

        {/* EdgeOne Compatibility */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Tencent EdgeOne Makers & Edge Optimization</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">EdgeOne CDN Edge Caching</p>
              <p className="text-[11px] text-slate-400">
                Optimizes static landing page asset delivery and resolves client host headers dynamically.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={edgeOneCdnEnabled}
                onChange={(e) => setEdgeOneCdnEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
