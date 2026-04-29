// TruthCart Constants Configuration
// Scoring weights, thresholds, category enums, and system-wide constants

export const CONSTANTS = {
  // Pipeline scoring weights
  SCORING: {
    BASE_ANALYZER_WEIGHT: 0.70,
    REDDIT_WEIGHT: 0.30,
    MIN_CONFIDENCE_THRESHOLD: 0.3,
  },

  // Truth score thresholds
  THRESHOLDS: {
    EXCEPTIONAL: 85,
    RELIABLE: 70,
    MIXED: 55,
    HEAVY_MARKETING: 40,
    // Below 40 = BUYER_BEWARE
  },

  // Verdict labels
  VERDICTS: {
    EXCEPTIONAL: 'EXCEPTIONAL — Marketing aligns with reality',
    RELIABLE: 'MOSTLY RELIABLE — Minor marketing exaggerations',
    MIXED: 'MIXED — Some claims are overstated',
    HEAVY_MARKETING: 'MARKETING HEAVY — Significant gaps found',
    BUYER_BEWARE: 'BUYER BEWARE — Claims substantially misaligned',
  },

  // Claim type classification
  CLAIM_TYPES: [
    'PERFORMANCE',
    'BATTERY',
    'DURABILITY',
    'CAMERA',
    'DISPLAY',
    'AUDIO',
    'CONNECTIVITY',
    'MATERIAL',
    'SIZE_WEIGHT',
    'WARRANTY',
    'SOFTWARE',
    'CHARGING',
    'STORAGE',
    'SECURITY',
    'OTHER'
  ],

  // Flag severity levels
  SEVERITY: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  },

  // Product categories and their expected specs
  CATEGORY_SPECS: {
    smartphone: ['processor', 'ram', 'storage', 'display', 'battery', 'camera', 'os', 'weight'],
    laptop: ['processor', 'ram', 'storage', 'display', 'battery', 'weight', 'os', 'gpu'],
    tablet: ['processor', 'ram', 'storage', 'display', 'battery', 'os', 'weight'],
    headphones: ['driver_size', 'battery', 'connectivity', 'weight', 'noise_cancellation'],
    smartwatch: ['display', 'battery', 'os', 'sensors', 'water_resistance', 'weight'],
    camera: ['megapixels', 'sensor_size', 'lens', 'iso_range', 'video', 'weight'],
    tv: ['display_size', 'resolution', 'refresh_rate', 'hdr', 'smart_platform', 'connectivity'],
    speaker: ['power_output', 'driver_size', 'battery', 'connectivity', 'water_resistance'],
    monitor: ['display_size', 'resolution', 'refresh_rate', 'panel_type', 'response_time'],
  },

  // Known marketing exaggeration patterns
  MARKETING_PATTERNS: [
    { pattern: /\b(up to|upto)\b/i, flag: 'Vague upper bound — no typical/minimum stated' },
    { pattern: /\b(best[-\s]in[-\s]class|industry[-\s]leading)\b/i, flag: 'Superlative claim without verifiable benchmark' },
    { pattern: /\b(military[-\s]grade)\b/i, flag: 'Military-grade claim — check which MIL-STD standard' },
    { pattern: /\b(AI[-\s]powered|artificial intelligence)\b/i, flag: 'AI claim — likely software-based enhancement, not true AI' },
    { pattern: /\b(all[-\s]day battery)\b/i, flag: 'All-day claim — verify with standardized usage tests' },
    { pattern: /\b(lightning[-\s]fast|blazing|ultra[-\s]fast)\b/i, flag: 'Vague speed claim without specific metrics' },
    { pattern: /\b(premium|high[-\s]quality)\b(?!\s+(glass|aluminum|metal))/i, flag: 'Vague quality claim without material specification' },
    { pattern: /\b(pro|professional)[-\s]grade\b/i, flag: 'Pro-grade claim — verify with professional benchmarks' },
    { pattern: /\b(studio[-\s]quality)\b/i, flag: 'Studio-quality claim — likely consumer-grade hardware' },
    { pattern: /\b(gaming)\b/i, flag: 'Gaming label — check actual GPU/refresh rate specs' },
    { pattern: /\b(flagship[-\s]level|flagship[-\s]grade)\b/i, flag: 'Flagship comparison — verify with actual flagship benchmarks' },
  ],

  // Material reality map
  MATERIAL_MAP: {
    'premium glass': { reality: 'Likely Gorilla Glass 3/5 (Corning)', confidence: 0.7 },
    'aircraft-grade aluminum': { reality: '6000-series aluminum alloy (standard in electronics)', confidence: 0.8 },
    'aerospace-grade aluminum': { reality: '6000 or 7000-series aluminum (common)', confidence: 0.75 },
    'titanium': { reality: 'May be titanium alloy or titanium-coated', confidence: 0.6 },
    'sapphire glass': { reality: 'Lab-grown sapphire crystal (synthetic)', confidence: 0.9 },
    'ceramic shield': { reality: 'Branded glass-ceramic composite (Corning)', confidence: 0.85 },
    'stainless steel': { reality: '304 or 316L grade stainless steel', confidence: 0.9 },
  },

  // Known benchmark suites for fairness evaluation
  BENCHMARK_SUITES: {
    smartphone: ['Geekbench', 'AnTuTu', '3DMark', 'GFXBench', 'PCMark'],
    laptop: ['Geekbench', 'Cinebench', '3DMark', 'PCMark', 'PassMark'],
    gpu: ['3DMark', 'Unigine', 'FurMark', 'GFXBench'],
  },

  // Engine versions for health check and audit
  ENGINE_VERSIONS: {
    claimClassificationEngine: '2.0.0',
    configConsistencyEngine: '2.0.0',
    specTranslationEngine: '2.0.0',
    realityMappingEngine: '2.0.0',
    realWorldSimulationEngine: '2.0.0',
    fairComparisonEngine: '2.0.0',
    tradeOffEngine: '2.0.0',
    materialRealityEngine: '2.0.0',
    featureOriginEngine: '2.0.0',
    realityPreviewEngine: '2.0.0',
    trustScoringEngine: '2.0.0',
  },

  // Scoring severity impact factors (deduction per finding)
  SEVERITY_IMPACT: {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 0,
  },

  // Dimensional scoring weights (must sum to 1.0)
  DIMENSION_WEIGHTS: {
    claim_verifiability: 0.15,
    config_consistency: 0.15,
    comparability_distortion: 0.10,
    metric_realism: 0.15,
    benchmark_fairness: 0.10,
    tradeoff_concealment: 0.10,
    feature_attribution: 0.10,
    material_inflation: 0.08,
    realworld_expectation_gap: 0.07,
  },

  // Expanded deterministic claim classification patterns
  CLAIM_CLASSIFICATION_PATTERNS: {
    NON_VERIFIABLE: [
      { pattern: /\b(best[-\s]in[-\s]class|industry[-\s]leading|world[-\s]class|market[-\s]leading)\b/i, reason: 'Superlative claim without verifiable benchmark or comparison scope' },
      { pattern: /\b(premium feel|premium quality|ultimate experience|unmatched performance)\b/i, reason: 'Subjective quality claim without measurable criteria' },
      { pattern: /\b(best|greatest|supreme|perfect|flawless)\b/i, reason: 'Absolute superlative without qualification' },
    ],
    CONDITIONAL: [
      { pattern: /\bup\s*to\b/i, reason: 'Upper bound stated without typical or minimum value' },
      { pattern: /\b(as fast as|up to|when using|in ideal conditions|under optimal|lab[-\s]tested)\b/i, reason: 'Performance claim qualified by specific conditions' },
      { pattern: /\b(depending on|varies by|may vary|subject to)\b/i, reason: 'Claim explicitly depends on unspecified variables' },
    ],
    EVIDENCE_BACKED: [
      { pattern: /\b(ip\d{2}\b|mil[-\s]std|iso\s*\d+|iec\s*\d+)\b/i, reason: 'References certified standard with verifiable test protocol' },
      { pattern: /\b(geekbench|antutu|3dmark|gfxbench|pcmark|cinebench|passmark)\b/i, reason: 'References standardized benchmark suite' },
      { pattern: /\b(\d{3,5})\s*mah\b/i, reason: 'Specific battery capacity with unit' },
      { pattern: /\b(\d{2,4})\s*hz\b/i, reason: 'Specific refresh rate with unit' },
    ],
    MARKETING_VAGUE: [
      { pattern: /\b(ultra[-\s]fast|hyper[-\s]fast|lightning[-\s]fast|blazing)\b/i, reason: 'Vague speed adjective without metric or baseline' },
      { pattern: /\b(next[-\s]gen|cutting[-\s]edge|future[-\s]proof|revolutionary)\b/i, reason: 'Generational claim without specific technical differentiator' },
      { pattern: /\b(pro[-\s]grade|professional[-\s]grade|flagship[-\s]level|flagship[-\s]grade)\b/i, reason: 'Tier claim without reference to specific standards or benchmarks' },
      { pattern: /\b(ai[-\s]powered|artificial intelligence|smart|intelligent)\b(?![^,\.]{0,30}\b(chip|processor|core|npu|tpu)\b)/i, reason: 'AI claim without dedicated AI hardware mentioned' },
    ],
    QUANTIFIABLE: [
      { pattern: /\b(\d+(?:\.\d+)?)\s*(gb|tb|mb)\b/i, reason: 'Explicit storage/memory capacity' },
      { pattern: /\b(\d+(?:\.\d+)?)\s*(mp|megapixel)\b/i, reason: 'Explicit camera resolution' },
      { pattern: /\b(\d+(?:\.\d+)?)\s*(w|watt)\b/i, reason: 'Explicit power metric' },
      { pattern: /\b(\d{3,5})\s*nits?\b/i, reason: 'Explicit brightness measurement' },
    ],
  },

  // Material inflation scoring map (0-10, 10 = completely generic marketed as exceptional)
  MATERIAL_INFLATION_MAP: {
    'aerospace-grade aluminum': { actual: '6000-series or 7000-series aluminum alloy', commonUsage: 'bicycle frames, consumer electronics, window frames', inflationScore: 6, explanation: 'All aluminum used in consumer electronics is an alloy; "aerospace-grade" is not a specific metallurgical standard' },
    'aircraft-grade aluminum': { actual: '6000-series aluminum alloy (e.g., 6061)', commonUsage: 'standard in electronics, ladders, furniture', inflationScore: 6, explanation: 'Same alloy family used across consumer electronics; no special aircraft certification' },
    'surgical-grade stainless steel': { actual: '316L stainless steel', commonUsage: 'kitchen sinks, watch cases, food processing equipment', inflationScore: 5, explanation: '316L is common corrosion-resistant steel; "surgical" branding adds no functional property in electronics' },
    'military-grade durability': { actual: 'passed subset of MIL-STD-810 tests', commonUsage: 'many consumer electronics, rugged smartphones', inflationScore: 8, explanation: 'MIL-STD-810 contains 29 test methods; manufacturers often test only a few, and lab conditions differ from real-world use' },
    'premium glass': { actual: 'Gorilla Glass 3/5/Victus or equivalent soda-lime glass', commonUsage: 'most smartphones and tablets', inflationScore: 4, explanation: 'Branded glass protection is standard across the industry; not a unique differentiator' },
    'ceramic shield': { actual: 'glass-ceramic composite (Corning)', commonUsage: 'Apple iPhones and select devices', inflationScore: 3, explanation: 'Proprietary Corning formulation; genuinely different from standard Gorilla Glass but still mass-produced' },
    'titanium': { actual: 'titanium alloy or titanium-coated frame', commonUsage: 'high-end watches, aerospace fasteners, dental implants', inflationScore: 5, explanation: 'Consumer electronics use Ti-6Al-4V alloy or thin coatings; not solid aerospace-grade titanium' },
    'sapphire glass': { actual: 'lab-grown synthetic sapphire crystal', commonUsage: 'watch crystals, camera lenses, some smartphone screens', inflationScore: 2, explanation: 'Synthetic sapphire is genuinely scratch-resistant but brittle; accurate claim with correct material' },
    'carbon fiber': { actual: 'carbon fiber reinforced polymer (CFRP) or decorative overlay', commonUsage: 'bicycles, automotive trim, laptop lids', inflationScore: 4, explanation: 'Often a thin decorative layer over plastic or metal; structural CFRP is rare in consumer electronics' },
  },

  // Feature origin classification map
  FEATURE_ORIGIN_MAP: {
    'pro-motion': { originType: 'HARDWARE_SPECIFIC', exclusivity: 'limited', marketedAsInnovation: true, explanation: 'Apple branding for 120Hz LTPO; requires dedicated display controller and panel hardware' },
    'dynamic amoled': { originType: 'HARDWARE_SPECIFIC', exclusivity: 'limited', marketedAsInnovation: true, explanation: 'Samsung panel technology; available to other manufacturers under different names' },
    'super retina xdr': { originType: 'HARDWARE_SPECIFIC', exclusivity: 'limited', marketedAsInnovation: true, explanation: 'Apple-calibrated OLED panel from Samsung/LG; hardware-specific but not exclusive technology' },
    'ceramic shield': { originType: 'HARDWARE_SPECIFIC', exclusivity: 'limited', marketedAsInnovation: true, explanation: 'Corning glass-ceramic exclusive to Apple (licensed); genuinely different material composition' },
    'dolby atmos': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Licensed audio technology from Dolby Laboratories; available to any paying manufacturer' },
    'hi-res audio': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Certification from Japan Audio Society; meets technical standards, not proprietary technology' },
    'wireless charging': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Qi standard by Wireless Power Consortium; universal industry standard' },
    'reverse wireless charging': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Implementation of Qi standard; software-controlled hardware feature' },
    'always-on display': { originType: 'OS_LEVEL', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Supported by Android and iOS; requires OLED hardware but primarily software feature' },
    'night mode': { originType: 'SOFTWARE_ONLY', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Computational photography technique; implementation varies but concept is universal' },
    'portrait mode': { originType: 'SOFTWARE_ONLY', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Depth estimation via software; available across all major platforms' },
    ' cinematic mode': { originType: 'SOFTWARE_ONLY', exclusivity: 'limited', marketedAsInnovation: true, explanation: 'Rack-focus simulation via software; hardware-agnostic but Apple markets as unique' },
    'ai camera': { originType: 'SOFTWARE_ONLY', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Scene recognition and auto-filtering; standard across modern smartphone platforms' },
    '5g': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: '3GPP cellular standard; hardware modem requirement but universal technology' },
    'wifi 6': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'IEEE 802.11ax standard; certification-based, not proprietary' },
    'bluetooth 5': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Bluetooth SIG standard; universal across devices' },
    'nfc': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'ISO/IEC 14443/18092 standard; universal short-range communication' },
    'usb-c pd': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'USB-IF Power Delivery standard; open specification' },
    'quick charge': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Qualcomm proprietary but widely licensed; not exclusive' },
    'fast charging': { originType: 'NON_EXCLUSIVE', exclusivity: 'widespread', marketedAsInnovation: false, explanation: 'Marketing term for various charging protocols; no single standard' },
  },

  // Reality normalization map for misleading metrics
  REALITY_NORMALIZATION_MAP: {
    '1-inch sensor': { normalized: '13.2 x 8.8mm (type-1, 16mm "inch")', actualUnit: 'mm', explanation: 'Camera sensor "inch" is historical vidicon tube diameter, not 25.4mm. Type-1 is ~16mm diagonal.' },
    '1.5k display': { normalized: '~2712 x 1220 or 2800 x 1260 (varies by OEM)', actualUnit: 'pixels', explanation: '"1.5K" is a marketing term between FHD+ and QHD; no standard resolution.' },
    '200mp camera': { normalized: '12.5MP (16-to-1 binning) or 50MP (4-to-1)', actualUnit: 'MP', explanation: '200MP sensors bin pixels for light sensitivity; full resolution loses HDR and night mode.' },
    '108mp camera': { normalized: '12MP (9-to-1 binning) or 27MP (4-to-1)', actualUnit: 'MP', explanation: '108MP sensors typically output 12MP via nonapixel binning for better low-light.' },
    '100x zoom': { normalized: '3x-10x optical + digital upscaling', actualUnit: 'x', explanation: 'Space zoom / hybrid zoom combines optical and digital; quality degrades significantly beyond optical limit.' },
    '10000mah power bank': { normalized: '~6400-7000mAh effective (at 5V after conversion)', actualUnit: 'mAh', explanation: 'Power bank capacity is at cell voltage (3.7V); 5V output after conversion and ~85% efficiency reduces effective capacity.' },
    'motion rate 240': { normalized: '60Hz native panel with motion interpolation', actualUnit: 'Hz', explanation: 'TV motion rate multiplies native refresh by scanning/interpolation factor; not true 240Hz panel.' },
    'motion rate 120': { normalized: '60Hz native panel with backlight scanning', actualUnit: 'Hz', explanation: 'Backlight scanning or black frame insertion creates perceived smoothness without true 120Hz input.' },
    '480hz touch sampling': { normalized: '480Hz touch polling (not display refresh)', actualUnit: 'Hz', explanation: 'Touch sampling rate measures digitizer responsiveness; unrelated to display refresh rate.' },
  },

  // Trade-off inference rules (deterministic engineering heuristics)
  TRADE_OFF_RULES: [
    {
      id: 'high_refresh_battery',
      condition: (text, specs) => /\b(120|144|165|240)\s*hz\b/i.test(text) && specs.battery && parseInt(specs.battery) < 4500,
      claimedBenefit: 'High refresh rate display (120Hz+)',
      hiddenTradeoff: 'Significantly increased power consumption',
      affectedMetric: 'battery',
      severity: 'medium',
      explanation: 'High refresh rate panels consume 15-25% more power at full refresh. Adaptive refresh can mitigate but not eliminate the penalty.',
      engineeringBasis: 'Display driver IC power scales with refresh rate; OLED ABL further reduces full-screen brightness at high refresh.'
    },
    {
      id: 'slim_thermal',
      condition: (text, specs) => /\b(slim|thin|ultra[-\s]thin)\b/i.test(text) && /\b(snapdragon\s*8|a1[789]|dimensity\s*9)/i.test(text),
      claimedBenefit: 'Slim/compact flagship design',
      hiddenTradeoff: 'Thermal throttling under sustained load',
      affectedMetric: 'thermal',
      severity: 'high',
      explanation: 'High-performance SoCs generate 5-8W under load. Sub-8mm chassis lacks sufficient thermal mass and surface area for sustained dissipation.',
      engineeringBasis: 'Thermal resistance R_th = thickness / (k * A). Reducing thickness increases R_th, raising junction temperature.'
    },
    {
      id: 'bright_oled_abl',
      condition: (text, specs) => /\b(2000|3000|4000)\s*nits?\b/i.test(text),
      claimedBenefit: 'Ultra-high peak brightness (2000nits+)',
      hiddenTradeoff: 'Full-screen brightness drops to 30-50% of peak due to ABL',
      affectedMetric: 'battery',
      severity: 'medium',
      explanation: 'OLED Automatic Brightness Limiter (ABL) reduces power to prevent panel degradation. Small windows can reach peak; full-screen content cannot.',
      engineeringBasis: 'OLED organic compounds degrade faster at high current density; ABL limits current per subpixel proportionally to lit area.'
    },
    {
      id: 'glass_back_repair',
      condition: (text, specs) => /\b(glass\s*back|all[-\s]glass|ceramic\s*back)\b/i.test(text),
      claimedBenefit: 'Premium glass/ceramic back panel',
      hiddenTradeoff: 'Higher repair cost and fragility compared to plastic/metal',
      affectedMetric: 'repairability',
      severity: 'medium',
      explanation: 'Glass backs enable wireless charging aesthetics but shatter from drops. Replacement requires full back panel swap, often >$200.',
      engineeringBasis: 'Glass fracture toughness K_IC ~0.7 MPa·m^0.5 vs polycarbonate ~2.5 MPa·m^0.5.'
    },
    {
      id: 'fast_charge_degradation',
      condition: (text, specs) => /\b(\d{2,3})\s*w\b/i.test(text) && parseInt((text.match(/(\d{2,3})\s*w/) || [0,0])[1]) >= 45,
      claimedBenefit: 'Ultra-fast charging (45W+)',
      hiddenTradeoff: 'Accelerated battery capacity degradation over time',
      affectedMetric: 'battery',
      severity: 'medium',
      explanation: 'Lithium-ion cells charged at >1C rate experience accelerated SEI layer growth. 45W+ on typical 4500mAh cell = ~1C+ charging.',
      engineeringBasis: 'Arrhenius equation: reaction rate doubles per 10°C rise. Fast charging raises cell temperature 5-15°C above slow charging.'
    },
    {
      id: 'no_headphone_jack',
      condition: (text, specs) => !/\b(headphone\s*jack|3\.5mm)\b/i.test(text) && /\b(smartphone|phone)\b/i.test(text),
      claimedBenefit: 'Slimmer design / larger battery / waterproofing',
      hiddenTradeoff: 'Requires wireless headphones or USB-C adapter (often sold separately)',
      affectedMetric: 'cost',
      severity: 'low',
      explanation: 'Removal of 3.5mm jack shifts audio cost to consumer. Wired audio latency (<10ms) cannot be matched by Bluetooth (~40-200ms).',
      engineeringBasis: '3.5mm jack occupies ~3.5mm vertical space; removal allows thinner design or larger battery.'
    },
    {
      id: 'water_resistance_repair',
      condition: (text, specs) => /\b(ip6[7-8]|water[-\s]resistant|waterproof)\b/i.test(text),
      claimedBenefit: 'Water and dust resistance',
      hiddenTradeoff: 'Reduced repairability due to adhesives and sealed components',
      affectedMetric: 'repairability',
      severity: 'medium',
      explanation: 'IP67/68 requires adhesive bonding at every seam. Opening device breaks seal; re-assembly requires new gaskets and often professional service.',
      engineeringBasis: 'Elastomer gaskets compress set over time; once deformed, they do not return to original sealing geometry.'
    },
    {
      id: 'high_mp_low_light',
      condition: (text, specs) => /\b(108|200)\s*mp\b/i.test(text) && !/\b(sensor\s*size|\d\/\d+\.?\d*\s*inch)\b/i.test(text),
      claimedBenefit: 'Extremely high resolution camera (108MP/200MP)',
      hiddenTradeoff: 'Worse low-light performance if sensor size is not proportionally larger',
      affectedMetric: 'durability',
      severity: 'medium',
      explanation: 'Pixel size shrinks as megapixels increase on same sensor area. Smaller pixels capture less photons, reducing SNR in low light.',
      engineeringBasis: 'SNR ∝ sqrt(pixel_area). Halving pixel linear dimension reduces area to 1/4, reducing SNR by ~6dB (factor of 2).'
    },
  ],

  // Cache TTLs
  CACHE: {
    ANALYSIS_TTL: 24 * 60 * 60 * 1000, // 24 hours
    REDDIT_TTL: 6 * 60 * 60 * 1000,    // 6 hours
    MAX_CACHE_SIZE: 1000,
  },

  // API rate limits
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60,
  }
};
