import mongoose from 'mongoose';
import { UserModel, ListingModel, RequestModel, AuditLogModel } from './models/index';
import { UserRecord, ListingRecord, RequestRecord, AuditLogRecord } from './types';

let isConnected = false;

export interface MongoConnectionStatus {
  isConnected: boolean;
  uriConfigured: boolean;
  status: 'CONNECTED' | 'FALLBACK_LOCAL' | 'NOT_CONFIGURED' | 'INITIALIZING';
  reason: string | null;
  ipWhitelistHelp: boolean;
  lastChecked: string;
}

let mongoConnectionInfo: MongoConnectionStatus = {
  isConnected: false,
  uriConfigured: false,
  status: 'INITIALIZING',
  reason: null,
  ipWhitelistHelp: false,
  lastChecked: new Date().toISOString()
};

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    mongoConnectionInfo = {
      isConnected: false,
      uriConfigured: false,
      status: 'NOT_CONFIGURED',
      reason: 'No MONGODB_URI environment variable provided',
      ipWhitelistHelp: false,
      lastChecked: new Date().toISOString()
    };
    console.log('ℹ️ [Database] MONGODB_URI not specified. Operating in high-performance disk-persisted database store (data/database.json).');
    return false;
  }

  mongoConnectionInfo.uriConfigured = true;

  try {
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`⏳ [Database] Attempting connection to MongoDB at ${maskedUri}...`);
    
    // Set 2500ms connection timeout so startup is fast and never blocked
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    isConnected = true;
    mongoConnectionInfo = {
      isConnected: true,
      uriConfigured: true,
      status: 'CONNECTED',
      reason: null,
      ipWhitelistHelp: false,
      lastChecked: new Date().toISOString()
    };
    console.log('✅ [Database] Successfully connected to MongoDB via Mongoose!');

    // Initialize collections if empty
    await seedMongoIfEmpty();

    return true;
  } catch (err: any) {
    const isWhitelistIssue =
      err.message?.includes('whitelist') ||
      err.message?.includes('Could not connect to any servers') ||
      err.name === 'MongoServerSelectionError';

    // Safely disconnect any failed or hanging socket attempts
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }

    isConnected = false;
    mongoConnectionInfo = {
      isConnected: false,
      uriConfigured: true,
      status: 'FALLBACK_LOCAL',
      reason: isWhitelistIssue
        ? 'MongoDB Atlas Network Access restriction: Cloud IP is not on the Atlas IP Whitelist.'
        : err.message || 'Remote database unreachable',
      ipWhitelistHelp: isWhitelistIssue,
      lastChecked: new Date().toISOString()
    };

    console.log(
      `ℹ️ [Database] MongoDB Atlas connection deferred (${
        isWhitelistIssue ? 'IP Access List restriction' : 'cluster offline'
      }). High-performance persistent JSON store active (data/database.json).`
    );
    if (isWhitelistIssue) {
      console.log('💡 [Database Tip] To connect live to Atlas: Go to MongoDB Atlas > Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0).');
    }

    return false;
  }
}

export function isMongoActive(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoConnectionInfo(): MongoConnectionStatus {
  return mongoConnectionInfo;
}

// Seed MongoDB collections from default data if empty
async function seedMongoIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      return; // Already populated
    }

    console.log('🌱 Seeding initial records into MongoDB collections...');
    const { SEED_DATA } = await import('./seedData');

    await UserModel.insertMany(
      SEED_DATA.users.map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt)
      }))
    );

    await ListingModel.insertMany(
      SEED_DATA.listings.map((l) => ({
        ...l,
        prepareTime: new Date(l.prepareTime),
        expiryTime: new Date(l.expiryTime),
        pickupWindowStart: new Date(l.pickupWindowStart),
        pickupWindowEnd: new Date(l.pickupWindowEnd),
        createdAt: new Date(l.createdAt),
        updatedAt: new Date(l.updatedAt)
      }))
    );

    await RequestModel.insertMany(
      SEED_DATA.requests.map((r: any) => ({
        ...r,
        pickupTime: new Date(r.pickupTime),
        timestamp: new Date(r.timestamp),
        completedAt: r.completedAt ? new Date(r.completedAt) : undefined
      }))
    );

    await AuditLogModel.insertMany(
      SEED_DATA.auditLogs.map((a) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }))
    );

    console.log('✅ MongoDB collections seeded successfully with users, listings, requests, and audit logs.');
  } catch (err: any) {
    console.error('Failed to seed MongoDB collections:', err);
  }
}

// MongoDB Operations Wrapper
export const mongoDb = {
  // Users
  async getUsers(): Promise<UserRecord[]> {
    const docs = await UserModel.find().lean();
    return docs.map((d: any) => ({
      ...d,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()
    }));
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    const d = await UserModel.findOne({ id }).lean();
    if (!d) return null;
    return {
      ...(d as any),
      createdAt: (d as any).createdAt ? new Date((d as any).createdAt).toISOString() : new Date().toISOString()
    };
  },

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const d = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!d) return null;
    return {
      ...(d as any),
      createdAt: (d as any).createdAt ? new Date((d as any).createdAt).toISOString() : new Date().toISOString()
    };
  },

  async createUser(user: UserRecord): Promise<UserRecord> {
    const doc = new UserModel({
      ...user,
      createdAt: new Date(user.createdAt)
    });
    await doc.save();
    return user;
  },

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const updated = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!updated) return null;
    return {
      ...(updated as any),
      createdAt: (updated as any).createdAt ? new Date((updated as any).createdAt).toISOString() : new Date().toISOString()
    };
  },

  // Listings
  async getListings(): Promise<ListingRecord[]> {
    const docs = await ListingModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      prepareTime: new Date(d.prepareTime).toISOString(),
      expiryTime: new Date(d.expiryTime).toISOString(),
      pickupWindowStart: new Date(d.pickupWindowStart).toISOString(),
      pickupWindowEnd: new Date(d.pickupWindowEnd).toISOString(),
      createdAt: new Date(d.createdAt).toISOString(),
      updatedAt: new Date(d.updatedAt).toISOString()
    }));
  },

  async findListingById(id: string): Promise<ListingRecord | null> {
    const d: any = await ListingModel.findOne({ id }).lean();
    if (!d) return null;
    return {
      ...d,
      prepareTime: new Date(d.prepareTime).toISOString(),
      expiryTime: new Date(d.expiryTime).toISOString(),
      pickupWindowStart: new Date(d.pickupWindowStart).toISOString(),
      pickupWindowEnd: new Date(d.pickupWindowEnd).toISOString(),
      createdAt: new Date(d.createdAt).toISOString(),
      updatedAt: new Date(d.updatedAt).toISOString()
    };
  },

  async createListing(listing: ListingRecord): Promise<ListingRecord> {
    const doc = new ListingModel({
      ...listing,
      prepareTime: new Date(listing.prepareTime),
      expiryTime: new Date(listing.expiryTime),
      pickupWindowStart: new Date(listing.pickupWindowStart),
      pickupWindowEnd: new Date(listing.pickupWindowEnd),
      createdAt: new Date(listing.createdAt),
      updatedAt: new Date(listing.updatedAt)
    });
    await doc.save();
    return listing;
  },

  async updateListing(id: string, updates: Partial<ListingRecord>): Promise<ListingRecord | null> {
    const mongoUpdates: any = { ...updates, updatedAt: new Date() };
    if (updates.prepareTime) mongoUpdates.prepareTime = new Date(updates.prepareTime);
    if (updates.expiryTime) mongoUpdates.expiryTime = new Date(updates.expiryTime);
    if (updates.pickupWindowStart) mongoUpdates.pickupWindowStart = new Date(updates.pickupWindowStart);
    if (updates.pickupWindowEnd) mongoUpdates.pickupWindowEnd = new Date(updates.pickupWindowEnd);

    const updated: any = await ListingModel.findOneAndUpdate({ id }, { $set: mongoUpdates }, { new: true }).lean();
    if (!updated) return null;
    return {
      ...updated,
      prepareTime: new Date(updated.prepareTime).toISOString(),
      expiryTime: new Date(updated.expiryTime).toISOString(),
      pickupWindowStart: new Date(updated.pickupWindowStart).toISOString(),
      pickupWindowEnd: new Date(updated.pickupWindowEnd).toISOString(),
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: new Date(updated.updatedAt).toISOString()
    };
  },

  async deleteListing(id: string): Promise<boolean> {
    const res = await ListingModel.deleteOne({ id });
    return (res.deletedCount || 0) > 0;
  },

  // Requests
  async getRequests(): Promise<RequestRecord[]> {
    const docs = await RequestModel.find().sort({ timestamp: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      pickupTime: new Date(d.pickupTime).toISOString(),
      timestamp: new Date(d.timestamp).toISOString(),
      completedAt: d.completedAt ? new Date(d.completedAt).toISOString() : undefined
    }));
  },

  async findRequestById(id: string): Promise<RequestRecord | null> {
    const d: any = await RequestModel.findOne({ id }).lean();
    if (!d) return null;
    return {
      ...d,
      pickupTime: new Date(d.pickupTime).toISOString(),
      timestamp: new Date(d.timestamp).toISOString(),
      completedAt: d.completedAt ? new Date(d.completedAt).toISOString() : undefined
    };
  },

  async createRequest(request: RequestRecord): Promise<RequestRecord> {
    const doc = new RequestModel({
      ...request,
      pickupTime: new Date(request.pickupTime),
      timestamp: new Date(request.timestamp),
      completedAt: request.completedAt ? new Date(request.completedAt) : undefined
    });
    await doc.save();
    return request;
  },

  async updateRequest(id: string, updates: Partial<RequestRecord>): Promise<RequestRecord | null> {
    const mongoUpdates: any = { ...updates };
    if (updates.pickupTime) mongoUpdates.pickupTime = new Date(updates.pickupTime);
    if (updates.completedAt) mongoUpdates.completedAt = new Date(updates.completedAt);

    const updated: any = await RequestModel.findOneAndUpdate({ id }, { $set: mongoUpdates }, { new: true }).lean();
    if (!updated) return null;
    return {
      ...updated,
      pickupTime: new Date(updated.pickupTime).toISOString(),
      timestamp: new Date(updated.timestamp).toISOString(),
      completedAt: updated.completedAt ? new Date(updated.completedAt).toISOString() : undefined
    };
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogRecord[]> {
    const docs = await AuditLogModel.find().sort({ timestamp: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      timestamp: new Date(d.timestamp).toISOString()
    }));
  },

  async createAuditLog(log: AuditLogRecord): Promise<AuditLogRecord> {
    const doc = new AuditLogModel({
      ...log,
      timestamp: new Date(log.timestamp)
    });
    await doc.save();
    return log;
  }
};
