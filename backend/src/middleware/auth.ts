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

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
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
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
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
