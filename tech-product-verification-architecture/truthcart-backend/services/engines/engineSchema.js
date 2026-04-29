// Engine Schema
// Standardized output contract for all Trust Intelligence Engines
// Every engine must return an object matching this schema

/**
 * @typedef {Object} EngineFinding
 * @property {string} [claim] - The specific claim being analyzed
 * @property {string} [classification] - Classification label from the engine
 * @property {'critical'|'high'|'medium'|'low'|'info'} [severity] - Finding severity
 * @property {number} confidence - 0-1, based on rule match strength (deterministic)
 * @property {string[]} evidence - Explicit evidence strings supporting the finding
 * @property {string[]} reasoning_trace - Step-by-step deterministic logic
 * @property {string[]} [source_segments] - Matched text segments from source
 * @property {Object} structured_output - Engine-specific structured data
 */

/**
 * @typedef {Object} ScoreContribution
 * @property {string} dimension - Scoring dimension name
 * @property {number} impact - -1 to +1, directional impact on trust
 * @property {number} weight - Dimension weight in overall score
 */

/**
 * @typedef {Object} EngineOutput
 * @property {string} engine - Engine name
 * @property {string} version - Engine version
 * @property {string} analyzed_at - ISO timestamp
 * @property {boolean} deterministic - Whether engine uses deterministic logic
 * @property {number} claims_processed - Number of claims processed
 * @property {EngineFinding[]} findings - Array of findings
 * @property {ScoreContribution} score_contribution - Contribution to trust score
 * @property {boolean} [engine_failed] - True if engine failed gracefully
 * @property {string} [failure_reason] - Reason for failure if applicable
 */

export const ENGINE_SCHEMA_VERSION = '2.0.0';

/**
 * Validate that an engine output conforms to the schema
 * @param {Object} output
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEngineOutput(output) {
  const errors = [];

  if (!output || typeof output !== 'object') {
    errors.push('Output must be an object');
    return { valid: false, errors };
  }

  if (!output.engine || typeof output.engine !== 'string') {
    errors.push('Missing or invalid "engine" field');
  }
  if (!output.version || typeof output.version !== 'string') {
    errors.push('Missing or invalid "version" field');
  }
  if (!output.analyzed_at || typeof output.analyzed_at !== 'string') {
    errors.push('Missing or invalid "analyzed_at" field');
  }
  if (typeof output.deterministic !== 'boolean') {
    errors.push('Missing or invalid "deterministic" field');
  }
  if (typeof output.claims_processed !== 'number') {
    errors.push('Missing or invalid "claims_processed" field');
  }
  if (!Array.isArray(output.findings)) {
    errors.push('Missing or invalid "findings" array');
  }
  if (!output.score_contribution || typeof output.score_contribution !== 'object') {
    errors.push('Missing or invalid "score_contribution" object');
  }

  for (let i = 0; i < (output.findings || []).length; i++) {
    const f = output.findings[i];
    if (typeof f.confidence !== 'number') {
      errors.push(`Finding[${i}]: missing confidence`);
    }
    if (!Array.isArray(f.evidence)) {
      errors.push(`Finding[${i}]: missing evidence array`);
    }
    if (!Array.isArray(f.reasoning_trace)) {
      errors.push(`Finding[${i}]: missing reasoning_trace array`);
    }
    if (!f.structured_output || typeof f.structured_output !== 'object') {
      errors.push(`Finding[${i}]: missing structured_output`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create a standardized empty engine output for graceful failures
 * @param {string} engineName
 * @param {string} reason
 * @returns {EngineOutput}
 */
export function createEmptyOutput(engineName, reason = 'Engine failed gracefully') {
  return {
    engine: engineName,
    version: ENGINE_SCHEMA_VERSION,
    analyzed_at: new Date().toISOString(),
    deterministic: true,
    claims_processed: 0,
    findings: [],
    score_contribution: {
      dimension: engineName.replace(/Engine$/, '').toLowerCase(),
      impact: 0,
      weight: 0
    },
    engine_failed: true,
    failure_reason: reason
  };
}

/**
 * Build a complete engine output from findings
 * @param {string} engineName
 * @param {string} version
 * @param {string} dimension
 * @param {number} weight
 * @param {EngineFinding[]} findings
 * @param {number} claimsProcessed
 * @returns {EngineOutput}
 */
export function buildEngineOutput(engineName, version, dimension, weight, findings, claimsProcessed = 0) {
  const totalImpact = findings.reduce((sum, f) => {
    const severityMultiplier = {
      critical: -1.0,
      high: -0.7,
      medium: -0.4,
      low: -0.15,
      info: 0
    };
    return sum + (severityMultiplier[f.severity || 'info'] || 0) * (f.confidence || 1);
  }, 0);

  // Clamp impact to [-1, 1]
  const clampedImpact = Math.max(-1, Math.min(1, totalImpact));

  return {
    engine: engineName,
    version: version || ENGINE_SCHEMA_VERSION,
    analyzed_at: new Date().toISOString(),
    deterministic: true,
    claims_processed: claimsProcessed,
    findings,
    score_contribution: {
      dimension,
      impact: clampedImpact,
      weight
    }
  };
}
