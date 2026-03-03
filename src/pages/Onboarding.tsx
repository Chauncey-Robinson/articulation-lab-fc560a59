import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const situations = [
  "I read a lot but can't remember it weeks later",
  "I understand ideas but go blank when explaining them",
  "I know the material — I just freeze under pressure",
  "I take notes but never go back to them",
  "I want to sound sharper in meetings",
  "I learn constantly but struggle to apply it",
];

function getPersonalisedMessage(selected: string[]): string {
  const joined = selected.join(" ");
  if (joined.includes("go blank") || joined.includes("freeze")) {
    return "This is built for\nexactly that moment.";
  }
  if (joined.includes("remember") || joined.includes("notes")) {
    return "You're doing the hard part.\nThis closes the loop.";
  }
  if (joined.includes("meetings")) {
    return "You'll have something to say\nin every meeting.";
  }
  return "You're in the right place.\nLet's get started.";
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { setPainSelections } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<"pain" | "response">("pain");

  const toggle = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleNext = () => {
    setPainSelections(selected);
    setStep("response");
  };

  // Auto-advance from response after 2.2s
  useEffect(() => {
    if (step !== "response") return;
    const timer = setTimeout(() => navigate("/taste"), 2200);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  if (step === "response") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "hsl(var(--surface-light))" }}>
        <div className="text-center max-w-[300px]">
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-4">
            PERFECT
          </p>
          <h1 className="font-serif text-[1.8rem] leading-[1.3] text-foreground whitespace-pre-line">
            {getPersonalisedMessage(selected)}
          </h1>
          <button
            onClick={() => navigate("/taste")}
            className="mt-10 text-xs text-legal hover:text-muted-foreground"
          >
            Skip →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-border" />
        <div className="flex-1 h-[2px] rounded-full bg-border" />
      </div>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-base text-muted-foreground hover:text-foreground mb-8 self-start"
      >
        ←
      </button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[1.9rem] text-foreground mb-2" style={{ marginTop: 36 }}>
          {"Which of these\nsounds like you?"}
        </h1>
        <p className="text-[13px] text-muted-foreground mb-6">
          Select all that apply.
        </p>

        <div className="flex flex-col gap-[10px] mb-8">
          {situations.map((s) => {
            const isSelected = selected.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className="w-full text-left px-5 py-4 rounded-lg border text-sm transition-colors"
                style={{
                  background: isSelected ? "hsl(var(--selected))" : "hsl(var(--card))",
                  borderColor: isSelected ? "hsl(var(--selected-border))" : "hsl(var(--border))",
                  borderWidth: isSelected ? "1.5px" : "1px",
                  color: "hsl(var(--foreground))",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
