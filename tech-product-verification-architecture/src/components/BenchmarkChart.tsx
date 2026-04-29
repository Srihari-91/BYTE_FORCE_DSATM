import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";
import { benchmarkData } from "../data/mockData";
import { useState } from "react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-slate-300 font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-slate-400">{entry.name}</span>
            </div>
            <span className="font-mono text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BenchmarkChart() {
  const [view, setView] = useState<"radar" | "bar">("radar");

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white">Benchmark Fairness Engine</span>
          <span className="text-xs text-slate-500 ml-1">Normalized performance comparison</span>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(["radar", "bar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
                view === v ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v === "radar" ? "📡 Radar" : "📊 Bar"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-b border-slate-700/60 flex flex-wrap gap-4 text-xs">
        {[
          { color: "#4ade80", label: "ProVision X12 Ultra (This Product)" },
          { color: "#60a5fa", label: "Samsung Galaxy S25 Ultra" },
          { color: "#c084fc", label: "iPhone 16 Pro Max" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="p-4">
        {view === "radar" ? (
          <div style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={benchmarkData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
                <Radar name="ProVision X12" dataKey="product" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Galaxy S25 Ultra" dataKey="competitor1" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="iPhone 16 Pro Max" dataKey="competitor2" stroke="#c084fc" fill="#c084fc" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="product" name="ProVision X12" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitor1" name="Galaxy S25 Ultra" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitor2" name="iPhone 16 Pro Max" fill="#c084fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance notes */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
            <div className="text-xs font-semibold text-yellow-400 mb-1.5">⚠ Below Average vs Competitors</div>
            <p className="text-xs text-slate-400">Camera IQ (-15 vs Samsung), Battery Life (-17), Build Quality (-11)</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-xs font-semibold text-emerald-400 mb-1.5">✓ Competitive Strengths</div>
            <p className="text-xs text-slate-400">Display quality leads the segment (+3 vs Samsung). CPU performance is competitive.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono">
        Module: <span className="text-slate-300">benchmarkEngine.js</span> · Scores normalized 0–100 · Lab + real-world weighted
      </div>
    </div>
  );
}
