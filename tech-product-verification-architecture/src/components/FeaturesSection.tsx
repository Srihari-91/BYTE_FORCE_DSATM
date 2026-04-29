import { Shield, Brain, Radio, BookOpen, BarChart2, AlertTriangle, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "LLM Claim Extraction",
    description: "Large language models identify and extract marketing claims from product descriptions, automatically classifying them as verifiable, vague, or deceptive.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Reality Mapper",
    description: "Maps each marketing claim to real-world benchmarks and user experiences, exposing the gap between advertised and actual performance.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: <Radio className="w-6 h-6" />,
    title: "Reddit Intelligence",
    description: "Cross-validates product claims against thousands of real Reddit posts. Extracts issue frequency, sentiment, and contradictions from actual users.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Spec Translator",
    description: "Converts cryptic technical jargon into plain English. Tells you what 'UFS 4.0' actually means for your daily use — not just what it means technically.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Benchmark Fairness Engine",
    description: "Normalizes performance metrics against real competitor data to expose cherry-picked benchmarks and selective comparisons in marketing materials.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Trade-off Analyzer",
    description: "For every marketed feature, reveals what you're actually giving up. Thin profile? Smaller battery. 200MP mode? Huge files and slow processing.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Camera Reality Engine",
    description: "Decodes camera marketing specifically: pixel binning, sensor size, multi-frame stacking, and AI enhancement — separates genuine capability from hype.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Anti-Hallucination Guard",
    description: "Every module is constrained to use only input product data. No external assumptions. All outputs carry confidence scores. Returns 'unknown' when unsure.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-[#09101c] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 text-sm font-medium mb-4 animate-overlay-enter">
            <Brain className="w-4 h-4" />
            11 Analysis Modules
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Not Just a Scraper.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 animate-gradient-shift">
              A Truth Engine.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            TruthCart runs 11 specialized modules simultaneously, each targeting a different dimension of marketing deception.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className={`group border ${feature.border} ${feature.bg} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 cursor-default fade-in-up`}
              style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
            >
              <div className={`w-10 h-10 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Score fusion formula */}
        <div className="mt-12 bg-slate-900 border border-slate-700/60 rounded-2xl p-6 fade-in-up stagger-4">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Score Fusion Formula</span>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 font-mono text-sm">
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-5 py-3 border border-slate-700">
              <span className="text-emerald-400 font-bold">Truth Score</span>
              <span className="text-slate-500">=</span>
              <span className="text-cyan-300">(Base Score × 0.7)</span>
              <span className="text-slate-500">+</span>
              <span className="text-orange-300">(Reddit Score × 0.3)</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs text-slate-500">
            <span><span className="text-cyan-400">Base Score</span> — 10 analysis modules</span>
            <span><span className="text-orange-400">Reddit Score</span> — cross-validated user signals</span>
            <span><span className="text-emerald-400">Final</span> — 0–100 truth rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
