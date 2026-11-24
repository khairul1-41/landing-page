export type UserRole = 'user' | 'admin';
export type AdminLevel = 'main_admin' | 'sub_admin';
export type UserStatus = 'active' | 'suspended';

export interface AdminPermissions {
  manageAds: boolean;
  managePages: boolean;
  manageUsers: boolean;
  manageAdmins: boolean;
  manageACO: boolean;
  manageSettings: boolean;
}

export interface User {
  id: string;
  adminId?: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  adminLevel?: AdminLevel;
  permissions?: AdminPermissions;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type PageStatus = 'published' | 'disabled';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  comment: string;
  rating: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PageACOConfig {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  noIndex?: boolean;
  enableSocialProof?: boolean;
  enableStickyCheckout?: boolean;
  enableExitIntent?: boolean;
  customPixelId?: string;
}

export interface LandingPage {
  id: string;
  userId: string;
  userEmail: string;
  slug: string;
  productName: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  currency: string;
  ctaText: string;
  ctaLink: string;
  templateId: string;
  themeColor: string;
  imageUrl: string;
  imageFit?: 'contain' | 'cover';
  galleryUrls: string[];
  features: Feature[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  guaranteeText: string;
  urgentBannerText: string;
  stockCount?: number;
  aco?: PageACOConfig;
  status: PageStatus;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AdPlacement = 'below_product_image' | 'footer' | 'sticky_banner';
export type AdType = 'banner' | 'custom_html' | 'script';

export interface Advertisement {
  id: string;
  title: string;
  placement: AdPlacement;
  type: AdType;
  content: string; // HTML or script snippet (sanitized/trusted admin only)
  linkUrl: string;
  imageUrl?: string;
  sponsorName?: string;
  badgeText?: string;
  status: 'active' | 'inactive';
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export type TemplateLayoutStyle = 'modern' | 'urgency' | 'luxury' | 'dark' | 'storyteller' | 'app_apk';

export interface TemplateDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  defaultTheme: string;
  badge: string;
  layoutStyle?: TemplateLayoutStyle;
  featuresList: string[];
  isActive: boolean;
  isDefault?: boolean;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsEvent {
  id: string;
  landingPageSlug: string;
  eventType: 'view' | 'cta_click' | 'ad_click';
  adId?: string;
  referrer: string;
  timestamp: string;
}

export interface SiteSettings {
  siteName: string;
  defaultSiteUrl: string;
  metaDescription: string;
  supportEmail: string;
  adDisclosureNotice: string;
  edgeOneCdnEnabled: boolean;
  updatedAt: string;
}

export interface ACOSettings {
  seoTitleTemplate: string;
  defaultKeywords: string;
  googleVerificationCode: string;
  allowSearchIndexing: boolean;
  enableStructuredData: boolean;
  metaPixelId: string;
  ga4MeasurementId: string;
  tiktokPixelId: string;
  autoSocialProofToast: boolean;
  autoStickyMobileCheckout: boolean;
  autoExitIntentOffer: boolean;
  smartAdRotation: boolean;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  landingPages: LandingPage[];
  advertisements: Advertisement[];
  templates: TemplateDefinition[];
  analyticsEvents: AnalyticsEvent[];
  settings: SiteSettings;
  aco: ACOSettings;
}
