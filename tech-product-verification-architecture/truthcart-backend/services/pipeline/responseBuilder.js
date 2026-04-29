// Final Response Builder
// Constructs the standardized API response from pipeline results

import { generateHash } from '../../utils/hash.js';

// Dimension name mapping for backward-compatible score_breakdown
const DIMENSION_LABEL_MAP = {
  claim_verifiability: 'Claim Accuracy',
  config_consistency: 'Spec Transparency',
  comparability_distortion: 'Spec Transparency',
  metric_realism: 'Spec Transparency',
  benchmark_fairness: 'Benchmark Fairness',
  tradeoff_concealment: 'Spec Transparency',
  feature_attribution: 'Material Honesty',
  material_inflation: 'Material Honesty',
  realworld_expectation_gap: 'Claim Accuracy'
};

// Full dimension labels for trust decomposition
const DECOMPOSITION_LABELS = {
  claim_verifiability: 'Claim Verifiability',
  config_consistency: 'Config Honesty',
  comparability_distortion: 'Comparability',
  metric_realism: 'Metric Realism',
  benchmark_fairness: 'Benchmark Fairness',
  tradeoff_concealment: 'Trade-off Concealment',
  feature_attribution: 'Feature Honesty',
  material_inflation: 'Material Inflation',
  realworld_expectation_gap: 'Reality Gap'
};

/**
 * Build the final analysis response
 * @param {Object} data - Pipeline results
 * @returns {Object} Standardized API response
 */
export function buildFinalResponse(data) {
  const {
    trust_result,
    engine_outputs,
    reddit,
    claims,
    confidence,
    confidenceFactors,
    product,
    request_id,
    pipeline_duration_ms
  } = data;

  const truthScore = trust_result.trust_score;
  const verdict = trust_result.verdict;
  const confidenceLevel = trust_result.confidence_level;

  // Convert engine findings to backward-compatible flags and insights
  const { flags, insights } = convertEngineOutputsToLegacy(engine_outputs);

  // Generate summary
  const summary = generateSummary(truthScore, flags, insights, reddit);

  // Deduplicate flags
  const uniqueFlags = deduplicateFlags(flags);

  // Calculate stats
  const stats = calculateStats(uniqueFlags, insights, claims, reddit);

  const trustDecomposition = buildTrustDecomposition(trust_result);
  const claimRiskMatrix = buildClaimRiskMatrix(uniqueFlags);
  const realitySnapshot = buildRealitySnapshot(uniqueFlags, insights, engine_outputs);
  const tradeoffData = extractTradeoffs(engine_outputs);
  const recommendation = buildRecommendation(truthScore, uniqueFlags, stats, reddit, product);

  const response = {
    // Core results (backward compatible)
    truth_score: truthScore,
    confidence: confidenceLevel,
    verdict,
    summary,

    // Score breakdown from dimensional scoring (mapped to backward-compatible format)
    score_breakdown: (trust_result.dimensional_breakdown || []).map(d => ({
      label: DIMENSION_LABEL_MAP[d.dimension] || d.dimension.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: d.score
    })),

    // Detailed analysis (backward compatible)
    flags: uniqueFlags.slice(0, 15),
    insights: insights.slice(0, 20),

    // Pipeline performance stats
    pipeline_stats: {
      duration_ms: pipeline_duration_ms || 0,
      claims_analyzed: Array.isArray(claims) ? claims.length : 0,
      reddit_posts: reddit?.relevantPostCount || 0,
      modules_run: engine_outputs.length + 1
    },

    // Statistics
    stats,

    // Reddit signals
    reddit: reddit ? {
      issues: reddit.issues || {},
      contradictions: (reddit.contradictions || []).slice(0, 5),
      confidence: reddit.confidence || 0
    } : null,

    // Claims analysis
    claims_analysis: {
      total: Array.isArray(claims) ? claims.length : 0,
      extracted: claims?.slice(0, 10).map(c => ({
        text: c.text?.substring(0, 100),
        type: c.type
      })) || []
    },

    // New deterministic analysis section
    deterministic_analysis: {
      trust_result,
      engine_outputs: engine_outputs.map(eo => ({
        engine: eo.engine,
        version: eo.version,
        deterministic: eo.deterministic,
        findings_count: eo.findings.length,
        score_contribution: eo.score_contribution,
        findings: eo.findings.map(f => ({
          claim: f.claim,
          classification: f.classification,
          severity: f.severity,
          confidence: f.confidence,
          structured_output: f.structured_output
        }))
      }))
    },

    // === PREMIUM INTELLIGENCE SECTIONS ===

    // Trust Score Decomposition (9 weighted dimensions)
    trust_decomposition: trustDecomposition,

    // Claim Risk Matrix
    claim_risk_matrix: claimRiskMatrix,

    // Product Reality Snapshot
    reality_snapshot: realitySnapshot,

    // Trade-off intelligence
    tradeoffs: tradeoffData,

    // Contextual recommendation
    recommendation,

    // Audit trace
    audit_log_id: request_id,

    // Metadata
    meta: {
      product_id: product?.id || generateHash(product?.title || ''),
      product_title: product?.title || 'Unknown',
      product_category: product?.category || 'unknown',
      source: product?.source || 'unknown',
      extraction_confidence: confidence || 0,
      confidence_factors: confidenceFactors || [],
      analyzed_at: new Date().toISOString(),
      pipeline_version: '2.0.0',
      engine_count: engine_outputs.length
    }
  };

  return response;
}

/**
 * Generate a human-readable summary
 */
function generateSummary(score, flags, insights, reddit) {
  if (score >= 85) {
    return 'This product\'s marketing claims align well with its actual specifications and real-world performance. Minimal exaggeration detected.';
  }
  if (score >= 70) {
    return 'Mostly reliable product information with some minor marketing exaggerations. Overall a trustworthy listing with a few overstatements.';
  }
  if (score >= 55) {
    return 'Mixed signals — some marketing claims are accurate while others appear overstated. Review the flagged items before purchasing.';
  }
  if (score >= 40) {
    return 'Significant gap between marketing claims and verifiable specs. Multiple exaggerated or vague claims detected. Community feedback suggests real-world concerns.';
  }
  return 'Marketing claims substantially misaligned with available evidence. Strong recommendation to cross-reference with independent reviews before purchasing.';
}

/**
 * Convert structured engine outputs to backward-compatible flags and insights
 */
function convertEngineOutputsToLegacy(engineOutputs) {
  const flags = [];
  const insights = [];

  for (const output of engineOutputs) {
    for (const finding of output.findings || []) {
      const so = finding.structured_output || {};

      // High/medium severity findings become flags
      if (finding.severity === 'high' || finding.severity === 'critical' || finding.severity === 'medium') {
        flags.push({
          claim: finding.claim || so.claim || so.marketing_term || so.feature || 'Unknown',
          type: finding.classification || 'GENERAL',
          severity: finding.severity,
          explanation: so.explanation || so.reason || finding.claim || '',
          analyzer: output.engine
        });
      }

      // All findings become insights
      insights.push({
        type: 'engine_finding',
        text: so.explanation || so.reason || so.consumer_interpretation || finding.claim || '',
        category: so.category || so.affected_metric || so.origin_type || 'OTHER',
        confidence: finding.confidence || 0.8,
        engine: output.engine
      });
    }
  }

  return { flags, insights };
}

/**
 * Deduplicate flags by claim text
 */
function deduplicateFlags(flags) {
  const seen = new Set();
  return flags.filter(flag => {
    const key = (flag.claim || '').toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Calculate analysis statistics
 */
function calculateStats(flags, insights, claims, reddit) {
  return {
    total_flags: flags.length,
    high_severity_flags: flags.filter(f => f.severity === 'high').length,
    medium_severity_flags: flags.filter(f => f.severity === 'medium').length,
    low_severity_flags: flags.filter(f => f.severity === 'low').length,
    total_insights: insights.length,
    total_claims_extracted: Array.isArray(claims) ? claims.length : 0,
    reddit_contradictions: reddit?.contradictions?.length || 0,
    reddit_issues: reddit?.issues ? Object.keys(reddit.issues).length : 0
  };
}

/**
 * Build trust decomposition from dimensional breakdown
 */
function buildTrustDecomposition(trustResult) {
  const breakdown = trustResult?.dimensional_breakdown || [];
  return breakdown.map(d => ({
    dimension: d.dimension,
    label: DECOMPOSITION_LABELS[d.dimension] || d.dimension.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    score: d.score,
    weight: d.weight,
    contribution: d.contribution,
    findings_count: d.findings_count
  }));
}

/**
 * Build claim risk matrix — flags grouped by risk level
 */
function buildClaimRiskMatrix(flags) {
  const matrix = { misleading: [], conditional: [], non_verifiable: [], safe: [] };
  for (const flag of flags) {
    const severity = flag.severity || 'low';
    if (severity === 'critical' || severity === 'high') {
      matrix.misleading.push({ claim: flag.claim, explanation: flag.explanation, severity: flag.severity, analyzer: flag.analyzer });
    } else if (severity === 'medium') {
      matrix.conditional.push({ claim: flag.claim, explanation: flag.explanation, severity: flag.severity, analyzer: flag.analyzer });
    } else if (severity === 'low') {
      matrix.non_verifiable.push({ claim: flag.claim, explanation: flag.explanation, severity: flag.severity, analyzer: flag.analyzer });
    } else {
      matrix.safe.push({ claim: flag.claim, explanation: flag.explanation, severity: flag.severity, analyzer: flag.analyzer });
    }
  }
  return matrix;
}

/**
 * Build product reality snapshot from flags and insights
 */
function buildRealitySnapshot(flags, insights, engineOutputs) {
  const real = insights.filter(i => i.confidence > 0.7 && !i.text.includes('may') && !i.text.includes('might')).slice(0, 3).map(i => i.text.substring(0, 120));
  const inflated = flags.filter(f => f.severity === 'high').slice(0, 3).map(f => f.explanation || f.claim);
  const misleading = flags.filter(f => f.severity === 'medium').slice(0, 3).map(f => f.explanation || f.claim);
  const whatMatters = [];
  for (const output of engineOutputs) {
    for (const finding of output.findings || []) {
      if (finding.severity === 'high' || finding.severity === 'critical') {
        whatMatters.push((finding.structured_output || {}).explanation || (finding.structured_output || {}).reason || finding.claim || '');
      }
    }
  }
  return {
    what_is_real: real.slice(0, 3),
    what_is_inflated: inflated.slice(0, 3),
    what_is_misleading: misleading.slice(0, 3),
    what_actually_matters: whatMatters.slice(0, 3)
  };
}

/**
 * Extract trade-off data from engine outputs
 */
function extractTradeoffs(engineOutputs) {
  const tradeoffEngine = engineOutputs.find(eo => eo.engine === 'tradeOffEngine');
  if (!tradeoffEngine) return [];
  return tradeoffEngine.findings.map(f => ({
    claimed_benefit: (f.structured_output || {}).claimed_benefit || f.claim || 'Unknown',
    hidden_tradeoff: (f.structured_output || {}).hidden_tradeoff || 'Unknown',
    affected_metric: (f.structured_output || {}).affected_metric || 'general',
    severity: f.severity || 'medium',
    confidence: f.confidence || 0.8,
    engineering_basis: (f.structured_output || {}).engineering_basis || ''
  }));
}

/**
 * Build contextual recommendation
 */
function buildRecommendation(score, flags, stats, reddit, product) {
  const highCount = stats.high_severity_flags || 0;
  const medCount = stats.medium_severity_flags || 0;
  const hasRedditConcerns = (reddit?.issues ? Object.keys(reddit.issues).length : 0) > 0 || (reddit?.contradictions?.length || 0) > 0;
  const price = product?.price ? parseFloat(product.price) : 0;
  if (score >= 85 && highCount === 0 && !hasRedditConcerns)
    return { action: 'buy_confidence', label: 'Buy with Confidence', detail: 'Product claims are well-supported and community feedback is positive.', alternatives: 'Consider verifying specific claims that matter most to your use case.', evidence_count: stats.total_insights || 0 };
  if (score >= 70 && highCount <= 1)
    return { action: 'likely_safe', label: 'Likely Safe, Verify Key Claims', detail: 'Most claims check out, but some may be slightly overstated.', alternatives: 'Look for third-party reviews validating the key performance claims.', evidence_count: stats.total_insights || 0 };
  if (score >= 55 && medCount < 4 && !hasRedditConcerns)
    return { action: 'cautious', label: 'Proceed with Caution', detail: 'Mixed signals. Several claims lack clear evidence or are phrased vaguely.', alternatives: 'Compare with alternative products with more transparent specifications.', evidence_count: stats.total_insights || 0 };
  if (score >= 40 || medCount >= 4 || highCount >= 2)
    return { action: 'skip', label: 'Better Alternatives Available', detail: 'Significant marketing exaggeration detected.', alternatives: 'Consider products from brands with better specification transparency.', evidence_count: stats.total_insights || 0 };
  if (price > 500 && score < 60)
    return { action: 'expensive_risk', label: 'High Price, Low Trust — Avoid', detail: 'For this price point, the lack of verifiable claims makes this a risky purchase.', alternatives: price > 1000 ? 'Premium-priced products should have premium transparency. Consider established alternatives.' : 'Look for products with detailed, verifiable specifications.', evidence_count: stats.total_insights || 0 };
  return { action: 'buyer_beware', label: 'Buyer Beware', detail: 'Multiple red flags detected. Marketing claims substantially misaligned with available evidence.', alternatives: 'Thoroughly research alternatives. Consider waiting for more independent reviews.', evidence_count: stats.total_insights || 0 };
}


