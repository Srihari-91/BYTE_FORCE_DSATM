// Product Fingerprint Generator
// Creates a deterministic hash of product data for cache identification
// Same product from same URL should always produce the same fingerprint

const Fingerprint = {
  /**
   * Generate a fingerprint hash for the product
   * @param {Object} product - Normalized product data
   * @returns {string} Hash string
   */
  generate(product) {
    if (!product) return '';

    // Build a canonical representation
    const canonical = [
      product.source || '',
      product.sourceUrl || '',
      product.title || '',
      product.brand || '',
      product.price || '',
      product.currency || '',
    ].join('|').toLowerCase().trim();

    // Simple hash function (djb2-like)
    return this._hash(canonical);
  },

  /**
   * Generate a fingerprint from raw URL (for pre-fetch cache check)
   */
  fromUrl(url) {
    if (!url) return '';
    // Extract the product-relevant portion of the URL
    const parsed = this._parseUrl(url);
    return this._hash(parsed);
  },

  /**
   * DJB2-style hash function
   */
  _hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff; // Convert to 32bit integer
    }
    // Convert to hex and ensure positive
    return (hash >>> 0).toString(16).padStart(8, '0');
  },

  /**
   * Extract the meaningful portion of a product URL
   */
  _parseUrl(url) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;
      
      // Extract product ID patterns
      const patterns = [
        /\/dp\/([A-Z0-9]{10})/i,       // Amazon
        /\/product\/([A-Z0-9]{10})/i,   // Amazon alt
        /\/p\/([A-Z0-9]+)/i,            // Flipkart
        /\/(\d{7})\.p/,                 // Best Buy
      ];

      for (const pattern of patterns) {
        const match = path.match(pattern);
        if (match) return match[0];
      }

      // Fallback: use hostname + first significant path segment
      const segments = path.split('/').filter(Boolean);
      const significant = segments.filter(s => 
        s.length > 2 && !/^(category|collections?|search|page)$/i.test(s)
      );

      return urlObj.hostname + '/' + (significant.join('/') || path);
    } catch (e) {
      return url;
    }
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Fingerprint = Fingerprint;
}
