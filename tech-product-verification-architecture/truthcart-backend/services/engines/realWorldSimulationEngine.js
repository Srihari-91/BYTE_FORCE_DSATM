// Real-World Simulation Engine
// Heuristic real-world performance interpretation engine
// Translates peak claims into likely sustained user experience

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace, extractMetrics } from './_baseEngine.js';

const ENGINE_NAME = 'realWorldSimulationEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'realworld_expectation_gap';
const DIMENSION_WEIGHT = CONSTANTS.DIMENSION_WEIGHTS[DIMENSION];

/**
 * Simulate real-world performance from peak claims
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function simulateRealWorld(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const specs = product.specs || {};
    const specsText = normalizeText(Object.entries(specs).map(([k, v]) => `${k}:${v}`).join(' '));
    const allText = text + ' ' + specsText;

    const metrics = extractMetrics(allText);

    // Model 1: Peak brightness → typical brightness (OLED ABL)
    const peakBrightness = metrics.find(m => m.unit === 'nits' && m.value >= 1000);
    if (peakBrightness) {
      const typical = Math.round(peakBrightness.value * 0.45);
      findings.push({
        claim: `${peakBrightness.value} nits peak brightness`,
        classification: 'PEAK_TO_TYPICAL_BRIGHTNESS',
        severity: 'medium',
        confidence: 0.88,
        evidence: [`Claimed peak: ${peakBrightness.value} nits`, `OLED ABL reduces full-screen to ~45%`],
        reasoning_trace: [
          trace('INPUT', `Detected peak brightness claim: ${peakBrightness.value} nits`),
          trace('MODEL', 'OLED Automatic Brightness Limiter (ABL) model'),
          trace('CALC', `Full-screen typical brightness = ${peakBrightness.value} * 0.45 = ~${typical} nits`),
          trace('NOTE', 'Small windows (HDR highlights) reach peak; full-screen content cannot')
        ],
        structured_output: {
          claimed_peak: `${peakBrightness.value} nits peak brightness`,
          estimated_real_world: `~${typical} nits typical (full-screen content)`,
          degradation_risk: peakBrightness.value > 2500 ? 'high' : 'moderate',
          sustained_expectation: 'HDR highlights and small UI elements will appear bright; full-screen video and photos will be noticeably dimmer',
          explanation: 'OLED panels limit current to prevent degradation when large areas are bright. Peak brightness only achievable in small windows.',
          heuristic_model_used: 'OLED_ABL_HEURISTIC',
          confidence: 0.88
        }
      });
    }

    // Model 2: Burst performance → sustained (thermal throttling)
    const hasFlagshipChip = /\b(snapdragon\s*8\s*gen\s*[34]|a1[789]|dimensity\s*9[3-9]\d\d|m[234])\b/i.test(allText);
    const thicknessMatch = allText.match(/(\d+\.?\d*)\s*mm/);
    const thickness = thicknessMatch ? parseFloat(thicknessMatch[1]) : null;

    if (hasFlagshipChip && thickness !== null) {
      let sustainedPct, risk, explanation, basis;

      if (thickness < 7.5) {
        sustainedPct = '55-65%';
        risk = 'high';
        explanation = 'Flagship SoC in sub-7.5mm chassis has minimal thermal mass and surface area. Expect significant throttling within 3-5 minutes of sustained load.';
        basis = 'Thermal resistance R_th increases as thickness decreases; sub-7.5mm designs rarely include vapor chambers.';
      } else if (thickness < 9) {
        sustainedPct = '65-75%';
        risk = 'moderate';
        explanation = 'Moderate thickness allows some thermal dissipation, but sustained gaming or rendering will still trigger throttling after 5-10 minutes.';
        basis = 'Standard graphite sheets and thermal paste provide limited sustained dissipation without vapor chamber.';
      } else {
        sustainedPct = '80-90%';
        risk = 'low';
        explanation = 'Thicker chassis with likely vapor chamber or large graphite area can sustain near-peak performance for extended periods.';
        basis = 'Increased thermal mass and surface area enable better sustained heat rejection.';
      }

      findings.push({
        claim: 'Flagship performance in ' + (thickness ? `${thickness}mm` : 'slim') + ' chassis',
        classification: 'THERMAL_THROTTLING_EXPECTATION',
        severity: risk === 'high' ? 'high' : risk === 'moderate' ? 'medium' : 'low',
        confidence: 0.82,
        evidence: [
          `Chipset: flagship tier detected`,
          `Chassis thickness: ${thickness ? thickness + 'mm' : 'unknown'}`,
          `Estimated sustained: ${sustainedPct} of peak`
        ],
        reasoning_trace: [
          trace('INPUT', 'Detected flagship chipset in product'),
          trace('MEASURE', `Chassis thickness: ${thickness || 'unknown'}mm`),
          trace('MODEL', 'Thermal throttling heuristic based on thickness'),
          trace('CALC', `Sustained performance estimate: ${sustainedPct} of peak`)
        ],
        structured_output: {
          claimed_peak: 'Flagship-level peak performance',
          estimated_real_world: `${sustainedPct} of peak performance under sustained load`,
          degradation_risk: risk,
          sustained_expectation: explanation,
          explanation,
          heuristic_model_used: 'THERMAL_THROTTLING_HEURISTIC',
          confidence: 0.82
        }
      });
    }

    // Model 3: Battery life estimation from mAh + screen + chip
    const batteryMah = metrics.find(m => m.unit === 'mah');
    const screenSize = metrics.find(m => m.unit === 'inch');
    const refreshRate = metrics.find(m => m.unit === 'hz');

    if (batteryMah) {
      let screenDrain = 0;
      if (screenSize) {
        screenDrain = screenSize.value * 150; // ~150mA per inch for OLED at medium brightness
      }
      let refreshDrain = 0;
      if (refreshRate) {
        refreshDrain = (refreshRate.value / 60) * 200; // baseline 200mA at 60Hz
      }

      const hasEfficientChip = /\b(snapdragon\s*8\s*gen\s*3|a17|dimensity\s*9[3-9]\d\d)\b/i.test(allText);
      const chipEfficiency = hasEfficientChip ? 0.85 : 1.0;
      const totalDrain = (screenDrain + refreshDrain + 300) * chipEfficiency; // 300mA base system
      const estimatedHours = Math.round((batteryMah.value / totalDrain) * 10) / 10;

      let expectation;
      if (estimatedHours >= 8) expectation = 'Full day of moderate use achievable';
      else if (estimatedHours >= 5) expectation = 'Light-to-moderate use only; heavy users will need mid-day charge';
      else expectation = 'Frequent charging required for active use';

      findings.push({
        claim: `${batteryMah.value}mAh battery`,
        classification: 'BATTERY_LIFE_HEURISTIC',
        severity: estimatedHours < 5 ? 'high' : estimatedHours < 8 ? 'medium' : 'low',
        confidence: 0.75,
        evidence: [
          `Battery: ${batteryMah.value}mAh`,
          screenSize ? `Screen: ${screenSize.value}"` : 'Screen size unknown',
          refreshRate ? `Refresh: ${refreshRate.value}Hz` : 'Refresh rate unknown',
          `Estimated screen-on time: ~${estimatedHours}h`
        ],
        reasoning_trace: [
          trace('INPUT', `Battery capacity: ${batteryMah.value}mAh`),
          trace('MODEL', 'Heuristic battery drain model'),
          trace('PARAMS', `Screen drain: ~${Math.round(screenDrain)}mA, Refresh drain: ~${Math.round(refreshDrain)}mA, Base: 300mA`),
          trace('EFFICIENCY', `Chip efficiency factor: ${chipEfficiency}`),
          trace('CALC', `Estimated screen-on time: ~${estimatedHours} hours`),
          trace('NOTE', 'Actual varies significantly by usage, network, and ambient temperature')
        ],
        structured_output: {
          claimed_peak: `${batteryMah.value}mAh battery capacity`,
          estimated_real_world: `~${estimatedHours} hours screen-on time (moderate use)`,
          degradation_risk: estimatedHours < 5 ? 'high' : estimatedHours < 8 ? 'moderate' : 'low',
          sustained_expectation: expectation,
          explanation: `Estimated from ${batteryMah.value}mAh with heuristic drain model. Real-world varies by 30-50% based on usage patterns.`,
          heuristic_model_used: 'BATTERY_DRAIN_HEURISTIC',
          confidence: 0.75
        }
      });
    }

    // Model 4: Speed uplift claims
    const upliftMatch = allText.match(/(\d+(?:\.\d+)?)\s*x\s*(?:faster|speed|performance)/i);
    if (upliftMatch) {
      const multiplier = parseFloat(upliftMatch[1]);
      const baselineGenMatch = allText.match(/(?:than|vs\.?|versus)\s*(?:previous|last|prior|older|(?:\d{1,2})\s*gen)/i);
      const hasOldBaseline = /\b(5\s*years?|4\s*years?|2019|2020|2021)\b/i.test(allText);

      if (multiplier >= 5 && (hasOldBaseline || !baselineGenMatch)) {
        const fairUplift = hasOldBaseline ? '25-35%' : '40-60%';
        findings.push({
          claim: `${multiplier}x faster performance`,
          classification: 'INFLATED_SPEED_UPLIFT',
          severity: 'high',
          confidence: 0.85,
          evidence: [`Claimed: ${multiplier}x faster`, hasOldBaseline ? 'Baseline appears to be 4-5 years old' : 'Baseline not clearly specified'],
          reasoning_trace: [
            trace('INPUT', `Detected speed uplift claim: ${multiplier}x`),
            trace('BASELINE', hasOldBaseline ? 'Baseline appears to be 4-5+ years old' : 'No clear generational baseline specified'),
            trace('MODEL', 'Generational performance scaling: ~15-25% per generation (Moore\'s Law slowdown)'),
            trace('CALC', `${multiplier}x over 4-5 years implies ~${fairUplift} per generation — realistic`),
            trace('FLAG', 'Marketing presents cumulative multi-year gain as single generational leap')
          ],
          structured_output: {
            claimed_peak: `${multiplier}x faster than baseline`,
            estimated_real_world: `Approximately ${fairUplift} faster than immediately prior generation`,
            degradation_risk: 'moderate',
            sustained_expectation: 'Real-world app launch and rendering improvements are typically 20-40% generational, not multiplicative.',
            explanation: `A ${multiplier}x claim usually compares against a much older baseline. Versus the prior generation, expect ${fairUplift} improvement in most tasks.`,
            heuristic_model_used: 'GENERATIONAL_PERFORMANCE_SCALING',
            confidence: 0.85
          }
        });
      }
    }

    return findings;
  }, product, ctx);
}

export default { simulateRealWorld };
