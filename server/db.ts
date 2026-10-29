import fs from 'fs';
import path from 'path';
import {
  UserRecord,
  ListingRecord,
  RequestRecord,
  AuditLogRecord
} from './types';
import { SEED_DATA } from './seedData';
import { isMongoActive, mongoDb } from './mongo';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseStore {
  users: UserRecord[];
  listings: ListingRecord[];
  requests: RequestRecord[];
  auditLogs: AuditLogRecord[];
}

class Database {
  private data: DatabaseStore;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read DB_FILE, falling back to seed data:', err);
    }
    this.saveData(SEED_DATA);
    return SEED_DATA;
  }

  private saveData(data: DatabaseStore) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  // Users
  async getUsers(): Promise<UserRecord[]> {
    if (isMongoActive()) {
      try {
        return await mongoDb.getUsers();
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.users;
  }

  async findUserById(id: string): Promise<UserRecord | undefined> {
    if (isMongoActive()) {
      try {
        const user = await mongoDb.findUserById(id);
        if (user) return user;
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.users.find((u) => u.id === id);
  }

  async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    if (isMongoActive()) {
      try {
        const user = await mongoDb.findUserByEmail(email);
        if (user) return user;
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(user: UserRecord): Promise<UserRecord> {
    if (isMongoActive()) {
      try {
        await mongoDb.createUser(user);
      } catch (err) {
        console.error('MongoDB error creating user:', err);
      }
    }
    this.data.users.push(user);
    this.commit();
    return user;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | undefined> {
    if (isMongoActive()) {
      try {
        await mongoDb.updateUser(id, updates);
      } catch (err) {
        console.error('MongoDB error updating user:', err);
      }
    }
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.commit();
    return user;
  }

  // Listings
  async getListings(): Promise<ListingRecord[]> {
    if (isMongoActive()) {
      try {
        return await mongoDb.getListings();
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.listings;
  }

  async findListingById(id: string): Promise<ListingRecord | undefined> {
    if (isMongoActive()) {
      try {
        const item = await mongoDb.findListingById(id);
        if (item) return item;
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.listings.find((l) => l.id === id);
  }

  async createListing(listing: ListingRecord): Promise<ListingRecord> {
    if (isMongoActive()) {
      try {
        await mongoDb.createListing(listing);
      } catch (err) {
        console.error('MongoDB error creating listing:', err);
      }
    }
    this.data.listings.unshift(listing);
    this.commit();
    return listing;
  }

  async updateListing(id: string, updates: Partial<ListingRecord>): Promise<ListingRecord | undefined> {
    if (isMongoActive()) {
      try {
        await mongoDb.updateListing(id, updates);
      } catch (err) {
        console.error('MongoDB error updating listing:', err);
      }
    }
    const listing = this.data.listings.find((l) => l.id === id);
    if (!listing) return undefined;
    Object.assign(listing, updates, { updatedAt: new Date().toISOString() });
    this.commit();
    return listing;
  }

  async deleteListing(id: string): Promise<boolean> {
    if (isMongoActive()) {
      try {
        await mongoDb.deleteListing(id);
      } catch (err) {
        console.error('MongoDB error deleting listing:', err);
      }
    }
    const idx = this.data.listings.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.data.listings.splice(idx, 1);
    this.commit();
    return true;
  }

  // Requests
  async getRequests(): Promise<RequestRecord[]> {
    if (isMongoActive()) {
      try {
        return await mongoDb.getRequests();
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.requests;
  }

  async findRequestById(id: string): Promise<RequestRecord | undefined> {
    if (isMongoActive()) {
      try {
        const req = await mongoDb.findRequestById(id);
        if (req) return req;
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.requests.find((r) => r.id === id);
  }

  async createRequest(request: RequestRecord): Promise<RequestRecord> {
    if (isMongoActive()) {
      try {
        await mongoDb.createRequest(request);
      } catch (err) {
        console.error('MongoDB error creating request:', err);
      }
    }
    this.data.requests.unshift(request);
    this.commit();
    return request;
  }

  async updateRequest(id: string, updates: Partial<RequestRecord>): Promise<RequestRecord | undefined> {
    if (isMongoActive()) {
      try {
        await mongoDb.updateRequest(id, updates);
      } catch (err) {
        console.error('MongoDB error updating request:', err);
      }
    }
    const req = this.data.requests.find((r) => r.id === id);
    if (!req) return undefined;
    Object.assign(req, updates);
    this.commit();
    return req;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogRecord[]> {
    if (isMongoActive()) {
      try {
        return await mongoDb.getAuditLogs();
      } catch (err) {
        console.warn('MongoDB error, using fallback store:', err);
      }
    }
    return this.data.auditLogs;
  }

  async createAuditLog(log: AuditLogRecord): Promise<AuditLogRecord> {
    if (isMongoActive()) {
      try {
        await mongoDb.createAuditLog(log);
      } catch (err) {
        console.error('MongoDB error creating audit log:', err);
      }
    }
    this.data.auditLogs.unshift(log);
    this.commit();
    return log;
  }
}

export const db = new Database();
