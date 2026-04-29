// Spec Translation Engine
// Deterministic marketing-to-technical specification translation engine
// Converts marketing terms into comparable technical reality

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, computeRuleConfidence } from './_baseEngine.js';

const ENGINE_NAME = 'specTranslationEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'comparability_distortion';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

// Deterministic translation dictionary
const TRANSLATION_DICTIONARY = {
  'unified memory': {
    translated: 'shared system RAM',
    normalized_meaning: 'RAM shared between CPU and GPU with no dedicated VRAM',
    comparability_impact: 'reduces effective RAM available to applications; not equivalent to discrete GPU with dedicated VRAM',
    category: 'MEMORY',
    confidence: 0.95
  },
  'motion rate 240': {
    translated: '60Hz native panel with motion interpolation',
    normalized_meaning: 'Native refresh rate is 60Hz; software creates intermediate frames for perceived smoothness',
    comparability_impact: 'not equivalent to true 120Hz or 240Hz panel; input lag may increase',
    category: 'DISPLAY',
    confidence: 0.92
  },
  'motion rate 120': {
    translated: '60Hz native panel with backlight scanning',
    normalized_meaning: 'Native refresh rate is 60Hz; backlight scanning or black frame insertion creates perceived smoothness',
    comparability_impact: 'not equivalent to true 120Hz; does not accept 120Hz input signal',
    category: 'DISPLAY',
    confidence: 0.92
  },
  'liquid retina': {
    translated: 'IPS LCD panel',
    normalized_meaning: 'LCD panel with LED backlighting and high pixel density',
    comparability_impact: 'lower contrast ratio than OLED; no per-pixel dimming; thicker panel',
    category: 'DISPLAY',
    confidence: 0.95
  },
  'retina xdr': {
    translated: 'high-density OLED or mini-LED backlight LCD',
    normalized_meaning: 'OLED with high peak brightness or LCD with mini-LED local dimming zones',
    comparability_impact: 'excellent contrast and brightness; OLED variants may exhibit PWM dimming',
    category: 'DISPLAY',
    confidence: 0.88
  },
  'super retina xdr': {
    translated: 'custom-calibrated high-density OLED',
    normalized_meaning: 'OLED panel manufactured by Samsung/LG with Apple-specific color calibration',
    comparability_impact: 'industry-leading color accuracy; same underlying technology as other premium OLED panels',
    category: 'DISPLAY',
    confidence: 0.9
  },
  'ai camera': {
    translated: 'software-enhanced computational camera',
    normalized_meaning: 'scene recognition and automatic filter adjustments via software algorithms',
    comparability_impact: 'quality depends on software implementation; not hardware differentiation',
    category: 'CAMERA',
    confidence: 0.92
  },
  'ai-powered': {
    translated: 'software-based algorithmic processing',
    normalized_meaning: 'pre-programmed algorithms or machine learning models running on standard compute hardware',
    comparability_impact: 'without dedicated NPU/TPU, AI features run on CPU/GPU and impact battery life',
    category: 'PERFORMANCE',
    confidence: 0.85
  },
  'adaptive refresh': {
    translated: 'variable refresh rate (VRR) display',
    normalized_meaning: 'display dynamically switches between low and high refresh rates based on content',
    comparability_impact: 'saves battery at low refresh; requires software support for full benefit',
    category: 'DISPLAY',
    confidence: 0.9
  },
  'ltpo': {
    translated: 'low-temperature polycrystalline oxide backplane',
    normalized_meaning: 'OLED backplane technology enabling variable refresh without additional display controller',
    comparability_impact: 'enables 1-120Hz adaptive refresh more efficiently than LTPS; primarily a power-saving feature',
    category: 'DISPLAY',
    confidence: 0.88
  },
  'qhd+': {
    translated: '3200 x 1440 resolution (approximate)',
    normalized_meaning: 'Quad HD Plus — higher than standard QHD (2560x1440)',
    comparability_impact: 'sharper than FHD+ but consumes more GPU power and battery',
    category: 'DISPLAY',
    confidence: 0.9
  },
  'fhd+': {
    translated: '2400 x 1080 resolution (approximate)',
    normalized_meaning: 'Full HD Plus — extended aspect ratio version of 1920x1080',
    comparability_impact: 'standard for mid-range smartphones; adequate sharpness for most users',
    category: 'DISPLAY',
    confidence: 0.92
  },
  'dolby atmos': {
    translated: 'licensed spatial audio processing',
    normalized_meaning: 'software-based surround sound simulation via Dolby Laboratories license',
    comparability_impact: 'requires content encoded in Dolby Atmos; standard stereo content unaffected',
    category: 'AUDIO',
    confidence: 0.9
  },
  'spatial audio': {
    translated: 'head-tracked binaural audio processing',
    normalized_meaning: 'software that adjusts stereo image based on head position via accelerometer/gyroscope',
    comparability_impact: 'effectiveness varies by content and headphone quality; not true object-based audio',
    category: 'AUDIO',
    confidence: 0.85
  },
  'fast charging': {
    translated: 'higher-wattage charging protocol',
    normalized_meaning: 'charging above 10-15W using proprietary or standard protocol (USB-PD, QC)',
    comparability_impact: 'actual speed depends on charger, cable, battery temperature, and device power management',
    category: 'CHARGING',
    confidence: 0.82
  },
  'wireless charging': {
    translated: 'Qi inductive charging',
    normalized_meaning: 'energy transfer via electromagnetic induction using Qi standard coil alignment',
    comparability_impact: 'slower and less efficient than wired; generates more heat; requires precise placement',
    category: 'CHARGING',
    confidence: 0.92
  },
  'military-grade': {
    translated: 'passed subset of MIL-STD-810 tests',
    normalized_meaning: 'tested against specific environmental conditions defined in MIL-STD-810',
    comparability_impact: 'does not cover all 29 test methods; lab conditions differ from real-world use',
    category: 'DURABILITY',
    confidence: 0.9
  },
  'ip68': {
    translated: 'IEC 60529 IP68 — dust-tight and continuous immersion protected',
    normalized_meaning: 'completely dust-tight; protected against continuous immersion in water under manufacturer-specified conditions',
    comparability_impact: 'tested in fresh water only; seals degrade over time; not permanently waterproof',
    category: 'DURABILITY',
    confidence: 0.95
  },
  'ip67': {
    translated: 'IEC 60529 IP67 — dust-tight and temporary immersion protected',
    normalized_meaning: 'completely dust-tight; protected against temporary immersion (typically 1m for 30 minutes)',
    comparability_impact: 'tested in fresh water; warranty typically does not cover liquid damage despite rating',
    category: 'DURABILITY',
    confidence: 0.95
  },
};

/**
 * Translate marketing specifications to normalized technical terms
 * @param {string} description
 * @param {Object} specs
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function translateSpecs(description, specs = {}, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    const allText = normalizeText(description || '') + ' ' + normalizeText(Object.values(specs).join(' '));

    for (const [term, data] of Object.entries(TRANSLATION_DICTIONARY)) {
      const regex = new RegExp('\\b' + term.replace(/\s+/g, '[-\\s]?') + '\\b', 'i');
      if (regex.test(allText)) {
        const match = allText.match(regex);
        const confidence = computeRuleConfidence(regex, match?.[0], data.confidence);

        findings.push({
          claim: term,
          classification: 'MARKETING_TERM_TRANSLATED',
          severity: confidence > 0.9 ? 'low' : 'medium',
          confidence,
          evidence: [`Matched term: "${term}" in product description`, `Translation: ${data.translated}`],
          reasoning_trace: [
            trace('SCAN', `Searching for marketing term: "${term}"`),
            trace('MATCH', `Found match in product text`),
            trace('TRANSLATE', `"${term}" → "${data.translated}"`),
            trace('IMPACT', `Comparability impact: ${data.comparability_impact}`)
          ],
          source_segments: match ? [match[0]] : [],
          structured_output: {
            marketing_term: term,
            translated_term: data.translated,
            normalized_meaning: data.normalized_meaning,
            comparability_impact: data.comparability_impact,
            explanation: `"${term}" is a marketing term that translates to "${data.translated}". ${data.normalized_meaning}`,
            category: data.category
          }
        });
      }
    }

    return findings;
  }, description, specs, ctx);
}

export default { translateSpecs };
