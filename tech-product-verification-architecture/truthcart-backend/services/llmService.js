// Centralized LLM Service
// Single entry point for all LLM calls via OpenRouter
// Supports mock mode for development/testing

import axios from 'axios';
import { logger } from '../utils/logger.js';

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-llama/llama-3-70b-instruct';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MOCK_MODE = process.env.LLM_MOCK_MODE === 'true';

/**
 * Call the LLM with a prompt via OpenRouter
 * @param {string} prompt - The prompt to send
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.model] - Override model
 * @param {number} [options.maxRetries=1] - Max retries on parse failure
 * @returns {Promise<string>} The LLM response text
 */
export async function callLLM(prompt, options = {}) {
  const model = options.model || LLM_MODEL;
  const maxRetries = options.maxRetries ?? 1;

  // Mock mode: return fallback JSON without making API call
  if (LLM_MOCK_MODE) {
    logger.info('[LLM] Mock mode active — returning fallback response');
    return JSON.stringify(getMockFallback());
  }

  // Append JSON enforcement to prompt
  const enforcedPrompt = `${prompt}\n\nReturn STRICT JSON only. No extra text, no markdown formatting, no code blocks.`;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`[LLM] Calling ${model} (attempt ${attempt + 1}/${maxRetries + 1})`);

      const response = await axios.post(
        `${LLM_BASE_URL}/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: enforcedPrompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${LLM_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
            'X-Title': process.env.APP_NAME || 'TruthCart'
          },
          timeout: 30000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      // Try to parse as JSON to validate
      try {
        JSON.parse(content);
      } catch {
        // If parse fails and we have retries left, try again
        if (attempt < maxRetries) {
          logger.warn('[LLM] Response was not valid JSON, retrying...');
          continue;
        }
      }

      return content;
    } catch (err) {
      lastError = err;
      const errorDetail = err.response?.data || err.message;
      logger.error(`[LLM] API call failed (attempt ${attempt + 1}):`, JSON.stringify(errorDetail).substring(0, 200));

      if (attempt < maxRetries) {
        logger.info('[LLM] Retrying...');
      }
    }
  }

  // All retries exhausted — return fallback
  logger.warn('[LLM] All retries exhausted — returning fallback');
  return JSON.stringify(getMockFallback());
}

/**
 * Get a fallback structured response (used in mock mode or error recovery)
 */
function getMockFallback() {
  return {
    truth_score: 70,
    tldr: ['Demo mode active — LLM response unavailable'],
    flagged_claims: [],
    tradeoffs: [],
    verdict: 'Mock response — LLM API unavailable. Check your API key and connection.'
  };
}

/**
 * Call LLM with JSON structure enforcement
 * @param {string} prompt - The prompt
 * @param {Object} [options] - Options passed to callLLM
 * @returns {Promise<Object>} Parsed JSON object
 */
export async function callLLMStructured(prompt, options = {}) {
  const raw = await callLLM(prompt, options);
  try {
    return JSON.parse(raw);
  } catch {
    logger.warn('[LLM] Could not parse response as JSON even after retries, returning fallback');
    return getMockFallback();
  }
}
