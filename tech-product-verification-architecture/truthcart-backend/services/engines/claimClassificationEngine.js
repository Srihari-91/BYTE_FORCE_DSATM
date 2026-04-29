// Claim Classification Engine
// Deterministic rule-based claim classification engine
// Detects vague, non-verifiable, and conditional marketing claims

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, computeRuleConfidence, trace } from './_baseEngine.js';

const ENGINE_NAME = 'claimClassificationEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'claim_verifiability';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

// Evidence-backed benchmarks and certifications for verification upgrade
const EVIDENCE_BENCHMARKS = new Set([
  'geekbench', 'antutu', '3dmark', 'gfxbench', 'pcmark', 'cinebench', 'passmark',
  'dxomark', 'displaymate'
]);

const EVIDENCE_CERTIFICATIONS = new Set([
  'ip68', 'ip67', 'ip65', 'ip53', 'mil-std', 'mil-std-810',
  'hi-res audio', 'hi-res', 'ldac', 'aptx', 'dolby vision', 'hdr10+',
  'tuv', 'sgs', 'ul', 'ce', 'fcc'
]);

/**
 * Classify claims into deterministic categories
 * @param {Array<{text:string, type?:string}>} claims
 * @param {Object} [product]
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function classifyClaims(claims, product = {}, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    const normalizedClaims = (claims || []).map(c => ({
      ...c,
      _normalized: normalizeText(c.text || '')
    }));

    for (let i = 0; i < normalizedClaims.length; i++) {
      const claim = normalizedClaims[i];
      const result = classifySingleClaim(claim, product);
      if (result) {
        findings.push(result);
      }
    }

    // Add aggregate finding if high ratio of unverifiable claims
    const unverifiableCount = findings.filter(f =>
      f.structured_output.verification_status === 'unverifiable'
    ).length;
    const totalClaims = normalizedClaims.length;

    if (totalClaims > 3 && unverifiableCount / totalClaims > 0.5) {
      findings.push({
        claim: `${unverifiableCount} of ${totalClaims} claims are unverifiable`,
        classification: 'AGGREGATE_UNVERIFIABLE_RATIO',
        severity: 'medium',
        confidence: 0.9,
        evidence: [`${unverifiableCount} unverifiable claims detected`, `Total claims: ${totalClaims}`],
        reasoning_trace: [
          trace('AGGREGATE', `Analyzed ${totalClaims} claims`),
          trace('RATIO', `${unverifiableCount} classified as unverifiable (${((unverifiableCount/totalClaims)*100).toFixed(0)}%)`),
          trace('THRESHOLD', 'Ratio exceeds 50% threshold for marketing-heavy description')
        ],
        structured_output: {
          unverifiable_count: unverifiableCount,
          total_claims: totalClaims,
          ratio: unverifiableCount / totalClaims,
          claim_type: 'AGGREGATE',
          verification_status: 'unverifiable',
          evidence_required: ['independent verification of marketing claims'],
          reason: 'Majority of claims use vague or superlative language without verifiable metrics'
        }
      });
    }

    return findings;
  }, claims, product, ctx);
}

function classifySingleClaim(claim, product) {
  const text = claim._normalized || normalizeText(claim.text || '');
  if (!text) return null;

  const patterns = CONSTANTS.CLAIM_CLASSIFICATION_PATTERNS;

  // Priority order: QUANTIFIABLE → EVIDENCE_BACKED → CONDITIONAL → NON_VERIFIABLE → MARKETING_VAGUE
  let matchedType = null;
  let matchedPatterns = [];
  let highestConfidence = 0;

  // 1. Check QUANTIFIABLE first
  for (const rule of patterns.QUANTIFIABLE) {
    const match = text.match(rule.pattern);
    if (match) {
      matchedType = 'QUANTIFIABLE';
      const conf = computeRuleConfidence(rule.pattern, match[0], 0.9);
      matchedPatterns.push({ rule: rule.reason, match: match[0], confidence: conf });
      highestConfidence = Math.max(highestConfidence, conf);
    }
  }

  // 2. Check EVIDENCE_BACKED (can upgrade quantifiable)
  for (const rule of patterns.EVIDENCE_BACKED) {
    const match = text.match(rule.pattern);
    if (match) {
      // If already quantifiable, upgrade to evidence-backed if benchmark/cert mentioned
      const isBenchmark = EVIDENCE_BENCHMARKS.has(match[0].toLowerCase().replace(/\s+/g, ''));
      const isCert = EVIDENCE_CERTIFICATIONS.has(match[0].toLowerCase().replace(/\s+/g, ''));

      if (matchedType === 'QUANTIFIABLE' && (isBenchmark || isCert)) {
        matchedType = 'EVIDENCE_BACKED';
      } else if (!matchedType) {
        matchedType = 'EVIDENCE_BACKED';
      }

      const conf = computeRuleConfidence(rule.pattern, match[0], 0.88);
      matchedPatterns.push({ rule: rule.reason, match: match[0], confidence: conf });
      highestConfidence = Math.max(highestConfidence, conf);
    }
  }

  // 3. Check CONDITIONAL
  if (!matchedType) {
    for (const rule of patterns.CONDITIONAL) {
      const match = text.match(rule.pattern);
      if (match) {
        matchedType = 'CONDITIONAL';
        const conf = computeRuleConfidence(rule.pattern, match[0], 0.85);
        matchedPatterns.push({ rule: rule.reason, match: match[0], confidence: conf });
        highestConfidence = Math.max(highestConfidence, conf);
      }
    }
  }

  // 4. Check NON_VERIFIABLE
  if (!matchedType) {
    for (const rule of patterns.NON_VERIFIABLE) {
      const match = text.match(rule.pattern);
      if (match) {
        matchedType = 'NON_VERIFIABLE';
        const conf = computeRuleConfidence(rule.pattern, match[0], 0.82);
        matchedPatterns.push({ rule: rule.reason, match: match[0], confidence: conf });
        highestConfidence = Math.max(highestConfidence, conf);
      }
    }
  }

  // 5. Check MARKETING_VAGUE
  if (!matchedType) {
    for (const rule of patterns.MARKETING_VAGUE) {
      const match = text.match(rule.pattern);
      if (match) {
        matchedType = 'MARKETING_VAGUE';
        const conf = computeRuleConfidence(rule.pattern, match[0], 0.78);
        matchedPatterns.push({ rule: rule.reason, match: match[0], confidence: conf });
        highestConfidence = Math.max(highestConfidence, conf);
      }
    }
  }

  if (!matchedType) {
    return null; // No pattern matched
  }

  const verificationStatus =
    matchedType === 'EVIDENCE_BACKED' || matchedType === 'QUANTIFIABLE'
      ? 'verifiable'
      : matchedType === 'CONDITIONAL'
        ? 'conditionally_verifiable'
        : 'unverifiable';

  const evidenceRequired = buildEvidenceRequired(matchedType, text, product);
  const reason = buildReason(matchedType, matchedPatterns);
  const severity = getSeverity(matchedType, matchedPatterns.length);

  return {
    claim: claim.text,
    classification: matchedType,
    severity,
    confidence: highestConfidence,
    evidence: matchedPatterns.map(p => `Matched "${p.match}": ${p.rule}`),
    reasoning_trace: [
      trace('INPUT', `Claim text: "${claim.text}"`),
      trace('NORMALIZE', `Normalized: "${text}"`),
      trace('PATTERN_MATCH', `Type=${matchedType}, patterns=${matchedPatterns.length}`),
      trace('CONFIDENCE', `Highest confidence: ${highestConfidence}`),
      trace('CLASSIFY', `Verification status: ${verificationStatus}`)
    ],
    source_segments: matchedPatterns.map(p => p.match),
    structured_output: {
      claim_type: matchedType,
      verification_status: verificationStatus,
      evidence_required: evidenceRequired,
      confidence: highestConfidence,
      reason,
      matched_rules: matchedPatterns.map(p => p.rule),
      source_position: claim.position || null
    }
  };
}

function buildEvidenceRequired(type, text, product) {
  switch (type) {
    case 'NON_VERIFIABLE':
      return ['independent benchmark comparison', 'measurable performance metric', 'third-party certification'];
    case 'CONDITIONAL':
      return ['typical value (not just maximum)', 'test conditions', 'minimum guaranteed performance'];
    case 'MARKETING_VAGUE':
      return ['specific technical specification', 'quantified metric', 'comparison baseline'];
    case 'EVIDENCE_BACKED':
      return ['verify certification is current and complete', 'check benchmark conditions'];
    case 'QUANTIFIABLE':
      return ['confirm unit and measurement standard', 'verify if value is typical or peak'];
    default:
      return [];
  }
}

function buildReason(type, patterns) {
  const patternReasons = patterns.map(p => p.rule).join('; ');
  switch (type) {
    case 'NON_VERIFIABLE':
      return `Claim uses superlative or subjective language without measurable criteria: ${patternReasons}`;
    case 'CONDITIONAL':
      return `Claim is qualified by conditions or upper bounds: ${patternReasons}`;
    case 'MARKETING_VAGUE':
      return `Claim uses vague marketing adjectives without specific metrics: ${patternReasons}`;
    case 'EVIDENCE_BACKED':
      return `Claim references verifiable standard or benchmark: ${patternReasons}`;
    case 'QUANTIFIABLE':
      return `Claim contains explicit numeric value with unit: ${patternReasons}`;
    default:
      return 'Unknown classification';
  }
}

function getSeverity(type, patternCount) {
  if (type === 'NON_VERIFIABLE') return patternCount > 1 ? 'high' : 'medium';
  if (type === 'MARKETING_VAGUE') return 'medium';
  if (type === 'CONDITIONAL') return 'low';
  if (type === 'EVIDENCE_BACKED') return 'info';
  if (type === 'QUANTIFIABLE') return 'info';
  return 'low';
}

export default { classifyClaims };
