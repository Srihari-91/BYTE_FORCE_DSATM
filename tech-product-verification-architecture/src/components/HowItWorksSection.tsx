import { Search, Cpu, Radio, BarChart2, Layers } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Search className="w-6 h-6" />,
    title: "Product Detection",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    iconBg: "bg-blue-500/20",
    description: "The Chrome extension detects you've landed on a product page (Amazon, Flipkart, etc.) using DOM pattern matching and URL heuristics.",
    tech: ["detector.js", "observer.js", "SPA-aware"],
  },
  {
    step: "02",
    icon: <Cpu className="w-6 h-6" />,
    title: "Extract & Normalize",
    color: "text-violet-400 border-violet-500/30 bg-violet-500/5",
    iconBg: "bg-violet-500/20",
    description: "Structured extractors pull product name, specs, price, and marketing claims. Data is normalized, fingerprinted, and checked against a local cache.",
    tech: ["amazon.js", "normalizer.js", "fingerprint.js", "cache.js"],
  },
  {
    step: "03",
    icon: <Layers className="w-6 h-6" />,
    title: "11-Module Analysis",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
    iconBg: "bg-cyan-500/20",
    description: "The backend orchestrator runs 11 parallel analysis modules: claim classification, spec translation, reality mapping, material tagging, benchmark fairness, and more.",
    tech: ["orchestrator.js", "LLM + NLP", "Anti-hallucination"],
  },
  {
    step: "04",
    icon: <Radio className="w-6 h-6" />,
    title: "Reddit Cross-Validation",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/5",
    iconBg: "bg-orange-500/20",
    description: "Reddit posts are fetched, filtered for relevance, and analyzed for issue frequency. Claims are matched against real user evidence to detect contradictions.",
    tech: ["redditClient.js", "redditFilter.js", "redditMatcher.js"],
  },
  {
    step: "05",
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Score Fusion & Output",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    iconBg: "bg-emerald-500/20",
    description: "A weighted score is computed (70% analysis + 30% Reddit signal). The final response includes truth score, flags, insights, and a verdict rendered in the extension overlay.",
    tech: ["scoreFusion.js", "responseBuilder.js", "Shadow DOM overlay"],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-4 bg-[#080B14] relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #4ade80 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-4">
            <Layers className="w-4 h-4" />
            System Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            How TruthCart{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A multi-layer verification engine that goes far beyond simple scraping or sentiment analysis.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-violet-500/20 to-emerald-500/30 hidden md:block" style={{ transform: "translateX(-0.5px)" }} />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.step} className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                {/* Content */}
                <div className="flex-1">
                  <div className={`border rounded-2xl p-6 ${step.color}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={step.color.split(" ")[0]}>{step.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-slate-500">Step {step.step}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-3">{step.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.tech.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step number (center) */}
                <div className="hidden md:flex w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 items-center justify-center flex-shrink-0 z-10 shadow-lg">
                  <span className="text-lg font-black text-white">{step.step}</span>
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
