import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Tag, Brain } from "lucide-react";
import { claimsData } from "../data/mockData";

const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  misleading: {
    label: "Misleading",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-400",
  },
  contradicted: {
    label: "Contradicted",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-400 bg-red-500/10 border-red-500/30",
    dot: "bg-red-400",
  },
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-orange-400 bg-orange-500/10",
  low: "text-emerald-400 bg-emerald-500/10",
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

function ClaimCard({ claim }: { claim: (typeof claimsData)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[claim.status as keyof typeof STATUS_CONFIG];

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      expanded ? "border-slate-500/60 bg-slate-800/60" : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
    }`}>
      <button
        className="w-full text-left p-4 flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${config.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{claim.claim}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${config.color}`}>
              {config.icon}
              {config.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[claim.severity]}`}>
              {claim.severity} severity
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Tag className="w-3 h-3" />
              {claim.category}
            </span>
            <span className="text-xs text-slate-500">Confidence:</span>
            <ConfidenceBar value={claim.confidence} />
          </div>
        </div>

        <div className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 space-y-4">
          {/* Marketing vs Reality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Marketing Claim</span>
              </div>
              <p className="text-sm text-red-200">{claim.marketingText}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Reality</span>
              </div>
              <p className="text-sm text-emerald-200">{claim.realityText}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-slate-900/60 rounded-lg p-3 flex gap-2">
            <Brain className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">{claim.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimsAnalyzer() {
  const [filter, setFilter] = useState<"all" | "misleading" | "contradicted" | "verified">("all");

  const filtered = filter === "all" ? claimsData : claimsData.filter((c) => c.status === filter);

  const counts = {
    all: claimsData.length,
    misleading: claimsData.filter((c) => c.status === "misleading").length,
    contradicted: claimsData.filter((c) => c.status === "contradicted").length,
    verified: claimsData.filter((c) => c.status === "verified").length,
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/60">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-white">Claim Analysis Engine</span>
            <span className="text-xs text-slate-500 ml-1">NLP + LLM Classification</span>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {(["all", "contradicted", "misleading", "verified"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
                  filter === f
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f} {counts[f] > 0 && <span className="ml-1 opacity-60">({counts[f]})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x divide-slate-700/60 border-b border-slate-700/60">
        <div className="px-6 py-3 text-center">
          <div className="text-2xl font-black text-red-400">{counts.contradicted}</div>
          <div className="text-xs text-slate-500">Contradicted</div>
        </div>
        <div className="px-6 py-3 text-center">
          <div className="text-2xl font-black text-orange-400">{counts.misleading}</div>
          <div className="text-xs text-slate-500">Misleading</div>
        </div>
        <div className="px-6 py-3 text-center">
          <div className="text-2xl font-black text-emerald-400">{counts.verified}</div>
          <div className="text-xs text-slate-500">Verified</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>

      <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono flex gap-4">
        <span>Claim Extractor: <span className="text-slate-300">LLM + rule-based NLP</span></span>
        <span>Tokenizer: <span className="text-slate-300">BPE-optimized</span></span>
        <span>Anti-hallucination: <span className="text-emerald-400">✓ active</span></span>
      </div>
    </div>
  );
}
