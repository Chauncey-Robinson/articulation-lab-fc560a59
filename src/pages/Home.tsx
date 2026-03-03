import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Home() {
  const { sessions, streakCount, lastDrillDate, totalSessions, contextLabel } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const drilledToday = lastDrillDate === today;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const drilledYesterday = lastDrillDate === yesterday;
  const isReturning = totalSessions > 0;

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastAvg = lastSession ? Math.round((lastSession.clarity + lastSession.example + lastSession.argument) / 3) : null;

  if (!isReturning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-[2.4rem] leading-[1.2] text-foreground mb-3 whitespace-pre-line">
          {"You know more than\nyou can explain."}
        </h1>
        <p className="text-sm text-muted-foreground mb-2">
          One idea. Two attempts. Sharper thinking.
        </p>
        <p className="text-xs text-accent mb-8">
          Most sessions take under 5 minutes.
        </p>

        <Link
          to="/input"
          className="w-full max-w-[460px] rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
        >
          Start Your First Drill
        </Link>
        <Link to="/progress" className="mt-4 text-[13px] text-muted-foreground underline">
          View Progress
        </Link>
      </div>
    );
  }

  // Returning user
  const dayCircles = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const drilled = sessions.some((s) => s.date === dateStr);
    const isToday = dateStr === today && !drilledToday;
    return { drilled, isToday };
  });

  let cardTitle = "";
  let cardSubline = "";

  if (streakCount > 0 && (drilledToday || drilledYesterday)) {
    cardTitle = `${streakCount} Day Streak 🔥`;
    cardSubline = "Keep it going today.";
  } else if (streakCount > 0 && !drilledYesterday) {
    cardTitle = "Don't break your streak.";
    cardSubline = `You've drilled ${streakCount} days. One session keeps it alive.`;
  } else {
    cardTitle = "Welcome back.";
    cardSubline = `You've done ${totalSessions} drills. Ready for another?`;
  }

  return (
    <div className="flex-1 flex flex-col px-6">
      {/* Accountability card */}
      <div className="w-full max-w-[460px] mx-auto rounded-2xl bg-card border border-border p-5 mb-6">
        <h2 className="font-serif text-[1.1rem] text-foreground mb-1"
          style={{ color: streakCount > 0 && !drilledYesterday && !drilledToday ? "hsl(var(--accent))" : undefined }}
        >
          {cardTitle}
        </h2>
        <p className="text-[13px] text-muted-foreground mb-4">{cardSubline}</p>

        <div className="flex gap-2 mb-3">
          {dayCircles.map((dc, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: dc.drilled ? "hsl(var(--primary))" : "hsl(var(--border))",
                animation: dc.isToday && streakCount > 0 && !drilledToday ? "pulse 2s infinite" : undefined,
                border: dc.isToday && streakCount > 0 && !drilledToday ? "2px solid hsl(var(--accent))" : undefined,
              }}
            />
          ))}
        </div>

        {lastSession && lastAvg !== null && (
          <p className="text-xs text-muted-foreground">
            Last drill: {lastSession.context} · {lastAvg}/10
          </p>
        )}
      </div>

      <div className="w-full max-w-[460px] mx-auto">
        <Link
          to="/input"
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
        >
          Start Today's Drill
        </Link>
        <Link to="/progress" className="mt-4 text-[13px] text-muted-foreground underline text-center block">
          View Progress
        </Link>
      </div>
    </div>
  );
}
