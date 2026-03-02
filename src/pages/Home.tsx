import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getState } from "@/lib/store";
import { useMemo } from "react";

export default function Home() {
  const state = useMemo(() => getState(), []);
  const lastDrill = state.drillResults.length > 0
    ? state.drillResults[state.drillResults.length - 1]
    : null;

  const daysSinceLastDrill = lastDrill
    ? Math.floor((Date.now() - new Date(lastDrill.date).getTime()) / 86400000)
    : null;

  const lastSessionText = daysSinceLastDrill !== null
    ? daysSinceLastDrill === 0
      ? "Last session: today"
      : daysSinceLastDrill === 1
      ? "Last session: yesterday"
      : `Last session: ${daysSinceLastDrill} days ago`
    : null;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground leading-snug mb-4">
          Practice explaining
          <br />
          what you're learning.
        </h1>

        <p className="text-sm text-muted-foreground mb-10">
          One idea. Two attempts. Sharper articulation.
        </p>

        <Link
          to="/input"
          className="inline-flex rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start 7-Minute Rehearsal
        </Link>

        {lastSessionText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 space-y-1"
          >
            <p className="text-xs text-muted-foreground">{lastSessionText}</p>
            <p className="text-xs text-muted-foreground">You improved clarity in your explanations.</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link
            to="/progress"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline transition-colors"
          >
            View Progress
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
