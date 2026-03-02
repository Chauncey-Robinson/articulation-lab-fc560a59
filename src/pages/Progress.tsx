import { useMemo } from "react";
import { motion } from "framer-motion";
import { getState } from "@/lib/store";

interface TrendData {
  label: string;
  status: "improving" | "stable" | "needs-attention";
  insight: string;
}

export default function Progress() {
  const state = useMemo(() => getState(), []);

  const hasDrills = state.drillResults.length > 0;

  const trends: TrendData[] = [
    {
      label: "Memory Trend",
      status: hasDrills ? "improving" : "stable",
      insight: hasDrills
        ? "You recall ideas better after 2 sessions."
        : "Complete a few drills to see your trend.",
    },
    {
      label: "Clarity Trend",
      status: hasDrills ? "stable" : "stable",
      insight: hasDrills
        ? "Your explanations are becoming more structured."
        : "Start drilling to build your clarity trend.",
    },
    {
      label: "Practical Thinking",
      status: hasDrills ? "needs-attention" : "stable",
      insight: hasDrills
        ? "You tend to avoid specifics. Try adding constraints."
        : "Apply ideas in drills to develop this area.",
    },
  ];

  const statusLabel = (s: TrendData["status"]) =>
    s === "improving" ? "Improving" : s === "stable" ? "Stable" : "Needs attention";

  const statusColor = (s: TrendData["status"]) =>
    s === "improving"
      ? "text-secondary"
      : s === "stable"
      ? "text-muted-foreground"
      : "text-primary";

  const dotColor = (s: TrendData["status"]) =>
    s === "improving"
      ? "bg-secondary"
      : s === "stable"
      ? "bg-muted-foreground"
      : "bg-primary";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Progress
        </h1>
      </div>

      <div className="space-y-4">
        {trends.map((trend, i) => (
          <motion.div
            key={trend.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">{trend.label}</p>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor(trend.status)}`} />
                <span className={`text-xs font-medium ${statusColor(trend.status)}`}>
                  {statusLabel(trend.status)}
                </span>
              </div>
            </div>

            {/* Mini trend visualization */}
            <div className="flex items-end gap-[2px] h-8 mb-3">
              {Array.from({ length: 20 }).map((_, j) => {
                const base = trend.status === "improving" ? j * 1.5 + 8 : trend.status === "stable" ? 16 + Math.sin(j * 0.5) * 4 : Math.max(4, 24 - j * 0.8);
                const h = Math.max(3, Math.min(32, base + (Math.random() - 0.5) * 6));
                return (
                  <motion.div
                    key={j}
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: i * 0.08 + j * 0.015, duration: 0.3 }}
                    className="flex-1 rounded-sm bg-primary/15"
                  />
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{trend.insight}</p>
          </motion.div>
        ))}
      </div>

      {hasDrills && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl border border-border bg-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-2">Sessions</p>
          <p className="text-xs text-muted-foreground">
            {state.drillResults.length} drill{state.drillResults.length !== 1 ? "s" : ""} completed · {state.concepts.length} idea{state.concepts.length !== 1 ? "s" : ""} explored
          </p>
        </motion.div>
      )}
    </div>
  );
}
