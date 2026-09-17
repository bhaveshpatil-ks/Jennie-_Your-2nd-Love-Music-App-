import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import { apiRouter } from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Mount API Routes
app.use('/api', apiRouter);

// System Health & Diagnostics
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Lora Music API',
    databaseConnected: isDbConnected(),
    jamendoConfigured: Boolean(process.env.JAMENDO_CLIENT_ID),
    timestamp: new Date().toISOString(),
  });
});

// API Root Index
app.get('/', (req, res) => {
  res.json({
    name: 'Lora Music Streaming API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      tracks: '/api/tracks',
      playlists: '/api/playlists',
      favorites: '/api/favorites',
    },
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎵 Lora Music Backend running on http://localhost:${PORT}`);
});
