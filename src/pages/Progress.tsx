import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Progress() {
  const { concepts, progress } = useApp();

  const practicingCount = concepts.filter(c => c.status !== "solid").length;

  let streakCopy = "";
  if (progress.current_streak === 0) {
    streakCopy = "Start your first practice today.";
  } else if (progress.current_streak <= 6) {
    streakCopy = "You're building something. Keep going.";
  } else if (progress.current_streak <= 29) {
    streakCopy = `${progress.current_streak} days straight. This is becoming a habit.`;
  } else {
    streakCopy = `${progress.current_streak} days. You explain things better than most people in any room.`;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="max-w-[460px] mx-auto w-full">
        <Link to="/home" className="text-base text-muted-foreground hover:text-foreground mb-6 inline-block">←</Link>

        <h1 className="font-serif text-[1.8rem] text-foreground mb-8">How you're doing</h1>

        {progress.total_sessions === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-6">Complete a practice to see how you're getting on.</p>
            <Link
              to="/input"
              className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start practising
            </Link>
          </div>
        ) : (
          <>
            {/* Three numbers */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-card p-5 text-center">
                <p className="font-serif text-[2rem] text-accent">{practicingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">concepts practicing</p>
              </div>
              <div className="rounded-lg bg-card p-5 text-center">
                <p className="font-serif text-[2rem] text-accent">{progress.current_streak}</p>
                <p className="text-xs text-muted-foreground mt-1">day streak</p>
              </div>
              <div className="rounded-lg bg-card p-5 text-center">
                <p className="font-serif text-[2rem] text-accent">{progress.total_sessions}</p>
                <p className="text-xs text-muted-foreground mt-1">practices total</p>
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground text-center mb-8">{streakCopy}</p>

            {/* Library link */}
            <div className="rounded-lg bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Your explanations</p>
                <Link to="/library" className="text-[13px] text-accent underline">
                  {concepts.length} saved →
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The clearest thing you said in each practice.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
