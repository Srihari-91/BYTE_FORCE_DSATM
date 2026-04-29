// Reality Mapper
// Maps marketing claims against known product category limitations
// Contextualizes claims based on real-world constraints

import { CONSTANTS } from '../../config/constants.js';

/**
 * Map claims against known product realities
 * @param {Object} product - Product data
 * @returns {Array} Reality-check insights
 */
export function mapReality(product) {
  const insights = [];

  if (!product) return insights;

  const description = (product.description || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  const allText = description + ' ' + title;
  const specs = product.specs || {};
  const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();

  // === Battery Reality ===
  if (allText.includes('all-day battery') || allText.includes('all day battery')) {
    const mahMatch = specsText.match(/(\d+)\s*mah/);
    let realityContext = '';
    
    if (mahMatch) {
      const mah = parseInt(mahMatch[1]);
      if (mah >= 5000) {
        realityContext = `With ${mah}mAh, all-day battery is realistic for moderate usage. Heavy usage (gaming, GPS, video) may still require mid-day charging.`;
      } else if (mah >= 4000) {
        realityContext = `With ${mah}mAh, all-day battery may be achievable with light usage. Moderate to heavy users should expect to charge before evening.`;
      } else {
        realityContext = `With only ${mah}mAh, "all-day battery" is unlikely for most users. This is likely for light/standby usage only.`;
      }
    } else {
      realityContext = 'Cannot verify "all-day battery" claim — battery capacity (mAh) not found in specifications. Real-world battery life varies significantly by usage.';
    }

    insights.push({
      type: 'reality',
      text: realityContext,
      category: 'BATTERY',
      confidence: 0.75
    });
  }

  // === Fast Charging Reality ===
  if (allText.includes('fast charge') || allText.includes('fast charging')) {
    const wattMatch = allText.match(/(\d+)\s*w/i);
    let realityContext = '';

    if (wattMatch) {
      const watts = parseInt(wattMatch[1]);
      if (watts >= 65) {
        realityContext = `${watts}W fast charging is genuinely fast — expect 0-50% in 15-25 minutes for most devices.`;
      } else if (watts >= 25) {
        realityContext = `${watts}W charging is moderately fast — expect 0-50% in about 30-40 minutes.`;
      } else {
        realityContext = `${watts}W is relatively slow by modern fast-charging standards. Many competitors offer 25W+.`;
      }
    } else {
      realityContext = 'Fast charging claim without wattage specification. Actual speed unknown — "fast" is subjective and unverifiable without numbers.';
    }

    insights.push({
      type: 'reality',
      text: realityContext,
      category: 'CHARGING',
      confidence: 0.7
    });
  }

  // === Slim/Light Reality ===
  if (allText.includes('slim') || allText.includes('thin') || allText.includes('lightweight')) {
    const batterySpec = specsText.match(/(\d+)\s*mah/);
    let realityContext = '';

    if (batterySpec) {
      const mah = parseInt(batterySpec[1]);
      if (mah < 4000) {
        realityContext = 'Slim/light design often comes with a smaller battery. This device\'s battery capacity is below average — the slim design trades off battery life.';
      } else {
        realityContext = 'Good battery capacity despite slim design — this is a positive engineering achievement.';
      }
    } else {
      realityContext = 'Slim design is a physical constraint — check if battery capacity and thermal management are compromised for the thin form factor.';
    }

    insights.push({
      type: 'tradeoff',
      text: realityContext,
      category: 'SIZE_WEIGHT',
      confidence: 0.7
    });
  }

  // === Gaming Reality ===
  if (allText.includes('gaming')) {
    const hasDedicatedGPU = specsText.includes('gpu') || 
                             specsText.includes('nvidia') || 
                             specsText.includes('amd') || 
                             specsText.includes('adreno') ||
                             specsText.includes('mali');
    const refreshRate = specsText.match(/(\d+)\s*hz/);
    const ram = specsText.match(/(\d+)\s*gb\s*(ram|memory)/);

    let realityContext = 'Marketed for gaming. ';
    if (!hasDedicatedGPU) {
      realityContext += 'No dedicated GPU found — gaming performance will be limited to integrated graphics. ';
    }
    if (refreshRate && parseInt(refreshRate[1]) < 90) {
      realityContext += `Display refresh rate is ${refreshRate[1]}Hz — below the gaming standard of 120Hz+. `;
    }
    if (ram && parseInt(ram[1]) < 8) {
      realityContext += `${ram[1]}GB RAM may struggle with modern games. 8GB+ is recommended for gaming.`;
    }

    if (realityContext !== 'Marketed for gaming. ') {
      insights.push({
        type: 'reality',
        text: realityContext.trim(),
        category: 'PERFORMANCE',
        confidence: 0.75
      });
    }
  }

  // === "Pro" / "Professional" Reality ===
  if (/\b(pro|professional)\b/i.test(allText) && !/\b(iphone|ipad|macbook|airpods)\b/i.test(title)) {
    insights.push({
      type: 'reality',
      text: '"Pro" is a marketing label, not an industry standard. Check if the features justify the "Pro" designation — many "Pro" products are standard mid-range devices.',
      category: 'OTHER',
      confidence: 0.7
    });
  }

  // === Camera Reality ===
  if (allText.includes('108mp') || allText.includes('200mp') || allText.includes('108 megapixel')) {
    insights.push({
      type: 'reality',
      text: 'High megapixel counts (108MP/200MP) typically use pixel-binning to produce 12-27MP final images. The large number is primarily a marketing differentiator. Sensor size and aperture matter more for image quality.',
      category: 'CAMERA',
      confidence: 0.85
    });
  }

  // === Refresh Rate Reality ===
  const refreshMatch = specsText.match(/(\d+)\s*hz.*(refresh|display)/);
  if (refreshMatch) {
    const hz = parseInt(refreshMatch[1]);
    if (hz >= 120) {
      insights.push({
        type: 'reality',
        text: `${hz}Hz refresh rate is excellent for smooth scrolling and gaming. However, higher refresh rates consume more battery — adaptive refresh rate can mitigate this.`,
        category: 'DISPLAY',
        confidence: 0.9
      });
    }
  }

  return insights;
}
