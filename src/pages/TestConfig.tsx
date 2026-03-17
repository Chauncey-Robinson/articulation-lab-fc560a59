import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson } from "@/lib/TutorContext";

const testModes = [
  { key: "quiz", emoji: "🧪", label: "Quiz", desc: "Multiple choice, true/false & open questions" },
  { key: "flashcards", emoji: "🃏", label: "Flashcards", desc: "Quick recall cards — flip & self-assess" },
  { key: "teach-back", emoji: "🎙️", label: "Teach Back", desc: "Explain concepts in your own words" },
  { key: "apply", emoji: "🌍", label: "Apply", desc: "Use knowledge in real-life scenarios" },
];

export default function TestConfig() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState("quiz");

  useEffect(() => {
    if (!user || !moduleId) return;
    (async () => {
      const { data } = await supabase.from("lessons").select("*").eq("module_id", moduleId).eq("completed", true).order("lesson_order");
      if (data) {
        const ls = data as unknown as Lesson[];
        setLessons(ls);
        setSelectedTopics(ls.map(l => l.id));
      }
      setLoading(false);
    })();
  }, [user, moduleId]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleStart = () => {
    const firstLesson = lessons.find(l => selectedTopics.includes(l.id));
    if (!firstLesson) return;

    switch (selectedMode) {
      case "quiz":
        navigate(`/quiz/${moduleId}`);
        break;
      case "flashcards":
        navigate(`/flashcards/${moduleId}`);
        break;
      case "teach-back":
        navigate(`/teach-back/${firstLesson.id}`);
        break;
      case "apply":
        navigate(`/apply/${firstLesson.id}`);
        break;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <p className="text-[14px] font-sans text-ink-3 mb-4">Complete at least one lesson first.</p>
        <button onClick={() => navigate(-1)} className="rounded-pill bg-primary px-8 py-3 text-[13px] font-sans font-semibold text-primary-foreground">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-2 animate-fade-up stagger-1">Test your knowledge.</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">5-10 minutes is all you need.</p>

        {/* Test mode */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-3">TEST MODE</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {testModes.map(mode => (
            <button key={mode.key} onClick={() => setSelectedMode(mode.key)}
              className={`bg-card rounded-[16px] border-[1.5px] p-4 text-left transition-all duration-[180ms] animate-fade-up stagger-3 ${
                selectedMode === mode.key ? "border-accent bg-accent-pale/20" : "border-border hover:border-accent"
              }`}>
              <p className="text-[18px] mb-1">{mode.emoji}</p>
              <p className="text-[13px] font-sans font-semibold text-foreground">{mode.label}</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1 leading-[1.4]">{mode.desc}</p>
            </button>
          ))}
        </div>

        {/* Topic selection */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-4">TOPICS</p>
        <div className="flex flex-col gap-2 mb-6 animate-fade-up stagger-5">
          {lessons.map(lesson => (
            <button key={lesson.id} onClick={() => toggleTopic(lesson.id)}
              className={`w-full text-left rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans transition-all duration-[180ms] ${
                selectedTopics.includes(lesson.id) ? "border-accent bg-accent-pale/20 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center text-[10px] transition-all ${
                  selectedTopics.includes(lesson.id) ? "border-accent bg-accent text-accent-foreground" : "border-border"
                }`}>
                  {selectedTopics.includes(lesson.id) && "✓"}
                </div>
                <span>{lesson.title}</span>
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleStart} disabled={selectedTopics.length === 0}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 mt-auto animate-fade-up stagger-6">
          Start testing
        </button>
      </div>
    </div>
  );
}
