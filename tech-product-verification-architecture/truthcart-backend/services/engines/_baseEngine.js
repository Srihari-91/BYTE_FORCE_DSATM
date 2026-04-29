// Base Engine
// Template providing input normalization, graceful failure, reasoning trace accumulation,
// and benchmark logging hooks for all Trust Intelligence Engines

import { createEmptyOutput, buildEngineOutput } from './engineSchema.js';
import { logger } from '../../utils/logger.js';

/**
 * Normalize input text for deterministic processing
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Flatten product specs into a normalized string
 * @param {Object} specs
 * @returns {string}
 */
export function flattenSpecs(specs = {}) {
  return Object.entries(specs)
    .map(([k, v]) => `${normalizeText(k)}: ${normalizeText(String(v))}`)
    .join(' ');
}

/**
 * Deduplicate findings by a key extractor
 * @param {Array} findings
 * @param {Function} keyFn
 * @returns {Array}
 */
export function deduplicateFindings(findings, keyFn = (f) => JSON.stringify(f.structured_output)) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = keyFn(f);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Build a reasoning trace entry
 * @param {string} step
 * @param {string} detail
 * @returns {string}
 */
export function trace(step, detail) {
  return `[${step}] ${detail}`;
}

/**
 * Execute an engine function with graceful failure handling
 * @param {string} engineName
 * @param {string} version
 * @param {string} dimension
 * @param {number} weight
 * @param {Function} engineFn - Async or sync function returning findings array
 * @param {...any} args - Arguments to pass to engineFn
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function runEngine(engineName, version, dimension, weight, engineFn, ...args) {
  const startTime = performance.now();
  const requestId = args[args.length - 1]?.__requestId || 'unknown';

  try {
    const result = await engineFn(...args);

    // Support engines that return raw findings array or pre-built output
    let output;
    if (result && result.engine && Array.isArray(result.findings)) {
      output = result;
    } else if (Array.isArray(result)) {
      output = buildEngineOutput(engineName, version, dimension, weight, result);
    } else {
      output = buildEngineOutput(engineName, version, dimension, weight, []);
    }

    const duration = Math.round(performance.now() - startTime);
    logger.logEngineDecision(engineName, dimension, output.findings.length, duration, requestId);

    return output;
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    logger.warn(`Engine ${engineName} failed:`, err.message);
    logger.logEngineDecision(engineName, dimension, 0, duration, requestId, err.message);

    return createEmptyOutput(engineName, err.message);
  }
}

/**
 * Extract all numeric values with units from text
 * @param {string} text
 * @returns {Array<{value:number, unit:string, raw:string}>}
 */
export function extractMetrics(text) {
  const metrics = [];
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(mah)\b/gi, unit: 'mAh' },
    { regex: /(\d+(?:\.\d+)?)\s*(gb|tb)\b/gi, unit: 'GB' },
    { regex: /(\d+(?:\.\d+)?)\s*(hz)\b/gi, unit: 'Hz' },
    { regex: /(\d+(?:\.\d+)?)\s*(mp|megapixel)\b/gi, unit: 'MP' },
    { regex: /(\d+(?:\.\d+)?)\s*(w|watt)\b/gi, unit: 'W' },
    { regex: /(\d+(?:\.\d+)?)\s*(inch|inches|")\b/gi, unit: 'inch' },
    { regex: /(\d+(?:\.\d+)?)\s*(mm)\b/gi, unit: 'mm' },
    { regex: /(\d+(?:\.\d+)?)\s*(g|gram|gm)\b/gi, unit: 'g' },
    { regex: /(\d+(?:\.\d+)?)\s*(nits?)\b/gi, unit: 'nits' }
  ];

  for (const { regex, unit } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      metrics.push({
        value: parseFloat(match[1]),
        unit: unit.toLowerCase(),
        raw: match[0]
      });
    }
  }

  return metrics;
}

/**
 * Compute confidence from rule match specificity
 * @param {RegExp} pattern
 * @param {string} matchedText
 * @param {number} [baseConfidence=0.85]
 * @returns {number}
 */
export function computeRuleConfidence(pattern, matchedText, baseConfidence = 0.85) {
  let confidence = baseConfidence;

  // Exact phrase match (no wildcards) gets higher confidence
  const isExactPhrase = !pattern.source.includes('.*') && !pattern.source.includes('.+') && !pattern.source.includes('\\d');
  if (isExactPhrase) {
    confidence = Math.min(1.0, confidence + 0.1);
  }

  // Longer matched text = more context = higher confidence
  if (matchedText && matchedText.length > 20) {
    confidence = Math.min(1.0, confidence + 0.05);
  }

  return parseFloat(confidence.toFixed(3));
}
