import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Fluency — landing.
 * A single hairline. A single graphite mark. One sentence in editorial serif.
 * Restraint as positioning.
 */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = d.getUTCHours().toString().padStart(2, "0");
      const mm = d.getUTCMinutes().toString().padStart(2, "0");
      setNow(`${hh}:${mm} UTC`);
    };
    tick();
    const i = setInterval(tick, 30000);
    return () => clearInterval(i);
  }, []);

  const handleStart = () => navigate(user ? "/dashboard" : "/signin");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top frame — meta strip, mono, monocle-issue energy */}
      <header className="px-8 pt-7 pb-5 flex items-center justify-between animate-fade-in stagger-1">
        <div className="meta-label">Fluency / Edition 01</div>
        <div className="meta-label tabular">{now}</div>
      </header>

      <div className="h-px w-full bg-[hsl(var(--border))] animate-trace stagger-2" />

      {/* Body */}
      <main className="flex-1 flex flex-col px-8 pt-20 pb-12 max-w-[640px] mx-auto w-full">
        <div className="meta-label mb-10 animate-fade-up stagger-2">A cognitive operating system</div>

        <h1 className="editorial text-[clamp(3rem,9vw,5.5rem)] text-foreground mb-8 animate-fade-up stagger-3">
          For people whose<br />
          decisions <span className="editorial-italic">compound</span>.
        </h1>

        <p className="text-[15px] text-ink-2 leading-[1.55] max-w-[440px] mb-16 animate-fade-up stagger-4">
          Fluency converts expertise into leverage. A private layer for sharpening
          judgment between meetings, decisions, and the work that defines you.
        </p>

        <div className="flex-1 min-h-[40px]" />

        {/* CTA — tight, decisive, no pill flourish */}
        <div className="animate-fade-up stagger-5 flex flex-col gap-5">
          <button
            onClick={handleStart}
            className="group inline-flex items-center justify-between w-full max-w-[320px] bg-foreground text-background px-6 py-4 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] hover:bg-ink-2 active:scale-[0.99] transition-all duration-[180ms]"
          >
            <span>Begin</span>
            <span className="mono text-[11px] opacity-60 group-hover:opacity-100 transition-opacity">↵</span>
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="text-[12px] text-ink-3 hover:text-foreground transition-colors duration-[180ms] text-left tracking-wide"
          >
            Already a member  →
          </button>
        </div>
      </main>

      {/* Bottom hairline + colophon */}
      <footer className="border-t border-[hsl(var(--border))] px-8 py-5 flex items-center justify-between animate-fade-in stagger-6">
        <div className="meta-label">Private  ·  By invitation</div>
        <div className="meta-label tabular">№ 001</div>
      </footer>
    </div>
  );
}
