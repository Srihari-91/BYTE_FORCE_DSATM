// Claim Extractor
// Extracts marketing claims from product descriptions using NLP patterns
// Identifies: superlatives, performance claims, battery claims, durability claims, etc.

import { splitSentences, extractKeywords, extractNumericValues } from './tokenizer.js';
import { CONSTANTS } from '../../config/constants.js';

/**
 * Extract claims from product description
 * @param {Object} product - Normalized product data
 * @returns {Array<{ text: string, type: string, pattern: string, confidence: number }>}
 */
export function extractClaims(product) {
  if (!product) return [];

  const claims = [];
  const text = [
    product.title || '',
    product.description || '',
    ...(product.highlights || []),
    Object.values(product.specs || {}).join(' ')
  ].join('. ');

  if (!text || text.length < 10) return claims;

  // Extract sentences as claim candidates
  const sentences = splitSentences(text);

  for (const sentence of sentences) {
    // Match against claim patterns
    const matched = matchClaimPatterns(sentence);
    if (matched.length > 0) {
      claims.push(...matched);
    }
  }

  // Deduplicate by text
  const seen = new Set();
  return claims.filter(c => {
    const key = c.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Match a sentence against known claim patterns
 */
function matchClaimPatterns(sentence) {
  const matches = [];
  const lower = sentence.toLowerCase();

  // === Performance Claims ===
  const perfPatterns = [
    { regex: /\b(up to|upto)\s*(\d+\.?\d*)\s*(ghz|mhz)\b/i, label: 'Processor speed claim' },
    { regex: /\b(\d+)\s*cores?\s*(processor|cpu|core)\b/i, label: 'Core count claim' },
    { regex: /\b(\d+)\s*(gb|tb)\s*(ram|memory)\b/i, label: 'Memory claim' },
    { regex: /\b(octa[-\s]?core|deca[-\s]?core|hexa[-\s]?core|quad[-\s]?core)\b/i, label: 'Multi-core claim' },
    { regex: /\b(fastest|quickest|speediest)\b/i, label: 'Superlative speed claim' },
    { regex: /\b(lightning[-\s]fast|blazing|ultra[-\s]fast|super[-\s]fast)\b/i, label: 'Vague speed superlative' },
    { regex: /\b(\d+x)\s*(faster|speed)\b/i, label: 'Speed multiplier claim' },
  ];

  for (const { regex, label } of perfPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'PERFORMANCE',
        pattern: label,
        confidence: 0.7
      });
      break;
    }
  }

  // === Battery Claims ===
  const batteryPatterns = [
    { regex: /\b(all[-\s]day battery|all day battery)\b/i, label: 'All-day battery claim' },
    { regex: /\b(\d+)\s*(hours?|hrs?)\s*(battery|battery life)\b/i, label: 'Battery hours claim' },
    { regex: /\b(\d+)\s*(mah|milliamp)\b/i, label: 'Battery capacity claim' },
    { regex: /\b(fast[-\s]charg|\d+w\s*charg|quick[-\s]charg|rapid[-\s]charg|turbo[-\s]charg)\b/i, label: 'Fast charging claim' },
    { regex: /\b(\d+%)\s*in\s*(\d+)\s*(min|minute)\b/i, label: 'Charge speed claim' },
    { regex: /\b(wireless[-\s]charg|qi[-\s]charg)\b/i, label: 'Wireless charging claim' },
    { regex: /\b(reverse[-\s]charg|power[-\s]shar)\b/i, label: 'Reverse charging claim' },
  ];

  for (const { regex, label } of batteryPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'BATTERY',
        pattern: label,
        confidence: 0.75
      });
      break;
    }
  }

  // === Durability Claims ===
  const durabilityPatterns = [
    { regex: /\b(military[-\s]grade|mil[-\s]std)\b/i, label: 'Military-grade durability claim' },
    { regex: /\b(water[-\s]resistant|waterproof|splash[-\s]proof)\b/i, label: 'Water resistance claim' },
    { regex: /\b(ip\d{2}|ipx\d|ipx\d{2})\b/i, label: 'IP rating claim' },
    { regex: /\b(drop[-\s]resistant|drop[-\s]proof|shatter[-\s]proof)\b/i, label: 'Drop resistance claim' },
    { regex: /\b(scratch[-\s]resistant|scratch[-\s]proof)\b/i, label: 'Scratch resistance claim' },
    { regex: /\b(gorilla[-\s]glass|ceramic[-\s]shield|dragontrail)\b/i, label: 'Branded glass protection claim' },
    { regex: /\b(rugged|durable|tough|reinforced)\b/i, label: 'Vague durability claim' },
  ];

  for (const { regex, label } of durabilityPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'DURABILITY',
        pattern: label,
        confidence: 0.7
      });
      break;
    }
  }

  // === Camera Claims ===
  const cameraPatterns = [
    { regex: /\b(\d+)\s*(mp|megapixel)\b/i, label: 'Megapixel claim' },
    { regex: /\b(ai[-\s]camera|ai[-\s]powered camera|intelligent camera)\b/i, label: 'AI camera claim' },
    { regex: /\b(portrait[-\s]mode|night[-\s]mode|pro[-\s]mode)\b/i, label: 'Camera mode claim' },
    { regex: /\b(4k|8k|1080p|720p)\s*(video|recording)\b/i, label: 'Video resolution claim' },
    { regex: /\b(optical[-\s]zoom|ois|optical[-\s]stabil)\b/i, label: 'Optical feature claim' },
    { regex: /\b(ultra[-\s]wide|telephoto|macro|depth)\s*(lens|camera|sensor)\b/i, label: 'Multi-lens claim' },
    { regex: /\b(dslr[-\s]like|dslr[-\s]quality|professional[-\s]grade camera)\b/i, label: 'Pro camera comparison claim' },
  ];

  for (const { regex, label } of cameraPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'CAMERA',
        pattern: label,
        confidence: 0.7
      });
      break;
    }
  }

  // === Display Claims ===
  const displayPatterns = [
    { regex: /\b(oled|amoled|super[-\s]amoled|dynamic[-\s]amoled|ltpo)\b/i, label: 'Display technology claim' },
    { regex: /\b(\d+)\s*(hz|hertz)\s*(refresh|display)\b/i, label: 'Refresh rate claim' },
    { regex: /\b(hdr10\+?|dolby[-\s]vision|hdr)\b/i, label: 'HDR claim' },
    { regex: /\b(retina|liquid[-\s]retina|super[-\s]retina)\b/i, label: 'Branded display claim' },
    { regex: /\b(\d+k|\d+p|full[-\s]hd|quad[-\s]hd|uhd|4k|8k)\b/i, label: 'Resolution claim' },
    { regex: /\b(\d+)\s*(nits?|cd\/m)\b/i, label: 'Brightness claim' },
  ];

  for (const { regex, label } of displayPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'DISPLAY',
        pattern: label,
        confidence: 0.75
      });
      break;
    }
  }

  // === Material Claims ===
  const materialPatterns = [
    { regex: /\b(premium[-\s]glass|premium[-\s]metal|premium[-\s]material)\b/i, label: 'Vague premium material claim' },
    { regex: /\b(aircraft[-\s]grade|aerospace[-\s]grade)\s*(aluminum|aluminium)\b/i, label: 'Aerospace material claim' },
    { regex: /\b(titanium|stainless[-\s]steel|aluminum|magnesium| carbon[-\s]fiber)\b/i, label: 'Specific material claim' },
    { regex: /\b(vegan[-\s]leather|genuine[-\s]leather|pu[-\s]leather)\b/i, label: 'Material type claim' },
  ];

  for (const { regex, label } of materialPatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'MATERIAL',
        pattern: label,
        confidence: 0.65
      });
      break;
    }
  }

  // === Software / Smart Claims ===
  const softwarePatterns = [
    { regex: /\b(ai[-\s]powered|artificial intelligence|machine learning|smart|intelligent)\b/i, label: 'AI/Smart claim' },
    { regex: /\b(\d+)\s*years?\s*(of\s*)?(updates?|upgrades?|support)\b/i, label: 'Update promise claim' },
    { regex: /\b(bloatware[-\s]free|clean[-\s]ui|stock[-\s]android|ad[-\s]free)\b/i, label: 'Software experience claim' },
  ];

  for (const { regex, label } of softwarePatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'SOFTWARE',
        pattern: label,
        confidence: 0.6
      });
      break;
    }
  }

  // === Generic Superlative/Exaggeration ===
  const superlativePatterns = [
    { regex: /\b(best[-\s]in[-\s]class|industry[-\s]leading|market[-\s]leading|award[-\s]winning)\b/i, label: 'Superlative claim' },
    { regex: /\b(unmatched|unbeatable|unrivaled|unsurpassed)\b/i, label: 'Absolute superlative claim' },
    { regex: /\b(world\'?s?\s*(first|best|fastest|thinnest|lightest))\b/i, label: 'Worlds-best claim' },
    { regex: /\b(revolutionary|groundbreaking|game[-\s]changing|next[-\s]gen)\b/i, label: 'Hype claim' },
    { regex: /\b(flagship[-\s]level|flagship[-\s]grade|flagship[-\s]killer)\b/i, label: 'Flagship comparison claim' },
  ];

  for (const { regex, label } of superlativePatterns) {
    if (regex.test(lower)) {
      matches.push({
        text: sentence.trim(),
        type: 'OTHER',
        pattern: label,
        confidence: 0.5
      });
      break;
    }
  }

  return matches;
}

/**
 * Extract specific battery-related numeric claims
 */
export function extractBatteryClaims(product) {
  const claims = [];
  const text = (product.description || '') + ' ' + (product.title || '');

  // Capacity
  const mahMatch = text.match(/(\d+[\d,]*)\s*mah/i);
  if (mahMatch) {
    claims.push({
      type: 'BATTERY',
      claim: `${mahMatch[1]} mAh battery`,
      value: parseInt(mahMatch[1].replace(/,/g, '')),
      unit: 'mAh'
    });
  }

  // Hours
  const hoursMatch = text.match(/(\d+\.?\d*)\s*(hours?|hrs?)\s*(of\s*)?(battery|usage|playback|talk|video)/i);
  if (hoursMatch) {
    claims.push({
      type: 'BATTERY',
      claim: `${hoursMatch[1]} hours ${hoursMatch[4] || 'battery life'}`,
      value: parseFloat(hoursMatch[1]),
      unit: 'hours'
    });
  }

  // Charging wattage
  const wattMatch = text.match(/(\d+)\s*w\s*(fast|quick|super|turbo|rapid)?\s*(charg|adapter)/i);
  if (wattMatch) {
    claims.push({
      type: 'CHARGING',
      claim: `${wattMatch[1]}W charging`,
      value: parseInt(wattMatch[1]),
      unit: 'watts'
    });
  }

  return claims;
}
