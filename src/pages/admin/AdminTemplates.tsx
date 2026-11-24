import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { TemplateDefinition, TemplateLayoutStyle } from '../../types/index.ts';
import { useToast } from '../../components/Toast.tsx';
import {
  Palette,
  Power,
  Loader2,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const LAYOUT_STYLES: { value: TemplateLayoutStyle; label: string; hint: string }[] = [
  { value: 'modern', label: 'Modern Sleek', hint: 'Clean split hero & gradient CTA' },
  { value: 'app_apk', label: 'App & APK Showcase', hint: 'Verified app / APK download & trust seals' },
  { value: 'urgency', label: 'Flash Urgency', hint: 'Live countdown & scarcity banners' },
  { value: 'luxury', label: 'Minimalist Luxury', hint: 'Warm editorial serif showcase' },
  { value: 'dark', label: 'Cyber Dark Mode', hint: 'High-contrast obsidian tech theme' },
  { value: 'storyteller', label: 'DTC Storyteller', hint: 'Review & FAQ focused layout' },
];

interface TemplateFormState {
  name: string;
  slug: string;
  category: string;
  badge: string;
  defaultTheme: string;
  layoutStyle: TemplateLayoutStyle;
  description: string;
  featuresText: string;
  isActive: boolean;
}

const EMPTY_FORM: TemplateFormState = {
  name: '',
  slug: '',
  category: 'Mobile App / APK Launch',
  badge: 'New',
  defaultTheme: '#4f46e5',
  layoutStyle: 'modern',
  description: '',
  featuresText: 'Responsive Hero Showcase, Verified Trust Badge, High-Converting CTA',
  isActive: true,
};

export const AdminTemplates: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<TemplateDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.getTemplates();
      setTemplates(res.templates);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setSlugTouched(false);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEditModal = (tpl: TemplateDefinition) => {
    setEditingId(tpl.id);
    setSlugTouched(true);
    setForm({
      name: tpl.name,
      slug: tpl.slug,
      category: tpl.category,
      badge: tpl.badge,
      defaultTheme: tpl.defaultTheme || '#4f46e5',
      layoutStyle: tpl.layoutStyle || 'modern',
      description: tpl.description,
      featuresText: (tpl.featuresList || []).join(', '),
      isActive: tpl.isActive,
    });
    setShowModal(true);
  };

  const applyPreset = (preset: 'app_apk' | 'flash' | 'saas') => {
    if (preset === 'app_apk') {
      setForm({
        name: 'Android APK & App Installer',
        slug: slugTouched ? form.slug : `app-apk-${Date.now().toString().slice(-4)}`,
        category: 'Mobile App / APK Launch',
        badge: 'App / APK',
        defaultTheme: '#059669',
        layoutStyle: 'app_apk',
        description: 'Optimized app & APK download landing page with verified safety badge, version highlights, and fast install CTA.',
        featuresText: 'Verified Safe APK, One-Tap Download CTA, Android & Mobile Ready, User Reviews',
        isActive: true,
      });
    } else if (preset === 'flash') {
      setForm({
        name: 'Mega Flash Deal Promo',
        slug: slugTouched ? form.slug : `flash-deal-${Date.now().toString().slice(-4)}`,
        category: 'Direct Response / Promo',
        badge: 'Hot Deal',
        defaultTheme: '#e11d48',
        layoutStyle: 'urgency',
        description: 'Built for limited-time promotions with live countdown timer, scarcity banner, and bold checkout button.',
        featuresText: 'Live Countdown Timer, Scarcity Stock Counter, Bold Discount Tag, Money-Back Seal',
        isActive: true,
      });
    } else {
      setForm({
        name: 'SaaS & Digital Product Pro',
        slug: slugTouched ? form.slug : `saas-pro-${Date.now().toString().slice(-4)}`,
        category: 'SaaS & Digital Tools',
        badge: 'Pro',
        defaultTheme: '#4f46e5',
        layoutStyle: 'dark',
        description: 'Sleek dark-themed software and digital product showcase engineered for high click-through rates.',
        featuresText: 'Cyber Dark Hero, Instant Access CTA, Feature Highlights, FAQ Accordion',
        isActive: true,
      });
    }
  };

  const handleNameChange = (val: string) => {
    const next: TemplateFormState = { ...form, name: val };
    if (!editingId && !slugTouched) {
      next.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    }
    setForm(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      showToast('Template name must be at least 2 characters.', 'error');
      return;
    }

    const featuresList = form.featuresText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (editingId) {
        const res = await api.updateTemplate(editingId, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim(),
          badge: form.badge.trim(),
          defaultTheme: form.defaultTheme.trim(),
          layoutStyle: form.layoutStyle,
          description: form.description.trim(),
          featuresList,
          isActive: form.isActive,
        });
        setTemplates((prev) => prev.map((t) => (t.id === editingId ? res.template : t)));
        showToast(res.message, 'success');
      } else {
        const res = await api.createTemplate({
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim(),
          badge: form.badge.trim(),
          defaultTheme: form.defaultTheme.trim(),
          layoutStyle: form.layoutStyle,
          description: form.description.trim(),
          featuresList,
          isActive: form.isActive,
        });
        setTemplates((prev) => [...prev, res.template]);
        showToast(res.message, 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleTemplateStatus(id);
      showToast(res.message, 'success');
      setTemplates((prev) => prev.map((t) => (t.id === id ? res.template : t)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update template', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.deleteTemplate(deleteTarget.id);
      showToast(res.message, 'success');
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete template', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Template Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add new templates (including App / APK launch pages), edit styles, or enable/disable templates for creators.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Template</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: tpl.defaultTheme || '#4f46e5' }}
                      title={`Theme: ${tpl.defaultTheme}`}
                    />
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                      {tpl.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      {tpl.badge}
                    </span>
                    {tpl.isCustom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      tpl.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tpl.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>
                    Category: <strong className="text-slate-300">{tpl.category}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Layout:{' '}
                    <strong className="text-slate-300 font-mono">{tpl.layoutStyle || 'modern'}</strong>
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap gap-1.5">
                  {(tpl.featuresList || []).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-500">Slug: {tpl.slug}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(tpl)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggle(tpl.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      tpl.isActive
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{tpl.isActive ? 'Disable' : 'Enable'}</span>
                  </button>

                  {!tpl.isDefault && (
                    <button
                      onClick={() => setDeleteTarget(tpl)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  {editingId ? 'Edit Template' : 'Add New Template'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editingId && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Quick Starter:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('app_apk')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-[11px] font-semibold"
                >
                  <Smartphone className="w-3 h-3" /> App / APK Template
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('flash')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 text-[11px] font-semibold"
                >
                  <Sparkles className="w-3 h-3" /> Flash Deal
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('saas')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 text-[11px] font-semibold"
                >
                  SaaS Pro
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Android App & APK Pro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Template Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                    }}
                    placeholder="e.g. android-apk-pro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-amber-300 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Mobile App / APK"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. App / APK"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.defaultTheme}
                      onChange={(e) => setForm({ ...form, defaultTheme: e.target.value })}
                      className="w-10 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.defaultTheme}
                      onChange={(e) => setForm({ ...form, defaultTheme: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Layout Style</label>
                <select
                  value={form.layoutStyle}
                  onChange={(e) => setForm({ ...form, layoutStyle: e.target.value as TemplateLayoutStyle })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                >
                  {LAYOUT_STYLES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label} — {st.hint}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe when creators should pick this template..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Features List (comma separated)
                </label>
                <input
                  type="text"
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="Verified Download Badge, Sticky CTA, Reviews"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Active immediately (visible in Landing Page Builder)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingId ? 'Save Template Changes' : 'Add Template'}</span>
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
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Delete Template?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deleteTarget.name}</strong>? Existing pages using this slug will still render safely using fallback styling.
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
                <span>Delete Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
