import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Advertisement, AdPlacement, AdType } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import { AdvertisementDisplay } from '../../components/AdvertisementDisplay.tsx';
import {
  Megaphone,
  PlusCircle,
  Power,
  Edit,
  Trash2,
  ShieldCheck,
  Eye,
  MousePointerClick,
  ExternalLink,
  Code2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

export const AdminAds: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [placement, setPlacement] = useState<AdPlacement>('below_product_image');
  const [type, setType] = useState<AdType>('banner');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sponsorName, setSponsorName] = useState('Official Partner');
  const [badgeText, setBadgeText] = useState('Verified');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAds();
      setAds(res.advertisements);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load advertisements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setTitle('');
    setPlacement('below_product_image');
    setType('banner');
    setContent('Exclusive buyer protection and expedited worldwide delivery included.');
    setLinkUrl('https://launchcraft.app/partner');
    setImageUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80');
    setSponsorName('Verified Logistics Network');
    setBadgeText('Official Partner');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setPlacement(ad.placement);
    setType(ad.type);
    setContent(ad.content);
    setLinkUrl(ad.linkUrl);
    setImageUrl(ad.imageUrl || '');
    setSponsorName(ad.sponsorName || 'Verified Partner');
    setBadgeText(ad.badgeText || 'Sponsored');
    setStatus(ad.status);
    setModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleAdminAd(id);
      showToast(res.message, 'success');
      setAds(prev => prev.map(a => a.id === id ? res.advertisement : a));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle ad status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await api.deleteAdminAd(id);
      showToast('Advertisement deleted', 'success');
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete ad', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide an advertisement title', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Advertisement> = {
        title: title.trim(),
        placement,
        type,
        content: content.trim(),
        linkUrl: linkUrl.trim(),
        imageUrl: imageUrl.trim(),
        sponsorName: sponsorName.trim(),
        badgeText: badgeText.trim(),
        status,
      };

      if (editingAd) {
        const res = await api.updateAdminAd(editingAd.id, payload);
        showToast('Advertisement updated successfully', 'success');
        setAds(prev => prev.map(a => a.id === editingAd.id ? res.advertisement : a));
      } else {
        const res = await api.createAdminAd(payload);
        showToast('Advertisement created and active', 'success');
        setAds(prev => [...prev, res.advertisement]);
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save advertisement', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Main Admin Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Advertisement Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure global sponsor banners, custom HTML widgets, and tracking links. All active ads propagate in real time to generated landing pages. When disabled, zero empty containers are rendered.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-102"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Advertisement</span>
        </button>
      </div>

      {/* Ad Placements Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading advertisements...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['below_product_image', 'footer', 'sticky_banner'] as AdPlacement[]).map((plc) => {
              const plcAds = ads.filter(a => a.placement === plc);
              const activeAd = plcAds.find(a => a.status === 'active');
              const label =
                plc === 'below_product_image'
                  ? 'Below Product Image'
                  : plc === 'footer'
                  ? 'Landing Page Footer'
                  : 'Floating Sticky Banner';

              return (
                <div key={plc} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">{label}</h3>
                      <p className="text-[11px] text-slate-400">
                        {activeAd ? 'Currently Active' : 'No Active Ad (Empty Box Prevented)'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        activeAd
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {activeAd ? 'Live' : 'Off'}
                    </span>
                  </div>

                  {activeAd ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span className="truncate">{activeAd.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{activeAd.content}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span>{activeAd.views} impressions • {activeAd.clicks} clicks</span>
                        <button
                          onClick={() => handleToggle(activeAd.id)}
                          className="text-rose-400 hover:underline"
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      Placement is quiet. No ad renders to visitors.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* All Advertisements Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                All Configured Advertisements ({ads.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-800">
              {ads.map((ad) => (
                <div key={ad.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {ad.placement}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ad.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{ad.content}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Sponsor: {ad.sponsorName || 'Network'}</span>
                      <span>•</span>
                      <span>Views: {ad.views || 0}</span>
                      <span>•</span>
                      <span>Clicks: {ad.clicks || 0}</span>
                      {ad.linkUrl && (
                        <>
                          <span>•</span>
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0">
                    <button
                      onClick={() => handleToggle(ad.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        ad.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{ad.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(ad)}
                      className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                      title="Edit Ad"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-2 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-['Space_Grotesk']">
                {editingAd ? 'Edit Advertisement' : 'Create Global Advertisement'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ad Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Verified Seller Guarantee Badge"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Placement Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  >
                    <option value="below_product_image">Below Product Image</option>
                    <option value="footer">Landing Page Footer</option>
                    <option value="sticky_banner">Floating Sticky Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ad Format
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AdType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  >
                    <option value="banner">Banner Card (Image + Text)</option>
                    <option value="custom_html">Custom HTML / Rich Snippet</option>
                    <option value="script">Script Snippet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ad Body / Content
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter ad copy or custom HTML/script markup..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Click Destination URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sponsor Name
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="Global Logistics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Official Partner"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs"
                  >
                    <option value="active">Active (Live)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {saving ? 'Saving...' : 'Save & Propagate Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
