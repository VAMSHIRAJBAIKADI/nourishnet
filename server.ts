import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initSocketIO } from './server/socket';
import { register, login, getMe } from './server/controllers/authController';
import {
  getListings,
  createListing,
  updateListingStatus,
  adminDeleteListing
} from './server/controllers/listingController';
import {
  getRequests,
  createRequest,
  updateRequest
} from './server/controllers/requestController';
import {
  getAdminMetrics,
  getAuditLogs,
  updateOrganizationVerification,
  getOrganizations
} from './server/controllers/adminController';
import {
  authenticateToken,
  requireDonor,
  requireRecipient,
  requireAdmin
} from './server/middleware/auth';

import { connectMongoDB, isMongoActive } from './server/mongo';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Attempt to connect to MongoDB if MONGODB_URI is provided
  await connectMongoDB();

  app.use(cors());
  app.use(express.json());

  // REST API Routes
  const apiRouter = express.Router();

  // Auth Routes
  apiRouter.post('/auth/register', register);
  apiRouter.post('/auth/login', login);
  apiRouter.get('/auth/me', authenticateToken, getMe);

  // Listings Routes
  apiRouter.get('/listings', getListings);
  apiRouter.post('/listings', authenticateToken, requireDonor, createListing);
  apiRouter.patch('/listings/:id/status', authenticateToken, updateListingStatus);

  // Requests Routes
  apiRouter.get('/requests', authenticateToken, getRequests);
  apiRouter.post('/requests', authenticateToken, requireRecipient, createRequest);
  apiRouter.patch('/requests/:id', authenticateToken, updateRequest);

  // Admin Routes
  apiRouter.get('/admin/metrics', authenticateToken, requireAdmin, getAdminMetrics);
  apiRouter.get('/admin/audit-logs', authenticateToken, requireAdmin, getAuditLogs);
  apiRouter.get('/admin/organizations', authenticateToken, requireAdmin, getOrganizations);
  apiRouter.patch('/admin/verifications/:userId', authenticateToken, requireAdmin, updateOrganizationVerification);
  apiRouter.delete('/admin/listings/:id', authenticateToken, requireAdmin, adminDeleteListing);

  // System status endpoint (reports MongoDB vs Fallback mode)
  apiRouter.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      database: isMongoActive() ? 'MongoDB (Mongoose)' : 'Local File Persistence (data/database.json)',
      mongoConnected: isMongoActive(),
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api', apiRouter);

  // Create HTTP server and initialize Socket.io
  const server = http.createServer(app);
  initSocketIO(server);

  // Vite integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true'
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NourishNet Full-Stack Server running on port ${PORT} [Mode: ${isProduction ? 'Production' : 'Development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
