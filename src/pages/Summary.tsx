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
        <p className="text-[14px] font-sans text-ink-3">No data yet. Start a practice first.</p>
        <Link to="/home" className="mt-4 inline-block text-[14px] font-sans text-accent hover:underline">Go Home</Link>
      </div>
    );
  }

  const currentConcept = concepts.find(c => c.id === currentConceptId);
  const nextPracticeDate = currentConcept?.next_practice_date;
  const daysUntilNext = nextPracticeDate
    ? Math.ceil((new Date(nextPracticeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 3;

  const avgScore = (summary.clarity + summary.example + summary.held_together) / 3;
  const coldRecallMessage = isColdRecall
    ? avgScore >= 4
      ? "You've got this one. We'll check back in 3 weeks."
      : "No problem. We'll do one more round soon."
    : null;

  const handlePracticeAgain = () => {
    setSource("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/home")} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">←</button>
        <button onClick={toggleMute} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[640px] mx-auto w-full">
        <h1 className="font-serif text-[2rem] text-foreground mb-1 animate-fade-up stagger-1">Nice work.</h1>
        <p className="text-[13px] font-sans text-ink-3 mb-7 animate-fade-up stagger-1">{contextLabel} · explained twice</p>

        {/* Summary card — 3 fields only */}
        <div className="bg-card rounded-[22px] border-[1.5px] border-border overflow-hidden mb-5 animate-fade-up stagger-2">
          {/* What worked */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sage text-[14px]">✓</span>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3">WHAT LANDED</p>
            </div>
            <p className="font-serif text-[17px] font-light leading-[1.6] text-ink-2">{summary.what_worked}</p>
          </div>

          {/* What to sharpen */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent text-[14px]">→</span>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3">WHAT TO SHARPEN</p>
            </div>
            <p className="font-serif text-[17px] font-light leading-[1.6] text-ink-2">{summary.work_on_next}</p>
          </div>

          {/* Say it tomorrow */}
          <div className="px-6 py-5 bg-surface-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent-bright text-[14px]">↗</span>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3">SAY THIS NEXT TIME</p>
            </div>
            <p className="font-serif text-[17px] italic leading-[1.6] text-foreground">
              "{summary.say_tomorrow}"
              <button onClick={replaySayTomorrow} className="ml-2 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
                ↺
              </button>
            </p>
          </div>
        </div>

        {/* Saved to library */}
        <div className="flex items-center gap-2 justify-center mb-2 animate-fade-up stagger-3">
          <span className="w-2 h-2 rounded-full bg-sage sage-pulse" />
          <p className="text-[13px] font-sans text-ink-3">
            Saved to your library
          </p>
        </div>

        {/* Spaced return info */}
        <p className="text-[13px] font-sans text-ink-3 text-center mb-2 animate-fade-up stagger-4">
          Good session. You'll see this again in {daysUntilNext} days.
        </p>

        {coldRecallMessage && (
          <p className="text-[13px] font-sans text-accent text-center mb-2 animate-fade-up stagger-4">{coldRecallMessage}</p>
        )}

        <p className="text-[14px] font-sans font-medium text-foreground text-center mb-8 animate-fade-up stagger-5">
          Day {progress.current_streak} of your practice streak 🔥
        </p>

        <div className="flex flex-col gap-3 mt-2 animate-fade-up stagger-6">
          <Link
            to="/input"
            onClick={handlePracticeAgain}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] text-center block"
          >
            Next concept →
          </Link>
          <Link
            to="/home"
            className="w-full rounded-pill border-[1.5px] border-border bg-card py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all duration-[180ms] text-center block"
          >
            Back to training
          </Link>
        </div>
      </div>
    </div>
  );
}
