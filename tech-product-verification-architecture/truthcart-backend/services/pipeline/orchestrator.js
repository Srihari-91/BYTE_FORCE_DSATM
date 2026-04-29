// Pipeline Orchestrator
// Core brain: coordinates all Trust Intelligence Engines, NLP, and Reddit pipeline in parallel
// Aggregates structured engine outputs for deterministic trust scoring

import { extractClaims } from '../nlp/claimExtractor.js';

// New deterministic Trust Intelligence Engines
import { classifyClaims } from '../engines/claimClassificationEngine.js';
import { checkConfigConsistency } from '../engines/configConsistencyEngine.js';
import { translateSpecs } from '../engines/specTranslationEngine.js';
import { mapReality } from '../engines/realityMappingEngine.js';
import { simulateRealWorld } from '../engines/realWorldSimulationEngine.js';
import { evaluateBenchmarkFairness } from '../engines/fairComparisonEngine.js';
import { detectTradeoffs } from '../engines/tradeOffEngine.js';
import { tagMaterials } from '../engines/materialRealityEngine.js';
import { trackFeatureOrigin } from '../engines/featureOriginEngine.js';
import { analyzeMediaReality } from '../engines/realityPreviewEngine.js';
import { computeTrustScore } from '../engines/trustScoringEngine.js';

import { buildFinalResponse } from './responseBuilder.js';
import { adjustConfidence } from '../validation/confidenceAdjuster.js';
import { logger } from '../../utils/logger.js';
import { logExtractedClaims, logEngineExecution } from '../audit/auditLogger.js';

/**
 * Run the complete TruthCart analysis pipeline
 * @param {Object} product - Normalized product data
 * @param {number} extractionConfidence - Confidence from extension extraction
 * @param {string} requestId - Audit trace request ID
 * @returns {Object} Complete analysis result
 */
export async function runPipeline(product, extractionConfidence = 0.5, requestId = 'unknown') {
  const pipelineStart = performance.now();

  logger.info('Pipeline started for:', product.title?.substring(0, 50));

  // Adjust confidence based on data quality
  const { adjustedConfidence, factors } = adjustConfidence(product, extractionConfidence);

  // Step 1: Extract claims from product description
  const claims = extractClaims(product);
  logger.debug(`Extracted ${claims.length} claims`);
  logExtractedClaims(requestId, claims, product.description || '');

  // Build context object for engines
  const ctx = { __requestId: requestId };

  // Step 2: Run all Trust Intelligence Engines in parallel
  const [
    claimOutput,
    configOutput,
    specOutput,
    realityOutput,
    realWorldOutput,
    benchmarkOutput,
    tradeoffOutput,
    materialOutput,
    featureOutput,
    mediaOutput,
    redditData
  ] = await Promise.all([
    classifyClaims(claims, product, ctx),
    checkConfigConsistency(product, ctx),
    translateSpecs(product.description, product.specs, ctx),
    mapReality(product, ctx),
    simulateRealWorld(product, ctx),
    evaluateBenchmarkFairness(product, ctx),
    detectTradeoffs(product, ctx),
    tagMaterials(product, ctx),
    trackFeatureOrigin(product, ctx),
    analyzeMediaReality(product, ctx),
    // Reddit is replaced with redirect-based approach — return neutral data
    Promise.resolve({ issues: {}, contradictions: [], confidence: 0, relevantPostCount: 0 })
  ]);

  const engineOutputs = [
    claimOutput, configOutput, specOutput, realityOutput, realWorldOutput,
    benchmarkOutput, tradeoffOutput, materialOutput, featureOutput, mediaOutput
  ];

  // Log engine executions for audit
  for (const output of engineOutputs) {
    logEngineExecution(requestId, output.engine, { product: product.title }, output, 0);
  }

  // Step 3: Compute Reddit community score
  const redditScore = redditData.contradictions && redditData.contradictions.length > 0
    ? Math.max(30, 100 - (redditData.contradictions.length * 15))
    : 70;

  // Step 4: Compute deterministic trust score from engine outputs
  const trustResult = computeTrustScore(engineOutputs, redditScore, requestId);

  // Step 5: Build final response
  const pipelineDuration = Math.round(performance.now() - pipelineStart);
  const response = buildFinalResponse({
    trust_result: trustResult,
    engine_outputs: engineOutputs,
    reddit: redditData,
    claims: claims,
    confidence: adjustedConfidence,
    confidenceFactors: factors,
    product,
    request_id: requestId,
    pipeline_duration_ms: pipelineDuration
  });

  logger.trackAnalysis(true, pipelineDuration);
  logger.info(`Pipeline completed in ${pipelineDuration}ms — Score: ${trustResult.trust_score}`);

  return response;
}


