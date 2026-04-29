// Camera Reality Engine
// Evaluates camera marketing claims against real-world photography constraints
// Checks megapixel vs sensor size, "AI camera" reality, and more

/**
 * Evaluate camera claims for reality
 * @param {string} description - Product description
 * @param {Object} specs - Product specs
 * @returns {Array} Camera reality insights
 */
export function analyzeCameraReality(description, specs = {}) {
  const insights = [];
  const text = (description || '').toLowerCase();
  const specsText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' ').toLowerCase();
  const allText = text + ' ' + specsText;

  // === AI Camera Reality ===
  if (/\b(ai[-\s]camera|intelligent\s*camera|smart\s*camera)\b/i.test(allText)) {
    insights.push({
      type: 'camera',
      text: '"AI Camera" typically means scene recognition and automatic filter/processing adjustments. This is software-based image processing, not true AI. Most modern smartphones include this — it is not a unique feature.',
      category: 'CAMERA',
      confidence: 0.85
    });
  }

  // === Megapixel Reality ===
  const mpMatch = allText.match(/(\d+)\s*(mp|megapixel)/i);
  if (mpMatch) {
    const mp = parseInt(mpMatch[1]);
    if (mp >= 48) {
      let insight = `${mp}MP camera uses pixel-binning (combining multiple pixels into one) to produce lower-resolution final images (typically 12-16MP). `;
      
      if (mp >= 108) {
        insight += 'The 108MP/200MP figure is primarily a marketing number. Real-world image quality depends more on sensor size, aperture, and processing than megapixel count.';
      } else if (mp >= 48) {
        insight += 'At 48-64MP, pixel-binning produces effective 12-16MP images with better light sensitivity. Full resolution mode typically loses HDR and night mode capabilities.';
      }

      insights.push({
        type: 'camera',
        text: insight,
        category: 'CAMERA',
        confidence: 0.9
      });
    }
  }

  // === Multi-lens Reality ===
  const lensMentions = allText.match(/\b(macro|depth|monochrome|tof|ultra[-\s]wide|telephoto|periscope)\b/gi);
  if (lensMentions) {
    const uniqueLenses = [...new Set(lensMentions.map(l => l.toLowerCase()))];

    // Check for low-utility lenses
    if (uniqueLenses.includes('macro') && uniqueLenses.includes('depth')) {
      insights.push({
        type: 'camera',
        text: 'Macro and depth sensors are often low-resolution (2-5MP) auxiliary cameras with limited real-world utility. Many manufacturers include these to increase the "camera count" for marketing.',
        category: 'CAMERA',
        confidence: 0.8
      });
    }

    // Separate useful from filler lenses
    const usefulLenses = uniqueLenses.filter(l => 
      ['ultra-wide', 'telephoto', 'periscope'].includes(l)
    );
    const fillerLenses = uniqueLenses.filter(l => 
      ['macro', 'depth', 'monochrome'].includes(l)
    );

    if (fillerLenses.length >= 2 && usefulLenses.length <= 1) {
      insights.push({
        type: 'camera',
        text: `Camera system emphasizes quantity (${uniqueLenses.length} lenses) over quality. ${fillerLenses.length} of these are low-resolution auxiliary sensors with limited practical use. Only ${usefulLenses.length} primary functional lens(es).`,
        category: 'CAMERA',
        confidence: 0.75
      });
    }
  }

  // === Aperture Reality ===
  const apertureMatch = allText.match(/f\/(\d+\.?\d*)/i);
  if (apertureMatch) {
    const aperture = parseFloat(apertureMatch[1]);
    if (aperture <= 1.8) {
      insights.push({
        type: 'camera',
        text: `f/${aperture} aperture is good for low-light photography, allowing more light to reach the sensor. This is more impactful for image quality than megapixel count.`,
        category: 'CAMERA',
        confidence: 0.9
      });
    }
  }

  // === Sensor Size Reality ===
  const sensorMatch = allText.match(/(\d+\/\d+\.?\d*|\d+\.?\d*)["\s]*\s*(inch)?\s*(sensor)/i);
  if (sensorMatch) {
    insights.push({
      type: 'camera',
      text: `Larger sensor size (${sensorMatch[0]}) captures more light, improving low-light performance and dynamic range. A larger sensor with fewer megapixels often outperforms a smaller sensor with more megapixels.`,
      category: 'CAMERA',
      confidence: 0.9
    });
  } else if (mpMatch && parseInt(mpMatch[1]) >= 48) {
    insights.push({
      type: 'camera',
      text: 'Sensor size not specified. With high megapixel counts, sensor size is critical — a small sensor with 108MP will produce worse images than a larger sensor with 12MP, especially in low light.',
      category: 'CAMERA',
      confidence: 0.85
    });
  }

  // === OIS Reality ===
  if (/\b(ois|optical\s*image\s*stabilization|optical\s*stabilization)\b/i.test(allText)) {
    insights.push({
      type: 'camera',
      text: 'Optical Image Stabilization (OIS) physically moves the lens or sensor to compensate for hand shake. This is more effective than Electronic Image Stabilization (EIS), especially for photos and low-light video.',
      category: 'CAMERA',
      confidence: 0.9
    });
  } else if (/\b(eis|electronic\s*stabilization)\b/i.test(allText)) {
    insights.push({
      type: 'camera',
      text: 'Electronic Image Stabilization (EIS) crops and shifts the video frame to reduce shake. Less effective than OIS and can introduce artifacts. Better than no stabilization, but not as good as optical.',
      category: 'CAMERA',
      confidence: 0.85
    });
  }

  // === Video Capability Reality ===
  if (/\b(8k|4k)\s*(video|recording)\b/i.test(allText)) {
    const has8k = /\b8k\b/i.test(allText);
    if (has8k) {
      insights.push({
        type: 'camera',
        text: '8K video recording sounds impressive but: (1) 8K displays are rare, (2) file sizes are enormous (~600MB/min), (3) often limited to 24/30fps, (4) may have recording time limits due to overheating. 4K/60fps is more practical for most users.',
        category: 'CAMERA',
        confidence: 0.85
      });
    }
  }

  // === Night Mode Reality ===
  if (/\b(night\s*mode|nightography|low[-\s]light)\b/i.test(allText)) {
    insights.push({
      type: 'camera',
      text: '"Night mode" uses multi-frame capture and computational photography to brighten dark scenes. Results vary significantly by implementation — check real-world reviews rather than marketing samples.',
      category: 'CAMERA',
      confidence: 0.8
    });
  }

  // === Portrait Mode Reality ===
  if (/\b(portrait\s*mode|bokeh|depth\s*effect)\b/i.test(allText)) {
    insights.push({
      type: 'camera',
      text: 'Portrait mode bokeh (background blur) is simulated through software — not optical. Edge detection can fail with complex subjects (hair, fences, glass). Results vary by lighting and subject.',
      category: 'CAMERA',
      confidence: 0.85
    });
  }

  // Missing key camera information
  const hasAperture = /f\/\d/i.test(allText);
  const hasSensorSize = /sensor.*size|inch.*sensor/i.test(allText);
  const hasOIS = /ois|optical\s*stabil/i.test(allText);

  if (!hasAperture && !hasSensorSize && (text.includes('camera') || specsText.includes('camera'))) {
    insights.push({
      type: 'camera',
      text: 'Key camera specifications missing: aperture (f/stop) and sensor size. Without these, image quality cannot be objectively assessed regardless of megapixel count.',
      category: 'CAMERA',
      confidence: 0.8
    });
  }

  return insights;
}
