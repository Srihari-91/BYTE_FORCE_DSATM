// Product Data Normalizer
// Unifies field names and formats across different e-commerce sources
// Ensures consistent data structure for the backend pipeline

const Normalizer = {
  // Standard field mapping
  FIELD_MAP: {
    title: ['title', 'name', 'productName', 'product_title'],
    brand: ['brand', 'manufacturer', 'make', 'brandName'],
    price: ['price', 'salePrice', 'currentPrice', 'sellingPrice'],
    originalPrice: ['originalPrice', 'mrp', 'listPrice', 'regularPrice', 'wasPrice'],
    description: ['description', 'desc', 'details', 'summary', 'longDescription'],
    rating: ['rating', 'averageRating', 'starRating', 'reviewRating'],
    reviewCount: ['reviewCount', 'numReviews', 'totalReviews', 'ratingCount'],
    availability: ['availability', 'stockStatus', 'inStock']
  },

  /**
   * Normalize raw product data to standard format
   * @param {Object} raw - Raw product data from extractor
   * @param {string} platform - Source platform
   * @returns {Object} Normalized product data
   */
  normalize(raw, platform) {
    if (!raw) return null;

    const product = {
      // Core identity
      id: null,
      title: '',
      brand: '',
      category: 'unknown',
      
      // Pricing
      price: null,
      currency: raw.currency || 'USD',
      originalPrice: null,
      discountPercentage: null,
      
      // Content
      description: '',
      highlights: [],
      
      // Specifications
      specs: {},
      
      // Media
      images: [],
      mainImage: null,
      
      // Social proof
      rating: null,
      reviewCount: null,
      
      // Status
      availability: 'unknown',
      
      // Metadata
      source: platform,
      sourceUrl: window.location.href,
      extractedAt: new Date().toISOString()
    };

    // Title
    product.title = this._sanitize(raw.title || '');
    
    // Brand
    product.brand = this._sanitize(raw.brand || '');
    
    // If brand is empty, try to extract from title
    if (!product.brand && product.title) {
      const firstWord = product.title.split(/\s+/)[0];
      if (firstWord && firstWord.length > 2 && !/^(the|new|latest|best|top)/i.test(firstWord)) {
        product.brand = firstWord;
      }
    }

    // Category detection from specs and title
    product.category = this._detectCategory(product);

    // Price
    if (raw.price !== null && raw.price !== undefined) {
      product.price = parseFloat(raw.price);
    }
    product.currency = raw.currency || 'USD';

    // Original price
    if (raw.originalPrice !== null && raw.originalPrice !== undefined) {
      product.originalPrice = parseFloat(raw.originalPrice);
      
      // Calculate discount
      if (product.price && product.originalPrice && product.originalPrice > product.price) {
        product.discountPercentage = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        );
      }
    }

    // Description
    product.description = this._sanitize(raw.description || '');

    // Extract highlights from description
    if (product.description) {
      product.highlights = product.description
        .split(/[.;!]\s+/)
        .filter(s => s.trim().length > 5)
        .slice(0, 10);
    }

    // Specifications - normalize keys
    if (raw.specs && typeof raw.specs === 'object') {
      for (const [key, value] of Object.entries(raw.specs)) {
        const normalizedKey = this._normalizeSpecKey(key);
        product.specs[normalizedKey] = this._sanitize(String(value));
      }
    }

    // Images
    if (Array.isArray(raw.images)) {
      product.images = raw.images.filter(url => url && typeof url === 'string');
      product.mainImage = product.images[0] || null;
    }

    // Rating (clamp 0-5)
    if (raw.rating !== null && raw.rating !== undefined) {
      product.rating = Math.min(Math.max(parseFloat(raw.rating), 0), 5);
    }

    // Review count
    if (raw.reviewCount !== null && raw.reviewCount !== undefined) {
      product.reviewCount = parseInt(raw.reviewCount);
    }

    // Availability
    if (raw.availability) {
      product.availability = raw.availability;
    }

    // Generate unique ID from source URL
    const url = window.location.href;
    const pathParts = url.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean);
    product.id = pathParts.join('_').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 100);

    return product;
  },

  /**
   * Detect product category from title and specs
   */
  _detectCategory(product) {
    const text = (product.title + ' ' + Object.keys(product.specs).join(' ')).toLowerCase();
    
    const categories = [
      { name: 'smartphone', patterns: ['phone', 'smartphone', 'mobile', 'cell phone', 'iphone', 'android', 'pixel'] },
      { name: 'laptop', patterns: ['laptop', 'notebook', 'macbook', 'chromebook', 'thinkpad', 'ultrabook'] },
      { name: 'tablet', patterns: ['tablet', 'ipad', 'tab', 'galaxy tab'] },
      { name: 'headphones', patterns: ['headphone', 'earphone', 'earbud', 'earpod', 'airpod', 'headset'] },
      { name: 'smartwatch', patterns: ['watch', 'smartwatch', 'wearable', 'fitness tracker', 'fitbit'] },
      { name: 'camera', patterns: ['camera', 'dslr', 'mirrorless', 'lens', 'photography'] },
      { name: 'tv', patterns: ['tv', 'television', 'smart tv', 'oled', 'qled', 'led tv'] },
      { name: 'speaker', patterns: ['speaker', 'soundbar', 'bluetooth speaker', 'home theater'] },
      { name: 'monitor', patterns: ['monitor', 'display', 'screen', 'gaming monitor'] },
      { name: 'keyboard', patterns: ['keyboard', 'mechanical keyboard', 'gaming keyboard'] },
      { name: 'mouse', patterns: ['mouse', 'gaming mouse', 'trackpad'] },
      { name: 'router', patterns: ['router', 'mesh wifi', 'modem', 'network'] },
      { name: 'charger', patterns: ['charger', 'power adapter', 'power bank', 'charging', 'gan charger'] },
      { name: 'cable', patterns: ['cable', 'usb cable', 'hdmi cable', 'charging cable'] }
    ];

    for (const cat of categories) {
      if (cat.patterns.some(p => text.includes(p))) {
        return cat.name;
      }
    }

    return 'electronics';
  },

  /**
   * Normalize specification key names
   */
  _normalizeSpecKey(key) {
    const keyMap = {
      'processor': 'processor',
      'cpu': 'processor',
      'chipset': 'processor',
      'soc': 'processor',
      'ram': 'ram',
      'memory': 'ram',
      'storage': 'storage',
      'rom': 'storage',
      'internal storage': 'storage',
      'display': 'display',
      'screen': 'display',
      'screen size': 'display_size',
      'display size': 'display_size',
      'battery': 'battery',
      'battery capacity': 'battery',
      'camera': 'camera',
      'rear camera': 'rear_camera',
      'front camera': 'front_camera',
      'os': 'operating_system',
      'operating system': 'operating_system',
      'weight': 'weight',
      'dimensions': 'dimensions',
      'resolution': 'resolution',
      'refresh rate': 'refresh_rate',
      'connectivity': 'connectivity',
      'bluetooth': 'bluetooth',
      'wifi': 'wifi',
      'color': 'color',
      'model': 'model',
      'model number': 'model',
      'brand': 'brand',
      'warranty': 'warranty'
    };

    const lowerKey = key.toLowerCase().trim();
    
    for (const [pattern, normalized] of Object.entries(keyMap)) {
      if (lowerKey.includes(pattern)) {
        return normalized;
      }
    }

    return lowerKey;
  },

  /**
   * Sanitize text content
   */
  _sanitize(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width chars
      .trim();
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Normalizer = Normalizer;
}
