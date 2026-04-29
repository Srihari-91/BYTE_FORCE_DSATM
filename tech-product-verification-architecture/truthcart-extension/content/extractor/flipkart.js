// Flipkart Product Extractor
// Extracts product data from Flipkart product pages

const FlipkartExtractor = {
  extract() {
    const product = {
      title: '',
      brand: '',
      price: null,
      currency: 'INR',
      originalPrice: null,
      description: '',
      specs: {},
      images: [],
      rating: null,
      reviewCount: null,
      availability: 'unknown',
      source: 'flipkart'
    };

    const DOM = window.TruthCartUtils.DOM;

    // Title
    const titleEl = DOM.query('.VU-ZEz') || 
                    DOM.query('[class*="title"] h1') ||
                    DOM.query('h1');
    product.title = DOM.getText(titleEl);

    // Brand extraction from title
    if (product.title) {
      const brandMatch = product.title.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s/);
      if (brandMatch) {
        product.brand = brandMatch[1];
      }
    }

    // Price
    const priceEl = DOM.query('.Nx9bqj.CxhGGd') ||
                    DOM.query('._30jeq3') ||
                    DOM.query('[class*="price"] .CxhGGd');
    if (priceEl) {
      const priceText = DOM.getText(priceEl).replace(/[₹,]/g, '');
      const priceMatch = priceText.match(/(\d+\.?\d*)/);
      if (priceMatch) {
        product.price = parseFloat(priceMatch[1]);
      }
    }

    // Original price
    const origPriceEl = DOM.query('.yRaY8j') ||
                        DOM.query('._3I9_wc');
    if (origPriceEl) {
      const origText = DOM.getText(origPriceEl).replace(/[₹,]/g, '');
      const origMatch = origText.match(/(\d+\.?\d*)/);
      if (origMatch) {
        product.originalPrice = parseFloat(origMatch[1]);
      }
    }

    // Description / Highlights
    const highlights = DOM.queryAll('._2418kt li, ._7eSDEz li, .GqKcvT li');
    const highTexts = highlights.map(h => DOM.getText(h)).filter(Boolean);
    if (highTexts.length > 0) {
      product.description = highTexts.join('. ');
    }

    // Description from product description section
    const descEl = DOM.query('._1mXcCf, ._3kYhkp');
    const descText = DOM.getText(descEl);
    if (descText && descText.length > 10) {
      product.description = (product.description ? product.description + ' ' : '') + descText;
    }

    // Specifications Table
    const specRows = DOM.queryAll('._14cfVK table tr, ._1sI7cG table tr');
    specRows.forEach(row => {
      const cells = DOM.queryAll('td', row);
      if (cells.length >= 2) {
        const key = DOM.getText(cells[0]).replace(/[:\s]+$/, '').toLowerCase();
        const value = DOM.getText(cells[1]);
        if (key && value) {
          product.specs[key] = value;
        }
      }
    });

    // Alternate spec format
    const specGroups = DOM.queryAll('._3GJfQM, ._1UhVsN');
    specGroups.forEach(group => {
      const label = DOM.query('._2gm3gJ, ._3Fm-hO', group);
      const value = DOM.query('._3YhLQA, .URwL2w', group);
      if (label && value) {
        const key = DOM.getText(label).replace(/[:\s]+$/, '').toLowerCase();
        const val = DOM.getText(value);
        if (key && val) {
          product.specs[key] = val;
        }
      }
    });

    // Images
    const imageEls = DOM.queryAll('._0DkuPH img, ._0QyAeO img, [style*="background-image"] img');
    imageEls.forEach(img => {
      let src = img.getAttribute('src') || img.getAttribute('data-url');
      if (!src) {
        // Try background image
        const style = img.getAttribute('style') || '';
        const bgMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
        if (bgMatch) src = bgMatch[1];
      }
      if (src && !src.includes('placeholder')) {
        // Convert to high-res
        const hiRes = src.replace(/\/\d+x\d+\//, '/1200x1200/')
                        .replace(/\/[0-9]+\/[0-9]+\//, '/1200/1200/');
        product.images.push(hiRes);
      }
    });

    // Rating
    const ratingEl = DOM.query('._3LWZlK, .XQDdHH');
    if (ratingEl) {
      const ratingText = DOM.getText(ratingEl);
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      if (ratingMatch) product.rating = parseFloat(ratingMatch[1]);
    }

    // Review Count
    const reviewEl = DOM.query('._2_R_DZ span, ._3UAT2v');
    if (reviewEl) {
      const reviewText = DOM.getText(reviewEl);
      const reviewMatch = reviewText.match(/([\d,]+)/);
      if (reviewMatch) {
        product.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }
    }

    // Availability
    const availEl = DOM.query('._16FRyY, ._2JC05C');
    if (availEl) {
      const availText = DOM.getText(availEl).toLowerCase();
      if (availText.includes('sold out') || availText.includes('coming soon')) {
        product.availability = 'out_of_stock';
      } else {
        product.availability = 'in_stock';
      }
    }

    return product;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.FlipkartExtractor = FlipkartExtractor;
}
