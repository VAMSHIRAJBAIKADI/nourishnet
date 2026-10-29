# 🍲 NourishNet — Enterprise Food Donation & Rescue Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.21-black.svg?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.x-47A248.svg?logo=mongodb)](https://www.mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101.svg?logo=socketdotio)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)

**Problem ID:** HACK-P197  
NourishNet is a full-stack, enterprise-grade surplus food rescue platform connecting commercial food donors (hotels, caterers, supermarkets, restaurants) with verified non-profit recipient shelters, community kitchens, and pantries, governed by strict compliance and food safety moderation.

---

## 🌟 Key Features

### 1. Multi-Role Workflows & Role-Based Access Control (RBAC)
- **Donor Portal:** Publish surplus listings with exact quantity, temperature storage controls (`REFRIGERATED`, `FROZEN`, `HOT_HOLD`, `AMBIENT`), future-enforced expiry times, dietary tags, and pickup windows. Manage active donations, incoming claim requests, and accept/reject reservations.
- **Recipient Dashboard:** Real-time searchable marketplace with category filters, dietary tags, and proximity indicators. Request portions with assigned volunteer names, driver phone numbers, vehicle types, and receive cryptographic pickup PIN codes (`pickupCode`).
- **Admin & Compliance Console:** Platform-wide analytics (meals rescued, kg saved, CO₂ offset), live verification queue for 501(c)(3) tax and health permits, and listing moderation with immutable regulatory audit logs.

### 2. Real-Time Synchronization (Socket.io)
- Automatic broadcast of new food listings to all active charity dashboards without page refresh (`listing:created`).
- Instant status transitions (`AVAILABLE` → `REQUESTED` → `CLAIMED` → `COMPLETED`).
- Live audit log broadcasts on admin moderation.

### 3. Dual-Engine Database Architecture (MongoDB + Fallback)
- **MongoDB via Mongoose:** Production schemas for `User`, `Listing`, `Request`, and `AuditLog` with automatic collection seeding on startup.
- **High-Performance Fallback:** Graceful failover to a persistent disk JSON store (`data/database.json`) when `MONGODB_URI` is offline or not supplied, ensuring 100% test environment uptime.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repository-url>
cd nourishnet
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your MongoDB connection (optional, local file store works by default):
```env
# MongoDB Atlas or Local MongoDB
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/nourishnet?retryWrites=true&w=majority"

# JWT Secret
JWT_SECRET="your-256-bit-jwt-secret-key"

PORT=3000
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Accounts (Password: `password123`)

| Role | Email | Organization | Status |
|---|---|---|---|
| **Donor** | `chef@grandhotel.com` | Grand Hotel Restaurant & Banquets | Verified |
| **Donor** | `surplus@greenvalleymart.org` | GreenValley Organic Mart | Verified |
| **Donor (Unverified)** | `bistro@crestview.com` | Crestview Bistro & Tavern | Pending Review |
| **Recipient** | `sarah@hopekitchen.org` | Hope Community Kitchen | Verified 501(c)(3) |
| **Recipient** | `torres@stjudeshelter.org` | St. Jude's Family Shelter | Verified 501(c)(3) |
| **Admin** | `admin@nourishnet.org` | Central Compliance & Safety Board | Verified Admin |

---

## 📡 REST API Reference

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `GET` | `/api/listings` | Public | Search available surplus listings |
| `POST` | `/api/listings` | `DONOR` | Post new food listing |
| `PATCH` | `/api/listings/:id/status` | `DONOR`, `ADMIN` | Transition listing status |
| `GET` | `/api/requests` | Authenticated | Get claim requests |
| `POST` | `/api/requests` | `RECIPIENT` | Claim meals with pickup details |
| `PATCH` | `/api/requests/:id` | `DONOR`, `RECIPIENT` | Accept, reject, or complete claim |
| `GET` | `/api/admin/metrics` | `ADMIN` | Platform metrics & KPIs |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Immutable compliance audit trail |
| `PATCH` | `/api/admin/verifications/:userId` | `ADMIN` | Approve / reject organization permit |
| `DELETE` | `/api/admin/listings/:id` | `ADMIN` | Remove listing with moderation reason |
| `GET` | `/api/health` | Public | Check server and MongoDB connection status |

---

## 🛡️ License

Apache-2.0 License. See source files for details.
