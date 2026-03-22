import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor, type Lesson, type Module } from "@/lib/TutorContext";

export default function ModuleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshModules, profile } = useTutor();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const [modRes, lessRes] = await Promise.all([
        supabase.from("modules").select("*").eq("id", id).single(),
        supabase.from("lessons").select("*").eq("module_id", id).order("lesson_order", { ascending: true }),
      ]);
      if (modRes.data) setModule(modRes.data as unknown as Module);
      if (lessRes.data) setLessons(lessRes.data as unknown as Lesson[]);
      setLoading(false);
    })();
  }, [user, id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!module) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Topic not found.</p></div>;
  }

  const completedCount = lessons.filter(l => l.completed).length;
  const allCompleted = completedCount === lessons.length && lessons.length > 0;
  const nextLesson = lessons.find(l => !l.completed);

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate("/dashboard")} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full">
        {/* Topic header */}
        <div className="mb-6 animate-fade-up stagger-1">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">
            {completedCount} of {lessons.length} done
          </p>
          <h1 className="font-serif text-[1.8rem] text-foreground mb-2">{module.title}</h1>
          <div className="w-full h-1.5 bg-border rounded-pill">
            <div className="h-full bg-accent rounded-pill transition-all duration-300" style={{ width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Path selection */}
        {!allCompleted && nextLesson && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up stagger-3">
            <button onClick={() => navigate(`/study/${nextLesson.id}`)}
              className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-left hover:border-accent hover:translate-y-[-2px] transition-all duration-[180ms]">
              <p className="text-[20px] mb-2">📖</p>
              <p className="text-[13px] font-sans font-semibold text-foreground">Learn</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1">Read it</p>
            </button>
            <button onClick={() => navigate(`/test-config/${module.id}`)}
              className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-left hover:border-accent hover:translate-y-[-2px] transition-all duration-[180ms]">
              <p className="text-[20px] mb-2">🧪</p>
              <p className="text-[13px] font-sans font-semibold text-foreground">Test</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1">Explain it back</p>
            </button>
          </div>
        )}

        {allCompleted && (
          <div className="bg-sage/10 rounded-[16px] border-[1.5px] border-sage/30 p-5 mb-6 text-center animate-fade-up stagger-2">
            <p className="text-[20px] mb-2">🎉</p>
            <p className="text-[14px] font-sans font-medium text-foreground">You've finished all the reading.</p>
            <button onClick={() => navigate(`/test-config/${module.id}`)}
              className="mt-3 rounded-pill bg-primary px-6 py-3 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Now explain it back
            </button>
          </div>
        )}

        {/* Sessions list */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-3">SESSIONS</p>
        {lessons.map((lesson, idx) => (
          <button key={lesson.id}
            onClick={() => navigate(`/study/${lesson.id}`)}
            className={`w-full text-left bg-card rounded-[16px] border-[1.5px] p-4 mb-3 transition-all duration-[180ms] animate-fade-up ${lesson.completed ? "border-sage/30 opacity-70" : "border-border hover:border-accent hover:translate-y-[-1px]"}`}
            style={{ animationDelay: `${(idx + 3) * 65}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-sans font-semibold ${lesson.completed ? "bg-sage text-white" : "bg-surface-2 text-ink-3"}`}>
                {lesson.completed ? "✓" : idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-sans font-medium text-foreground">{lesson.title}</h3>
                <p className="text-[12px] font-sans text-ink-3 mt-0.5">{lesson.key_idea.slice(0, 60)}{lesson.key_idea.length > 60 ? "…" : ""}</p>
              </div>
            </div>
          </button>
        ))}

        {/* Dialogue button */}
        {completedCount > 0 && (
          <div className="mt-6 flex flex-col gap-3 animate-fade-up stagger-6">
            <button onClick={() => { const l = lessons.find(l => l.completed); if (l) navigate(`/dialogue/${l.id}`); }}
              className="w-full rounded-pill border-[1.5px] border-accent/30 bg-accent-pale/10 py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all flex items-center justify-center gap-2">
              💬 Ask your coach a question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
