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
        <h1 className="font-serif text-[2.4rem] leading-[1.1] tracking-[-1px] text-foreground mb-4 animate-fade-up stagger-1">
          Learn anything.<br />Own it forever.
        </h1>

        <p className="font-sans text-[15px] text-ink-3 mb-8 max-w-[340px] animate-fade-up stagger-2">
          Paste anything you're learning. We coach you until you can explain it yourself.
        </p>

        <div className="w-full max-w-[340px] flex flex-col gap-3 animate-fade-up stagger-3">
          <button onClick={handleStart}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms]">
            Get started
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 w-full max-w-[340px] animate-fade-up stagger-4">
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">1.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">Paste a topic, article, or anything you want to know better.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">2.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">Your AI coach breaks it down and asks you to explain it back.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent-bright text-[16px] mt-0.5">3.</span>
            <p className="text-[13px] font-sans text-ink-3 text-left">You talk. We coach. You keep going until it clicks.</p>
          </div>
        </div>

        <p className="text-[13px] font-sans text-ink-3 mt-6 animate-fade-up stagger-5">No account needed to start.</p>
      </div>
    </div>
  );
}
