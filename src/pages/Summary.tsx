import { useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

export default function Summary() {
  const { summary, contextLabel, muted, sessions, streakCount, totalPractices, notificationPromptShown, setNotificationPromptShown, setSource, toggleMute } = useApp();
  const { speak } = useTTS();
  const navigate = useNavigate();

  const replaySayTomorrow = useCallback(() => {
    if (summary?.say_tomorrow) speak(summary.say_tomorrow);
  }, [summary, speak]);

  // Auto-read say_tomorrow after 600ms
  useEffect(() => {
    if (!summary?.say_tomorrow || muted) return;
    const timer = setTimeout(() => {
      speak(`Here is something you can say tomorrow: ${summary.say_tomorrow}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [summary, muted, speak]);

  // Show notification prompt after first practice
  useEffect(() => {
    if (totalPractices === 1 && !notificationPromptShown && summary) {
      const timer = setTimeout(() => {
        navigate("/notifications");
        setNotificationPromptShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [totalPractices, notificationPromptShown, summary, navigate, setNotificationPromptShown]);

  if (!summary) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">No data yet. Start a practice first.</p>
        <Link to="/home" className="mt-4 inline-block text-sm text-accent hover:underline">Go Home</Link>
      </div>
    );
  }

  // Nudge logic
  let nudge = "";
  if (streakCount >= 7) {
    nudge = `🔥 ${streakCount} days in a row. That's a real habit.`;
  } else if (streakCount >= 3) {
    nudge = `🔥 ${streakCount} days in a row. Come back tomorrow.`;
  } else if (streakCount === 2) {
    nudge = "Day 2. Come back tomorrow — day 3 is where it starts to feel different.";
  } else if (totalPractices === 1) {
    nudge = "First one done. The second one is easier.";
  } else if (streakCount === 1) {
    nudge = "Good to be back. Come back tomorrow.";
  }

  // Library data
  const recentExplanations = sessions.slice(-3).reverse();

  const handlePracticeAgain = () => {
    setSource("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/home")} className="text-base text-muted-foreground hover:text-foreground">←</button>
        <button onClick={toggleMute} className="text-base text-muted-foreground hover:text-foreground">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[460px] mx-auto w-full">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-1">Nice work.</h1>
        <p className="text-[13px] text-muted-foreground mb-7">{contextLabel} · explained twice</p>

        {/* Summary card */}
        <div className="rounded-2xl bg-card overflow-hidden mb-4">
          <Row label="WHAT WORKED" value={summary.what_worked} />
          <Row label="WORK ON NEXT TIME" value={summary.work_on_next} />
          <div className="px-5 py-4" style={{ background: "hsl(var(--meeting-card))" }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">
              TRY SAYING THIS
            </p>
            <p className="text-sm italic leading-relaxed" style={{ color: "hsl(var(--meeting-text))" }}>
              "{summary.say_tomorrow}"
              <button onClick={replaySayTomorrow} className="ml-2 text-xs text-accent hover:opacity-80">
                ↺
              </button>
            </p>
          </div>
        </div>

        {/* Personal Library Card */}
        <div className="rounded-lg p-5 mb-4 bg-section">
          <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-2">YOUR EXPLANATIONS</p>
          {totalPractices === 1 ? (
            <>
              <p className="text-sm text-foreground leading-[1.6] mb-2">
                Every time you practice, we save the best way you've learned to explain something. Over time this becomes yours.
              </p>
              <p className="text-[13px] text-accent">1 explanation saved →</p>
            </>
          ) : (
            <>
              {recentExplanations.slice(0, totalPractices <= 4 ? 2 : 3).map((s, i) => (
                <div key={i} className="py-2" style={{ borderBottom: i < recentExplanations.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
                  <p className="text-[11px] text-muted-foreground mb-1">{s.topic_snippet}</p>
                  <p className="text-[13px] text-foreground italic">"{s.say_tomorrow}"</p>
                </div>
              ))}
              <Link to="/library" className="text-xs text-accent underline mt-2 inline-block">
                See all {totalPractices} →
              </Link>
            </>
          )}
        </div>

        {/* Accountability nudge */}
        {nudge && (
          <p className="text-[13px] text-muted-foreground text-center mb-6">{nudge}</p>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <Link
            to="/input"
            onClick={handlePracticeAgain}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
          >
            Practice something else
          </Link>
          <Link
            to="/progress"
            className="w-full rounded-full border border-border bg-secondary py-4 text-sm font-medium text-secondary-foreground hover:opacity-90 transition-opacity text-center block"
          >
            See my progress
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--block-empty))" }}>
      <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
