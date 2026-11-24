import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { ImageUploader } from '../components/ImageUploader.tsx';
import { api } from '../services/api.ts';
import { LandingPage, TemplateDefinition } from '../types/index.ts';
import {
  Rocket,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Layers,
  DollarSign,
  Type,
  Link as LinkIcon,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface CreateLandingPageProps {
  navigate: (path: string) => void;
  editId?: string;
}

export const CreateLandingPage: React.FC<CreateLandingPageProps> = ({ navigate, editId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);

  // Form State
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49.99');
  const [originalPrice, setOriginalPrice] = useState('79.99');
  const [currency, setCurrency] = useState('USD');
  const [ctaText, setCtaText] = useState('Claim Exclusive 38% Launch Discount');
  const [ctaLink, setCtaLink] = useState('https://checkout.stripe.com/pay/demo');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80');
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('contain');
  const [extraGalleryUrls, setExtraGalleryUrls] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [templateId, setTemplateId] = useState('modern-sleek');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [guaranteeText, setGuaranteeText] = useState('30-Day Money Back Guarantee • Free Express Delivery');
  const [urgentBannerText, setUrgentBannerText] = useState('⚡ Limited Launch Batch: Only 14 units left at promotional pricing!');
  const [stockCount, setStockCount] = useState(14);

  // Per-Page ACO & SEO Options
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [enableSocialProof, setEnableSocialProof] = useState(true);
  const [enableStickyCheckout, setEnableStickyCheckout] = useState(true);
  const [enableExitIntent, setEnableExitIntent] = useState(false);
  const [customPixelId, setCustomPixelId] = useState('');

  // Features list
  const [features, setFeatures] = useState([
    { id: '1', title: 'Premium Aerospace Build', description: 'Engineered with anodized aircraft aluminum and ergonomic contours.', iconName: 'ShieldCheck' },
    { id: '2', title: 'All-Day High Endurance', description: 'Up to 36 hours of continuous power with ultra-fast USB-C recharge.', iconName: 'Zap' },
    { id: '3', title: 'Smart Sensor Architecture', description: 'Zero-latency responsive feedback calibrated for precision performance.', iconName: 'Sparkles' },
  ]);

  // Testimonials
  const [testimonials, setTestimonials] = useState([
    {
      id: '1',
      name: 'Jessica Vance',
      role: 'Verified Buyer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      comment: 'Hands down the highest quality purchase I have made this year. Arrived in 2 days and exceeded expectations.',
      rating: 5,
    },
  ]);

  // FAQs
  const [faqs, setFaqs] = useState([
    { id: '1', question: 'How quickly will my order ship?', answer: 'Orders placed before 2 PM EST ship the same business day with end-to-end tracking.' },
    { id: '2', question: 'What is your guarantee?', answer: 'We offer an unconditional 30-day trial. If not 100% satisfied, get an instant full refund.' },
  ]);

  // Created Result Modal
  const [createdPage, setCreatedPage] = useState<LandingPage | null>(null);

  // Load Templates
  useEffect(() => {
    api.getTemplates()
      .then((res) => {
        setTemplates(res.templates.filter(t => t.isActive));
      })
      .catch((err) => console.error('Failed to load templates', err));
  }, []);

  // Load Edit Data if editId provided
  useEffect(() => {
    if (editId) {
      setLoadingInitial(true);
      api.getPageById(editId)
        .then((res) => {
          const p = res.page;
          setProductName(p.productName);
          setSlug(p.slug);
          setSubtitle(p.subtitle);
          setDescription(p.description);
          setPrice(String(p.price));
          setOriginalPrice(String(p.originalPrice));
          setCurrency(p.currency);
          setCtaText(p.ctaText);
          setCtaLink(p.ctaLink);
          setImageUrl(p.imageUrl);
          setImageFit(p.imageFit || (p.imageUrl?.toLowerCase().includes('.png') ? 'contain' : 'cover'));
          setExtraGalleryUrls((p.galleryUrls || []).filter((u) => u && u !== p.imageUrl));
          setTemplateId(p.templateId);
          setThemeColor(p.themeColor || '#4f46e5');
          setGuaranteeText(p.guaranteeText || '');
          setUrgentBannerText(p.urgentBannerText || '');
          setStockCount(p.stockCount || 10);
          if (p.features && p.features.length) setFeatures(p.features);
          if (p.testimonials && p.testimonials.length) setTestimonials(p.testimonials);
          if (p.faqs && p.faqs.length) setFaqs(p.faqs);
          if (p.aco) {
            setSeoTitle(p.aco.seoTitle || '');
            setSeoDescription(p.aco.seoDescription || '');
            setSeoKeywords(p.aco.seoKeywords || '');
            setNoIndex(Boolean(p.aco.noIndex));
            setEnableSocialProof(p.aco.enableSocialProof !== false);
            setEnableStickyCheckout(p.aco.enableStickyCheckout !== false);
            setEnableExitIntent(Boolean(p.aco.enableExitIntent));
            setCustomPixelId(p.aco.customPixelId || '');
          }
          setSlugAvailable(true);
        })
        .catch((err) => {
          showToast(err instanceof Error ? err.message : 'Failed to load page for editing', 'error');
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [editId]);

  // Auto-generate slug from product name if slug not manually customized
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProductName(name);
    if (!editId) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
      setSlug(generated);
      checkSlugAvailability(generated);
    }
  };

  // Debounced slug check
  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 2) {
      setSlugAvailable(null);
      setSlugError('Slug must be at least 2 characters.');
      return;
    }
    setSlugChecking(true);
    try {
      const res = await api.checkSlug(slugToCheck, editId);
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

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(raw);
    checkSlugAvailability(raw);
  };

  // Feature Helpers
  const addFeature = () => {
    setFeatures([...features, { id: String(Date.now()), title: 'New Highlight', description: 'Brief customer benefit explanation.', iconName: 'Check' }]);
  };
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  const updateFeature = (index: number, key: string, val: string) => {
    const copy = [...features];
    copy[index] = { ...copy[index], [key]: val };
    setFeatures(copy);
  };

  // FAQ Helpers
  const addFaq = () => {
    setFaqs([...faqs, { id: String(Date.now()), question: 'Frequently Asked Question', answer: 'Clear and reassuring answer.' }]);
  };
  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };
  const updateFaq = (index: number, key: string, val: string) => {
    const copy = [...faqs];
    copy[index] = { ...copy[index], [key]: val };
    setFaqs(copy);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to generate and publish your landing page.', 'info');
      navigate('/login');
      return;
    }

    // Required Field Validations
    if (!productName.trim() || productName.trim().length < 2) {
      showToast('Product Name must be at least 2 characters long.', 'error');
      return;
    }

    if (!slug.trim() || slug.length < 2) {
      showToast('Please provide a valid slug (min 2 characters).', 'error');
      return;
    }

    if (slugAvailable === false) {
      showToast(slugError || 'Chosen slug is already taken or invalid.', 'error');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Price must be a valid positive number.', 'error');
      return;
    }

    const numOriginal = parseFloat(originalPrice);
    if (isNaN(numOriginal) || numOriginal < 0) {
      showToast('Original comparison price must be a valid number.', 'error');
      return;
    }

    if (!ctaText.trim()) {
      showToast('Please specify a call to action button text (e.g. "Buy Now").', 'error');
      return;
    }

    if (!ctaLink.trim()) {
      showToast('Please provide a destination link for the CTA button.', 'error');
      return;
    }

    if (!imageUrl.trim()) {
      showToast('A product image is required. Please upload or select a preset.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload: Partial<LandingPage> = {
        productName: productName.trim(),
        slug: slug.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        price: numPrice,
        originalPrice: numOriginal,
        currency: currency.toUpperCase(),
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        imageUrl: imageUrl.trim(),
        imageFit,
        galleryUrls: [imageUrl.trim(), ...extraGalleryUrls.filter((u) => u && u !== imageUrl.trim())],
        templateId,
        themeColor,
        guaranteeText: guaranteeText.trim(),
        urgentBannerText: urgentBannerText.trim(),
        stockCount: Number(stockCount) || 12,
        features,
        testimonials,
        faqs,
        aco: {
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          noIndex,
          enableSocialProof,
          enableStickyCheckout,
          enableExitIntent,
          customPixelId: customPixelId.trim(),
        },
        status: 'published',
      };

      if (editId) {
        const res = await api.updatePage(editId, payload);
        showToast('Landing page updated successfully!', 'success');
        navigate(`/p/${res.page.slug}`);
      } else {
        const res = await api.createPage(payload);
        setCreatedPage(res.page);
        showToast('High-converting landing page generated successfully!', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate landing page. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading landing page configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Launch Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-['Space_Grotesk']">
            {editId ? 'Edit Landing Page' : 'Generate High-Converting Landing Page'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Fill in your product details below. Our builder sets up mobile-responsive layouts, price tags, trust badges, and advertisement placements.
          </p>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Core Identity & Slug */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
              <Type className="w-4 h-4 text-indigo-600" />
              <span>1. Product Identity & Unique URL Slug</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={handleProductNameChange}
                placeholder="e.g. Lumina Sound Pro Wireless ANC Headphones"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Custom Page Slug (URL Path) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono text-slate-600 dark:text-slate-400 select-none">
                  /p/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="lumina-pro-anc-headphones"
                  className={`w-full pl-10 pr-24 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:outline-hidden ${
                    slugAvailable === true
                      ? 'border-emerald-500 focus:ring-emerald-500'
                      : slugAvailable === false
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                <div className="absolute right-3 flex items-center gap-1.5 text-xs">
                  {slugChecking ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking
                    </span>
                  ) : slugAvailable === true ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="w-4 h-4" /> Available
                    </span>
                  ) : slugAvailable === false ? (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <AlertCircle className="w-4 h-4" /> Unavailable
                    </span>
                  ) : null}
                </div>
              </div>
              {slugError && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {slugError}
                </p>
              )}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Use lowercase letters, numbers, and hyphens. Reserved paths (admin, api, etc.) are protected.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Catchy Subtitle / Hero Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Studio-Grade Acoustic Precision with 45-Hour Battery Life"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Product Story & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this product extraordinary, how it solves your customer's pain point, and why they should purchase today."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. Media & Product PNG Imagery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>2. Product PNG Photo & Gallery</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                PNG Cutout Ready
              </span>
            </div>

            <ImageUploader
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              onImageFitSuggested={(suggested) => setImageFit(suggested)}
              label="Primary Product PNG / Photo"
              description="Upload your product PNG file (transparent background supported) or pick a preset."
            />

            {/* Image Display Fit Option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Product Image Display Style
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Studio PNG Fit shows your entire transparent PNG product cleanly without cropping edges.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setImageFit('contain')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    imageFit === 'contain'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Studio PNG Fit
                </button>
                <button
                  type="button"
                  onClick={() => setImageFit('cover')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    imageFit === 'cover'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Full-Bleed Cover
                </button>
              </div>
            </div>

            {/* Extra Gallery PNGs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Additional Gallery PNGs / Angles ({extraGalleryUrls.length}/4)
                </span>
                {extraGalleryUrls.length < 4 && (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors">
                    {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{uploadingGallery ? 'Uploading...' : 'Add Gallery PNG'}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        if (file.size > 5 * 1024 * 1024) {
                          showToast('Gallery image must be under 5MB.', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        setUploadingGallery(true);
                        reader.onload = async (ev) => {
                          const data = ev.target?.result as string;
                          try {
                            const res = await api.uploadImage({
                              data,
                              filename: file.name,
                              mimeType: file.type || (file.name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'),
                            });
                            setExtraGalleryUrls((prev) => [...prev, res.url]);
                            showToast('Gallery image added!', 'success');
                          } catch {
                            setExtraGalleryUrls((prev) => [...prev, data]);
                          } finally {
                            setUploadingGallery(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {extraGalleryUrls.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {extraGalleryUrls.map((gUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 overflow-hidden"
                    >
                      <img src={gUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setExtraGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Pricing & Call to Action */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>3. Pricing, Discounts & Action Link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sale Price <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Original Price (Strikethrough)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Code
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CTA Button Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Claim Your 33% Launch Discount"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CTA Checkout / Destination Link <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://checkout.stripe.com/pay/..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Urgent Scarcity Banner (Optional)
                </label>
                <input
                  type="text"
                  value={urgentBannerText}
                  onChange={(e) => setUrgentBannerText(e.target.value)}
                  placeholder="🔥 Only 14 units remaining at launch price!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guarantee Badge Text
                </label>
                <input
                  type="text"
                  value={guaranteeText}
                  onChange={(e) => setGuaranteeText(e.target.value)}
                  placeholder="30-Day Money Back Guarantee • Free Worldwide Delivery"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 4. Template Selector */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>4. High-Converting Presentation Template</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setTemplateId(tpl.id);
                    if (tpl.defaultTheme) setThemeColor(tpl.defaultTheme);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                    templateId === tpl.id
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/40 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tpl.defaultTheme || '#4f46e5' }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {tpl.name}
                      </span>
                    </div>
                    {templateId === tpl.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </div>
                  <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                    {tpl.badge}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {tpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Features & FAQs Customizer */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>5. Key Features ({features.length})</span>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {features.map((feat, index) => (
                <div key={feat.id || index} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="Feature title"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <input
                      type="text"
                      value={feat.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Feature benefit description"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. ACO & SEO Options */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>6. ACO & SEO Optimization Options</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                ACO Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom SEO Page Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Optional custom Google search title"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="wireless headphones, anc audio, launch deal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Meta Description
                </label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Summary shown on Google search & social previews"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Tracking Pixel ID (Optional)
                </label>
                <input
                  type="text"
                  value={customPixelId}
                  onChange={(e) => setCustomPixelId(e.target.value)}
                  placeholder="e.g. Meta Pixel / GA4 Measurement ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSocialProof}
                  onChange={(e) => setEnableSocialProof(e.target.checked)}
                  className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">Social Proof Toast</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableStickyCheckout}
                  onChange={(e) => setEnableStickyCheckout(e.target.checked)}
                  className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">Sticky Mobile Bar</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableExitIntent}
                  onChange={(e) => setEnableExitIntent(e.target.checked)}
                  className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold">Exit-Intent Offer</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="rounded border-slate-400 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold">Hide from Search (NoIndex)</span>
              </label>
            </div>
          </div>

          {/* Submission CTA Bar */}
          <div className="sticky bottom-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-30">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Target URL:{' '}
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                /p/{slug || 'your-slug'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Landing Page...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>{editId ? 'Save & Publish Changes' : 'Generate Landing Page'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {createdPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white font-['Space_Grotesk']">
                Landing Page Live!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                "{createdPage.productName}" is now published and accessible with verified advertising and conversion analytics.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left font-mono text-xs break-all text-indigo-600 dark:text-indigo-400 select-all">
              {window.location.origin}/p/{createdPage.slug}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => navigate(`/p/${createdPage.slug}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <span>View Live Landing Page</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
