import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Progress() {
  const { concepts, progress } = useApp();

  const practicingCount = concepts.filter(c => c.status !== "solid").length;

  let streakCopy = "";
  if (progress.current_streak === 0) {
    streakCopy = "Start your first session today.";
  } else if (progress.current_streak <= 6) {
    streakCopy = "You're building something. Keep going.";
  } else if (progress.current_streak <= 29) {
    streakCopy = `${progress.current_streak} days straight. This is becoming a habit.`;
  } else {
    streakCopy = `${progress.current_streak} days. You explain things better than most people in any room.`;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="max-w-[640px] mx-auto w-full">
        <Link to="/home" className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] mb-6 inline-block">←</Link>

        <h1 className="font-serif text-[2rem] text-foreground mb-10 animate-fade-up stagger-1">How you're doing.</h1>

        {progress.total_sessions === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] font-sans text-ink-3 mb-6">Complete a session to see how you're getting on.</p>
            <Link
              to="/input"
              className="inline-block rounded-pill bg-primary px-8 py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms]"
            >
              Start practicing
            </Link>
          </div>
        ) : (
          <>
            {/* Three numbers */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 text-center animate-fade-up stagger-2">
                <p className="font-serif text-[3rem] leading-none text-foreground">{practicingCount}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">concepts</p>
              </div>
              <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 text-center animate-fade-up stagger-3">
                <p className="font-serif text-[3rem] leading-none text-foreground">{progress.current_streak}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">day streak</p>
              </div>
              <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 text-center animate-fade-up stagger-4">
                <p className="font-serif text-[3rem] leading-none text-foreground">{progress.total_sessions}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">sessions</p>
              </div>
            </div>

            <p className="text-[14px] font-sans text-ink-3 text-center mb-10 animate-fade-up stagger-5">{streakCopy}</p>

            {/* Library link */}
            <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 animate-fade-up stagger-6">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-sans font-medium text-foreground">Your library</p>
                <Link to="/library" className="text-[13px] font-sans text-accent font-medium hover:underline">
                  {concepts.length} concepts →
                </Link>
              </div>
              <p className="text-[12px] font-sans text-ink-3 mt-1">
                Every concept you've trained, ready to revisit.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
