import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { api } from '../services/api.ts';
import { LandingPage } from '../types/index.ts';
import {
  PlusCircle,
  Eye,
  MousePointerClick,
  TrendingUp,
  ExternalLink,
  Edit,
  Trash2,
  Power,
  Share2,
  Check,
  Loader2,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton.tsx';

interface UserDashboardProps {
  navigate: (path: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.getMyPages();
      setPages(res.pages);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load landing pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.togglePageStatus(id);
      showToast(res.message, 'success');
      setPages(prev => prev.map(p => p.id === id ? res.page : p));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleting(true);
    try {
      await api.deletePage(deleteModalId);
      showToast('Landing page deleted successfully', 'success');
      setPages(prev => prev.filter(p => p.id !== deleteModalId));
      setDeleteModalId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete page', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const totalViews = pages.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalClicks = pages.reduce((sum, p) => sum + (p.clickCount || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-['Space_Grotesk']">
              Creator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Welcome back, <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong>. Manage your sales pages, analyze customer engagement, and launch new offers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <PWAInstallButton variant="navbar" />

            <button
              onClick={() => navigate('/admin/login')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              title="Access Platform Administration Console"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Access</span>
            </button>

            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate New Page</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Pages</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {pages.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Page Views</span>
              <Eye className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {totalViews.toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">CTA Button Clicks</span>
              <MousePointerClick className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {totalClicks.toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Conversion CTR</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {avgCtr}%
            </div>
          </div>
        </div>

        {/* Landing Pages Table / Cards */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
              Your Published Pages ({pages.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Loading your landing pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  No landing pages yet
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Generate your first high-converting product page in seconds with our automated builder.
                </p>
              </div>
              <button
                onClick={() => navigate('/create')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
              >
                + Create Your First Page
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pages.map((page) => {
                const ctr = page.viewCount > 0 ? ((page.clickCount / page.viewCount) * 100).toFixed(1) : '0.0';
                return (
                  <div
                    key={page.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors"
                  >
                    {/* Page info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={page.imageUrl}
                        alt={page.productName}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {page.productName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              page.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {page.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          /p/{page.slug}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                          <span>${page.price.toFixed(2)} {page.currency}</span>
                          <span>•</span>
                          <span>Template: <strong className="capitalize">{page.templateId.replace('-', ' ')}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Performance metrics & actions */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 md:pt-0">
                      {/* Metric pills */}
                      <div className="flex items-center gap-4 text-xs font-medium bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl">
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-slate-600 dark:text-slate-400">Views</p>
                          <p className="font-bold text-slate-900 dark:text-white font-mono">{page.viewCount || 0}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-slate-600 dark:text-slate-400">Clicks</p>
                          <p className="font-bold text-emerald-600 font-mono">{page.clickCount || 0}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-slate-600 dark:text-slate-400">CTR</p>
                          <p className="font-bold text-indigo-600 font-mono">{ctr}%</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/p/${page.slug}`)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleCopyLink(page.slug)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Copy Share Link"
                        >
                          {copiedSlug === page.slug ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/create?id=${page.id}`)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Edit Landing Page"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(page.id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            page.status === 'published'
                              ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                          }`}
                          title={page.status === 'published' ? 'Disable Page' : 'Publish Page'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteModalId(page.id)}
                          className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete Landing Page?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Are you sure you want to delete this page? The URL slug will become available and this action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
