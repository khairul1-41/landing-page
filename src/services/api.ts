import {
  ACOSettings,
  AdminLevel,
  AdminPermissions,
  Advertisement,
  AnalyticsOverview,
  LandingPage,
  SiteSettings,
  TemplateDefinition,
  User,
} from '../types/index.ts';

const TOKEN_KEY = 'launchcraft_session_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Server returned ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Config & Health
  getConfig: () => request<{ siteUrl: string; siteName: string; adDisclosureNotice: string; edgeOneCdnEnabled: boolean }>('/api/config'),
  checkHealth: () => request<{ status: string; edgeOneReady: boolean }>('/api/health'),

  // Slug check
  checkSlug: (slug: string, excludeId?: string) =>
    request<{ available: boolean; error?: string; slug?: string }>(
      `/api/slug/check?slug=${encodeURIComponent(slug)}${excludeId ? `&excludeId=${encodeURIComponent(excludeId)}` : ''}`
    ),

  // Auth
  register: (payload: { email: string; password: string; name: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminLogin: (payload: { identifier: string; email?: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User | null }>('/api/auth/me'),

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      tokenStorage.clear();
    }
  },

  // Image Upload
  uploadImage: (payload: { data: string; filename?: string; mimeType?: string }) =>
    request<{ url: string; fullUrl: string; filename: string; mimeType?: string; size: number }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Public Landing Page
  getPublicPage: (slug: string) =>
    request<{
      page: LandingPage;
      template?: TemplateDefinition | null;
      advertisements: {
        below_product_image: Advertisement | null;
        footer: Advertisement | null;
        sticky_banner: Advertisement | null;
      };
      canonicalUrl: string;
      aco: ACOSettings;
      settings: { siteName: string; adDisclosureNotice: string };
    }>(`/api/public/page/${encodeURIComponent(slug)}`),

  recordClick: (slug: string) =>
    request<{ success: boolean }>(`/api/public/click/${encodeURIComponent(slug)}`, { method: 'POST' }),

  recordAdClick: (id: string) =>
    request<{ success: boolean }>(`/api/public/ad-click/${encodeURIComponent(id)}`, { method: 'POST' }),

  // User Landing Pages
  getMyPages: (all?: boolean) =>
    request<{ pages: LandingPage[] }>(`/api/landing-pages${all ? '?all=true' : ''}`),

  getPageById: (id: string) =>
    request<{ page: LandingPage }>(`/api/landing-pages/${encodeURIComponent(id)}`),

  createPage: (pageData: Partial<LandingPage>) =>
    request<{ message: string; page: LandingPage }>('/api/landing-pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    }),

  updatePage: (id: string, pageData: Partial<LandingPage>) =>
    request<{ message: string; page: LandingPage }>(`/api/landing-pages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    }),

  togglePageStatus: (id: string) =>
    request<{ message: string; page: LandingPage }>(`/api/landing-pages/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
    }),

  deletePage: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/landing-pages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Templates
  getTemplates: () => request<{ templates: TemplateDefinition[] }>('/api/templates'),

  // Admin Controls
  getAdminAds: () => request<{ advertisements: Advertisement[] }>('/api/admin/ads'),

  createAdminAd: (adData: Partial<Advertisement>) =>
    request<{ message: string; advertisement: Advertisement }>('/api/admin/ads', {
      method: 'POST',
      body: JSON.stringify(adData),
    }),

  updateAdminAd: (id: string, adData: Partial<Advertisement>) =>
    request<{ message: string; advertisement: Advertisement }>(`/api/admin/ads/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    }),

  toggleAdminAd: (id: string) =>
    request<{ message: string; advertisement: Advertisement }>(`/api/admin/ads/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    }),

  deleteAdminAd: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/ads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),

  toggleUserStatus: (id: string) =>
    request<{ message: string; user: User }>(`/api/admin/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
    }),

  createTemplate: (tplData: Partial<TemplateDefinition>) =>
    request<{ message: string; template: TemplateDefinition }>('/api/admin/templates', {
      method: 'POST',
      body: JSON.stringify(tplData),
    }),

  updateTemplate: (id: string, tplData: Partial<TemplateDefinition>) =>
    request<{ message: string; template: TemplateDefinition }>(`/api/admin/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(tplData),
    }),

  toggleTemplateStatus: (id: string) =>
    request<{ message: string; template: TemplateDefinition }>(`/api/admin/templates/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    }),

  deleteTemplate: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getAdminAnalytics: () => request<AnalyticsOverview>('/api/admin/analytics'),

  getAdminSettings: () => request<{ settings: SiteSettings }>('/api/admin/settings'),

  updateAdminSettings: (settings: Partial<SiteSettings>) =>
    request<{ message: string; settings: SiteSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Admin Profile, Password, Admin ID & Multi-Admin Management
  updateAdminProfile: (payload: {
    currentPassword: string;
    newAdminId?: string;
    newEmail?: string;
    name?: string;
    newPassword?: string;
  }) =>
    request<{ message: string; user: User }>('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getAdmins: () => request<{ admins: User[] }>('/api/admin/admins'),

  createAdmin: (payload: {
    name: string;
    adminId: string;
    email: string;
    password: string;
    adminLevel: AdminLevel;
    permissions?: AdminPermissions;
  }) =>
    request<{ message: string; admin: User }>('/api/admin/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAdmin: (
    id: string,
    payload: {
      name?: string;
      adminId?: string;
      email?: string;
      adminLevel?: AdminLevel;
      permissions?: AdminPermissions;
      status?: 'active' | 'suspended';
      newPassword?: string;
    }
  ) =>
    request<{ message: string; admin: User }>(`/api/admin/admins/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteAdmin: (id: string, demote: boolean = false) =>
    request<{ success: boolean; message: string; user?: User }>(
      `/api/admin/admins/${encodeURIComponent(id)}${demote ? '?demote=true' : ''}`,
      { method: 'DELETE' }
    ),

  promoteUserToAdmin: (
    id: string,
    payload: { adminId: string; adminLevel: AdminLevel; permissions?: AdminPermissions }
  ) =>
    request<{ message: string; admin: User }>(`/api/admin/users/${encodeURIComponent(id)}/promote`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ACO (Ad, Conversion & SEO Optimization)
  getAdminACO: () => request<{ aco: ACOSettings }>('/api/admin/aco'),

  updateAdminACO: (aco: Partial<ACOSettings>) =>
    request<{ message: string; aco: ACOSettings }>('/api/admin/aco', {
      method: 'PUT',
      body: JSON.stringify(aco),
    }),
};
