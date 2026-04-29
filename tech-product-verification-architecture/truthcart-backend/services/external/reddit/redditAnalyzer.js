// Reddit Post Analyzer
// Extracts common issues, complaints, and praise patterns from Reddit posts

import { splitSentences } from '../../nlp/tokenizer.js';

/**
 * Analyze filtered Reddit posts to extract issues and signals
 * @param {Array} posts - Filtered relevant Reddit posts
 * @returns {{ issues: Object, complaints: Array, praises: Array }}
 */
export function analyzeRedditPosts(posts) {
  if (!posts || posts.length === 0) {
    return { issues: {}, complaints: [], praises: [] };
  }

  const issues = {};
  const complaints = [];
  const praises = [];

  // Issue detection patterns
  const issuePatterns = [
    { pattern: /\b(battery|battery life|battery drain|charging)\b/i, category: 'battery' },
    { pattern: /\b(heat|overheat|thermal|throttl|hot)\b/i, category: 'heating' },
    { pattern: /\b(camera|photo|picture|video|megapixel|low.?light)\b/i, category: 'camera' },
    { pattern: /\b(display|screen|brightness|refresh|oled|burn.?in)\b/i, category: 'display' },
    { pattern: /\b(performance|lag|slow|stutter|freeze|crash)\b/i, category: 'performance' },
    { pattern: /\b(software|update|bug|bloatware|ads|skin)\b/i, category: 'software' },
    { pattern: /\b(build|quality|creak|flex|cheap|plastic|scratch)\b/i, category: 'build_quality' },
    { pattern: /\b(ram|memory|storage|16gb|8gb|128gb|256gb)\b/i, category: 'memory_storage' },
    { pattern: /\b(charging|charger|watt|fast.?charge|wireless.?charge)\b/i, category: 'charging' },
    { pattern: /\b(water|ip\d|splash|rain|pool|shower)\b/i, category: 'water_resistance' },
    { pattern: /\b(audio|sound|speaker|headphone|jack|bluetooth)\b/i, category: 'audio' },
    { pattern: /\b(warranty|repair|service|support|customer.?service)\b/i, category: 'warranty_support' },
    { pattern: /\b(weight|heavy|light|ergonomic|comfort|hold|grip)\b/i, category: 'weight_ergonomics' },
    { pattern: /\b(wifi|bluetooth|5g|connectivity|signal|reception|network)\b/i, category: 'connectivity' },
    { pattern: /\b(gaming|game|gpu|fps|frame.?rate|graphics)\b/i, category: 'gaming' },
  ];

  // Sentiment words
  const negativeWords = /\b(bad|terrible|awful|worst|disappointing|disappointed|issue|problem|bug|fail|broken|waste|regret|avoid|warning|psa|scam|misleading|false|exaggerated|overhyped)\b/i;
  const positiveWords = /\b(great|excellent|amazing|love|best|impressive|worth|recommend|happy|satisfied|perfect|solid|reliable)\b/i;

  for (const post of posts) {
    const text = (post.title + ' ' + post.selftext).toLowerCase();
    const sentences = splitSentences(text);

    // Track issues by category
    for (const { pattern, category } of issuePatterns) {
      if (pattern.test(text)) {
        // Check if sentiment is negative
        const relevantSentences = sentences.filter(s => pattern.test(s));
        const hasNegativeSentiment = relevantSentences.some(s => negativeWords.test(s));

        if (hasNegativeSentiment) {
          issues[category] = (issues[category] || 0) + 1;

          // Extract specific complaint
          const complaintSentence = relevantSentences.find(s => negativeWords.test(s)) || relevantSentences[0];
          if (complaintSentence && complaintSentence.length > 20) {
            complaints.push({
              category,
              text: complaintSentence.trim(),
              postTitle: post.title,
              postScore: post.score,
              source: post.subreddit
            });
          }
        }
      }
    }

    // Extract praises
    const positiveSentences = sentences.filter(s => positiveWords.test(s) && s.length > 30);
    for (const sentence of positiveSentences) {
      if (praises.length < 5) { // Limit praise entries
        praises.push({
          text: sentence.trim(),
          postTitle: post.title,
          postScore: post.score,
          source: post.subreddit
        });
      }
    }
  }

  return { issues, complaints, praises };
}
