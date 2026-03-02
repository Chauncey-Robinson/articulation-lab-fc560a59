import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getState } from "@/lib/store";

export default function CognitiveGraph() {
  const state = useMemo(() => getState(), []);
  const concepts = state.concepts;

  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-sm text-muted-foreground mb-4">No concepts mapped yet.</p>
        <Link
          to="/input"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Input Content
        </Link>
      </div>
    );
  }

  const strengthColor = (s: string) =>
    s === "strong" ? "bg-metric-strong" : s === "building" ? "bg-metric-moderate" : "bg-metric-weak";

  const strengthBorder = (s: string) =>
    s === "strong"
      ? "border-metric-strong/30"
      : s === "building"
      ? "border-metric-moderate/30"
      : "border-metric-weak/30";

  const daysSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    return days === 0 ? "Today" : `${days}d ago`;
  };

  // Simple visual layout: nodes in a radial pattern
  const centerX = 200;
  const centerY = 200;
  const radius = 140;

  return (
    <div>
      <div className="mb-8">
        <p className="metric-label mb-1">Cognitive Graph</p>
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Concept Network
        </h1>
      </div>

      {/* Graph Visualization */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8 flex justify-center overflow-hidden">
        <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
          {/* Connection lines */}
          {concepts.map((_, i) => {
            const angle = (i / concepts.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <motion.line
                key={`line-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              />
            );
          })}

          {/* Center node */}
          <circle cx={centerX} cy={centerY} r="6" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx={centerX} cy={centerY} r="3" fill="hsl(var(--primary))" />

          {/* Concept nodes */}
          {concepts.map((c, i) => {
            const angle = (i / concepts.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const r = c.strength === "strong" ? 10 : c.strength === "building" ? 7 : 5;
            const fill =
              c.strength === "strong"
                ? "hsl(var(--metric-strong))"
                : c.strength === "building"
                ? "hsl(var(--metric-moderate))"
                : "hsl(var(--metric-weak))";

            return (
              <motion.g key={c.id}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={r + 4}
                  fill={fill}
                  opacity="0.15"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={fill}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                />
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend + List */}
      <div className="flex gap-4 mb-6">
        {(["weak", "building", "strong"] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${strengthColor(s)}`} />
            <span className="text-xs text-muted-foreground capitalize">{s}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {concepts.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-lg border ${strengthBorder(c.strength)} bg-card px-5 py-3 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`h-2 w-2 shrink-0 rounded-full ${strengthColor(c.strength)}`} />
              <p className="text-sm text-foreground truncate">{c.text}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-3">
              {daysSince(c.lastArticulated)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
