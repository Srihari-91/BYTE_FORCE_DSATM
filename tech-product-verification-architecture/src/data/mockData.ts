export const mockProduct = {
  name: "ProVision X12 Ultra Camera",
  brand: "TechVision",
  price: "$1,299",
  rating: 4.6,
  reviewCount: 3842,
  image: "📷",
  category: "Smartphone Camera",
  source: "amazon.com",
  fingerprint: "tv-x12-ultra-abc123f",
  extractionConfidence: 0.91,
};

export const truthScore = 58;

export const claimsData = [
  {
    id: 1,
    claim: "200MP Revolutionary Camera",
    category: "Camera",
    status: "misleading",
    confidence: 0.94,
    explanation:
      "Uses pixel-binning to produce 200MP images, actual native resolution is 50MP. Effective detail capture is comparable to 64MP sensors without binning.",
    marketingText: "200MP Ultra Resolution Camera",
    realityText: "50MP native sensor with 4-in-1 pixel binning",
    severity: "high",
  },
  {
    id: 2,
    claim: "All-Day Battery Life",
    category: "Battery",
    status: "contradicted",
    confidence: 0.88,
    explanation:
      "Claims 24-hour battery life tested under controlled lab conditions at 50% brightness. Real-world usage with 5G and GPS shows 11-14 hours.",
    marketingText: "All-Day 24-Hour Battery",
    realityText: "11-14 hours real-world with 5G active",
    severity: "high",
  },
  {
    id: 3,
    claim: "Titanium Build Quality",
    category: "Materials",
    status: "misleading",
    confidence: 0.82,
    explanation:
      "Frame uses titanium-coated aluminum alloy, not solid titanium. The coating is approximately 0.2mm thick. Full titanium would add ~$200 to production cost.",
    marketingText: "Premium Titanium Construction",
    realityText: "Titanium-coated aluminum frame (0.2mm coating)",
    severity: "medium",
  },
  {
    id: 4,
    claim: "8K Video Recording",
    category: "Video",
    status: "verified",
    confidence: 0.91,
    explanation:
      "Genuine 8K/24fps recording capability confirmed. Note: 8K mode limited to 5 minutes before thermal throttling. 4K/60fps is more reliable for extended use.",
    marketingText: "8K Video Recording",
    realityText: "8K/24fps (5 min limit), 4K/60fps recommended",
    severity: "low",
  },
  {
    id: 5,
    claim: "Wi-Fi 7 Ultra-Fast Connectivity",
    category: "Network",
    status: "verified",
    confidence: 0.96,
    explanation:
      "Wi-Fi 7 (802.11be) confirmed with theoretical max 5.8Gbps. Real-world speeds depend on router compatibility. Most users see 800Mbps–1.2Gbps improvement.",
    marketingText: "Wi-Fi 7 Next-Gen Connectivity",
    realityText: "Wi-Fi 7 confirmed, ~1Gbps real-world",
    severity: "low",
  },
  {
    id: 6,
    claim: "AI-Powered Night Photography",
    category: "Camera",
    status: "misleading",
    confidence: 0.79,
    explanation:
      "AI processing is real but heavily relies on multi-frame stacking (12–24 frames). Results vary significantly; performs poorly in extreme low-light vs competitors.",
    marketingText: "Revolutionary AI Night Vision",
    realityText: "Multi-frame stacking, weaker than competition",
    severity: "medium",
  },
];

export const redditSignals = {
  totalPosts: 847,
  relevantPosts: 312,
  timeRange: "Last 6 months",
  overallSentiment: 0.52,
  issues: [
    { topic: "Battery Drain", count: 127, sentiment: -0.71, severity: "high" },
    { topic: "Heating Issues", count: 94, sentiment: -0.68, severity: "high" },
    { topic: "Camera Overhype", count: 78, sentiment: -0.59, severity: "medium" },
    { topic: "Build Quality", count: 52, sentiment: -0.44, severity: "medium" },
    { topic: "Display Quality", count: 38, sentiment: 0.61, severity: "positive" },
    { topic: "5G Performance", count: 31, sentiment: 0.55, severity: "positive" },
  ],
  contradictions: [
    {
      claim: "All-Day Battery",
      evidence: "r/Smartphones: 'Mine barely lasts 10 hours with moderate use'",
      posts: 127,
      confidence: 0.88,
    },
    {
      claim: "Cool Under Load",
      evidence: "r/TechVision: 'Gets uncomfortably hot during 8K recording'",
      posts: 94,
      confidence: 0.81,
    },
    {
      claim: "200MP clarity",
      evidence: "r/Photography: 'Pixel-binned shots lose detail vs Sony 64MP'",
      posts: 78,
      confidence: 0.75,
    },
  ],
  subreddits: ["r/Smartphones", "r/TechVision", "r/Photography", "r/MobilePhotography", "r/Android"],
};

export const specTranslations = [
  {
    technical: "Octa-core 3.2GHz Cortex-X4",
    plain: "Top-tier processor, handles all tasks smoothly. Similar performance to last year's flagship chips.",
    impact: "positive",
  },
  {
    technical: "1/1.3\" sensor size",
    plain: "Larger than average sensor — captures more light. Not the largest available (some competitors use 1\" sensors).",
    impact: "neutral",
  },
  {
    technical: "UFS 4.0 storage",
    plain: "Fast storage speeds — apps open quicker, photos save instantly. This is genuinely fast.",
    impact: "positive",
  },
  {
    technical: "5000mAh Silicon-Carbon battery",
    plain: "Modern battery chemistry — better than Li-ion but marketing overstates longevity benefits.",
    impact: "neutral",
  },
];

export const tradeoffs = [
  {
    feature: "200MP Mode",
    gain: "Ultra-detail in bright light",
    loss: "4x larger file sizes, slower processing, unusable in low light",
    rating: 3,
  },
  {
    feature: "8K Recording",
    gain: "Future-proof video quality",
    loss: "5-min limit, heavy battery drain, device heats up significantly",
    rating: 2,
  },
  {
    feature: "Slim 6.8mm Profile",
    gain: "Premium feel, lightweight",
    loss: "Smaller battery, no 3.5mm jack, weaker vibration motor",
    rating: 3,
  },
  {
    feature: "5G mmWave",
    gain: "Ultra-fast in supported areas",
    loss: "Worse battery, limited coverage, most users won't benefit",
    rating: 2,
  },
];

export const benchmarkData = [
  { name: "CPU Score", product: 87, competitor1: 91, competitor2: 83, max: 100 },
  { name: "GPU Score", product: 82, competitor1: 88, competitor2: 79, max: 100 },
  { name: "Camera IQ", product: 74, competitor1: 89, competitor2: 81, max: 100 },
  { name: "Battery Life", product: 61, competitor1: 78, competitor2: 71, max: 100 },
  { name: "Display", product: 88, competitor1: 85, competitor2: 90, max: 100 },
  { name: "Build Quality", product: 71, competitor1: 82, competitor2: 76, max: 100 },
];

export const pipelineStages = [
  { id: 1, name: "Product Detection", status: "complete", time: "12ms", icon: "🔍" },
  { id: 2, name: "Data Extraction", status: "complete", time: "89ms", icon: "⚙️" },
  { id: 3, name: "Normalization", status: "complete", time: "23ms", icon: "📐" },
  { id: 4, name: "Fingerprinting", status: "complete", time: "8ms", icon: "🔑" },
  { id: 5, name: "Claim Extraction", status: "complete", time: "340ms", icon: "🧠" },
  { id: 6, name: "NLP Classification", status: "complete", time: "210ms", icon: "🏷️" },
  { id: 7, name: "Spec Translation", status: "complete", time: "95ms", icon: "📖" },
  { id: 8, name: "Reality Mapping", status: "complete", time: "178ms", icon: "🗺️" },
  { id: 9, name: "Reddit Intelligence", status: "complete", time: "1240ms", icon: "📡" },
  { id: 10, name: "Score Fusion", status: "complete", time: "14ms", icon: "⚖️" },
  { id: 11, name: "Response Building", status: "complete", time: "7ms", icon: "📦" },
];

export const systemArchitecture = [
  {
    layer: "Extension Layer",
    color: "blue",
    components: ["Product Detector", "Page Observer", "Data Extractor", "Normalizer", "Fingerprint Engine"],
  },
  {
    layer: "Analysis Engine",
    color: "purple",
    components: [
      "Claim Extractor (LLM)",
      "Claim Classifier",
      "Config Checker",
      "Spec Translator",
      "Reality Mapper",
      "Performance Normalizer",
      "Benchmark Engine",
      "Trade-off Analyzer",
      "Material Tagger",
      "Camera Analyzer",
    ],
  },
  {
    layer: "Intelligence Layer",
    color: "orange",
    components: ["Reddit Client", "Signal Filter", "Issue Extractor", "Claim Matcher"],
  },
  {
    layer: "Fusion & Output",
    color: "green",
    components: ["Score Fusion Engine", "Response Builder", "Overlay Renderer"],
  },
];

// ============================================================
// Premium Visual Intelligence Mock Data
// ============================================================

export const trustDecomposition = [
  { dimension: "Claim Verifiability", score: 82, weight: 0.15 },
  { dimension: "Config Honesty", score: 74, weight: 0.12 },
  { dimension: "Comparability", score: 60, weight: 0.10 },
  { dimension: "Metric Realism", score: 55, weight: 0.15 },
  { dimension: "Benchmark Fairness", score: 78, weight: 0.10 },
  { dimension: "Trade-off Concealment", score: 45, weight: 0.10 },
  { dimension: "Feature Honesty", score: 70, weight: 0.10 },
  { dimension: "Material Inflation", score: 65, weight: 0.08 },
  { dimension: "Reality Gap", score: 51, weight: 0.10 },
];

export const claimRiskMatrix = {
  misleading: [
    { claim: "200MP Revolutionary Camera", explanation: "Uses pixel-binning to produce 200MP images, actual native resolution is 50MP.", severity: "high" },
    { claim: "All-Day Battery Life", explanation: "Claims 24-hour battery life under lab conditions. Real-world shows 11-14 hours.", severity: "high" },
  ],
  conditional: [
    { claim: "Titanium Build Quality", explanation: "Titanium-coated aluminum alloy, not solid titanium. Coating is ~0.2mm thick.", severity: "medium" },
    { claim: "AI-Powered Night Photography", explanation: "AI processing uses multi-frame stacking, performs poorly in extreme low-light.", severity: "medium" },
  ],
  non_verifiable: [
    { claim: "Pro-Grade Image Processing", explanation: "No clear definition of 'pro-grade' — subjective marketing term.", severity: "low" },
  ],
  safe: [
    { claim: "8K Video Recording", explanation: "Genuine 8K/24fps recording capability confirmed.", severity: "low" },
    { claim: "Wi-Fi 7 Ultra-Fast Connectivity", explanation: "Wi-Fi 7 (802.11be) confirmed with theoretical max 5.8Gbps.", severity: "low" },
  ],
};

export const realitySnapshot = {
  what_is_real: [
    "8K/24fps video recording capability confirmed",
    "Wi-Fi 7 (802.11be) connectivity verified",
    "Octa-core 3.2GHz Cortex-X4 processor in spec sheet",
  ],
  what_is_inflated: [
    "'200MP' camera — native resolution is 50MP with pixel binning",
    "'Titanium' build — actually titanium-coated aluminum",
  ],
  what_is_misleading: [
    "'All-Day Battery' — 24-hour claim is under ideal lab conditions, real-world is significantly less",
  ],
  what_actually_matters: [
    "Camera sensor size (1/1.3\") more important than megapixel count",
    "Real-world battery life depends heavily on 5G/GPS usage patterns",
  ],
};

export const evidenceSummary = {
  total_findings: 18,
  critical: 2,
  high: 4,
  medium: 5,
  low: 4,
  info: 3,
};

export const tradeoffData = [
  { claimed_benefit: "Ultra-high resolution photography (200MP)", hidden_tradeoff: "Reduced low-light performance — smaller pixels capture fewer photons", affected_metric: "Low Light", severity: "high" },
  { claimed_benefit: "Slim 6.8mm profile design", hidden_tradeoff: "Smaller battery capacity and no 3.5mm headphone jack", affected_metric: "Battery", severity: "medium" },
  { claimed_benefit: "8K video recording capability", hidden_tradeoff: "5-minute thermal limit before throttling, heavy battery drain", affected_metric: "Thermal", severity: "medium" },
];

export const recommendationData = {
  action: "cautious",
  label: "Proceed with Caution",
  detail: "Mixed signals. Several claims lack clear evidence or are phrased vaguely. Camera megapixel claim is particularly misleading.",
  alternatives: "Compare with alternative products with more transparent specifications, such as Sony or Google Pixel devices.",
  evidence_count: 18,
};

export const comparisonData = {
  industryAvg: 62,
  category: "smartphone",
  price: 1299,
  score: 58,
  highCount: 2,
  medCount: 2,
};
