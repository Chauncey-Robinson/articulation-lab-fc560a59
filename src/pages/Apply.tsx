import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getApplyScenario, evaluateApplication, type ApplicationEvaluation } from "@/lib/tutor-ai";
import type { Lesson } from "@/lib/TutorContext";
import MicButton from "@/components/MicButton";
import { useTTS } from "@/hooks/useSpeech";

export default function Apply() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { speak, stop } = useTTS();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ApplicationEvaluation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      try {
        const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
        if (!data) { setLoading(false); return; }
        const l = data as unknown as Lesson;
        setLesson(l);
        const sc = await getApplyScenario(l.title, l.key_idea);
        setScenario(sc);
        speak(sc);
      } catch (e: any) {
        setError(e.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!lesson || !scenario) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await evaluateApplication(scenario, lesson.key_idea, response);
      setEvaluation(result);
      speak(`Score: ${result.score} out of 10. ${result.feedback}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground/80 rounded-full animate-spin mb-4" />
        <p className="text-[13px] font-sans text-ink-3">Setting the scene…</p>
      </div>
    );
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Lesson not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-6 pb-40">
      <button
        onClick={() => navigate(-1)}
        className="text-ink-3 hover:text-foreground transition-colors mb-10 self-start"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
      </button>

      <div className="max-w-[560px] mx-auto w-full flex-1 flex flex-col">
        {/* Eyebrow + headline */}
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4 animate-fade-up stagger-1">
          Real situation
        </p>
        <h1 className="font-serif text-[2.25rem] leading-[1.15] text-foreground mb-12 tracking-tight animate-fade-up stagger-1">
          Here's a real situation.
        </h1>

        {/* Scenario — pull-quote, no container, integrated on the page */}
        <figure className="mb-14 animate-fade-up stagger-2">
          <div className="border-l-2 border-foreground/80 pl-8 py-2">
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">Scenario</p>
            <blockquote className="font-serif italic text-[24px] leading-[1.35] text-foreground tracking-tight">
              {scenario}
            </blockquote>
          </div>
        </figure>

        {!evaluation ? (
          <>
            <p className="text-[13px] font-sans text-ink-3 mb-5 animate-fade-up stagger-3">How do you respond?</p>

            {/* Borderless response surface */}
            <div className="animate-fade-up stagger-3 mb-4">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write what you'd actually say…"
                className="w-full min-h-[140px] rounded-[18px] bg-[hsl(var(--surface-1))] px-6 py-5 text-[15px] font-sans leading-[1.6] text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:bg-[hsl(var(--surface-2))] transition-colors resize-y"
              />
            </div>

            <div className="mb-4 animate-fade-up stagger-4">
              <MicButton onTranscript={(t) => setResponse(t)} />
            </div>

            {error && (
              <div className="rounded-[12px] bg-[hsl(var(--surface-2))] px-5 py-3 mb-4 text-[13px] font-sans text-destructive">
                {error}
              </div>
            )}

            {/* Floating glass action bar */}
            <div className="fixed bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
              <div className="max-w-[560px] mx-auto pointer-events-auto">
                <div className="glass rounded-pill px-2 py-2 flex items-center gap-2">
                  <p className="flex-1 text-[12px] font-sans text-ink-3 pl-5 truncate">
                    {response.trim().length < 10 ? "Type your response above…" : "Ready when you are."}
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || response.trim().length < 10}
                    className="rounded-pill bg-primary px-6 py-3 text-[13px] font-sans font-medium text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-30"
                  >
                    {submitting ? "Evaluating…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-fade-up">
            {/* Score — borderless, integrated */}
            <div className="bg-[hsl(var(--surface-1))] rounded-[32px] p-8 mb-6 shadow-feather">
              <div className="flex items-baseline gap-3 mb-5">
                <p className="font-serif text-[3.5rem] leading-none text-foreground tracking-tight">{evaluation.score}</p>
                <p className="text-[13px] font-sans text-ink-3">/ 10</p>
              </div>
              <p className="font-sans text-[15px] leading-[1.7] text-ink-2 mb-7">{evaluation.feedback}</p>

              <div className="pt-6 border-t border-[hsl(var(--surface-3))]">
                <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-3">A stronger response</p>
                <p className="font-serif italic text-[17px] text-foreground leading-[1.55]">"{evaluation.improved_response}"</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/module/${lesson.module_id}`)}
                className="w-full rounded-pill bg-primary py-5 text-[14px] font-sans font-medium text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all tracking-wide"
              >
                Back to topic
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full rounded-pill bg-[hsl(var(--surface-1))] py-5 text-[14px] font-sans font-medium text-foreground hover:bg-[hsl(var(--surface-2))] transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
