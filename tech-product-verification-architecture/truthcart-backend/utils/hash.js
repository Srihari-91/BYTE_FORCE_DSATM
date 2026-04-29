// Hash Utility
// Creates deterministic hashes for product fingerprinting

import crypto from 'crypto';

/**
 * Generate a SHA-256 hash of the input
 * @param {string|Object} input
 * @returns {string} Hex-encoded hash
 */
export function generateHash(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Generate a short hash for cache keys
 */
export function shortHash(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 8);
}
