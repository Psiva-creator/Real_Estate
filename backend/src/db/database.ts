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
} from '../types/index.js';

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
    // Attempt PostgreSQL connection if configured
    if (config.databaseUrl) {
      try {
        this.pool = new Pool({
          connectionString: config.databaseUrl,
          ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 2000,
        });
      } catch (err) {
        console.warn('PostgreSQL pool init skipped, using memory store:', err);
      }
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isPostgresConnected = true;
      return true;
    } catch {
      this.isPostgresConnected = false;
      return false;
    }
  }

  get isPostgres(): boolean {
    return this.isPostgresConnected;
  }

  // --- USERS REPOSITORY ---
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memory.users.set(user.id, user);
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.memory.users.get(id) || null;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    for (const u of this.memory.users.values()) {
      if (u.phone === phone) return u;
    }
    return null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    for (const u of this.memory.users.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.memory.users.values());
  }

  // --- OWNERS / SELLERS REPOSITORY ---
  async createOwner(data: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Owner> {
    const owner: Owner = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memory.owners.set(owner.id, owner);
    return owner;
  }

  async findOwnerById(id: string): Promise<Owner | null> {
    return this.memory.owners.get(id) || null;
  }

  async findOwnerByPhone(phone: string): Promise<Owner | null> {
    for (const o of this.memory.owners.values()) {
      if (o.phone === phone) return o;
    }
    return null;
  }

  async findOwnerByUserId(userId: string): Promise<Owner | null> {
    for (const o of this.memory.owners.values()) {
      if (o.userId === userId) return o;
    }
    return null;
  }

  async listOwners(): Promise<Owner[]> {
    return Array.from(this.memory.owners.values());
  }

  // --- PROPERTIES REPOSITORY ---
  async createProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Promise<Property> {
    const prop: Property = {
      ...data,
      id: uuidv4(),
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memory.properties.set(prop.id, prop);

    // Update owner properties count
    const owner = this.memory.owners.get(prop.sellerId);
    if (owner) {
      owner.propertiesCount = (owner.propertiesCount || 0) + 1;
      this.memory.owners.set(owner.id, owner);
    }

    return prop;
  }

  async findPropertyById(id: string): Promise<Property | null> {
    return this.memory.properties.get(id) || null;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    const existing = this.memory.properties.get(id);
    if (!existing) return null;
    const updated: Property = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.memory.properties.set(id, updated);
    return updated;
  }

  async incrementPropertyViews(id: string): Promise<void> {
    const existing = this.memory.properties.get(id);
    if (existing) {
      existing.viewsCount = (existing.viewsCount || 0) + 1;
      this.memory.properties.set(id, existing);
    }
  }

  async searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
    let results = Array.from(this.memory.properties.values());

    // Status filter: default to LIVE if not explicitly requested
    if (params.status) {
      results = results.filter((p) => p.status === params.status);
    } else {
      results = results.filter((p) => p.status === 'LIVE');
    }

    if (params.type) {
      results = results.filter((p) => p.type === params.type);
    }

    if (params.tier) {
      results = results.filter((p) => p.location.tier === params.tier);
    }

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

    if (params.minPrice !== undefined) {
      results = results.filter((p) => p.pricing.totalPrice >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      results = results.filter((p) => p.pricing.totalPrice <= params.maxPrice!);
    }

    if (params.minAcres !== undefined) {
      results = results.filter((p) => p.land?.totalAcres !== undefined && p.land.totalAcres >= params.minAcres!);
    }

    if (params.maxAcres !== undefined) {
      results = results.filter((p) => p.land?.totalAcres !== undefined && p.land.totalAcres <= params.maxAcres!);
    }

    if (params.minBedrooms !== undefined) {
      results = results.filter((p) => p.flat?.bedrooms !== undefined && p.flat.bedrooms >= params.minBedrooms!);
    }

    if (params.maxBedrooms !== undefined) {
      results = results.filter((p) => p.flat?.bedrooms !== undefined && p.flat.bedrooms <= params.maxBedrooms!);
    }

    if (params.maxDistanceOrr !== undefined) {
      results = results.filter(
        (p) => p.location.distanceFromOrrKm !== undefined && p.location.distanceFromOrrKm <= params.maxDistanceOrr!
      );
    }

    // Sort
    switch (params.sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);
        break;
      case 'price_desc':
        results.sort((a, b) => b.pricing.totalPrice - a.pricing.totalPrice);
        break;
      case 'orr_distance':
        results.sort((a, b) => (a.location.distanceFromOrrKm || 999) - (b.location.distanceFromOrrKm || 999));
        break;
      case 'views':
        results.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = results.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const offset = (page - 1) * limit;
    const paginated = results.slice(offset, offset + limit);

    return { properties: paginated, total };
  }

  async listAllProperties(): Promise<Property[]> {
    return Array.from(this.memory.properties.values());
  }

  // --- PROPERTY DOCUMENTS REPOSITORY ---
  async upsertDocument(
    data: Omit<PropertyDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PropertyDocument> {
    // Check if doc exists for this property and doc type
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

  async findDocumentsByPropertyId(propertyId: string): Promise<PropertyDocument[]> {
    const list: PropertyDocument[] = [];
    for (const doc of this.memory.propertyDocuments.values()) {
      if (doc.propertyId === propertyId) list.push(doc);
    }
    return list;
  }

  async findDocument(propertyId: string, docType: DocumentType): Promise<PropertyDocument | null> {
    for (const doc of this.memory.propertyDocuments.values()) {
      if (doc.propertyId === propertyId && doc.documentType === docType) return doc;
    }
    return null;
  }

  // --- ENQUIRIES REPOSITORY ---
  async createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
    const enquiry: Enquiry = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memory.enquiries.set(enquiry.id, enquiry);
    return enquiry;
  }

  async findEnquiryById(id: string): Promise<Enquiry | null> {
    return this.memory.enquiries.get(id) || null;
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
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

  async listEnquiries(filter?: {
    status?: string;
    assignedTo?: string;
    propertyId?: string;
  }): Promise<Enquiry[]> {
    let list = Array.from(this.memory.enquiries.values());
    if (filter?.status) {
      list = list.filter((e) => e.status === filter.status);
    }
    if (filter?.assignedTo) {
      list = list.filter((e) => e.assignedTo === filter.assignedTo);
    }
    if (filter?.propertyId) {
      list = list.filter((e) => e.propertyId === filter.propertyId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Helper for testing resets
  clear() {
    this.memory = new InMemoryStore();
  }
}

export const db = new Database();
