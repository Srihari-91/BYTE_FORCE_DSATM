// Feature Origin Engine
// Feature attribution engine
// Determines whether marketed features are hardware-specific, OS-level, software-only, coming via update, or non-exclusive

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace } from './_baseEngine.js';

const ENGINE_NAME = 'featureOriginEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'feature_attribution';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

/**
 * Track feature origins — genuine innovations vs rebranded standards
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function trackFeatureOrigin(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const specsText = normalizeText(Object.entries(product.specs || {}).map(([k, v]) => `${k}:${v}`).join(' '));
    const allText = text + ' ' + specsText;

    // Check against known feature origin map
    for (const [feature, data] of Object.entries(CONSTANTS.FEATURE_ORIGIN_MAP)) {
      const regex = new RegExp('\\b' + feature.replace(/\s+/g, '[-\\s]?') + '\\b', 'i');
      if (regex.test(allText)) {
        findings.push({
          claim: feature,
          classification: 'FEATURE_ORIGIN_IDENTIFIED',
          severity: data.marketedAsInnovation && data.exclusivity === 'widespread' ? 'high' :
                    data.originType === 'SOFTWARE_ONLY' && data.marketedAsInnovation ? 'medium' : 'low',
          confidence: 0.88,
          evidence: [
            `Feature detected: "${feature}"`,
            `Origin type: ${data.originType}`,
            `Exclusivity: ${data.exclusivity}`,
            data.updateDependency ? 'Update-dependent: yes' : 'Update-dependent: no'
          ],
          reasoning_trace: [
            trace('SCAN', `Detected feature: "${feature}"`),
            trace('LOOKUP', `Origin type: ${data.originType}`),
            trace('EXCLUSIVITY', `Available: ${data.exclusivity}`),
            trace('INNOVATION', `Marketed as innovation: ${data.marketedAsInnovation}`),
            data.marketedAsInnovation && data.exclusivity === 'widespread'
              ? trace('FLAG', 'Marketed as innovation but widely available')
              : trace('OK', 'Feature attribution is accurate')
          ],
          source_segments: [feature],
          structured_output: {
            feature,
            origin_type: data.originType,
            exclusivity: data.exclusivity,
            update_dependency: data.updateDependency || false,
            marketed_as_innovation: data.marketedAsInnovation,
            explanation: data.explanation
          }
        });
      }
    }

    // Detect "world's first" claims
    const worldsFirstMatch = allText.match(/\b(world'?s?\s*first|first[-\s]ever|industry[-\s]first|pioneering)\b/i);
    if (worldsFirstMatch) {
      findings.push({
        claim: worldsFirstMatch[0],
        classification: 'WORLDS_FIRST_CLAIM',
        severity: 'medium',
        confidence: 0.78,
        evidence: [
          `Detected: "${worldsFirstMatch[0]}"`,
          '"World\'s first" claims are difficult to verify and often refer to narrow implementations'
        ],
        reasoning_trace: [
          trace('SCAN', `Detected superlative claim: "${worldsFirstMatch[0]}"`),
          trace('VERIFY', 'Scope of "world\'s first" is rarely defined'),
          trace('FLAG', 'Claim may be technically true for a narrow definition but misleading to consumers')
        ],
        source_segments: [worldsFirstMatch[0]],
        structured_output: {
          feature: worldsFirstMatch[0],
          origin_type: 'MARKETING',
          exclusivity: 'widespread',
          update_dependency: false,
          marketed_as_innovation: true,
          explanation: '"World\'s first" claims are difficult to verify and often refer to very specific, narrow implementations (e.g., "world\'s first phone with X feature in Y price range in Z country"). Verify the exact scope of the claim.'
        }
      });
    }

    // Detect AI features without dedicated hardware
    const aiMatch = allText.match(/\b(ai[-\s]?(?:powered|enhanced|driven)|artificial intelligence)\b/i);
    const hasNPU = /\b(npu|tpu|neural|ai\s*(?:engine|chip|core))\b/i.test(allText);
    if (aiMatch && !hasNPU) {
      findings.push({
        claim: aiMatch[0],
        classification: 'SOFTWARE_AI_CLAIM',
        severity: 'medium',
        confidence: 0.82,
        evidence: [
          `AI feature marketed: "${aiMatch[0]}"`,
          'No dedicated AI/NPU hardware detected in specifications'
        ],
        reasoning_trace: [
          trace('SCAN', `Detected AI marketing: "${aiMatch[0]}"`),
          trace('CHECK', 'Searching for dedicated AI hardware (NPU/TPU/Neural Engine)'),
          trace('RESULT', 'No dedicated AI hardware found'),
          trace('FLAG', 'AI features run on CPU/GPU, consuming more power and delivering lower performance than dedicated silicon')
        ],
        source_segments: [aiMatch[0]],
        structured_output: {
          feature: aiMatch[0],
          origin_type: 'SOFTWARE_ONLY',
          exclusivity: 'widespread',
          update_dependency: false,
          marketed_as_innovation: true,
          explanation: 'AI features are marketed but no dedicated NPU/TPU/neural engine is specified. These features run on the CPU or GPU, which is less efficient and slower than dedicated AI silicon found in flagship chips.'
        }
      });
    }

    // Detect OS features marketed as hardware innovation
    const osFeatures = [
      { pattern: /\b(dark\s*mode|always[-\s]on\s*display|aod)\b/i, name: 'Dark Mode / AOD', os: 'Android / iOS' },
      { pattern: /\b(digital\s*wellbeing|screen\s*time|focus\s*mode)\b/i, name: 'Digital Wellbeing', os: 'Android / iOS' },
      { pattern: /\b(night\s*shift|blue\s*light|eye\s*comfort)\b/i, name: 'Blue Light Filter', os: 'Universal' },
    ];

    for (const osFeature of osFeatures) {
      if (osFeature.pattern.test(allText)) {
        findings.push({
          claim: osFeature.name,
          classification: 'OS_LEVEL_FEATURE',
          severity: 'low',
          confidence: 0.85,
          evidence: [
            `Detected: ${osFeature.name}`,
            `Provided by: ${osFeature.os}`
          ],
          reasoning_trace: [
            trace('SCAN', `Detected feature: ${osFeature.name}`),
            trace('CLASSIFY', `Origin: ${osFeature.os} operating system feature`),
            trace('NOTE', 'Available on most devices running the same OS version')
          ],
          structured_output: {
            feature: osFeature.name,
            origin_type: 'OS_LEVEL',
            exclusivity: 'widespread',
            update_dependency: false,
            marketed_as_innovation: false,
            explanation: `${osFeature.name} is a standard feature of ${osFeature.os}. It is not a unique hardware innovation and is available on most devices running a recent version of the operating system.`
          }
        });
      }
    }

    return findings;
  }, product, ctx);
}

export default { trackFeatureOrigin };
