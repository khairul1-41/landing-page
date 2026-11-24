import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { LandingPage, TemplateDefinition } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import { ImageUploader } from '../../components/ImageUploader.tsx';
import {
  Power,
  Trash2,
  ExternalLink,
  Edit,
  Loader2,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  Rocket,
  Sparkles,
} from 'lucide-react';

interface AdminLandingPagesProps {
  navigate: (path: string) => void;
}

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';

export const AdminLandingPages: React.FC<AdminLandingPagesProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49.99');
  const [originalPrice, setOriginalPrice] = useState('79.99');
  const [currency, setCurrency] = useState('USD');
  const [ctaText, setCtaText] = useState('Get Launch Offer Now');
  const [ctaLink, setCtaLink] = useState('https://checkout.stripe.com/pay/demo');
  const [templateId, setTemplateId] = useState('modern-sleek');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMG);
  const [urgentBannerText, setUrgentBannerText] = useState('🔥 Limited Time Offer: Save today before stock runs out!');
  const [guaranteeText, setGuaranteeText] = useState('30-Day Money Back Guarantee • Verified Official Page');
  const [status, setStatus] = useState<'published' | 'disabled'>('published');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [enableSocialProof, setEnableSocialProof] = useState(true);
  const [enableStickyCheckout, setEnableStickyCheckout] = useState(true);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagesRes, tplRes] = await Promise.all([
        api.getMyPages(true),
        api.getTemplates(),
      ]);
      setPages(pagesRes.pages);
      const activeTpls = tplRes.templates.filter((t) => t.isActive);
      setTemplates(activeTpls);
      if (activeTpls.length > 0 && !activeTpls.some((t) => t.id === templateId)) {
        setTemplateId(activeTpls[0].id);
        setThemeColor(activeTpls[0].defaultTheme || '#4f46e5');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load landing pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, []);

  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 2) {
      setSlugAvailable(null);
      setSlugError('Slug must be at least 2 characters.');
      return;
    }
    setSlugChecking(true);
    try {
      const res = await api.checkSlug(slugToCheck);
      if (res.available) {
        setSlugAvailable(true);
        setSlugError(null);
      } else {
        setSlugAvailable(false);
        setSlugError(res.error || 'Slug already in use.');
      }
    } catch {
      setSlugAvailable(false);
      setSlugError('Unable to check slug availability.');
    } finally {
      setSlugChecking(false);
    }
  };

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    setSlug(generated);
    if (generated.length >= 2) {
      checkSlugAvailability(generated);
    } else {
      setSlugAvailable(null);
      setSlugError(null);
    }
  };

  const resetCreateForm = () => {
    setProductName('');
    setSlug('');
    setSlugAvailable(null);
    setSlugError(null);
    setSubtitle('');
    setDescription('');
    setPrice('49.99');
    setOriginalPrice('79.99');
    setCurrency('USD');
    setCtaText('Get Launch Offer Now');
    setCtaLink('https://checkout.stripe.com/pay/demo');
    setImageUrl(DEFAULT_IMG);
    setUrgentBannerText('🔥 Limited Time Offer: Save today before stock runs out!');
    setGuaranteeText('30-Day Money Back Guarantee • Verified Official Page');
    setStatus('published');
    setSeoTitle('');
    setSeoKeywords('');
    setEnableSocialProof(true);
    setEnableStickyCheckout(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || productName.trim().length < 2) {
      showToast('Product name must be at least 2 characters.', 'error');
      return;
    }
    if (!slug.trim() || slug.length < 2 || slugAvailable === false) {
      showToast(slugError || 'Please enter a valid available URL slug.', 'error');
      return;
    }
    const numPrice = parseFloat(price);
    const numOrig = parseFloat(originalPrice || price);
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('Please select or upload a product image.', 'error');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createPage({
        productName: productName.trim(),
        slug: slug.trim(),
        subtitle: subtitle.trim(),
        description: description.trim() || `${productName.trim()} — official high-converting launch page.`,
        price: numPrice,
        originalPrice: isNaN(numOrig) ? numPrice : numOrig,
        currency,
        ctaText: ctaText.trim() || 'Buy Now',
        ctaLink: ctaLink.trim() || '#',
        templateId,
        themeColor,
        imageUrl: imageUrl.trim(),
        galleryUrls: [imageUrl.trim()],
        urgentBannerText: urgentBannerText.trim(),
        guaranteeText: guaranteeText.trim(),
        status,
        features: [
          { id: '1', title: 'Verified Quality', description: 'Built for reliability and immediate buyer confidence.', iconName: 'ShieldCheck' },
          { id: '2', title: 'Fast Global Access', description: 'Instant delivery and responsive mobile checkout.', iconName: 'Zap' },
          { id: '3', title: 'Risk-Free Guarantee', description: 'Backed by our 30-day satisfaction policy.', iconName: 'Sparkles' },
        ],
        aco: {
          seoTitle: seoTitle.trim(),
          seoKeywords: seoKeywords.trim(),
          enableSocialProof,
          enableStickyCheckout,
        },
      });
      setPages((prev) => [res.page, ...prev]);
      showToast(`Landing page "/p/${res.page.slug}" published from Admin!`, 'success');
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create landing page', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.togglePageStatus(id);
      showToast(res.message, 'success');
      setPages((prev) => prev.map((p) => (p.id === id ? res.page : p)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deletePage(deleteTarget.id);
      showToast('Page deleted by Admin', 'success');
      setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete page', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Landing Pages Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create new landing pages directly from Admin or moderate existing pages ({pages.length} total).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, slug, user..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Landing Page</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading landing pages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-slate-400">No landing pages match your search filter.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Landing Page</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((page) => {
              const ctr = page.viewCount > 0 ? ((page.clickCount / page.viewCount) * 100).toFixed(1) : '0.0';
              return (
                <div key={page.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={page.imageUrl}
                      alt={page.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{page.productName}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            page.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {page.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-indigo-400">/p/{page.slug}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>
                          Creator: <strong className="text-slate-400">{page.userEmail}</strong>
                        </span>
                        <span>•</span>
                        <span>Price: ${page.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>Template: {page.templateId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 pt-2 md:pt-0">
                    <div className="text-right text-xs">
                      <p className="font-bold text-white font-mono">{page.viewCount || 0} views</p>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        {page.clickCount || 0} clicks ({ctr}%)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/p/${page.slug}`)}
                        className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/create?id=${page.id}`)}
                        className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
                        title="Edit Page"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggle(page.id)}
                        className={`p-2 rounded-lg border ${
                          page.status === 'published'
                            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40'
                            : 'border-slate-800 text-slate-500 hover:bg-slate-800'
                        }`}
                        title={page.status === 'published' ? 'Disable Page' : 'Publish Page'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(page)}
                        className="p-2 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/40"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Landing Page Modal inside Admin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Add New Landing Page (Admin)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Instantly publish a landing page with custom template & ACO options.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  className="text-[11px] font-semibold text-indigo-400 hover:underline px-2 py-1"
                >
                  Full Builder →
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Product / Page Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    placeholder="e.g. LaunchCraft Android Pro APK"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Slug *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-mono text-slate-500">/p/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setSlug(val);
                        checkSlugAvailability(val);
                      }}
                      placeholder="launchcraft-pro"
                      className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm"
                    />
                    <div className="absolute right-2.5 text-[10px]">
                      {slugChecking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      ) : slugAvailable === true ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
                          <Check className="w-3 h-3" /> OK
                        </span>
                      ) : slugAvailable === false ? (
                        <span className="text-rose-400 flex items-center gap-0.5 font-semibold">
                          <AlertCircle className="w-3 h-3" /> Taken
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {slugError && <p className="text-[10px] text-rose-400 mt-1">{slugError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Short high-converting headline shown beneath the product name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe product benefits and offer details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Button Text *</label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Destination URL *</label>
                  <input
                    type="url"
                    required
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Presentation Template</label>
                  <select
                    value={templateId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setTemplateId(nextId);
                      const tpl = templates.find((t) => t.id === nextId);
                      if (tpl?.defaultTheme) setThemeColor(tpl.defaultTheme);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} ({tpl.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'disabled')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  >
                    <option value="published">Published (Live Immediately)</option>
                    <option value="disabled">Disabled (Draft)</option>
                  </select>
                </div>
              </div>

              <ImageUploader
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                label="Product Showcase Image"
                description="Upload an image or pick a preset below."
              />

              {/* Quick ACO & SEO Options */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ACO & SEO Quick Options</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom SEO Title (optional)"
                    className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="SEO Keywords (optional)"
                    className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs"
                  />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSocialProof}
                      onChange={(e) => setEnableSocialProof(e.target.checked)}
                      className="rounded border-slate-600 text-amber-500"
                    />
                    <span>Social Proof Toast</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStickyCheckout}
                      onChange={(e) => setEnableStickyCheckout(e.target.checked)}
                      className="rounded border-slate-600 text-amber-500"
                    />
                    <span>Sticky Mobile Checkout</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  <span>Create & Publish Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Delete Landing Page?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{deleteTarget.productName}</strong> (
              <span className="font-mono text-indigo-400">/p/{deleteTarget.slug}</span>)?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
