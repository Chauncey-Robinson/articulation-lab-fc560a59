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
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10 relative">
      <button onClick={() => navigate(`/module/${lesson.module_id}`)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>
      <button onClick={toggleMute} className="absolute top-4 right-6 text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">
        {muted ? "🔇 Unmute" : "🔊 Mute"}
      </button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Session header */}
        <div className="mb-6 animate-fade-up stagger-1">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">READ</p>
          <h1 className="font-serif text-[1.8rem] text-foreground mb-2">{lesson.title}</h1>
        </div>

        {/* Key idea card */}
        <div className="bg-accent-bright/10 rounded-[16px] border-[1.5px] border-accent-bright/30 p-5 mb-6 animate-fade-up stagger-2">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent-bright mb-2">THE MAIN POINT</p>
          <p className="font-serif text-[17px] font-light leading-[1.65] text-foreground">{lesson.key_idea}</p>
        </div>

        {/* Session content */}
        <div className="bg-card rounded-[18px] border-[1.5px] border-border p-6 mb-6 animate-fade-up stagger-3">
          <div className="font-serif text-[16px] font-light leading-[1.75] text-ink-2 whitespace-pre-wrap">
            {lesson.content}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3 animate-fade-up stagger-4">
          {!lesson.completed ? (
            <button onClick={markComplete} disabled={marking}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40">
              {marking ? "Saving..." : "Got it. Next."}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="text-sage">✓</span>
              <p className="text-[13px] font-sans text-sage font-medium">Completed</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/dialogue/${lesson.id}`)}
              className="rounded-pill border-[1.5px] border-border bg-card py-3 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
              💬 Talk it through
            </button>
            <button onClick={() => navigate(`/test-config/${lesson.module_id}`)}
              className="rounded-pill border-[1.5px] border-border bg-card py-3 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
              🧪 Explain it back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
