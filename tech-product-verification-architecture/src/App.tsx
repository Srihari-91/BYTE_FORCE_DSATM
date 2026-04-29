import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import DashboardSection from "./components/DashboardSection";
import ExtensionOverlay from "./components/ExtensionOverlay";
import FooterSection from "./components/FooterSection";

type Section = "hero" | "dashboard" | "how-it-works" | "architecture";

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showOverlay, setShowOverlay] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const architectureRef = useRef<HTMLDivElement>(null);

  // Show overlay after a delay for demo effect
  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (section: string) => {
    if (section === "dashboard") {
      setShowDashboard(true);
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      setActiveSection("dashboard");
    } else if (section === "hero") {
      heroRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveSection("hero");
    } else if (section === "how-it-works") {
      howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveSection("how-it-works");
    } else if (section === "architecture") {
      architectureRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveSection("architecture");
    }
  };

  const handleAnalyzeDemo = () => {
    setShowDashboard(true);
    setActiveSection("dashboard");
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Intersection observer for active section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section") as Section;
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const refs = [heroRef, dashboardRef, howItWorksRef, architectureRef];
    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [showDashboard]);

  return (
    <div className="min-h-screen bg-[#080B14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar activeSection={activeSection} onNavigate={navigateTo} />

      {/* Hero */}
      <div ref={heroRef} data-section="hero" className="pt-16">
        <HeroSection onAnalyze={handleAnalyzeDemo} />
      </div>

      {/* Features */}
      <FeaturesSection />

      {/* How It Works */}
      <div ref={howItWorksRef} data-section="how-it-works">
        <HowItWorksSection />
      </div>

      {/* Architecture Note Banner */}
      <div ref={architectureRef} data-section="architecture" className="bg-[#09101c] py-12 px-4 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700/60 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                🧠
              </div>
              <div className="flex-1">
                <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">What This Is NOT vs IS</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-red-400 font-semibold mb-2">❌ NOT just a...</div>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Simple scraper</li>
                      <li>• Sentiment analyzer</li>
                      <li>• Price comparison tool</li>
                      <li>• Review aggregator</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-emerald-400 font-semibold mb-2">✅ It IS a...</div>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Multi-layer truth verification engine</li>
                      <li>• Real-time marketing deception detector</li>
                      <li>• Cross-source validation system</li>
                      <li>• Confidence-gated analysis pipeline</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAnalyzeDemo}
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200"
              >
                See Live Demo →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      {showDashboard && (
        <div ref={dashboardRef} data-section="dashboard">
          <DashboardSection activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {/* CTA section if dashboard not shown yet */}
      {!showDashboard && (
        <div className="py-24 px-4 bg-[#080B14]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to see the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">truth?</span>
            </h2>
            <p className="text-slate-400 mb-8">
              Run TruthCart on any tech product and get a full breakdown of marketing claims vs reality in under 2 seconds.
            </p>
            <button
              onClick={handleAnalyzeDemo}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200"
            >
              Launch Full Analysis Dashboard
            </button>
          </div>
        </div>
      )}

      <FooterSection />

      {/* Extension Overlay */}
      {showOverlay && <ExtensionOverlay />}
    </div>
  );
}
