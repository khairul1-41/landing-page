import fs from 'fs';
import path from 'path';
import { DatabaseSchema, LandingPage, User, Advertisement, TemplateDefinition, SiteSettings, ACOSettings, AdminPermissions, AnalyticsEvent } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  manageAds: true,
  managePages: true,
  manageUsers: true,
  manageAdmins: true,
  manageACO: true,
  manageSettings: true,
};

// Initial seed data
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    adminId: 'MAIN-ADMIN',
    email: 'lofimusic492@gmail.com',
    name: 'Main Administrator',
    // SHA256 of "AdminLaunch#2026!" with salt
    passwordHash: 'a78b43c148cacac8fb9ee80bf6aa2ecdfaa1fc499489b9e47238a8b721a638d2',
    role: 'admin',
    adminLevel: 'main_admin',
    permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-1',
    email: 'creator@launchcraft.dev',
    name: 'Alex Rivera',
    // SHA256 of "Creator123!" with salt
    passwordHash: 'c0cefc95af1cf52bc807eb1e741611f65cfee29fa81c28cc92b4509d5517d99f',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'modern-sleek',
    name: 'Modern Sleek',
    slug: 'modern-sleek',
    description: 'Clean high-contrast minimalism with smooth hero gradients, crisp feature cards, and dynamic social proof.',
    category: 'Universal E-Commerce',
    defaultTheme: '#4f46e5',
    badge: 'Popular',
    layoutStyle: 'modern',
    featuresList: ['Hero Split Showcase', 'Interactive Specs', 'Customer Reviews Carousel', 'Sticky CTA Bar'],
    isActive: true,
    isDefault: true,
  },
  {
    id: 'flash-urgency',
    name: 'High-Converting Urgency',
    slug: 'flash-urgency',
    description: 'Engineered for direct-response sales with live countdown timer, stock meter, and urgency discount banners.',
    category: 'Direct Response / Flash Sales',
    defaultTheme: '#e11d48',
    badge: 'High Conversion',
    layoutStyle: 'urgency',
    featuresList: ['Countdown Urgency Timer', 'Stock Scarcity Meter', 'Money-Back Guarantee Seals', 'Pulsing Checkout CTA'],
    isActive: true,
    isDefault: false,
  },
  {
    id: 'minimalist-luxury',
    name: 'Minimalist Luxury',
    slug: 'minimalist-luxury',
    description: 'Serif editorial typography, warm earth tones, spacious gallery layout designed for premium flagship items.',
    category: 'Luxury & Lifestyle',
    defaultTheme: '#0f172a',
    badge: 'Editorial',
    layoutStyle: 'luxury',
    featuresList: ['Editorial Typography', 'Full-Bleed Gallery', 'Artisan Brand Story', 'Concierge Trust Badges'],
    isActive: true,
    isDefault: false,
  },
  {
    id: 'tech-neon',
    name: 'Tech Cyber Dark',
    slug: 'tech-neon',
    description: 'Deep obsidian theme with glowing cyan accents, hardware specification grid, and futuristic aesthetic.',
    category: 'Hardware & Tech Gadgets',
    defaultTheme: '#06b6d4',
    badge: 'Dark Mode',
    layoutStyle: 'dark',
    featuresList: ['Cyberpunk Glass Cards', 'Technical Spec Table', 'Benchmark Comparison', 'Glow Accents'],
    isActive: true,
    isDefault: false,
  },
  {
    id: 'direct-consumer',
    name: 'DTC Storyteller',
    slug: 'direct-consumer',
    description: 'Emotional hook layout focusing on problem-solution, customer transformation testimonials, and FAQ accordion.',
    category: 'Health, Beauty & DTC',
    defaultTheme: '#10b981',
    badge: 'Storyteller',
    layoutStyle: 'storyteller',
    featuresList: ['Problem vs Solution Split', 'Verified Review Badges', 'FAQ Dropdown Accordion', 'Risk-Free Guarantee'],
    isActive: true,
    isDefault: false,
  },
  {
    id: 'app-apk-showcase',
    name: 'App & APK Download Pro',
    slug: 'app-apk-showcase',
    description: 'Built for mobile apps, Android APK releases, and SaaS installers with verified download badges and device highlights.',
    category: 'Mobile App / APK Launch',
    defaultTheme: '#059669',
    badge: 'App / APK',
    layoutStyle: 'app_apk',
    featuresList: ['Verified APK Safety Seal', 'Direct Download CTA', 'Version & Compatibility Cards', 'User Rating Showcase'],
    isActive: true,
    isDefault: false,
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-prod-1',
    title: 'Verified Merchant & Fast 2-Day Air Shipping Guarantee',
    placement: 'below_product_image',
    type: 'banner',
    content: 'Shop with full confidence: 100% genuine products with buyer protection, free tracking, and express global delivery.',
    linkUrl: 'https://launchcraft.app/guarantee',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    sponsorName: 'Global Logistics Network',
    badgeText: 'Official Partner',
    status: 'active',
    views: 420,
    clicks: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ad-foot-1',
    title: 'Exclusive 30-Day Risk-Free Trial with Free Return Label',
    placement: 'footer',
    type: 'banner',
    content: 'Try it at home for a full month. If you are not completely delighted, return it for an instant 100% refund.',
    linkUrl: 'https://launchcraft.app/trial',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    sponsorName: 'Buyer Protection Trust',
    badgeText: 'Sponsored Guarantee',
    status: 'active',
    views: 310,
    clicks: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ad-sticky-1',
    title: 'Limited Seasonal Bonus: Free Premium Carrying Case ($49 Value) Included',
    placement: 'sticky_banner',
    type: 'banner',
    content: 'Order today before midnight and receive an exclusive protective case with your shipment.',
    linkUrl: 'https://launchcraft.app/bonus',
    sponsorName: 'LaunchCraft Partner Network',
    badgeText: 'Special Perk',
    status: 'active',
    views: 180,
    clicks: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_LANDING_PAGES: LandingPage[] = [
  {
    id: 'page-lumina-1',
    userId: 'user-admin-1',
    userEmail: 'lofimusic492@gmail.com',
    slug: 'lumina-pro-anc-headphones',
    productName: 'Lumina Sound Pro ANC Wireless Headphones',
    subtitle: 'Studio-Grade Acoustic Precision with 45-Hour Battery & Active Noise Cancellation',
    description: 'Immerse yourself in rich, high-resolution audio. Engineered with custom 40mm beryllium drivers, active hybrid noise cancellation, and ultra-plush memory foam earcups designed for all-day comfort. Seamlessly pair with multiple devices and experience music exactly as the artist intended.',
    price: 199.99,
    originalPrice: 299.99,
    discountPercentage: 33,
    currency: 'USD',
    ctaText: 'Claim Your 33% Launch Discount',
    ctaLink: 'https://checkout.stripe.com/pay/demo',
    templateId: 'modern-sleek',
    themeColor: '#4f46e5',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      {
        id: 'f1',
        title: 'Hybrid Active Noise Cancellation',
        description: 'Multi-microphone feedback loops cancel out up to 98% of ambient airplane and city noise.',
        iconName: 'ShieldCheck'
      },
      {
        id: 'f2',
        title: '45-Hour Ultra Battery Life',
        description: 'Listen all week on a single charge. 10 minutes of USB-C fast charge delivers 5 hours of playback.',
        iconName: 'BatteryCharging'
      },
      {
        id: 'f3',
        title: 'Custom 40mm Beryllium Drivers',
        description: 'Delivers crystal-clear highs, velvety mids, and deep resonance without acoustic distortion.',
        iconName: 'Sparkles'
      },
      {
        id: 'f4',
        title: 'Multipoint Bluetooth 5.4',
        description: 'Effortlessly switch between your laptop conference call and phone playlist in milliseconds.',
        iconName: 'Zap'
      }
    ],
    testimonials: [
      {
        id: 't1',
        name: 'Sarah Jenkins',
        role: 'Audio Engineer & Producer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        comment: 'The soundstage on the Lumina Pro rivals my $600 studio reference monitors. ANC is silky smooth without ear pressure.',
        rating: 5
      },
      {
        id: 't2',
        name: 'Marcus Chen',
        role: 'Remote Software Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        comment: 'These saved my sanity in open-plan offices and cross-country flights. The battery simply never dies!',
        rating: 5
      }
    ],
    faqs: [
      {
        id: 'faq1',
        question: 'What is included in the package?',
        answer: 'Each box contains the Lumina Sound Pro ANC Headphones, hard protective travel case, USB-C fast charging cable, 3.5mm gold-plated audio cable, airline adapter, and quick-start warranty card.'
      },
      {
        id: 'faq2',
        question: 'What is the return policy?',
        answer: 'We offer a 30-day no-questions-asked money back guarantee. If you are not thrilled, we provide a prepaid return label for a 100% refund.'
      }
    ],
    guaranteeText: '30-Day Money Back Guarantee • 2-Year Full Manufacturer Warranty • Free Global Shipping',
    urgentBannerText: '🔥 Flash Sale: Only 18 units remaining at this promotional price!',
    stockCount: 18,
    status: 'published',
    viewCount: 1248,
    clickCount: 186,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-fitness-2',
    userId: 'user-demo-1',
    userEmail: 'creator@launchcraft.dev',
    slug: 'hyperpulse-smart-fitness-band',
    productName: 'HyperPulse Titanium Smart Fitness Band',
    subtitle: 'Military-Grade Biometric Health Tracking, 14-Day Battery & Real-Time Recovery Score',
    description: 'Engineered for athletes and health pioneers. Continuous heart rate variability, SpO2 blood oxygen, sleep stage tracking, and titanium aerospace bezel that withstands water depths up to 50 meters.',
    price: 89.00,
    originalPrice: 149.00,
    discountPercentage: 40,
    currency: 'USD',
    ctaText: 'Get HyperPulse Now (Save $60)',
    ctaLink: 'https://checkout.stripe.com/pay/hyperpulse',
    templateId: 'flash-urgency',
    themeColor: '#e11d48',
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      {
        id: 'f1',
        title: '24/7 Heart & Stress Analytics',
        description: 'Advanced PPG sensors continuously monitor cardiovascular rhythm and autonomic nervous system stress.',
        iconName: 'Activity'
      },
      {
        id: 'f2',
        title: '50M Waterproof Titanium Housing',
        description: 'Built to survive marathon open-water swims, triathlon training, and heavy mountain trails.',
        iconName: 'Droplet'
      },
      {
        id: 'f3',
        title: '14-Day Real Life Battery',
        description: 'Forget nightly charging docks. Get two full weeks of continuous analytics on a single fast charge.',
        iconName: 'BatteryCharging'
      }
    ],
    testimonials: [
      {
        id: 't1',
        name: 'David Ortiz',
        role: 'Triathlon Competitor',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        comment: 'Replaced my expensive smartwatch with HyperPulse. The battery life is unbelievable and recovery metrics are laser accurate.',
        rating: 5
      }
    ],
    faqs: [
      {
        id: 'faq1',
        question: 'Does it require a monthly app subscription?',
        answer: 'No! Unlike competitors that lock health data behind $20/month paywalls, HyperPulse companion app is 100% free forever.'
      }
    ],
    guaranteeText: 'Risk-Free 60-Day Trial • Lifetime Free App Updates • Fast Track Delivery',
    urgentBannerText: '⚡ LIMITED QUANTITY: Price increases back to $149 in 24 hours!',
    stockCount: 7,
    status: 'published',
    viewCount: 890,
    clickCount: 142,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-serum-3',
    userId: 'user-admin-1',
    userEmail: 'lofimusic492@gmail.com',
    slug: 'solis-glow-vitamin-serum',
    productName: 'Solis Botanic Radiance Youth Elixir',
    subtitle: 'Cold-Pressed Botanical Antioxidants & 15% Pure L-Ascorbic Acid for Luminous Skin',
    description: 'Handcrafted in small artisanal batches with cold-pressed organic botanicals, ferulic acid, and pure vegan hyaluronic acid. Visibly brightens tone, reduces fine lines, and restores natural radiance in as little as 14 days.',
    price: 68.00,
    originalPrice: 95.00,
    discountPercentage: 28,
    currency: 'USD',
    ctaText: 'Experience The Glow - Order Today',
    ctaLink: 'https://checkout.stripe.com/pay/solis-glow',
    templateId: 'minimalist-luxury',
    themeColor: '#0f172a',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80'
    ],
    features: [
      {
        id: 'f1',
        title: '15% Stabilized L-Ascorbic Acid',
        description: 'Fights environmental oxidative stress while visibly evening pigmentation and dark spots.',
        iconName: 'Sparkles'
      },
      {
        id: 'f2',
        title: 'Organic Botanical Infusion',
        description: 'Infused with wild rosehip, Japanese camellia, and blue tansy extract.',
        iconName: 'Heart'
      }
    ],
    testimonials: [
      {
        id: 't1',
        name: 'Elena Rostova',
        role: 'Beauty Editor',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        comment: 'My skin transformed within two weeks. The texture is silky, fast-absorbing, and gives an immediate healthy glass glow.',
        rating: 5
      }
    ],
    faqs: [
      {
        id: 'faq1',
        question: 'Is it suitable for sensitive skin?',
        answer: 'Yes! Solis is dermatologist-tested, fragrance-free, paraben-free, and formulated with soothing botanical calming agents.'
      }
    ],
    guaranteeText: '100% Cruelty Free • Dermatologist Approved • 45-Day Radiant Skin Guarantee',
    urgentBannerText: '✨ Complimentary Luxury Silk Eye Mask included with each order today',
    stockCount: 22,
    status: 'published',
    viewCount: 640,
    clickCount: 88,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'LaunchCraft',
  defaultSiteUrl: process.env.APP_URL || '',
  metaDescription: 'High-Converting Product Landing Page Generator with Built-in Analytics & Main Admin Ad Engine',
  supportEmail: 'support@launchcraft.app',
  adDisclosureNotice: 'Sponsored Advertisement • Vetted By Main Admin Platform',
  edgeOneCdnEnabled: true,
  updatedAt: new Date().toISOString(),
};

const INITIAL_ACO: ACOSettings = {
  seoTitleTemplate: '{{productName}} | Official Offer',
  defaultKeywords: 'deal, official launch, high conversion',
  googleVerificationCode: '',
  allowSearchIndexing: true,
  enableStructuredData: true,
  metaPixelId: '',
  ga4MeasurementId: '',
  tiktokPixelId: '',
  autoSocialProofToast: true,
  autoStickyMobileCheckout: true,
  autoExitIntentOffer: false,
  smartAdRotation: true,
  updatedAt: new Date().toISOString(),
};

class Database {
  private schema: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.schema = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users && parsed.landingPages && parsed.advertisements) {
          let migrated = false;

          if (!parsed.aco) {
            parsed.aco = { ...INITIAL_ACO };
            migrated = true;
          } else {
            const mergedAco = { ...INITIAL_ACO, ...parsed.aco };
            if (JSON.stringify(mergedAco) !== JSON.stringify(parsed.aco)) {
              parsed.aco = mergedAco;
              migrated = true;
            }
          }

          let adminCounter = 0;
          parsed.users = parsed.users.map((u: User) => {
            if (u.role === 'admin') {
              adminCounter++;
              const nextUser = { ...u };
              let changed = false;
              if (!nextUser.adminId) {
                nextUser.adminId = nextUser.id === 'user-admin-1' ? 'MAIN-ADMIN' : `ADMIN-${adminCounter}`;
                changed = true;
              }
              if (!nextUser.adminLevel) {
                nextUser.adminLevel = nextUser.id === 'user-admin-1' ? 'main_admin' : 'sub_admin';
                changed = true;
              }
              if (!nextUser.permissions) {
                nextUser.permissions = { ...DEFAULT_ADMIN_PERMISSIONS };
                changed = true;
              }
              if (changed) migrated = true;
              return nextUser;
            }
            return u;
          });

          if (Array.isArray(parsed.templates)) {
            const styleMap: Record<string, TemplateDefinition['layoutStyle']> = {
              'modern-sleek': 'modern',
              'flash-urgency': 'urgency',
              'minimalist-luxury': 'luxury',
              'tech-neon': 'dark',
              'direct-consumer': 'storyteller',
              'app-apk-showcase': 'app_apk',
            };
            parsed.templates = parsed.templates.map((t: TemplateDefinition) => {
              if (!t.layoutStyle && styleMap[t.id]) {
                migrated = true;
                return { ...t, layoutStyle: styleMap[t.id] };
              }
              return t;
            });
            if (!parsed.templates.some((t: TemplateDefinition) => t.id === 'app-apk-showcase')) {
              const apkTpl = INITIAL_TEMPLATES.find(t => t.id === 'app-apk-showcase');
              if (apkTpl) {
                parsed.templates.push(apkTpl);
                migrated = true;
              }
            }
          } else {
            parsed.templates = INITIAL_TEMPLATES;
            migrated = true;
          }

          if (migrated) {
            this.persist(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read database file, seeding defaults:', err);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      landingPages: INITIAL_LANDING_PAGES,
      advertisements: INITIAL_ADS,
      templates: INITIAL_TEMPLATES,
      analyticsEvents: [],
      settings: INITIAL_SETTINGS,
      aco: INITIAL_ACO,
    };
    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private save() {
    this.persist(this.schema);
  }

  // --- Users ---
  getUsers(): User[] {
    return [...this.schema.users];
  }

  getUserById(id: string): User | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.schema.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByAdminId(adminId: string): User | undefined {
    const clean = adminId.trim().toLowerCase();
    if (!clean) return undefined;
    return this.schema.users.find(u => u.adminId && u.adminId.toLowerCase() === clean);
  }

  getUserByEmailOrAdminId(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return undefined;
    return this.schema.users.find(
      u => u.email.toLowerCase() === clean || (u.adminId && u.adminId.toLowerCase() === clean)
    );
  }

  getAdmins(): User[] {
    return this.schema.users.filter(u => u.role === 'admin');
  }

  createUser(user: User): User {
    this.schema.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.schema.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.schema.users[idx] = { ...this.schema.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.schema.users[idx];
  }

  deleteUser(id: string): boolean {
    const initialLen = this.schema.users.length;
    this.schema.users = this.schema.users.filter(u => u.id !== id);
    if (this.schema.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Landing Pages ---
  getLandingPages(userId?: string): LandingPage[] {
    if (userId) {
      return this.schema.landingPages.filter(p => p.userId === userId);
    }
    return [...this.schema.landingPages];
  }

  getLandingPageById(id: string): LandingPage | undefined {
    return this.schema.landingPages.find(p => p.id === id);
  }

  getLandingPageBySlug(slug: string): LandingPage | undefined {
    return this.schema.landingPages.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  }

  createLandingPage(page: LandingPage): LandingPage {
    this.schema.landingPages.push(page);
    this.save();
    return page;
  }

  updateLandingPage(id: string, updates: Partial<LandingPage>): LandingPage | undefined {
    const idx = this.schema.landingPages.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.schema.landingPages[idx] = { ...this.schema.landingPages[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.schema.landingPages[idx];
  }

  deleteLandingPage(id: string): boolean {
    const initialLen = this.schema.landingPages.length;
    this.schema.landingPages = this.schema.landingPages.filter(p => p.id !== id);
    if (this.schema.landingPages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  recordLandingPageView(slug: string, referrer: string = ''): boolean {
    const page = this.getLandingPageBySlug(slug);
    if (!page) return false;
    page.viewCount = (page.viewCount || 0) + 1;
    this.schema.analyticsEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      landingPageSlug: slug,
      eventType: 'view',
      referrer,
      timestamp: new Date().toISOString(),
    });
    // Keep max 2000 events to prevent unlimited file growth
    if (this.schema.analyticsEvents.length > 2000) {
      this.schema.analyticsEvents = this.schema.analyticsEvents.slice(-2000);
    }
    this.save();
    return true;
  }

  recordLandingPageClick(slug: string): boolean {
    const page = this.getLandingPageBySlug(slug);
    if (!page) return false;
    page.clickCount = (page.clickCount || 0) + 1;
    this.schema.analyticsEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      landingPageSlug: slug,
      eventType: 'cta_click',
      referrer: '',
      timestamp: new Date().toISOString(),
    });
    this.save();
    return true;
  }

  // --- Advertisements (Controlled ONLY by Main Admin) ---
  getAdvertisements(activeOnly: boolean = false): Advertisement[] {
    if (activeOnly) {
      return this.schema.advertisements.filter(a => a.status === 'active');
    }
    return [...this.schema.advertisements];
  }

  getAdvertisementById(id: string): Advertisement | undefined {
    return this.schema.advertisements.find(a => a.id === id);
  }

  createAdvertisement(ad: Advertisement): Advertisement {
    this.schema.advertisements.push(ad);
    this.save();
    return ad;
  }

  updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | undefined {
    const idx = this.schema.advertisements.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.schema.advertisements[idx] = { ...this.schema.advertisements[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.schema.advertisements[idx];
  }

  deleteAdvertisement(id: string): boolean {
    const initialLen = this.schema.advertisements.length;
    this.schema.advertisements = this.schema.advertisements.filter(a => a.id !== id);
    if (this.schema.advertisements.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  recordAdClick(id: string): boolean {
    const ad = this.getAdvertisementById(id);
    if (!ad) return false;
    ad.clicks = (ad.clicks || 0) + 1;
    this.schema.analyticsEvents.push({
      id: `evt-ad-${Date.now()}`,
      landingPageSlug: '',
      eventType: 'ad_click',
      adId: id,
      referrer: '',
      timestamp: new Date().toISOString(),
    });
    this.save();
    return true;
  }

  recordAdView(id: string): boolean {
    const ad = this.getAdvertisementById(id);
    if (!ad) return false;
    ad.views = (ad.views || 0) + 1;
    this.save();
    return true;
  }

  // --- Templates ---
  getTemplates(): TemplateDefinition[] {
    return [...this.schema.templates];
  }

  getTemplateById(id: string): TemplateDefinition | undefined {
    return this.schema.templates.find(t => t.id === id);
  }

  getTemplateBySlug(slug: string): TemplateDefinition | undefined {
    return this.schema.templates.find(t => t.slug.toLowerCase() === slug.toLowerCase());
  }

  createTemplate(tpl: TemplateDefinition): TemplateDefinition {
    this.schema.templates.push(tpl);
    this.save();
    return tpl;
  }

  updateTemplate(id: string, updates: Partial<TemplateDefinition>): TemplateDefinition | undefined {
    const idx = this.schema.templates.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.schema.templates[idx] = {
      ...this.schema.templates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.schema.templates[idx];
  }

  deleteTemplate(id: string): boolean {
    const initialLen = this.schema.templates.length;
    this.schema.templates = this.schema.templates.filter(t => t.id !== id);
    if (this.schema.templates.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Analytics ---
  getAnalyticsOverview() {
    const pages = this.schema.landingPages;
    const totalPages = pages.length;
    const publishedPages = pages.filter(p => p.status === 'published').length;
    const totalViews = pages.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const totalClicks = pages.reduce((sum, p) => sum + (p.clickCount || 0), 0);
    const averageCtr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0;

    const ads = this.schema.advertisements;
    const totalAdViews = ads.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalAdClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
    const adCtr = totalAdViews > 0 ? Number(((totalAdClicks / totalAdViews) * 100).toFixed(2)) : 0;

    // Top landing pages
    const topPages = [...pages]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        productName: p.productName,
        views: p.viewCount,
        clicks: p.clickCount,
        ctr: p.viewCount > 0 ? Number(((p.clickCount / p.viewCount) * 100).toFixed(2)) : 0,
        status: p.status,
      }));

    return {
      totalPages,
      publishedPages,
      totalViews,
      totalClicks,
      averageCtr,
      totalAdViews,
      totalAdClicks,
      adCtr,
      topPages,
      recentEvents: this.schema.analyticsEvents.slice(-20).reverse(),
    };
  }

  // --- Settings ---
  getSettings(): SiteSettings {
    return { ...this.schema.settings };
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.schema.settings = { ...this.schema.settings, ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return { ...this.schema.settings };
  }

  // --- ACO (Ad, Conversion & SEO Optimization) ---
  getACOSettings(): ACOSettings {
    return { ...INITIAL_ACO, ...(this.schema.aco || {}) };
  }

  updateACOSettings(updates: Partial<ACOSettings>): ACOSettings {
    this.schema.aco = {
      ...INITIAL_ACO,
      ...(this.schema.aco || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return { ...this.schema.aco };
  }
}

export const db = new Database();
