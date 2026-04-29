import { CheckCircle, Clock } from "lucide-react";
import { pipelineStages, systemArchitecture } from "../data/mockData";

const LAYER_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  purple: { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  green: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
};

export default function PipelineVisualizer() {
  const totalTime = pipelineStages.reduce((sum, s) => sum + parseInt(s.time), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipeline Execution */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white">Pipeline Execution Trace</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">{totalTime}ms total</span>
        </div>

        <div className="p-4 relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-emerald-500/50 via-cyan-500/30 to-violet-500/20" />

          <div className="space-y-1">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="relative flex items-center gap-4 pl-4">
                {/* Step number / icon */}
                <div className="relative z-10 w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-sm">
                  {stage.icon}
                </div>

                <div className="flex-1 flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-200">{stage.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-60"
                      style={{ width: `${Math.max(8, (parseInt(stage.time) / 1240) * 80)}px` }}
                    />
                    <span className="text-xs font-mono text-slate-500">{stage.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono">
          Orchestrator: <span className="text-slate-300">orchestrator.js</span> · All modules completed ✓
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="font-bold text-white">System Architecture</span>
        </div>

        <div className="p-4 space-y-3">
          {systemArchitecture.map((layer, layerIndex) => {
            const colors = LAYER_COLORS[layer.color];
            return (
              <div key={layer.layer}>
                <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}>
                  <div className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-2 flex items-center gap-2`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                    {layer.layer}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.components.map((comp) => (
                      <span
                        key={comp}
                        className={`px-2 py-0.5 rounded-md text-xs border font-medium ${colors.badge}`}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
                {layerIndex < systemArchitecture.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-2 bg-slate-600" />
                      <div className="text-slate-600 text-xs">↓</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono">
          Anti-hallucination: <span className="text-emerald-400">active on all modules</span> · Confidence-gated output
        </div>
      </div>
    </div>
  );
}
