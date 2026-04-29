// Config Consistency Checker
// Cross-checks RAM/storage/processor variants for configuration consistency
// Detects "up to" patterns that hide lower base configurations

import { CONSTANTS } from '../../config/constants.js';

/**
 * Check product configuration consistency
 * @param {Object} product - Product data
 * @returns {Array} Flags for inconsistent configurations
 */
export function checkConfigConsistency(product) {
  const flags = [];

  if (!product) return flags;

  const description = (product.description || '').toLowerCase();
  const specKeys = product.specs ? Object.keys(product.specs).map(k => k.toLowerCase()) : [];
  const specValues = product.specs ? Object.values(product.specs).map(v => v.toLowerCase()) : [];

  // Check 1: "Up to X GB RAM" pattern
  const upToRam = description.match(/up\s*to\s*(\d+)\s*gb\s*(ram|memory)/i);
  if (upToRam) {
    const maxRam = parseInt(upToRam[1]);
    const baseRam = specValues.find(v => 
      v.match(/(\d+)\s*gb/) && parseInt(RegExp.$1) < maxRam
    );

    if (baseRam) {
      flags.push({
        claim: `Up to ${maxRam}GB RAM`,
        type: 'CONFIG_MISMATCH',
        severity: CONSTANTS.SEVERITY.MEDIUM,
        explanation: `RAM advertised as "up to ${maxRam}GB" but base variant has only ${baseRam}. Check which variant you're viewing.`,
        analyzer: 'configChecker'
      });
    }
  }

  // Check 2: "Up to X GB storage"
  const upToStorage = description.match(/up\s*to\s*(\d+)\s*(gb|tb)\s*(storage|rom)/i);
  if (upToStorage) {
    const maxStorage = parseInt(upToStorage[1]);
    const unit = upToStorage[2].toLowerCase();
    const maxStorageBytes = unit === 'tb' ? maxStorage * 1024 : maxStorage;

    const baseStorage = specValues.find(v => {
      const match = v.match(/(\d+)\s*(gb|tb)/i);
      if (!match) return false;
      const val = parseInt(match[1]);
      const u = match[2].toLowerCase();
      const bytes = u === 'tb' ? val * 1024 : val;
      return bytes < maxStorageBytes;
    });

    if (baseStorage) {
      flags.push({
        claim: `Up to ${maxStorage}${unit.toUpperCase()} storage`,
        type: 'CONFIG_MISMATCH',
        severity: CONSTANTS.SEVERITY.MEDIUM,
        explanation: `Storage advertised as "up to ${maxStorage}${unit.toUpperCase()}" but base variant is ${baseStorage}. Verify the actual configuration.`,
        analyzer: 'configChecker'
      });
    }
  }

  // Check 3: Multiple variants in description
  const variantMentions = description.match(/(\d+)\s*gb\s*(ram|memory)/gi);
  if (variantMentions && variantMentions.length > 1) {
    const ramVariants = [...new Set(variantMentions)];

    // Check if specs only show one variant
    const specRam = specValues.filter(v => /\d+\s*gb\s*(ram|memory)/i.test(v));

    if (specRam.length === 1 && ramVariants.length > 1) {
      flags.push({
        claim: `Multiple RAM configurations mentioned (${ramVariants.join(', ')})`,
        type: 'MULTIPLE_VARIANTS',
        severity: CONSTANTS.SEVERITY.MEDIUM,
        explanation: 'Multiple RAM configurations are described but specs may only show the top variant. Check which variant the price is for.',
        analyzer: 'configChecker'
      });
    }
  }

  // Check 4: Processor variant inconsistency
  const processorPatterns = [
    { high: /\b(i9|ryzen\s*9|snapdragon\s*8\s*gen\s*3)\b/i, mid: /\b(i7|i5|ryzen\s*7|ryzen\s*5|snapdragon\s*7)\b/i, label: 'processor tier' },
  ];

  for (const { high, mid, label } of processorPatterns) {
    const mentionsHigh = high.test(description);
    const mentionsMid = mid.test(description);

    if (mentionsHigh && mentionsMid) {
      const specProcessor = specKeys.find(k => k.includes('processor')) || 
                             specValues.find(v => high.test(v) || mid.test(v));

      if (specProcessor) {
        const isHigh = high.test(String(specProcessor));
        if (!isHigh) {
          flags.push({
            claim: `Processor variants mentioned (high-end and mid-range)`,
            type: 'PROCESSOR_VARIANT',
            severity: CONSTANTS.SEVERITY.LOW,
            explanation: `Marketing mentions high-end ${label} but the listed specs may show a lower variant. Verify the processor for this specific model.`,
            analyzer: 'configChecker'
          });
        }
      }
    }
  }

  // Check 5: Display resolution consistency
  const resolutionClaims = description.match(/(\d+k|4k|uhd|qhd|fhd|full\s*hd|quad\s*hd)/gi);
  if (resolutionClaims && resolutionClaims.length > 1) {
    const uniqueResolutions = [...new Set(resolutionClaims.map(r => r.toLowerCase()))];
    if (uniqueResolutions.length > 1) {
      // Check if they mention multiple resolutions for different variants
      const isVariantBased = /variant|model|version|option/i.test(description);
      if (!isVariantBased) {
        flags.push({
          claim: `Multiple display resolutions mentioned: ${uniqueResolutions.join(', ')}`,
          type: 'RESOLUTION_CONFUSION',
          severity: CONSTANTS.SEVERITY.LOW,
          explanation: 'Different display resolutions mentioned — may vary by variant. Confirm resolution for this specific model.',
          analyzer: 'configChecker'
        });
      }
    }
  }

  // Check 6: Missing category-expected specs
  const category = product.category || 'electronics';
  const expectedSpecs = CONSTANTS.CATEGORY_SPECS[category];

  if (expectedSpecs) {
    const missingSpecs = expectedSpecs.filter(expected => {
      return !specKeys.some(key => key.includes(expected));
    });

    if (missingSpecs.length > 0) {
      flags.push({
        claim: `Missing key ${category} specs`,
        type: 'MISSING_SPECS',
        severity: missingSpecs.length > 3 ? CONSTANTS.SEVERITY.MEDIUM : CONSTANTS.SEVERITY.LOW,
        explanation: `Expected specifications not found: ${missingSpecs.join(', ')}. These are standard for ${category} products.`,
        analyzer: 'configChecker'
      });
    }
  }

  return flags;
}
