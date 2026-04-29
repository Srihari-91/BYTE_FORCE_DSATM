// Input Validator
// Validates incoming API request data

import { validateProduct, hasMinimumData } from '../../models/productSchema.js';

/**
 * Validate the /analyze request body
 * @param {Object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data: Object|null }}
 */
export function validateAnalyzeRequest(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'], data: null };
  }

  // Validate product
  if (!body.product) {
    errors.push('Product data is required');
  } else {
    const productValidation = validateProduct(body.product);
    if (productValidation.errors.length > 0) {
      errors.push(...productValidation.errors.map(e => `Product: ${e}`));
    }
    if (!hasMinimumData(body.product)) {
      errors.push('Product data insufficient for analysis (title required)');
    }
  }

  // Validate confidence (optional)
  if (body.confidence !== undefined && body.confidence !== null) {
    const conf = Number(body.confidence);
    if (isNaN(conf) || conf < 0 || conf > 1) {
      errors.push('Confidence must be a number between 0 and 1');
    }
  }

  // Validate fingerprint (optional but recommended)
  if (body.fingerprint && typeof body.fingerprint !== 'string') {
    errors.push('Fingerprint must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? body : null
  };
}

/**
 * Validate and extract product data for pipeline
 */
export function extractValidProductData(body) {
  if (!body || !body.product) return null;

  const { sanitized } = validateProduct(body.product);
  return sanitized;
}
