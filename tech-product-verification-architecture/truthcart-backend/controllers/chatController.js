// Chat Controller
// Handles POST /chat requests: answers questions about product analysis
// Uses intent detection + LLM for intelligent responses

import { logger } from '../utils/logger.js';
import { callLLM } from '../services/llmService.js';

/**
 * POST /chat handler
 */
export async function chatAboutProduct(req, res) {
  const requestStart = performance.now();

  try {
    const { question, analysis, product } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['question is required and must be a string']
      });
    }

    if (!analysis || !product) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['analysis and product context are required']
      });
    }

    // Detect intent and generate response
    const answer = await generateAnswer(question.trim(), analysis, product);
    const duration = Math.round(performance.now() - requestStart);

    logger.info(`Chat answered in ${duration}ms — Q: "${question.substring(0, 50)}..."`);

    res.json({
      answer,
      question,
      timestamp: new Date().toISOString(),
      response_time_ms: duration
    });

  } catch (err) {
    logger.error('Chat failed:', err.message);
    res.status(500).json({
      error: 'Chat processing failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Unable to process your question'
    });
  }
}

/**
 * Detect the primary intent from a user question
 * @param {string} q - Lowercased question
 * @returns {string} Intent key
 */
function detectIntent(q) {
  if (/score|truth|rating|trust.?score/i.test(q)) return 'score';
  if (/claim|claim|mislead|exaggerat|overstat|decept|fake|false/i.test(q)) return 'claims';
  if (/verdict|recommend|should.?i.?buy|worth.?it|buy.?this|purchase/i.test(q)) return 'verdict';
  if (/reddit|community|forum|user.?feedback|people.?say|discussion/i.test(q)) return 'reddit';
  return 'general';
}

/**
 * Generate an answer using intent detection + fallback LLM
 */
async function generateAnswer(question, analysis, product) {
  const q = question.toLowerCase();
  const intent = detectIntent(q);

  const score = analysis.truth_score || 0;
  const flags = analysis.flags || [];
  const productName = product.title || 'this product';

  // REDIRECT intent — do NOT call Reddit API
  if (intent === 'reddit') {
    return `**Opening Reddit discussions for ${productName}.**

To see what real users are saying, I'll redirect you to Reddit search results for this product. You'll find real reviews, complaints, and discussions from the community.`;
  }

  // SCORE intent — return truth_score
  if (intent === 'score') {
    const verdict = score >= 75 ? 'mostly reliable' : score >= 55 ? 'partially misleading' : 'heavily marketed with significant gaps';
    const breakdown = analysis.score_breakdown || [];
    let response = `The truth score for **${productName}** is **${score}/100** — rated as **${verdict}**.`;
    if (breakdown.length > 0) {
      const lowest = breakdown.reduce((a, b) => a.value < b.value ? a : b);
      response += `\n\nThe weakest area is **${lowest.label}** at ${lowest.value}/100.`;
    }
    return response;
  }

  // CLAIMS intent — return flagged_claims
  if (intent === 'claims') {
    if (flags.length === 0) {
      return `No misleading claims were detected for **${productName}**. The marketing appears honest.`;
    }
    const highFlags = flags.filter(f => f.severity === 'high');
    const medFlags = flags.filter(f => f.severity === 'medium');
    let response = `Found **${flags.length} flag${flags.length > 1 ? 's' : ''}** for ${productName}:\n\n`;
    if (highFlags.length > 0) {
      response += `**High severity (${highFlags.length}):**\n`;
      highFlags.forEach(f => { response += `\u2022 ${truncate(f.claim, 60)} — ${truncate(f.explanation, 80)}\n`; });
    }
    if (medFlags.length > 0) {
      response += `\n**Medium severity (${medFlags.length}):**\n`;
      medFlags.forEach(f => { response += `\u2022 ${truncate(f.claim, 60)} — ${truncate(f.explanation, 80)}\n`; });
    }
    return response;
  }

  // VERDICT intent — return recommendation
  if (intent === 'verdict') {
    if (score >= 75) return `Based on the truth score of **${score}/100**, ${productName} appears **reliable**. Marketing claims mostly match reality. You can buy with reasonable confidence.`;
    if (score >= 55) return `With a truth score of **${score}/100**, ${productName} has **some misleading claims**. I'd recommend checking the flagged items carefully before buying. Look at independent reviews to fill the gaps.`;
    return `With a truth score of **${score}/100**, ${productName} has **significant marketing exaggeration**. I would recommend against buying at full price without verifying claims independently. Consider alternatives with more honest marketing.`;
  }

  // GENERAL intent — use LLM
  try {
    const prompt = buildLLMPrompt(question, analysis, product);
    const raw = await callLLM(prompt, { maxRetries: 1 });
    // Clean potential markdown wrappers
    let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    // Try to extract text from JSON wrapper (LLM returns JSON due to prompt enforcement)
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.response) cleaned = parsed.response;
      else if (parsed.answer) cleaned = parsed.answer;
      else if (parsed.text) cleaned = parsed.text;
      else if (parsed.message) cleaned = parsed.message;
    } catch {}
    return cleaned;
  } catch (err) {
    logger.error('LLM chat fallback failed:', err.message);
    return generateGeneralResponse(q, analysis, product);
  }
}

/**
 * Build an LLM prompt from the analysis context
 */
function buildLLMPrompt(question, analysis, product) {
  const score = analysis.truth_score || 0;
  const flags = analysis.flags || [];
  const insights = analysis.insights || [];
  const breakdown = analysis.score_breakdown || [];

  return `You are TruthCart AI, a product truth verification assistant.

Product: ${product.title || 'Unknown'}
Brand: ${product.brand || 'Unknown'}
Price: ${product.currency || '$'}${product.price || 'Unknown'}
Category: ${product.category || 'general'}
Source: ${product.source || 'Unknown'}

Truth Score: ${score}/100
Verdict: ${analysis.verdict || 'N/A'}

Score Breakdown:\n${(breakdown || []).map(b => `- ${b.label}: ${b.value}/100`).join('\n') || 'N/A'}

Flags (${flags.length}):\n${(flags || []).slice(0, 5).map(f => `- [${f.severity}] ${f.claim}${f.explanation ? ': ' + f.explanation : ''}`).join('\n') || 'None detected'}

Key Insights:\n${(insights || []).slice(0, 3).map(i => `- ${i.text}`).join('\n') || 'N/A'}

User Question: ${question}

Answer the user's question in a helpful, conversational tone using the analysis data above. Be concise (2-4 sentences). Do NOT mention that you're an AI or that this is analysis data — just answer naturally.

Respond with a JSON object with a single key "response" containing your answer.`;
}

/**
 * Generate a general response when LLM is unavailable
 */
function generateGeneralResponse(q, analysis, product) {
  const score = analysis.truth_score || 0;
  const productName = product.title || 'this product';
  const flags = analysis.flags || [];

  if (q.length < 10) {
    return `Could you be more specific? I can answer questions about the truth score (**${score}/100**), claims, or whether to buy ${productName}.`;
  }

  let response = `Here's a summary for **${productName}**:\n\n`;
  response += `\u2022 Truth Score: **${score}/100**\n`;
  if (flags.length > 0) {
    response += `\u2022 ${flags.length} flag${flags.length > 1 ? 's' : ''} detected (${flags.filter(f => f.severity === 'high').length} high severity)\n`;
  }
  const breakdown = analysis.score_breakdown || [];
  if (breakdown.length > 0) {
    const lowest = breakdown.reduce((a, b) => a.value < b.value ? a : b);
    response += `\u2022 Weakest area: ${lowest.label} (${lowest.value}/100)\n`;
  }
  response += `\nAsk me about specific claims, the score breakdown, community feedback, or whether this product is worth buying.`;
  return response;
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}
