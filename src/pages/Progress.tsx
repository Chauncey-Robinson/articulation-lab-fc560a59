import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const dimensions = [
  { key: "clarity" as const, label: "How clearly you explained it" },
  { key: "example" as const, label: "Whether you used an example" },
  { key: "argument" as const, label: "How well it held together" },
];

function getStatus(count: number) {
  if (count >= 15) return { dot: "bg-[#7BAE7F]", label: "Doing great" };
  if (count >= 5) return { dot: "bg-accent", label: "Getting better" };
  return { dot: "bg-border", label: "Just getting started" };
}

function getBlockColor(score: number | undefined) {
  if (score === undefined) return "bg-block-empty";
  if (score <= 3) return "bg-block-low";
  if (score <= 6) return "bg-block-mid";
  return "bg-block-high";
}

export default function Progress() {
  const { sessions, streakCount, totalSessions, lastDrillDate } = useApp();
  const status = getStatus(sessions.length);

  const today = new Date().toISOString().split("T")[0];
  const lastLabel = lastDrillDate === today ? "Today" : lastDrillDate || "Never";

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center py-20">
          <h1 className="font-serif text-[1.8rem] text-foreground mb-3">Progress</h1>
          <p className="text-sm text-muted-foreground mb-6">Complete a drill to see your progress.</p>
          <Link
            to="/onboarding"
            className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Start Your First Drill
          </Link>
        </div>
      </div>
    );
  }

  const streakPct = Math.min((streakCount / 30) * 100, 100);

  return (
    <div className="min-h-screen bg-background px-6 pt-4 pb-10">
      <div className="max-w-[460px] mx-auto">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-2">Progress</h1>

        {/* Accountability summary */}
        <div className="rounded-lg bg-card border border-border p-5 mb-6">
          <h2 className="font-serif text-[1rem] text-foreground mb-3">How you're doing</h2>
          <p className="text-[13px] text-foreground mb-1">🔥 {streakCount}-day streak</p>
          <p className="text-[13px] text-muted-foreground mb-1">{totalSessions} total drills completed</p>
          <p className="text-[13px] text-muted-foreground mb-4">Last drilled: {lastLabel}</p>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${streakPct}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground">{streakCount}/30 day goal</span>
          </div>
        </div>

        <div className="space-y-3">
          {dimensions.map((dim) => {
            const scores = sessions.map((s) => s[dim.key]);
            const last5 = scores.slice(-5);
            const avg5 = last5.length > 0 ? (last5.reduce((a, b) => a + b, 0) / last5.length).toFixed(1) : "—";
            const blocks = Array.from({ length: 20 }, (_, i) => scores[i]);

            return (
              <div key={dim.key} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-foreground">{dim.label}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
                  {scores.length} practice{scores.length !== 1 ? "s" : ""} · recent score: {avg5} out of 10
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
