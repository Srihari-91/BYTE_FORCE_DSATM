// TruthCart Backend Server
// Express.js API server for the Truth Verification Engine

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.js';
import { chatRouter } from './routes/chat.js';
import { logger } from './utils/logger.js';
import { CONSTANTS } from './config/constants.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-TruthCart-Version', 'X-TruthCart-Client']
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'truthcart-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    engines: CONSTANTS.ENGINE_VERSIONS
  });
});

// API Routes
app.use('/analyze', analyzeRouter);
app.use('/chat', chatRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`TruthCart Backend v2.0.0 running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Analysis API: POST http://localhost:${PORT}/analyze`);
  logger.info(`Chat API: POST http://localhost:${PORT}/chat`);
  logger.info(`Engines loaded: ${Object.keys(CONSTANTS.ENGINE_VERSIONS).length}`);
});

export default app;
