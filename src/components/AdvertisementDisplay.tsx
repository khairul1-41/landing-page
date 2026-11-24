import React from 'react';
import { Advertisement } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface AdvertisementDisplayProps {
  ad: Advertisement | null | undefined;
  placement: 'below_product_image' | 'footer' | 'sticky_banner';
  disclosureNotice?: string;
}

export const AdvertisementDisplay: React.FC<AdvertisementDisplayProps> = ({
  ad,
  placement,
  disclosureNotice = 'Sponsored Placement',
}) => {
  // CRITICAL REQUIREMENT 8: If no active advertisement exists, do NOT render an empty container
  if (!ad || ad.status !== 'active') {
    return null;
  }

  const handleAdClick = () => {
    try {
      api.recordAdClick(ad.id);
    } catch {
      // Non-blocking telemetry
    }
  };

  // Sticky banner variant
  if (placement === 'sticky_banner') {
    return (
      <aside aria-label="Sponsored announcement" className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-t border-indigo-500/20 shadow-2xl px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3 h-3" />
              {ad.badgeText || 'Special Offer'}
            </span>
            <p className="font-medium text-slate-200 truncate max-w-xl">
              <strong className="text-white">{ad.title}</strong> — {ad.content}
            </p>
          </div>
          {ad.linkUrl && (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAdClick}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Offer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </aside>
    );
  }

  // Below product image variant
  if (placement === 'below_product_image') {
    return (
      <aside aria-label="Sponsored advertisement" className="w-full my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900/80 dark:to-indigo-950/30 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {ad.badgeText || 'Verified Merchant Partner'}
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-medium">
            {disclosureNotice}
          </span>
        </div>

        {ad.type === 'custom_html' ? (
          <div
            dangerouslySetInnerHTML={{ __html: ad.content }}
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full sm:w-28 h-20 object-cover rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {ad.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {ad.content}
              </p>
            </div>
            {ad.linkUrl && (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleAdClick}
                className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Learn More</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </aside>
    );
  }

  // Footer variant
  return (
    <aside aria-label="Sponsored recommendation" className="w-full my-8 max-w-4xl mx-auto rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-indigo-50/60 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-5 sm:p-6 text-center shadow-xs">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold tracking-wide uppercase mb-3">
        <ShieldCheck className="w-3.5 h-3.5" />
        {ad.badgeText || 'Exclusive Partner Benefit'}
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
        {ad.title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
        {ad.content}
      </p>
      {ad.linkUrl && (
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-700 dark:hover:bg-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <span>{ad.sponsorName ? `Visit ${ad.sponsorName}` : 'Claim Offer'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-3 uppercase tracking-wider">
        {disclosureNotice}
      </p>
    </aside>
  );
};
