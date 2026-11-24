import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ACOSettings, Advertisement, LandingPage, TemplateDefinition } from '../types/index.ts';
import { AdvertisementDisplay } from '../components/AdvertisementDisplay.tsx';
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Droplet,
  BatteryCharging,
  AlertTriangle,
  Gift,
  X,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';

interface PublicLandingPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ slug, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<LandingPage | null>(null);
  const [ads, setAds] = useState<{
    below_product_image: Advertisement | null;
    footer: Advertisement | null;
    sticky_banner: Advertisement | null;
  }>({
    below_product_image: null,
    footer: null,
    sticky_banner: null,
  });
  const [disclosureNotice, setDisclosureNotice] = useState('Sponsored Advertisement');
  const [templateDef, setTemplateDef] = useState<TemplateDefinition | null>(null);
  const [globalAco, setGlobalAco] = useState<ACOSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastIdx, setToastIdx] = useState(0);
  const [showSocialToast, setShowSocialToast] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitModalShownOnce, setExitModalShownOnce] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  // Countdown timer for urgency templates
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 47, seconds: 28 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.getPublicPage(slug)
      .then((res) => {
        setPage(res.page);
        setActiveImage(res.page.imageUrl);
        setTemplateDef(res.template || null);
        setAds(res.advertisements);
        setGlobalAco(res.aco || null);
        if (res.settings?.adDisclosureNotice) {
          setDisclosureNotice(res.settings.adDisclosureNotice);
        }

        // Apply SEO & ACO Metadata
        const aco = res.aco;
        const pageAco = res.page.aco;
        const siteName = res.settings?.siteName || 'LaunchCraft';
        const resolvedTitle =
          pageAco?.seoTitle ||
          (aco?.seoTitleTemplate || '{{productName}} | Official Offer')
            .replace('{{productName}}', res.page.productName)
            .replace('{{siteName}}', siteName);

        document.title = resolvedTitle;

        const upsertMeta = (attr: 'name' | 'property', key: string, value: string) => {
          if (!value) return;
          let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
          }
          el.setAttribute('content', value);
        };

        const desc = pageAco?.seoDescription || res.page.subtitle || res.page.description.slice(0, 160);
        const keywords = pageAco?.seoKeywords || aco?.defaultKeywords || '';
        const shouldIndex = !pageAco?.noIndex && (aco?.allowSearchIndexing !== false);

        upsertMeta('name', 'description', desc);
        if (keywords) upsertMeta('name', 'keywords', keywords);
        upsertMeta('name', 'robots', shouldIndex ? 'index, follow' : 'noindex, nofollow');
        upsertMeta('property', 'og:title', resolvedTitle);
        upsertMeta('property', 'og:description', desc);
        if (aco?.googleVerificationCode) {
          upsertMeta('name', 'google-site-verification', aco.googleVerificationCode);
        }

        // JSON-LD Product Structured Data
        const existingLd = document.getElementById('launchcraft-product-jsonld');
        if (existingLd) existingLd.remove();
        if (aco?.enableStructuredData !== false) {
          const script = document.createElement('script');
          script.id = 'launchcraft-product-jsonld';
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: res.page.productName,
            image: res.page.imageUrl,
            description: desc,
            offers: {
              '@type': 'Offer',
              url: res.canonicalUrl,
              priceCurrency: res.page.currency || 'USD',
              price: res.page.price,
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '128',
            },
          });
          document.head.appendChild(script);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Landing page not found.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const effectiveSocialProof = page?.aco?.enableSocialProof ?? globalAco?.autoSocialProofToast ?? true;
  const effectiveStickyCheckout = page?.aco?.enableStickyCheckout ?? globalAco?.autoStickyMobileCheckout ?? true;
  const effectiveExitIntent = page?.aco?.enableExitIntent ?? globalAco?.autoExitIntentOffer ?? false;

  useEffect(() => {
    if (!effectiveSocialProof || !page) return;
    const interval = setInterval(() => {
      setToastIdx((prev) => (prev + 1) % 4);
    }, 6500);
    return () => clearInterval(interval);
  }, [effectiveSocialProof, page]);

  useEffect(() => {
    if (!effectiveExitIntent || exitModalShownOnce || !page) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setShowExitModal(true);
        setExitModalShownOnce(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [effectiveExitIntent, exitModalShownOnce, page]);

  const handleCtaClick = () => {
    if (!page) return;
    try {
      api.recordClick(page.slug);
    } catch {
      // Non-blocking
    }
    if (page.ctaLink && page.ctaLink !== '#') {
      window.open(page.ctaLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Helper to render icon by name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'Activity': return <Activity className="w-5 h-5 text-rose-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'BatteryCharging': return <BatteryCharging className="w-5 h-5 text-emerald-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-2xl space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white font-['Space_Grotesk']">
          Page Not Available
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mt-2">
          {error || 'This landing page has been unpublished, disabled, or moved by the creator.'}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to LaunchCraft Home
          </button>
          <button
            onClick={() => navigate('/create')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs sm:text-sm font-semibold transition-colors"
          >
            Create Your Own
          </button>
        </div>
      </div>
    );
  }

  const layoutStyle = templateDef?.layoutStyle;
  const isUrgencyTemplate = layoutStyle === 'urgency' || page.templateId === 'flash-urgency';
  const isLuxuryTemplate = layoutStyle === 'luxury' || page.templateId === 'minimalist-luxury';
  const isTechDarkTemplate = layoutStyle === 'dark' || page.templateId === 'tech-neon';
  const isAppApkTemplate = layoutStyle === 'app_apk' || page.templateId === 'app-apk-showcase';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors pb-24 ${
        isTechDarkTemplate
          ? 'bg-slate-950 text-slate-100'
          : isLuxuryTemplate
          ? 'bg-[#faf8f5] text-stone-900'
          : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Top Banner (Urgency or Promotional) */}
      {page.urgentBannerText && (
        <div
          className={`py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 ${
            isUrgencyTemplate
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
              : 'bg-slate-900 text-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 animate-bounce text-amber-300 shrink-0" />
          <span>{page.urgentBannerText}</span>
        </div>
      )}

      {/* Public Page Floating Navbar */}
      <nav className="border-b border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-8 py-3.5 backdrop-blur-md sticky top-0 z-30 bg-inherit/90">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-xs font-['Space_Grotesk']">
              {page.productName}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              title="Share Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              onClick={handleCtaClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <span>{page.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Product Media Gallery */}
          <div className="space-y-4">
            {(() => {
              const displayedSrc = activeImage || page.imageUrl;
              const isPngAsset =
                displayedSrc.toLowerCase().includes('.png') || displayedSrc.startsWith('data:image/png');
              const useStudioContain = page.imageFit === 'contain' || (!page.imageFit && isPngAsset);
              const galleryList = Array.from(
                new Set([page.imageUrl, ...(page.galleryUrls || [])].filter(Boolean))
              );

              return (
                <>
                  <div
                    className={`relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl group ${
                      useStudioContain
                        ? 'bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900'
                        : 'bg-slate-100 dark:bg-slate-900'
                    }`}
                  >
                    <img
                      src={displayedSrc}
                      alt={page.productName}
                      className={`w-full h-80 sm:h-96 lg:h-[460px] group-hover:scale-102 transition-transform duration-500 ${
                        useStudioContain ? 'object-contain p-6 drop-shadow-2xl' : 'object-cover object-center'
                      }`}
                    />
                    {page.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Save {page.discountPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {galleryList.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {galleryList.map((imgSrc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImage(imgSrc)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-slate-100 dark:bg-slate-900 transition-all ${
                            displayedSrc === imgSrc
                              ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                              : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgSrc}
                            alt={`${page.productName} ${idx + 1}`}
                            className="w-full h-full object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* CRITICAL REQUIREMENT 8: ADVERTISEMENT BELOW PRODUCT IMAGE */}
            <AdvertisementDisplay
              ad={ads.below_product_image}
              placement="below_product_image"
              disclosureNotice={disclosureNotice}
            />
          </div>

          {/* Right: Product Value Proposition & Purchase Box */}
          <div className="space-y-6">
            {/* App / APK Verified Release Banner */}
            {isAppApkTemplate && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Official App & APK Verified Release
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Direct Safe Installer • Fast Download • Mobile Optimized
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shrink-0">
                  Verified APK
                </span>
              </div>
            )}

            {/* Reviews Pill */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                4.9/5 Rating
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500">Verified Buyers</span>
            </div>

            <div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
                isLuxuryTemplate ? "font-serif" : "font-['Space_Grotesk']"
              }`}>
                {page.productName}
              </h1>
              {page.subtitle && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {page.subtitle}
                </p>
              )}
            </div>

            {/* Live Urgency Countdown (If Flash Template) */}
            {isUrgencyTemplate && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600 animate-spin" />
                  <div>
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Flash Launch Discount Expires In:
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">
                      Stock remaining: {page.stockCount || 14} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
                  <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}

            {/* Price Presentation */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${page.price.toFixed(2)}
              </span>
              {page.originalPrice > page.price && (
                <span className="text-lg text-slate-400 line-through">
                  ${page.originalPrice.toFixed(2)}
                </span>
              )}
              {page.discountPercentage > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ml-auto">
                  Save ${(page.originalPrice - page.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {page.description}
            </p>

            {/* High-Converting CTA Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCtaClick}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 group"
              >
                <span>{page.ctaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {page.guaranteeText && (
                <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{page.guaranteeText}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FEATURES HIGHLIGHT GRID */}
        {page.features && page.features.length > 0 && (
          <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Crafted for Performance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-['Space_Grotesk']">
                Engineered Features & Benefits
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {page.features.map((feature, idx) => (
                <div
                  key={feature.id || idx}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4">
                    {renderIcon(feature.iconName)}
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CUSTOMER TESTIMONIALS */}
        {page.testimonials && page.testimonials.length > 0 && (
          <section className="pt-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl font-bold font-['Space_Grotesk']">
                What Customers Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.testimonials.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4"
                >
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{t.comment}"
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    {t.avatarUrl && (
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="pt-6 max-w-3xl mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-['Space_Grotesk']">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {page.faqs.map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-bold"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openFaq === idx ? 'rotate-180 text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CRITICAL REQUIREMENT 8: FOOTER ADVERTISEMENT */}
        <AdvertisementDisplay
          ad={ads.footer}
          placement="footer"
          disclosureNotice={disclosureNotice}
        />

        {/* Page Footer Navigation */}
        <footer className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {page.productName}. Powered by LaunchCraft.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              LaunchCraft Home
            </button>
          </div>
        </footer>
      </main>

      {/* ACO: Social Proof Recent Buyer Toast */}
      {effectiveSocialProof && showSocialToast && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-xs rounded-2xl bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl p-3 flex items-center gap-3 backdrop-blur-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-[11px] leading-snug pr-2">
            <p className="font-bold text-white">
              {['Amina R. in Dhaka', 'Liam K. in Austin', 'Sofia M. in Toronto', 'Noah T. in London'][toastIdx]}
            </p>
            <p className="text-slate-300">
              Just ordered <span className="text-emerald-300 font-semibold">{page.productName.slice(0, 26)}</span>
            </p>
          </div>
          <button
            onClick={() => setShowSocialToast(false)}
            className="text-slate-400 hover:text-white shrink-0"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ACO: Sticky Mobile Checkout Bar (shown when no sticky ad occupies bottom) */}
      {effectiveStickyCheckout && !ads.sticky_banner && (
        <div className="fixed bottom-0 inset-x-0 sm:hidden z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Launch Offer</p>
            <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              ${page.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleCtaClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <span>{page.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ACO: Exit-Intent Offer Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold font-['Space_Grotesk'] text-slate-950 dark:text-white">
              Wait — Don't Miss Your Launch Offer!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Grab <strong>{page.productName}</strong> right now at{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">${page.price.toFixed(2)}</strong>
              {page.discountPercentage > 0 ? ` (${page.discountPercentage}% OFF)` : ''} before promotional stock runs out.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  handleCtaClick();
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
              >
                {page.ctaText}
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                No thanks, continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRITICAL REQUIREMENT 8: STICKY BANNER ADVERTISEMENT */}
      <AdvertisementDisplay
        ad={ads.sticky_banner}
        placement="sticky_banner"
        disclosureNotice={disclosureNotice}
      />
    </div>
  );
};
