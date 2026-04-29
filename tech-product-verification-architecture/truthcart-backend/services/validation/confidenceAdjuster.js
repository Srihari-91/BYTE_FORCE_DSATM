// Confidence Adjuster
// Modifies analysis confidence based on data completeness and source reliability

import { getCompletenessScore } from '../../models/productSchema.js';

/**
 * Adjust confidence score based on data quality
 * @param {Object} product - Sanitized product data
 * @param {number} extractionConfidence - Original extraction confidence (0-1)
 * @returns {{ adjustedConfidence: number, factors: string[] }}
 */
export function adjustConfidence(product, extractionConfidence = 0.5) {
  const factors = [];
  let multiplier = 1.0;

  // Factor 1: Data completeness
  const completeness = getCompletenessScore(product);
  if (completeness < 0.4) {
    multiplier -= 0.2;
    factors.push('Low data completeness');
  } else if (completeness > 0.8) {
    multiplier += 0.05;
    factors.push('High data completeness');
  }

  // Factor 2: Source reliability
  const sourceReliability = getSourceReliability(product.source);
  multiplier += (sourceReliability - 0.5) * 0.2;
  if (sourceReliability < 0.5) {
    factors.push('Low source reliability');
  }

  // Factor 3: Specs availability
  const specCount = product.specs ? Object.keys(product.specs).length : 0;
  if (specCount < 2) {
    multiplier -= 0.15;
    factors.push('Missing technical specifications');
  } else if (specCount > 8) {
    multiplier += 0.1;
    factors.push('Rich technical specifications');
  }

  // Factor 4: Reviews available
  if (product.reviewCount && product.reviewCount > 100) {
    multiplier += 0.05;
    factors.push('Substantial review count');
  }

  // Apply multiplier and clamp
  let adjusted = extractionConfidence * multiplier;
  adjusted = Math.min(Math.max(adjusted, 0), 1);

  return {
    adjustedConfidence: Math.round(adjusted * 100) / 100,
    factors
  };
}

/**
 * Get reliability score for a given source platform
 */
function getSourceReliability(source) {
  const scores = {
    'amazon': 0.85,
    'flipkart': 0.75,
    'bestbuy': 0.80,
    'walmart': 0.75,
    'generic': 0.50,
    'unknown': 0.40
  };
  return scores[source] || 0.50;
}

/**
 * Get confidence level descriptor
 */
export function getConfidenceLevel(score) {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
