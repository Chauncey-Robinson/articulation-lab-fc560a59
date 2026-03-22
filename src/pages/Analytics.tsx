import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";

interface ConceptRow {
  status: string;
  next_practice_date: string;
}

export default function Analytics() {
  const { modules, progress } = useTutor();
  const { user } = useAuth();
  const [concepts, setConcepts] = useState<ConceptRow[]>([]);
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

  const scores = [quizRate, teachBackScore, applyScore].filter(s => s !== null) as number[];
  const avgRetention = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const moduleGaps = modules.filter(m => {
    const completion = m.lesson_count > 0 ? m.completed_lessons / m.lesson_count : 0;
    return completion < 1 && completion > 0;
  });

  // Concept stage breakdown (like Vocabuo's vocabulary size)
  const conceptStages = useMemo(() => {
    const practicing = concepts.filter(c => c.status === "practicing").length;
    const getting_there = concepts.filter(c => c.status === "getting_there").length;
    const solid = concepts.filter(c => c.status === "solid").length;
    const total = concepts.length;
    return { practicing, getting_there, solid, total };
  }, [concepts]);

  // Spaced repetition schedule (concepts due in next 7 days)
  const repetitionSchedule = useMemo(() => {
    const today = new Date();
    const schedule: { label: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const count = concepts.filter(c => c.next_practice_date === dateStr).length;
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${i} days`;
      schedule.push({ label, count });
    }
    return schedule;
  }, [concepts]);

  const maxScheduleCount = Math.max(...repetitionSchedule.map(s => s.count), 1);

  // Streak visualization (last 7 days)
  const streakDays = useMemo(() => {
    const days: { label: string; active: boolean }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-GB", { weekday: "short" });
      // A day is "active" if it's within the current streak counting back from today
      const daysAgo = i;
      const active = progress.current_streak > daysAgo;
      days.push({ label: dayLabel, active });
    }
    return days;
  }, [progress.current_streak]);

  // Flashcard session history
  const flashcardSessions = useMemo(() => {
    return JSON.parse(localStorage.getItem("flashcard_sessions") || "[]");
  }, []);

  const avgFlashcardAccuracy = useMemo(() => {
    if (flashcardSessions.length === 0) return null;
    const total = flashcardSessions.reduce((a: number, s: any) => a + (s.accuracy || 0), 0);
    return Math.round(total / flashcardSessions.length);
  }, [flashcardSessions]);

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

        {progress.total_sessions === 0 && quizStats.total === 0 && concepts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] font-sans text-ink-3 mb-6">Complete a session to see your stats.</p>
            <Link to="/upload" className="inline-block rounded-pill bg-primary px-8 py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Upload material
            </Link>
          </div>
        ) : (
          <>
            {/* Streak visualization */}
            <div className="bg-card rounded-[20px] border-[1.5px] border-border p-5 mb-4 animate-fade-up stagger-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3">STREAK</p>
                <p className="text-[13px] font-sans font-medium text-foreground">🔥 {progress.current_streak} day{progress.current_streak !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2 justify-between">
                {streakDays.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] transition-all ${
                      d.active ? "bg-accent text-primary-foreground" : "bg-border/50 text-ink-3"
                    }`}>
                      {d.active ? "✓" : "·"}
                    </div>
                    <span className="text-[10px] font-sans text-ink-3">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge retention */}
            {avgRetention !== null && (
              <div className="bg-card rounded-[20px] border-[1.5px] border-border p-6 mb-4 text-center animate-fade-up stagger-3">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">KNOWLEDGE RETENTION</p>
                <p className="font-serif text-[3.5rem] leading-none text-foreground">{avgRetention}%</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">Average across all test types</p>
              </div>
            )}

            {/* Three-step breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { emoji: "🧪", score: quizRate, label: "Quiz" },
                { emoji: "🎙️", score: teachBackScore, label: "Teach Back" },
                { emoji: "🌍", score: applyScore, label: "Apply" },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center animate-fade-up stagger-3">
                  <p className="text-[16px] mb-1">{s.emoji}</p>
                  <p className="font-serif text-[1.8rem] leading-none text-foreground">{s.score !== null ? `${s.score}%` : "—"}</p>
                  <p className="text-[10px] font-sans text-ink-3 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Flashcard stats */}
            {avgFlashcardAccuracy !== null && (
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 mb-4 animate-fade-up stagger-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-1">FLASHCARD ACCURACY</p>
                    <p className="text-[12px] font-sans text-ink-3">{flashcardSessions.length} session{flashcardSessions.length !== 1 ? "s" : ""}</p>
                  </div>
                  <p className="font-serif text-[2rem] leading-none text-foreground">{avgFlashcardAccuracy}%</p>
                </div>
              </div>
            )}

            {/* Concept stage breakdown */}
            {conceptStages.total > 0 && (
              <div className="bg-card rounded-[20px] border-[1.5px] border-border p-5 mb-4 animate-fade-up stagger-4">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">YOUR CONCEPT LIBRARY</p>
                {/* Stacked bar */}
                <div className="w-full h-3 bg-border rounded-pill flex overflow-hidden mb-3">
                  {conceptStages.solid > 0 && (
                    <div className="h-full bg-sage transition-all" style={{ width: `${(conceptStages.solid / conceptStages.total) * 100}%` }} />
                  )}
                  {conceptStages.getting_there > 0 && (
                    <div className="h-full bg-accent transition-all" style={{ width: `${(conceptStages.getting_there / conceptStages.total) * 100}%` }} />
                  )}
                  {conceptStages.practicing > 0 && (
                    <div className="h-full bg-accent-bright transition-all" style={{ width: `${(conceptStages.practicing / conceptStages.total) * 100}%` }} />
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-sage" />
                    <span className="text-[11px] font-sans text-ink-3">Solid · <strong className="text-foreground">{conceptStages.solid}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-[11px] font-sans text-ink-3">Getting there · <strong className="text-foreground">{conceptStages.getting_there}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent-bright" />
                    <span className="text-[11px] font-sans text-ink-3">Practicing · <strong className="text-foreground">{conceptStages.practicing}</strong></span>
                  </div>
                </div>
                <p className="text-[12px] font-sans text-ink-3 mt-2">Total: <strong className="text-foreground">{conceptStages.total}</strong> concepts</p>
              </div>
            )}

            {/* Repetition schedule */}
            {concepts.length > 0 && (
              <div className="bg-card rounded-[20px] border-[1.5px] border-border p-5 mb-4 animate-fade-up stagger-5">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">REPETITION SCHEDULE</p>
                <div className="flex items-end gap-2 h-[100px]">
                  {repetitionSchedule.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      {day.count > 0 && (
                        <span className="text-[10px] font-sans font-medium text-foreground mb-1">{day.count}</span>
                      )}
                      <div
                        className="w-full rounded-t-[6px] bg-accent transition-all"
                        style={{ height: `${day.count > 0 ? Math.max((day.count / maxScheduleCount) * 80, 8) : 4}%`, opacity: day.count > 0 ? 1 : 0.2 }}
                      />
                      <span className="text-[9px] font-sans text-ink-3 mt-1.5 whitespace-nowrap">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-5">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{modules.length}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-5">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedLessons}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">lessons done</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-6">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{completedModules}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">modules mastered</p>
              </div>
              <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5 text-center animate-fade-up stagger-6">
                <p className="font-serif text-[2.5rem] leading-none text-foreground">{progress.total_sessions}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">total sessions</p>
              </div>
            </div>

            {/* Gap identification */}
            {moduleGaps.length > 0 && (
              <div className="mb-4 animate-fade-up stagger-6">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">GAP IDENTIFICATION</p>
                <p className="text-[12px] font-sans text-ink-3 mb-3">These areas need more focus.</p>
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
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-7">MODULE BREAKDOWN</p>
            {modules.map((mod, idx) => (
              <div key={mod.id} className="bg-card rounded-[16px] border-[1.5px] border-border p-4 mb-3 animate-fade-up" style={{ animationDelay: `${(idx + 7) * 65}ms` }}>
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
