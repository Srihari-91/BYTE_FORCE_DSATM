import { BookOpen, ArrowRight, ThumbsUp, Minus, Info } from "lucide-react";
import { specTranslations, tradeoffs } from "../data/mockData";

const IMPACT_CONFIG = {
  positive: { icon: <ThumbsUp className="w-3.5 h-3.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  neutral: { icon: <Minus className="w-3.5 h-3.5" />, color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
  negative: { icon: <Info className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-sm ${i < value ? "bg-yellow-400" : "bg-slate-700"}`}
        />
      ))}
    </div>
  );
}

export default function SpecTranslator() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spec Translator */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white">Spec Translator</span>
          <span className="text-xs text-slate-500 ml-1">Tech → Plain English</span>
        </div>

        <div className="p-4 space-y-4">
          {specTranslations.map((spec, i) => {
            const impact = IMPACT_CONFIG[spec.impact as keyof typeof IMPACT_CONFIG];
            return (
              <div key={i} className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/40">
                {/* Technical spec */}
                <div className="p-3 border-b border-slate-700/40 bg-slate-800/60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Technical Spec</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${impact.color}`}>
                      {impact.icon}
                      {spec.impact}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-cyan-300">{spec.technical}</p>
                </div>
                {/* Plain English */}
                <div className="p-3 flex gap-2">
                  <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{spec.plain}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono">
          Module: <span className="text-slate-300">specTranslator.js</span> · Data-grounded only
        </div>
      </div>

      {/* Trade-off Analyzer */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
          </svg>
          <span className="font-bold text-white">Trade-off Analyzer</span>
          <span className="text-xs text-slate-500 ml-1">Hidden costs detector</span>
        </div>

        <div className="p-4 space-y-4">
          {tradeoffs.map((t, i) => (
            <div key={i} className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/40">
              <div className="p-3 border-b border-slate-700/40 bg-slate-800/60 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{t.feature}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Value rating:</span>
                  <StarRating value={t.rating} max={5} />
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-emerald-400 font-semibold mb-1.5 flex items-center gap-1">
                    <span>✓</span> You gain
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.gain}</p>
                </div>
                <div>
                  <div className="text-xs text-red-400 font-semibold mb-1.5 flex items-center gap-1">
                    <span>✗</span> You sacrifice
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.loss}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono">
          Module: <span className="text-slate-300">tradeoffAnalyzer.js</span> · Config consistency verified
        </div>
      </div>
    </div>
  );
}
