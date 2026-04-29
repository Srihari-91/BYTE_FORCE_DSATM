// Reality Mapping Engine
// Spec normalization and truth-mapping engine
// Translates misleading numeric claims into real comparable measurements

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, computeRuleConfidence } from './_baseEngine.js';

const ENGINE_NAME = 'realityMappingEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'metric_realism';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

// Normalization rules for misleading metrics
const NORMALIZATION_RULES = [
  {
    id: '1-inch-sensor',
    patterns: [/\b1[-\s]?inch\s*sensor\b/i, /\b1"\s*sensor\b/i],
    claimed_metric: '1-inch sensor',
    normalized_metric: '13.2 x 8.8mm (type-1, 16mm "inch")',
    unit: 'mm',
    consumer_interpretation: 'Approximately 1/2.3 the area of a true 1-inch (25.4mm) circle; diagonal is ~15.9mm using type-1 notation',
    explanation: 'Camera sensor "inch" is a historical vidicon tube diameter, not 25.4mm. A "1-inch" sensor is actually ~13.2 x 8.8mm.',
    normalization_steps: [
      'Detected "1-inch sensor" claim',
      'Applied type-1 sensor standard (16mm diagonal, not 25.4mm)',
      'Computed actual dimensions: ~13.2 x 8.8mm'
    ],
    confidence: 0.95
  },
  {
    id: '1.5k-display',
    patterns: [/\b1\.5k\s*display\b/i, /\b1\.5k\s*(screen|panel|resolution)\b/i],
    claimed_metric: '1.5K display',
    normalized_metric: '~2712 x 1220 (varies by OEM: 2800x1260, 2772x1240)',
    unit: 'pixels',
    consumer_interpretation: 'Between Full HD+ (2400x1080) and Quad HD+ (3200x1440); not a standard resolution',
    explanation: '"1.5K" is a marketing term without standard definition. Different manufacturers use different resolutions.',
    normalization_steps: [
      'Detected "1.5K display" claim',
      'No industry standard for "1.5K" exists',
      'Mapped to common OEM resolutions: 2712x1220, 2800x1260, 2772x1240'
    ],
    confidence: 0.78
  },
  {
    id: '200mp-camera',
    patterns: [/\b200\s*mp\b/i, /\b200\s*megapixel\b/i],
    claimed_metric: '200MP camera',
    normalized_metric: '12.5MP (16-to-1 binning) or 50MP (4-to-1) effective output',
    unit: 'MP',
    consumer_interpretation: 'Default photos are 12.5MP or 50MP; 200MP mode sacrifices HDR, night mode, and processing speed',
    explanation: '200MP sensors use pixel binning (combining adjacent pixels) for light sensitivity. Default output is much lower.',
    normalization_steps: [
      'Detected 200MP claim',
      'Applied pixel binning knowledge: 200MP / 16 = 12.5MP (standard)',
      'Alternative: 200MP / 4 = 50MP (high-res mode)',
      'Noted: full 200MP mode disables computational photography features'
    ],
    confidence: 0.92
  },
  {
    id: '108mp-camera',
    patterns: [/\b108\s*mp\b/i, /\b108\s*megapixel\b/i],
    claimed_metric: '108MP camera',
    normalized_metric: '12MP (9-to-1 binning) or 27MP (4-to-1) effective output',
    unit: 'MP',
    consumer_interpretation: 'Default photos are 12MP via nonapixel binning; full 108MP mode available in good light only',
    explanation: '108MP sensors typically output 12MP via 9-to-1 binning for better low-light performance and dynamic range.',
    normalization_steps: [
      'Detected 108MP claim',
      'Applied nonapixel binning: 108MP / 9 = 12MP (standard output)',
      'Alternative: 108MP / 4 = 27MP (some modes)',
      'Noted: full resolution loses HDR stacking and night mode'
    ],
    confidence: 0.92
  },
  {
    id: '100x-zoom',
    patterns: [/\b100x\s*zoom\b/i, /\b100x\s*space\s*zoom\b/i],
    claimed_metric: '100x zoom',
    normalized_metric: '3-10x optical + 10-33x digital upscaling',
    unit: 'x',
    consumer_interpretation: 'Only 3-10x is optical; beyond that is software interpolation with severe quality degradation',
    explanation: '"100x zoom" combines a small optical range with massive digital zoom. Image quality degrades significantly beyond optical limit.',
    normalization_steps: [
      'Detected 100x zoom claim',
      'Separated optical vs digital components',
      'Typical smartphone optical: 3-10x periscope telephoto',
      'Remaining 10-33x is digital upscaling with heavy loss'
    ],
    confidence: 0.88
  },
  {
    id: '10000mah-powerbank',
    patterns: [/\b10000\s*mah\s*(power\s*bank|battery\s*pack|portable\s*charger)\b/i],
    claimed_metric: '10000mAh power bank',
    normalized_metric: '~6400-7000mAh effective at 5V output',
    unit: 'mAh',
    consumer_interpretation: 'Actual charge delivered to phone is ~64-70% of stated capacity due to voltage conversion and efficiency losses',
    explanation: 'Power bank capacity is measured at cell voltage (3.7V). Output at 5V with ~85% conversion efficiency reduces effective capacity.',
    normalization_steps: [
      'Detected 10000mAh power bank claim',
      'Cell voltage: 3.7V; output voltage: 5V',
      'Energy = 10000mAh * 3.7V = 37Wh',
      'Effective output = 37Wh / 5V * 0.85 efficiency = ~6290mAh',
      'Rounded to consumer-friendly range: 6400-7000mAh'
    ],
    confidence: 0.9
  },
  {
    id: '20000mah-powerbank',
    patterns: [/\b20000\s*mah\s*(power\s*bank|battery\s*pack|portable\s*charger)\b/i],
    claimed_metric: '20000mAh power bank',
    normalized_metric: '~12800-14000mAh effective at 5V output',
    unit: 'mAh',
    consumer_interpretation: 'Actual charge delivered is ~64-70% of stated capacity after voltage step-up and conversion losses',
    explanation: 'Same conversion applies: 20000mAh at 3.7V = 74Wh. At 5V with 85% efficiency = ~12580mAh effective.',
    normalization_steps: [
      'Detected 20000mAh power bank claim',
      'Energy = 20000mAh * 3.7V = 74Wh',
      'Effective output = 74Wh / 5V * 0.85 = ~12580mAh',
      'Consumer range: 12800-14000mAh'
    ],
    confidence: 0.9
  },
  {
    id: '480hz-touch',
    patterns: [/\b480\s*hz\s*touch\b/i, /\b480\s*hz\s*touch\s*sampling\b/i],
    claimed_metric: '480Hz touch sampling',
    normalized_metric: '480Hz touch digitizer polling rate (not display refresh)',
    unit: 'Hz',
    consumer_interpretation: 'Measures how often the screen checks for finger input; unrelated to visual smoothness (display refresh rate)',
    explanation: 'Touch sampling rate measures digitizer responsiveness. A 60Hz display can have 480Hz touch sampling — they are independent.',
    normalization_steps: [
      'Detected 480Hz touch sampling claim',
      'Distinguished touch sampling from display refresh',
      'Touch sampling = digitizer polling frequency',
      'Display refresh = panel update frequency'
    ],
    confidence: 0.93
  },
  {
    id: 'motion-rate-240',
    patterns: [/\bmotion\s*rate\s*240\b/i, /\b240\s*motion\s*rate\b/i],
    claimed_metric: 'Motion Rate 240',
    normalized_metric: '60Hz native panel with frame interpolation',
    unit: 'Hz',
    consumer_interpretation: 'TV inserts artificial frames between real frames; does not accept 240Hz input; increases input lag',
    explanation: 'TV "Motion Rate" multiplies native refresh by interpolation factor. Motion Rate 240 = 60Hz panel + interpolation.',
    normalization_steps: [
      'Detected Motion Rate 240 claim',
      'TV motion rate = native refresh * interpolation multiplier',
      '240 / 4 = 60Hz native panel',
      'Confirmed: interpolation adds input lag and creates soap opera effect'
    ],
    confidence: 0.92
  },
  {
    id: 'pixel-binning-generic',
    patterns: [/\b(\d{2,3})\s*mp\s*camera\b/i],
    claimed_metric: 'High megapixel camera',
    normalized_metric: 'Effective resolution depends on binning mode',
    unit: 'MP',
    consumer_interpretation: 'Default photo resolution is typically 1/4 to 1/16 of marketed megapixel count due to pixel binning',
    explanation: 'High-MP sensors bin pixels for better light capture. The marketed number is the sensor pixel count, not default output.',
    normalization_steps: [
      'Detected high megapixel camera claim',
      'Applied pixel binning principle: default output = sensor MP / binning ratio',
      'Standard binning ratios: 4-to-1 or 9-to-1 or 16-to-1',
      'Noted: full resolution mode disables computational photography'
    ],
    confidence: 0.8,
    dynamic: true
  }
];

/**
 * Map misleading metrics to normalized reality
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function mapReality(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const allText = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const specsText = normalizeText(Object.entries(product.specs || {}).map(([k, v]) => `${k}:${v}`).join(' '));
    const combinedText = allText + ' ' + specsText;

    for (const rule of NORMALIZATION_RULES) {
      for (const pattern of rule.patterns) {
        const match = combinedText.match(pattern);
        if (match) {
          // Skip generic rule if a more specific one already matched
          if (rule.dynamic && findings.some(f => f.structured_output.claimed_metric.includes('MP') && f.structured_output.claimed_metric !== rule.claimed_metric)) {
            continue;
          }

          const confidence = computeRuleConfidence(pattern, match[0], rule.confidence);

          findings.push({
            claim: match[0],
            classification: 'METRIC_NORMALIZED',
            severity: confidence > 0.9 ? 'medium' : 'high',
            confidence,
            evidence: [`Matched: "${match[0]}"`, `Normalized: ${rule.normalized_metric}`],
            reasoning_trace: rule.normalization_steps.map((step, idx) => trace(`STEP${idx + 1}`, step)),
            source_segments: [match[0]],
            structured_output: {
              claimed_metric: rule.claimed_metric,
              normalized_metric: rule.normalized_metric,
              unit: rule.unit,
              consumer_interpretation: rule.consumer_interpretation,
              confidence,
              explanation: rule.explanation,
              normalization_steps: rule.normalization_steps
            }
          });

          break; // Only match first pattern for this rule
        }
      }
    }

    return findings;
  }, product, ctx);
}

export default { mapReality };
