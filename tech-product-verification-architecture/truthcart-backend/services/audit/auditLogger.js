// Audit Logger
// Structured audit system for benchmarkability, demo-defensibility, and judicial traceability
// Emits JSON-lines format for capture by log aggregators

import { randomUUID } from 'crypto';

const AUDIT_ENABLED = process.env.AUDIT_ENABLED !== 'false';

/**
 * Generate a deterministic hash of an object for audit comparison
 * @param {Object} obj
 * @returns {string}
 */
function hashObject(obj) {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Emit a structured audit event
 * @param {string} requestId
 * @param {string} eventType
 * @param {Object} payload
 */
export function emitAuditEvent(requestId, eventType, payload) {
  if (!AUDIT_ENABLED) return;

  const event = {
    audit: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    payload
  };

  // JSON-lines format for production log capture
  console.log(JSON.stringify(event));
}

/**
 * Log extracted claims
 * @param {string} requestId
 * @param {Array<{text:string, type:string, confidence:number}>} claims
 * @param {string} sourceText
 */
export function logExtractedClaims(requestId, claims, sourceText) {
  emitAuditEvent(requestId, 'claim_extracted', {
    claim_count: claims.length,
    claims: claims.map(c => ({
      text: c.text?.substring(0, 200),
      type: c.type,
      confidence: c.confidence
    })),
    source_hash: hashObject(sourceText?.substring(0, 500))
  });
}

/**
 * Log engine execution
 * @param {string} requestId
 * @param {string} engineName
 * @param {Object} inputSnapshot
 * @param {import('../engines/engineSchema.js').EngineOutput} output
 * @param {number} durationMs
 */
export function logEngineExecution(requestId, engineName, inputSnapshot, output, durationMs) {
  emitAuditEvent(requestId, 'engine_executed', {
    engine: engineName,
    version: output.version,
    input_hash: hashObject(inputSnapshot),
    output_hash: hashObject(output.findings),
    findings_count: output.findings.length,
    deterministic: output.deterministic,
    engine_failed: output.engine_failed || false,
    failure_reason: output.failure_reason || null,
    duration_ms: durationMs
  });
}

/**
 * Log evidence for a specific finding
 * @param {string} requestId
 * @param {string} engineName
 * @param {string} findingId
 * @param {string[]} evidence
 * @param {string[]} reasoningTrace
 */
export function logEvidence(requestId, engineName, findingId, evidence, reasoningTrace) {
  emitAuditEvent(requestId, 'evidence_recorded', {
    engine: engineName,
    finding_id: findingId,
    evidence,
    reasoning_trace: reasoningTrace
  });
}

/**
 * Log scoring contribution
 * @param {string} requestId
 * @param {string} dimension
 * @param {number} rawImpact
 * @param {number} weightedImpact
 * @param {number} dimensionScore
 * @param {string[]} reasoning
 */
export function logScoringContribution(requestId, dimension, rawImpact, weightedImpact, dimensionScore, reasoning) {
  emitAuditEvent(requestId, 'scoring_contribution', {
    dimension,
    raw_impact: rawImpact,
    weighted_impact: weightedImpact,
    dimension_score: dimensionScore,
    reasoning
  });
}

/**
 * Log final trust score computation
 * @param {string} requestId
 * @param {number} trustScore
 * @param {Array<{dimension:string, score:number, weight:number, contribution:number}>} dimensionalBreakdown
 * @param {string[]} scoringTrace
 * @param {Object} evidenceSummary
 */
export function logTrustScoreComputed(requestId, trustScore, dimensionalBreakdown, scoringTrace, evidenceSummary) {
  emitAuditEvent(requestId, 'trust_score_computed', {
    trust_score: trustScore,
    dimensional_breakdown: dimensionalBreakdown,
    scoring_trace: scoringTrace,
    evidence_summary: evidenceSummary
  });
}

/**
 * Create a new audit context for a request
 * @returns {{ requestId: string, log: Function }}
 */
export function createAuditContext() {
  const requestId = randomUUID();

  return {
    requestId,
    log: (eventType, payload) => emitAuditEvent(requestId, eventType, payload)
  };
}

export default {
  emitAuditEvent,
  logExtractedClaims,
  logEngineExecution,
  logEvidence,
  logScoringContribution,
  logTrustScoreComputed,
  createAuditContext
};
