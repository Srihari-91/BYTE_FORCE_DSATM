// Reddit Post Filter
// Filters Reddit posts by relevance to the product being analyzed

import { detectCategory } from '../../nlp/tokenizer.js';

/**
 * Filter Reddit posts relevant to the product
 * @param {Array} posts - All Reddit posts
 * @param {Object} product - Product data
 * @returns {Array} Filtered relevant posts
 */
export function filterRelevantPosts(posts, product) {
  if (!posts || !product) return [];

  const productText = [
    product.title || '',
    product.brand || '',
    product.description || '',
    Object.keys(product.specs || {}).join(' ')
  ].join(' ').toLowerCase();

  const productWords = new Set(
    productText.split(/\s+/).filter(w => w.length > 3)
  );

  const category = product.category || detectCategory(product);
  const categoryKeywords = getCategoryKeywords(category);

  const scored = posts.map(post => {
    const postText = (post.title + ' ' + post.selftext).toLowerCase();
    let relevanceScore = 0;

    // Match product brand name
    if (product.brand && postText.includes(product.brand.toLowerCase())) {
      relevanceScore += 3;
    }

    // Match product name words
    for (const word of productWords) {
      if (postText.includes(word)) {
        relevanceScore += 1;
      }
    }

    // Match category keywords
    for (const kw of categoryKeywords) {
      if (postText.includes(kw)) {
        relevanceScore += 0.5;
      }
    }

    // Match post keywords to product concerns
    if (post.keywords) {
      for (const kw of post.keywords) {
        if (productText.includes(kw)) {
          relevanceScore += 2;
        }
      }
    }

    // Recency bonus
    const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
    if (ageHours < 24) relevanceScore += 2;
    else if (ageHours < 72) relevanceScore += 1;
    else if (ageHours < 168) relevanceScore += 0.5;

    // Score/popularity bonus
    if (post.score > 500) relevanceScore += 1;
    if (post.num_comments > 100) relevanceScore += 0.5;

    return { post, relevanceScore };
  });

  // Filter by minimum relevance and sort
  return scored
    .filter(item => item.relevanceScore >= 2)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10)
    .map(item => item.post);
}

/**
 * Get relevant keywords for a product category
 */
function getCategoryKeywords(category) {
  const keywordMap = {
    'smartphone': ['phone', 'battery', 'camera', 'screen', 'display', 'charging', 'android', 'ios', 'update', 'performance', 'ram', 'storage', 'gaming', 'heating', '5g'],
    'laptop': ['laptop', 'battery', 'performance', 'ram', 'ssd', 'keyboard', 'screen', 'weight', 'fan', 'thermal', 'gaming', 'gpu', 'cpu', 'thunderbolt'],
    'tablet': ['tablet', 'ipad', 'screen', 'battery', 'stylus', 'pencil', 'performance', 'apps'],
    'headphones': ['headphone', 'earbud', 'sound', 'battery', 'anc', 'noise', 'bluetooth', 'comfort', 'fit', 'latency'],
    'smartwatch': ['watch', 'battery', 'fitness', 'heart rate', 'gps', 'notifications', 'wearable'],
    'camera': ['camera', 'lens', 'sensor', 'megapixel', 'autofocus', 'video', 'stabilization'],
    'tv': ['tv', 'screen', 'hdr', 'oled', 'smart tv', 'remote', 'hdmi', 'gaming'],
    'speaker': ['speaker', 'sound', 'bass', 'bluetooth', 'battery', 'waterproof', 'volume'],
    'monitor': ['monitor', 'screen', 'refresh', 'gaming', 'ips', 'va', 'resolution', 'hdr'],
  };

  return keywordMap[category] || ['tech', 'gadget', 'review', 'battery', 'performance', 'quality'];
}
