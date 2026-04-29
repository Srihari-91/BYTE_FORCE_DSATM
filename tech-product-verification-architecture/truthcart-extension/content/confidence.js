// Extraction Confidence Calculator
// Scores the completeness and reliability of extracted product data
// Returns a value between 0 and 1 indicating extraction quality

const Confidence = {
  // Weights for each field in confidence calculation
  WEIGHTS: {
    title: 0.25,
    brand: 0.10,
    price: 0.15,
    description: 0.20,
    specs: 0.15,
    images: 0.05,
    rating: 0.05,
    reviewCount: 0.05
  },

  /**
   * Calculate extraction confidence score
   * @param {Object} product - Normalized product data
   * @returns {number} Confidence score between 0 and 1
   */
  calculate(product) {
    if (!product) return 0;

    let score = 0;
    let totalWeight = 0;

    // Title quality
    if (product.title && product.title.length > 3) {
      let titleScore = this.WEIGHTS.title;
      // Bonus for longer, more descriptive titles
      if (product.title.length > 20) titleScore *= 1.0;
      else titleScore *= 0.7;
      score += titleScore;
    }
    totalWeight += this.WEIGHTS.title;

    // Brand
    if (product.brand && product.brand.length > 0) {
      score += this.WEIGHTS.brand;
    }
    totalWeight += this.WEIGHTS.brand;

    // Price
    if (product.price !== null && product.price > 0) {
      score += this.WEIGHTS.price;
    }
    totalWeight += this.WEIGHTS.price;

    // Description quality
    if (product.description) {
      let descScore = this.WEIGHTS.description;
      const descLen = product.description.length;
      // Full score for substantial descriptions
      if (descLen > 200) descScore *= 1.0;
      else if (descLen > 50) descScore *= 0.7;
      else descScore *= 0.4;
      score += descScore;
    }
    totalWeight += this.WEIGHTS.description;

    // Specs completeness
    if (product.specs && typeof product.specs === 'object') {
      const specCount = Object.keys(product.specs).length;
      let specScore = this.WEIGHTS.specs;
      if (specCount >= 10) specScore *= 1.0;
      else if (specCount >= 5) specScore *= 0.7;
      else if (specCount >= 2) specScore *= 0.4;
      else specScore *= 0.2;
      score += specScore;
    }
    totalWeight += this.WEIGHTS.specs;

    // Images
    if (product.images && product.images.length > 0) {
      score += this.WEIGHTS.images;
    }
    totalWeight += this.WEIGHTS.images;

    // Rating
    if (product.rating !== null && product.rating > 0) {
      score += this.WEIGHTS.rating;
    }
    totalWeight += this.WEIGHTS.rating;

    // Review count
    if (product.reviewCount !== null && product.reviewCount > 0) {
      score += this.WEIGHTS.reviewCount;
    }
    totalWeight += this.WEIGHTS.reviewCount;

    // Normalize to 0-1 range
    const confidence = totalWeight > 0 ? score / totalWeight : 0;
    
    // Round to 2 decimal places
    return Math.round(confidence * 100) / 100;
  },

  /**
   * Get confidence level descriptor
   * @param {number} score - Confidence score
   * @returns {string} 'high', 'medium', or 'low'
   */
  getLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  },

  /**
   * Check if confidence is sufficient for analysis
   */
  isReliable(score) {
    return score >= 0.4;
  }
};

if (typeof window !== 'undefined') {
  window.TruthCart = window.TruthCart || {};
  window.TruthCart.Confidence = Confidence;
}
