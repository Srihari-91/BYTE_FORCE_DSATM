// Spec Translator
// Translates marketing jargon into plain English with transparency notes

/**
 * Translate marketing specifications to plain English
 * @param {string} description - Product description
 * @param {Object} specs - Product specs
 * @returns {Array} Translated insights
 */
export function translateSpecs(description, specs = {}) {
  const insights = [];
  const text = (description || '').toLowerCase();
  const allText = text + ' ' + Object.values(specs).join(' ').toLowerCase();

  // Dictionary of marketing terms → reality
  const translations = [
    {
      pattern: /\b(ai[-\s]powered|artificial intelligence)\b/i,
      translation: '"AI-powered" typically means software-based enhancement, not true AI/ML. Usually refers to pre-programmed algorithms or filters.',
      category: 'SOFTWARE'
    },
    {
      pattern: /\b(quad\s*hd\+?|qhd\+?)\b/i,
      translation: 'Quad HD+ = 1440p resolution (typically 3200x1440 on smartphones, 2560x1440 on monitors). Not true 4K.',
      category: 'DISPLAY'
    },
    {
      pattern: /\b(full\s*hd\+?|fhd\+?)\b/i,
      translation: 'Full HD+ = 1080p extended (typically 2400x1080 on smartphones). Better than standard FHD but not QHD.',
      category: 'DISPLAY'
    },
    {
      pattern: /\b(retina\s*display)\b/i,
      translation: '"Retina" is Apple\'s branding for displays with pixel density where individual pixels are not visible at normal viewing distance. Not a specific resolution standard.',
      category: 'DISPLAY'
    },
    {
      pattern: /\b(hdr10\+?|dolby\s*vision)\b/i,
      translation: 'HDR support enhances contrast and color. Content must also be HDR-encoded to benefit. Standard SDR content will not look different.',
      category: 'DISPLAY'
    },
    {
      pattern: /\b(octa[-\s]?core|deca[-\s]?core|hexa[-\s]?core)\b/i,
      translation: 'Core count alone does not determine performance. Architecture, clock speed, and thermal management matter more than the number of cores.',
      category: 'PERFORMANCE'
    },
    {
      pattern: /\b(\d+)\s*mah\s*(battery)?\b/i,
      translation: 'mAh (milliamp-hours) is battery capacity. Actual battery life depends on display, processor efficiency, software optimization, and usage patterns.',
      category: 'BATTERY'
    },
    {
      pattern: /\b(fast\s*charg|quick\s*charg|rapid\s*charg|turbo\s*charg|super\s*charg)\b/i,
      translation: '"Fast charging" requires a compatible charger (often sold separately). Actual charging speed depends on battery temperature, usage during charging, and charger wattage.',
      category: 'CHARGING'
    },
    {
      pattern: /\b(water[-\s]resistant|waterproof|ip\d{2})\b/i,
      translation: 'Water resistance ratings (IPxx) are tested in laboratory conditions with fresh water. Resistance may decrease over time with normal wear. Not permanently waterproof.',
      category: 'DURABILITY'
    },
    {
      pattern: /\b(military[-\s]grade|mil[-\s]std[-\s]?\d+)\b/i,
      translation: '"Military-grade" typically refers to MIL-STD-810 testing for specific conditions. Check which tests were passed — it may only cover a subset of the standard.',
      category: 'DURABILITY'
    },
    {
      pattern: /\b(gorilla[-\s]glass|dragontrail|ceramic[-\s]shield)\b/i,
      translation: 'Branded glass protection provides scratch/shock resistance but is not unbreakable. Drop angle, surface type, and height significantly affect outcomes.',
      category: 'DURABILITY'
    },
    {
      pattern: /\b(high[-\s]resolution\s*audio|hi[-\s]res\s*audio|ldac|aptx)\b/i,
      translation: 'Hi-Res audio codecs require both the source device and headphones/speakers to support the same codec. Standard Bluetooth streaming uses lossy compression.',
      category: 'AUDIO'
    },
    {
      pattern: /\b(dolby\s*atmos|spatial\s*audio|360\s*audio)\b/i,
      translation: 'Spatial audio technologies simulate surround sound through software processing. Effectiveness varies significantly based on content and hardware.',
      category: 'AUDIO'
    },
    {
      pattern: /\b(adaptive\s*refresh|dynamic\s*refresh|ltpo)\b/i,
      translation: 'Adaptive refresh rate dynamically adjusts between lower (e.g., 1Hz) and higher (e.g., 120Hz) rates. Maximum rate only activates when beneficial (gaming, scrolling).',
      category: 'DISPLAY'
    },
    {
      pattern: /\b(always[-\s]on\s*display|aod)\b/i,
      translation: 'Always-On Display shows limited info (time, notifications) while the screen appears off. This consumes additional battery even when not actively using the device.',
      category: 'DISPLAY'
    },
  ];

  for (const { pattern, translation, category } of translations) {
    if (pattern.test(allText)) {
      insights.push({
        type: 'spec_translation',
        text: translation,
        category,
        matched_pattern: pattern.source,
        confidence: 0.85
      });
    }
  }

  // Add spec-specific translations
  insights.push(...translateSpecificSpecs(specs));

  return insights;
}

/**
 * Translate specific spec values
 */
function translateSpecificSpecs(specs) {
  const insights = [];

  if (!specs || Object.keys(specs).length === 0) return insights;

  // RAM context
  const ramSpec = Object.entries(specs).find(([k]) => 
    k.includes('ram') || k.includes('memory')
  );
  if (ramSpec) {
    const ramValue = ramSpec[1].toLowerCase();
    const ramNumber = parseInt(ramValue.match(/(\d+)/)?.[1] || '0');
    if (ramNumber > 0) {
      let context = '';
      if (ramNumber <= 4) context = 'Suitable for basic tasks (browsing, messaging). May struggle with multitasking and heavy apps.';
      else if (ramNumber <= 8) context = 'Good for most users. Handles multitasking and moderate gaming comfortably.';
      else if (ramNumber <= 16) context = 'Excellent for power users, heavy multitasking, and gaming. More than sufficient for most use cases.';
      else context = 'Professional/enthusiast grade. Beneficial for video editing, 3D rendering, or virtual machines.';

      if (context) {
        insights.push({
          type: 'spec_translation',
          text: `${ramNumber}GB RAM: ${context}`,
          category: 'PERFORMANCE',
          confidence: 0.8
        });
      }
    }
  }

  // Storage context
  const storageSpec = Object.entries(specs).find(([k]) => 
    k.includes('storage') || k.includes('rom')
  );
  if (storageSpec) {
    const storageValue = storageSpec[1].toLowerCase();
    const storageNumber = parseInt(storageValue.match(/(\d+)/)?.[1] || '0');
    if (storageNumber > 0) {
      const isTB = storageValue.includes('tb');
      const effectiveGB = isTB ? storageNumber * 1024 : storageNumber;

      let context = '';
      if (effectiveGB <= 64) context = 'Limited storage. Consider cloud storage or external storage options. OS and preinstalled apps will occupy significant space.';
      else if (effectiveGB <= 128) context = 'Adequate for most users. Good for apps, photos, and moderate media storage.';
      else if (effectiveGB <= 256) context = 'Comfortable storage for most users. Room for extensive app libraries, photos, and HD video.';
      else context = 'Ample storage. Suitable for large media libraries, 4K video recording, and extensive offline content.';

      if (context) {
        insights.push({
          type: 'spec_translation',
          text: `${storageValue.toUpperCase()} storage: ${context}`,
          category: 'STORAGE',
          confidence: 0.8
        });
      }
    }
  }

  return insights;
}
