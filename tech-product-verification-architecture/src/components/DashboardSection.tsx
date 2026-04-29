import TruthScoreCard from "./TruthScoreCard";
import ClaimsAnalyzer from "./ClaimsAnalyzer";
import RedditIntelligence from "./RedditIntelligence";
import SpecTranslator from "./SpecTranslator";
import BenchmarkChart from "./BenchmarkChart";
import PipelineVisualizer from "./PipelineVisualizer";
import VisualIntelligence from "./VisualIntelligence";
import { BarChart2 } from "lucide-react";

interface DashboardSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "overview", label: "Truth Score", emoji: "🛡️" },
  { id: "claims", label: "Claims Analysis", emoji: "🧠" },
  { id: "reddit", label: "Reddit Intel", emoji: "📡" },
  { id: "specs", label: "Spec Translator", emoji: "📖" },
  { id: "benchmark", label: "Benchmarks", emoji: "📊" },
  { id: "pipeline", label: "Pipeline", emoji: "⚙️" },
  { id: "visual", label: "Visual Intel", emoji: "🧠" },
];

export default function DashboardSection({ activeTab, onTabChange }: DashboardSectionProps) {
  return (
    <section className="min-h-screen bg-[#080B14] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Live Analysis Dashboard</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              ProVision X12 Ultra Camera
            </h2>
            <p className="text-slate-400 text-sm mt-1">TechVision · Analyzed via TruthCart Engine · 2.2s</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Analysis complete
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-700 text-white shadow border border-slate-600"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "overview" && <TruthScoreCard />}
          {activeTab === "claims" && <ClaimsAnalyzer />}
          {activeTab === "reddit" && <RedditIntelligence />}
          {activeTab === "specs" && <SpecTranslator />}
          {activeTab === "benchmark" && <BenchmarkChart />}
          {activeTab === "pipeline" && <PipelineVisualizer />}
          {activeTab === "visual" && <VisualIntelligence />}
        </div>
      </div>
    </section>
  );
}
