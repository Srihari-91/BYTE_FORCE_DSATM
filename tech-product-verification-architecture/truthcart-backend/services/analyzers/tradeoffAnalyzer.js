// Trade-off Analyzer
// Detects hidden trade-offs in product design and marketing
// Examples: high refresh rate = battery drain, slim design = thermal throttling

import { CONSTANTS } from '../../config/constants.js';

/**
 * Detect hidden trade-offs in product claims and specs
 * @param {Object} product - Product data
 * @returns {Array} Trade-off insights
 */
export function detectTradeoffs(product) {
  const insights = [];

  if (!product) return insights;

  const description = (product.description || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  const allText = description + ' ' + title;
  const specs = product.specs || {};
  const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();

  // Trade-off 1: High refresh rate vs Battery life
  const hasHighRefresh = /\b(120|144|165|240)\s*hz/i.test(allText);
  const batteryMah = specsText.match(/(\d+)\s*mah/);
  if (hasHighRefresh && batteryMah) {
    const mah = parseInt(batteryMah[1]);
    if (mah < 4500) {
      insights.push({
        type: 'tradeoff',
        text: `High refresh rate (120Hz+) with ${mah}mAh battery — high refresh rate significantly increases power consumption. Expect noticeable battery drain when running at full refresh rate. Use adaptive refresh rate to mitigate.`,
        category: 'DISPLAY',
        confidence: 0.85
      });
    }
  }

  // Trade-off 2: Slim design vs Battery / Thermal
  const isSlim = /\b(slim|thin|ultra[-\s]thin|compact)\b/i.test(allText);
  const isSmall = specsText.match(/(\d+)\s*mah/) && parseInt(specsText.match(/(\d+)\s*mah/)[1]) < 4000;

  if (isSlim && isSmall) {
    insights.push({
      type: 'tradeoff',
      text: 'Slim design limits battery capacity. This device prioritizes portability over battery endurance — expect shorter battery life compared to thicker alternatives.',
      category: 'SIZE_WEIGHT',
      confidence: 0.8
    });
  }

  if (isSlim && /\b(high\s*performance|gaming|powerful|flagship)\b/i.test(allText)) {
    insights.push({
      type: 'tradeoff',
      text: 'High-performance hardware in a slim chassis may face thermal constraints. Sustained performance (gaming, video rendering) may be throttled to manage heat.',
      category: 'PERFORMANCE',
      confidence: 0.75
    });
  }

  // Trade-off 3: Large display vs Portability
  const screenSize = specsText.match(/(\d+\.?\d*)\s*(inch|inches|")\s*(display|screen)?/);
  if (screenSize) {
    const size = parseFloat(screenSize[1]);
    if (size >= 6.7) {
      insights.push({
        type: 'tradeoff',
        text: `${size}" display offers great media consumption but may be difficult to use one-handed and less pocketable. Consider ergonomics for daily use.`,
        category: 'SIZE_WEIGHT',
        confidence: 0.85
      });
    }
  }

  // Trade-off 4: High megapixel vs Low-light performance
  const hasHighMP = /\b(108|200|64|50)\s*(mp|megapixel)/i.test(allText);
  const sensorSize = specsText.match(/(\d+\/\d+\.?\d*|\d+\.?\d*)\s*inch.*sensor/i) || 
                      specsText.match(/sensor.*(\d+\/\d+\.?\d*)/i);
  
  if (hasHighMP && !sensorSize) {
    insights.push({
      type: 'tradeoff',
      text: 'High megapixel count without sensor size information. Small sensors with high megapixels can result in worse low-light performance due to smaller individual pixels. Check sensor size for real image quality.',
      category: 'CAMERA',
      confidence: 0.8
    });
  }

  // Trade-off 5: Large battery vs Weight
  if (batteryMah && parseInt(batteryMah[1]) >= 5000) {
    const weight = specsText.match(/(\d+)\s*(g|gram|gm)/);
    if (weight && parseInt(weight[1]) > 200) {
      insights.push({
        type: 'tradeoff',
        text: `Large ${parseInt(batteryMah[1])}mAh battery contributes to the device weight (${weight[1]}g). This is the trade-off for extended battery life — heavier device for longer usage.`,
        category: 'BATTERY',
        confidence: 0.9
      });
    }
  }

  // Trade-off 6: Fast charging vs Battery longevity
  const hasFastCharge = /\b(\d+)\s*w\s*(fast|quick|super|turbo|rapid)?\s*(charg)/i.test(allText);
  if (hasFastCharge) {
    const wattMatch = allText.match(/(\d+)\s*w/);
    const watts = wattMatch ? parseInt(wattMatch[1]) : 0;
    if (watts >= 45) {
      insights.push({
        type: 'tradeoff',
        text: `${watts}W fast charging generates more heat than standard charging. Over time, frequent fast charging may reduce battery capacity faster than slower charging methods.`,
        category: 'CHARGING',
        confidence: 0.75
      });
    }
  }

  // Trade-off 7: Water resistance vs Repairability
  const hasWaterResistance = /\b(ip\d{2}|water[-\s]resistant|waterproof)\b/i.test(allText);
  if (hasWaterResistance) {
    insights.push({
      type: 'tradeoff',
      text: 'Water-resistant design typically uses strong adhesives and seals, making repairs more difficult and expensive. The trade-off for water protection is reduced repairability.',
      category: 'DURABILITY',
      confidence: 0.8
    });
  }

  // Trade-off 8: Glass back vs Durability
  if (/\b(glass\s*back|glass\s*body|all[-\s]glass)\b/i.test(allText)) {
    insights.push({
      type: 'tradeoff',
      text: 'Glass back panels enable wireless charging and premium aesthetics but are significantly more fragile than metal or plastic. A case is recommended to prevent shattering from drops.',
      category: 'MATERIAL',
      confidence: 0.9
    });
  }

  // Trade-off 9: No headphone jack
  if (!/\b(headphone\s*jack|3\.5mm|audio\s*jack)\b/i.test(allText) && 
      (/\b(phone|smartphone)\b/i.test(allText) || product.category === 'smartphone')) {
    insights.push({
      type: 'tradeoff',
      text: 'No 3.5mm headphone jack mentioned — likely removed. This requires Bluetooth headphones or a USB-C/lightning adapter (often sold separately). Trade-off for thinner design or larger battery.',
      category: 'AUDIO',
      confidence: 0.7
    });
  }

  // Trade-off 10: No expandable storage
  if (!/\b(micro\s*sd|expandable|sd\s*card|memory\s*card)\b/i.test(allText) && 
      specsText.includes('storage')) {
    const storageMatch = specsText.match(/(\d+)\s*(gb|tb)\s*(storage|rom)/);
    if (storageMatch) {
      const storage = parseInt(storageMatch[1]);
      const unit = storageMatch[2].toLowerCase();
      const effectiveGB = unit === 'tb' ? storage * 1024 : storage;
      if (effectiveGB <= 128) {
        insights.push({
          type: 'tradeoff',
          text: `No expandable storage with only ${storage}${unit.toUpperCase()} built-in. You cannot add a microSD card — ensure this capacity meets your long-term needs.`,
          category: 'STORAGE',
          confidence: 0.75
        });
      }
    }
  }

  return insights;
}
