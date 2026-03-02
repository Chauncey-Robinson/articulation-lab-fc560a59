import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MetricCard from "@/components/MetricCard";
import { getState } from "@/lib/store";

export default function Dashboard() {
  const state = useMemo(() => getState(), []);

  const upcomingReviews = state.concepts
    .filter((c) => new Date(c.nextReview) <= new Date(Date.now() + 7 * 86400000))
    .slice(0, 5);

  const levelColor = (level: string) =>
    level === "high" ? "strong" as const : level === "moderate" ? "moderate" as const : "weak" as const;

  const scoreColor = (score: number) =>
    score >= 70 ? "strong" as const : score >= 40 ? "moderate" as const : "weak" as const;

  return (
    <div>
      <div className="mb-10">
        <p className="metric-label mb-1">Performance Overview</p>
        <h1 className="text-3xl font-light tracking-tight text-foreground">
          Cognitive Metrics
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
        <MetricCard
          label="Retention Strength"
          value={state.retentionScore}
          type="score"
          levelColor={scoreColor(state.retentionScore)}
        />
        <MetricCard
          label="Articulation Depth"
          value={state.articulationDepth.charAt(0).toUpperCase() + state.articulationDepth.slice(1)}
          type="level"
          levelColor={levelColor(state.articulationDepth)}
        />
        <MetricCard
          label="Application Clarity"
          value={state.applicationClarity.charAt(0).toUpperCase() + state.applicationClarity.slice(1)}
          type="level"
          levelColor={levelColor(state.applicationClarity)}
        />
      </div>

      {/* Concept Stability Trend */}
      <div className="mb-10 rounded-xl border border-border bg-card p-6">
        <p className="metric-label mb-4">Concept Stability — Last 30 Days</p>
        <div className="flex items-end gap-[3px] h-16">
          {Array.from({ length: 30 }).map((_, i) => {
            const h = Math.max(4, Math.min(64, 20 + Math.sin(i * 0.4) * 15 + i * 1.2));
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.02, duration: 0.4 }}
                className="flex-1 rounded-sm bg-primary/20"
                style={{ minWidth: 2 }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[10px] text-muted-foreground">30d ago</span>
          <span className="text-[10px] text-muted-foreground">Today</span>
        </div>
      </div>

      {/* Upcoming Retrievals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="metric-label mb-4">Upcoming Retrieval Sessions</p>
        {upcomingReviews.length > 0 ? (
          <div className="space-y-3">
            {upcomingReviews.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground truncate max-w-[60%]">{c.text}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.nextReview).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No concepts loaded yet.</p>
            <Link
              to="/input"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Input Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
