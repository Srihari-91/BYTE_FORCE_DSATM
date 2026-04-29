import { motion } from "framer-motion";
import { trustDecomposition, claimRiskMatrix, realitySnapshot, evidenceSummary, tradeoffData, recommendationData, comparisonData, truthScore, claimsData } from "../data/mockData";

/* ------------------------------------------------------------------ */
/*  Recommendation Card                                                */
/* ------------------------------------------------------------------ */

const actionConfig: Record<string, { color: string; icon: string; bg: string }> = {
  buy_confidence: { color: "#10B981", icon: "✅", bg: "rgba(16,185,129,0.08)" },
  likely_safe: { color: "#3B82F6", icon: "🛡️", bg: "rgba(59,130,246,0.08)" },
  cautious: { color: "#F59E0B", icon: "⚠️", bg: "rgba(245,158,11,0.08)" },
  skip: { color: "#F97316", icon: "👎", bg: "rgba(249,115,22,0.08)" },
  expensive_risk: { color: "#EF4444", icon: "🚫", bg: "rgba(239,68,68,0.08)" },
  buyer_beware: { color: "#DC2626", icon: "🛑", bg: "rgba(220,38,38,0.08)" },
};

function RecommendationCard() {
  const rec = recommendationData;
  const cfg = actionConfig[rec.action] || actionConfig.buyer_beware;
  return (
    <div className="bg-[#0F1A2E] rounded-xl p-4 border border-slate-700/60 hover:border-slate-600/60 transition-all">
      <div className="flex items-center gap-2.5 mb-2">
        <span style={{ color: cfg.color }} className="text-lg">{cfg.icon}</span>
        <span className="text-sm font-bold" style={{ color: cfg.color }}>{rec.label}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-2">{rec.detail}</p>
      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 p-2 rounded-lg bg-[#111B2E]">
        <span className="text-slate-600">💡</span>
        <span>{rec.alternatives}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Score Decomposition                                          */
/* ------------------------------------------------------------------ */

function TrustDecomposition() {
  return (
    <div className="space-y-2.5">
      {trustDecomposition.map((item, idx) => {
        const barColor = item.score >= 75
          ? "bg-gradient-to-r from-blue-400 to-purple-400"
          : item.score >= 50
          ? "bg-gradient-to-r from-amber-400 to-orange-400"
          : "bg-gradient-to-r from-red-400 to-orange-400";
        const textColor = item.score >= 75 ? "text-emerald-400" : item.score >= 50 ? "text-amber-400" : "text-red-400";
        return (
          <motion.div
            key={item.dimension}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] text-slate-300 font-medium">{item.dimension}</span>
              <span className={`text-[11px] font-bold font-mono ${textColor}`}>{item.score}%</span>
            </div>
            <div className="h-[6px] bg-[#111B2E] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ delay: 0.1 + idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${barColor} relative`}
              >
                <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-r from-transparent to-white/20 rounded-full" />
              </motion.div>
            </div>
            <span className="text-[9px] text-slate-600 font-mono">w:{item.weight.toFixed(2)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Claim Risk Matrix                                                  */
/* ------------------------------------------------------------------ */

function ClaimRiskMatrix() {
  const groups = [
    { key: "misleading" as const, label: "Misleading", icon: "❌", color: "#EF4444" },
    { key: "conditional" as const, label: "Conditional", icon: "⚠️", color: "#F59E0B" },
    { key: "non_verifiable" as const, label: "Non-Verifiable", icon: "ℹ️", color: "#64748B" },
    { key: "safe" as const, label: "Safe", icon: "✅", color: "#10B981" },
  ];

  const items = [...claimRiskMatrix.misleading, ...claimRiskMatrix.conditional].slice(0, 6);

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {groups.map(g => {
          const count = claimRiskMatrix[g.key].length;
          return (
            <span
              key={g.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#0F1A2E] border"
              style={{ borderColor: g.color + "33", color: g.color }}
            >
              <span className="text-xs">{g.icon}</span>
              <span>{count}</span>
            </span>
          );
        })}
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item, idx) => {
            const dotColor = item.severity === "high" || item.severity === "critical" ? "#EF4444" : item.severity === "medium" ? "#F59E0B" : "#64748B";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="flex gap-2 p-2 rounded-lg bg-[#0F1A2E] border border-slate-700/60 hover:border-slate-600/60 hover:translate-x-0.5 transition-all"
              >
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: dotColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-200">{item.claim}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{item.explanation}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reality Snapshot                                                   */
/* ------------------------------------------------------------------ */

function RealitySnapshot() {
  const sections = [
    { key: "what_is_real" as const, label: "What is Real", icon: "✅", accent: "#34D399" },
    { key: "what_is_inflated" as const, label: "What is Inflated", icon: "📈", accent: "#F97316" },
    { key: "what_is_misleading" as const, label: "What is Misleading", icon: "⚠️", accent: "#F59E0B" },
    { key: "what_actually_matters" as const, label: "What Actually Matters", icon: "🎯", accent: "#3B82F6" },
  ];

  return (
    <div className="space-y-3">
      {sections.map(s => {
        const items = realitySnapshot[s.key];
        return (
          <div key={s.key}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1" style={{ color: s.accent }}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            {items.length > 0 ? items.map((text, i) => (
              <div key={i} className="text-[11px] text-slate-400 py-0.5 pl-5 leading-relaxed relative">
                <span className="absolute left-1.5 top-[9px] w-1 h-1 rounded-full bg-slate-600" />
                {text}
              </div>
            )) : (
              <div className="text-[10px] text-slate-600 italic pl-5">No significant findings</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Evidence Confidence Meter                                          */
/* ------------------------------------------------------------------ */

function ConfidenceMeter() {
  const total = evidenceSummary.total_findings;
  const findingTypes = [
    { key: "critical" as const, label: "Critical", count: evidenceSummary.critical, color: "#DC2626" },
    { key: "high" as const, label: "High", count: evidenceSummary.high, color: "#EF4444" },
    { key: "medium" as const, label: "Medium", count: evidenceSummary.medium, color: "#F59E0B" },
    { key: "low" as const, label: "Low", count: evidenceSummary.low, color: "#64748B" },
    { key: "info" as const, label: "Info", count: evidenceSummary.info, color: "#3B82F6" },
  ];

  const levelMap: Record<string, { color: string; text: string }> = {
    high: { color: "#34D399", text: "High Confidence" },
    medium: { color: "#F59E0B", text: "Medium Confidence" },
    low: { color: "#EF4444", text: "Low Confidence" },
  };
  const level = levelMap["medium"];

  return (
    <div>
      <div className="flex h-5 rounded-lg overflow-hidden gap-0.5 bg-[#111B2E]">
        {findingTypes.map(ft => ft.count > 0 ? (
          <motion.div
            key={ft.key}
            initial={{ width: 0 }}
            animate={{ width: `${(ft.count / Math.max(total, 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded relative"
            style={{ background: ft.color }}
            title={`${ft.label}: ${ft.count}`}
          >
            <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-r from-transparent to-white/15 rounded" />
          </motion.div>
        ) : null)}
        {findingTypes.every(ft => ft.count === 0) && (
          <div className="w-full h-full rounded bg-slate-700" />
        )}
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-slate-500 font-mono">{total} findings</span>
        <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: level.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: level.color }} />
          {level.text}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trade-off Visualizer                                               */
/* ------------------------------------------------------------------ */

function TradeoffVisualizer() {
  return (
    <div className="space-y-2">
      {tradeoffData.slice(0, 4).map((to, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.3 }}
          className="bg-[#0F1A2E] rounded-lg p-2.5 border border-slate-700/60"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-emerald-400 w-[100px] flex-shrink-0 truncate">{to.claimed_benefit}</span>
            <div className="flex-1 h-1 bg-[#111B2E] rounded overflow-hidden">
              <div className="h-full rounded bg-emerald-500 w-[70%]" />
            </div>
            <span className="text-emerald-400 text-xs">▲</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-red-400 w-[100px] flex-shrink-0 truncate">{to.hidden_tradeoff} ↓</span>
            <div className="flex-1 h-1 bg-[#111B2E] rounded overflow-hidden">
              <div className="h-full rounded bg-red-500 w-[60%]" />
            </div>
            <span className="text-red-400 text-xs">▼</span>
          </div>
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
            {to.affected_metric}
          </span>
        </motion.div>
      ))}
      {tradeoffData.length === 0 && (
        <div className="text-xs text-slate-600 text-center py-4">No hidden trade-offs detected</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Value vs Hype                                                      */
/* ------------------------------------------------------------------ */

function ValueVsHype() {
  const score = truthScore;
  const highFlags = claimsData.filter(f => f.severity === "high").length;
  const medFlags = claimsData.filter(f => f.severity === "medium").length;

  const valuePct = Math.max(20, Math.min(80, score - 10));
  const inflationPct = Math.min(40, highFlags * 12 + medFlags * 5 + Math.max(0, 50 - score) * 0.3);
  const brandPct = Math.max(5, 100 - valuePct - inflationPct);

  const legend = [
    { label: "Real Value", pct: valuePct, color: "#3B82F6" },
    { label: "Brand Premium", pct: brandPct, color: "#8B5CF6" },
    { label: "Marketing Inflation", pct: inflationPct, color: "#F59E0B" },
  ];

  return (
    <div>
      <div className="flex h-6 rounded-lg overflow-hidden gap-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${valuePct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded relative"
          style={{ background: "linear-gradient(90deg, #3B82F6, #6366F1)" }}
          title={`Real Value: ${Math.round(valuePct)}%`}
        >
          <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-r from-transparent to-white/20 rounded" />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${brandPct}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded relative"
          style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
          title={`Brand Premium: ${Math.round(brandPct)}%`}
        >
          <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-r from-transparent to-white/20 rounded" />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${inflationPct}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded relative"
          style={{ background: "linear-gradient(90deg, #F59E0B, #EF4444)" }}
          title={`Marketing Inflation: ${Math.round(inflationPct)}%`}
        >
          <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-r from-transparent to-white/20 rounded" />
        </motion.div>
      </div>
      <div className="flex gap-4 flex-wrap mt-2">
        {legend.map(li => (
          <div key={li.label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-2 h-2 rounded-sm" style={{ background: li.color }} />
            <span className="font-medium">{li.label}</span>
            <span className="text-slate-500 font-mono">{Math.round(li.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparative Intelligence                                           */
/* ------------------------------------------------------------------ */

function ComparativeIntelligence() {
  const { score, industryAvg, price, highCount, medCount, category } = comparisonData;

  const comparisons = [
    {
      title: "vs Industry Average",
      value: (score - industryAvg > 0 ? "+" : "") + (score - industryAvg),
      label: score - industryAvg >= 0 ? "Above average transparency" : "Below average transparency",
      good: score - industryAvg >= 0,
      detail: `${category.charAt(0).toUpperCase() + category.slice(1)} products typically score ~${industryAvg}`,
    },
    {
      title: "Price-to-Trust Value",
      value: price > 0 ? (score / Math.max(price / 100, 0.1)).toFixed(1) : "—",
      label: price > 0 && score / Math.max(price / 100, 0.1) > 2 ? "Good value proposition" : "Premium pricing for trust level",
      good: price > 0 && score / Math.max(price / 100, 0.1) > 2,
      detail: price > 0 ? `$${price.toLocaleString()} at ${score}% trust score` : "",
    },
    {
      title: "Claim Severity Profile",
      value: `${highCount}H / ${medCount}M`,
      label: highCount === 0 && medCount === 0 ? "Clean profile" : highCount > 2 ? "High risk profile" : "Moderate concerns",
      good: highCount === 0,
      detail: `${highCount} high severity, ${medCount} medium severity flags`,
    },
  ];

  const worthIt = score >= 75 && highCount === 0;
  const wait = score >= 55 && medCount < 3;

  return (
    <div className="space-y-2">
      {comparisons.map((c, idx) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.3 }}
          className="flex gap-3 bg-[#0F1A2E] rounded-lg p-3 border border-slate-700/60 hover:border-slate-600/60 hover:translate-x-0.5 transition-all"
        >
          <div className="flex-shrink-0 w-20">
            <div className="text-[9px] text-slate-500 uppercase tracking-[0.4px] mb-0.5">{c.title}</div>
            <div className="text-base font-extrabold font-mono leading-none" style={{ color: c.good ? "#34D399" : "#F59E0B" }}>{c.value}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-200 mb-0.5">
              {c.good ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              )}
              {c.label}
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed">{c.detail}</div>
          </div>
        </motion.div>
      ))}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#111B2E] border border-slate-700/60">
        <span style={{ color: worthIt ? "#34D399" : wait ? "#F59E0B" : "#EF4444" }} className="text-sm">
          {worthIt ? "✅" : wait ? "⏳" : "❌"}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {worthIt
            ? "Worth upgrading to this product"
            : wait
            ? "Consider waiting for better alternatives"
            : "Not recommended — look for alternatives"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight Cards (2×2 grid)                                           */
/* ------------------------------------------------------------------ */

interface CardData {
  title: string;
  value: string;
  detail: string;
  status: "good" | "warn" | "bad";
}

const statusColors: Record<string, string> = { good: "#34D399", warn: "#F59E0B", bad: "#EF4444" };
const cardBorderColors: Record<string, string> = {
  good: "rgba(52,211,153,0.2)",
  warn: "rgba(245,158,11,0.2)",
  bad: "rgba(239,68,68,0.2)",
};

function InsightCard({ data }: { data: CardData }) {
  const color = statusColors[data.status] || "#64748B";
  return (
    <div
      className="rounded-xl p-3 bg-[#0F1A2E] border transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      style={{ borderColor: cardBorderColors[data.status] || "rgba(30,45,69,0.6)" }}
    >
      <div className="text-xs mb-1.5" style={{ color }}>●</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-[0.4px] mb-1">{data.title}</div>
      <div className="text-[13px] font-bold mb-0.5" style={{ color }}>{data.value}</div>
      <div className="text-[10px] text-slate-400 leading-relaxed">{data.detail}</div>
    </div>
  );
}

function InsightCards() {
  const score = truthScore;
  const highCount = claimsData.filter(f => f.severity === "high").length;
  const realCount = realitySnapshot.what_is_real.length;
  const rec = recommendationData;

  const cards: CardData[] = [
    {
      title: "Risk Assessment",
      value: highCount > 0 ? `${highCount} High Flags` : "Low Risk",
      detail: highCount > 0 ? `${highCount} high-severity claims need verification` : "No critical issues found in this listing",
      status: highCount === 0 ? "good" : highCount > 2 ? "bad" : "warn",
    },
    {
      title: "Value Analysis",
      value: score >= 70 ? "Good Value" : score >= 50 ? "Mixed" : "Overpriced Hype",
      detail: score >= 70 ? "Claims match expectations for the price point" : "Trust score suggests premium may not be justified",
      status: score >= 70 ? "good" : score >= 50 ? "warn" : "bad",
    },
    {
      title: "Reality Check",
      value: realCount > 0 ? `${realCount} Verified Facts` : "Limited Verification",
      detail: realCount > 0 ? "Key product attributes are verifiably accurate" : "Most claims lack independent verification",
      status: realCount > 0 ? "good" : "warn",
    },
    {
      title: "Comparison",
      value: rec.action === "buy_confidence" ? "Recommended" : rec.action === "skip" || rec.action === "buyer_beware" ? "Avoid" : "Evaluate",
      detail: rec.action === "buy_confidence" || rec.action === "likely_safe" ? "Trust score supports this choice" : "Proceed with caution based on analysis",
      status: rec.action === "buy_confidence" || rec.action === "likely_safe" ? "good" : rec.action === "skip" || rec.action === "buyer_beware" ? "bad" : "warn",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map(card => <InsightCard key={card.title} data={card} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main VisualIntelligence Component                                  */
/* ------------------------------------------------------------------ */

interface SectionProps {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}

function InsightSection({ title, icon, color, children }: SectionProps) {
  return (
    <div className="px-4 py-3.5 border-b border-slate-700/60 last:border-b-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.5px] mb-3">
        <span style={{ color }}>{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function VisualIntelligence() {
  const sections = [
    { title: "Recommendation", icon: "🎯", color: "#10B981", comp: <RecommendationCard />, always: true },
    { title: "Trust Score Decomposition", icon: "📊", color: "#3B82F6", comp: <TrustDecomposition />, always: true },
    { title: "Claim Risk Matrix", icon: "⚠️", color: "#F59E0B", comp: <ClaimRiskMatrix />, always: true },
    { title: "Reality Snapshot", icon: "🔍", color: "#34D399", comp: <RealitySnapshot />, always: true },
    { title: "Evidence Confidence", icon: "📈", color: "#06B6D4", comp: <ConfidenceMeter />, always: true },
    { title: "Hidden Trade-offs", icon: "🔄", color: "#8B5CF6", comp: <TradeoffVisualizer />, always: true },
    { title: "Value vs Hype", icon: "⚖️", color: "#F59E0B", comp: <ValueVsHype />, always: true },
    { title: "Comparative Intelligence", icon: "🏆", color: "#06B6D4", comp: <ComparativeIntelligence />, always: true },
    { title: "Key Insights", icon: "💡", color: "#64748B", comp: <InsightCards />, always: true },
  ];

  return (
    <div className="bg-[#0C1324] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="p-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h3 className="text-sm font-bold text-white">Visual Intelligence</h3>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Premium analytics powered by TruthCart's 11 deterministic trust engines</p>
      </div>
      {sections.map(s => (
        <InsightSection key={s.title} title={s.title} icon={s.icon} color={s.color}>
          {s.comp}
        </InsightSection>
      ))}
    </div>
  );
}
