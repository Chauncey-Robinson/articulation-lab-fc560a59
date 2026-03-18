import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";

export default function Analytics() {
  const { modules, progress } = useTutor();
  const { user } = useAuth();
  const [quizStats, setQuizStats] = useState({ total: 0, correct: 0 });
  const [teachBackScore, setTeachBackScore] = useState<number | null>(null);
  const [applyScore, setApplyScore] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("quiz_attempts").select("is_correct").eq("user_id", user.id);
      if (data) {
        setQuizStats({
          total: data.length,
          correct: data.filter((a: any) => a.is_correct).length,
        });
      }

      // Load teach-back and apply scores from localStorage
      const tbScores = JSON.parse(localStorage.getItem("tutor_teachback_scores") || "[]");
      if (tbScores.length > 0) {
        setTeachBackScore(Math.round(tbScores.reduce((a: number, b: number) => a + b, 0) / tbScores.length));
      }
      const apScores = JSON.parse(localStorage.getItem("tutor_apply_scores") || "[]");
      if (apScores.length > 0) {
        setApplyScore(Math.round(apScores.reduce((a: number, b: number) => a + b, 0) / apScores.length));
      }
    })();
  }, [user]);

  const totalLessons = modules.reduce((acc, m) => acc + m.lesson_count, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completed_lessons, 0);
  const completedModules = modules.filter(m => m.status === "completed").length;
  const quizRate = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : null;

  // Average % of three steps
  const scores = [quizRate, teachBackScore, applyScore].filter(s => s !== null) as number[];
  const avgRetention = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Gap identification: modules with low completion
  const moduleGaps = modules.filter(m => {
    const completion = m.lesson_count > 0 ? m.completed_lessons / m.lesson_count : 0;
    return completion < 1 && completion > 0;
  });

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

        {progress.total_sessions === 0 && quizStats.total === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] font-sans text-ink-3 mb-6">Complete a session to see your stats.</p>
            <Link to="/upload" className="inline-block rounded-pill bg-primary px-8 py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Upload material
            </Link>
          </div>
        ) : (
          <>
            {/* Overall knowledge retention — avg of 3 steps */}
            {avgRetention !== null && (
              <div className="bg-card rounded-[20px] border-[1.5px] border-border p-6 mb-6 text-center animate-fade-up stagger-2">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">KNOWLEDGE RETENTION</p>
                <p className="font-serif text-[3.5rem] leading-none text-foreground">{avgRetention}%</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">Average across all test types</p>
              </div>
            )}

            {/* Three-step breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center animate-fade-up stagger-3">
                <p className="text-[16px] mb-1">🧪</p>
                <p className="font-serif text-[1.8rem] leading-none text-foreground">{quizRate !== null ? `${quizRate}%` : "—"}</p>
                <p className="text-[10px] font-sans text-ink-3 mt-1">Quiz</p>
              </div>
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center animate-fade-up stagger-3">
                <p className="text-[16px] mb-1">🎙️</p>
                <p className="font-serif text-[1.8rem] leading-none text-foreground">{teachBackScore !== null ? `${teachBackScore}%` : "—"}</p>
                <p className="text-[10px] font-sans text-ink-3 mt-1">Teach Back</p>
              </div>
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center animate-fade-up stagger-3">
                <p className="text-[16px] mb-1">🌍</p>
                <p className="font-serif text-[1.8rem] leading-none text-foreground">{applyScore !== null ? `${applyScore}%` : "—"}</p>
                <p className="text-[10px] font-sans text-ink-3 mt-1">Apply</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-4">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{modules.length}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-4">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{progress.current_streak}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">day streak</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-5">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedLessons}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">lessons done</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-5">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedModules}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules mastered</p>
              </div>
            </div>

            {/* Gap identification */}
            {moduleGaps.length > 0 && (
              <div className="mb-6 animate-fade-up stagger-6">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">GAP IDENTIFICATION</p>
                <p className="text-[12px] font-sans text-ink-3 mb-3">These areas need more focus. The app adapts your learning journey based on gaps.</p>
                {moduleGaps.map(mod => {
                  const pct = mod.lesson_count > 0 ? Math.round((mod.completed_lessons / mod.lesson_count) * 100) : 0;
                  return (
                    <Link key={mod.id} to={`/module/${mod.id}`}
                      className="block bg-accent-bright/8 rounded-[14px] border-[1.5px] border-accent-bright/20 px-4 py-3 mb-2 hover:border-accent-bright/40 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[13px] font-sans font-medium text-foreground">{mod.title}</h3>
                        <span className="text-[12px] font-sans text-accent-bright">{pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-border rounded-pill">
                        <div className="h-full bg-accent-bright rounded-pill" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Module breakdown */}
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
