import { useState } from "react";
import { MessageCircle, TrendingDown, TrendingUp, AlertTriangle, ExternalLink, Radio } from "lucide-react";
import { redditSignals } from "../data/mockData";

export default function RedditIntelligence() {
  const [activeTab, setActiveTab] = useState<"issues" | "contradictions">("issues");

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/60">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-white">Reddit Intelligence Layer</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Live signal extraction
            </span>
            <span>{redditSignals.timeRange}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-700/60 border-b border-slate-700/60">
        {[
          { label: "Posts Scanned", value: redditSignals.totalPosts, color: "text-white" },
          { label: "Relevant Posts", value: redditSignals.relevantPosts, color: "text-cyan-400" },
          { label: "Contradictions", value: redditSignals.contradictions.length, color: "text-red-400" },
          { label: "Signal Confidence", value: `${(redditSignals.overallSentiment * 100).toFixed(0)}%`, color: "text-orange-400" },
        ].map((stat) => (
          <div key={stat.label} className="px-4 py-3 text-center">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subreddit chips */}
      <div className="px-6 py-3 border-b border-slate-700/60 flex flex-wrap gap-2">
        {redditSignals.subreddits.map((sub) => (
          <span key={sub} className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {sub}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60">
        {(["issues", "contradictions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? "text-white border-b-2 border-orange-400 bg-orange-500/5"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "issues" ? "Reported Issues" : "Claim Contradictions"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "issues" && (
          <div className="space-y-3">
            {redditSignals.issues.map((issue) => {
              const isNegative = issue.sentiment < 0;
              const barWidth = Math.abs(issue.sentiment) * 100;
              return (
                <div key={issue.topic} className="flex items-center gap-4 bg-slate-800/40 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{issue.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{issue.count} posts</span>
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${isNegative ? "text-red-400" : "text-emerald-400"}`}>
                          {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {issue.sentiment.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          issue.severity === "positive"
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                            : issue.severity === "high"
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-orange-500 to-yellow-500"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    issue.severity === "positive"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : issue.severity === "high"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}>
                    {issue.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "contradictions" && (
          <div className="space-y-3">
            {redditSignals.contradictions.map((c, i) => (
              <div key={i} className="bg-slate-800/40 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <span className="font-semibold text-white text-sm">"{c.claim}"</span>
                      <span className="text-xs font-mono text-slate-400">
                        confidence: <span className="text-cyan-400">{(c.confidence * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-2">
                      <p className="text-sm text-red-200 italic">"{c.evidence}"</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <MessageCircle className="w-3 h-3" />
                      <span>{c.posts} matching posts found</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-700/60 bg-slate-900/50 text-xs text-slate-500 font-mono flex gap-4 flex-wrap">
        <span>Reddit Client: <span className="text-slate-300">OAuth2 + Rate-limited</span></span>
        <span>Filter: <span className="text-slate-300">relevance + recency</span></span>
        <span>Fetch time: <span className="text-orange-400">1,240ms</span></span>
      </div>
    </div>
  );
}
