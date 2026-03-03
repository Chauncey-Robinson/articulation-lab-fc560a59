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
        <h1 className="font-serif text-[1.8rem] text-foreground text-center mb-0 whitespace-pre-line" style={{ lineHeight: 1.3 }}>
          {"No time?\nThat's exactly\nwho this is for."}
        </h1>

        <div className="w-full rounded-2xl bg-card p-5 mt-7 mb-5">
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent shrink-0">5 min</span>
            <span className="text-[13px] text-foreground">Long enough to actually help.</span>
          </div>
          <div className="h-px" style={{ background: "hsl(var(--block-empty))" }} />
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent shrink-0">2×</span>
            <span className="text-[13px] text-foreground">You explain it twice. That's the whole thing.</span>
          </div>
          <div className="h-px" style={{ background: "hsl(var(--block-empty))" }} />
          <div className="flex items-center gap-4 py-3">
            <span className="font-serif text-[1.4rem] text-accent shrink-0">1</span>
            <span className="text-[13px] text-foreground">Something you can actually say tomorrow.</span>
          </div>
        </div>

        <p className="text-[13px] text-muted-foreground text-center">
          Most people finish before their coffee gets cold.
        </p>

        <div className="mt-auto w-full">
          <button
            onClick={() => navigate("/privacy")}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            That works for me →
          </button>
        </div>
      </div>
    </div>
  );
}
