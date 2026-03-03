import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Trial() {
  const navigate = useNavigate();
  const { setOnboarded } = useApp();

  const handleStart = () => {
    setOnboarded(true);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "hsl(var(--surface-light))" }}>
      <div className="max-w-[460px] w-full text-center">
        <span className="inline-block rounded-full px-4 py-1 text-xs text-accent mb-6" style={{ background: "#FFF3E0" }}>
          Free Trial
        </span>

        <h1 className="font-serif text-[2rem] text-foreground mb-3">
          14 days, yours. 🎉
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {"No credit card. No pressure.\nAfter your trial: 3 free drills per week, forever."}
        </p>

        <p className="font-serif text-[5rem] text-accent leading-none mb-1">14</p>
        <p className="text-xs text-muted-foreground mb-6">days free</p>

        <p className="text-[11px] text-legal mb-8">
          After trial → 3 drills/week free · or £12.99/mo unlimited
        </p>

        <button
          onClick={handleStart}
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Start drilling →
        </button>
      </div>
    </div>
  );
}
