import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-up stagger-1">
          <span className="inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-bright amber-pulse" />
            AI TUTOR
          </span>
        </div>

        <h1 className="font-serif text-[2.4rem] leading-[1.1] tracking-[-1px] text-foreground mb-4 animate-fade-up stagger-2">
          Learn anything.<br />Own it forever.
        </h1>

        <p className="font-sans text-[15px] text-ink-3 mb-8 max-w-[340px] animate-fade-up stagger-3">
          Upload what you're studying. AI splits it into lessons, tests your knowledge, and makes you teach it back — until it's yours.
        </p>

        <div className="w-full max-w-[340px] flex flex-col gap-3 animate-fade-up stagger-4">
          <button onClick={handleStart}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms]">
            Get started
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 w-full max-w-[340px] animate-fade-up stagger-5">
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">1.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">Upload any material — articles, notes, chapters.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">2.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">AI creates mini-lectures and quizzes for you.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">3.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">Teach it back, apply it, and test until you own it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
