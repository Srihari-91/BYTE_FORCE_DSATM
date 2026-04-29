// Feature Origin Tracker
// Tracks if features are genuine innovations or rebranded standard technology
// Identifies OEM/ODM patterns and shared platform references

/**
 * Track feature origins — genuine innovations vs rebranded standards
 * @param {string} description - Product description
 * @param {Object} specs - Product specs
 * @returns {Array} Feature origin insights
 */
export function trackFeatureOrigin(description, specs = {}) {
  const insights = [];
  const text = (description || '').toLowerCase();
  const allText = text + ' ' + Object.values(specs).join(' ').toLowerCase();

  // Feature origin checks
  const features = [
    // Display features
    {
      pattern: /\b(pro[-\s]motion|promotion)\b/i,
      insight: 'ProMotion is Apple\'s branding for adaptive 120Hz refresh rate. The underlying LTPO display technology is manufactured by Samsung/LG Display.',
      type: 'rebranded'
    },
    {
      pattern: /\b(dynamic\s*amoled\s*2x)\b/i,
      insight: 'Dynamic AMOLED 2X is Samsung\'s branding for their LTPO OLED panel technology with HDR10+ support. Available to other manufacturers as "LTPO AMOLED".',
      type: 'rebranded'
    },
    {
      pattern: /\b(super\s*retina\s*xdr)\b/i,
      insight: 'Super Retina XDR is Apple\'s branding for custom-calibrated OLED panels manufactured by Samsung and LG Display.',
      type: 'rebranded'
    },

    // Protection/Glass
    {
      pattern: /\b(ceramic\s*shield)\b/i,
      insight: 'Ceramic Shield is Apple\'s branding for Corning\'s glass-ceramic composite. Corning supplies similar technology to other manufacturers.',
      type: 'rebranded'
    },
    {
      pattern: /\b(gorilla\s*glass\s*(3|5|victus|armor))\b/i,
      insight: 'Corning Gorilla Glass is an industry-standard glass protection used across most smartphone brands. Not a unique differentiator.',
      type: 'standard'
    },

    // Audio
    {
      pattern: /\b(dolby\s*atmos)\b/i,
      insight: 'Dolby Atmos is a licensed audio technology from Dolby Laboratories. Available to any manufacturer who pays the licensing fee. Not a unique feature.',
      type: 'licensed'
    },
    {
      pattern: /\b(hi[-\s]res\s*audio)\b/i,
      insight: 'Hi-Res Audio certification is from the Japan Audio Society. Requires meeting specific technical standards — a certification, not proprietary technology.',
      type: 'certified'
    },

    // Camera
    {
      pattern: /\b(zeiss|leica|hasselblad)\s*(optics|lens|camera)/i,
      insight: 'Branded camera partnerships (Zeiss/Leica/Hasselblad) typically involve lens coating, color tuning, or software processing — not the actual camera hardware. The sensor is usually from Sony or Samsung.',
      type: 'partnership'
    },
    {
      pattern: /\b(sony\s*imx|samsung\s*isocell|omnivision)\b/i,
      insight: 'Most smartphone camera sensors are manufactured by Sony (IMX series) or Samsung (ISOCELL). Different brands often use the same underlying sensor.',
      type: 'industry_standard'
    },

    // Processor
    {
      pattern: /\b(snapdragon|mediatek|exynos|tensor|kirin)\b/i,
      insight: 'Mobile processors (Snapdragon, MediaTek, Exynos) are supplied by third-party chipmakers. Performance differences between phones using the same chip are due to thermal design and software optimization.',
      type: 'industry_standard'
    },

    // OS / Software
    {
      pattern: /\b(android\s*(one|go|stock)|clean\s*ui|oxygen\s*os|one\s*ui|miui|color\s*os)\b/i,
      insight: 'Custom Android skins (One UI, MIUI, OxygenOS) are software overlays on the same Android OS. They differ in features, bloatware, and update frequency but share the same app ecosystem.',
      type: 'software_layer'
    },

    // Charging
    {
      pattern: /\b(usb[-\s]?(c|pd|power\s*delivery)|qualcomm\s*quick\s*charge)\b/i,
      insight: 'USB-PD (Power Delivery) and Qualcomm Quick Charge are industry-standard charging protocols. Many "fast charging" implementations are based on these standards.',
      type: 'standard'
    },
    {
      pattern: /\b(qi\s*(wireless\s*)?charg|wireless\s*power\s*share|reverse\s*wireless)\b/i,
      insight: 'Qi wireless charging is an industry standard by the Wireless Power Consortium. Reverse wireless charging is an implementation of the Qi standard. Not a unique differentiator.',
      type: 'standard'
    },

    // Connectivity
    {
      pattern: /\b(wifi\s*6[e]?|bluetooth\s*5\.\d|5g|nfc)\b/i,
      insight: 'WiFi 6/6E, Bluetooth 5.x, 5G, and NFC are industry-standard connectivity features. Most modern devices in the same price range include these.',
      type: 'standard'
    },
  ];

  for (const { pattern, insight, type } of features) {
    if (pattern.test(allText)) {
      const alreadyExists = insights.some(i => i.text === insight);
      if (!alreadyExists) {
        insights.push({
          type: 'feature_origin',
          text: insight,
          category: type === 'rebranded' ? 'OTHER' : 'OTHER',
          originType: type,
          confidence: 0.85
        });
      }
    }
  }

  // Check for "world's first" claims
  if (/\b(world'?s?\s*first|first[-\s]ever|industry[-\s]first)\b/i.test(text)) {
    insights.push({
      type: 'feature_origin',
      text: '"World\'s first" claims are difficult to verify and often refer to very specific, narrow implementations (e.g., "world\'s first phone with X feature in Y price range in Z country"). Verify the exact scope of the claim.',
      category: 'OTHER',
      originType: 'marketing',
      confidence: 0.7
    });
  }

  return insights;
}
