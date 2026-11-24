import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { AdminPermissions, User } from './types.ts';

// In-memory active session tokens mapping to user ID
// token -> { userId: string, expiresAt: number }
const sessions = new Map<string, { userId: string; expiresAt: number }>();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const INITIAL_ADMIN_PASSWORD_HASH = 'a78b43c148cacac8fb9ee80bf6aa2ecdfaa1fc499489b9e47238a8b721a638d2';
const INITIAL_DEMO_PASSWORD_HASH = 'c0cefc95af1cf52bc807eb1e741611f65cfee29fa81c28cc92b4509d5517d99f';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'launchcraft_secure_salt').digest('hex');
}

export function verifyUserPassword(user: User, candidatePassword: string): boolean {
  if (!user || !candidatePassword) return false;

  const candidateHash = hashPassword(candidatePassword);
  if (user.passwordHash === candidateHash) return true;

  // Allow non-"!" initial seed password ONLY while the seeded account still holds the initial unaltered password hash.
  // Once the admin changes their password, old default passwords are completely rejected.
  if (user.role === 'admin' && user.passwordHash === INITIAL_ADMIN_PASSWORD_HASH) {
    if (candidatePassword === 'AdminLaunch#2026' || candidatePassword === 'AdminLaunch#2026!') {
      return true;
    }
  }

  // Demo user resilience ONLY while holding the initial unaltered seed hash
  if (user.email.toLowerCase() === 'creator@launchcraft.dev' && user.passwordHash === INITIAL_DEMO_PASSWORD_HASH) {
    if (candidatePassword === 'Creator123!' || candidatePassword === 'Creator123') {
      return true;
    }
  }

  return false;
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function invalidateSession(token: string): void {
  sessions.delete(token);
}

export function getSessionUser(token: string): User | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  const user = db.getUserById(session.userId);
  if (!user || user.status === 'suspended') return null;
  return user;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware: Authenticate user from Authorization header "Bearer <token>"
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const user = getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.user = user;
  next();
}

// Middleware: Authenticate admin strictly
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  const user = getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Admin session expired or invalid.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrative privileges required.' });
  }

  req.user = user;
  next();
}

export function hasAdminPermission(user: User, perm: keyof AdminPermissions): boolean {
  if (user.role !== 'admin') return false;
  if (user.adminLevel === 'main_admin' || !user.adminLevel) return true;
  return Boolean(user.permissions?.[perm]);
}

export function requireAdminPermission(perm: keyof AdminPermissions) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    const user = getSessionUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Admin session expired or invalid.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrative privileges required.' });
    }

    if (!hasAdminPermission(user, perm)) {
      return res.status(403).json({ error: `Access denied: Missing required permission (${perm}).` });
    }

    req.user = user;
    next();
  };
}

// Optional Auth (for public pages when tracking owner edits)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

  if (token) {
    const user = getSessionUser(token);
    if (user) req.user = user;
  }
  next();
}
