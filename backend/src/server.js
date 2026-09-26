import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import { apiRouter } from './routes/index.js';
import { startDailyCatalogScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Mask technology fingerprint
app.disable('x-powered-by');

// Security Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Rate Limiting to prevent API abuse / DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/', apiLimiter);

// Global CORS Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) 
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Jennie-Client'],
}));

// Request body size limit
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Mount API Routes
app.use('/api', apiRouter);

// System Health & Diagnostics
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Jennie Music API',
    databaseConnected: isDbConnected(),
    jamendoConfigured: Boolean(process.env.JAMENDO_CLIENT_ID),
    timestamp: new Date().toISOString(),
  });
});

// API Root Index
app.get('/', (req, res) => {
  res.json({
    name: 'Jennie Music Streaming API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      tracks: '/api/tracks',
      playlists: '/api/playlists',
      favorites: '/api/favorites',
      catalog: '/api/catalog',
    },
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎵 Jennie Music Backend running on http://localhost:${PORT}`);
  // Start automated Layer 1 & 2 background discovery & enrichment scheduler
  startDailyCatalogScheduler();
});
