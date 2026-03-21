import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { concepts, progress, loadingData } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const isReturning = progress.total_sessions > 0;

  const dueConcepts = concepts.filter(c => c.next_practice_date <= today);

  if (loadingData) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isReturning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-[2.4rem] leading-[1.1] tracking-[-1px] text-foreground mb-3 animate-fade-up stagger-1">
          You know more than<br />you can explain.
        </h1>
        <p className="text-[15px] font-sans text-ink-3 mb-2 animate-fade-up stagger-2">
          Paste anything you're reading.<br />We'll do the rest.
        </p>
        <p className="text-[13px] font-sans text-accent mb-8 animate-fade-up stagger-3">
          Takes about 5 minutes.
        </p>

        <Link
          to="/input"
          className="w-full max-w-[460px] rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] text-center block animate-fade-up stagger-4"
        >
          Start practicing
        </Link>
        <Link to="/progress" className="mt-4 text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] animate-fade-up stagger-5">
          See my progress
        </Link>
      </div>
    );
  }

  // Returning user
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const practisedToday = progress.last_practice_date === today;
  const practisedYesterday = progress.last_practice_date === yesterday;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  return (
    <div className="flex-1 flex flex-col px-6">
      {/* Greeting + streak */}
      <div className="mb-6 animate-fade-up stagger-1">
        <h1 className="font-serif text-[2rem] text-foreground mb-1">{greeting}</h1>
        {progress.current_streak > 0 && (
          <p className="font-serif text-[72px] text-foreground leading-none mb-1">
            {progress.current_streak}
          </p>
        )}
        {progress.current_streak > 0 && (
          <p className="text-[13px] font-sans text-ink-3">
            {practisedToday ? "Day streak. Nice." : practisedYesterday ? "Day streak. Keep it going today." : "Day streak. One session keeps it alive."}
          </p>
        )}
      </div>

      {/* 7 day track */}
      {progress.current_streak > 0 && (
        <div className="flex gap-2 mb-6 animate-fade-up stagger-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split("T")[0];
            const done = progress.last_practice_date ? dateStr <= progress.last_practice_date : false;
            const isToday = dateStr === today && !practisedToday;
            return (
              <div
                key={i}
                className="w-7 h-7 rounded-pill transition-colors duration-[180ms]"
                style={{
                  background: done ? "hsl(var(--accent))" : "hsl(var(--border))",
                  border: isToday && progress.current_streak > 0 ? "2px solid hsl(var(--amber-bright))" : undefined,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Due concepts */}
      {dueConcepts.length > 0 && (
        <div className="w-full max-w-[460px] mx-auto mb-6">
          {dueConcepts.slice(0, 3).map((concept, idx) => (
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
              className={`w-full text-left bg-card rounded-[22px] border-[1.5px] border-border p-6 mb-3 hover:border-accent hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-[180ms] animate-fade-up stagger-${idx + 3}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-pill text-[11px] font-sans font-semibold uppercase tracking-[0.1em] bg-accent-pale text-accent">
                  Rep {concept.practice_count + 1}
                </span>
                <span className="text-[11px] font-sans text-ink-3">{concept.topic_snippet}</span>
              </div>
              <p className="font-serif text-[16px] text-ink-2 mb-2">{concept.key_idea.slice(0, 80)}{concept.key_idea.length > 80 ? "…" : ""}</p>
              <p className="text-[13px] font-sans text-accent font-medium">Pick up where you left off →</p>
            </button>
          ))}
        </div>
      )}

      <div className="w-full max-w-[460px] mx-auto animate-fade-up stagger-6">
        <Link
          to="/input"
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] text-center block"
        >
          New session
        </Link>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/library" className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
            Library
          </Link>
          <Link to="/progress" className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
            Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
