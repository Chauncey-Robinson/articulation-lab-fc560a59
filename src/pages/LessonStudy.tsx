import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor, type Lesson } from "@/lib/TutorContext";
import { useTTS } from "@/hooks/useSpeech";

export default function LessonStudy() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshModules } = useTutor();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { speak, stop, muted, toggleMute } = useTTS();

  useEffect(() => {
    if (lesson && !muted) {
      speak(`${lesson.title}. ${lesson.key_idea}. ${lesson.content}`);
    }
    return () => stop();
  }, [lesson?.id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", id).single();
      if (data) setLesson(data as unknown as Lesson);
      setLoading(false);
    })();
  }, [id]);

  const updateProgress = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase.from("user_progress").select("*").eq("user_id", user.id).single();

    if (existing) {
      const lastDate = (existing as any).last_practice_date;
      let newStreak = (existing as any).current_streak || 0;
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;
      }
      await supabase.from("user_progress").update({
        total_sessions: ((existing as any).total_sessions || 0) + 1,
        current_streak: newStreak,
        longest_streak: Math.max((existing as any).longest_streak || 0, newStreak),
        last_practice_date: today,
      } as any).eq("user_id", user.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        total_sessions: 1,
        current_streak: 1,
        longest_streak: 1,
        last_practice_date: today,
      } as any);
    }
  };

  const markComplete = async () => {
    if (!lesson || !user) return;
    setMarking(true);

    await supabase.from("lessons").update({ completed: true } as any).eq("id", lesson.id);

    const { data: allLessons } = await supabase.from("lessons").select("completed").eq("module_id", lesson.module_id);
    const completedCount = allLessons ? allLessons.filter((l: any) => l.completed).length + 1 : 1;
    const totalLessons = allLessons ? allLessons.length : 1;

    await supabase.from("modules").update({
      completed_lessons: completedCount,
      status: completedCount >= totalLessons ? "testing" : "learning",
    } as any).eq("id", lesson.module_id);

    await updateProgress();
    await refreshModules();
    setMarking(false);
    navigate(`/module/${lesson.module_id}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Session not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-6 pb-14 relative">
      <button onClick={() => navigate(`/module/${lesson.module_id}`)} className="text-[18px] font-sans text-ink-3 hover:text-foreground transition-colors mb-10 self-start">←</button>
      <button onClick={toggleMute} className="absolute top-6 right-8 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors">
        {muted ? "Unmute" : "Mute"}
      </button>

      <div className="max-w-[600px] mx-auto w-full flex-1 flex flex-col">
        {/* Session header */}
        <div className="mb-12 animate-fade-up stagger-1">
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">Read</p>
          <h1 className="font-serif text-[2.25rem] leading-[1.15] text-foreground tracking-tight">{lesson.title}</h1>
        </div>

        {/* Main Point — pull-quote, the visual centerpiece */}
        <figure className="mb-14 animate-fade-up stagger-2">
          <div className="border-l-2 border-foreground/80 pl-8 py-2">
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">The Main Point</p>
            <blockquote className="font-serif italic text-[28px] leading-[1.3] text-foreground tracking-tight">
              &ldquo;{lesson.key_idea}&rdquo;
            </blockquote>
          </div>
        </figure>

        {/* Session content — borderless, generous reading width */}
        <article className="mb-14 animate-fade-up stagger-3">
          <div className="font-serif text-[18px] leading-[1.75] text-ink-2 whitespace-pre-wrap">
            {lesson.content}
          </div>
        </article>

        {/* Actions */}
        <div className="mt-auto pt-8 flex flex-col gap-4 animate-fade-up stagger-4">
          {!lesson.completed ? (
            <button onClick={markComplete} disabled={marking}
              className="w-full rounded-pill bg-primary py-6 text-[15px] font-sans font-semibold text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all duration-[200ms] disabled:opacity-30 tracking-wide">
              {marking ? "Saving..." : "Got it. Next."}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-6">
              <span className="text-sage">✓</span>
              <p className="text-[13px] font-sans text-sage font-medium">Completed</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/dialogue/${lesson.id}`)}
              className="rounded-pill bg-surface-1 py-4 text-[13px] font-sans font-medium text-foreground hover:bg-surface-2 transition-all">
              Talk it through
            </button>
            <button onClick={() => navigate(`/test-config/${lesson.module_id}`)}
              className="rounded-pill bg-surface-1 py-4 text-[13px] font-sans font-medium text-foreground hover:bg-surface-2 transition-all">
              Explain it back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
