// Reddit Pipeline Runner
// Orchestrates the Reddit intelligence pipeline:
// fetch mock posts → filter relevance → analyze → match claims

import MOCK_REDDIT_DATASET from './redditClient.js';
import { filterRelevantPosts } from './redditFilter.js';
import { analyzeRedditPosts } from './redditAnalyzer.js';
import { matchClaimsToReddit } from './redditMatcher.js';
import { logger } from '../../../utils/logger.js';

/**
 * Run the complete Reddit intelligence pipeline
 * @param {Object} product - Product data
 * @param {Array} claims - Extracted claims (optional, for matching)
 * @returns {Object} Reddit analysis results
 */
export async function runRedditPipeline(product, claims = []) {
  const startTime = performance.now();
  
  try {
    // Step 1: Use mock dataset (production would call Reddit API)
    const allPosts = MOCK_REDDIT_DATASET;
    
    // Step 2: Filter posts relevant to this product
    const relevantPosts = filterRelevantPosts(allPosts, product);
    logger.debug(`Reddit: ${relevantPosts.length} relevant posts found`);
    
    // Step 3: Analyze posts for issues and complaints
    const analysis = analyzeRedditPosts(relevantPosts);
    
    // Step 4: Match Reddit findings against product claims
    const matchResults = matchClaimsToReddit(claims, analysis);
    
    const duration = Math.round(performance.now() - startTime);
    logger.debug(`Reddit pipeline completed in ${duration}ms`);
    logger.trackReddit(true);
    
    return {
      issues: analysis.issues,
      contradictions: matchResults.contradictions,
      confidence: matchResults.confidence,
      relevantPostCount: relevantPosts.length,
      totalIssuesFound: Object.keys(analysis.issues).length,
      pipelineDurationMs: duration
    };
  } catch (err) {
    logger.error('Reddit pipeline error:', err.message);
    logger.trackReddit(false);
    
    return {
      issues: {},
      contradictions: [],
      confidence: 0,
      relevantPostCount: 0,
      totalIssuesFound: 0,
      error: err.message
    };
  }
}
