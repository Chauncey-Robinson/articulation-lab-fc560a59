import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";
import { supabase } from "@/integrations/supabase/client";
import { generateLessons } from "@/lib/tutor-ai";
import MicButton from "@/components/MicButton";

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshModules } = useTutor();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const isValid = content.trim().length >= 50;

  const handleUpload = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    setError("");
    setStatus("Reading your material...");

    try {
      // Step 1: Generate lessons via AI
      setStatus("Finding key concepts...");
      const result = await generateLessons(content);

      // Step 2: Create module
      setStatus("Creating your module...");
      const { data: moduleData, error: modErr } = await supabase.from("modules").insert({
        user_id: user.id,
        title: result.title,
        source_content: content,
        source_type: "text",
        status: "learning",
        lesson_count: result.lessons.length,
        completed_lessons: 0,
      } as any).select().single();

      if (modErr) throw modErr;
      const moduleId = (moduleData as any).id;

      // Step 3: Insert lessons
      setStatus("Building your lessons...");
      const lessonInserts = result.lessons.map((lesson, idx) => ({
        module_id: moduleId,
        user_id: user.id,
        title: lesson.title,
        content: lesson.content,
        key_idea: lesson.key_idea,
        lesson_order: idx,
        completed: false,
      }));

      await supabase.from("lessons").insert(lessonInserts as any);

      await refreshModules();
      navigate(`/module/${moduleId}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Upload your material.</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">
          Paste a book chapter, article, notes, or any learning material. We'll split it into lessons for you.
        </p>

        <div className="animate-fade-up stagger-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your learning material here — an article, textbook chapter, course notes, or anything you want to master..."
            className="w-full min-h-[220px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y mb-1"
            disabled={loading}
          />
          {content.length > 0 && (
            <p className="text-[11px] font-sans text-ink-3 text-right mb-2">{content.length} characters</p>
          )}
        </div>

        <div className="mb-4 animate-fade-up stagger-4">
          <MicButton onTranscript={(t) => setContent(prev => prev + " " + t)} />
        </div>

        {error && (
          <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive animate-fade-up">
            {error}
          </div>
        )}

        {loading && status && (
          <div className="flex items-center gap-3 mb-4 animate-fade-up">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-sans text-ink-3">{status}</p>
          </div>
        )}

        <div className="mt-auto animate-fade-up stagger-5">
          <button
            onClick={handleUpload}
            disabled={!isValid || loading}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Processing..." : "Create lessons"}
          </button>
          <p className="text-[12px] font-sans text-ink-3 text-center mt-3">
            AI will split this into 3-5 mini-lectures you can study and test yourself on.
          </p>
        </div>
      </div>
    </div>
  );
}
