// Analyze Controller
// Handles POST /analyze requests: validates input, runs pipeline, returns results

import { runPipeline } from '../services/pipeline/orchestrator.js';
import { validateAnalyzeRequest, extractValidProductData } from '../services/validation/inputValidator.js';
import { logger } from '../utils/logger.js';
import { analysisCache } from '../utils/cache.js';
import { shortHash } from '../utils/hash.js';
import { createAuditContext } from '../services/audit/auditLogger.js';

/**
 * POST /analyze handler
 */
export async function analyzeProduct(req, res) {
  const requestStart = performance.now();
  logger.trackRequest();

  // Create audit context for this request
  const auditCtx = createAuditContext();
  const requestId = auditCtx.requestId;

  try {
    // Step 1: Validate request
    const validation = validateAnalyzeRequest(req.body);

    if (!validation.valid) {
      logger.warn('Validation failed:', validation.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
        timestamp: new Date().toISOString()
      });
    }

    // Step 2: Extract and sanitize product data
    const product = extractValidProductData(req.body);
    const extractionConfidence = req.body.confidence || 0.5;
    const fingerprint = req.body.fingerprint || shortHash(product.title + product.source);

    // Step 3: Check cache
    if (fingerprint && analysisCache.has(fingerprint)) {
      logger.trackCache(true);
      const cached = analysisCache.get(fingerprint);
      logger.info('Cache hit for fingerprint:', fingerprint);

      return res.json({
        ...cached,
        cached: true,
        cache_timestamp: cached.meta?.analyzed_at
      });
    }
    logger.trackCache(false);

    // Step 4: Run analysis pipeline with request ID for audit tracing
    const result = await runPipeline(product, extractionConfidence, requestId);

    // Step 5: Cache the result
    if (fingerprint) {
      analysisCache.set(fingerprint, result, 24 * 60 * 60 * 1000); // 24h TTL
    }

    // Step 6: Return response
    const requestDuration = Math.round(performance.now() - requestStart);

    res.json({
      ...result,
      request_duration_ms: requestDuration,
      cached: false
    });

    logger.info(`Request completed in ${requestDuration}ms — Score: ${result.truth_score}`);

  } catch (err) {
    logger.error('Analysis failed:', err.message);

    res.status(500).json({
      error: 'Analysis pipeline failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal processing error',
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
}
