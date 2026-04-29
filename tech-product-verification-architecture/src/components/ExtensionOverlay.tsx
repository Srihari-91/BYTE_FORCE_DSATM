import { useState } from "react";
import { Shield, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Radio } from "lucide-react";
import { truthScore, claimsData, redditSignals } from "../data/mockData";

export default function ExtensionOverlay() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const score = truthScore;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  const verdict = score >= 75 ? "Mostly Reliable" : score >= 50 ? "Partially Misleading" : "Marketing Heavy";
  const issues = claimsData.filter((c) => c.status !== "verified");

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center justify-center hover:scale-105 transition-all animate-logo-ripple"
        title="Show TruthCart"
      >
        <Shield className="w-6 h-6 text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Extension overlay — simulates the Chrome extension overlay */}
      <div className="bg-[#0f1628] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl shadow-black/50 animate-overlay-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold text-sm">TruthCart</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">amazon.com</span>
            <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            {/* Mini score circle with shimmer */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="-rotate-90 absolute inset-0" viewBox="0 0 64 64" width="64" height="64">
                <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="none" />
                <circle
                  cx="32" cy="32" r="26"
                  stroke={color}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-black text-white animate-score-pop">{score}</span>
              </div>
            </div>

            <div>
              <div className="text-white font-bold text-sm">{verdict}</div>
              <div className="text-slate-400 text-xs mt-0.5">Truth Score: {score}/100</div>
              <div className="flex items-center gap-1 mt-1.5">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span className="text-orange-300 text-xs font-medium">{issues.length} misleading claims detected</span>
              </div>
            </div>
          </div>

          {/* Quick flags */}
          <div className="space-y-1.5 mb-3">
            {issues.slice(0, 2).map((claim) => (
              <div key={claim.id} className="flex items-start gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
                {claim.status === "contradicted" ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs text-white font-medium">{claim.claim}</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{claim.realityText}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-200 py-1.5 border border-slate-700/60 rounded-lg hover:border-slate-600 transition-all"
          >
            {expanded ? (
              <>Less detail <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>More detail <ChevronDown className="w-3 h-3" /></>
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 fade-in-up">
              {/* Reddit signals mini */}
              <div className="bg-slate-800/40 rounded-xl p-3 border border-orange-500/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Radio className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">Reddit Signals</span>
                </div>
                {redditSignals.issues.filter(i => i.severity !== "positive").slice(0, 2).map((issue) => (
                  <div key={issue.topic} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{issue.topic}</span>
                    <span className="text-xs text-red-400 font-mono">{issue.count} reports</span>
                  </div>
                ))}
              </div>

              {/* All claims */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">All Claims</div>
                {claimsData.map((claim) => (
                  <div key={claim.id} className="flex items-center gap-2 py-1 border-b border-slate-800/60 last:border-0">
                    {claim.status === "verified" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    ) : claim.status === "contradicted" ? (
                      <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                    )}
                    <span className="text-[11px] text-slate-300">{claim.claim}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-mono">Confidence: 91% · 2.2s</span>
          <span className="text-[10px] text-emerald-600">TruthCart v1.0</span>
        </div>
      </div>
    </div>
  );
}
