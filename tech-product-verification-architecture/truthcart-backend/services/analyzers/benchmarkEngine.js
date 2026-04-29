// Benchmark Fairness Engine
// Evaluates if claimed performance metrics use fair, standard testing conditions
// Detects cherry-picked benchmarks versus industry-standard testing

import { CONSTANTS } from '../../config/constants.js';

/**
 * Evaluate benchmark fairness in product descriptions
 * @param {string} description - Product description
 * @param {Object} product - Product data
 * @returns {Array} Flags and insights about benchmark fairness
 */
export function evaluateBenchmarkFairness(description, product = {}) {
  const flags = [];
  const insights = [];
  const text = (description || '').toLowerCase();
  const category = product.category || 'electronics';

  // Check 1: Cherry-picked benchmark claims
  const cherryPickPatterns = [
    { regex: /\b(up to|upto)\s*\d+x?\s*(faster|better|improved)/i, flag: 'Cherry-picked performance multiplier without baseline' },
    { regex: /\b(\d+)%\s*(faster|better|more efficient)\s*than\s*(previous|last|competitor)/i, flag: 'Percentage claim without testing methodology' },
    { regex: /\b(best\s*(score|result|performance))/i, flag: 'Subjective "best" claim without comparison context' },
    { regex: /\b(our\s*tests? show|internal\s*testing|lab\s*test)/i, flag: 'Internal/lab testing — not third-party verified' },
    { regex: /\b(versus|vs\.?)\s*(leading|top|competitor)\b/i, flag: 'Vague competitor comparison — unnamed rival' },
  ];

  for (const { regex, flag } of cherryPickPatterns) {
    if (regex.test(text)) {
      flags.push({
        claim: text.match(regex)?.[0] || 'Unknown',
        type: 'BENCHMARK_FAIRNESS',
        severity: CONSTANTS.SEVERITY.MEDIUM,
        explanation: flag,
        analyzer: 'benchmarkEngine'
      });
    }
  }

  // Check 2: Missing standard benchmark references
  const standardBenchmarks = CONSTANTS.BENCHMARK_SUITES[category] || 
                              CONSTANTS.BENCHMARK_SUITES['smartphone'];

  const hasStandardBenchmark = standardBenchmarks.some(bench => 
    text.includes(bench.toLowerCase())
  );

  if (!hasStandardBenchmark && (text.includes('performance') || text.includes('benchmark'))) {
    flags.push({
      claim: 'Performance claims without standard benchmarks',
      type: 'BENCHMARK_FAIRNESS',
      severity: CONSTANTS.SEVERITY.LOW,
      explanation: `No reference to standard benchmarks (${standardBenchmarks.join(', ')}). Claims may be based on proprietary or cherry-picked tests.`,
      analyzer: 'benchmarkEngine'
    });
  }

  // Check 3: Controlled condition claims
  if (text.includes('laboratory') || text.includes('lab condition') || text.includes('controlled environment')) {
    insights.push({
      type: 'benchmark',
      text: 'Performance claims based on laboratory/controlled conditions. Real-world performance may differ due to environmental factors (temperature, network conditions, background processes).',
      category: 'PERFORMANCE',
      confidence: 0.85
    });
  }

  // Check 4: Peak vs sustained performance
  if (text.includes('peak') || text.includes('maximum') || text.includes('burst')) {
    insights.push({
      type: 'benchmark',
      text: '"Peak" or "maximum" performance metric cited — this may not represent sustained performance. Thermal throttling typically reduces performance under extended load.',
      category: 'PERFORMANCE',
      confidence: 0.8
    });
  }

  // Check 5: Thermal throttle warning
  const isSlimOrCompact = text.includes('slim') || text.includes('thin') || text.includes('compact') || text.includes('light');
  const hasHighPerf = text.includes('gaming') || text.includes('high performance') || text.includes('flagship');

  if (isSlimOrCompact && hasHighPerf) {
    flags.push({
      claim: 'High performance in slim/compact design',
      type: 'THERMAL_CONCERN',
      severity: CONSTANTS.SEVERITY.MEDIUM,
      explanation: 'High-performance hardware in a slim form factor may experience thermal throttling under sustained load. Peak performance may degrade significantly.',
      analyzer: 'benchmarkEngine'
    });
  }

  // Check 6: Missing test conditions
  const hasTestConditions = /(ambient|temperature|room|standard|iso|industry\s*standard)\s*(temperature|condition|test)/i.test(text);

  if (!hasTestConditions && (flags.length > 1)) {
    flags.push({
      claim: 'Multiple performance claims without test conditions',
      type: 'BENCHMARK_FAIRNESS',
      severity: CONSTANTS.SEVERITY.LOW,
      explanation: 'Performance metrics cited without specifying test conditions (ambient temperature, software version, test duration). Results may not be reproducible.',
      analyzer: 'benchmarkEngine'
    });
  }

  // Provide benchmark guidance
  if (standardBenchmarks.length > 0) {
    insights.push({
      type: 'benchmark',
      text: `For verifiable ${category} performance, look for standardized benchmarks: ${standardBenchmarks.join(', ')}. These provide reproducible, cross-device comparison data.`,
      category: 'PERFORMANCE',
      confidence: 0.9
    });
  }

  return { flags, insights };
}
