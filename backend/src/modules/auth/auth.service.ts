import { db } from '../../db/database.js';
import { hashPassword, comparePassword, generateToken } from '../../middleware/auth.js';
import { User, UserRole } from '../../types/index.js';

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  whatsapp?: string;
  role?: UserRole;
}

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;
  // Remove all whitespace, hyphens, parentheses, dots
  const stripped = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // If format is +91 followed by 10 digits
  if (/^\+91\d{10}$/.test(stripped)) {
    return stripped;
  }
  // If format is 91 followed by 10 digits (12 digits total)
  if (/^91\d{10}$/.test(stripped)) {
    return `+${stripped}`;
  }
  // If format is 0 followed by 10 digits (11 digits total)
  if (/^0\d{10}$/.test(stripped)) {
    return `+91${stripped.slice(1)}`;
  }
  // If format is 10 digits
  if (/^\d{10}$/.test(stripped)) {
    return `+91${stripped}`;
  }
  return stripped;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    if (!input.name || !input.phone) {
      throw new Error('Name and phone number are required');
    }

    const normalizedPhone = normalizePhoneNumber(input.phone);
    const existingPhone = await db.findUserByPhone(input.phone);
    if (existingPhone) {
      throw new Error(`An account with phone number ${input.phone} already exists`);
    }

    if (input.email) {
      const existingEmail = await db.findUserByEmail(input.email);
      if (existingEmail) {
        throw new Error(`An account with email ${input.email} already exists`);
      }
    }

    const passwordHash = input.password ? await hashPassword(input.password) : undefined;
    
    // Disallow self-registering as ADMIN or AGENT via public registration
    let role: UserRole = 'SELLER';
    if (input.role) {
      if (input.role === 'ADMIN' || input.role === 'AGENT') {
        throw new Error('Unauthorized: Cannot self-register as ADMIN or AGENT role');
      }
      role = input.role;
    }

    const user = await db.createUser({
      name: input.name,
      phone: normalizedPhone,
      email: input.email,
      whatsapp: input.whatsapp ? normalizePhoneNumber(input.whatsapp) : normalizedPhone,
      passwordHash,
      role,
      isActive: true,
    });

    // If registered as seller, link existing owner entry or create new one
    if (role === 'SELLER') {
      const existingOwner =
        (await db.findOwnerByPhone(user.phone)) ||
        (user.email ? await db.findOwnerByEmail(user.email) : null);
      if (existingOwner) {
        await db.updateOwner(existingOwner.id, {
          userId: user.id,
          name: user.name || existingOwner.name,
          email: user.email || existingOwner.email,
          whatsapp: user.whatsapp || existingOwner.whatsapp,
        });
      } else {
        await db.createOwner({
          userId: user.id,
          name: user.name,
          phone: user.phone,
          whatsapp: user.whatsapp,
          email: user.email,
          propertiesCount: 0,
          dealsCompleted: 0,
          rating: 5.0,
        });
      }
    }

    const token = generateToken(user);
    return { user, token };
  }

  async login(
    identifier: string,
    password?: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: User; token: string }> {
    let user: User | null = null;
    const trimmed = identifier.trim();

    if (trimmed.toLowerCase() === 'admin') {
      user = await db.findUserByEmail('admin@telanganarealty.in');
    } else if (trimmed.toLowerCase() === 'seller') {
      user = await db.findUserByEmail('kvrao.hyderabad@gmail.com');
    } else if (trimmed.includes('@')) {
      user = await db.findUserByEmail(trimmed);
    } else {
      const normalizedPhone = normalizePhoneNumber(trimmed);
      user = await db.findUserByPhone(normalizedPhone);
      if (!user && normalizedPhone !== trimmed) {
        user = await db.findUserByPhone(trimmed);
      }
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.passwordHash) {
      if (!password) {
        throw new Error('Password is required');
      }
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        // Record failed attempt in audit log
        try {
          await db.recordLogin({
            userId: user.id,
            identifier: trimmed,
            role: user.role,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
            status: 'FAILED',
          });
        } catch {}
        throw new Error('Invalid credentials');
      }
    }

    // 1. Update user last_login_at timestamp in database
    try {
      await db.updateLastLogin(user.id);
      user.lastLoginAt = new Date().toISOString();
    } catch (err) {
      console.warn('Could not update last_login_at:', (err as Error).message);
    }

    // 2. Insert login event in user_logins audit table in database
    try {
      await db.recordLogin({
        userId: user.id,
        identifier: trimmed,
        role: user.role,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        status: 'SUCCESS',
      });
    } catch (err) {
      console.warn('Could not record login in user_logins table:', (err as Error).message);
    }

    const token = generateToken(user);
    return { user, token };
  }

  async googleLogin(
    _input: { email?: string; name?: string; picture?: string; credential?: string },
    _meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: User; token: string; isNewUser: boolean }> {
    throw new Error(
      'Google OAuth is not configured on this server. Please sign in using your registered phone or email and password.'
    );
  }
}

export const authService = new AuthService();
