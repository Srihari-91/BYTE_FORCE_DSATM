import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { mockProduct, truthScore } from "../data/mockData";

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

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

  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  const glowColor = score >= 75 ? "rgba(74,222,128," : score >= 50 ? "rgba(250,204,21," : "rgba(248,113,113,";
  const endColor = score >= 75 ? "#06B6D4" : score >= 50 ? "#F97316" : "#DC2626";
  const label = score >= 75 ? "Reliable" : score >= 50 ? "Mixed" : "Marketing Heavy";

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Radial glow behind gauge */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor}0.12) 0%, transparent 70%)`,
          filter: `drop-shadow(0 0 12px ${glowColor}0.3))`,
        }}
      />

      <svg className="absolute inset-0 -rotate-90" width="192" height="192" viewBox="0 0 192 192">
        <defs>
          <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          <filter id={`scoreGlow-${score}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track ring */}
        <circle cx="96" cy="96" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* Progress ring */}
        <circle
          cx="96" cy="96" r={radius}
          stroke={`url(#scoreGradient-${score})`}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#scoreGlow-${score})`}
          className="animate-gauge-fill"
          style={{
            '--gauge-circumference': circumference,
            '--gauge-offset': circumference * (1 - score / 100),
          } as React.CSSProperties}
        />
      </svg>

      {/* Score text */}
      <div className="flex flex-col items-center">
        <span className="text-4xl font-black text-white animate-score-pop">{animated}</span>
        <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">out of 100</span>
      </div>

      {/* Shimmer overlay on gauge */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none animate-shimmer"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}

export default function TruthScoreCard() {
  const score = truthScore;

  const verdict = score >= 75
    ? { text: "Mostly Reliable", icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" }
    : score >= 50
    ? { text: "Partially Misleading", icon: <AlertTriangle className="w-5 h-5" />, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" }
    : { text: "Marketing Heavy", icon: <XCircle className="w-5 h-5" />, color: "text-red-400 bg-red-500/10 border-red-500/30" };

  const scoreBreakdown = [
    { label: "Claim Accuracy", value: 52, color: "bg-red-500" },
    { label: "Spec Transparency", value: 64, color: "bg-yellow-500" },
    { label: "Benchmark Fairness", value: 71, color: "bg-yellow-400" },
    { label: "Reddit Validation", value: 48, color: "bg-red-500" },
    { label: "Material Honesty", value: 61, color: "bg-yellow-500" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-white">Truth Score Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-mono">fingerprint: {mockProduct.fingerprint}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Product info + score */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
          {/* Product info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">{mockProduct.image}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    {mockProduct.source}
                  </span>
                  <span className="text-xs text-slate-500">
                    Confidence: {(mockProduct.extractionConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{mockProduct.name}</h2>
                <p className="text-slate-400 text-sm">{mockProduct.brand} · {mockProduct.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-2xl font-bold text-white">{mockProduct.price}</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-semibold">{mockProduct.rating}</span>
                <span className="text-slate-500 text-sm">({mockProduct.reviewCount.toLocaleString()})</span>
              </div>
            </div>

            {/* Verdict badge */}
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${verdict.color}`}>
              {verdict.icon}
              {verdict.text}
            </div>
          </div>

          {/* Score ring */}
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={score} />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Info className="w-3 h-3" />
              <span>Fused: 70% analysis + 30% Reddit</span>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Score Breakdown</h3>
          {scoreBreakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-40 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-sm font-mono text-slate-400 w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Pipeline timing */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="font-mono">Pipeline: <span className="text-slate-300">2,216ms total</span></span>
          <span className="font-mono">Claims analyzed: <span className="text-slate-300">6</span></span>
          <span className="font-mono">Reddit posts: <span className="text-slate-300">312</span></span>
          <span className="font-mono">Modules run: <span className="text-slate-300">11</span></span>
        </div>
      </div>
    </div>
  );
}
