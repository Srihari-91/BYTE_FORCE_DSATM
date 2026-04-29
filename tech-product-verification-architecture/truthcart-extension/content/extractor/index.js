// Product Extractor Router
// Routes to platform-specific extractor based on detected platform

const ProductExtractor = {
  _extractors: null,

  /**
   * Initialize extractors (lazy)
   */
  _init() {
    if (this._extractors) return;
    this._extractors = {
      amazon: window.TruthCart.AmazonExtractor,
      flipkart: window.TruthCart.FlipkartExtractor,
      bestbuy: window.TruthCart.GenericExtractor,  // Best Buy uses generic for now
      walmart: window.TruthCart.GenericExtractor,  // Walmart uses generic for now
      generic: window.TruthCart.GenericExtractor
    };
  },

  /**
   * Extract product data using the appropriate extractor
   * @param {string} platform - 'amazon', 'flipkart', 'bestbuy', 'walmart', 'generic'
   * @returns {Object} Raw product data
   */
  extract(platform) {
    this._init();

    const extractor = this._extractors[platform] || this._extractors.generic;
    
    if (!extractor) {
      console.error('[TruthCart] No extractor found for platform:', platform);
      return null;
    }

    const startTime = performance.now();
    
    try {
      const product = extractor.extract();
      const elapsed = Math.round(performance.now() - startTime);
      
      console.log(`[TruthCart] Extraction completed in ${elapsed}ms (${platform})`);
      console.log('[TruthCart] Extracted:', {
        title: product.title?.substring(0, 50) + '...',
        price: product.price,
        specs: Object.keys(product.specs || {}).length + ' specs',
        images: (product.images || []).length + ' images'
      });

      return product;
    } catch (err) {
      console.error('[TruthCart] Extraction error:', err);
      
      // Fallback to generic if platform-specific fails
      if (platform !== 'generic') {
        console.log('[TruthCart] Falling back to generic extractor');
        try {
          return this._extractors.generic.extract();
        } catch (e) {
          console.error('[TruthCart] Generic extraction also failed:', e);
          return null;
        }
      }
      
      return null;
    }
  },

  /**
   * Check if a platform-specific extractor is available
   */
  isAvailable(platform) {
    this._init();
    return platform in this._extractors;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.ProductExtractor = ProductExtractor;
}
