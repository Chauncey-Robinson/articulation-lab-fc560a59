import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTeachBackFeedback } from "@/lib/tutor-ai";
import type { Lesson } from "@/lib/TutorContext";
import MicButton from "@/components/MicButton";
import { useTTS } from "@/hooks/useSpeech";

export default function TeachBack() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [round, setRound] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      if (data) setLesson(data as unknown as Lesson);
      setLoading(false);
    })();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setError("");
    try {
      const fb = await getTeachBackFeedback(lesson.key_idea, explanation);
      setFeedback(fb);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setRound(round + 1);
    setExplanation("");
    setFeedback("");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Lesson not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2 animate-fade-up stagger-1">
          TEACH BACK · ROUND {round}
        </p>
        <h1 className="font-serif text-[1.6rem] text-foreground mb-2 animate-fade-up stagger-1">
          Explain this like you're teaching someone.
        </h1>

        {/* Key idea reminder */}
        <div className="border-l-[2.5px] border-accent-bright bg-surface-2 rounded-[12px] px-[18px] py-4 mb-5 animate-fade-up stagger-2">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-1">THE CONCEPT</p>
          <p className="font-serif text-[16px] italic text-ink-2 leading-[1.6]">{lesson.key_idea}</p>
        </div>

        {!feedback ? (
          <>
            <div className="animate-fade-up stagger-3">
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain it in your own words. Pretend you're telling a friend who has never heard of this..."
                className="w-full min-h-[140px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors resize-y mb-2"
              />
              <p className="text-[12px] font-sans text-ink-3 mb-3">Write like you'd speak. Don't worry about being perfect.</p>
            </div>

            <div className="mb-4 animate-fade-up stagger-4">
              <MicButton onTranscript={(t) => setExplanation(t)} />
            </div>

            {error && (
              <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive">{error}</div>
            )}

            <button onClick={handleSubmit}
              disabled={submitting || explanation.trim().length < 10}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 mt-auto animate-fade-up stagger-5">
              {submitting ? "Thinking..." : "How did I do?"}
            </button>
          </>
        ) : (
          <div className="animate-fade-up">
            {/* AI feedback */}
            <div className="bg-card rounded-[18px] border-[1.5px] border-border p-6 mb-5">
              <p className="font-serif text-[17px] font-light leading-[1.7] text-ink-2">{feedback}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleTryAgain}
                className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
                Try again
              </button>
              <button onClick={() => navigate(`/apply/${lesson.id}`)}
                className="w-full rounded-pill border-[1.5px] border-border bg-card py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
                Apply in real life →
              </button>
              <button onClick={() => navigate(`/module/${lesson.module_id}`)}
                className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors text-center py-2">
                Back to module
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
