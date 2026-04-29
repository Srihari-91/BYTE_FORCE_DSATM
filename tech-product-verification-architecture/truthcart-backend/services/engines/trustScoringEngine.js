// Trust Scoring Engine
// Evidence-weighted deterministic trust scoring
// Computes trust score from 9 dimensional engine outputs

import { CONSTANTS } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';
import { logTrustScoreComputed, logScoringContribution } from '../audit/auditLogger.js';

const ENGINE_NAME = 'trustScoringEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];

const SEVERITY_IMPACT = CONSTANTS.SEVERITY_IMPACT;

/**
 * Compute dimension score from engine findings
 * @param {import('./engineSchema.js').EngineOutput} engineOutput
 * @returns {{score:number, trace:string[]}}
 */
function computeDimensionScore(engineOutput) {
  const findings = engineOutput.findings || [];
  let score = 100;
  const trace = [];

  trace.push(`Starting dimension "${engineOutput.score_contribution.dimension}" at 100`);

  for (const finding of findings) {
    const severity = finding.severity || 'info';
    const impact = SEVERITY_IMPACT[severity] || 0;
    const confidence = finding.confidence || 1.0;
    const deduction = impact * confidence;

    score -= deduction;
    trace.push(`  Finding: "${finding.claim?.substring(0, 60)}" | severity=${severity} | impact=${impact} | confidence=${confidence.toFixed(2)} | deduction=${deduction.toFixed(1)}`);
  }

  score = Math.max(10, Math.min(100, score));
  trace.push(`Dimension "${engineOutput.score_contribution.dimension}" final score: ${score.toFixed(1)}`);

  return { score, trace };
}

/**
 * Compute evidence summary across all engines
 * @param {Array<import('./engineSchema.js').EngineOutput>} engineOutputs
 * @returns {Object}
 */
function computeEvidenceSummary(engineOutputs) {
  const summary = { total_findings: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  for (const output of engineOutputs) {
    for (const finding of output.findings || []) {
      summary.total_findings++;
      summary[finding.severity || 'info']++;
    }
  }

  return summary;
}

/**
 * Fuse trust score with Reddit community signals
 * @param {number} baseScore
 * @param {number} redditScore
 * @returns {number}
 */
function fuseWithReddit(baseScore, redditScore) {
  // Reddit is now an adjustment, not a weighted component
  // Reddit score of 70 = neutral (no adjustment)
  // Reddit score < 70 = potential issues, reduce base score by up to 10 points
  // Reddit score > 70 = positive signals, increase base score by up to 5 points

  if (redditScore === 0) {
    // Reddit unavailable — no adjustment
    return baseScore;
  }

  const deviation = redditScore - 70; // neutral baseline
  const adjustment = deviation * 0.25; // max ±10 points (at 30 or 110 extremes)
  const adjusted = baseScore + adjustment;

  return Math.max(10, Math.min(100, adjusted));
}

/**
 * Get verdict from trust score
 * @param {number} score
 * @returns {string}
 */
function getVerdict(score) {
  if (score >= CONSTANTS.THRESHOLDS.EXCEPTIONAL) return CONSTANTS.VERDICTS.EXCEPTIONAL;
  if (score >= CONSTANTS.THRESHOLDS.RELIABLE) return CONSTANTS.VERDICTS.RELIABLE;
  if (score >= CONSTANTS.THRESHOLDS.MIXED) return CONSTANTS.VERDICTS.MIXED;
  if (score >= CONSTANTS.THRESHOLDS.HEAVY_MARKETING) return CONSTANTS.VERDICTS.HEAVY_MARKETING;
  return CONSTANTS.VERDICTS.BUYER_BEWARE;
}

/**
 * Get confidence level from score certainty
 * @param {number} score
 * @param {number} findingsCount
 * @returns {'high'|'medium'|'low'}
 */
function getConfidenceLevel(score, findingsCount) {
  if (findingsCount > 8 && score >= 60) return 'high';
  if (findingsCount > 4 && score >= 40) return 'medium';
  return 'low';
}

/**
 * Compute trust score from all engine outputs
 * @param {Array<import('./engineSchema.js').EngineOutput>} engineOutputs
 * @param {number} redditScore
 * @param {string} requestId
 * @returns {Object}
 */
export function computeTrustScore(engineOutputs, redditScore = 70, requestId = 'unknown') {
  const scoringTrace = [];
  const dimensionalBreakdown = [];
  let weightedSum = 0;
  let totalWeight = 0;

  scoringTrace.push('=== Trust Score Computation ===');
  scoringTrace.push(`Reddit community score: ${redditScore}`);

  for (const output of engineOutputs) {
    if (output.engine_failed) {
      scoringTrace.push(`Engine ${output.engine} failed — using neutral score of 70`);
      const dimWeight = output.score_contribution.weight || 0;
      dimensionalBreakdown.push({
        dimension: output.score_contribution.dimension,
        score: 70,
        weight: dimWeight,
        contribution: 70 * dimWeight,
        findings_count: 0
      });
      weightedSum += 70 * dimWeight;
      totalWeight += dimWeight;
      continue;
    }

    const { score, trace } = computeDimensionScore(output);
    const weight = output.score_contribution.weight || 0;
    const contribution = score * weight;

    scoringTrace.push(...trace);
    scoringTrace.push(`  Weight: ${weight}, Contribution: ${contribution.toFixed(2)}`);

    dimensionalBreakdown.push({
      dimension: output.score_contribution.dimension,
      score: Math.round(score),
      weight,
      contribution: Math.round(contribution * 100) / 100,
      findings_count: output.findings?.length || 0
    });

    weightedSum += contribution;
    totalWeight += weight;

    logScoringContribution(
      requestId,
      output.score_contribution.dimension,
      output.score_contribution.impact,
      contribution,
      score,
      trace
    );
  }

  // Normalize if weights don't sum to 1.0 (e.g., due to engine failures)
  const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 70;
  scoringTrace.push(`Weighted base score: ${baseScore.toFixed(2)}`);

  // Apply Reddit adjustment
  const finalScore = fuseWithReddit(baseScore, redditScore);
  scoringTrace.push(`After Reddit adjustment: ${finalScore.toFixed(2)}`);

  const roundedScore = Math.round(finalScore);
  const evidenceSummary = computeEvidenceSummary(engineOutputs);

  logTrustScoreComputed(
    requestId,
    roundedScore,
    dimensionalBreakdown,
    scoringTrace,
    evidenceSummary
  );

  logger.info(`Trust score computed: ${roundedScore} (Reddit: ${redditScore}, Base: ${baseScore.toFixed(1)})`);

  return {
    trust_score: roundedScore,
    confidence_level: getConfidenceLevel(roundedScore, evidenceSummary.total_findings),
    verdict: getVerdict(roundedScore),
    dimensional_breakdown: dimensionalBreakdown,
    scoring_trace: scoringTrace,
    evidence_summary: evidenceSummary
  };
}

export default { computeTrustScore };
