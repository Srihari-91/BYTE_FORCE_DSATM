// Config Consistency Engine
// Deterministic product configuration validator
// Detects impossible or misleading spec combinations in hero banners and pricing

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, extractMetrics } from './_baseEngine.js';

const ENGINE_NAME = 'configConsistencyEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'config_consistency';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

// Processor tier classification for impossible combination detection
const PROCESSOR_TIERS = {
  flagship: /\b(snapdragon\s*8\s*gen\s*[34]|a1[789]\s*(pro|bionic)?|dimensity\s*9[3-9]\d\d|m[234]\s*(pro|max)?|tensor\s*g[34]|exynos\s*2200|ryzen\s*9|i9[-\s])\b/i,
  high: /\b(snapdragon\s*8\s*gen\s*[12]|snapdragon\s*888|a1[456]\s*(bionic)?|dimensity\s*8[2-9]\d\d|tensor\s*g[12]|exynos\s*2100|ryzen\s*7|i7[-\s])\b/i,
  mid: /\b(snapdragon\s*7\s*gen\s*\d|dimensity\s*7[0-9]\d\d|a1[234]\s*(bionic)?|helio\s*g9\d|ryzen\s*5|i5[-\s])\b/i,
  entry: /\b(snapdragon\s*[46]\d{2,3}|dimensity\s*[46]\d\d\d|helio\s*[gpk]\d+|mediatek\s*mt|ryzen\s*3|i3[-\s])\b/i,
};

/**
 * Check product configuration consistency
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function checkConfigConsistency(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const description = normalizeText(product.description || '');
    const title = normalizeText(product.title || '');
    const allText = description + ' ' + title;
    const specs = product.specs || {};

    // Build configuration matrix from description
    const configMatrix = buildConfigMatrix(allText, specs);

    // Parse advertised hero config
    const advertisedConfig = parseAdvertisedConfig(allText, specs);

    // Check 1: Hero config mismatch
    if (advertisedConfig && configMatrix.length > 0) {
      const heroMatch = findMatchingVariant(advertisedConfig, configMatrix);
      if (!heroMatch.exact && !heroMatch.partial) {
        findings.push({
          claim: `Advertised config does not match purchasable variants`,
          classification: 'HERO_CONFIG_MISMATCH',
          severity: 'high',
          confidence: 0.9,
          evidence: [
            `Advertised: RAM=${advertisedConfig.ram}GB, Storage=${advertisedConfig.storage}GB`,
            `Available variants: ${configMatrix.map(v => `${v.ram}GB/${v.storage}GB`).join(', ')}`
          ],
          reasoning_trace: [
            trace('PARSE', `Extracted advertised config from hero: ${JSON.stringify(advertisedConfig)}`),
            trace('MATRIX', `Built ${configMatrix.length} purchasable variants from description`),
            trace('COMPARE', 'No exact or partial match found in purchasable matrix'),
            trace('FLAG', 'Hero banner may be showing non-existent configuration')
          ],
          structured_output: {
            advertised_config: advertisedConfig,
            purchasable_config_match: false,
            matching_variants: [],
            mismatch_type: 'HERO_CONFIG_MISMATCH',
            severity: 'high',
            explanation: 'Advertised specs do not exist in a single purchasable configuration. The hero banner may show a combination of specs from different variants.',
            config_matrix: configMatrix
          }
        });
      }
    }

    // Check 2: Impossible combinations
    const impossibleFindings = detectImpossibleCombinations(configMatrix, allText);
    findings.push(...impossibleFindings);

    // Check 3: Lowest price / highest spec deception
    const priceSpecFinding = detectPriceSpecDeception(allText, configMatrix, specs);
    if (priceSpecFinding) findings.push(priceSpecFinding);

    // Check 4: "Up to" patterns hiding base config
    const upToFindings = detectUpToPatterns(allText, specs, configMatrix);
    findings.push(...upToFindings);

    return findings;
  }, product, ctx);
}

function buildConfigMatrix(text, specs) {
  const variants = [];

  // Look for variant patterns like "8GB/128GB, 12GB/256GB" or "8GB RAM + 128GB Storage"
  const variantPatterns = [
    /(\d+)\s*gb\s*(?:ram)?[/+\s]+(\d+)\s*(gb|tb)\s*(?:storage|rom)?/gi,
    /(\d+)\s*gb\s*ram\s*[,/]\s*(\d+)\s*gb\s*rom/gi,
  ];

  for (const pattern of variantPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const ram = parseInt(match[1]);
      const storageRaw = parseInt(match[2]);
      const storageUnit = (match[3] || 'gb').toLowerCase();
      const storage = storageUnit === 'tb' ? storageRaw * 1024 : storageRaw;

      variants.push({ ram, storage, chipset: null, display: null, price: null });
    }
  }

  // Extract explicit variant mentions
  const ramVariants = [...text.matchAll(/(\d+)\s*gb\s*(?:ram|memory)/gi)].map(m => parseInt(m[1]));
  const storageVariants = [...text.matchAll(/(\d+)\s*(gb|tb)\s*(?:storage|rom)/gi)].map(m => {
    const val = parseInt(m[1]);
    return m[2].toLowerCase() === 'tb' ? val * 1024 : val;
  });

  // If we have multiple RAM and storage values but no paired variants, generate possible combinations
  if (variants.length === 0 && ramVariants.length > 1 && storageVariants.length > 0) {
    for (const ram of [...new Set(ramVariants)]) {
      for (const storage of [...new Set(storageVariants)]) {
        variants.push({ ram, storage, chipset: null, display: null, price: null });
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  return variants.filter(v => {
    const key = `${v.ram}-${v.storage}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseAdvertisedConfig(text, specs) {
  const ramMatch = text.match(/(\d+)\s*gb\s*(?:ram|memory)/i) ||
                   Object.entries(specs).find(([k]) => /ram|memory/i.test(k));
  const storageMatch = text.match(/(\d+)\s*(gb|tb)\s*(?:storage|rom)/i) ||
                       Object.entries(specs).find(([k]) => /storage|rom/i.test(k));

  const ram = ramMatch ? parseInt(ramMatch[1] || ramMatch[1]) : null;
  const storageRaw = storageMatch ? parseInt(storageMatch[1] || storageMatch[1]) : null;
  const storageUnit = storageMatch && storageMatch[2] ? storageMatch[2].toLowerCase() : 'gb';
  const storage = storageUnit === 'tb' && storageRaw ? storageRaw * 1024 : storageRaw;

  // Detect chipset from specs or title
  let chipset = null;
  for (const [tier, regex] of Object.entries(PROCESSOR_TIERS)) {
    if (regex.test(text)) {
      chipset = tier;
      break;
    }
  }

  if (!ram && !storage) return null;

  return { ram, storage, chipset, display: null };
}

function findMatchingVariant(advertised, matrix) {
  const exact = matrix.find(v => v.ram === advertised.ram && v.storage === advertised.storage);
  const partial = matrix.find(v => v.ram === advertised.ram || v.storage === advertised.storage);
  return { exact: !!exact, partial: !!partial, match: exact || partial };
}

function detectImpossibleCombinations(matrix, text) {
  const findings = [];

  for (const variant of matrix) {
    // Entry-level chipset with high RAM
    if (variant.chipset === 'entry' && variant.ram >= 12) {
      findings.push({
        claim: `${variant.ram}GB RAM with entry-level chipset`,
        classification: 'IMPOSSIBLE_COMBINATION',
        severity: 'high',
        confidence: 0.85,
        evidence: [`Variant: ${variant.ram}GB/${variant.storage}GB`, 'Entry-level processors rarely support >8GB RAM in smartphone/tablet form factors'],
        reasoning_trace: [
          trace('MATRIX', `Checking variant: ${JSON.stringify(variant)}`),
          trace('RULE', 'Entry-level chipsets typically support max 8GB LPDDR4X'),
          trace('FLAG', `${variant.ram}GB exceeds typical entry-level memory controller limit`)
        ],
        structured_output: {
          advertised_config: variant,
          purchasable_config_match: false,
          matching_variants: [],
          mismatch_type: 'IMPOSSIBLE_COMBINATION',
          severity: 'high',
          explanation: `Entry-level chipsets typically cannot address ${variant.ram}GB RAM. This configuration is likely erroneous or from an incompatible product line.`,
          config_matrix: matrix
        }
      });
    }

    // Unrealistically low price for high specs
    const priceMatch = text.match(/(?:rs\.?|₹|\$|€|\£)\s*(\d{1,2},?\d{3,})/i);
    if (priceMatch && variant.ram >= 12 && variant.storage >= 256) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''));
      if (price < 200) { // Likely in thousands, but catching obvious errors
        // Skip, probably currency formatting issue
      }
    }
  }

  return findings;
}

function detectPriceSpecDeception(text, matrix, specs) {
  const priceMatch = text.match(/(?:rs\.?|₹|\$|€|\£)\s*(\d{1,2},?\d{3,})/i);
  if (!priceMatch || matrix.length <= 1) return null;

  const prices = [...text.matchAll(/(?:rs\.?|₹|\$|€|\£)\s*(\d{1,2},?\d{3,})/gi)]
    .map(m => parseInt(m[1].replace(/,/g, '')));

  if (prices.length === 0) return null;

  const lowestPrice = Math.min(...prices);
  const highestSpecVariant = matrix.reduce((max, v) =>
    (v.ram > max.ram || (v.ram === max.ram && v.storage > max.storage)) ? v : max,
    matrix[0]
  );

  // If description mentions high specs prominently but only one low price
  const highSpecsMentioned = /\b(16\s*gb|1\s*tb|512\s*gb)\b/i.test(text);
  const singlePrice = prices.length === 1;

  if (highSpecsMentioned && singlePrice) {
    return {
      claim: 'Single price shown for multiple spec configurations',
      classification: 'LOWEST_PRICE_HIGHEST_SPEC',
      severity: 'high',
      confidence: 0.8,
      evidence: [`Price: ${lowestPrice}`, `Specs mentioned include high-end variants`, `Available matrix: ${matrix.length} variants`],
      reasoning_trace: [
        trace('PRICE', `Detected single price: ${lowestPrice}`),
        trace('SPECS', 'High-end specs (16GB/1TB/512GB) mentioned in description'),
        trace('MATRIX', `${matrix.length} variants available but only 1 price shown`),
        trace('FLAG', 'Price likely applies to lowest config; high specs shown for marketing impact')
      ],
      structured_output: {
        advertised_config: { price: lowestPrice, specs: highestSpecVariant },
        purchasable_config_match: false,
        matching_variants: matrix,
        mismatch_type: 'LOWEST_PRICE_HIGHEST_SPEC',
        severity: 'high',
        explanation: 'The displayed price likely applies to the lowest configuration, while the description highlights the highest configuration. Verify which variant the price is for before purchasing.',
        config_matrix: matrix
      }
    };
  }

  return null;
}

function detectUpToPatterns(text, specs, matrix) {
  const findings = [];

  const upToRam = text.match(/up\s*to\s*(\d+)\s*gb\s*(?:ram|memory)/i);
  if (upToRam) {
    const maxRam = parseInt(upToRam[1]);
    const baseVariant = matrix.length > 0 ? matrix.reduce((min, v) => v.ram < min.ram ? v : min, matrix[0]) : null;

    if (baseVariant && baseVariant.ram < maxRam) {
      findings.push({
        claim: `Up to ${maxRam}GB RAM`,
        classification: 'UP_TO_RAM',
        severity: 'medium',
        confidence: 0.9,
        evidence: [`"Up to ${maxRam}GB" found in description`, `Base variant: ${baseVariant.ram}GB RAM`],
        reasoning_trace: [
          trace('PARSE', `Detected "up to ${maxRam}GB RAM"`),
          trace('MATRIX', `Base variant has ${baseVariant.ram}GB RAM`),
          trace('FLAG', '"Up to" hides the fact that base model has lower RAM')
        ],
        structured_output: {
          advertised_config: { ram: maxRam },
          purchasable_config_match: true,
          matching_variants: [baseVariant],
          mismatch_type: 'UP_TO_SPEC',
          severity: 'medium',
          explanation: `RAM advertised as "up to ${maxRam}GB" but the base variant has ${baseVariant.ram}GB. Check which variant is priced.`,
          config_matrix: matrix
        }
      });
    }
  }

  const upToStorage = text.match(/up\s*to\s*(\d+)\s*(gb|tb)\s*(?:storage|rom)/i);
  if (upToStorage) {
    const maxStorage = parseInt(upToStorage[1]);
    const unit = upToStorage[2].toLowerCase();
    const maxBytes = unit === 'tb' ? maxStorage * 1024 : maxStorage;

    const baseVariant = matrix.length > 0 ? matrix.reduce((min, v) => v.storage < min.storage ? v : min, matrix[0]) : null;

    if (baseVariant && baseVariant.storage < maxBytes) {
      findings.push({
        claim: `Up to ${maxStorage}${unit.toUpperCase()} storage`,
        classification: 'UP_TO_STORAGE',
        severity: 'medium',
        confidence: 0.9,
        evidence: [`"Up to ${maxStorage}${unit.toUpperCase()}" found in description`, `Base variant: ${baseVariant.storage}GB storage`],
        reasoning_trace: [
          trace('PARSE', `Detected "up to ${maxStorage}${unit.toUpperCase()} storage"`),
          trace('MATRIX', `Base variant has ${baseVariant.storage}GB storage`),
          trace('FLAG', '"Up to" hides the fact that base model has lower storage')
        ],
        structured_output: {
          advertised_config: { storage: maxBytes },
          purchasable_config_match: true,
          matching_variants: [baseVariant],
          mismatch_type: 'UP_TO_SPEC',
          severity: 'medium',
          explanation: `Storage advertised as "up to ${maxStorage}${unit.toUpperCase()}" but the base variant has ${baseVariant.storage}GB. Verify which variant you are viewing.`,
          config_matrix: matrix
        }
      });
    }
  }

  return findings;
}

export default { checkConfigConsistency };
