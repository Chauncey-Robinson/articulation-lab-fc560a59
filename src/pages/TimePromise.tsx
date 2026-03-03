import { useNavigate } from "react-router-dom";

export default function TimePromise() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Progress bar — 2.5 of 3 */}
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-primary" style={{ width: "66%" }} />
        <div className="flex-1 h-[2px] rounded-full bg-border" />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="text-base text-muted-foreground hover:text-foreground mb-8 self-start"
      >
        ←
      </button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col items-center">
        <h1 className="font-serif text-[1.8rem] text-foreground text-center mb-6" style={{ lineHeight: 1.3 }}>
          {"Built for people\nwho are always busy."}
        </h1>

        <div className="w-full rounded-lg bg-card border border-border p-5 mt-4">
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent">5 min</span>
            <span className="text-[13px] text-foreground">Average session. Fits between meetings.</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent">2×</span>
            <span className="text-[13px] text-foreground">Attempts per idea. Enough to feel the shift.</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent">1</span>
            <span className="text-[13px] text-foreground">Line you can use tomorrow. Every time.</span>
          </div>
        </div>

        <p className="text-[13px] text-muted-foreground text-center mt-5">
          Most people finish before their coffee gets cold.
        </p>

        <div className="mt-auto w-full">
          <button
            onClick={() => navigate("/privacy")}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            I can do that →
          </button>
        </div>
      </div>
    </div>
  );
}
