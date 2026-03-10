import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/hooks/useAuth";
import MicButton from "@/components/MicButton";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSource } = useApp();
  const [pasteText, setPasteText] = useState("");

  const isValid = pasteText.trim().length >= 20;

  const handleStart = () => {
    setSource(pasteText);
    if (user) {
      navigate("/practice", { state: { source: pasteText } });
    } else {
      navigate("/signin", { state: { pendingSource: pasteText } });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col max-w-[1160px] mx-auto w-full px-6 py-12 md:py-24">
        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 flex-1">
          {/* Left — headline + input */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="animate-fade-up stagger-1">
              <span className="inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-bright amber-pulse" />
                EXPLANATION TRAINING
              </span>
            </div>

            <h1 className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.1] tracking-[-1px] text-foreground mb-4 animate-fade-up stagger-2">
              You know more than<br />you can explain.
            </h1>

            <p className="font-sans text-[15px] text-ink-3 mb-8 max-w-[420px] animate-fade-up stagger-3">
              Practice explaining ideas until they stick.
            </p>

            <div className="animate-fade-up stagger-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste something you want to be able to explain — an article, meeting notes, a concept from a course."
                className="w-full min-h-[180px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y"
              />
            </div>

            <div className="flex items-center gap-4 mt-3 mb-4 animate-fade-up stagger-5">
              <MicButton onTranscript={(t) => setPasteText(t)} />
              {pasteText.length > 0 && (
                <span className="text-[11px] font-sans text-ink-3">{pasteText.length} characters</span>
              )}
            </div>

            <div className="animate-fade-up stagger-6">
              <button
                onClick={handleStart}
                disabled={!isValid}
                className="w-full max-w-[420px] rounded-pill bg-accent-bright py-4 text-[13px] font-sans font-semibold tracking-[0.05em] text-white hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Start practicing
              </button>
            </div>

            <p className="text-[12px] font-sans text-ink-3 mt-3 animate-fade-up stagger-7">
              Takes about 5 minutes. Your content stays private.
            </p>
          </div>

          {/* Right — sample card (desktop only) */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="w-full max-w-[440px] bg-card rounded-[22px] border-[1.5px] border-border p-8 shadow-card-hover animate-fade-up stagger-4">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-4">
                KEY CONCEPT · EXTRACTED BY AI
              </p>

              <h3 className="font-serif text-[24px] tracking-[-0.5px] text-foreground mb-3">
                Double materiality is a two-way mirror, not a window.
              </h3>

              <p className="font-serif text-[16px] font-light leading-[1.65] text-ink-2 mb-5">
                Most ESG practitioners look one way — at financial risk to
                the business. The GRI framework demands you look in both
                directions before you can say you've reported responsibly.
              </p>

              <div className="border-t border-border my-4" />

              <div className="border-l-[2.5px] border-accent-bright bg-surface-2 rounded-[12px] px-[18px] py-4">
                <p className="font-serif text-[16px] italic text-ink-2 leading-[1.6]">
                  "Now — how would you explain that to a sceptical CFO
                  in 30 seconds?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
