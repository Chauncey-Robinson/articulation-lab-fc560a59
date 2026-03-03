import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const dimensions = [
  { key: "clarity" as const, label: "Explanation Clarity" },
  { key: "example" as const, label: "Example Usage" },
  { key: "argument" as const, label: "Argument Strength" },
];

function getStatus(count: number) {
  if (count >= 15) return { dot: "bg-green-500", label: "Strong" };
  if (count >= 5) return { dot: "bg-amber-400", label: "Developing" };
  return { dot: "bg-muted-foreground/40", label: "Building" };
}

function getBlockColor(score: number | undefined) {
  if (score === undefined) return "bg-block-empty";
  if (score <= 3) return "bg-block-low";
  if (score <= 6) return "bg-block-mid";
  return "bg-block-high";
}

export default function Progress() {
  const { sessions } = useApp();
  const status = getStatus(sessions.length);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif text-2xl text-foreground mb-3">Progress</h1>
        <p className="text-sm text-muted-foreground mb-6">Complete a rehearsal to see your progress.</p>
        <Link
          to="/onboarding"
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Start Your First Drill
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground mb-8">Progress</h1>

      <div className="space-y-5">
        {dimensions.map((dim) => {
          const scores = sessions.map((s) => s[dim.key]);
          const last5 = scores.slice(-5);
          const avg5 = last5.length > 0 ? (last5.reduce((a, b) => a + b, 0) / last5.length).toFixed(1) : "—";

          const blocks = Array.from({ length: 20 }, (_, i) => scores[i]);

          return (
            <div key={dim.key} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-foreground">{dim.label}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <div className="flex gap-[3px] mb-3">
                {blocks.map((score, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded ${getBlockColor(score)}`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {scores.length} session{scores.length !== 1 ? "s" : ""} · avg last 5: {avg5}/10
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
