// Trade-off Visualizer Engine
// Deterministic trade-off inference engine
// Infers hidden engineering trade-offs omitted by marketing

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, extractMetrics } from './_baseEngine.js';

const ENGINE_NAME = 'tradeOffEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'tradeoff_concealment';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

/**
 * Detect hidden trade-offs in product claims and specs
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function detectTradeoffs(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const specs = product.specs || {};
    const specsText = normalizeText(Object.entries(specs).map(([k, v]) => `${k}:${v}`).join(' '));
    const allText = text + ' ' + specsText;

    const metrics = extractMetrics(allText);

    for (const rule of CONSTANTS.TRADE_OFF_RULES) {
      try {
        if (rule.condition(text, specs)) {
          const confidence = 0.82;
          findings.push({
            claim: rule.claimedBenefit,
            classification: 'HIDDEN_TRADEOFF',
            severity: rule.severity === 'high' ? 'high' : rule.severity === 'medium' ? 'medium' : 'low',
            confidence,
            evidence: [
              `Claimed benefit: ${rule.claimedBenefit}`,
              `Hidden trade-off: ${rule.hiddenTradeoff}`,
              `Affected metric: ${rule.affectedMetric}`
            ],
            reasoning_trace: [
              trace('RULE', `Evaluating trade-off rule: ${rule.id}`),
              trace('CONDITION', 'Rule condition matched against product data'),
              trace('INFER', `Inferred hidden trade-off: ${rule.hiddenTradeoff}`),
              trace('BASIS', rule.engineeringBasis)
            ],
            structured_output: {
              claimed_benefit: rule.claimedBenefit,
              hidden_tradeoff: rule.hiddenTradeoff,
              affected_metric: rule.affectedMetric,
              severity: rule.severity,
              explanation: rule.explanation,
              engineering_basis: rule.engineeringBasis
            }
          });
        }
      } catch (err) {
        // Rule evaluation error — skip this rule
        continue;
      }
    }

    // Additional dynamic trade-off: high MP + small sensor
    const hasHighMP = /\b(108|200)\s*mp\b/i.test(allText);
    const hasSensorSize = /\b(\d\/\d+\.?\d*|\d+\.?\d*)\s*inch\s*sensor\b/i.test(allText);
    if (hasHighMP && !hasSensorSize) {
      findings.push({
        claim: 'High megapixel camera (108MP/200MP)',
        classification: 'HIDDEN_TRADEOFF',
        severity: 'medium',
        confidence: 0.8,
        evidence: [
          'High megapixel count detected (108MP/200MP)',
          'Sensor size not specified in product description'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected 108MP/200MP camera claim'),
          trace('CHECK', 'Sensor size specification not found'),
          trace('INFER', 'High MP on small sensor = smaller pixels = worse low-light performance'),
          trace('BASIS', 'SNR is proportional to pixel area. Quadrupling pixels on same sensor area halves pixel linear dimension, reducing area to 1/4.')
        ],
        structured_output: {
          claimed_benefit: 'Ultra-high resolution photography (108MP/200MP)',
          hidden_tradeoff: 'Reduced low-light performance and dynamic range if sensor size is not proportionally larger',
          affected_metric: 'durability',
          severity: 'medium',
          explanation: 'High megapixel sensors with small pixels capture fewer photons per pixel, reducing signal-to-noise ratio in low light. Sensor size is more important than pixel count for image quality.',
          engineering_basis: 'Photon shot noise dominates in low light; smaller pixels collect fewer photons, degrading SNR and dynamic range.'
        }
      });
    }

    // Additional dynamic trade-off: 8K video
    if (/\b8k\s*video\b/i.test(allText)) {
      findings.push({
        claim: '8K video recording',
        classification: 'HIDDEN_TRADEOFF',
        severity: 'medium',
        confidence: 0.85,
        evidence: [
          '8K video recording capability detected',
          '8K requires significant storage, processing, and thermal headroom'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected 8K video recording claim'),
          trace('INFER', '8K video generates ~4x the data of 4K'),
          trace('TRADEOFF', 'Storage fills rapidly; device thermally throttles; battery drains faster'),
          trace('BASIS', '8K30 requires ~600-800Mbps bitrate; 1 minute = 3.6-4.8GB; SOC encoder runs at high load generating heat.')
        ],
        structured_output: {
          claimed_benefit: '8K ultra-high-resolution video recording',
          hidden_tradeoff: 'Massive storage consumption, thermal throttling, limited recording duration, and heavy battery drain',
          affected_metric: 'battery',
          severity: 'medium',
          explanation: '8K video requires ~600-800Mbps bitrate, consuming 3.5-5GB per minute. Most devices limit recording to 5-10 minutes due to overheating. 4K60 is more practical for typical users.',
          engineering_basis: 'H.265/HEVC encoding at 8K30 requires ~5-8W sustained encoder power. In sub-9mm chassis, this triggers thermal throttling within minutes.'
        }
      });
    }

    return findings;
  }, product, ctx);
}

export default { detectTradeoffs };
