// Claim Classifier Engine
// Classifies marketing claims into standardized types and flags exaggerated language

import { CONSTANTS } from '../../config/constants.js';

/**
 * Classify and flag marketing claims
 * @param {Array} claims - Raw claims from claimExtractor
 * @param {Object} product - Product data
 * @returns {{ flags: Array, classified: Object }}
 */
export function classifyClaims(claims, product) {
  const flags = [];
  const classified = {
    byType: {},
    byConfidence: { high: [], medium: [], low: [] },
    total: claims.length
  };

  if (!claims || claims.length === 0) {
    return { flags, classified };
  }

  // Initialize type buckets
  CONSTANTS.CLAIM_TYPES.forEach(type => {
    classified.byType[type] = [];
  });

  for (const claim of claims) {
    // Classify by type
    const type = claim.type || 'OTHER';
    if (classified.byType[type]) {
      classified.byType[type].push(claim);
    } else {
      classified.byType['OTHER'].push(claim);
    }

    // Classify by confidence
    if (claim.confidence >= 0.8) {
      classified.byConfidence.high.push(claim);
    } else if (claim.confidence >= 0.5) {
      classified.byConfidence.medium.push(claim);
    } else {
      classified.byConfidence.low.push(claim);
    }

    // Check for exaggerated language
    const exaggerationFlag = checkExaggeration(claim.text, type);
    if (exaggerationFlag) {
      flags.push(exaggerationFlag);
    }

    // Check for vague claims with no specific metrics
    const vagueFlag = checkVagueness(claim.text, type, product);
    if (vagueFlag) {
      flags.push(vagueFlag);
    }
  }

  // Add aggregate flags
  const aggregateFlags = generateAggregateFlags(classified, product, claims);
  flags.push(...aggregateFlags);

  return { flags, classified };
}

/**
 * Check for exaggerated marketing language
 */
function checkExaggeration(text, type) {
  const lower = text.toLowerCase();

  for (const { pattern, flag } of CONSTANTS.MARKETING_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        claim: text,
        type: 'EXAGGERATION',
        severity: getExaggerationSeverity(flag),
        explanation: flag,
        analyzer: 'claimClassifier'
      };
    }
  }

  return null;
}

/**
 * Check if claim is too vague without specific metrics
 */
function checkVagueness(text, type, product) {
  const lower = text.toLowerCase();
  const hasNumbers = /\d/.test(text);

  // Performance claims without numbers are suspicious
  if (type === 'PERFORMANCE' && !hasNumbers) {
    return {
      claim: text,
      type: 'VAGUE_CLAIM',
      severity: CONSTANTS.SEVERITY.MEDIUM,
      explanation: 'Performance claim without specific metrics or benchmarks',
      analyzer: 'claimClassifier'
    };
  }

  // Battery claims without mAh or hours
  if (type === 'BATTERY' && !hasNumbers && !/\d+\s*(mah|hour|hr)/i.test(lower)) {
    return {
      claim: text,
      type: 'VAGUE_CLAIM',
      severity: CONSTANTS.SEVERITY.MEDIUM,
      explanation: 'Battery claim without specific capacity or duration',
      analyzer: 'claimClassifier'
    };
  }

  return null;
}

/**
 * Determine severity of exaggeration
 */
function getExaggerationSeverity(explanation) {
  const lowerExplanation = explanation.toLowerCase();
  if (lowerExplanation.includes('superlative') || lowerExplanation.includes('absolute') || lowerExplanation.includes('world')) {
    return CONSTANTS.SEVERITY.HIGH;
  }
  if (lowerExplanation.includes('vague') || lowerExplanation.includes('without')) {
    return CONSTANTS.SEVERITY.MEDIUM;
  }
  return CONSTANTS.SEVERITY.LOW;
}

/**
 * Generate aggregate flags based on overall claim patterns
 */
function generateAggregateFlags(classified, product, claims) {
  const flags = [];
  const totalClaims = classified.total;

  // Too many claims = marketing overload
  if (totalClaims > 15) {
    flags.push({
      claim: `${totalClaims} marketing claims detected`,
      type: 'CLAIM_OVERLOAD',
      severity: CONSTANTS.SEVERITY.MEDIUM,
      explanation: 'Product description contains an unusually high number of marketing claims — information overload tactic',
      analyzer: 'claimClassifier'
    });
  }

  // High ratio of vague claims
  const highConfClaims = classified.byConfidence.high.length;
  const lowConfClaims = classified.byConfidence.low.length;
  if (lowConfClaims > highConfClaims && totalClaims > 5) {
    flags.push({
      claim: `${lowConfClaims} low-confidence claims vs ${highConfClaims} high-confidence`,
      type: 'LOW_QUALITY_CLAIMS',
      severity: CONSTANTS.SEVERITY.MEDIUM,
      explanation: 'More vague/low-confidence claims than specific ones — marketing-heavy description',
      analyzer: 'claimClassifier'
    });
  }

  // Performance-heavy but missing spec data
  const perfClaims = classified.byType['PERFORMANCE']?.length || 0;
  const specCount = product.specs ? Object.keys(product.specs).length : 0;
  if (perfClaims > 3 && specCount < 3) {
    flags.push({
      claim: `${perfClaims} performance claims with only ${specCount} specs`,
      type: 'UNVERIFIED_PERFORMANCE',
      severity: CONSTANTS.SEVERITY.HIGH,
      explanation: 'Multiple performance claims but insufficient technical specifications to verify them',
      analyzer: 'claimClassifier'
    });
  }

  // Superlative density
  const superlatives = claims.filter(c => 
    /\b(best|greatest|ultimate|supreme|perfect|flawless|unmatched)\b/i.test(c.text)
  );
  if (superlatives.length > 3) {
    flags.push({
      claim: `${superlatives.length} superlative claims`,
      type: 'SUPERLATIVE_OVERUSE',
      severity: CONSTANTS.SEVERITY.LOW,
      explanation: 'Frequent use of superlatives — marketing language pattern',
      analyzer: 'claimClassifier'
    });
  }

  return flags;
}
