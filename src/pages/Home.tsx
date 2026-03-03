import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Home() {
  const { sessions, streakCount, lastPracticeDate, totalPractices, lastTopicSnippet, setSource } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const practisedToday = lastPracticeDate === today;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const practisedYesterday = lastPracticeDate === yesterday;
  const isReturning = totalPractices > 0;

  if (!isReturning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-[2.4rem] leading-[1.2] text-foreground mb-3 whitespace-pre-line">
          {"You know more than\nyou can explain."}
        </h1>
        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
          {"Paste anything you're reading.\nWe'll do the rest."}
        </p>
        <p className="text-xs text-accent mb-8">
          Takes about 5 minutes.
        </p>

        <Link
          to="/input"
          className="w-full max-w-[460px] rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
        >
          Start practising
        </Link>
        <Link to="/progress" className="mt-4 text-[13px] text-muted-foreground underline">
          See my progress
        </Link>
      </div>
    );
  }

  // Returning user
  const dayCircles = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const done = sessions.some((s) => s.date === dateStr);
    const isToday = dateStr === today && !practisedToday;
    return { done, isToday };
  });

  let cardTitle = "";
  let cardSubline = "";

  if (streakCount > 0 && (practisedToday || practisedYesterday)) {
    cardTitle = `${streakCount} days in a row 🔥`;
    cardSubline = "Keep it going today.";
  } else if (streakCount > 0 && !practisedYesterday) {
    cardTitle = `You've done ${streakCount} days in a row.`;
    cardSubline = "One practice keeps it going.";
  } else {
    cardTitle = "Good to see you back.";
    cardSubline = `You've done ${totalPractices} practices. Ready for one more?`;
  }

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const handlePickUp = () => {
    if (lastTopicSnippet) setSource(lastTopicSnippet);
  };

  return (
    <div className="flex-1 flex flex-col px-6">
      {/* Accountability card */}
      <div className="w-full max-w-[460px] mx-auto rounded-2xl bg-card p-5 mb-6">
        <h2 className="font-serif text-[1.1rem] text-foreground mb-1"
          style={{ color: streakCount > 0 && !practisedYesterday && !practisedToday ? "hsl(var(--accent))" : undefined }}
        >
          {cardTitle}
        </h2>
        <p className="text-[13px] text-muted-foreground mb-4">{cardSubline}</p>

        <div className="flex gap-2 mb-3">
          {dayCircles.map((dc, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full"
              style={{
                background: dc.done ? "hsl(var(--primary))" : "hsl(var(--border))",
                animation: dc.isToday && streakCount > 0 && !practisedToday ? "pulse 2s infinite" : undefined,
                border: dc.isToday && streakCount > 0 && !practisedToday ? "2px solid hsl(var(--accent))" : undefined,
              }}
            />
          ))}
        </div>

        {/* Divider + last topic */}
        {lastSession && (
          <>
            <div className="h-px my-3" style={{ background: "hsl(var(--block-empty))" }} />
            <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">LAST TIME</p>
            <p className="text-[13px] text-foreground mb-1">
              {lastSession.topic_snippet}
            </p>
            {lastTopicSnippet && (
              <Link
                to="/input"
                onClick={handlePickUp}
                className="text-xs text-accent underline"
              >
                Pick this up again →
              </Link>
            )}
          </>
        )}
      </div>

      <div className="w-full max-w-[460px] mx-auto">
        <Link
          to="/input"
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
        >
          Start practising
        </Link>
        <Link to="/progress" className="mt-4 text-[13px] text-muted-foreground underline text-center block">
          See my progress
        </Link>
      </div>
    </div>
  );
}
