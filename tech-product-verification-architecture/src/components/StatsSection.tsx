import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 11, suffix: "", label: "Analysis Modules", description: "Running in parallel", color: "text-violet-400" },
  { value: 2, suffix: "s", label: "Full Analysis Time", description: "End-to-end pipeline", color: "text-cyan-400" },
  { value: 847, suffix: "+", label: "Reddit Posts Scanned", description: "Per product analysis", color: "text-orange-400" },
  { value: 91, suffix: "%", label: "Extraction Confidence", description: "Fingerprint accuracy", color: "text-emerald-400" },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          const interval = duration / steps;
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, interval);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-16 px-4 bg-[#09101c] border-y border-slate-800/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-4xl md:text-5xl font-black mb-1 ${stat.color}`}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white font-semibold text-sm mb-0.5">{stat.label}</div>
              <div className="text-slate-500 text-xs">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
