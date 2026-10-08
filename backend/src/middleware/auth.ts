import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { db } from '../db/database.js';
import { User, UserRole } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: User;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

const DEV_TOKEN_EMAIL_MAP: Record<string, string> = {
  'mock-jwt-admin-token-2026': 'admin@telanganarealty.in',
  'mock-jwt-agent-token-2026': 'suresh.reddy@telanganarealty.in',
  'mock-jwt-agent2-token-2026': 'lavanya.rao@telanganarealty.in',
  'mock-jwt-seller-001-token': 'kvrao.hyderabad@gmail.com',
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  }

  try {
    if (config.nodeEnv !== 'production' && DEV_TOKEN_EMAIL_MAP[token]) {
      const devUser = await db.findUserByEmail(DEV_TOKEN_EMAIL_MAP[token]);
      if (devUser && devUser.isActive) {
        req.user = devUser;
        return next();
      }
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: UserRole };
    const user = await db.findUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or deactivated' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', details: (err as Error).message });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (token) {
    try {
      if (config.nodeEnv !== 'production' && DEV_TOKEN_EMAIL_MAP[token]) {
        const devUser = await db.findUserByEmail(DEV_TOKEN_EMAIL_MAP[token]);
        if (devUser && devUser.isActive) {
          req.user = devUser;
          return next();
        }
      }

      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: UserRole };
      const user = await db.findUserById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignore token decode errors in optional auth
    }
  }
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
