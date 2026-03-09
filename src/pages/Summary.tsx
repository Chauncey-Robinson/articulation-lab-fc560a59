import { useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

export default function Summary() {
  const { summary, contextLabel, muted, progress, concepts, notificationPromptShown, setNotificationPromptShown, painAsked, setSource, toggleMute, currentConceptId } = useApp();
  const { speak } = useTTS();
  const navigate = useNavigate();
  const location = useLocation();
  const isColdRecall = (location.state as any)?.isColdRecall;

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
    if (progress.total_sessions === 1 && !notificationPromptShown && summary) {
      const timer = setTimeout(() => {
        navigate("/notifications");
        setNotificationPromptShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress.total_sessions, notificationPromptShown, summary, navigate, setNotificationPromptShown]);

  // After first practice, redirect to pain selection if not asked yet
  useEffect(() => {
    if (progress.total_sessions === 1 && !painAsked && summary && notificationPromptShown) {
      const timer = setTimeout(() => navigate("/pain-selection"), 4000);
      return () => clearTimeout(timer);
    }
  }, [progress.total_sessions, painAsked, summary, notificationPromptShown, navigate]);

  if (!summary) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">No data yet. Start a practice first.</p>
        <Link to="/home" className="mt-4 inline-block text-sm text-accent hover:underline">Go Home</Link>
      </div>
    );
  }

  // Calculate next practice date for the current concept
  const currentConcept = concepts.find(c => c.id === currentConceptId);
  const nextPracticeDate = currentConcept?.next_practice_date;
  const daysUntilNext = nextPracticeDate
    ? Math.ceil((new Date(nextPracticeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 3;

  // Cold recall result messaging
  const avgScore = (summary.clarity + summary.example + summary.held_together) / 3;
  const coldRecallMessage = isColdRecall
    ? avgScore >= 4
      ? "You've got this one. We'll check back in 3 weeks."
      : "No problem. We'll do one more round soon."
    : null;

  // Streak nudge
  let nudge = "";
  if (progress.current_streak >= 7) {
    nudge = `🔥 ${progress.current_streak} days in a row. That's a real habit.`;
  } else if (progress.current_streak >= 3) {
    nudge = `🔥 ${progress.current_streak} days in a row. Come back tomorrow.`;
  } else if (progress.current_streak === 2) {
    nudge = "Day 2. Come back tomorrow — day 3 is where it starts to feel different.";
  } else if (progress.total_sessions === 1) {
    nudge = "First one done. The second one is easier.";
  } else if (progress.current_streak === 1) {
    nudge = "Good to be back. Come back tomorrow.";
  }

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

        {/* Summary card — 3 fields only */}
        <div className="rounded-2xl bg-card overflow-hidden mb-4">
          <Row label="WHAT WORKED" value={summary.what_worked} />
          <Row label="ONE THING TO SHARPEN" value={summary.work_on_next} />
          <div className="px-5 py-4" style={{ background: "hsl(var(--meeting-card))" }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">
              SAY IT TOMORROW
            </p>
            <p className="text-sm italic leading-relaxed" style={{ color: "hsl(var(--meeting-text))" }}>
              "{summary.say_tomorrow}"
              <button onClick={replaySayTomorrow} className="ml-2 text-xs text-accent hover:opacity-80">
                ↺
              </button>
            </p>
          </div>
        </div>

        {/* Spaced return info */}
        <p className="text-[13px] text-muted-foreground text-center mb-2">
          Good practice. You'll see this again in {daysUntilNext} days.
        </p>

        {coldRecallMessage && (
          <p className="text-[13px] text-accent text-center mb-2">{coldRecallMessage}</p>
        )}

        <p className="text-[13px] text-foreground text-center mb-6">
          Day {progress.current_streak} of your practice streak 🔥
        </p>

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
