// Reality Preview Engine
// Media claim realism engine
// Detects unrealistic camera and media marketing claims — generates expectation correction, not media

import { CONSTANTS } from '../../config/constants.js';
import { normalizeText, runEngine, trace } from './_baseEngine.js';

const ENGINE_NAME = 'realityPreviewEngine';
const ENGINE_VERSION = CONSTANTS.ENGINE_VERSIONS[ENGINE_NAME];
const DIMENSION = 'media_claim_realism';
const DIMENSION_WEIGHT = 0.08; // Not in main dimensions — supplementary

/**
 * Evaluate media marketing claims for realism
 * @param {Object} product
 * @param {Object} [ctx]
 * @returns {Promise<import('./engineSchema.js').EngineOutput>}
 */
export async function analyzeMediaReality(product, ctx = {}) {
  return runEngine(ENGINE_NAME, ENGINE_VERSION, DIMENSION, DIMENSION_WEIGHT, async () => {
    const findings = [];
    if (!product) return findings;

    const text = normalizeText(product.description || '') + ' ' + normalizeText(product.title || '');
    const specsText = normalizeText(Object.entries(product.specs || {}).map(([k, v]) => `${k}:${v}`).join(' '));
    const allText = text + ' ' + specsText;

    // Check 1: 100x zoom realism
    const zoomMatch = allText.match(/\b(\d{2,3})x\s*(?:space\s*)?zoom\b/i);
    if (zoomMatch) {
      const zoomLevel = parseInt(zoomMatch[1]);
      const opticalMatch = allText.match(/\b(\d)x\s*optical\b/i) || allText.match(/\b(periscope|telephoto)\b/i);
      const opticalZoom = opticalMatch ? (parseInt(opticalMatch[1]) || 5) : 0;
      const digitalZoom = opticalZoom > 0 ? Math.round(zoomLevel / opticalZoom) : zoomLevel;

      if (zoomLevel > 10 && (!opticalMatch || opticalZoom < 5)) {
        findings.push({
          claim: `${zoomLevel}x zoom`,
          classification: 'ZOOM_REALISM',
          severity: 'high',
          confidence: 0.9,
          evidence: [
            `Claimed: ${zoomLevel}x zoom`,
            opticalZoom > 0 ? `Optical zoom: ${opticalZoom}x` : 'Optical zoom not specified',
            `Digital upscaling factor: ~${digitalZoom}x`
          ],
          reasoning_trace: [
            trace('SCAN', `Detected zoom claim: ${zoomLevel}x`),
            trace('OPTICAL', opticalZoom > 0 ? `Optical component: ${opticalZoom}x` : 'No optical zoom specified'),
            trace('DIGITAL', `Remaining ${zoomLevel - opticalZoom}x is digital interpolation`),
            trace('REALITY', 'Digital zoom beyond 2-3x produces blurry, artifact-heavy images unsuitable for printing or cropping')
          ],
          structured_output: {
            marketed_claim: `${zoomLevel}x zoom`,
            expected_real_output: opticalZoom > 0
              ? `${opticalZoom}x optical is sharp; ${zoomLevel}x is heavily processed with AI upscaling artifacts`
              : 'Primarily digital crop with severe quality loss at maximum zoom',
            realism_score: opticalZoom > 0 ? 35 : 15,
            realism_label: 'misleading',
            degradation_notes: [
              'Digital zoom beyond optical limit reduces resolution proportionally',
              'AI upscaling creates synthetic detail, not real information',
              'Low-light zoom performance degrades further due to smaller effective aperture'
            ],
            explanation: `${zoomLevel}x zoom is mostly digital interpolation beyond the optical limit. The resulting image will be soft, noisy, and unsuitable for anything beyond social media thumbnails.`,
            consumer_tip: 'Use optical zoom range only for acceptable quality. Beyond optical limit, move closer to the subject instead of using digital zoom.'
          }
        });
      }
    }

    // Check 2: "Shot on phone" without fine print
    if (/\bshot\s*on\s*(?:this\s*)?(?:phone|device|smartphone)\b/i.test(text)) {
      findings.push({
        claim: '"Shot on phone" marketing imagery',
        classification: 'SHOT_ON_PHONE_REALISM',
        severity: 'medium',
        confidence: 0.8,
        evidence: [
          '"Shot on phone" claim detected',
          'Professional marketing samples often use external lighting, gimbals, and editing'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected "shot on phone" marketing claim'),
          trace('CONTEXT', 'Marketing samples are produced under ideal conditions'),
          trace('REALITY', 'Consumer results will differ due to lighting, stability, and skill')
        ],
        structured_output: {
          marketed_claim: '"Shot on phone" — professional-quality imagery',
          expected_real_output: 'Results depend heavily on lighting, stability, and photographer skill. Marketing samples use controlled conditions.',
          realism_score: 40,
          realism_label: 'optimistic',
          degradation_notes: [
            'Marketing shots use professional lighting rigs',
            'External lenses or gimbals may be used (check fine print)',
            'Extensive post-processing is applied to sample images',
            'Consumer handheld shots in average lighting will look noticeably different'
          ],
          explanation: '"Shot on phone" samples are produced by professional photographers with controlled lighting, stabilization, and editing. Your results will vary significantly based on conditions and technique.',
          consumer_tip: 'Look for fine print about external equipment. For best results, use ample natural light and keep the phone steady.'
        }
      });
    }

    // Check 3: Cinematic mode realism
    if (/\bcinematic\s*mode\b/i.test(allText)) {
      findings.push({
        claim: 'Cinematic mode video',
        classification: 'CINEMATIC_MODE_REALISM',
        severity: 'medium',
        confidence: 0.85,
        evidence: [
          'Cinematic mode detected',
          'Software-based depth effect with edge detection limitations'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected cinematic mode claim'),
          trace('TECH', 'Cinematic mode uses software depth estimation, not optical depth of field'),
          trace('LIMIT', 'Edge detection fails on hair, glasses, fences, and translucent objects'),
          trace('REALITY', 'Results are impressive in ideal conditions but break down with complex subjects')
        ],
        structured_output: {
          marketed_claim: 'Cinematic mode — Hollywood-style shallow depth of field',
          expected_real_output: 'Software-based blur with visible edge artifacts on complex subjects (hair, glasses, moving objects). Works best on simple, well-lit portraits.',
          realism_score: 50,
          realism_label: 'optimistic',
          degradation_notes: [
            'Edge detection artifacts on hair and fur',
            'Glasses and transparent objects confuse depth map',
            'Low-light performance degrades significantly',
            'Fast-moving subjects create depth map tearing'
          ],
          explanation: 'Cinematic mode simulates shallow depth of field via software. The depth map is computed from the camera image and is prone to errors with complex edges, low light, and motion.',
          consumer_tip: 'Use cinematic mode for simple, well-lit, static portraits. Avoid for action shots, low light, or subjects with fine detail edges.'
        }
      });
    }

    // Check 4: Night mode realism
    if (/\b(night\s*mode|nightography|astro\s*photography)\b/i.test(allText)) {
      findings.push({
        claim: 'Night mode / nightography',
        classification: 'NIGHT_MODE_REALISM',
        severity: 'low',
        confidence: 0.82,
        evidence: [
          'Night mode capability detected',
          'Multi-frame stacking requires 2-5 second hold and stable hands'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected night mode claim'),
          trace('TECH', 'Night mode uses multi-frame capture and computational stacking'),
          trace('REQUIRE', 'Requires 2-5 second exposure hold; any motion causes blur'),
          trace('REALITY', 'Results vary dramatically by implementation and user stability')
        ],
        structured_output: {
          marketed_claim: 'Night mode — bright, detailed low-light photos',
          expected_real_output: 'Brightened images with motion blur risk. Fine detail is smoothed by noise reduction. Colors may be shifted from reality.',
          realism_score: 55,
          realism_label: 'optimistic',
          degradation_notes: [
            'Requires 2-5 second steady hold — handshake causes blur',
            'Moving subjects are smeared or ghosted',
            'Aggressive noise reduction removes fine texture',
            'Color accuracy is often sacrificed for brightness'
          ],
          explanation: 'Night mode stacks multiple exposures to reduce noise and increase brightness. This requires holding the phone steady for several seconds. Moving subjects and unsteady hands produce blurry results.',
          consumer_tip: 'Brace the phone against a stable surface. Night mode works best for static scenes. For moving subjects, accept higher noise and use standard mode with higher ISO.'
        }
      });
    }

    // Check 5: AI photo enhancement realism
    if (/\b(ai\s*(?:photo|image|camera)\s*(?:enhancement|enhancer)|ai\s*editing)\b/i.test(allText)) {
      findings.push({
        claim: 'AI photo enhancement',
        classification: 'AI_ENHANCEMENT_REALISM',
        severity: 'medium',
        confidence: 0.78,
        evidence: [
          'AI photo enhancement feature detected',
          'AI models are trained on specific datasets and may fail on diverse subjects'
        ],
        reasoning_trace: [
          trace('SCAN', 'Detected AI enhancement claim'),
          trace('MODEL', 'AI enhancement trained on specific demographic and scene datasets'),
          trace('BIAS', 'May fail on underrepresented skin tones, hair textures, and cultural features'),
          trace('REALITY', 'Results are unpredictable outside training distribution')
        ],
        structured_output: {
          marketed_claim: 'AI-enhanced photography — perfect results every time',
          expected_real_output: 'Enhancement quality varies by subject type. AI models perform best on common scenes and demographics from training data.',
          realism_score: 45,
          realism_label: 'optimistic',
          degradation_notes: [
            'Skin tone accuracy varies by training data diversity',
            'Hair texture (coily, fine) may be smoothed or altered unnaturally',
            'Cultural clothing and features may be misinterpreted',
            'Edge cases (backlight, mixed lighting) often fail'
          ],
          explanation: 'AI photo enhancement applies learned patterns from training data. Performance varies for subjects and scenes that differ from the training distribution. Results are not universally consistent.',
          consumer_tip: 'Review AI-enhanced images carefully. The "enhancement" may alter your appearance in undesirable ways. Most phones allow disabling AI processing.'
        }
      });
    }

    return findings;
  }, product, ctx);
}

export default { analyzeMediaReality };
