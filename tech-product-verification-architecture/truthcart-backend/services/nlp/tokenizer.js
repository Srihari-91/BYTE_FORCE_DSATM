// NLP Tokenizer
// Sentence splitting, keyword extraction, and category detection via regex/heuristics

/**
 * Split text into sentences
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text) return [];
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);
}

/**
 * Extract keywords from text
 * @param {string} text
 * @returns {string[]} Lowercase keywords
 */
export function extractKeywords(text) {
  if (!text) return [];

  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'shall', 'you', 'your',
    'we', 'our', 'they', 'their', 'it', 'its', 'this', 'that', 'these',
    'those', 'each', 'every', 'all', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'about', 'also'
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Count frequency
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  // Return top keywords sorted by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Detect product category from text and specs
 * @param {Object} product
 * @returns {string}
 */
export function detectCategory(product) {
  const text = [
    product.title || '',
    product.description || '',
    product.category || '',
    Object.keys(product.specs || {}).join(' ')
  ].join(' ').toLowerCase();

  const categories = [
    { name: 'smartphone', keywords: ['phone', 'smartphone', 'mobile', 'cell', 'iphone', 'android', 'pixel', 'sim', '5g'] },
    { name: 'laptop', keywords: ['laptop', 'notebook', 'macbook', 'chromebook', 'thinkpad', 'ultrabook', 'ryzen', 'intel core'] },
    { name: 'tablet', keywords: ['tablet', 'ipad', 'tab', 'stylus', 'pencil'] },
    { name: 'headphones', keywords: ['headphone', 'earphone', 'earbud', 'earpod', 'airpod', 'headset', 'anc', 'noise cancel'] },
    { name: 'smartwatch', keywords: ['watch', 'smartwatch', 'wearable', 'fitness tracker', 'fitbit', 'heart rate'] },
    { name: 'camera', keywords: ['camera', 'dslr', 'mirrorless', 'lens', 'photography', 'megapixel', 'aperture'] },
    { name: 'tv', keywords: ['tv', 'television', 'smart tv', 'oled', 'qled', 'hdr', 'hdmi'] },
    { name: 'speaker', keywords: ['speaker', 'soundbar', 'bluetooth speaker', 'woofer', 'tweeter'] },
    { name: 'monitor', keywords: ['monitor', 'gaming monitor', 'ips', 'va panel', 'refresh rate'] },
    { name: 'keyboard', keywords: ['keyboard', 'mechanical', 'switches', 'keycap'] },
    { name: 'mouse', keywords: ['mouse', 'gaming mouse', 'dpi', 'sensor'] },
    { name: 'router', keywords: ['router', 'mesh', 'wifi 6', 'modem', 'gigabit'] },
    { name: 'charger', keywords: ['charger', 'power adapter', 'power bank', 'gan', 'watt', 'pd'] },
  ];

  let bestMatch = 'electronics';
  let bestScore = 0;

  for (const cat of categories) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cat.name;
    }
  }

  return bestMatch;
}

/**
 * Find numeric values in text with context
 * @param {string} text
 * @returns {Array<{ value: number, unit: string, context: string }>}
 */
export function extractNumericValues(text) {
  if (!text) return [];

  const patterns = [
    /(\d+\.?\d*)\s*(mah|wh|gb|tb|mb|ghz|mhz|inches?|inch|mm|cm|g|kg|lbs|w|watts?|hz|fps|dpi|ppi|nit|nits|hours?|hrs?|days?|mins?|min|mp|megapixels?)/gi,
    /(\d+\.?\d*)[-\s]*(mah|wh|gb|tb|mb|ghz|mhz|inch|mm|cm|g|kg|w|hz|fps|dpi|ppi|nit|hour|day)/gi,
  ];

  const results = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      results.push({
        value: parseFloat(match[1]),
        unit: match[2].toLowerCase(),
        context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30)
      });
    }
  }

  return results;
}
