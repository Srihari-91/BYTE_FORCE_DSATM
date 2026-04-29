// Chat Route
// POST /chat — TruthCart chatbot endpoint

import { Router } from 'express';
import { chatAboutProduct } from '../controllers/chatController.js';

export const chatRouter = Router();

// POST /chat
chatRouter.post('/', chatAboutProduct);

// GET /chat (help/documentation)
chatRouter.get('/', (req, res) => {
  res.json({
    endpoint: '/chat',
    method: 'POST',
    description: 'Ask questions about a product analysis',
    body: {
      question: 'Your question about the product (required)',
      analysis: 'Full analysis result from /analyze endpoint (required)',
      product: 'Normalized product data (required)'
    },
    example: {
      question: 'Is the camera claim accurate?',
      analysis: '{ ... analysis object from /analyze ... }',
      product: '{ ... product object ... }'
    }
  });
});
