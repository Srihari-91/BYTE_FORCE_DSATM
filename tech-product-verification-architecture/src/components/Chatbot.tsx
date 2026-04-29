import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Shield,
  ChevronDown,
} from "lucide-react";
import { mockProduct, truthScore } from "../data/mockData";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Message {
  role: "user" | "bot";
  text: string;
}

interface AnalysisContext {
  truth_score: number;
  flags: Array<{ severity: string; claim: string; explanation?: string }>;
  insights: Array<{ text: string }>;
  score_breakdown: Array<{ label: string; value: number }>;
  reddit?: {
    contradictions?: Array<{ claim: string; evidence: string }>;
    issues?: Record<string, number>;
  };
  stats?: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = "http://localhost:3001";

const QUICK_CHIPS = [
  { label: "TRUTH SCORE", question: "What is the truth score?", color: "amber" },
  { label: "CLAIMS", question: "What claims are misleading?", color: "red" },
  { label: "SHOULD I BUY?", question: "Should I buy this product?", color: "emerald" },
  { label: "REDDIT", question: "What does Reddit say?", color: "orange" },
];

const FAB_VARIANTS = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  hover: { scale: 1.1 },
  tap: { scale: 0.92 },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
  exit: { opacity: 0, y: 24, scale: 0.95, transition: { duration: 0.18 } },
};

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";

  return (
    <div className="relative w-[42px] h-[42px] flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="21" cy="21" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
        />
      </svg>
      <span className="relative z-10 text-xs font-bold text-white">{score}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-fadeIn">
      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
        <Shield className="w-3.5 h-3.5" />
      </div>
      <div className="bg-[#1A2236] border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1.2s" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bubble                                                             */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  // Format markdown-style bold, newlines, bullet lists
  const formatted = msg.text
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2 ${isUser ? "justify-end" : "items-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3.5 h-3.5" />
        </div>
      )}

      <div
        className={`max-w-[82%] px-3.5 py-2.5 text-xs leading-relaxed break-words ${
          isUser
            ? "bg-[#2D3748] border border-[#3D4A5C] rounded-2xl rounded-tr-sm text-slate-200"
            : "bg-[#1A2236] border border-slate-700/60 rounded-2xl rounded-tl-sm text-slate-300"
        }`}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Chatbot Component                                             */
/* ------------------------------------------------------------------ */

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const score = truthScore;

  /* Build analysis context from mock data */
  const analysisContext: AnalysisContext = {
    truth_score: score,
    flags: [
      { severity: "high", claim: "200MP Revolutionary Camera", explanation: "Uses pixel-binning, actual native resolution is 50MP" },
      { severity: "high", claim: "All-Day Battery Life", explanation: "Real-world shows 11-14 hours, not 24" },
      { severity: "medium", claim: "Titanium Build Quality", explanation: "Titanium-coated aluminum, not solid titanium" },
      { severity: "medium", claim: "AI-Powered Night Photography", explanation: "Multi-frame stacking, weaker than competitors" },
    ],
    insights: [
      { text: "Pixel binning reduces effective resolution significantly — 200MP marketing is technically true but misleading" },
      { text: "Battery life varies dramatically between lab tests (24h) and real-world 5G usage (11-14h)" },
      { text: "Titanium coating on aluminum frame is a common cost-saving practice that masks as premium" },
    ],
    score_breakdown: [
      { label: "Claim Accuracy", value: 52 },
      { label: "Spec Transparency", value: 64 },
      { label: "Benchmark Fairness", value: 71 },
      { label: "Reddit Validation", value: 48 },
      { label: "Material Honesty", value: 61 },
    ],
    reddit: {
      contradictions: [
        { claim: "All-Day Battery", evidence: "r/Smartphones: 'Mine barely lasts 10 hours with moderate use'" },
        { claim: "Cool Under Load", evidence: "r/TechVision: 'Gets uncomfortably hot during 8K recording'" },
      ],
      issues: { "Battery Drain": 127, "Heating Issues": 94, "Camera Overhype": 78 },
    },
    stats: { claims_analyzed: 6, reddit_posts: 312, modules_run: 11 },
  };

  /* Auto-scroll to bottom */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /* Add welcome message on first open */
  useEffect(() => {
    if (isOpen && !hasOpenedBefore) {
      setHasOpenedBefore(true);
      const welcome = `I've analyzed **${mockProduct.name}**. Ask me anything about its truth score, claims, camera, battery, build quality, or community feedback.`;
      setMessages([{ role: "bot", text: welcome }]);
    }
  }, [isOpen, hasOpenedBefore]);

  /* Send message to backend */
  const sendMessage = async (question: string) => {
    if (!question.trim() || isSending) return;

    const userMsg: Message = { role: "user", text: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      // Try the real backend
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          analysis: analysisContext,
          product: {
            title: mockProduct.name,
            price: mockProduct.price,
            currency: "$",
          },
        }),
      });

      if (!res.ok) throw new Error("Backend unavailable");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch {
      // Fallback local response
      const answer = generateLocalResponse(question.trim(), analysisContext);
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } finally {
      setIsSending(false);
    }
  };

  /* Quick chip click */
  const handleChipClick = (question: string) => {
    sendMessage(question);
  };

  /* Form submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const scoreVerdict = score >= 75 ? "Reliable" : score >= 50 ? "Mixed" : "Marketing Heavy";
  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-fab"
            variants={FAB_VARIANTS}
            initial="hidden"
            animate="visible"
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer pointer-events-auto border-0"
            style={{ boxShadow: "0 4px 20px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)" }}
          >
            <MessageCircle className="w-6 h-6" />
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#080B14] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] rounded-2xl overflow-hidden pointer-events-auto flex flex-col"
            style={{
              background: "#080B14",
              border: "1px solid #1E293B",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            {/* Glow border overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15), rgba(6,182,212,0.1))",
                margin: "-1px",
              }}
            />

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-b from-[#0F1629] to-[#0C1021] border-b border-slate-700/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <ScoreRing score={score} />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white tracking-wide">TRUTHCART AI</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400`} />
                    Analysis ready
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800/50 transition-colors"
                  aria-label="Minimize chat"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setMessages([]); setHasOpenedBefore(false); setIsOpen(false); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Score bar ── */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-700/40 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Truth Score</span>
                <span className="text-xs font-bold text-white">{score}/100</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${scoreColor}`}>{scoreVerdict}</span>
            </div>

            {/* ── Messages ── */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#1E293B transparent" }}
            >
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-500">Ask me anything about this product</p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              {isSending && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Chips ── */}
            <div className="flex gap-1.5 px-3.5 py-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
              {QUICK_CHIPS.map((chip, i) => {
                const borderColor =
                  chip.color === "amber" ? "rgba(245,158,11,0.3)" :
                  chip.color === "red" ? "rgba(239,68,68,0.3)" :
                  chip.color === "emerald" ? "rgba(16,185,129,0.3)" :
                  "rgba(249,115,22,0.3)";
                const textColor =
                  chip.color === "amber" ? "text-amber-400" :
                  chip.color === "red" ? "text-red-400" :
                  chip.color === "emerald" ? "text-emerald-400" :
                  "text-orange-400";
                const hoverBg =
                  chip.color === "amber" ? "hover:bg-amber-500/10" :
                  chip.color === "red" ? "hover:bg-red-500/10" :
                  chip.color === "emerald" ? "hover:bg-emerald-500/10" :
                  "hover:bg-orange-500/10";

                return (
                  <button
                    key={i}
                    onClick={() => handleChipClick(chip.question)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[9px] font-bold tracking-wider whitespace-nowrap transition-all ${textColor} ${hoverBg}`}
                    style={{ borderColor, background: "#111827" }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* ── Input ── */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3.5 py-3 bg-[#0C1021] border-t border-slate-700/60 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this product..."
                disabled={isSending}
                className="flex-1 bg-[#1A2236] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 hover:shadow-[0_0_14px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed border-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Local fallback response generator (mirrors backend logic)          */
/* ------------------------------------------------------------------ */

function generateLocalResponse(question: string, analysis: AnalysisContext): string {
  const q = question.toLowerCase();
  const parts: string[] = [];
  const productName = mockProduct.name;
  const score = analysis.truth_score;

  if (/score|truth|rating|reliable|honest|trustworthy/.test(q)) {
    const verdict = score >= 75 ? "mostly reliable" : score >= 50 ? "partially misleading" : "heavily marketed with significant gaps";
    parts.push(`The truth score for **${productName}** is **${analysis.truth_score}/100** — rated as ${verdict}.`);
    if (analysis.score_breakdown.length > 0) {
      const lowest = analysis.score_breakdown.reduce((a, b) => a.value < b.value ? a : b);
      parts.push(`The weakest area is **${lowest.label}** at ${lowest.value}/100.`);
    }
  }

  if (/claim|mislead|exaggerat|overstat|decept|fake|false/.test(q)) {
    const highFlags = analysis.flags.filter((f) => f.severity === "high");
    const medFlags = analysis.flags.filter((f) => f.severity === "medium");
    if (highFlags.length > 0) {
      parts.push(`**${highFlags.length} high-severity** flag${highFlags.length > 1 ? "s" : ""} found: ${highFlags.map((f) => `"${f.claim}"`).join(", ")}.`);
    }
    if (medFlags.length > 0) {
      parts.push(`**${medFlags.length} medium-severity** concern${medFlags.length > 1 ? "s" : ""}: ${medFlags.map((f) => `"${f.claim}"`).join(", ")}.`);
    }
    if (analysis.flags.length === 0) {
      parts.push(`No misleading claims detected for ${productName}. Marketing appears honest.`);
    }
  }

  if (/camera|photo|mp|megapixel|sensor|lens|night/.test(q)) {
    const cameraFlags = analysis.flags.filter((f) => /camera|mp|pixel|photo|sensor|lens/i.test(f.claim));
    if (cameraFlags.length > 0) {
      parts.push(`Camera concerns: ${cameraFlags.map((f) => f.explanation || f.claim).join(". ")}.`);
    }
  }

  if (/battery|charg|last|endurance|power/.test(q)) {
    const batteryFlags = analysis.flags.filter((f) => /battery|charg|last|endurance/i.test(f.claim));
    if (batteryFlags.length > 0) {
      parts.push(`Battery concerns: ${batteryFlags.map((f) => f.explanation || f.claim).join(". ")}.`);
    }
  }

  if (/material|build|titanium|aluminum|glass|steel|construct/.test(q)) {
    const materialFlags = analysis.flags.filter((f) => /material|build|titanium|aluminum|glass|steel|construct/i.test(f.claim));
    if (materialFlags.length > 0) {
      parts.push(`Build quality concerns: ${materialFlags.map((f) => f.explanation || f.claim).join(". ")}.`);
    }
  }

  if (/reddit|community|user|forum|people|review/.test(q)) {
    const contradictions = analysis.reddit?.contradictions || [];
    const issueKeys = analysis.reddit?.issues ? Object.keys(analysis.reddit.issues) : [];
    if (contradictions.length > 0) {
      parts.push(`Reddit users contradict **${contradictions.length} claim${contradictions.length > 1 ? "s" : ""}**: ${contradictions.map((c) => `"${c.claim}"`).join(", ")}.`);
      if (contradictions[0]) parts.push(`Users report: ${contradictions[0].evidence}`);
    }
    if (issueKeys.length > 0) {
      parts.push(`Top community issues: ${issueKeys.slice(0, 3).join(", ")}.`);
    }
  }

  if (/price|cost|worth|value|deal|expensive|cheap/.test(q)) {
    const priceVal = mockProduct.price;
    const scoreVal = analysis.truth_score;
    let valueAssessment: string;
    if (scoreVal >= 75) valueAssessment = "good value — claims align with reality";
    else if (scoreVal >= 55) valueAssessment = "mixed value — some claims are overstated";
    else valueAssessment = "poor value — significant marketing exaggeration";
    parts.push(`At ${priceVal}, this product offers **${valueAssessment}**.`);
  }

  if (/recommend|buy|purchase|should.i/.test(q)) {
    const scoreVal = analysis.truth_score;
    if (scoreVal >= 75) parts.push(`Based on the truth score of ${scoreVal}/100, ${productName} appears reliable. Marketing claims mostly match reality — you can buy with reasonable confidence.`);
    else if (scoreVal >= 55) parts.push(`With a truth score of ${scoreVal}/100, ${productName} has some misleading claims. I'd recommend checking the flagged items carefully before buying.`);
    else parts.push(`With a truth score of ${scoreVal}/100, ${productName} has significant marketing exaggeration. Consider alternatives with more honest marketing.`);
  }

  if (/breakdown|detail|drill|specific|category|dimension/.test(q)) {
    if (analysis.score_breakdown.length > 0) {
      parts.push("Score breakdown:");
      analysis.score_breakdown.forEach((b) => {
        const icon = b.value >= 70 ? "✅" : b.value >= 50 ? "⚠️" : "❌";
        parts.push(`  ${icon} ${b.label}: ${b.value}/100`);
      });
    }
  }

  if (parts.length === 0) {
    if (q.length < 10) {
      parts.push(`Could you be more specific? I can answer about the truth score, claims, camera, battery, build quality, Reddit feedback, price value, or whether to buy ${productName}.`);
    } else {
      parts.push(`Here's a summary for **${productName}**:`);
      parts.push(`• Truth Score: **${analysis.truth_score}/100**`);
      if (analysis.flags.length > 0) {
        parts.push(`• ${analysis.flags.length} flag${analysis.flags.length > 1 ? "s" : ""} detected (${analysis.flags.filter((f) => f.severity === "high").length} high severity)`);
      }
      if (analysis.score_breakdown.length > 0) {
        const lowest = analysis.score_breakdown.reduce((a, b) => a.value < b.value ? a : b);
        parts.push(`• Weakest area: ${lowest.label} (${lowest.value}/100)`);
      }
      parts.push("Ask me about specific claims, the score breakdown, community feedback, or whether this product is worth buying.");
    }
  }

  return parts.join("\n\n");
}
