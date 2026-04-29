// Generic Product Extractor (Fallback)
// Extracts product data using OpenGraph, JSON-LD, and semantic HTML patterns

const GenericExtractor = {
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
      source: 'generic'
    };

    const DOM = window.TruthCartUtils.DOM;

    // === Method 1: JSON-LD Structured Data ===
    try {
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of jsonLdScripts) {
        const data = JSON.parse(script.textContent);
        
        // Handle @graph (multiple entities)
        let productData = data;
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          productData = data['@graph'].find(
            item => item['@type'] === 'Product'
          ) || data;
        }

        if (productData['@type'] === 'Product') {
          product.title = productData.name || product.title;
          product.brand = productData.brand?.name || 
                          (typeof productData.brand === 'string' ? productData.brand : product.brand);
          product.description = productData.description || product.description;
          
          if (productData.offers) {
            const offer = Array.isArray(productData.offers) 
              ? productData.offers[0] 
              : productData.offers;
            if (offer.price) {
              product.price = parseFloat(offer.price);
              product.currency = offer.priceCurrency || product.currency;
            }
            product.availability = offer.availability 
              ? offer.availability.replace('https://schema.org/', '') 
              : product.availability;
          }
          
          if (productData.aggregateRating) {
            product.rating = parseFloat(productData.aggregateRating.ratingValue);
            product.reviewCount = parseInt(productData.aggregateRating.reviewCount);
          }
          
          if (productData.image) {
            const images = Array.isArray(productData.image) 
              ? productData.image 
              : [productData.image];
            product.images = images.filter(Boolean);
          }
          
          break; // Use first valid product data
        }
      }
    } catch (e) {
      // JSON parse error, continue with other methods
    }

    // === Method 2: OpenGraph / Meta Tags ===
    if (!product.title) {
      product.title = DOM.getAttr(DOM.query('meta[property="og:title"]'), 'content') ||
                      DOM.getAttr(DOM.query('meta[name="twitter:title"]'), 'content') ||
                      DOM.getText(DOM.query('h1'));
    }

    if (!product.description) {
      product.description = DOM.getAttr(DOM.query('meta[property="og:description"]'), 'content') ||
                            DOM.getAttr(DOM.query('meta[name="description"]'), 'content');
    }

    if (!product.price) {
      const priceMeta = DOM.query('meta[property="product:price:amount"]') ||
                        DOM.query('meta[name="price"]');
      const priceVal = DOM.getAttr(priceMeta, 'content');
      if (priceVal) {
        product.price = parseFloat(priceVal);
      }
    }

    // Currency from meta
    const currencyMeta = DOM.query('meta[property="product:price:currency"]');
    const currencyVal = DOM.getAttr(currencyMeta, 'content');
    if (currencyVal) product.currency = currencyVal;

    // Images from meta/og
    if (product.images.length === 0) {
      const ogImage = DOM.getAttr(DOM.query('meta[property="og:image"]'), 'content');
      if (ogImage) product.images.push(ogImage);
      
      // Also try microdata
      const microImages = DOM.queryAll('[itemprop="image"]');
      microImages.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('content');
        if (src && !product.images.includes(src)) {
          product.images.push(src);
        }
      });
    }

    // === Method 3: Semantic HTML / Microdata ===
    if (!product.title) {
      product.title = DOM.getText(DOM.query('[itemprop="name"]')) ||
                      DOM.getText(DOM.query('.product-title, .product-name, .product__title'));
    }

    if (!product.price) {
      const priceEl = DOM.query('[itemprop="price"]') ||
                      DOM.query('.price, .product-price, .sale-price');
      if (priceEl) {
        const priceText = DOM.getText(priceEl).replace(/[^0-9.]/g, '');
        const priceMatch = priceText.match(/(\d+\.?\d*)/);
        if (priceMatch) product.price = parseFloat(priceMatch[1]);
      }
    }

    // Brand
    if (!product.brand) {
      product.brand = DOM.getText(DOM.query('[itemprop="brand"]')) ||
                      DOM.getAttr(DOM.query('meta[itemprop="brand"]'), 'content') ||
                      DOM.getText(DOM.query('.brand, .product-brand'));
    }

    // Description paragraphs
    if (!product.description) {
      const descParas = DOM.queryAll('.product-description p, .product-details p, .description p');
      if (descParas.length > 0) {
        product.description = descParas.map(p => DOM.getText(p)).filter(Boolean).join('. ');
      }
    }

    // Specs from tables
    const specTables = DOM.queryAll('table.specs, table.specifications, table.tech-specs');
    specTables.forEach(table => {
      const rows = DOM.queryAll('tr', table);
      rows.forEach(row => {
        const th = DOM.query('th, .label, .spec-label', row);
        const td = DOM.query('td, .value, .spec-value', row);
        if (th && td) {
          const key = DOM.getText(th).replace(/[:\s]+$/, '').toLowerCase();
          const value = DOM.getText(td);
          if (key && value) {
            product.specs[key] = value;
          }
        }
      });
    });

    // Specs from definition lists
    const dlSpecs = DOM.queryAll('.spec-list dt, .specs dt');
    dlSpecs.forEach(dt => {
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        const key = DOM.getText(dt).replace(/[:\s]+$/, '').toLowerCase();
        const value = DOM.getText(dd);
        if (key && value) {
          product.specs[key] = value;
        }
      }
    });

    // Rating
    if (!product.rating) {
      const ratingEl = DOM.query('[itemprop="ratingValue"]') ||
                       DOM.query('.rating, .star-rating, .review-rating');
      if (ratingEl) {
        const ratingText = DOM.getText(ratingEl) || ratingEl.getAttribute('content') || '';
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        if (ratingMatch) product.rating = parseFloat(ratingMatch[1]);
      }
    }

    // Review count
    if (!product.reviewCount) {
      const countEl = DOM.query('[itemprop="reviewCount"]') ||
                      DOM.query('.review-count, .rating-count');
      if (countEl) {
        const countText = DOM.getText(countEl) || countEl.getAttribute('content') || '';
        const countMatch = countText.match(/([\d,]+)/);
        if (countMatch) product.reviewCount = parseInt(countMatch[1].replace(/,/g, ''));
      }
    }

    return product;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.GenericExtractor = GenericExtractor;
}
