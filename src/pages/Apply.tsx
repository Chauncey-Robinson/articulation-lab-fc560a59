import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getApplyScenario, evaluateApplication, type ApplicationEvaluation } from "@/lib/tutor-ai";
import type { Lesson } from "@/lib/TutorContext";
import MicButton from "@/components/MicButton";
import { useTTS } from "@/hooks/useSpeech";

export default function Apply() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
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
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[14px] font-sans text-ink-3">Setting the scene...</p>
      </div>
    );
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Lesson not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2 animate-fade-up stagger-1">APPLY IN REAL LIFE</p>
        <h1 className="font-serif text-[1.6rem] text-foreground mb-4 animate-fade-up stagger-1">Here's a real situation.</h1>

        {/* Scenario card */}
        <div className="border-l-[2.5px] border-accent-bright bg-surface-2 rounded-[12px] px-[18px] py-4 mb-5 animate-fade-up stagger-2">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">SCENARIO</p>
          <p className="font-serif text-[16px] italic text-ink-2 leading-[1.6]">{scenario}</p>
        </div>

        {!evaluation ? (
          <>
            <p className="text-[14px] font-sans text-ink-3 mb-4 animate-fade-up stagger-3">How do you respond?</p>

            <div className="animate-fade-up stagger-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write what you'd actually say in this situation..."
                className="w-full min-h-[120px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors resize-y mb-2"
              />
            </div>

            <div className="mb-4 animate-fade-up stagger-4">
              <MicButton onTranscript={(t) => setResponse(t)} />
            </div>

            {error && (
              <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive">{error}</div>
            )}

            <button onClick={handleSubmit}
              disabled={submitting || response.trim().length < 10}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 mt-auto animate-fade-up stagger-5">
              {submitting ? "Evaluating..." : "Submit response"}
            </button>
          </>
        ) : (
          <div className="animate-fade-up">
            {/* Score */}
            <div className="bg-card rounded-[18px] border-[1.5px] border-border p-6 mb-5">
              <div className="flex items-center gap-3 mb-4">
                <p className="font-serif text-[3rem] leading-none text-foreground">{evaluation.score}</p>
                <p className="text-[12px] font-sans text-ink-3">/ 10</p>
              </div>
              <p className="font-serif text-[16px] font-light leading-[1.7] text-ink-2 mb-4">{evaluation.feedback}</p>

              <div className="border-t border-border pt-4">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">A STRONGER RESPONSE</p>
                <p className="font-serif text-[15px] italic text-foreground leading-[1.6]">"{evaluation.improved_response}"</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigate(`/module/${lesson.module_id}`)}
                className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
                Back to module
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="w-full rounded-pill border-[1.5px] border-border bg-card py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
