import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { authService } from './auth.service.js';

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

      const result = await authService.login(loginId, password);

      return res.json({
        message: 'Login successful',
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
      return res.status(401).json({ error: (err as Error).message });
    }
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
      },
    });
  }
}

export const authController = new AuthController();
