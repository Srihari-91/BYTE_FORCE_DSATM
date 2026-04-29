import { useState, useEffect } from "react";
import { Shield, Zap, Brain, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const TYPING_STRINGS = [
  "200MP Revolutionary Camera",
  "All-Day Battery Life",
  "Military-Grade Titanium Build",
  "AI-Powered Night Vision",
  "8K Cinema Recording",
];

export default function HeroSection({ onAnalyze }: { onAnalyze: () => void }) {
  const [typingIdx, setTypingIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [demoComplete, setDemoComplete] = useState(false);

  useEffect(() => {
    const target = TYPING_STRINGS[typingIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIdx < target.length) {
      timeout = setTimeout(() => {
        setDisplayText(target.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 60);
    } else if (!isDeleting && charIdx === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayText(target.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, 35);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setTypingIdx((i) => (i + 1) % TYPING_STRINGS.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, typingIdx]);

  const handleScan = () => {
    setScanActive(true);
    setScanStage(0);
    setDemoComplete(false);

    const stages = [1, 2, 3, 4, 5];
    stages.forEach((stage, i) => {
      setTimeout(() => {
        setScanStage(stage);
        if (stage === 5) {
          setDemoComplete(true);
          setTimeout(() => {
            onAnalyze();
          }, 600);
        }
      }, i * 500 + 400);
    });
  };

  const scanLabels = ["Detecting product...", "Extracting specs...", "Analyzing claims...", "Querying Reddit...", "Building truth score..."];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080B14] px-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400/60 pointer-events-none animate-particle-1" />
      <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400/60 pointer-events-none animate-particle-2" />
      <div className="absolute bottom-1/3 left-1/4 w-1 h-1 rounded-full bg-violet-400/60 pointer-events-none animate-particle-3" />
      <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-emerald-400/50 pointer-events-none animate-particle-1" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400/50 pointer-events-none animate-particle-2" style={{ animationDelay: '2s' }} />

      {/* Badge */}
      <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-medium animate-overlay-enter">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-dot-pulse" />
        Real-Time Marketing Truth Verification Engine
      </div>

      {/* Main headline */}
      <h1 className="text-center text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 animate-gradient-shift">Truth</span>
        Cart
      </h1>

      <p className="text-center text-lg md:text-xl text-slate-400 max-w-2xl mb-4 leading-relaxed">
        Stop being deceived by marketing language.{" "}
        <span className="text-white font-semibold">TruthCart</span> decodes every claim,
        translates every spec, and cross-validates with real user data.
      </p>

      {/* Typing demo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700/50 text-slate-200 font-mono text-sm md:text-base min-w-[340px] justify-between animate-border-glow">
          <span className="text-slate-500 text-xs">Marketing claim:</span>
          <span className="text-yellow-300">
            "{displayText}
            <span className="animate-pulse">|</span>"
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span>Potentially misleading — TruthCart can verify this</span>
        </div>
      </div>

      {/* CTA area */}
      {!scanActive ? (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={handleScan}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-3 animate-logo-ripple"
          >
            <Shield className="w-5 h-5" />
            Run Live Demo
            <Zap className="w-4 h-4 group-hover:text-yellow-300 transition-colors" />
          </button>
          <button
            onClick={onAnalyze}
            className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:border-slate-400 hover:text-white transition-all duration-200"
          >
            View Full Analysis →
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 font-mono text-sm animate-overlay-enter">
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2">TruthCart Engine — Running</span>
            </div>
            {scanLabels.slice(0, scanStage).map((label, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300">{label}</span>
                <span className="text-slate-600 text-xs ml-auto">✓</span>
              </div>
            ))}
            {scanStage < 5 && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-cyan-300">{scanLabels[scanStage]}</span>
              </div>
            )}
            {demoComplete && (
              <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="font-bold">Analysis complete — Loading dashboard...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stat pills */}
      <div className="mt-16 flex flex-wrap gap-6 justify-center">
        {[
          { icon: <Brain className="w-4 h-4" />, label: "11 Analysis Modules", color: "text-violet-400 border-violet-500/30 bg-violet-500/5" },
          { icon: <Shield className="w-4 h-4" />, label: "Anti-Hallucination Guard", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
          { icon: <Zap className="w-4 h-4" />, label: "< 2s Full Analysis", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" },
          { icon: <XCircle className="w-4 h-4" />, label: "Reddit Cross-Validation", color: "text-orange-400 border-orange-500/30 bg-orange-500/5" },
        ].map((stat, i) => (
          <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${stat.color} fade-in-up`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
            {stat.icon}
            {stat.label}
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 text-xs">
        <span>Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1">
          <div className="w-1 h-2 rounded-full bg-slate-600 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
