import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson, Module } from "@/lib/TutorContext";

type StepKind = "study" | "quiz" | "teach-back" | "apply" | "flashcards";

const STEP_LABEL: Record<StepKind, string> = {
  study: "Read",
  quiz: "Quiz",
  "teach-back": "Explain it",
  apply: "Apply",
  flashcards: "Flashcards",
};

/**
 * Adaptive session length — Lily picks the number of cards.
 * 5 min  → 2 cards: read + quiz
 * 10 min → 4 cards: read + quiz + flashcards + explain
 * 20 min → 8 cards: read + quiz + flashcards + explain + apply + read + quiz + explain
 */
function planFor(minutes: number): StepKind[] {
  if (minutes <= 5) return ["study", "quiz"];
  if (minutes >= 20)
    return ["study", "quiz", "flashcards", "teach-back", "apply", "study", "quiz", "teach-back"];
  return ["study", "quiz", "flashcards", "teach-back"];
}

export default function Session() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const minutes = Number(params.get("len") || 10);
  const plan = useMemo(() => planFor(minutes), [minutes]);

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    if (!user || !moduleId) return;
    (async () => {
      const [m, l] = await Promise.all([
        supabase.from("modules").select("*").eq("id", moduleId).single(),
        supabase.from("lessons").select("*").eq("module_id", moduleId).order("lesson_order"),
      ]);
      if (m.data) setModule(m.data as unknown as Module);
      if (l.data) setLessons(l.data as unknown as Lesson[]);
      setLoading(false);
    })();
  }, [user, moduleId]);

  const next = () => setIndex((i) => Math.min(i + 1, plan.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    setDrag(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (drag < -80) next();
    else if (drag > 80) prev();
    setDrag(0);
    startX.current = null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (!module || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <p className="text-[14px] font-sans text-ink-3 mb-4">No sessions ready yet.</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-pill bg-primary px-7 py-3 text-[13px] font-sans font-medium text-primary-foreground"
        >
          Go back
        </button>
      </div>
    );
  }

  const firstLesson = lessons[0];
  const pct = ((index + 1) / plan.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-5 pb-32">
      {/* Header */}
      <div className="max-w-[560px] mx-auto w-full flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/module/${moduleId}`)}
          className="text-ink-3 hover:text-foreground transition-colors"
          aria-label="Exit session"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3">
            {minutes} min · {plan.length} cards
          </p>
          <h1 className="font-serif text-[15px] text-foreground tracking-tight truncate">
            {module.title}
          </h1>
        </div>
        <p className="text-[11px] font-sans text-ink-3 tabular-nums">
          {index + 1}/{plan.length}
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-[560px] mx-auto w-full mb-6">
        <div className="w-full h-[2px] bg-surface-3 rounded-pill overflow-hidden">
          <div
            className="h-full bg-primary rounded-pill transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Swipeable card track */}
      <div
        className="flex-1 overflow-hidden touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex h-full transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${drag}px))`,
          }}
        >
          {plan.map((kind, i) => (
            <SessionCard
              key={`${kind}-${i}`}
              kind={kind}
              moduleId={moduleId!}
              firstLessonId={firstLesson.id}
              active={i === index}
              onContinue={next}
            />
          ))}
        </div>
      </div>

      {/* Card dots + arrows */}
      <div className="max-w-[560px] mx-auto w-full flex items-center justify-between mt-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="w-9 h-9 rounded-full bg-surface-2 text-foreground flex items-center justify-center disabled:opacity-30 hover:bg-surface-3 transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
        </button>

        <div className="flex gap-2">
          {plan.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Card ${i + 1}`}
              className={`h-1.5 rounded-pill transition-all ${
                i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={index === plan.length - 1}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-95 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function SessionCard({
  kind,
  moduleId,
  firstLessonId,
  active,
  onContinue,
}: {
  kind: StepKind;
  moduleId: string;
  firstLessonId: string;
  active: boolean;
  onContinue: () => void;
}) {
  const navigate = useNavigate();

  const open = () => {
    switch (kind) {
      case "study":
        return navigate(`/study/${firstLessonId}`);
      case "quiz":
        return navigate(`/quiz/${moduleId}`);
      case "flashcards":
        return navigate(`/flashcards/${moduleId}`);
      case "teach-back":
        return navigate(`/teach-back/${firstLessonId}`);
      case "apply":
        return navigate(`/apply/${firstLessonId}`);
    }
  };

  return (
    <div className="w-full shrink-0 px-1">
      <div
        className={`mx-auto max-w-[520px] bg-surface-1 rounded-[32px] p-8 transition-all duration-300 ${
          active ? "opacity-100 scale-100" : "opacity-60 scale-[0.97]"
        }`}
        style={{ minHeight: 360 }}
      >
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-5">
          {STEP_LABEL[kind]}
        </p>
        <h2 className="font-serif text-[1.9rem] leading-[1.15] text-foreground tracking-tight mb-3">
          {titleFor(kind)}
        </h2>
        <p className="text-[14px] font-sans text-ink-3 leading-[1.6] mb-8">
          {subtitleFor(kind)}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={open}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all"
          >
            Open card
          </button>
          <button
            onClick={onContinue}
            className="w-full rounded-pill bg-surface-2 py-4 text-[13px] font-sans text-foreground hover:bg-surface-3 transition-all"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function titleFor(kind: StepKind) {
  switch (kind) {
    case "study":
      return "Read it through.";
    case "quiz":
      return "Quick check.";
    case "flashcards":
      return "Recall the cards.";
    case "teach-back":
      return "Explain it back.";
    case "apply":
      return "Use it in the wild.";
  }
}

function subtitleFor(kind: StepKind) {
  switch (kind) {
    case "study":
      return "Take a few minutes with the material.";
    case "quiz":
      return "A handful of questions to lock it in.";
    case "flashcards":
      return "Flip through and check what stuck.";
    case "teach-back":
      return "Say it in your own words. Lily listens.";
    case "apply":
      return "A real situation to test what you know.";
  }
}
