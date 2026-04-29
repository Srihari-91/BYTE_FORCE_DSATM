// Performance Normalizer
// Normalizes performance specs across brands for meaningful comparison
// Creates unified performance tiers from disparate specification formats

/**
 * Normalize performance metrics for cross-brand comparison
 * @param {string} description - Product description
 * @param {Object} specs - Product specs
 * @returns {Array} Normalized insights
 */
export function normalizePerformance(description, specs = {}) {
  const insights = [];
  const text = (description || '').toLowerCase();
  const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();
  const allText = text + ' ' + specsText;

  // === Processor Tier Classification ===
  const processorTier = classifyProcessorTier(allText);
  if (processorTier) {
    insights.push({
      type: 'performance',
      text: `Processor tier: ${processorTier.tier} — ${processorTier.description}`,
      category: 'PERFORMANCE',
      confidence: processorTier.confidence
    });
  }

  // === RAM Tier ===
  const ramMatch = specsText.match(/(\d+)\s*gb\s*(ram|memory)/);
  if (ramMatch) {
    const ram = parseInt(ramMatch[1]);
    let tier, desc;
    if (ram >= 16) { tier = 'Enthusiast'; desc = 'Suitable for professional workloads, heavy gaming, and heavy multitasking.'; }
    else if (ram >= 8) { tier = 'Mainstream'; desc = 'Good for most users including moderate gaming and multitasking.'; }
    else if (ram >= 4) { tier = 'Entry-level'; desc = 'Sufficient for basic tasks. May limit multitasking and future-proofing.'; }
    else { tier = 'Basic'; desc = 'Minimal RAM. Expect limitations in multitasking and demanding applications.'; }

    insights.push({
      type: 'performance',
      text: `RAM: ${ram}GB (${tier} tier) — ${desc}`,
      category: 'PERFORMANCE',
      confidence: 0.85
    });
  }

  // === Storage Tier ===
  const storageMatch = specsText.match(/(\d+)\s*(gb|tb)\s*(storage|rom|ssd|hdd)/);
  if (storageMatch) {
    const storage = parseInt(storageMatch[1]);
    const unit = storageMatch[2].toLowerCase();
    const effectiveGB = unit === 'tb' ? storage * 1024 : storage;
    let tier, desc;
    if (effectiveGB >= 512) { tier = 'High-capacity'; desc = 'Ample storage for large media libraries and extensive offline content.'; }
    else if (effectiveGB >= 256) { tier = 'Comfortable'; desc = 'Good storage for most users with room for apps, photos, and media.'; }
    else if (effectiveGB >= 128) { tier = 'Standard'; desc = 'Decent storage. Heavy media users may need cloud/external storage.'; }
    else { tier = 'Limited'; desc = 'Minimal storage. External/cloud storage and regular cleanup will likely be needed.'; }

    insights.push({
      type: 'storage',
      text: `Storage: ${storage}${unit.toUpperCase()} (${tier} tier) — ${desc}`,
      category: 'STORAGE',
      confidence: 0.85
    });
  }

  // === Resolution Standardization ===
  const resolution = detectResolution(allText);
  if (resolution) {
    insights.push({
      type: 'performance',
      text: `Display: ${resolution.label} (${resolution.pixels}) — ${resolution.context}`,
      category: 'DISPLAY',
      confidence: 0.9
    });
  }

  // === Battery Normalization ===
  const mahMatch = specsText.match(/(\d+)\s*mah/);
  if (mahMatch) {
    const mah = parseInt(mahMatch[1]);
    let tier, desc;
    if (mah >= 5000) { tier = 'Large'; desc = 'Excellent capacity — should provide 1.5-2 days of moderate use.'; }
    else if (mah >= 4000) { tier = 'Standard'; desc = 'Good capacity — typical full-day battery for moderate use.'; }
    else if (mah >= 3000) { tier = 'Below average'; desc = 'Moderate capacity — may need mid-day charging with active use.'; }
    else { tier = 'Small'; desc = 'Low capacity — expect to charge frequently with active use.'; }

    insights.push({
      type: 'performance',
      text: `Battery: ${mah}mAh (${tier} tier) — ${desc}`,
      category: 'BATTERY',
      confidence: 0.8
    });
  }

  return insights;
}

/**
 * Classify processor into tiers
 */
function classifyProcessorTier(text) {
  // Flagship tier
  if (/\b(snapdragon\s*8\s*gen\s*[34]|a1[789]\s*(pro|bionic)?|dimensity\s*9[3-9]\d\d|m[234]\s*(pro|max)?|ryzen\s*9|i9[-\s])\b/i.test(text)) {
    return { tier: 'Flagship', description: 'Top-tier performance for demanding tasks, gaming, and professional workloads.', confidence: 0.85 };
  }
  // High tier
  if (/\b(snapdragon\s*8\s*gen\s*[12]|snapdragon\s*888|a1[456]\s*(bionic)?|dimensity\s*8[2-9]\d\d|ryzen\s*7|i7[-\s])\b/i.test(text)) {
    return { tier: 'High-end', description: 'Excellent performance for most demanding tasks and gaming.', confidence: 0.85 };
  }
  // Mid tier
  if (/\b(snapdragon\s*7|dimensity\s*7[0-9]\d\d|a1[234]\s*(bionic)?|ryzen\s*5|i5[-\s])\b/i.test(text)) {
    return { tier: 'Mid-range', description: 'Good everyday performance. Capable of moderate gaming and multitasking.', confidence: 0.8 };
  }
  // Entry tier
  if (/\b(snapdragon\s*[46]|dimensity\s*[46]\d\d\d|helio\s*g|mediatek|ryzen\s*3|i3[-\s])\b/i.test(text)) {
    return { tier: 'Entry-level', description: 'Sufficient for basic tasks, web browsing, and light apps. Not for heavy gaming or professional work.', confidence: 0.8 };
  }

  return null;
}

/**
 * Detect and standardize display resolution
 */
function detectResolution(text) {
  if (/\b(8k|7680\s*[x×]\s*4320)\b/i.test(text)) {
    return { label: '8K UHD', pixels: '7680x4320', context: 'Extremely high resolution. Limited 8K content available. Future-proof but currently overkill for most users.' };
  }
  if (/\b(4k|3840\s*[x×]\s*2160|2160p)\b/i.test(text)) {
    return { label: '4K UHD', pixels: '3840x2160', context: 'Excellent sharpness. Noticeable improvement over 1080p on larger screens (55"+).' };
  }
  if (/\b(quad\s*hd\+?|qhd\+?|1440p|3200\s*[x×]\s*1440|2560\s*[x×]\s*1440)\b/i.test(text)) {
    return { label: 'QHD / 1440p', pixels: '~2560x1440', context: 'Great balance of sharpness and performance. Standard for flagship smartphones and gaming monitors.' };
  }
  if (/\b(full\s*hd\+?|fhd\+?|1080p|2400\s*[x×]\s*1080|1920\s*[x×]\s*1080)\b/i.test(text)) {
    return { label: 'FHD / 1080p', pixels: '1920x1080', context: 'Standard high-definition. Sharp enough for most use cases on screens up to 24".' };
  }
  if (/\b(hd\+?|720p|1600\s*[x×]\s*720|1280\s*[x×]\s*720)\b/i.test(text)) {
    return { label: 'HD / 720p', pixels: '1280x720', context: 'Basic HD resolution. Noticeably less sharp than FHD on larger screens.' };
  }

  return null;
}
