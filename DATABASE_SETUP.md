# NourishNet Full-Stack Architecture & Database Setup Guide
**Problem ID:** HACK-P197  
**Architecture:** Node.js Express + TypeScript + Socket.io + MongoDB (Mongoose) / Multi-Engine Persistence + React 19 + Tailwind CSS

---

## 1. MongoDB Architecture & Mongoose Schemas

The application is natively integrated with **MongoDB via Mongoose** (`mongoose: ^8.x`).
All schemas are defined with full TypeScript typing in `server/models/`:

### Collections Overview:

#### 1. `users` Collection (`server/models/User.ts`)
- `id`: String (Unique index, e.g., `user-donor-1`)
- `email`: String (Unique index, lowercase)
- `passwordHash`: String (Bcrypt salt rounds: 10)
- `role`: String (`DONOR` | `RECIPIENT` | `ADMIN`)
- `name`: String
- `organizationDetails`: Embedded Subdocument
  - `type`: String (e.g., "Banquet Kitchen & Catering", "501(c)(3) Food Bank")
  - `contactPerson`: String
  - `phone`: String
  - `address`: String
  - `neighborhood`: String
  - `licenseNumber`: String (Food safety health permit)
  - `foodSafetyCert`: String (e.g., ServSafe Manager #SS-88912)
  - `taxExemptId`: String (501(c)(3) Tax Exemption ID)
  - `dailyMeals`: Number
  - `coldStorageCapacity`: String
  - `transportTypes`: Array of Strings (`Refrigerated Van`, `Insulated Box Truck`, etc.)
  - `description`: String
- `verifiedStatus`: String (`PENDING` | `VERIFIED` | `REJECTED`)
- `createdAt`: Date

#### 2. `listings` Collection (`server/models/Listing.ts`)
- `id`: String (Unique index, e.g., `list-101`)
- `donorId`: String (Reference to user ID)
- `donorName`: String
- `donorVerified`: Boolean
- `title`: String
- `description`: String
- `category`: String (`prepared`, `produce`, `bakery`, `dairy`, `packaged`, `beverages`)
- `quantity`: String (e.g. "45 portions / 15 aluminum hotel pans")
- `estimatedMeals`: Number
- `weightKg`: Number
- `prepareTime`: Date
- `expiryTime`: Date (Validated server-side to ensure it is in the future)
- `locationAddress`: String
- `neighborhood`: String
- `storageType`: String (`REFRIGERATED` | `FROZEN` | `AMBIENT` | `HOT_HOLD`)
- `dietaryTags`: Array of Strings (`gluten_free`, `vegan`, `halal`, etc.)
- `allergens`: Array of Strings (`Dairy`, `Nuts`, `Soy`, `Gluten`, etc.)
- `pickupWindowStart`: Date
- `pickupWindowEnd`: Date
- `pickupInstructions`: String
- `imageUrl`: String (Optional)
- `status`: String (`AVAILABLE` | `REQUESTED` | `CLAIMED` | `EXPIRED` | `CANCELLED` | `FLAGGED`)
- `flagReason`: String (Optional)
- `createdAt`: Date
- `updatedAt`: Date

#### 3. `requests` Collection (`server/models/Request.ts`)
- `id`: String (Unique index, e.g., `req-201`)
- `listingId`: String (Reference to listing ID)
- `listingTitle`: String
- `donorId`: String
- `donorName`: String
- `recipientId`: String (Reference to NGO user ID)
- `recipientName`: String
- `recipientPhone`: String
- `requestedMeals`: Number
- `pickupVolunteer`: String
- `volunteerPhone`: String
- `vehicleType`: String
- `pickupTime`: Date
- `status`: String (`PENDING` | `ACCEPTED` | `REJECTED` | `CANCELLED` | `COMPLETED`)
- `pickupCode`: String (Cryptographic 4-digit verification code, e.g. `NOURISH-884`)
- `rejectionReason`: String (Optional)
- `completedAt`: Date (Optional)
- `timestamp`: Date

#### 4. `auditlogs` Collection (`server/models/AuditLog.ts`)
- `id`: String (Unique index)
- `adminId`: String
- `adminName`: String
- `action`: String (`LISTING_MODERATED` | `ORGANIZATION_VERIFIED`)
- `targetType`: String (`LISTING` | `USER` | `REQUEST`)
- `targetId`: String
- `details`: String
- `timestamp`: Date

---

## 2. Connecting to MongoDB

### Option A: MongoDB Atlas (Cloud Hosted)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write credentials and allow access from your IP / `0.0.0.0/0`.
3. In your `.env` file (or environment variables), set:
```bash
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/nourishnet?retryWrites=true&w=majority"
```

### Option B: Local MongoDB Instance
1. Start your local MongoDB server:
```bash
mongod --dbpath /data/db
```
2. In your `.env` file:
```bash
MONGODB_URI="mongodb://localhost:27017/nourishnet"
```

---

## 3. Automatic Seeding & Zero-Config Fallback

The backend (`server/mongo.ts` and `server/db.ts`) incorporates **dual-mode enterprise resilience**:

1. **Auto-Discovery & Connection**:
   When the server starts (`npm run dev` or `node server.ts`), it attempts to connect to `process.env.MONGODB_URI` with a 4-second timeout.
2. **Automatic Collection Seeding**:
   If the connected MongoDB database is empty, the system automatically seeds all collections (`users`, `listings`, `requests`, `auditlogs`) from `server/seedData.ts`.
3. **Graceful Local Fallback**:
   If `MONGODB_URI` is not provided or the MongoDB daemon is temporarily offline, the server logs an informative notice and transparently routes all queries through the persistent JSON store in `data/database.json`. This guarantees 100% operational uptime without crashes in any test or development environment.

---

## 4. Running the Application

```bash
# Install dependencies
npm install

# Start full-stack server (REST API, MongoDB/Mongoose connection, Socket.io, Vite SPA on port 3000)
npm run dev

# Or build for production:
npm run build
npm start
```

---

## 5. Pre-Configured Test Accounts (Bcrypt Hash: `password123`)

| Role | Email | Password | Organization | Status |
|---|---|---|---|---|
| **Donor** | `chef@grandhotel.com` | `password123` | Grand Hotel Restaurant & Banquets | Verified |
| **Donor** | `surplus@greenvalleymart.org` | `password123` | GreenValley Organic Mart | Verified |
| **Donor (Unverified)** | `bistro@crestview.com` | `password123` | Crestview Bistro & Tavern | Pending Review |
| **Recipient** | `sarah@hopekitchen.org` | `password123` | Hope Community Kitchen | Verified 501(c)(3) |
| **Recipient** | `torres@stjudeshelter.org` | `password123` | St. Jude's Family Shelter | Verified 501(c)(3) |
| **Admin** | `admin@nourishnet.org` | `password123` | Compliance & Food Safety Board | Verified Admin |

---

## 6. Live Health Check Endpoint

Check the active database engine at any time:
```bash
curl http://localhost:3000/api/health
```
Response:
```json
{
  "status": "healthy",
  "database": "MongoDB (Mongoose)",
  "mongoConnected": true,
  "timestamp": "2026-10-28T10:50:00.000Z"
}
```
