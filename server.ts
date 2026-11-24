import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, DEFAULT_ADMIN_PERMISSIONS } from './server/db.ts';
import {
  hashPassword,
  verifyUserPassword,
  createSession,
  invalidateSession,
  getSessionUser,
  requireAuth,
  requireAdmin,
  requireAdminPermission,
  hasAdminPermission,
  optionalAuth,
  AuthenticatedRequest,
} from './server/auth.ts';
import { AdminPermissions, Advertisement, LandingPage, PageACOConfig, TemplateDefinition, TemplateLayoutStyle, User } from './server/types.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data and uploads directories exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middlewares
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded assets and public PWA assets
app.use('/uploads', express.static(UPLOADS_DIR));
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

// Helper: Determine canonical site URL dynamically (compatible with EdgeOne, AI Studio, custom domains)
export function getSiteUrl(req: Request): string {
  if (process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

// Reserved Slugs
const RESERVED_SLUGS = new Set([
  'admin', 'login', 'register', 'dashboard', 'create', 'api', 'p',
  'assets', 'public', 'settings', 'static', 'favicon', 'robots',
  'sitemap', 'logout', 'terms', 'privacy', 'help', 'uploads', 'auth'
]);

function validateSlugFormat(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required.' };
  }
  const clean = slug.trim().toLowerCase();
  if (clean.length < 2) {
    return { valid: false, error: 'Slug must be at least 2 characters.' };
  }
  if (clean.length > 80) {
    return { valid: false, error: 'Slug cannot exceed 80 characters.' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and single hyphens (e.g. "wireless-earbuds").' };
  }
  if (RESERVED_SLUGS.has(clean)) {
    return { valid: false, error: `"${clean}" is a reserved system route. Please choose another slug.` };
  }
  return { valid: true };
}

function validateAdminIdFormat(adminId: string): { valid: boolean; error?: string } {
  if (!adminId || typeof adminId !== 'string') {
    return { valid: false, error: 'Admin ID is required.' };
  }
  const clean = adminId.trim();
  if (!/^[a-zA-Z0-9_-]{3,40}$/.test(clean)) {
    return {
      valid: false,
      error: 'Admin ID must be 3–40 characters and contain only letters, numbers, hyphens, or underscores.',
    };
  }
  return { valid: true };
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    adminId: user.adminId,
    email: user.email,
    name: user.name,
    role: user.role,
    adminLevel: user.adminLevel,
    permissions: user.permissions,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function sanitizePageACO(raw: unknown): PageACOConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const src = raw as Record<string, unknown>;
  return {
    seoTitle: typeof src.seoTitle === 'string' ? src.seoTitle.trim().slice(0, 120) : '',
    seoDescription: typeof src.seoDescription === 'string' ? src.seoDescription.trim().slice(0, 220) : '',
    seoKeywords: typeof src.seoKeywords === 'string' ? src.seoKeywords.trim().slice(0, 200) : '',
    noIndex: Boolean(src.noIndex),
    enableSocialProof: src.enableSocialProof !== undefined ? Boolean(src.enableSocialProof) : undefined,
    enableStickyCheckout: src.enableStickyCheckout !== undefined ? Boolean(src.enableStickyCheckout) : undefined,
    enableExitIntent: src.enableExitIntent !== undefined ? Boolean(src.enableExitIntent) : undefined,
    customPixelId: typeof src.customPixelId === 'string' ? src.customPixelId.trim().slice(0, 80) : '',
  };
}

// -------------------------------------------------------------
// PUBLIC & HEALTH ENDPOINTS
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    edgeOneReady: true,
  });
});

app.get('/api/config', (req: Request, res: Response) => {
  const currentSiteUrl = getSiteUrl(req);
  const settings = db.getSettings();
  res.json({
    siteUrl: settings.defaultSiteUrl || currentSiteUrl,
    siteName: settings.siteName,
    adDisclosureNotice: settings.adDisclosureNotice,
    edgeOneCdnEnabled: settings.edgeOneCdnEnabled,
  });
});

// Slug check endpoint
app.get('/api/slug/check', (req: Request, res: Response) => {
  const slug = (req.query.slug as string || '').trim().toLowerCase();
  const excludeId = req.query.excludeId as string | undefined;

  const validation = validateSlugFormat(slug);
  if (!validation.valid) {
    return res.json({ available: false, error: validation.error });
  }

  const existing = db.getLandingPageBySlug(slug);
  if (existing && existing.id !== excludeId) {
    return res.json({ available: false, error: `The slug "${slug}" is already in use by another page.` });
  }

  return res.json({ available: true, slug });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const cleanName = (name && typeof name === 'string' ? name.trim() : email.split('@')[0]) || 'Creator';

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: email.trim().toLowerCase(),
    name: cleanName,
    passwordHash: hashPassword(password),
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  const token = createSession(newUser.id);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
  }

  // Password verification
  if (!verifyUserPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(user.id);

  res.json({
    message: 'Logged in successfully',
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { identifier, email, password } = req.body;
  const loginKey = (typeof identifier === 'string' && identifier.trim())
    ? identifier.trim()
    : (typeof email === 'string' ? email.trim() : '');

  if (!loginKey || !password) {
    return res.status(400).json({ error: 'Admin ID / email and password are required.' });
  }

  const user = db.getUserByEmailOrAdminId(loginKey);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Invalid administrative credentials.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This administrator account is currently suspended.' });
  }

  if (!verifyUserPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = createSession(user.id);

  res.json({
    message: 'Admin authorization granted',
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

  if (!token) {
    return res.json({ user: null });
  }

  const user = getSessionUser(token);

  if (!user) {
    return res.json({ user: null });
  }

  res.json({
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);
  if (token) {
    invalidateSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// IMAGE UPLOAD ENDPOINT
// -------------------------------------------------------------
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { data, filename, mimeType } = req.body;

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'No image data received.' });
    }

    // Supported formats (handle mobile browsers that omit file.type or send octet-stream)
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    let detectedMime = '';
    if (typeof mimeType === 'string' && allowedMime.includes(mimeType)) {
      detectedMime = mimeType;
    } else if (data.startsWith('data:image/')) {
      const candidate = data.split(';')[0].replace('data:', '');
      if (allowedMime.includes(candidate)) detectedMime = candidate;
    }

    if (!detectedMime && typeof filename === 'string') {
      const lowerName = filename.toLowerCase();
      if (lowerName.endsWith('.png')) detectedMime = 'image/png';
      else if (lowerName.endsWith('.webp')) detectedMime = 'image/webp';
      else if (lowerName.endsWith('.svg')) detectedMime = 'image/svg+xml';
      else if (lowerName.endsWith('.gif')) detectedMime = 'image/gif';
      else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) detectedMime = 'image/jpeg';
    }

    // Check size (base64 string length max ~7MB for 5MB binary)
    if (data.length > 7 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum allowed size of 5MB.' });
    }

    // Extract base64 payload if data URL
    let base64Content = data;
    if (data.includes('base64,')) {
      base64Content = data.split('base64,')[1];
    }

    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum allowed size of 5MB.' });
    }

    // Fallback magic-byte sniffing for PNG / JPEG / GIF / WEBP
    if (!detectedMime && buffer.length >= 4) {
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        detectedMime = 'image/png';
      } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        detectedMime = 'image/jpeg';
      } else if (buffer.toString('ascii', 0, 4) === 'RIFF') {
        detectedMime = 'image/webp';
      } else if (buffer.toString('ascii', 0, 3) === 'GIF') {
        detectedMime = 'image/gif';
      }
    }

    if (!detectedMime || !allowedMime.includes(detectedMime)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed formats: PNG, JPG, WebP, SVG.' });
    }

    const ext =
      detectedMime === 'image/png'
        ? 'png'
        : detectedMime === 'image/webp'
        ? 'webp'
        : detectedMime === 'image/svg+xml'
        ? 'svg'
        : detectedMime === 'image/gif'
        ? 'gif'
        : 'jpg';
    const safeName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${safeName}`;
    const fullUrl = `${getSiteUrl(req)}${relativeUrl}`;

    res.json({
      url: relativeUrl,
      fullUrl,
      filename: safeName,
      mimeType: detectedMime,
      size: buffer.length,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload. Please try again.' });
  }
});

// -------------------------------------------------------------
// PUBLIC LANDING PAGE CONSUMPTION
// -------------------------------------------------------------
app.get('/api/public/page/:slug', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const slug = (req.params.slug || '').trim().toLowerCase();
  const page = db.getLandingPageBySlug(slug);

  if (!page) {
    return res.status(404).json({ error: 'Landing page not found. The requested product might have been moved or removed.' });
  }

  // If page is disabled, only the owner or an admin can view it
  const isOwnerOrAdmin = req.user && (req.user.id === page.userId || req.user.role === 'admin');
  if (page.status === 'disabled' && !isOwnerOrAdmin) {
    return res.status(404).json({ error: 'This landing page is currently inactive or unpublished by the creator.' });
  }

  // Record view count
  const referrer = (req.headers.referer || req.headers.referrer as string || '').substring(0, 200);
  db.recordLandingPageView(slug, referrer);

  // Fetch active advertisements configured by MAIN ADMIN & ACO settings
  const activeAds = db.getAdvertisements(true);
  const aco = db.getACOSettings();

  const pickAd = (placement: Advertisement['placement']): Advertisement | null => {
    const pool = activeAds.filter(a => a.placement === placement);
    if (pool.length === 0) return null;
    if (aco.smartAdRotation && pool.length > 1) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return pool[0];
  };

  // Group ads by placement
  const adsByPlacement = {
    below_product_image: pickAd('below_product_image'),
    footer: pickAd('footer'),
    sticky_banner: pickAd('sticky_banner'),
  };

  // Record impression for displayed ads
  if (adsByPlacement.below_product_image) db.recordAdView(adsByPlacement.below_product_image.id);
  if (adsByPlacement.footer) db.recordAdView(adsByPlacement.footer.id);
  if (adsByPlacement.sticky_banner) db.recordAdView(adsByPlacement.sticky_banner.id);

  const siteSettings = db.getSettings();
  const canonicalUrl = `${siteSettings.defaultSiteUrl || getSiteUrl(req)}/p/${page.slug}`;
  const template = db.getTemplateById(page.templateId) || null;

  res.json({
    page,
    template,
    advertisements: adsByPlacement,
    canonicalUrl,
    aco,
    settings: {
      siteName: siteSettings.siteName,
      adDisclosureNotice: siteSettings.adDisclosureNotice,
    },
  });
});

app.post('/api/public/click/:slug', (req: Request, res: Response) => {
  const slug = (req.params.slug || '').trim().toLowerCase();
  const success = db.recordLandingPageClick(slug);
  res.json({ success });
});

app.post('/api/public/ad-click/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const success = db.recordAdClick(id);
  res.json({ success });
});

// -------------------------------------------------------------
// USER LANDING PAGES (CRUD)
// -------------------------------------------------------------
app.get('/api/landing-pages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  // Admins can view all if ?all=true
  if (user.role === 'admin' && req.query.all === 'true') {
    return res.json({ pages: db.getLandingPages() });
  }
  const pages = db.getLandingPages(user.id);
  res.json({ pages });
});

app.post('/api/landing-pages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body;

  // Validation
  const productName = (body.productName || '').trim();
  if (!productName || productName.length < 2 || productName.length > 120) {
    return res.status(400).json({ error: 'Product name must be between 2 and 120 characters.' });
  }

  const slug = (body.slug || '').trim().toLowerCase();
  const slugCheck = validateSlugFormat(slug);
  if (!slugCheck.valid) {
    return res.status(400).json({ error: slugCheck.error });
  }

  const existingSlug = db.getLandingPageBySlug(slug);
  if (existingSlug) {
    return res.status(409).json({ error: `The slug "${slug}" is already taken. Please choose another.` });
  }

  const price = Number(body.price);
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Please enter a valid price (greater than or equal to 0).' });
  }

  const originalPrice = body.originalPrice !== undefined && body.originalPrice !== '' ? Number(body.originalPrice) : price;
  const discountPercentage = originalPrice > price && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const ctaText = (body.ctaText || 'Buy Now').trim();
  const ctaLink = (body.ctaLink || '#').trim();
  const imageUrl = (body.imageUrl || '').trim();

  if (!imageUrl) {
    return res.status(400).json({ error: 'A primary product image is required.' });
  }

  const newPage: LandingPage = {
    id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: user.id,
    userEmail: user.email,
    slug,
    productName,
    subtitle: (body.subtitle || '').trim(),
    description: (body.description || '').trim(),
    price,
    originalPrice,
    discountPercentage,
    currency: (body.currency || 'USD').toUpperCase(),
    ctaText,
    ctaLink,
    templateId: body.templateId || 'modern-sleek',
    themeColor: body.themeColor || '#4f46e5',
    imageUrl,
    imageFit: body.imageFit === 'contain' ? 'contain' : body.imageFit === 'cover' ? 'cover' : undefined,
    galleryUrls: Array.isArray(body.galleryUrls) && body.galleryUrls.length > 0 ? body.galleryUrls : [imageUrl],
    features: Array.isArray(body.features) ? body.features : [],
    testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],
    faqs: Array.isArray(body.faqs) ? body.faqs : [],
    guaranteeText: (body.guaranteeText || '30-Day Money Back Guarantee').trim(),
    urgentBannerText: (body.urgentBannerText || '').trim(),
    stockCount: body.stockCount !== undefined ? Number(body.stockCount) : 15,
    aco: sanitizePageACO(body.aco),
    status: body.status === 'disabled' ? 'disabled' : 'published',
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.createLandingPage(newPage);
  res.status(201).json({ message: 'Landing page created successfully', page: created });
});

app.get('/api/landing-pages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = db.getLandingPageById(req.params.id);

  if (!page) {
    return res.status(404).json({ error: 'Landing page not found.' });
  }

  if (page.userId !== user.id && !hasAdminPermission(user, 'managePages')) {
    return res.status(403).json({ error: 'Access denied: You do not own this landing page.' });
  }

  res.json({ page });
});

app.put('/api/landing-pages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = db.getLandingPageById(req.params.id);

  if (!page) {
    return res.status(404).json({ error: 'Landing page not found.' });
  }

  if (page.userId !== user.id && !hasAdminPermission(user, 'managePages')) {
    return res.status(403).json({ error: 'Access denied: You do not own this landing page.' });
  }

  const body = req.body;

  // Validate slug if changed
  if (body.slug && body.slug !== page.slug) {
    const slug = body.slug.trim().toLowerCase();
    const slugCheck = validateSlugFormat(slug);
    if (!slugCheck.valid) {
      return res.status(400).json({ error: slugCheck.error });
    }
    const collision = db.getLandingPageBySlug(slug);
    if (collision && collision.id !== page.id) {
      return res.status(409).json({ error: `The slug "${slug}" is already in use.` });
    }
    page.slug = slug;
  }

  if (body.productName) page.productName = body.productName.trim();
  if (body.subtitle !== undefined) page.subtitle = body.subtitle.trim();
  if (body.description !== undefined) page.description = body.description.trim();
  if (body.price !== undefined) page.price = Number(body.price);
  if (body.originalPrice !== undefined) page.originalPrice = Number(body.originalPrice);
  if (page.originalPrice > page.price && page.originalPrice > 0) {
    page.discountPercentage = Math.round(((page.originalPrice - page.price) / page.originalPrice) * 100);
  } else {
    page.discountPercentage = 0;
  }
  if (body.currency) page.currency = body.currency.toUpperCase();
  if (body.ctaText) page.ctaText = body.ctaText.trim();
  if (body.ctaLink) page.ctaLink = body.ctaLink.trim();
  if (body.templateId) page.templateId = body.templateId;
  if (body.themeColor) page.themeColor = body.themeColor;
  if (body.imageUrl) page.imageUrl = body.imageUrl;
  if (body.imageFit === 'contain' || body.imageFit === 'cover') page.imageFit = body.imageFit;
  if (Array.isArray(body.galleryUrls)) page.galleryUrls = body.galleryUrls;
  if (Array.isArray(body.features)) page.features = body.features;
  if (Array.isArray(body.testimonials)) page.testimonials = body.testimonials;
  if (Array.isArray(body.faqs)) page.faqs = body.faqs;
  if (body.guaranteeText !== undefined) page.guaranteeText = body.guaranteeText.trim();
  if (body.urgentBannerText !== undefined) page.urgentBannerText = body.urgentBannerText.trim();
  if (body.stockCount !== undefined) page.stockCount = Number(body.stockCount);
  if (body.aco !== undefined) page.aco = sanitizePageACO(body.aco);
  if (body.status === 'published' || body.status === 'disabled') page.status = body.status;

  const updated = db.updateLandingPage(page.id, page);
  res.json({ message: 'Landing page updated successfully', page: updated });
});

app.patch('/api/landing-pages/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = db.getLandingPageById(req.params.id);

  if (!page) {
    return res.status(404).json({ error: 'Landing page not found.' });
  }

  if (page.userId !== user.id && !hasAdminPermission(user, 'managePages')) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const newStatus = page.status === 'published' ? 'disabled' : 'published';
  const updated = db.updateLandingPage(page.id, { status: newStatus });

  res.json({ message: `Landing page is now ${newStatus}`, page: updated });
});

app.delete('/api/landing-pages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = db.getLandingPageById(req.params.id);

  if (!page) {
    return res.status(404).json({ error: 'Landing page not found.' });
  }

  if (page.userId !== user.id && !hasAdminPermission(user, 'managePages')) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  db.deleteLandingPage(page.id);
  res.json({ success: true, message: 'Landing page deleted successfully.' });
});

// -------------------------------------------------------------
// MAIN ADMIN ADVERTISEMENT MANAGEMENT (STRICT SERVER PROTECTION)
// -------------------------------------------------------------
app.get('/api/admin/ads', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ advertisements: db.getAdvertisements() });
});

app.post('/api/admin/ads', requireAdminPermission('manageAds'), (req: AuthenticatedRequest, res: Response) => {
  const { title, placement, type, content, linkUrl, imageUrl, sponsorName, badgeText, status } = req.body;

  if (!title || !placement || !type) {
    return res.status(400).json({ error: 'Title, placement, and ad type are required.' });
  }

  const validPlacements = ['below_product_image', 'footer', 'sticky_banner'];
  if (!validPlacements.includes(placement)) {
    return res.status(400).json({ error: 'Invalid placement. Allowed: below_product_image, footer, sticky_banner' });
  }

  const newAd: Advertisement = {
    id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    placement,
    type,
    content: (content || '').trim(),
    linkUrl: (linkUrl || '#').trim(),
    imageUrl: imageUrl || '',
    sponsorName: sponsorName || 'Verified Sponsor',
    badgeText: badgeText || 'Sponsored',
    status: status === 'inactive' ? 'inactive' : 'active',
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.createAdvertisement(newAd);
  res.status(201).json({ message: 'Advertisement published successfully', advertisement: created });
});

app.put('/api/admin/ads/:id', requireAdminPermission('manageAds'), (req: AuthenticatedRequest, res: Response) => {
  const ad = db.getAdvertisementById(req.params.id);
  if (!ad) {
    return res.status(404).json({ error: 'Advertisement not found.' });
  }

  const body = req.body;
  if (body.title) ad.title = body.title.trim();
  if (body.placement) ad.placement = body.placement;
  if (body.type) ad.type = body.type;
  if (body.content !== undefined) ad.content = body.content.trim();
  if (body.linkUrl !== undefined) ad.linkUrl = body.linkUrl.trim();
  if (body.imageUrl !== undefined) ad.imageUrl = body.imageUrl;
  if (body.sponsorName !== undefined) ad.sponsorName = body.sponsorName;
  if (body.badgeText !== undefined) ad.badgeText = body.badgeText;
  if (body.status) ad.status = body.status;

  const updated = db.updateAdvertisement(ad.id, ad);
  res.json({ message: 'Advertisement updated', advertisement: updated });
});

app.patch('/api/admin/ads/:id/toggle', requireAdminPermission('manageAds'), (req: AuthenticatedRequest, res: Response) => {
  const ad = db.getAdvertisementById(req.params.id);
  if (!ad) {
    return res.status(404).json({ error: 'Advertisement not found.' });
  }

  const newStatus = ad.status === 'active' ? 'inactive' : 'active';
  const updated = db.updateAdvertisement(ad.id, { status: newStatus });
  res.json({ message: `Advertisement is now ${newStatus}`, advertisement: updated });
});

app.delete('/api/admin/ads/:id', requireAdminPermission('manageAds'), (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteAdvertisement(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Advertisement not found.' });
  }
  res.json({ success: true, message: 'Advertisement removed' });
});

// -------------------------------------------------------------
// ADMIN PROFILE, PASSWORD, ADMIN ID & MULTI-ADMIN MANAGEMENT
// -------------------------------------------------------------
app.put('/api/admin/profile', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const currentAdmin = req.user!;
  const { currentPassword, newAdminId, newEmail, name, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({ error: 'Current password is required to update admin credentials.' });
  }

  if (!verifyUserPassword(currentAdmin, currentPassword)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const updates: Partial<User> = {};

  if (typeof name === 'string' && name.trim().length >= 2) {
    updates.name = name.trim();
  }

  if (typeof newAdminId === 'string' && newAdminId.trim()) {
    const cleanId = newAdminId.trim();
    const idCheck = validateAdminIdFormat(cleanId);
    if (!idCheck.valid) {
      return res.status(400).json({ error: idCheck.error });
    }
    const existingById = db.getUserByAdminId(cleanId);
    if (existingById && existingById.id !== currentAdmin.id) {
      return res.status(409).json({ error: `Admin ID "${cleanId}" is already in use.` });
    }
    updates.adminId = cleanId;
  }

  if (typeof newEmail === 'string' && newEmail.trim()) {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    const existingByEmail = db.getUserByEmail(cleanEmail);
    if (existingByEmail && existingByEmail.id !== currentAdmin.id) {
      return res.status(409).json({ error: `Email "${cleanEmail}" is already assigned to another account.` });
    }
    updates.email = cleanEmail;
  }

  if (typeof newPassword === 'string' && newPassword.trim().length > 0) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }
    updates.passwordHash = hashPassword(newPassword.trim());
  }

  const updated = db.updateUser(currentAdmin.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  res.json({
    message: 'Admin credentials updated successfully.',
    user: sanitizeUser(updated),
  });
});

app.get('/api/admin/admins', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const admins = db.getAdmins().map(a => ({
    ...sanitizeUser(a),
    landingPagesCount: db.getLandingPages(a.id).length,
  }));
  res.json({ admins });
});

app.post('/api/admin/admins', requireAdminPermission('manageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const { name, adminId, email, password, adminLevel, permissions } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Admin name must be at least 2 characters.' });
  }

  const idCheck = validateAdminIdFormat(adminId);
  if (!idCheck.valid) {
    return res.status(400).json({ error: idCheck.error });
  }

  const cleanAdminId = adminId.trim();
  if (db.getUserByAdminId(cleanAdminId)) {
    return res.status(409).json({ error: `Admin ID "${cleanAdminId}" is already taken.` });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid admin email address.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (db.getUserByEmail(cleanEmail)) {
    return res.status(409).json({ error: `An account with email "${cleanEmail}" already exists.` });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const level = adminLevel === 'main_admin' ? 'main_admin' : 'sub_admin';
  const mergedPermissions: AdminPermissions = level === 'main_admin'
    ? { ...DEFAULT_ADMIN_PERMISSIONS }
    : {
        manageAds: Boolean(permissions?.manageAds),
        managePages: permissions?.managePages !== undefined ? Boolean(permissions.managePages) : true,
        manageUsers: Boolean(permissions?.manageUsers),
        manageAdmins: Boolean(permissions?.manageAdmins),
        manageACO: Boolean(permissions?.manageACO),
        manageSettings: Boolean(permissions?.manageSettings),
      };

  const newAdmin: User = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    adminId: cleanAdminId,
    email: cleanEmail,
    name: name.trim(),
    passwordHash: hashPassword(password),
    role: 'admin',
    adminLevel: level,
    permissions: mergedPermissions,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createUser(newAdmin);
  res.status(201).json({
    message: `Admin "${cleanAdminId}" created successfully.`,
    admin: sanitizeUser(newAdmin),
  });
});

app.put('/api/admin/admins/:id', requireAdminPermission('manageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const target = db.getUserById(req.params.id);
  if (!target || target.role !== 'admin') {
    return res.status(404).json({ error: 'Administrator account not found.' });
  }

  const { name, adminId, email, adminLevel, permissions, status, newPassword } = req.body;
  const activeMainAdmins = db.getAdmins().filter(a => a.adminLevel === 'main_admin' && a.status === 'active');

  const updates: Partial<User> = {};

  if (typeof name === 'string' && name.trim().length >= 2) {
    updates.name = name.trim();
  }

  if (typeof adminId === 'string' && adminId.trim()) {
    const cleanId = adminId.trim();
    const idCheck = validateAdminIdFormat(cleanId);
    if (!idCheck.valid) {
      return res.status(400).json({ error: idCheck.error });
    }
    const conflict = db.getUserByAdminId(cleanId);
    if (conflict && conflict.id !== target.id) {
      return res.status(409).json({ error: `Admin ID "${cleanId}" is already taken.` });
    }
    updates.adminId = cleanId;
  }

  if (typeof email === 'string' && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    const conflict = db.getUserByEmail(cleanEmail);
    if (conflict && conflict.id !== target.id) {
      return res.status(409).json({ error: `Email "${cleanEmail}" is already in use.` });
    }
    updates.email = cleanEmail;
  }

  if (adminLevel === 'main_admin' || adminLevel === 'sub_admin') {
    if (
      target.adminLevel === 'main_admin' &&
      adminLevel === 'sub_admin' &&
      activeMainAdmins.length <= 1 &&
      activeMainAdmins[0]?.id === target.id
    ) {
      return res.status(400).json({ error: 'Cannot downgrade the last active Main Admin.' });
    }
    updates.adminLevel = adminLevel;
  }

  const effectiveLevel = updates.adminLevel || target.adminLevel || 'sub_admin';
  if (effectiveLevel === 'main_admin') {
    updates.permissions = { ...DEFAULT_ADMIN_PERMISSIONS };
  } else if (permissions && typeof permissions === 'object') {
    updates.permissions = {
      manageAds: Boolean(permissions.manageAds),
      managePages: Boolean(permissions.managePages),
      manageUsers: Boolean(permissions.manageUsers),
      manageAdmins: Boolean(permissions.manageAdmins),
      manageACO: Boolean(permissions.manageACO),
      manageSettings: Boolean(permissions.manageSettings),
    };
  }

  if (status === 'active' || status === 'suspended') {
    if (target.id === req.user!.id && status === 'suspended') {
      return res.status(400).json({ error: 'You cannot suspend your own active admin account.' });
    }
    if (
      target.adminLevel === 'main_admin' &&
      status === 'suspended' &&
      activeMainAdmins.length <= 1 &&
      activeMainAdmins[0]?.id === target.id
    ) {
      return res.status(400).json({ error: 'Cannot suspend the last active Main Admin.' });
    }
    updates.status = status;
  }

  if (typeof newPassword === 'string' && newPassword.trim().length > 0) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    updates.passwordHash = hashPassword(newPassword.trim());
  }

  const updated = db.updateUser(target.id, updates);
  res.json({
    message: 'Administrator account updated.',
    admin: sanitizeUser(updated!),
  });
});

app.delete('/api/admin/admins/:id', requireAdminPermission('manageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const target = db.getUserById(req.params.id);
  if (!target || target.role !== 'admin') {
    return res.status(404).json({ error: 'Administrator account not found.' });
  }

  if (target.id === req.user!.id) {
    return res.status(400).json({ error: 'You cannot remove or demote your own currently signed-in admin account.' });
  }

  const activeMainAdmins = db.getAdmins().filter(a => a.adminLevel === 'main_admin' && a.status === 'active');
  if (target.adminLevel === 'main_admin' && activeMainAdmins.length <= 1 && activeMainAdmins[0]?.id === target.id) {
    return res.status(400).json({ error: 'Cannot remove the last active Main Admin.' });
  }

  const demote = req.query.demote === 'true';
  if (demote) {
    const demoted = db.updateUser(target.id, {
      role: 'user',
      adminId: undefined,
      adminLevel: undefined,
      permissions: undefined,
    });
    return res.json({ success: true, message: `${target.name} demoted to regular Creator.`, user: sanitizeUser(demoted!) });
  }

  db.deleteUser(target.id);
  res.json({ success: true, message: `Administrator "${target.adminId || target.email}" removed.` });
});

app.post('/api/admin/users/:id/promote', requireAdminPermission('manageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const target = db.getUserById(req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (target.role === 'admin') {
    return res.status(400).json({ error: 'This user already holds administrator privileges.' });
  }

  const { adminId, adminLevel, permissions } = req.body;
  const idCheck = validateAdminIdFormat(adminId);
  if (!idCheck.valid) {
    return res.status(400).json({ error: idCheck.error });
  }
  const cleanAdminId = adminId.trim();
  if (db.getUserByAdminId(cleanAdminId)) {
    return res.status(409).json({ error: `Admin ID "${cleanAdminId}" is already taken.` });
  }

  const level = adminLevel === 'main_admin' ? 'main_admin' : 'sub_admin';
  const mergedPermissions: AdminPermissions = level === 'main_admin'
    ? { ...DEFAULT_ADMIN_PERMISSIONS }
    : {
        manageAds: Boolean(permissions?.manageAds),
        managePages: permissions?.managePages !== undefined ? Boolean(permissions.managePages) : true,
        manageUsers: Boolean(permissions?.manageUsers),
        manageAdmins: Boolean(permissions?.manageAdmins),
        manageACO: Boolean(permissions?.manageACO),
        manageSettings: Boolean(permissions?.manageSettings),
      };

  const promoted = db.updateUser(target.id, {
    role: 'admin',
    adminId: cleanAdminId,
    adminLevel: level,
    permissions: mergedPermissions,
  });

  res.json({
    message: `${target.name} promoted to ${level === 'main_admin' ? 'Main Admin' : 'Sub Admin'} (${cleanAdminId}).`,
    admin: sanitizeUser(promoted!),
  });
});

// -------------------------------------------------------------
// MAIN ADMIN USER MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(u => ({
    ...sanitizeUser(u),
    landingPagesCount: db.getLandingPages(u.id).length,
  }));
  res.json({ users });
});

app.patch('/api/admin/users/:id/status', requireAdminPermission('manageUsers'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent admin self-suspension
  if (user.id === req.user!.id) {
    return res.status(400).json({ error: 'You cannot suspend your own admin account.' });
  }

  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  const updated = db.updateUser(user.id, { status: newStatus });
  res.json({ message: `User status changed to ${newStatus}`, user: updated ? sanitizeUser(updated) : undefined });
});

// -------------------------------------------------------------
// MAIN ADMIN TEMPLATE MANAGEMENT
// -------------------------------------------------------------
app.get('/api/templates', (req: Request, res: Response) => {
  res.json({ templates: db.getTemplates() });
});

const VALID_LAYOUT_STYLES: TemplateLayoutStyle[] = [
  'modern',
  'urgency',
  'luxury',
  'dark',
  'storyteller',
  'app_apk',
];

app.post('/api/admin/templates', requireAdminPermission('manageSettings'), (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    slug,
    description,
    category,
    defaultTheme,
    badge,
    layoutStyle,
    featuresList,
    isActive,
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return res.status(400).json({ error: 'Template name must be between 2 and 80 characters.' });
  }

  const rawSlug = (typeof slug === 'string' && slug.trim()
    ? slug
    : name
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!rawSlug || rawSlug.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)) {
    return res.status(400).json({ error: 'Template slug must be valid lowercase letters, numbers, and hyphens.' });
  }

  if (db.getTemplateBySlug(rawSlug) || db.getTemplateById(rawSlug)) {
    return res.status(409).json({ error: `A template with slug "${rawSlug}" already exists.` });
  }

  const cleanFeatures = Array.isArray(featuresList)
    ? featuresList.map((f: unknown) => String(f).trim()).filter(Boolean)
    : typeof featuresList === 'string'
    ? featuresList.split(/[\n,]+/).map(f => f.trim()).filter(Boolean)
    : [];

  const cleanTheme = typeof defaultTheme === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(defaultTheme.trim())
    ? defaultTheme.trim()
    : '#4f46e5';

  const cleanLayout: TemplateLayoutStyle = VALID_LAYOUT_STYLES.includes(layoutStyle)
    ? layoutStyle
    : 'modern';

  const now = new Date().toISOString();
  const newTemplate: TemplateDefinition = {
    id: rawSlug,
    name: name.trim(),
    slug: rawSlug,
    description: (typeof description === 'string' ? description.trim() : '') || 'Custom high-converting landing page template.',
    category: (typeof category === 'string' ? category.trim() : '') || 'Custom Template',
    defaultTheme: cleanTheme,
    badge: (typeof badge === 'string' ? badge.trim() : '') || 'Custom',
    layoutStyle: cleanLayout,
    featuresList: cleanFeatures.length > 0 ? cleanFeatures : ['Responsive Hero', 'Conversion CTA', 'Social Proof'],
    isActive: isActive !== false,
    isDefault: false,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  const created = db.createTemplate(newTemplate);
  res.status(201).json({ message: `Template "${created.name}" added successfully.`, template: created });
});

app.put('/api/admin/templates/:id', requireAdminPermission('manageSettings'), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getTemplateById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  const {
    name,
    slug,
    description,
    category,
    defaultTheme,
    badge,
    layoutStyle,
    featuresList,
    isActive,
  } = req.body;

  const updates: Partial<TemplateDefinition> = {};

  if (typeof name === 'string' && name.trim().length >= 2) {
    updates.name = name.trim().slice(0, 80);
  }

  if (typeof slug === 'string' && slug.trim() && slug.trim().toLowerCase() !== existing.slug) {
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cleanSlug || cleanSlug.length < 2) {
      return res.status(400).json({ error: 'Invalid template slug.' });
    }
    const collision = db.getTemplateBySlug(cleanSlug);
    if (collision && collision.id !== existing.id) {
      return res.status(409).json({ error: `Slug "${cleanSlug}" is already used by another template.` });
    }
    updates.slug = cleanSlug;
  }

  if (typeof description === 'string') updates.description = description.trim();
  if (typeof category === 'string' && category.trim()) updates.category = category.trim();
  if (typeof badge === 'string' && badge.trim()) updates.badge = badge.trim();
  if (typeof defaultTheme === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(defaultTheme.trim())) {
    updates.defaultTheme = defaultTheme.trim();
  }
  if (VALID_LAYOUT_STYLES.includes(layoutStyle)) {
    updates.layoutStyle = layoutStyle;
  }
  if (Array.isArray(featuresList)) {
    updates.featuresList = featuresList.map((f: unknown) => String(f).trim()).filter(Boolean);
  } else if (typeof featuresList === 'string') {
    updates.featuresList = featuresList.split(/[\n,]+/).map(f => f.trim()).filter(Boolean);
  }
  if (typeof isActive === 'boolean') {
    updates.isActive = isActive;
  }

  const updated = db.updateTemplate(existing.id, updates);
  res.json({ message: `Template "${updated?.name}" updated.`, template: updated });
});

app.patch('/api/admin/templates/:id/toggle', requireAdminPermission('manageSettings'), (req: AuthenticatedRequest, res: Response) => {
  const template = db.getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  const updated = db.updateTemplate(template.id, { isActive: !template.isActive });
  res.json({ message: 'Template status updated', template: updated });
});

app.delete('/api/admin/templates/:id', requireAdminPermission('manageSettings'), (req: AuthenticatedRequest, res: Response) => {
  const template = db.getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found.' });
  }
  if (template.isDefault) {
    return res.status(400).json({ error: 'The default fallback template cannot be deleted. You may edit or disable it instead.' });
  }
  db.deleteTemplate(template.id);
  res.json({ success: true, message: `Template "${template.name}" deleted.` });
});

// -------------------------------------------------------------
// MAIN ADMIN ANALYTICS
// -------------------------------------------------------------
app.get('/api/admin/analytics', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const overview = db.getAnalyticsOverview();
  res.json(overview);
});

// -------------------------------------------------------------
// MAIN ADMIN ACO (AD, CONVERSION & SEO OPTIMIZATION) SETTINGS
// -------------------------------------------------------------
app.get('/api/admin/aco', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ aco: db.getACOSettings() });
});

app.put('/api/admin/aco', requireAdminPermission('manageACO'), (req: AuthenticatedRequest, res: Response) => {
  const b = req.body;
  const updated = db.updateACOSettings({
    seoTitleTemplate: typeof b.seoTitleTemplate === 'string' ? b.seoTitleTemplate.trim() : undefined,
    defaultKeywords: typeof b.defaultKeywords === 'string' ? b.defaultKeywords.trim() : undefined,
    googleVerificationCode: typeof b.googleVerificationCode === 'string' ? b.googleVerificationCode.trim() : undefined,
    allowSearchIndexing: typeof b.allowSearchIndexing === 'boolean' ? b.allowSearchIndexing : undefined,
    enableStructuredData: typeof b.enableStructuredData === 'boolean' ? b.enableStructuredData : undefined,
    metaPixelId: typeof b.metaPixelId === 'string' ? b.metaPixelId.trim() : undefined,
    ga4MeasurementId: typeof b.ga4MeasurementId === 'string' ? b.ga4MeasurementId.trim() : undefined,
    tiktokPixelId: typeof b.tiktokPixelId === 'string' ? b.tiktokPixelId.trim() : undefined,
    autoSocialProofToast: typeof b.autoSocialProofToast === 'boolean' ? b.autoSocialProofToast : undefined,
    autoStickyMobileCheckout: typeof b.autoStickyMobileCheckout === 'boolean' ? b.autoStickyMobileCheckout : undefined,
    autoExitIntentOffer: typeof b.autoExitIntentOffer === 'boolean' ? b.autoExitIntentOffer : undefined,
    smartAdRotation: typeof b.smartAdRotation === 'boolean' ? b.smartAdRotation : undefined,
  });

  res.json({ message: 'ACO & SEO optimization settings updated.', aco: updated });
});

// -------------------------------------------------------------
// MAIN ADMIN SETTINGS
// -------------------------------------------------------------
app.get('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdminPermission('manageSettings'), (req: AuthenticatedRequest, res: Response) => {
  const { siteName, defaultSiteUrl, metaDescription, supportEmail, adDisclosureNotice, edgeOneCdnEnabled } = req.body;

  const updated = db.updateSettings({
    siteName: siteName?.trim(),
    defaultSiteUrl: defaultSiteUrl?.trim(),
    metaDescription: metaDescription?.trim(),
    supportEmail: supportEmail?.trim(),
    adDisclosureNotice: adDisclosureNotice?.trim(),
    edgeOneCdnEnabled: Boolean(edgeOneCdnEnabled),
  });

  res.json({ message: 'Settings updated successfully', settings: updated });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function bootstrap() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 LaunchCraft server live on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
