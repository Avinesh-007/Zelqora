import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { ENV } from './config/env.js';
import { getDatabase } from './db/database.js';
import { seedGuides } from './db/seed.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import investigationRoutes from './routes/investigation.routes.js';
import guideRoutes from './routes/guide.routes.js';
import documentationRoutes from './routes/documentation.routes.js';
import seoRoutes from './routes/seo.routes.js';
import contactRoutes from './routes/contact.routes.js';

import { authMiddleware } from './middleware/auth.middleware.js';
import { csrfProtection, apiRateLimiter } from './middleware/security.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Initialize database and seed initial verified guides
const db = getDatabase();
seedGuides(db);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows Vite dev tooling and inline styles
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = [ENV.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev flexible
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Zelqora-CSRF', 'x-zelqora-guest-token', 'x-guest-token']
}));

// Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Authentication & CSRF
app.use(authMiddleware);
app.use(csrfProtection);

// SEO routes at root
app.use('/', seoRoutes);

// API Routes with rate limiting
app.use('/api', apiRateLimiter);
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/contact', contactRoutes);

// In production, serve the built Vite client static assets
const clientDistPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend client routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Zelqora Troubleshooting Engine running on port ${ENV.PORT}`);
    console.log(`  API Health:     ${ENV.APP_URL}/api/health`);
    console.log(`  Documentation:  ${ENV.APP_URL}/api/documentation/sources`);
    console.log(`  Sitemap:        ${ENV.APP_URL}/sitemap.xml`);
    console.log(`  Environment:    ${ENV.NODE_ENV}`);
    console.log(`=======================================================`);
  });
}

export default app;
