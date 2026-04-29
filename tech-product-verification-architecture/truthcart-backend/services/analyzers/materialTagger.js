// Material Tagger
// Tags and evaluates material claims in product descriptions
// Maps marketing material terms to real-world equivalents

import { CONSTANTS } from '../../config/constants.js';

/**
 * Tag and evaluate material claims
 * @param {string} description - Product description
 * @returns {Array} Material insights
 */
export function tagMaterials(description) {
  const insights = [];
  const text = (description || '').toLowerCase();

  // Check against known material map
  for (const [marketingTerm, reality] of Object.entries(CONSTANTS.MATERIAL_MAP)) {
    if (text.includes(marketingTerm.toLowerCase())) {
      insights.push({
        type: 'material',
        text: `"${marketingTerm}" → ${reality.reality}`,
        category: 'MATERIAL',
        confidence: reality.confidence
      });
    }
  }

  // Generic material quality checks
  const materialChecks = [
    {
      pattern: /\b(all[-\s]metal\b|full[-\s]metal\b|metal\s*unibody)/i,
      insight: '"Metal unibody" may include internal plastic frames or antenna lines. Check if the frame is truly all-metal or has plastic segments for signal passthrough.',
    },
    {
      pattern: /\b(plastic|polycarbonate)\b/i,
      insight: 'Plastic/polycarbonate body is more durable against drops than glass but may scratch more easily. Often perceived as less "premium" despite practical advantages.',
    },
    {
      pattern: /\b(leather|vegan\s*leather|pu\s*leather)\b/i,
      insight: 'Leather and vegan leather (PU) backs provide grip and a premium feel but may show wear (patina/scratches) faster than glass or metal. Vegan leather = synthetic polyurethane.',
    },
    {
      pattern: /\b(aluminum|aluminium)\b/i,
      insight: 'Aluminum is lightweight and dissipates heat well. Anodized finishes can scratch to reveal bare metal underneath. Softer than steel — may dent from drops.',
    },
    {
      pattern: /\b(magnesium\s*alloy)\b/i,
      insight: 'Magnesium alloy is lighter than aluminum with good strength-to-weight ratio. Common in premium laptops. More expensive to manufacture.',
    },
    {
      pattern: /\b(carbon\s*fiber)\b/i,
      insight: 'Carbon fiber is extremely strong and lightweight but expensive. Often used as a decorative layer rather than structural material in consumer electronics.',
    },
    {
      pattern: /\b(gold|platinum|precious\s*metal)\b/i,
      insight: 'Precious metal mentions in consumer electronics are typically thin plating/coating (microns thick), not solid material. Purely aesthetic, no functional benefit.',
    },
  ];

  for (const { pattern, insight } of materialChecks) {
    if (pattern.test(text)) {
      // Avoid duplicates
      const alreadyExists = insights.some(i => i.text === insight);
      if (!alreadyExists) {
        insights.push({
          type: 'material',
          text: insight,
          category: 'MATERIAL',
          confidence: 0.8
        });
      }
    }
  }

  // Check for absence of material info
  if (!text.includes('glass') && !text.includes('metal') && !text.includes('plastic') && 
      !text.includes('aluminum') && !text.includes('carbon') && !text.includes('titanium')) {
    insights.push({
      type: 'material',
      text: 'No specific build material mentioned. Unknown build quality — common in budget products where materials are a cost-cutting area.',
      category: 'MATERIAL',
      confidence: 0.6
    });
  }

  // IP Rating material implications
  const ipMatch = text.match(/ip(\d{2})/i);
  if (ipMatch) {
    const ipRating = parseInt(ipMatch[1]);
    let protection = '';
    if (ipRating >= 68) protection = 'dust-tight and protected against continuous immersion';
    else if (ipRating >= 67) protection = 'dust-tight and protected against temporary immersion';
    else if (ipRating >= 65) protection = 'dust-tight and protected against water jets';
    else if (ipRating >= 54) protection = 'limited dust ingress and splash resistant';

    if (protection) {
      insights.push({
        type: 'material',
        text: `IP${ipRating} rating: ${protection}. This requires gaskets and seals at every opening — these degrade over time with wear and tear.`,
        category: 'DURABILITY',
        confidence: 0.9
      });
    }
  }

  return insights;
}
