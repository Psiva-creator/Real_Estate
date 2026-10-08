import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { authService } from './auth.service.js';
import { db } from '../../db/database.js';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, phone, email, password, whatsapp, role } = req.body;
      const result = await authService.register({
        name,
        phone,
        email,
        password,
        whatsapp,
        role,
      });

      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { identifier, phone, email, password } = req.body;
      const loginId = identifier || phone || email;

      if (!loginId) {
        return res.status(400).json({ error: 'Phone or email identifier is required' });
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] as string | undefined;

      const result = await authService.login(loginId, password, { ipAddress, userAgent });

      return res.json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          email: result.user.email,
          role: result.user.role,
          lastLoginAt: result.user.lastLoginAt,
        },
        token: result.token,
      });
    } catch (err) {
      return res.status(401).json({ error: (err as Error).message });
    }
  }

  async googleLogin(_req: Request, res: Response) {
    return res.status(501).json({
      error: 'Google OAuth authentication is not enabled or configured on this server. Please sign in using your registered phone or email and password.',
    });
  }

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        role: req.user.role,
        whatsapp: req.user.whatsapp,
        lastLoginAt: req.user.lastLoginAt,
      },
    });
  }

  async myLogins(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const targetUserId = req.user.role === 'ADMIN' && req.query.userId
        ? String(req.query.userId)
        : req.user.id;

      const logins = await db.listUserLogins(targetUserId);
      return res.json({ logins });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const authController = new AuthController();
