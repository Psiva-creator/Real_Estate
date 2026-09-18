import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import {
  User,
  Owner,
  Property,
  PropertyDocument,
  Enquiry,
  PropertySearchParams,
  DocumentType,
  DocumentStatus,
  PropertyStatus,
  EnquiryStatus,
} from '../types/index.js';

// Phone number normalization helper
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;
  const stripped = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  if (/^\+91\d{10}$/.test(stripped)) {
    return stripped;
  }
  if (/^91\d{10}$/.test(stripped)) {
    return `+${stripped}`;
  }
  if (/^0\d{10}$/.test(stripped)) {
    return `+91${stripped.slice(1)}`;
  }
  if (/^\d{10}$/.test(stripped)) {
    return `+91${stripped}`;
  }
  return stripped;
}

export function getPhoneCandidates(phone: string): string[] {
  const trimmed = phone.trim();
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  const digitsOnly = trimmed.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);

  const candidates = new Set<string>();
  candidates.add(phone);
  candidates.add(trimmed);
  candidates.add(cleaned);

  if (last10.length === 10) {
    candidates.add(`+91${last10}`);
    candidates.add(`+91 ${last10}`);
    candidates.add(`91${last10}`);
    candidates.add(`91 ${last10}`);
    candidates.add(last10);
    candidates.add(`0${last10}`);
  }

  return Array.from(candidates).filter(Boolean);
}

// Row mapper helpers to convert PostgreSQL snake_case to application camelCase
function mapUserRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    phone: row.phone,
    whatsapp: row.whatsapp || undefined,
    role: row.role,
    passwordHash: row.password_hash || undefined,
    isActive: row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function mapOwnerRow(row: any): Owner {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    name: row.name,
    phone: row.phone,
    whatsapp: row.whatsapp || undefined,
    email: row.email || undefined,
    aadharNumber: row.aadhar_number || undefined,
    propertiesCount: parseInt(row.properties_count || '0', 10),
    dealsCompleted: parseInt(row.deals_completed || '0', 10),
    rating: parseFloat(row.rating || '5.0'),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function mapPropertyRow(row: any): Property {
  return {
    id: row.id,
    sellerId: row.seller_id,
    type: row.type,
    status: row.status,
    titleEn: row.title_en,
    titleTe: row.title_te || undefined,
    descriptionEn: row.description_en,
    descriptionTe: row.description_te || undefined,
    location: {
      village: row.village,
      mandal: row.mandal,
      district: row.district,
      latitude: row.latitude !== null && row.latitude !== undefined ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude !== null && row.longitude !== undefined ? parseFloat(row.longitude) : undefined,
      distanceFromOrrKm: row.distance_from_orr_km !== null && row.distance_from_orr_km !== undefined ? parseFloat(row.distance_from_orr_km) : undefined,
      zone: row.zone || undefined,
      tier: row.tier,
    },
    land: row.type === 'LAND' ? {
      totalAcres: row.total_acres !== null && row.total_acres !== undefined ? parseFloat(row.total_acres) : undefined,
      surveyNumbers: row.survey_numbers || [],
      soilType: row.soil_type || undefined,
      developmentLevel: row.development_level || undefined,
      roadWidthFt: row.road_width_ft !== null && row.road_width_ft !== undefined ? parseInt(row.road_width_ft, 10) : undefined,
      waterAvailable: !!row.water_available,
      electricityAvailable: !!row.electricity_available,
    } : undefined,
    flat: row.type === 'FLAT' ? {
      sqft: row.sqft !== null && row.sqft !== undefined ? parseInt(row.sqft, 10) : undefined,
      bedrooms: row.bedrooms !== null && row.bedrooms !== undefined ? parseInt(row.bedrooms, 10) : undefined,
      bathrooms: row.bathrooms !== null && row.bathrooms !== undefined ? parseInt(row.bathrooms, 10) : undefined,
      floor: row.floor !== null && row.floor !== undefined ? parseInt(row.floor, 10) : undefined,
      totalFloors: row.total_floors !== null && row.total_floors !== undefined ? parseInt(row.total_floors, 10) : undefined,
      amenities: row.amenities || [],
      possessionStatus: row.possession_status || undefined,
    } : undefined,
    pricing: {
      pricePerAcre: row.price_per_acre !== null && row.price_per_acre !== undefined ? parseFloat(row.price_per_acre) : undefined,
      pricePerSqft: row.price_per_sqft !== null && row.price_per_sqft !== undefined ? parseFloat(row.price_per_sqft) : undefined,
      totalPrice: parseFloat(row.total_price),
      outrate: row.outrate !== null && row.outrate !== undefined ? parseFloat(row.outrate) : undefined,
      halfDevelopmentValue: row.half_development_value !== null && row.half_development_value !== undefined ? parseFloat(row.half_development_value) : undefined,
      isNegotiable: !!row.is_negotiable,
    },
    mainImage: row.main_image,
    galleryImages: row.gallery_images || [],
    sitePlanImage: row.site_plan_image || undefined,
    isFeatured: !!row.is_featured,
    viewsCount: parseInt(row.views_count || '0', 10),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function mapDocumentRow(row: any): PropertyDocument {
  return {
    id: row.id,
    propertyId: row.property_id,
    documentType: row.document_type,
    fileUrl: row.file_url,
    status: row.status,
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at instanceof Date ? row.verified_at.toISOString() : (row.verified_at ? String(row.verified_at) : undefined),
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function mapEnquiryRow(row: any): Enquiry {
  return {
    id: row.id,
    propertyId: row.property_id,
    buyerName: row.buyer_name,
    phone: row.phone,
    whatsapp: row.whatsapp || undefined,
    enquiryType: row.enquiry_type,
    status: row.status,
    assignedTo: row.assigned_to || undefined,
    followUpDate: row.follow_up_date instanceof Date ? row.follow_up_date.toISOString() : (row.follow_up_date ? String(row.follow_up_date) : undefined),
    leadScore: parseInt(row.lead_score || '50', 10),
    notes: row.notes || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

class InMemoryStore {
  users: Map<string, User> = new Map();
  owners: Map<string, Owner> = new Map();
  properties: Map<string, Property> = new Map();
  propertyDocuments: Map<string, PropertyDocument> = new Map();
  enquiries: Map<string, Enquiry> = new Map();
}

class Database {
  private pool: Pool | null = null;
  private memory = new InMemoryStore();
  private isPostgresConnected = false;

  constructor() {
    if (config.databaseUrl) {
      try {
        const useSsl = config.dbSsl || config.databaseUrl.includes('sslmode=require') || config.databaseUrl.includes('ssl=true');
        this.pool = new Pool({
          connectionString: config.databaseUrl,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000,
        });
      } catch (err) {
        if (config.nodeEnv !== 'test') {
          console.error('CRITICAL: PostgreSQL pool initialization failed in production/development:', (err as Error).message);
          throw err;
        }
      }
    }
  }

  private testMemoryMode: boolean = false;

  enableTestMemoryMode(): void {
    this.testMemoryMode = true;
  }

  disableTestMemoryMode(): void {
    this.testMemoryMode = false;
  }

  // Returns true only when unit tests explicitly enable test memory mode
  private get isTestMemoryMode(): boolean {
    return this.testMemoryMode;
  }

  getPool(): Pool {
    return this.ensurePool();
  }

  async setConnectionString(connectionString: string): Promise<void> {
    if (this.pool) {
      await this.pool.end().catch(() => {});
    }
    const useSsl = config.dbSsl || connectionString.includes('sslmode=require') || connectionString.includes('ssl=true');
    this.pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });
    this.testMemoryMode = false;
    this.isPostgresConnected = false;
  }

  async cleanTestTables(): Promise<void> {
    const pool = this.ensurePool();
    const res = await pool.query('SELECT current_database();');
    const currentDb = res.rows[0].current_database;
    if (!currentDb.endsWith('_test')) {
      throw new Error(`SAFETY GUARD PREVENTED EXECUTION: Refusing to clean non-test database "${currentDb}". Integration tests must target a database ending in "_test"!`);
    }
    await pool.query(`
      TRUNCATE TABLE enquiries, property_documents, properties, owners, users RESTART IDENTITY CASCADE;
    `);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end().catch(() => {});
      this.pool = null;
      this.isPostgresConnected = false;
    }
  }

  private ensurePool(): Pool {
    if (!this.pool) {
      throw new Error('Database Error: PostgreSQL connection pool is not configured. Verify DATABASE_URL in environment.');
    }
    return this.pool;
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isPostgresConnected = true;
      return true;
    } catch (err) {
      this.isPostgresConnected = false;
      return false;
    }
  }

  get isPostgres(): boolean {
    return this.isPostgresConnected;
  }

  // ==========================================
  // USERS REPOSITORY
  // ==========================================
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (this.isTestMemoryMode) {
      const user: User = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memory.users.set(user.id, user);
      return user;
    }

    const pool = this.ensurePool();
    const query = `
      INSERT INTO users (name, email, phone, whatsapp, role, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      data.name,
      data.email || null,
      data.phone,
      data.whatsapp || null,
      data.role,
      data.passwordHash || null,
      data.isActive !== undefined ? data.isActive : true,
    ];

    try {
      const res = await pool.query(query, values);
      return mapUserRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL createUser error:', (err as Error).message);
      throw err;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isTestMemoryMode) {
      return this.memory.users.get(id) || null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapUserRow(res.rows[0]);
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    const candidates = getPhoneCandidates(phone);
    if (this.isTestMemoryMode) {
      for (const u of this.memory.users.values()) {
        const uCandidates = getPhoneCandidates(u.phone);
        if (candidates.some((c) => uCandidates.includes(c))) {
          return u;
        }
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query(
      'SELECT * FROM users WHERE phone = ANY($1::text[]) LIMIT 1',
      [candidates]
    );
    if (res.rows.length === 0) return null;
    return mapUserRow(res.rows[0]);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isTestMemoryMode) {
      for (const u of this.memory.users.values()) {
        if (u.email && u.email.toLowerCase() === email.toLowerCase()) return u;
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return null;
    return mapUserRow(res.rows[0]);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.users.get(id);
      if (!existing) throw new Error(`User ${id} not found`);
      const updated: User = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };
      this.memory.users.set(id, updated);
      return updated;
    }

    const pool = this.ensurePool();
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      setClauses.push(`email = $${idx++}`);
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      setClauses.push(`phone = $${idx++}`);
      values.push(updates.phone);
    }
    if (updates.whatsapp !== undefined) {
      setClauses.push(`whatsapp = $${idx++}`);
      values.push(updates.whatsapp);
    }
    if (updates.role !== undefined) {
      setClauses.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (updates.passwordHash !== undefined) {
      setClauses.push(`password_hash = $${idx++}`);
      values.push(updates.passwordHash);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${idx++}`);
      values.push(updates.isActive);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    try {
      const res = await pool.query(query, values);
      if (res.rows.length === 0) throw new Error(`User ${id} not found`);
      return mapUserRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL updateUser error:', (err as Error).message);
      throw err;
    }
  }

  async listUsers(): Promise<User[]> {
    if (this.isTestMemoryMode) {
      return Array.from(this.memory.users.values());
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map(mapUserRow);
  }

  // ==========================================
  // OWNERS / SELLERS REPOSITORY
  // ==========================================
  async createOwner(data: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Owner> {
    if (this.isTestMemoryMode) {
      const owner: Owner = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memory.owners.set(owner.id, owner);
      return owner;
    }

    const pool = this.ensurePool();
    const query = `
      INSERT INTO owners (user_id, name, phone, whatsapp, email, aadhar_number, properties_count, deals_completed, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      data.userId || null,
      data.name,
      data.phone,
      data.whatsapp || null,
      data.email || null,
      data.aadharNumber || null,
      data.propertiesCount || 0,
      data.dealsCompleted || 0,
      data.rating !== undefined ? data.rating : 5.0,
    ];

    try {
      const res = await pool.query(query, values);
      return mapOwnerRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL createOwner error:', (err as Error).message);
      throw err;
    }
  }

  async findOwnerById(id: string): Promise<Owner | null> {
    if (this.isTestMemoryMode) {
      return this.memory.owners.get(id) || null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM owners WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapOwnerRow(res.rows[0]);
  }

  async findOwnerByPhone(phone: string): Promise<Owner | null> {
    const candidates = getPhoneCandidates(phone);
    if (this.isTestMemoryMode) {
      for (const o of this.memory.owners.values()) {
        const oCandidates = getPhoneCandidates(o.phone);
        if (candidates.some((c) => oCandidates.includes(c))) {
          return o;
        }
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query(
      'SELECT * FROM owners WHERE phone = ANY($1::text[]) LIMIT 1',
      [candidates]
    );
    if (res.rows.length === 0) return null;
    return mapOwnerRow(res.rows[0]);
  }

  async findOwnerByEmail(email: string): Promise<Owner | null> {
    if (this.isTestMemoryMode) {
      for (const o of this.memory.owners.values()) {
        if (o.email && o.email.toLowerCase() === email.toLowerCase()) return o;
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM owners WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return null;
    return mapOwnerRow(res.rows[0]);
  }

  async findOwnerByUserId(userId: string): Promise<Owner | null> {
    if (this.isTestMemoryMode) {
      for (const o of this.memory.owners.values()) {
        if (o.userId === userId) return o;
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM owners WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) return null;
    return mapOwnerRow(res.rows[0]);
  }

  async listOwners(): Promise<Owner[]> {
    if (this.isTestMemoryMode) {
      return Array.from(this.memory.owners.values());
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM owners ORDER BY created_at DESC');
    return res.rows.map(mapOwnerRow);
  }

  async updateOwner(id: string, updates: Partial<Owner>): Promise<Owner> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.owners.get(id);
      if (!existing) throw new Error(`Owner ${id} not found`);
      const updated: Owner = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };
      this.memory.owners.set(id, updated);
      return updated;
    }

    const pool = this.ensurePool();
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (updates.userId !== undefined) {
      setClauses.push(`user_id = $${idx++}`);
      values.push(updates.userId);
    }
    if (updates.name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setClauses.push(`phone = $${idx++}`);
      values.push(updates.phone);
    }
    if (updates.whatsapp !== undefined) {
      setClauses.push(`whatsapp = $${idx++}`);
      values.push(updates.whatsapp);
    }
    if (updates.email !== undefined) {
      setClauses.push(`email = $${idx++}`);
      values.push(updates.email);
    }
    if (updates.aadharNumber !== undefined) {
      setClauses.push(`aadhar_number = $${idx++}`);
      values.push(updates.aadharNumber);
    }
    if (updates.propertiesCount !== undefined) {
      setClauses.push(`properties_count = $${idx++}`);
      values.push(updates.propertiesCount);
    }
    if (updates.dealsCompleted !== undefined) {
      setClauses.push(`deals_completed = $${idx++}`);
      values.push(updates.dealsCompleted);
    }
    if (updates.rating !== undefined) {
      setClauses.push(`rating = $${idx++}`);
      values.push(updates.rating);
    }

    values.push(id);
    const query = `
      UPDATE owners
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    try {
      const res = await pool.query(query, values);
      if (res.rows.length === 0) throw new Error(`Owner ${id} not found`);
      return mapOwnerRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL updateOwner error:', (err as Error).message);
      throw err;
    }
  }

  // ==========================================
  // PROPERTIES REPOSITORY (ACID Transactions)
  // ==========================================
  async createProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Promise<Property> {
    if (this.isTestMemoryMode) {
      const prop: Property = {
        ...data,
        id: uuidv4(),
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memory.properties.set(prop.id, prop);

      const owner = this.memory.owners.get(prop.sellerId);
      if (owner) {
        owner.propertiesCount = (owner.propertiesCount || 0) + 1;
        this.memory.owners.set(owner.id, owner);
      }
      return prop;
    }

    const pool = this.ensurePool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO properties (
          seller_id, type, status, title_en, title_te, description_en, description_te,
          village, mandal, district, latitude, longitude, distance_from_orr_km, zone, tier,
          total_acres, survey_numbers, soil_type, development_level, road_width_ft,
          water_available, electricity_available,
          sqft, bedrooms, bathrooms, floor, total_floors, amenities, possession_status,
          price_per_acre, price_per_sqft, total_price, outrate, half_development_value, is_negotiable,
          main_image, gallery_images, site_plan_image, is_featured, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, $22,
          $23, $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35,
          $36, $37, $38, $39, $40
        ) RETURNING *;
      `;

      const values = [
        data.sellerId,
        data.type,
        data.status || 'DRAFT',
        data.titleEn,
        data.titleTe || null,
        data.descriptionEn,
        data.descriptionTe || null,
        data.location.village,
        data.location.mandal,
        data.location.district,
        data.location.latitude ?? null,
        data.location.longitude ?? null,
        data.location.distanceFromOrrKm ?? null,
        data.location.zone || null,
        data.location.tier,
        data.land?.totalAcres ?? null,
        data.land?.surveyNumbers || null,
        data.land?.soilType || null,
        data.land?.developmentLevel || null,
        data.land?.roadWidthFt ?? null,
        data.land?.waterAvailable ?? false,
        data.land?.electricityAvailable ?? false,
        data.flat?.sqft ?? null,
        data.flat?.bedrooms ?? null,
        data.flat?.bathrooms ?? null,
        data.flat?.floor ?? null,
        data.flat?.totalFloors ?? null,
        data.flat?.amenities || null,
        data.flat?.possessionStatus || null,
        data.pricing.pricePerAcre ?? null,
        data.pricing.pricePerSqft ?? null,
        data.pricing.totalPrice,
        data.pricing.outrate ?? null,
        data.pricing.halfDevelopmentValue ?? null,
        data.pricing.isNegotiable ?? false,
        data.mainImage,
        data.galleryImages || [],
        data.sitePlanImage || null,
        data.isFeatured ?? false,
        0,
      ];

      const res = await client.query(insertQuery, values);
      const createdProp = mapPropertyRow(res.rows[0]);

      // Atomic update of owner properties count
      await client.query(
        'UPDATE owners SET properties_count = COALESCE(properties_count, 0) + 1, updated_at = NOW() WHERE id = $1',
        [data.sellerId]
      );

      await client.query('COMMIT');
      return createdProp;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('PostgreSQL createProperty transaction error:', (err as Error).message);
      throw err;
    } finally {
      client.release();
    }
  }

  async findPropertyById(id: string): Promise<Property | null> {
    if (this.isTestMemoryMode) {
      return this.memory.properties.get(id) || null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapPropertyRow(res.rows[0]);
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.properties.get(id);
      if (!existing) return null;
      const updated: Property = {
        ...existing,
        ...updates,
        location: updates.location ? { ...existing.location, ...updates.location } : existing.location,
        land: updates.land ? (existing.land ? { ...existing.land, ...updates.land } : updates.land) : existing.land,
        flat: updates.flat ? (existing.flat ? { ...existing.flat, ...updates.flat } : updates.flat) : existing.flat,
        pricing: updates.pricing ? { ...existing.pricing, ...updates.pricing } : existing.pricing,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };
      this.memory.properties.set(id, updated);
      return updated;
    }

    const pool = this.ensurePool();
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (updates.sellerId !== undefined) {
      setClauses.push(`seller_id = $${idx++}`);
      values.push(updates.sellerId);
    }
    if (updates.type !== undefined) {
      setClauses.push(`type = $${idx++}`);
      values.push(updates.type);
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.titleEn !== undefined) {
      setClauses.push(`title_en = $${idx++}`);
      values.push(updates.titleEn);
    }
    if (updates.titleTe !== undefined) {
      setClauses.push(`title_te = $${idx++}`);
      values.push(updates.titleTe);
    }
    if (updates.descriptionEn !== undefined) {
      setClauses.push(`description_en = $${idx++}`);
      values.push(updates.descriptionEn);
    }
    if (updates.descriptionTe !== undefined) {
      setClauses.push(`description_te = $${idx++}`);
      values.push(updates.descriptionTe);
    }
    if (updates.location?.village !== undefined) {
      setClauses.push(`village = $${idx++}`);
      values.push(updates.location.village);
    }
    if (updates.location?.mandal !== undefined) {
      setClauses.push(`mandal = $${idx++}`);
      values.push(updates.location.mandal);
    }
    if (updates.location?.district !== undefined) {
      setClauses.push(`district = $${idx++}`);
      values.push(updates.location.district);
    }
    if (updates.location?.latitude !== undefined) {
      setClauses.push(`latitude = $${idx++}`);
      values.push(updates.location.latitude);
    }
    if (updates.location?.longitude !== undefined) {
      setClauses.push(`longitude = $${idx++}`);
      values.push(updates.location.longitude);
    }
    if (updates.location?.distanceFromOrrKm !== undefined) {
      setClauses.push(`distance_from_orr_km = $${idx++}`);
      values.push(updates.location.distanceFromOrrKm);
    }
    if (updates.location?.zone !== undefined) {
      setClauses.push(`zone = $${idx++}`);
      values.push(updates.location.zone);
    }
    if (updates.location?.tier !== undefined) {
      setClauses.push(`tier = $${idx++}`);
      values.push(updates.location.tier);
    }
    if (updates.land?.totalAcres !== undefined) {
      setClauses.push(`total_acres = $${idx++}`);
      values.push(updates.land.totalAcres);
    }
    if (updates.land?.surveyNumbers !== undefined) {
      setClauses.push(`survey_numbers = $${idx++}`);
      values.push(updates.land.surveyNumbers);
    }
    if (updates.land?.soilType !== undefined) {
      setClauses.push(`soil_type = $${idx++}`);
      values.push(updates.land.soilType);
    }
    if (updates.land?.developmentLevel !== undefined) {
      setClauses.push(`development_level = $${idx++}`);
      values.push(updates.land.developmentLevel);
    }
    if (updates.land?.roadWidthFt !== undefined) {
      setClauses.push(`road_width_ft = $${idx++}`);
      values.push(updates.land.roadWidthFt);
    }
    if (updates.land?.waterAvailable !== undefined) {
      setClauses.push(`water_available = $${idx++}`);
      values.push(updates.land.waterAvailable);
    }
    if (updates.land?.electricityAvailable !== undefined) {
      setClauses.push(`electricity_available = $${idx++}`);
      values.push(updates.land.electricityAvailable);
    }
    if (updates.flat?.sqft !== undefined) {
      setClauses.push(`sqft = $${idx++}`);
      values.push(updates.flat.sqft);
    }
    if (updates.flat?.bedrooms !== undefined) {
      setClauses.push(`bedrooms = $${idx++}`);
      values.push(updates.flat.bedrooms);
    }
    if (updates.flat?.bathrooms !== undefined) {
      setClauses.push(`bathrooms = $${idx++}`);
      values.push(updates.flat.bathrooms);
    }
    if (updates.flat?.floor !== undefined) {
      setClauses.push(`floor = $${idx++}`);
      values.push(updates.flat.floor);
    }
    if (updates.flat?.totalFloors !== undefined) {
      setClauses.push(`total_floors = $${idx++}`);
      values.push(updates.flat.totalFloors);
    }
    if (updates.flat?.amenities !== undefined) {
      setClauses.push(`amenities = $${idx++}`);
      values.push(updates.flat.amenities);
    }
    if (updates.flat?.possessionStatus !== undefined) {
      setClauses.push(`possession_status = $${idx++}`);
      values.push(updates.flat.possessionStatus);
    }
    if (updates.pricing?.pricePerAcre !== undefined) {
      setClauses.push(`price_per_acre = $${idx++}`);
      values.push(updates.pricing.pricePerAcre);
    }
    if (updates.pricing?.pricePerSqft !== undefined) {
      setClauses.push(`price_per_sqft = $${idx++}`);
      values.push(updates.pricing.pricePerSqft);
    }
    if (updates.pricing?.totalPrice !== undefined) {
      setClauses.push(`total_price = $${idx++}`);
      values.push(updates.pricing.totalPrice);
    }
    if (updates.pricing?.outrate !== undefined) {
      setClauses.push(`outrate = $${idx++}`);
      values.push(updates.pricing.outrate);
    }
    if (updates.pricing?.halfDevelopmentValue !== undefined) {
      setClauses.push(`half_development_value = $${idx++}`);
      values.push(updates.pricing.halfDevelopmentValue);
    }
    if (updates.pricing?.isNegotiable !== undefined) {
      setClauses.push(`is_negotiable = $${idx++}`);
      values.push(updates.pricing.isNegotiable);
    }
    if (updates.mainImage !== undefined) {
      setClauses.push(`main_image = $${idx++}`);
      values.push(updates.mainImage);
    }
    if (updates.galleryImages !== undefined) {
      setClauses.push(`gallery_images = $${idx++}`);
      values.push(updates.galleryImages);
    }
    if (updates.sitePlanImage !== undefined) {
      setClauses.push(`site_plan_image = $${idx++}`);
      values.push(updates.sitePlanImage);
    }
    if (updates.isFeatured !== undefined) {
      setClauses.push(`is_featured = $${idx++}`);
      values.push(updates.isFeatured);
    }
    if (updates.viewsCount !== undefined) {
      setClauses.push(`views_count = $${idx++}`);
      values.push(updates.viewsCount);
    }

    values.push(id);
    const query = `
      UPDATE properties
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    try {
      const res = await pool.query(query, values);
      if (res.rows.length === 0) return null;
      return mapPropertyRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL updateProperty error:', (err as Error).message);
      throw err;
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.properties.get(id);
      if (!existing) return false;
      this.memory.properties.delete(id);

      const owner = this.memory.owners.get(existing.sellerId);
      if (owner && (owner.propertiesCount || 0) > 0) {
        owner.propertiesCount = owner.propertiesCount - 1;
        this.memory.owners.set(owner.id, owner);
      }

      for (const [docId, doc] of this.memory.propertyDocuments.entries()) {
        if (doc.propertyId === id) {
          this.memory.propertyDocuments.delete(docId);
        }
      }

      for (const [enqId, enq] of this.memory.enquiries.entries()) {
        if (enq.propertyId === id) {
          this.memory.enquiries.delete(enqId);
        }
      }

      return true;
    }

    const pool = this.ensurePool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const propRes = await client.query('SELECT seller_id FROM properties WHERE id = $1', [id]);
      if (propRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const sellerId = propRes.rows[0].seller_id;

      // Delete property (PostgreSQL CASCADE foreign keys automatically delete documents and enquiries)
      await client.query('DELETE FROM properties WHERE id = $1', [id]);

      // Decrement owner properties count
      await client.query(
        'UPDATE owners SET properties_count = GREATEST(COALESCE(properties_count, 0) - 1, 0), updated_at = NOW() WHERE id = $1',
        [sellerId]
      );

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('PostgreSQL deleteProperty transaction error:', (err as Error).message);
      throw err;
    } finally {
      client.release();
    }
  }

  async incrementPropertyViews(id: string): Promise<void> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.properties.get(id);
      if (existing) {
        existing.viewsCount = (existing.viewsCount || 0) + 1;
        this.memory.properties.set(id, existing);
      }
      return;
    }

    const pool = this.ensurePool();
    await pool.query('UPDATE properties SET views_count = COALESCE(views_count, 0) + 1, updated_at = NOW() WHERE id = $1', [id]);
  }

  async searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
    if (this.isTestMemoryMode) {
      let results = Array.from(this.memory.properties.values());
      if (params.status) {
        results = results.filter((p) => p.status === params.status);
      } else {
        results = results.filter((p) => p.status === 'LIVE');
      }
      if (params.type) results = results.filter((p) => p.type === params.type);
      if (params.tier) results = results.filter((p) => p.location.tier === params.tier);
      if (params.district) {
        const d = params.district.toLowerCase();
        results = results.filter((p) => p.location.district.toLowerCase().includes(d));
      }
      if (params.mandal) {
        const m = params.mandal.toLowerCase();
        results = results.filter((p) => p.location.mandal.toLowerCase().includes(m));
      }
      if (params.village) {
        const v = params.village.toLowerCase();
        results = results.filter((p) => p.location.village.toLowerCase().includes(v));
      }
      if (params.zone) {
        const z = params.zone.toLowerCase();
        results = results.filter((p) => p.location.zone && p.location.zone.toLowerCase().includes(z));
      }
      if (params.minPrice !== undefined) results = results.filter((p) => p.pricing.totalPrice >= params.minPrice!);
      if (params.maxPrice !== undefined) results = results.filter((p) => p.pricing.totalPrice <= params.maxPrice!);
      if (params.minAcres !== undefined) results = results.filter((p) => p.land?.totalAcres !== undefined && p.land.totalAcres >= params.minAcres!);
      if (params.maxAcres !== undefined) results = results.filter((p) => p.land?.totalAcres !== undefined && p.land.totalAcres <= params.maxAcres!);
      if (params.minBedrooms !== undefined) results = results.filter((p) => p.flat?.bedrooms !== undefined && p.flat.bedrooms >= params.minBedrooms!);
      if (params.maxBedrooms !== undefined) results = results.filter((p) => p.flat?.bedrooms !== undefined && p.flat.bedrooms <= params.maxBedrooms!);
      if (params.maxDistanceOrr !== undefined) {
        results = results.filter((p) => p.location.distanceFromOrrKm !== undefined && p.location.distanceFromOrrKm <= params.maxDistanceOrr!);
      }

      switch (params.sortBy) {
        case 'price_asc': results.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice); break;
        case 'price_desc': results.sort((a, b) => b.pricing.totalPrice - a.pricing.totalPrice); break;
        case 'orr_distance': results.sort((a, b) => (a.location.distanceFromOrrKm || 999) - (b.location.distanceFromOrrKm || 999)); break;
        case 'views': results.sort((a, b) => b.viewsCount - a.viewsCount); break;
        case 'newest':
        default: results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      }

      const total = results.length;
      const page = Math.max(1, params.page || 1);
      const limit = Math.max(1, Math.min(50, params.limit || 10));
      const offset = (page - 1) * limit;
      return { properties: results.slice(offset, offset + limit), total };
    }

    const pool = this.ensurePool();
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.status) {
      conditions.push(`status = $${idx++}`);
      values.push(params.status);
    } else {
      conditions.push(`status = 'LIVE'`);
    }

    if (params.type) {
      conditions.push(`type = $${idx++}`);
      values.push(params.type);
    }
    if (params.tier) {
      conditions.push(`tier = $${idx++}`);
      values.push(params.tier);
    }
    if (params.district) {
      conditions.push(`LOWER(district) LIKE $${idx++}`);
      values.push(`%${params.district.toLowerCase()}%`);
    }
    if (params.mandal) {
      conditions.push(`LOWER(mandal) LIKE $${idx++}`);
      values.push(`%${params.mandal.toLowerCase()}%`);
    }
    if (params.village) {
      conditions.push(`LOWER(village) LIKE $${idx++}`);
      values.push(`%${params.village.toLowerCase()}%`);
    }
    if (params.zone) {
      conditions.push(`LOWER(zone) LIKE $${idx++}`);
      values.push(`%${params.zone.toLowerCase()}%`);
    }
    if (params.minPrice !== undefined) {
      conditions.push(`total_price >= $${idx++}`);
      values.push(params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      conditions.push(`total_price <= $${idx++}`);
      values.push(params.maxPrice);
    }
    if (params.minAcres !== undefined) {
      conditions.push(`total_acres >= $${idx++}`);
      values.push(params.minAcres);
    }
    if (params.maxAcres !== undefined) {
      conditions.push(`total_acres <= $${idx++}`);
      values.push(params.maxAcres);
    }
    if (params.minBedrooms !== undefined) {
      conditions.push(`bedrooms >= $${idx++}`);
      values.push(params.minBedrooms);
    }
    if (params.maxBedrooms !== undefined) {
      conditions.push(`bedrooms <= $${idx++}`);
      values.push(params.maxBedrooms);
    }
    if (params.maxDistanceOrr !== undefined) {
      conditions.push(`distance_from_orr_km <= $${idx++}`);
      values.push(params.maxDistanceOrr);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY created_at DESC';
    switch (params.sortBy) {
      case 'price_asc': orderBy = 'ORDER BY total_price ASC'; break;
      case 'price_desc': orderBy = 'ORDER BY total_price DESC'; break;
      case 'orr_distance': orderBy = 'ORDER BY distance_from_orr_km ASC NULLS LAST'; break;
      case 'views': orderBy = 'ORDER BY views_count DESC'; break;
      case 'newest':
      default: orderBy = 'ORDER BY created_at DESC'; break;
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const offset = (page - 1) * limit;

    try {
      // 1. Total count
      const countRes = await pool.query(`SELECT COUNT(*) as total FROM properties ${whereClause}`, values);
      const total = parseInt(countRes.rows[0].total, 10);

      // 2. Data rows
      const dataQuery = `
        SELECT * FROM properties
        ${whereClause}
        ${orderBy}
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      const dataRes = await pool.query(dataQuery, [...values, limit, offset]);
      const properties = dataRes.rows.map(mapPropertyRow);

      return { properties, total };
    } catch (err) {
      console.error('PostgreSQL searchProperties error:', (err as Error).message);
      throw err;
    }
  }

  async listAllProperties(): Promise<Property[]> {
    if (this.isTestMemoryMode) {
      return Array.from(this.memory.properties.values());
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    return res.rows.map(mapPropertyRow);
  }

  // ==========================================
  // PROPERTY DOCUMENTS REPOSITORY
  // ==========================================
  async upsertDocument(
    data: Omit<PropertyDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PropertyDocument> {
    if (this.isTestMemoryMode) {
      let existingDoc: PropertyDocument | null = null;
      for (const doc of this.memory.propertyDocuments.values()) {
        if (doc.propertyId === data.propertyId && doc.documentType === data.documentType) {
          existingDoc = doc;
          break;
        }
      }

      if (existingDoc) {
        const updated: PropertyDocument = {
          ...existingDoc,
          ...data,
          verifiedBy: data.verifiedBy || undefined,
          verifiedAt: data.verifiedAt || undefined,
          rejectionReason: data.rejectionReason || undefined,
          updatedAt: new Date().toISOString(),
        };
        this.memory.propertyDocuments.set(existingDoc.id, updated);
        return updated;
      } else {
        const newDoc: PropertyDocument = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.memory.propertyDocuments.set(newDoc.id, newDoc);
        return newDoc;
      }
    }

    const pool = this.ensurePool();
    const query = `
      INSERT INTO property_documents (
        property_id, document_type, file_url, status, verified_by, verified_at, rejection_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (property_id, document_type)
      DO UPDATE SET
        file_url = EXCLUDED.file_url,
        status = EXCLUDED.status,
        verified_by = EXCLUDED.verified_by,
        verified_at = EXCLUDED.verified_at,
        rejection_reason = EXCLUDED.rejection_reason,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      data.propertyId,
      data.documentType,
      data.fileUrl,
      data.status,
      data.verifiedBy || null,
      data.verifiedAt || null,
      data.rejectionReason || null,
    ];

    try {
      const res = await pool.query(query, values);
      return mapDocumentRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL upsertDocument error:', (err as Error).message);
      throw err;
    }
  }

  async findDocumentsByPropertyId(propertyId: string): Promise<PropertyDocument[]> {
    if (this.isTestMemoryMode) {
      const list: PropertyDocument[] = [];
      for (const doc of this.memory.propertyDocuments.values()) {
        if (doc.propertyId === propertyId) list.push(doc);
      }
      return list;
    }

    const pool = this.ensurePool();
    const res = await pool.query(
      'SELECT * FROM property_documents WHERE property_id = $1 ORDER BY created_at ASC',
      [propertyId]
    );
    return res.rows.map(mapDocumentRow);
  }

  async findDocument(propertyId: string, docType: DocumentType): Promise<PropertyDocument | null> {
    if (this.isTestMemoryMode) {
      for (const doc of this.memory.propertyDocuments.values()) {
        if (doc.propertyId === propertyId && doc.documentType === docType) return doc;
      }
      return null;
    }

    const pool = this.ensurePool();
    const res = await pool.query(
      'SELECT * FROM property_documents WHERE property_id = $1 AND document_type = $2',
      [propertyId, docType]
    );
    if (res.rows.length === 0) return null;
    return mapDocumentRow(res.rows[0]);
  }

  // ==========================================
  // ENQUIRIES REPOSITORY
  // ==========================================
  async createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
    if (this.isTestMemoryMode) {
      const enquiry: Enquiry = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memory.enquiries.set(enquiry.id, enquiry);
      return enquiry;
    }

    const pool = this.ensurePool();
    const query = `
      INSERT INTO enquiries (
        property_id, buyer_name, phone, whatsapp, enquiry_type, status, assigned_to, follow_up_date, lead_score, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      data.propertyId,
      data.buyerName,
      data.phone,
      data.whatsapp || null,
      data.enquiryType,
      data.status || 'NEW',
      data.assignedTo || null,
      data.followUpDate || null,
      data.leadScore !== undefined ? data.leadScore : 50,
      data.notes || null,
    ];

    try {
      const res = await pool.query(query, values);
      return mapEnquiryRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL createEnquiry error:', (err as Error).message);
      throw err;
    }
  }

  async findEnquiryById(id: string): Promise<Enquiry | null> {
    if (this.isTestMemoryMode) {
      return this.memory.enquiries.get(id) || null;
    }

    const pool = this.ensurePool();
    const res = await pool.query('SELECT * FROM enquiries WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapEnquiryRow(res.rows[0]);
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
    if (this.isTestMemoryMode) {
      const existing = this.memory.enquiries.get(id);
      if (!existing) return null;
      const updated: Enquiry = {
        ...existing,
        ...updates,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };
      this.memory.enquiries.set(id, updated);
      return updated;
    }

    const pool = this.ensurePool();
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.assignedTo !== undefined) {
      setClauses.push(`assigned_to = $${idx++}`);
      values.push(updates.assignedTo);
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${idx++}`);
      values.push(updates.notes);
    }
    if (updates.followUpDate !== undefined) {
      setClauses.push(`follow_up_date = $${idx++}`);
      values.push(updates.followUpDate);
    }
    if (updates.leadScore !== undefined) {
      setClauses.push(`lead_score = $${idx++}`);
      values.push(updates.leadScore);
    }

    values.push(id);
    const query = `
      UPDATE enquiries
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    try {
      const res = await pool.query(query, values);
      if (res.rows.length === 0) return null;
      return mapEnquiryRow(res.rows[0]);
    } catch (err) {
      console.error('PostgreSQL updateEnquiry error:', (err as Error).message);
      throw err;
    }
  }

  async listEnquiries(filter?: {
    status?: string;
    assignedTo?: string;
    propertyId?: string;
  }): Promise<Enquiry[]> {
    if (this.isTestMemoryMode) {
      let list = Array.from(this.memory.enquiries.values());
      if (filter?.status) list = list.filter((e) => e.status === filter.status);
      if (filter?.assignedTo) list = list.filter((e) => e.assignedTo === filter.assignedTo);
      if (filter?.propertyId) list = list.filter((e) => e.propertyId === filter.propertyId);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const pool = this.ensurePool();
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filter?.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filter.status);
    }
    if (filter?.assignedTo) {
      conditions.push(`assigned_to = $${idx++}`);
      values.push(filter.assignedTo);
    }
    if (filter?.propertyId) {
      conditions.push(`property_id = $${idx++}`);
      values.push(filter.propertyId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM enquiries ${whereClause} ORDER BY created_at DESC;`;

    try {
      const res = await pool.query(query, values);
      return res.rows.map(mapEnquiryRow);
    } catch (err) {
      console.error('PostgreSQL listEnquiries error:', (err as Error).message);
      throw err;
    }
  }

  // Convenience methods & aliases
  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<Property> {
    const updated = await this.updateProperty(id, { status });
    if (!updated) {
      throw new Error(`Property ${id} not found`);
    }
    return updated;
  }

  async updateDocumentStatus(
    propertyId: string,
    docType: DocumentType,
    status: DocumentStatus,
    verifiedBy?: string,
    rejectionReason?: string
  ): Promise<PropertyDocument> {
    if (this.isTestMemoryMode) {
      const doc = await this.findDocument(propertyId, docType);
      if (!doc) {
        throw new Error(`Document ${docType} not found for property ${propertyId}`);
      }
      doc.status = status;
      doc.verifiedBy = verifiedBy;
      doc.verifiedAt = status === 'VERIFIED' ? new Date().toISOString() : undefined;
      doc.rejectionReason = rejectionReason;
      doc.updatedAt = new Date().toISOString();
      this.memory.propertyDocuments.set(doc.id, doc);
      return doc;
    }

    const pool = this.ensurePool();
    const verifiedAt = status === 'VERIFIED' ? new Date().toISOString() : null;
    const query = `
      UPDATE property_documents
      SET status = $1, verified_by = $2, verified_at = $3, rejection_reason = $4, updated_at = NOW()
      WHERE property_id = $5 AND document_type = $6
      RETURNING *;
    `;
    const values = [status, verifiedBy || null, verifiedAt, rejectionReason || null, propertyId, docType];
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error(`Document ${docType} not found for property ${propertyId}`);
    }
    return mapDocumentRow(res.rows[0]);
  }

  async assignEnquiry(id: string, assignedTo: string): Promise<Enquiry> {
    const updated = await this.updateEnquiry(id, { assignedTo, status: 'ASSIGNED' });
    if (!updated) {
      throw new Error(`Enquiry ${id} not found`);
    }
    return updated;
  }

  async updateEnquiryStatus(id: string, status: EnquiryStatus, followUpDate?: string): Promise<Enquiry> {
    const updated = await this.updateEnquiry(id, { status, followUpDate });
    if (!updated) {
      throw new Error(`Enquiry ${id} not found`);
    }
    return updated;
  }

  // Repository aliases for test suites & consistency
  getUserById = this.findUserById.bind(this);
  getUserByEmail = this.findUserByEmail.bind(this);
  getUserByPhone = this.findUserByPhone.bind(this);
  getOwnerById = this.findOwnerById.bind(this);
  getOwnerByUserId = this.findOwnerByUserId.bind(this);
  getOwnerByEmail = this.findOwnerByEmail.bind(this);
  getPropertyById = this.findPropertyById.bind(this);
  upsertPropertyDocument = this.upsertDocument.bind(this);
  getDocumentsByPropertyId = this.findDocumentsByPropertyId.bind(this);
  getDocument = this.findDocument.bind(this);
  getEnquiryById = this.findEnquiryById.bind(this);

  // Helper for test resets
  clear() {
    this.memory = new InMemoryStore();
  }
}

export const db = new Database();
