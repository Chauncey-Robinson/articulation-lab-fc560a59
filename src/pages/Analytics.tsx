import { Link } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";

export default function Analytics() {
  const { modules, progress } = useTutor();

  const totalLessons = modules.reduce((acc, m) => acc + m.lesson_count, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completed_lessons, 0);
  const completedModules = modules.filter(m => m.status === "completed").length;

  let streakCopy = "";
  if (progress.current_streak === 0) {
    streakCopy = "Start your first session today.";
  } else if (progress.current_streak <= 6) {
    streakCopy = "You're building something. Keep going.";
  } else if (progress.current_streak <= 29) {
    streakCopy = `${progress.current_streak} days straight. This is becoming a habit.`;
  } else {
    streakCopy = `${progress.current_streak} days. Unstoppable.`;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <Link to="/dashboard" className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 inline-block">←</Link>

      <div className="max-w-[460px] mx-auto w-full">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Your progress.</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-8 animate-fade-up stagger-2">{streakCopy}</p>

        {progress.total_sessions === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] font-sans text-ink-3 mb-6">Complete a session to see your stats.</p>
            <Link to="/upload" className="inline-block rounded-pill bg-primary px-8 py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Upload material
            </Link>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-2">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{modules.length}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-3">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{progress.current_streak}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">day streak</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-4">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedLessons}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">lessons done</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-5">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedModules}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules mastered</p>
              </div>
            </div>

            {/* Module progress list */}
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-6">MODULE BREAKDOWN</p>
            {modules.map((mod, idx) => (
              <div key={mod.id} className="bg-card rounded-[16px] border-[1.5px] border-border p-4 mb-3 animate-fade-up" style={{ animationDelay: `${(idx + 6) * 65}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-sans font-medium text-foreground">{mod.title}</h3>
                  <span className="text-[12px] font-sans text-ink-3">{mod.completed_lessons}/{mod.lesson_count}</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-pill">
                  <div className="h-full bg-accent rounded-pill transition-all" style={{ width: `${mod.lesson_count > 0 ? (mod.completed_lessons / mod.lesson_count) * 100 : 0}%` }} />
                </div>
              </div>
            ))}

            {/* Longest streak */}
            {progress.longest_streak > 0 && (
              <div className="bg-accent-bright/10 rounded-[16px] border-[1.5px] border-accent-bright/30 p-5 mt-4 text-center animate-fade-up stagger-7">
                <p className="text-[12px] font-sans text-accent-bright font-semibold uppercase tracking-[0.1em] mb-1">LONGEST STREAK</p>
                <p className="font-serif text-[2rem] text-foreground">{progress.longest_streak} days</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
