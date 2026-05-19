import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";

/**
 * Onboarding — three plates. Editorial restraint. No celebration.
 * Each plate is a thesis statement, not a feature explainer.
 * Motion: a single hairline traces in, then the type fades up. That's all.
 */
const PLATES = [
  {
    label: "I",
    kicker: "Operate at a higher level",
    title: ["You have read enough.", "What remains is", "fluency."],
    italics: 2, // index of word to italicize
    body: "Fluency is not retention. It is the speed at which what you know becomes what you can deploy.",
  },
  {
    label: "II",
    kicker: "Decisions compound",
    title: ["Every session sharpens", "the instincts your work", "depends on."],
    italics: 1,
    body: "Sessions are short. The compounding is long. Your mind, kept in working condition.",
  },
  {
    label: "III",
    kicker: "Built for minds that matter",
    title: ["A private layer", "between you and", "the work."],
    italics: 0,
    body: "No streaks. No badges. No noise. Only the cognitive instrument.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useTutor();
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const markOnboarded = async () => {
    try { await saveProfile({ onboarded: true } as any); } catch {}
  };

  const next = async () => {
    if (step < PLATES.length - 1) {
      setStep(step + 1);
    } else {
      await markOnboarded();
      navigate("/upload");
    }
  };

  const skip = async () => {
    await markOnboarded();
    navigate("/dashboard");
  };

  // Keyboard: Enter / Space / → advance, Esc skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault(); next();
      } else if (e.key === "Escape") {
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const plate = PLATES[step];
  const isFinal = step === PLATES.length - 1;

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header — fixed monocle strip */}
      <header className="px-8 pt-7 pb-5 flex items-center justify-between">
        <div className="meta-label">Fluency</div>
        <div className="meta-label tabular">
          {String(step + 1).padStart(2, "0")} / {String(PLATES.length).padStart(2, "0")}
        </div>
      </header>

      <div className="h-px w-full bg-[hsl(var(--border))]" />

      {/* Stepper rail — three thin segments, current one fills */}
      <div className="px-8 pt-6">
        <div className="flex gap-2 max-w-[640px] mx-auto w-full">
          {PLATES.map((_, i) => (
            <div
              key={i}
              className="h-px flex-1 overflow-hidden bg-[hsl(var(--border))]"
            >
              <div
                className="h-full bg-foreground transition-transform duration-[700ms]"
                style={{
                  transform: `scaleX(${i < step ? 1 : i === step ? 1 : 0})`,
                  transformOrigin: "left",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 flex flex-col px-8 pt-24 pb-10 max-w-[640px] mx-auto w-full">
        <div key={step} className="flex flex-col">
          <div className="flex items-center gap-4 mb-12 animate-fade-up stagger-1">
            <span className="meta-label tabular">{plate.label}</span>
            <span className="h-px w-10 bg-[hsl(var(--border-strong))]" />
            <span className="meta-label">{plate.kicker}</span>
          </div>

          <h1 className="editorial text-[clamp(2.5rem,7.5vw,4.5rem)] text-foreground leading-[1.04] tracking-[-0.02em] mb-10 animate-fade-up stagger-2">
            {plate.title.map((line, i) => (
              <span key={i} className="block">
                {i === plate.italics ? <span className="editorial-italic">{line}</span> : line}
              </span>
            ))}
          </h1>

          <p className="text-[15px] text-ink-2 leading-[1.6] max-w-[460px] animate-fade-up stagger-3">
            {plate.body}
          </p>
        </div>

        <div className="flex-1 min-h-[40px]" />

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 animate-fade-up stagger-4">
          <button
            onClick={skip}
            className="text-[12px] text-ink-3 hover:text-foreground transition-colors duration-[180ms] tracking-wide"
          >
            Skip introduction
          </button>

          <button
            onClick={next}
            className="group inline-flex items-center gap-3 bg-foreground text-background px-6 py-3.5 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] hover:bg-ink-2 active:scale-[0.99] transition-all duration-[180ms]"
          >
            <span>{isFinal ? "Enter" : "Continue"}</span>
            <span className="mono text-[11px] opacity-60 group-hover:opacity-100 transition-opacity">↵</span>
          </button>
        </div>
      </main>

      <footer className="border-t border-[hsl(var(--border))] px-8 py-5 flex items-center justify-between">
        <div className="meta-label">Private  ·  By invitation</div>
        <div className="meta-label">Press ↵ to continue</div>
      </footer>
    </div>
  );
}
