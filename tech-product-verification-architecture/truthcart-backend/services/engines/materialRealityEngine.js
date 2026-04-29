// Material Reality Engine
// Material marketing claim interpreter
// Detects premium-sounding material claims and maps them to practical reality

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace } from './_baseEngine.js';

const ENGINE_NAME = 'materialRealityEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'material_inflation';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

/**
 * Tag and evaluate material claims
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function tagMaterials(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');

    for (const [claim, data] of Object.entries(CONSTANTS.MATERIAL_INFLATION_MAP)) {
      const regex = new RegExp('\\b' + claim.replace(/\s+/g, '[-\\s]?') + '\\b', 'i');
      if (regex.test(text)) {
        const inflationLabel = data.inflationScore >= 7 ? 'extreme' :
                               data.inflationScore >= 5 ? 'high' :
                               data.inflationScore >= 3 ? 'moderate' : 'mild';

        findings.push({
          claim,
          classification: 'MATERIAL_INFLATION',
          severity: data.inflationScore >= 7 ? 'high' : data.inflationScore >= 5 ? 'medium' : 'low',
          confidence: 0.88,
          evidence: [
            `Claimed: "${claim}"`,
            `Actual material: ${data.actual}`,
            `Common usage: ${data.commonUsage}`,
            `Inflation score: ${data.inflationScore}/10`
          ],
          reasoning_trace: [
            trace('SCAN', `Detected material claim: "${claim}"`),
            trace('LOOKUP', `Found in material inflation map: score ${data.inflationScore}/10`),
            trace('TRANSLATE', `"${claim}" → ${data.actual}`),
            trace('CONTEXT', `Commonly used in: ${data.commonUsage}`),
            trace('INFLATE', `Inflation label: ${inflationLabel}`)
          ],
          source_segments: [claim],
          structured_output: {
            claim,
            actual_material: data.actual,
            practical_meaning: `This is ${data.actual}, commonly found in ${data.commonUsage}.`,
            inflation_score: data.inflationScore,
            inflation_label: inflationLabel,
            explanation: data.explanation
          }
        });
      }
    }

    // Generic material checks
    const genericChecks = [
      {
        pattern: /\b(all[-\s]metal\b|full[-\s]metal\b|metal\s*unibody)/i,
        claim: 'Metal unibody construction',
        actual: 'Metal frame with possible internal plastic structures or antenna lines',
        practical: 'Metal unibody may include plastic internal frames or antenna breaks for signal. Check construction details.',
        inflationScore: 4
      },
      {
        pattern: /\b(plastic|polycarbonate)\b/i,
        claim: 'Plastic/polycarbonate body',
        actual: 'Thermoplastic polymer (PC/ABS blend)',
        practical: 'More impact-resistant than glass but scratches more easily. Often undervalued despite practical durability.',
        inflationScore: 0
      },
      {
        pattern: /\b(leather|vegan\s*leather|pu\s*leather)\b/i,
        claim: 'Leather or vegan leather back',
        actual: 'Genuine leather or polyurethane (PU) synthetic leather',
        practical: 'Provides grip and premium feel but wears faster than glass or metal. Vegan leather = synthetic polyurethane.',
        inflationScore: 2
      },
      {
        pattern: /\b(aluminum|aluminium)\b/i,
        claim: 'Aluminum frame/body',
        actual: '6000-series or 7000-series aluminum alloy',
        practical: 'Lightweight with good heat dissipation. Anodized finish can scratch to reveal bare metal. Softer than steel.',
        inflationScore: 1
      },
      {
        pattern: /\b(gold|platinum|precious\s*metal)\b/i,
        claim: 'Precious metal construction',
        actual: 'Thin electroplated layer (microns thick) over base metal',
        practical: 'Purely aesthetic; no structural or functional benefit. Micron-thick plating will wear at contact points.',
        inflationScore: 7
      },
    ];

    for (const check of genericChecks) {
      if (check.pattern.test(text)) {
        const inflationLabel = check.inflationScore >= 7 ? 'extreme' :
                               check.inflationScore >= 5 ? 'high' :
                               check.inflationScore >= 3 ? 'moderate' : 'mild';

        // Skip if already covered by specific map
        if (findings.some(f => f.claim === check.claim)) continue;

        findings.push({
          claim: check.claim,
          classification: 'MATERIAL_INFLATION',
          severity: check.inflationScore >= 7 ? 'high' : check.inflationScore >= 5 ? 'medium' : 'low',
          confidence: 0.82,
          evidence: [`Detected: ${check.claim}`, `Actual: ${check.actual}`],
          reasoning_trace: [
            trace('SCAN', `Detected material: ${check.claim}`),
            trace('CLASSIFY', `Generic material classification`),
            trace('INFLATE', `Inflation score: ${check.inflationScore}/10 (${inflationLabel})`)
          ],
          structured_output: {
            claim: check.claim,
            actual_material: check.actual,
            practical_meaning: check.practical,
            inflation_score: check.inflationScore,
            inflation_label: inflationLabel,
            explanation: check.practical
          }
        });
      }
    }

    return findings;
  }, product, ctx);
}

export default { tagMaterials };
