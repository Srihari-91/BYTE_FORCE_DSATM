// Product Page Detector
// Heuristic detection of product pages across e-commerce sites

const ProductDetector = {
  // URL patterns that indicate a product page
  URL_PATTERNS: [
    // Amazon
    /\/dp\//i,
    /\/product\//i,
    /\/gp\/product\//i,
    // Flipkart
    /\/p\//i,
    /\/product\//i,
    // Best Buy
    /\/site\//i,
    /\/product\//i,
    // Walmart
    /\/ip\//i,
    /\/product\//i,
    // Generic
    /\/products?\//i,
    /\/item\//i,
    /\/p-[a-z0-9]/i
  ],

  // DOM selectors that strongly indicate a product page
  PRODUCT_SELECTORS: {
    amazon: [
      '#productTitle',
      '#titleSection',
      '#ppd',
      '[data-asin]',
      '#dp-container'
    ],
    flipkart: [
      '.VU-ZEz',          // Product title
      '.Nx9bqj',          // Price
      '._6EBuvT',         // Product details
      '.C7fEHH'           // Product page container
    ],
    bestbuy: [
      '[data-testid="product-title"]',
      '.product-title',
      '.sku-title'
    ],
    walmart: [
      '[data-testid="product-title"]',
      '.prod-ProductTitle',
      '.product-title'
    ],
    generic: [
      '[itemtype*="Product"]',
      '[data-product-id]',
      '.product-detail',
      '.product-page',
      '.pdp'
    ]
  },

  /**
   * Determine if current page is a product page
   * @returns {{ isProduct: boolean, platform: string, confidence: number }}
   */
  detect() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Step 1: Check URL patterns
    let urlScore = 0;
    for (const pattern of this.URL_PATTERNS) {
      if (pattern.test(url)) {
        urlScore += 0.3;
        break; // One match is enough for URL
      }
    }

    // Step 2: Determine platform
    let platform = 'generic';
    if (hostname.includes('amazon')) {
      platform = 'amazon';
    } else if (hostname.includes('flipkart')) {
      platform = 'flipkart';
    } else if (hostname.includes('bestbuy')) {
      platform = 'bestbuy';
    } else if (hostname.includes('walmart')) {
      platform = 'walmart';
    }

    // Step 3: Check DOM selectors
    let domScore = 0;
    const selectors = [
      ...(this.PRODUCT_SELECTORS[platform] || []),
      ...this.PRODUCT_SELECTORS.generic
    ];

    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el) {
          domScore += 0.2;
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    // Normalize DOM score (max 1.0)
    domScore = Math.min(domScore, 1.0);

    // Step 4: Check for JSON-LD structured data
    let structuredDataScore = 0;
    try {
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of jsonLdScripts) {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Product' || 
            (Array.isArray(data['@graph']) && 
             data['@graph'].some(item => item['@type'] === 'Product'))) {
          structuredDataScore = 0.4;
          break;
        }
      }
    } catch (e) {
      // JSON parse error, skip
    }

    // Final score and decision
    const totalScore = urlScore + domScore + structuredDataScore;
    const isProduct = totalScore >= 0.5;

    return {
      isProduct,
      platform,
      confidence: Math.min(totalScore, 1.0),
      scores: {
        url: urlScore,
        dom: domScore,
        structuredData: structuredDataScore
      }
    };
  },

  /**
   * Get the product ID/ASIN from the page
   */
  getProductId(platform) {
    const url = window.location.href;

    switch (platform) {
      case 'amazon': {
        const match = url.match(/\/dp\/([A-Z0-9]{10})/i) || 
                      url.match(/\/product\/([A-Z0-9]{10})/i);
        return match ? match[1] : null;
      }
      case 'flipkart': {
        const match = url.match(/\/p\/([A-Z0-9]+)/i);
        return match ? match[1] : null;
      }
      case 'bestbuy': {
        const match = url.match(/\/(\d{7})\.p/);
        return match ? match[1] : null;
      }
      case 'walmart': {
        const match = url.match(/\/(\d+)(?:\?|$)/);
        return match ? match[1] : null;
      }
      default:
        return null;
    }
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.ProductDetector = ProductDetector;
}
