import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Home() {
  const { concepts, progress, loadingData } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const isReturning = progress.total_sessions > 0;

  // Find concepts due for practice
  const dueConcepts = concepts.filter(c => c.next_practice_date <= today);

  if (loadingData) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

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
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const practisedToday = progress.last_practice_date === today;
  const practisedYesterday = progress.last_practice_date === yesterday;

  let cardTitle = "";
  let cardSubline = "";

  if (progress.current_streak > 0 && (practisedToday || practisedYesterday)) {
    cardTitle = `${progress.current_streak} days in a row 🔥`;
    cardSubline = "Keep it going today.";
  } else if (progress.current_streak > 0 && !practisedYesterday) {
    cardTitle = `You've done ${progress.current_streak} days in a row.`;
    cardSubline = "One practice keeps it going.";
  } else {
    cardTitle = "Good to see you back.";
    cardSubline = `You've done ${progress.total_sessions} practices. Ready for one more?`;
  }

  return (
    <div className="flex-1 flex flex-col px-6">
      {/* Accountability card */}
      <div className="w-full max-w-[460px] mx-auto rounded-2xl bg-card p-5 mb-6">
        <h2 className="font-serif text-[1.1rem] text-foreground mb-1"
          style={{ color: progress.current_streak > 0 && !practisedYesterday && !practisedToday ? "hsl(var(--accent))" : undefined }}
        >
          {cardTitle}
        </h2>
        <p className="text-[13px] text-muted-foreground mb-4">{cardSubline}</p>

        {/* 7 day circles */}
        <div className="flex gap-2 mb-3">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split("T")[0];
            const done = progress.last_practice_date ? dateStr <= progress.last_practice_date : false;
            const isToday = dateStr === today && !practisedToday;
            return (
              <div
                key={i}
                className="w-7 h-7 rounded-full"
                style={{
                  background: done ? "hsl(var(--primary))" : "hsl(var(--border))",
                  animation: isToday && progress.current_streak > 0 && !practisedToday ? "pulse 2s infinite" : undefined,
                  border: isToday && progress.current_streak > 0 && !practisedToday ? "2px solid hsl(var(--accent))" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Due concepts */}
      {dueConcepts.length > 0 && (
        <div className="w-full max-w-[460px] mx-auto mb-6">
          {dueConcepts.slice(0, 3).map(concept => (
            <button
              key={concept.id}
              onClick={() => navigate("/practice", {
                state: {
                  source: concept.source_content,
                  conceptId: concept.id,
                  keyIdea: concept.key_idea,
                  practiceCount: concept.practice_count,
                }
              })}
              className="w-full text-left rounded-lg bg-card p-4 mb-3 border border-border hover:border-selected-border transition-colors"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-accent mb-1">READY TO PRACTICE</p>
              <p className="text-sm text-foreground mb-1">{concept.topic_snippet}</p>
              <p className="text-xs text-accent">Pick up where you left off →</p>
            </button>
          ))}
        </div>
      )}

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
