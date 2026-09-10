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

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    if (!input.name || !input.phone) {
      throw new Error('Name and phone number are required');
    }

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
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp || input.phone,
      passwordHash,
      role,
      isActive: true,
    });

    // If registered as seller, create owner entry
    if (role === 'SELLER') {
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

    const token = generateToken(user);
    return { user, token };
  }

  async login(identifier: string, password?: string): Promise<{ user: User; token: string }> {
    let user: User | null = null;

    if (identifier.includes('@')) {
      user = await db.findUserByEmail(identifier);
    } else {
      user = await db.findUserByPhone(identifier);
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
        throw new Error('Invalid credentials');
      }
    }

    const token = generateToken(user);
    return { user, token };
  }
}

export const authService = new AuthService();
