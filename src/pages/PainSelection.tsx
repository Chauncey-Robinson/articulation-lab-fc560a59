import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const situations = [
  { icon: "📊", label: "Client meetings", desc: "Explaining to non-specialists under time pressure" },
  { icon: "🏢", label: "Board or leadership", desc: "High stakes, two minutes, no notes" },
  { icon: "💬", label: "Team discussions", desc: "Being the person who actually knows" },
];

export default function PainSelection() {
  const navigate = useNavigate();
  const { setPainSelections, setPainAsked } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const handleNext = () => {
    setPainSelections(selected);
    setPainAsked(true);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button
        onClick={() => { setPainAsked(true); navigate("/home"); }}
        className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] mb-8 self-start"
      >
        ←
      </button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[clamp(1.8rem,4vw,2.4rem)] leading-[1.1] tracking-[-0.5px] text-foreground mb-8 animate-fade-up stagger-1">
          Where do you most need to explain things?
        </h1>

        <div className="flex flex-col gap-3 mb-8">
          {situations.map((s, idx) => {
            const isSelected = selected.includes(s.label);
            return (
              <button
                key={s.label}
                onClick={() => toggle(s.label)}
                className={`w-full text-left rounded-[14px] border-[1.5px] px-5 py-4 transition-all duration-[180ms] animate-fade-up`}
                style={{
                  animationDelay: `${(idx + 2) * 65}ms`,
                  background: isSelected ? "hsl(var(--primary))" : "hsl(var(--card))",
                  borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
                  color: isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[20px] mt-0.5">{s.icon}</span>
                  <div>
                    <p className="text-[15px] font-sans font-medium">{s.label}</p>
                    <p className="text-[12px] font-sans mt-0.5" style={{
                      color: isSelected ? "hsl(var(--primary-foreground) / 0.7)" : "hsl(var(--ink-3))",
                    }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto animate-fade-up stagger-6">
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Set up my first session →
          </button>
          <button
            onClick={() => { setPainAsked(true); navigate("/home"); }}
            className="w-full text-center mt-3 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
