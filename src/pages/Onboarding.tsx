import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const situations = [
  "I read a lot but can't remember it a month later",
  "I understand ideas but go blank when asked to explain them",
  "I know the material — I just can't say it clearly under pressure",
  "I take notes but never go back to them",
  "I want to sound sharper in meetings and presentations",
  "I learn constantly but struggle to actually apply it",
];

function getPersonalisedMessage(selected: string[]): string {
  const joined = selected.join(" ");
  if (joined.includes("go blank") || joined.includes("under pressure")) {
    return "Cognitive Drill is built\nfor exactly that moment.";
  }
  if (joined.includes("remember") || joined.includes("notes")) {
    return "You're already doing\nthe hard part. This closes the loop.";
  }
  return "You're in the right place.\nLet's get started.";
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { setContext } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [showResponse, setShowResponse] = useState(false);

  const toggle = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleNext = () => {
    setContext(selected.join(", "));
    setShowResponse(true);
  };

  // Auto-advance after 1.8s
  useEffect(() => {
    if (!showResponse) return;
    const timer = setTimeout(() => navigate("/input"), 1800);
    return () => clearTimeout(timer);
  }, [showResponse, navigate]);

  if (showResponse) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-[320px]">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
            PERFECT
          </p>
          <h1 className="font-serif text-[1.8rem] leading-tight text-foreground whitespace-pre-line">
            {getPersonalisedMessage(selected)}
          </h1>
          <button
            onClick={() => navigate("/input")}
            className="mt-10 text-xs text-muted-foreground hover:text-foreground"
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
        <div className="flex-1 h-[2px] rounded-full bg-foreground" />
        <div className="flex-1 h-[2px] rounded-full bg-border" />
      </div>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-muted-foreground hover:text-foreground mb-8 self-start"
      >
        ←
      </button>

      <div className="max-w-[480px] mx-auto w-full">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-2">
          Which of these sounds like you?
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
                  background: isSelected ? "#f0f2fd" : "hsl(var(--card))",
                  borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
