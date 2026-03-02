import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  type?: "score" | "level";
  levelColor?: "strong" | "moderate" | "weak";
}

export default function MetricCard({ label, value, type = "score", levelColor }: MetricCardProps) {
  const colorClass =
    levelColor === "strong"
      ? "text-metric-strong"
      : levelColor === "moderate"
      ? "text-metric-moderate"
      : levelColor === "weak"
      ? "text-metric-weak"
      : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <p className="metric-label mb-3">{label}</p>
      {type === "score" ? (
        <p className={`metric-value ${colorClass}`}>{value}</p>
      ) : (
        <p className={`text-lg font-medium tracking-tight ${colorClass}`}>{value}</p>
      )}
    </motion.div>
  );
}
