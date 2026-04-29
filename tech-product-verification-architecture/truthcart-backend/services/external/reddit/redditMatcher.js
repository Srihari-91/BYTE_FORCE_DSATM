// Reddit Claim Matcher
// Matches extracted Reddit issues against marketing claims to find contradictions

/**
 * Match Reddit findings against product marketing claims
 * @param {Array} claims - Extracted marketing claims
 * @param {Object} redditAnalysis - Results from redditAnalyzer
 * @returns {{ contradictions: Array, confidence: number }}
 */
export function matchClaimsToReddit(claims, redditAnalysis) {
  const contradictions = [];

  if (!claims || !redditAnalysis || !redditAnalysis.complaints) {
    return { contradictions: [], confidence: 0 };
  }

  const { complaints } = redditAnalysis;

  // Claim-to-issue mapping
  const claimIssueMap = {
    'BATTERY': ['battery', 'charging'],
    'CHARGING': ['charging', 'battery'],
    'PERFORMANCE': ['performance', 'heating', 'gaming'],
    'CAMERA': ['camera'],
    'DISPLAY': ['display'],
    'DURABILITY': ['build_quality', 'water_resistance'],
    'AUDIO': ['audio'],
    'SOFTWARE': ['software'],
    'MATERIAL': ['build_quality'],
    'CONNECTIVITY': ['connectivity'],
    'STORAGE': ['memory_storage'],
    'SIZE_WEIGHT': ['weight_ergonomics'],
    'WARRANTY': ['warranty_support'],
  };

  for (const claim of claims) {
    const claimText = (claim.text || '').toLowerCase();
    const claimType = claim.type || 'OTHER';
    const relevantIssueCategories = claimIssueMap[claimType] || [];

    // Find complaints in matching categories
    const matchingComplaints = complaints.filter(c => 
      relevantIssueCategories.includes(c.category) &&
      hasTextOverlap(claimText, c.text)
    );

    if (matchingComplaints.length > 0) {
      // Determine contradiction confidence
      const complaintConfidence = Math.min(
        0.95,
        0.5 + (matchingComplaints.length * 0.1)
      );

      contradictions.push({
        claim: claim.text,
        evidence: matchingComplaints[0].text,
        source: matchingComplaints[0].source,
        postTitle: matchingComplaints[0].postTitle,
        confidence: complaintConfidence,
        matchingComplaints: matchingComplaints.length
      });
    }
  }

  // Calculate overall Reddit confidence
  const redditConfidence = contradictions.length > 0
    ? Math.min(0.9, 0.4 + (contradictions.length * 0.1))
    : 0.3;

  return {
    contradictions,
    confidence: Math.round(redditConfidence * 100) / 100
  };
}

/**
 * Check if two text strings have meaningful overlap
 */
function hasTextOverlap(text1, text2) {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = text2.split(/\s+/).filter(w => w.length > 3);

  let overlap = 0;
  for (const word of words2) {
    if (words1.has(word)) overlap++;
  }

  return overlap >= 2;
}
