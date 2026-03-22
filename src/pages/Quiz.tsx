import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";
import { generateQuiz, evaluateAnswer, type GeneratedQuestion } from "@/lib/tutor-ai";
import type { Lesson } from "@/lib/TutorContext";
import MicButton from "@/components/MicButton";
import { useTTS } from "@/hooks/useSpeech";

interface QuizQuestion extends GeneratedQuestion {
  id?: string;
  lesson_id: string;
}

export default function Quiz() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak, stop, muted, toggleMute } = useTTS();
  const { profile } = useTutor();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ is_correct: boolean; feedback: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (!user || !moduleId) return;
    (async () => {
      try {
        // Get completed lessons for this module
        const { data: lessons } = await supabase.from("lessons").select("*").eq("module_id", moduleId).eq("completed", true).order("lesson_order");
        if (!lessons || lessons.length === 0) {
          setError("Complete at least one lesson first.");
          setLoading(false);
          return;
        }

        // Pick a random lesson to quiz on
        const lesson = (lessons as unknown as Lesson[])[Math.floor(Math.random() * lessons.length)];
        const result = await generateQuiz(lesson.title, lesson.content, lesson.key_idea, profile?.learning_style || undefined);

        // Sort: multiple_choice first, then true_false, then open
        const order: Record<string, number> = { multiple_choice: 0, true_false: 1, open: 2 };
        const sorted = result.questions
          .map(q => ({ ...q, lesson_id: lesson.id }))
          .sort((a, b) => (order[a.question_type] ?? 9) - (order[b.question_type] ?? 9));

        // Save questions to DB so attempts can be tracked
        const questionInserts = sorted.map(q => ({
          lesson_id: q.lesson_id,
          user_id: user.id,
          question: q.question,
          question_type: q.question_type,
          correct_answer: q.correct_answer,
          options: q.options || null,
        }));
        const { data: savedQs } = await supabase.from("quiz_questions").insert(questionInserts as any).select();
        if (savedQs) {
          setQuestions(sorted.map((q, i) => ({ ...q, id: (savedQs[i] as any).id })));
        } else {
          setQuestions(sorted);
        }
      } catch (e: any) {
        setError(e.message || "Failed to generate quiz.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, moduleId]);

  const currentQ = questions[currentIdx];

  // Speak each question aloud
  useEffect(() => {
    if (currentQ) {
      speak(currentQ.question);
    }
    return () => stop();
  }, [currentIdx, currentQ?.question]);

  const handleSubmit = async () => {
    if (!currentQ || !user) return;
    setSubmitting(true);

    const userAnswer = currentQ.question_type === "open" ? answer : selectedOption;

    try {
      const result = await evaluateAnswer(currentQ.question, currentQ.correct_answer, userAnswer, currentQ.question_type);
      setFeedback(result);
      // Speak feedback
      speak(`${result.is_correct ? "Correct!" : "Not quite."} ${result.feedback}`);
      setScore(prev => ({
        correct: prev.correct + (result.is_correct ? 1 : 0),
        total: prev.total + 1,
      }));

      // Save attempt
      if (currentQ.id) {
        await supabase.from("quiz_attempts").insert({
          question_id: currentQ.id,
          user_id: user.id,
          user_answer: userAnswer,
          is_correct: result.is_correct,
          ai_feedback: result.feedback,
        } as any);
      }
    } catch (e: any) {
      setError(e.message || "Failed to evaluate answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswer("");
      setSelectedOption("");
      setFeedback(null);
    }
  };

  // Update progress when quiz is finished
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
        user_id: user.id, total_sessions: 1, current_streak: 1, longest_streak: 1, last_practice_date: today,
      } as any);
    }
  };

  const isFinished = feedback && currentIdx === questions.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[14px] font-sans text-ink-3">Generating quiz questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive">{error}</div>
        <button onClick={() => navigate(-1)} className="rounded-pill bg-primary px-8 py-3 text-[13px] font-sans font-semibold text-primary-foreground">Go back</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
        <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Quiz complete!</h1>
          <p className="font-serif text-[4rem] text-foreground leading-none mb-2 animate-fade-up stagger-2">
            {score.correct}/{score.total}
          </p>
          <p className="text-[14px] font-sans text-ink-3 mb-8 animate-fade-up stagger-3">
            {score.correct === score.total ? "Perfect score! You really know this." : score.correct > 0 ? "Good effort. Keep studying and try again." : "Don't worry — that's what practice is for."}
          </p>
          <div className="flex flex-col gap-3 w-full animate-fade-up stagger-4">
            <button onClick={() => navigate(`/module/${moduleId}`)}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Back to module
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="w-full rounded-pill border-[1.5px] border-border bg-card py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
        <span className="text-[13px] font-sans text-ink-3">{currentIdx + 1} / {questions.length}</span>
        <button onClick={toggleMute} className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-pill" style={{ background: i <= currentIdx ? "hsl(var(--accent))" : "hsl(var(--border))" }} />
          ))}
        </div>

        {/* Question type badge */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-3 animate-fade-up stagger-1">
          {currentQ.question_type === "open" ? "EXPLAIN" : currentQ.question_type === "multiple_choice" ? "CHOOSE ONE" : "TRUE OR FALSE"}
        </p>

        {/* Question */}
        <div className="bg-card rounded-[18px] border-[1.5px] border-border p-6 mb-5 animate-fade-up stagger-2">
          <p className="font-serif text-[18px] font-light leading-[1.65] text-foreground">{currentQ.question}</p>
        </div>

        {/* Answer input */}
        {!feedback && (
          <>
            {currentQ.question_type === "open" ? (
              <div className="animate-fade-up stagger-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full min-h-[100px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors resize-y mb-2"
                />
                <MicButton onTranscript={(t) => setAnswer(t)} />
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-fade-up stagger-3">
                {currentQ.options.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedOption(opt)}
                    className={`w-full text-left rounded-[14px] border-[1.5px] px-5 py-4 text-[14px] font-sans transition-all duration-[180ms] ${selectedOption === opt ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={submitting || (currentQ.question_type === "open" ? answer.trim().length < 5 : !selectedOption)}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-5">
              {submitting ? "Checking..." : "Submit"}
            </button>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-[16px] border-[1.5px] p-5 mb-5 animate-fade-up ${feedback.is_correct ? "border-sage/30 bg-sage/10" : "border-accent-bright/30 bg-accent-bright/10"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[16px] ${feedback.is_correct ? "text-sage" : "text-accent-bright"}`}>
                {feedback.is_correct ? "✓" : "✕"}
              </span>
              <p className="text-[13px] font-sans font-semibold text-foreground">
                {feedback.is_correct ? "Correct!" : "Not quite"}
              </p>
            </div>
            <p className="text-[14px] font-sans text-ink-2 leading-[1.6]">{feedback.feedback}</p>

            {!feedback.is_correct && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-1">CORRECT ANSWER</p>
                <p className="text-[14px] font-sans text-foreground">{currentQ.correct_answer}</p>
              </div>
            )}

            <button onClick={currentIdx < questions.length - 1 ? handleNext : () => { /* trigger finished state re-render */ setFeedback(feedback); }}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all mt-4">
              {currentIdx < questions.length - 1 ? "Next question" : "See results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
