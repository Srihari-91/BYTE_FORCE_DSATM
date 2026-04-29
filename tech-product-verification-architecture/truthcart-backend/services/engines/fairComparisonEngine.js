// Fair Comparison Engine
// Deceptive benchmark comparison detector
// Detects misleading benchmark framing and unfair comparison baselines

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, computeRuleConfidence } from './_baseEngine.js';

const ENGINE_NAME = 'fairComparisonEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'benchmark_fairness';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

// Known generational chipsets for baseline dating
const GENERATIONAL_BASELINES = {
  'snapdragon 888': { year: 2021, tier: 'flagship' },
  'snapdragon 8 gen 1': { year: 2022, tier: 'flagship' },
  'snapdragon 8 gen 2': { year: 2023, tier: 'flagship' },
  'snapdragon 8 gen 3': { year: 2024, tier: 'flagship' },
  'a14': { year: 2020, tier: 'flagship' },
  'a15': { year: 2021, tier: 'flagship' },
  'a16': { year: 2022, tier: 'flagship' },
  'a17': { year: 2023, tier: 'flagship' },
  'a18': { year: 2024, tier: 'flagship' },
  'dimensity 9000': { year: 2022, tier: 'flagship' },
  'dimensity 9200': { year: 2023, tier: 'flagship' },
  'dimensity 9300': { year: 2024, tier: 'flagship' },
};

/**
 * Evaluate benchmark fairness in product descriptions
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function evaluateBenchmarkFairness(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const category = product.category || 'smartphone';

    // Check 1: Inflated multiplier claims without clear baseline
    const multiplierMatches = [...text.matchAll(/\b(\d+(?:\.\d+)?)\s*x\s*(?:faster|better|improved|speed|performance)\b/gi)];
    for (const match of multiplierMatches) {
      const multiplier = parseFloat(match[1]);
      if (multiplier < 2) continue;

      const contextWindow = text.substring(Math.max(0, match.index - 100), match.index + match[0].length + 100);
      const hasBaseline = /(?:than|vs\.?|versus|compared\s*to)\s*\w+/i.test(contextWindow);
      const hasOldBaseline = /\b(5\s*years?|4\s*years?|2019|2020|2021|previous\s*gen|last\s*gen)\b/i.test(contextWindow);
      const hasSpecificMetric = /\b(cpu|gpu|render|export|launch|geekbench|antutu)\b/i.test(contextWindow);

      let manipulationType = null;
      let fairnessScore = 70;
      let normalizedClaim = '';
      let explanation = '';

      if (!hasBaseline) {
        manipulationType = 'INFLATED_MULTIPLIER';
        fairnessScore = 20;
        normalizedClaim = `${multiplier}x faster — baseline not specified. Cannot verify fairness.`;
        explanation = `Claim of ${multiplier}x faster lacks any comparison baseline. Without knowing what is being compared, the claim is unverifiable.`;
      } else if (hasOldBaseline && multiplier >= 5) {
        manipulationType = 'OUTDATED_BASELINE';
        fairnessScore = 30;
        normalizedClaim = `Approximately 25-35% faster than prior-generation equivalent (cumulative gain over multiple years)`;
        explanation = `${multiplier}x claim appears to compare against a 3-5 year old baseline. Modern generational improvements are 15-25% per generation.`;
      } else if (!hasSpecificMetric) {
        manipulationType = 'INFLATED_MULTIPLIER';
        fairnessScore = 35;
        normalizedClaim = `${multiplier}x faster in unspecified metric — likely cherry-picked best-case scenario`;
        explanation = `No specific metric (CPU, GPU, app launch, etc.) is mentioned. The ${multiplier}x figure likely comes from a single cherry-picked test.`;
      } else if (multiplier >= 8) {
        manipulationType = 'OUTDATED_BASELINE';
        fairnessScore = 25;
        normalizedClaim = `Approximately 25-35% faster than prior generation; ${multiplier}x compares against very old or limited baseline`;
        explanation = `An ${multiplier}x claim is extraordinarily high for single-generation improvement. This almost certainly uses an outdated or artificially limited baseline.`;
      }

      if (manipulationType) {
        findings.push({
          claim: `${multiplier}x faster/better performance`,
          classification: 'BENCHMARK_UNFAIRNESS',
          severity: fairnessScore < 30 ? 'high' : 'medium',
          confidence: 0.85,
          evidence: [
            `Claimed: ${multiplier}x`,
            `Has baseline: ${hasBaseline}`,
            `Old baseline detected: ${hasOldBaseline}`,
            `Specific metric: ${hasSpecificMetric}`
          ],
          reasoning_trace: [
            trace('INPUT', `Detected multiplier claim: ${multiplier}x`),
            trace('BASELINE', hasBaseline ? 'Baseline mentioned' : 'NO baseline specified'),
            trace('AGE', hasOldBaseline ? 'Old baseline detected' : 'Baseline age unclear'),
            trace('METRIC', hasSpecificMetric ? 'Specific metric mentioned' : 'NO specific metric'),
            trace('CLASSIFY', `Manipulation type: ${manipulationType}`),
            trace('SCORE', `Fairness score: ${fairnessScore}`)
          ],
          source_segments: [match[0]],
          structured_output: {
            original_claim: `${multiplier}x faster/better performance`,
            comparison_target: hasBaseline ? 'mentioned but unclear' : 'not specified',
            target_generation_gap: hasOldBaseline ? 3 : null,
            fairness_score: fairnessScore,
            fairness_label: fairnessScore >= 60 ? 'fair' : fairnessScore >= 35 ? 'misleading' : 'deceptive',
            normalized_claim: normalizedClaim,
            explanation,
            manipulation_type: manipulationType
          }
        });
      }
    }

    // Check 2: Missing standard benchmarks when performance is claimed
    const hasPerformanceClaim = /\b(faster|performance|speed|benchmark|powerful)\b/i.test(text);
    const standardBenchmarks = CONSTANTS.BENCHMARK_SUITES[category] || CONSTANTS.BENCHMARK_SUITES['smartphone'];
    const hasStandardBenchmark = standardBenchmarks.some(b => text.includes(b.toLowerCase()));

    if (hasPerformanceClaim && !hasStandardBenchmark) {
      findings.push({
        claim: 'Performance claims without standard benchmarks',
        classification: 'MISSING_STANDARD_BENCHMARK',
        severity: 'medium',
        confidence: 0.82,
        evidence: [
          'Performance-related language detected',
          `No standard benchmarks found: ${standardBenchmarks.join(', ')}`
        ],
        reasoning_trace: [
          trace('SCAN', 'Performance claims detected in description'),
          trace('CHECK', `Looking for standard benchmarks: ${standardBenchmarks.join(', ')}`),
          trace('RESULT', 'No standard benchmark references found'),
          trace('FLAG', 'Performance claims may be based on proprietary or cherry-picked tests')
        ],
        structured_output: {
          original_claim: 'Performance superiority claim',
          comparison_target: 'unspecified',
          target_generation_gap: null,
          fairness_score: 40,
          fairness_label: 'misleading',
          normalized_claim: 'Performance claim without reference to standardized testing methodology',
          explanation: `No reference to industry-standard benchmarks (${standardBenchmarks.join(', ')}). Claims may be based on internal, non-reproducible tests.`,
          manipulation_type: 'MISSING_BENCHMARK'
        }
      });
    }

    // Check 3: Cross-tier comparison detection
    const flagshipMention = /\b(flagship|top[-\s]tier|premium|high[-\s]end)\b/i.test(text);
    const entryMention = /\b(entry[-\s]level|budget|affordable|basic)\b/i.test(text);
    const vsPattern = /\b(vs\.?|versus|compared\s*to|than)\b/i.test(text);

    if (flagshipMention && entryMention && vsPattern) {
      findings.push({
        claim: 'Comparison across product tiers',
        classification: 'CROSS_TIER_COMPARISON',
        severity: 'high',
        confidence: 0.8,
        evidence: [
          'Flagship/premium tier mentioned',
          'Entry/budget tier mentioned',
          'Comparison language detected (vs, compared to, than)'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected both flagship and entry-level references'),
          trace('COMPARE', 'Comparison language found in same context'),
          trace('FLAG', 'Cross-tier comparisons are inherently unfair and misleading')
        ],
        structured_output: {
          original_claim: 'Performance comparison across tiers',
          comparison_target: 'entry-level/budget device',
          target_generation_gap: null,
          fairness_score: 15,
          fairness_label: 'deceptive',
          normalized_claim: 'Comparison between fundamentally different product categories with different cost and design constraints',
          explanation: 'Comparing a flagship device against an entry-level device is not a fair or meaningful comparison. Consumers expect comparisons within the same price/performance tier.',
          manipulation_type: 'CROSS_TIER'
        }
      });
    }

    // Check 4: Laboratory/controlled condition claims
    if (/\b(laboratory|lab[-\s]tested|controlled\s*environment|ideal\s*conditions)\b/i.test(text)) {
      findings.push({
        claim: 'Performance claims based on laboratory conditions',
        classification: 'CONTROLLED_CONDITIONS',
        severity: 'medium',
        confidence: 0.85,
        evidence: [
          'Laboratory or controlled conditions mentioned',
          'Real-world factors (temperature, background apps, network) not accounted for'
        ],
        reasoning_trace: [
          trace('SCAN', 'Laboratory/controlled conditions detected'),
          trace('NOTE', 'Lab tests optimize for best-case results'),
          trace('FLAG', 'Real-world performance typically 15-30% lower than lab results')
        ],
        structured_output: {
          original_claim: 'Performance under laboratory/controlled conditions',
          comparison_target: 'real-world usage',
          target_generation_gap: null,
          fairness_score: 45,
          fairness_label: 'misleading',
          normalized_claim: 'Best-case laboratory result; real-world performance will be lower due to thermal, background processes, and network variability',
          explanation: 'Laboratory tests use temperature-controlled rooms, fresh devices, no background apps, and optimal network conditions. Consumer experience differs significantly.',
          manipulation_type: 'MANIPULATED_BASELINE'
        }
      });
    }

    return findings;
  }, product, ctx);
}

export default { evaluateBenchmarkFairness };
