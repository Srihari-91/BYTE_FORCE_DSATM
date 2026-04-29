// Product Schema Validation
// Validates incoming product data structure and types

/**
 * Validate product data structure
 * @param {Object} product - Product data to validate
 * @returns {{ valid: boolean, errors: string[], sanitized: Object|null }}
 */
export function validateProduct(product) {
  const errors = [];

  if (!product || typeof product !== 'object') {
    return { valid: false, errors: ['Product data is required'], sanitized: null };
  }

  // Required fields
  if (!product.title || typeof product.title !== 'string' || product.title.trim().length === 0) {
    errors.push('Product title is required');
  }

  // Type validations
  if (product.price !== null && product.price !== undefined) {
    if (typeof product.price !== 'number' && isNaN(Number(product.price))) {
      errors.push('Price must be a number');
    }
  }

  if (product.rating !== null && product.rating !== undefined) {
    const rating = Number(product.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be a number between 0 and 5');
    }
  }

  if (product.reviewCount !== null && product.reviewCount !== undefined) {
    const count = Number(product.reviewCount);
    if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
      errors.push('Review count must be a non-negative integer');
    }
  }

  // Specs validation
  if (product.specs && typeof product.specs !== 'object') {
    errors.push('Specs must be an object');
  }

  // Images validation
  if (product.images && !Array.isArray(product.images)) {
    errors.push('Images must be an array');
  }

  // Create sanitized version
  const sanitized = {
    title: String(product.title || '').trim(),
    brand: String(product.brand || '').trim(),
    category: String(product.category || 'unknown').toLowerCase(),
    price: product.price != null ? Number(product.price) : null,
    currency: String(product.currency || 'USD').toUpperCase(),
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    discountPercentage: product.discountPercentage != null ? Number(product.discountPercentage) : null,
    description: String(product.description || '').trim(),
    highlights: Array.isArray(product.highlights) ? product.highlights.slice(0, 20) : [],
    specs: typeof product.specs === 'object' && product.specs !== null ? { ...product.specs } : {},
    images: Array.isArray(product.images) ? product.images.filter(url => typeof url === 'string').slice(0, 10) : [],
    mainImage: typeof product.mainImage === 'string' ? product.mainImage : null,
    rating: product.rating != null ? Math.min(Math.max(Number(product.rating), 0), 5) : null,
    reviewCount: product.reviewCount != null ? Math.max(0, parseInt(product.reviewCount) || 0) : null,
    availability: ['in_stock', 'out_of_stock', 'unavailable'].includes(product.availability)
      ? product.availability
      : 'unknown',
    source: String(product.source || 'unknown').toLowerCase(),
    sourceUrl: String(product.sourceUrl || '').trim(),
    id: String(product.id || '').trim()
  };

  return {
    valid: errors.length === 0 || errors.every(e => !e.includes('required')), // Allow non-critical warnings
    errors,
    sanitized
  };
}

/**
 * Check if product has minimum required data for analysis
 */
export function hasMinimumData(product) {
  if (!product) return false;
  return !!(product.title && product.title.length > 2);
}

/**
 * Get product data completeness score (0-1)
 */
export function getCompletenessScore(product) {
  if (!product) return 0;

  const fields = [
    { key: 'title', weight: 0.25, check: (v) => v && v.length > 3 },
    { key: 'brand', weight: 0.10, check: (v) => v && v.length > 0 },
    { key: 'price', weight: 0.15, check: (v) => v !== null && v > 0 },
    { key: 'description', weight: 0.20, check: (v) => v && v.length > 20 },
    { key: 'specs', weight: 0.15, check: (v) => v && Object.keys(v).length > 0 },
    { key: 'rating', weight: 0.05, check: (v) => v !== null && v > 0 },
    { key: 'reviewCount', weight: 0.05, check: (v) => v !== null && v > 0 },
    { key: 'images', weight: 0.05, check: (v) => v && v.length > 0 },
  ];

  let score = 0;
  for (const field of fields) {
    if (field.check(product[field.key])) {
      score += field.weight;
    }
  }

  // Bonus for multiple specs
  if (product.specs && Object.keys(product.specs).length >= 5) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}
