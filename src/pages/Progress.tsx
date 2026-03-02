import { useMemo } from "react";
import { motion } from "framer-motion";
import { getState } from "@/lib/store";

interface TrendData {
  label: string;
  status: "improving" | "building" | "plateauing";
  insight: string;
}

export default function Progress() {
  const state = useMemo(() => getState(), []);
  const hasDrills = state.drillResults.length > 0;

  const trends: TrendData[] = [
    {
      label: "Explanation Clarity",
      status: hasDrills ? "improving" : "building",
      insight: hasDrills
        ? "Your explanations are becoming more structured."
        : "Complete a rehearsal to see your trend.",
    },
    {
      label: "Example Usage",
      status: hasDrills ? "building" : "building",
      insight: hasDrills
        ? "You added examples when prompted. Try including them unprompted."
        : "Start rehearsing to develop this area.",
    },
    {
      label: "Argument Strength",
      status: hasDrills ? "plateauing" : "building",
      insight: hasDrills
        ? "You tend to avoid specifics. Try adding constraints."
        : "Apply ideas in rehearsals to develop this area.",
    },
  ];

  const statusLabel = (s: TrendData["status"]) =>
    s === "improving" ? "Improving" : s === "building" ? "Building" : "Plateauing";

  const statusColor = (s: TrendData["status"]) =>
    s === "improving"
      ? "text-secondary"
      : s === "building"
      ? "text-muted-foreground"
      : "text-primary";

  const dotColor = (s: TrendData["status"]) =>
    s === "improving"
      ? "bg-secondary"
      : s === "building"
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

            <div className="flex items-end gap-[2px] h-8 mb-3">
              {Array.from({ length: 20 }).map((_, j) => {
                const base = trend.status === "improving" ? j * 1.5 + 8 : trend.status === "building" ? 16 + Math.sin(j * 0.5) * 4 : Math.max(4, 24 - j * 0.8);
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
          className="mt-8 rounded-xl border border-border bg-card p-5 space-y-3"
        >
          <p className="text-sm font-medium text-foreground mb-2">Last session improvement</p>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">More specific than previous attempt.</p>
            <p className="text-xs text-muted-foreground">Fewer abstract phrases.</p>
            <p className="text-xs text-muted-foreground">Stronger defense under objection.</p>
          </div>
        </motion.div>
      )}

      {hasDrills && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 rounded-xl border border-border bg-card p-5"
        >
          <p className="text-sm font-medium text-foreground mb-2">Sessions</p>
          <p className="text-xs text-muted-foreground">
            {state.drillResults.length} rehearsal{state.drillResults.length !== 1 ? "s" : ""} completed · {state.concepts.length} idea{state.concepts.length !== 1 ? "s" : ""} explored
          </p>
        </motion.div>
      )}
    </div>
  );
}
