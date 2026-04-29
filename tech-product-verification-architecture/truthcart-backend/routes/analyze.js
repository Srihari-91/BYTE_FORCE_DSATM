// Analyze Route
// POST /analyze — TruthCart analysis endpoint

import { Router } from 'express';
import { analyzeProduct } from '../controllers/analyzeController.js';

export const analyzeRouter = Router();

// POST /analyze
analyzeRouter.post('/', analyzeProduct);

// GET /analyze (help/documentation)
analyzeRouter.get('/', (req, res) => {
  res.json({
    endpoint: '/analyze',
    method: 'POST',
    description: 'Analyze a tech product for marketing truth verification',
    body: {
      product: 'Normalized product data object (required)',
      confidence: 'Extraction confidence score 0-1 (optional)',
      fingerprint: 'Product fingerprint hash (optional)'
    },
    example: {
      product: {
        title: 'Samsung Galaxy S25 Ultra',
        brand: 'Samsung',
        price: 1299.99,
        currency: 'USD',
        description: 'All-day battery with 200MP AI-powered camera...',
        specs: { processor: 'Snapdragon 8 Gen 3', ram: '12GB' },
        category: 'smartphone',
        source: 'amazon'
      },
      confidence: 0.85,
      fingerprint: 'a1b2c3d4'
    }
  });
});
