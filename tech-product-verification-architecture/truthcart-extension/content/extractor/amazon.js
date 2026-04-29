// Amazon Product Extractor
// Extracts product data from Amazon product pages

const AmazonExtractor = {
  extract() {
    const product = {
      title: '',
      brand: '',
      price: null,
      currency: 'USD',
      originalPrice: null,
      description: '',
      specs: {},
      images: [],
      rating: null,
      reviewCount: null,
      availability: 'unknown',
      source: 'amazon'
    };

    const DOM = window.TruthCartUtils.DOM;

    // Title
    const titleEl = DOM.query('#productTitle') || 
                    DOM.query('[data-feature-name="title"] .product-title-word-break');
    product.title = DOM.getText(titleEl);

    // Brand
    const brandEl = DOM.query('#bylineInfo') || 
                    DOM.query('[data-feature-name="brand"]');
    const brandText = DOM.getText(brandEl);
    if (brandText) {
      product.brand = brandText.replace(/^(Visit the|Brand:|by|Shop the)\s*/i, '').trim();
    }

    // Price
    const priceEl = DOM.query('.a-price .a-offscreen') ||
                    DOM.query('#priceblock_ourprice') ||
                    DOM.query('#priceblock_dealprice') ||
                    DOM.query('[data-feature-name="price"] .a-price-whole');
    if (priceEl) {
      const priceText = priceEl.textContent || priceEl.getAttribute('aria-label') || '';
      const priceMatch = priceText.replace(/[$,]/g, '').match(/(\d+\.?\d*)/);
      if (priceMatch) {
        product.price = parseFloat(priceMatch[1]);
      }
    }

    // Original price (for deals)
    const origPriceEl = DOM.query('.a-text-strike') ||
                        DOM.query('#listPrice') ||
                        DOM.query('[data-a-strike="true"]');
    if (origPriceEl) {
      const origText = origPriceEl.textContent || '';
      const origMatch = origText.replace(/[$,]/g, '').match(/(\d+\.?\d*)/);
      if (origMatch) {
        product.originalPrice = parseFloat(origMatch[1]);
      }
    }

    // Currency detection
    const currencySymbol = DOM.query('.a-price-symbol');
    if (currencySymbol) {
      const sym = currencySymbol.textContent.trim();
      if (sym === '₹') product.currency = 'INR';
      else if (sym === '£') product.currency = 'GBP';
      else if (sym === '€') product.currency = 'EUR';
    }

    // Description / Bullet points
    const bullets = DOM.queryAll('#feature-bullets .a-list-item');
    const bulletTexts = bullets.map(b => DOM.getText(b)).filter(Boolean);
    if (bulletTexts.length > 0) {
      product.description = bulletTexts.join('. ');
    }

    // Product description from A+
    const descEl = DOM.query('#productDescription p') ||
                   DOM.query('[data-feature-name="description"]');
    const descText = DOM.getText(descEl);
    if (descText && descText.length > 10) {
      if (product.description) {
        product.description += ' ' + descText;
      } else {
        product.description = descText;
      }
    }

    // Technical Specifications Table
    const specRows = DOM.queryAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, .a-expander-content tr');
    specRows.forEach(row => {
      const th = DOM.query('th', row);
      const td = DOM.query('td', row);
      if (th && td) {
        const key = DOM.getText(th).replace(/[:\s]+$/, '').toLowerCase();
        const value = DOM.getText(td);
        if (key && value) {
          product.specs[key] = value;
        }
      }
    });

    // Also try the detail bullets
    const detailBullets = DOM.queryAll('#detailBullets_feature_div .a-list-item');
    detailBullets.forEach(item => {
      const text = DOM.getText(item);
      const parts = text.split(':').map(s => s.trim());
      if (parts.length >= 2) {
        product.specs[parts[0].toLowerCase()] = parts.slice(1).join(':');
      }
    });

    // Images
    const imageEls = DOM.queryAll('#altImages img, #landingImage, .imgTagWrapper img');
    imageEls.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-old-hires');
      if (src && !src.includes('pixel') && !src.includes('sprite')) {
        // Convert to high-res URL
        const hiRes = src.replace(/\._[A-Z]{2}\d+_\./, '._SL1500_.');
        product.images.push(hiRes);
      }
    });

    // Rating
    const ratingEl = DOM.query('#acrPopover .a-icon-alt') ||
                     DOM.query('[data-hook="rating-out-of-text"]');
    if (ratingEl) {
      const ratingMatch = DOM.getText(ratingEl).match(/(\d+\.?\d*)/);
      if (ratingMatch) product.rating = parseFloat(ratingMatch[1]);
    }

    // Review count
    const reviewEl = DOM.query('#acrCustomerReviewText');
    if (reviewEl) {
      const reviewMatch = DOM.getText(reviewEl).match(/([\d,]+)/);
      if (reviewMatch) {
        product.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }
    }

    // Availability
    const availEl = DOM.query('#availability span');
    if (availEl) {
      const availText = DOM.getText(availEl).toLowerCase();
      if (availText.includes('in stock')) product.availability = 'in_stock';
      else if (availText.includes('out of stock')) product.availability = 'out_of_stock';
      else if (availText.includes('currently unavailable')) product.availability = 'unavailable';
    }

    return product;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.AmazonExtractor = AmazonExtractor;
}
