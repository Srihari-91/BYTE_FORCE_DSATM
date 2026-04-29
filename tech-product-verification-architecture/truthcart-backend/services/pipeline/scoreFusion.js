// Score Fusion Engine (Legacy Compatibility)
// Reddit adjustment is now handled within trustScoringEngine.js
// This module preserved for backward compatibility with external integrations

import { CONSTANTS } from '../../config/constants.js';

/**
 * Fuse base analyzer score with Reddit community score
 * @deprecated Use trustScoringEngine.computeTrustScore instead
 * @param {number} baseScore - Score from analyzers (0-100)
 * @param {number} redditScore - Score from Reddit pipeline (0-100)
 * @returns {number} Final fused score (0-100)
 */
export function fuseScores(baseScore, redditScore) {
  const deviation = redditScore - 70;
  const adjustment = deviation * 0.25;
  return Math.round(Math.max(10, Math.min(100, baseScore + adjustment)));
}

/**
 * Get verdict based on final score
 * @param {number} score - Final truth score (0-100)
 * @returns {string} Verdict label
 */
export function getVerdict(score) {
  if (score >= CONSTANTS.THRESHOLDS.EXCEPTIONAL) {
    return CONSTANTS.VERDICTS.EXCEPTIONAL;
  }
  if (score >= CONSTANTS.THRESHOLDS.RELIABLE) {
    return CONSTANTS.VERDICTS.RELIABLE;
  }
  if (score >= CONSTANTS.THRESHOLDS.MIXED) {
    return CONSTANTS.VERDICTS.MIXED;
  }
  if (score >= CONSTANTS.THRESHOLDS.HEAVY_MARKETING) {
    return CONSTANTS.VERDICTS.HEAVY_MARKETING;
  }
  return CONSTANTS.VERDICTS.BUYER_BEWARE;
}

/**
 * Get confidence level descriptor
 * @param {number} score - Final truth score
 * @returns {string} 'high' | 'medium' | 'low'
 */
export function getConfidenceLevel(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}
