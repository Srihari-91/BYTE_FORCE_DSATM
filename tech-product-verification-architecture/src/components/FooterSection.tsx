import { Shield, Heart } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-[#080B14] border-t border-slate-800/60 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white text-xl">TruthCart</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              A multi-layer marketing truth verification engine. Built to protect consumers from deceptive tech marketing.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">System</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Extension</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Backend Engine</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Modules</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Claim Classifier</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Spec Translator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reddit Intelligence</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Score Fusion</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Chrome Extension", "Node.js Backend", "LLM NLP", "Reddit API", "Shadow DOM", "Real-Time Pipeline"].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full text-xs border border-slate-700/60 text-slate-400 bg-slate-800/40"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-500" />
            <span>to fight marketing deception</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">Anti-hallucination: <span className="text-emerald-600">✓ active</span></span>
            <span className="font-mono">Confidence-gated: <span className="text-emerald-600">✓ on</span></span>
          </div>
          <div>
            <span>TruthCart v1.0 · {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
