import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, ChevronDown } from "lucide-react";
import { mockProduct, truthScore, claimsData, redditSignals, specTranslations } from "../data/mockData";

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  const colors = score >= 75
    ? { main: "#10B981", start: "#10B981", end: "#06B6D4", label: "Reliable" }
    : score >= 50
    ? { main: "#F59E0B", start: "#F59E0B", end: "#F97316", label: "Mixed" }
    : { main: "#EF4444", start: "#EF4444", end: "#DC2626", label: "Marketing Heavy" };

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        setAnimated(Math.min(start, score));
        if (start < score) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-[130px] h-[130px]">
        {/* Radial glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colors.main}15 0%, transparent 70%)`,
          }}
        />
        <svg className="absolute inset-0 -rotate-90" width="130" height="130" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#131B2A" strokeWidth="8" strokeLinecap="round" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="url(#gaugeGrad)" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[34px] font-black font-mono text-white leading-none">{animated}</span>
          <span className="text-[11px] font-semibold mt-0.5" style={{ color: colors.main }}>{colors.label}</span>
          <span className="text-[10px] text-slate-500 mt-0.5">out of 100</span>
        </div>
        {/* Shimmer */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 45%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 55%,transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      </div>
      {/* Fusion note */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
        <span className="text-[10px] text-slate-500">Fused: 70% analysis + 30% Reddit</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Breakdown Bars                                               */
/* ------------------------------------------------------------------ */

function ScoreBreakdown({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className="px-[18px] py-4 border-b border-slate-700/60">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px] mb-3">
        Score Breakdown
      </div>
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const barColor = item.value >= 70
            ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
            : item.value >= 50
            ? "bg-gradient-to-r from-amber-400 to-orange-400"
            : "bg-gradient-to-r from-red-400 to-orange-400";
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
              className="flex items-center gap-2.5"
            >
              <span className="text-xs text-slate-300 w-[120px] flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-[#131B2A] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${barColor} relative`}
                >
                  <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-r from-transparent to-white/30 rounded-full" />
                </motion.div>
              </div>
              <span className="text-xs font-mono text-slate-500 w-7 text-right flex-shrink-0">{item.value}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Claims Section                                                     */
/* ------------------------------------------------------------------ */

function ClaimsSection({ flags }: { flags: typeof claimsData }) {
  const misleading = flags.filter(f => f.severity === "high" || f.severity === "medium");
  return (
    <div className="px-[18px] py-3.5 border-b border-slate-700/60">
      {/* Summary */}
      <div className="flex items-center gap-1.5 mb-3 text-xs">
        <span className="text-amber-400">⚠️</span>
        <span className="text-amber-400 font-semibold">
          {misleading.length} misleading claim{misleading.length !== 1 ? "s" : ""} detected
        </span>
      </div>
      {/* Claim items */}
      <div className="space-y-2">
        {misleading.slice(0, 4).map((claim, idx) => {
          const isHigh = claim.severity === "high";
          return (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
              className="flex gap-2.5 bg-[#111827] rounded-lg p-2.5 border border-slate-700/60 hover:border-slate-600/60 hover:translate-x-0.5 transition-all cursor-default"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 mt-0.5 ${isHigh ? "text-red-400" : "text-amber-400"}`}>
                {isHigh ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="9" />
                    <line x1="7" y1="7" x2="13" y2="13" stroke="#080B14" strokeWidth="2" strokeLinecap="round" />
                    <line x1="13" y1="7" x2="7" y2="13" stroke="#080B14" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2L1 18h18L10 2z" />
                    <line x1="10" y1="8" x2="10" y2="12" stroke="#080B14" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="14.5" r="0.8" fill="#080B14" />
                  </svg>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-100">{claim.claim}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{claim.realityText || claim.explanation}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reddit Section                                                     */
/* ------------------------------------------------------------------ */

function RedditSection({ reddit }: { reddit: typeof redditSignals }) {
  const maxCount = Math.max(...Object.values(reddit.issues).map(i => i.count), 1);
  return (
    <div className="px-[18px] py-3.5 border-t border-slate-700/60">
      <div className="text-xs font-semibold text-slate-100 mb-2.5 flex items-center gap-1.5">
        🔱 Community Signals (Reddit)
      </div>
      {/* Issue bars */}
      <div className="space-y-1.5">
        {reddit.issues.slice(0, 5).map((issue) => (
          <div key={issue.topic} className="flex items-center gap-2 text-[11px]">
            <span className="w-[80px] text-slate-400 capitalize flex-shrink-0">{issue.topic.replace(/_/g, " ")}</span>
            <div className="flex-1 h-[5px] bg-[#131B2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                style={{ width: `${Math.round((issue.count / maxCount) * 100)}%` }}
              />
            </div>
            <span className="w-6 text-right text-slate-500 font-mono text-[10px]">{issue.count}</span>
          </div>
        ))}
      </div>
      {/* Contradictions */}
      {reddit.contradictions.length > 0 && (
        <>
          <div className="text-[11px] font-semibold text-slate-400 mt-4 mb-2 pt-2.5 border-t border-slate-700/40">
            Claim vs Reality Conflicts
          </div>
          <div className="space-y-1.5">
            {reddit.contradictions.slice(0, 3).map((c, i) => (
              <div key={i} className="bg-[#111827] rounded-lg p-2.5 border border-slate-700/60 text-[11px]">
                <div className="text-amber-400 mb-1"><strong>Claim:</strong> "{c.claim}"</div>
                <div className="text-slate-400"><strong>Users report:</strong> {c.evidence}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insights Section                                                   */
/* ------------------------------------------------------------------ */

function InsightsSection() {
  return (
    <div className="px-[18px] py-3.5 border-t border-slate-700/60">
      <div className="text-xs font-semibold text-slate-100 mb-2.5 flex items-center gap-1.5">
        💡 Key Insights
      </div>
      <div className="space-y-1.5">
        {specTranslations.map((item, i) => (
          <div key={i} className="flex gap-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:pl-2 transition-all rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex-shrink-0 mt-1.5 animate-pulse" />
            <div className="flex-1">{item.plain}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Section                                                      */
/* ------------------------------------------------------------------ */

function StatsSection({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <div className="px-[18px] py-3.5 border-t border-slate-700/60">
      <div className="text-xs font-semibold text-slate-100 mb-2.5 flex items-center gap-1.5">
        📊 Analysis Stats
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#111827] rounded-lg p-2.5 text-center border border-slate-700/60">
            <div className="text-lg font-bold font-mono text-slate-100">{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-[0.3px] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Verdict Badge                                                      */
/* ------------------------------------------------------------------ */

function VerdictBadge({ score }: { score: number }) {
  const data = score >= 85
    ? { text: "Mostly Reliable", icon: "✅", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" }
    : score >= 70
    ? { text: "Mostly Reliable", icon: "✅", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" }
    : score >= 55
    ? { text: "Partially Misleading", icon: "⚠️", className: "text-amber-400 bg-amber-500/10 border-amber-500/25" }
    : score >= 40
    ? { text: "Marketing Heavy", icon: "❌", className: "text-orange-400 bg-orange-500/10 border-orange-500/25" }
    : { text: "Buyer Beware", icon: "🛑", className: "text-red-400 bg-red-500/10 border-red-500/25" };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border text-xs font-semibold ${data.className}`}>
      {data.icon} {data.text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProductAnalysisCard() {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const score = truthScore;
  const misleadingCount = claimsData.filter(f => f.severity === "high" || f.severity === "medium").length;

  const scoreBreakdown = [
    { label: "Claim Accuracy", value: 52 },
    { label: "Spec Transparency", value: 64 },
    { label: "Benchmark Fairness", value: 71 },
    { label: "Reddit Validation", value: 48 },
    { label: "Material Honesty", value: 61 },
  ];

  const stats = [
    { label: "Total Flags", value: misleadingCount },
    { label: "High Severity", value: claimsData.filter(f => f.severity === "high").length },
    { label: "Medium Severity", value: claimsData.filter(f => f.severity === "medium").length },
    { label: "Insights", value: specTranslations.length },
    { label: "Reddit Issues", value: redditSignals.issues.length },
    { label: "Contradictions", value: redditSignals.contradictions.length },
  ];

  return (
    <div
      className="bg-[#080B14] border border-slate-700/60 rounded-2xl overflow-hidden font-sans text-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative"
      style={{ maxWidth: 420 }}
    >
      {/* Animated gradient border glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
        style={{
          background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.15),rgba(139,92,246,0.1),rgba(16,185,129,0.15))",
          backgroundSize: "300% 300%",
          animation: "gradientShift 4s ease infinite",
          margin: -1,
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-[18px] py-3.5 bg-gradient-to-b from-[#0D1320] to-[#0D1320]/95 border-b border-slate-700/60 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-[18px] h-[18px] text-emerald-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-slate-100 to-cyan-400 bg-clip-text text-transparent">
            Truth Score Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono max-w-[160px] truncate">
            fingerprint: {mockProduct.fingerprint}
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* ── Main Section: Product Info + Score Ring ── */}
      <div className="flex gap-5 px-[18px] py-5 border-b border-slate-700/60">
        {/* Left: Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-mono">
              amazon.com
            </span>
            <span className="text-[11px] text-slate-500">
              Confidence: 91%
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 leading-tight mb-1">{mockProduct.name}</h2>
          <p className="text-xs text-slate-400 mb-2.5">{mockProduct.brand} · {mockProduct.category}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[22px] font-bold text-slate-100">{mockProduct.price}</span>
            <div className="text-[13px] text-slate-400">
              <span className="text-amber-400">★</span> {mockProduct.rating} ({mockProduct.reviewCount.toLocaleString()})
            </div>
          </div>
          <VerdictBadge score={score} />
        </div>

        {/* Right: Score Ring */}
        <ScoreRing score={score} />
      </div>

      {/* ── Score Breakdown ── */}
      <ScoreBreakdown items={scoreBreakdown} />

      {/* ── Claims ── */}
      <ClaimsSection flags={claimsData} />

      {/* ── Expandable: More detail ── */}
      <div className="border-b border-slate-700/60">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 px-[18px] bg-[#0D1320] text-xs text-slate-400 font-medium hover:bg-[#131B2A] hover:text-slate-200 transition-all flex items-center justify-center gap-1.5"
        >
          {expanded ? "Less detail" : "More detail"}
          <span className={`text-[10px] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown className="w-3 h-3" />
          </span>
        </button>
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ maxHeight: expanded ? 800 : 0, opacity: expanded ? 1 : 0 }}
        >
          {/* Reddit */}
          <RedditSection reddit={redditSignals} />
          {/* Insights */}
          <InsightsSection />
          {/* Stats */}
          <StatsSection stats={stats} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-between items-center px-[18px] py-2.5 text-[10px] bg-gradient-to-b from-[#0D1320]/80 to-[#0D1320]">
        <span className="text-slate-500">Confidence: 91% · 2.2s</span>
        <span className="text-emerald-400 font-semibold">TruthCart v1.0</span>
      </div>
    </div>
  );
}
