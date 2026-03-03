import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { getTasteFeedback } from "@/lib/ai";
import { useTTS } from "@/hooks/useSpeech";
import MicButton from "@/components/MicButton";

const TASTE_SOURCE = "The forgetting curve shows that people lose up to 70% of new information within 24 hours — unless they actively try to retrieve it.";

export default function Taste() {
  const navigate = useNavigate();
  const { muted } = useApp();
  const { speak } = useTTS();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getTasteFeedback(TASTE_SOURCE, text);
      setFeedback(result);
      if (!muted) speak(result);
    } catch (e: any) {
      setError(e.message || "Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (feedback) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
        {/* Progress bar */}
        <div className="flex gap-1 mb-6">
          <div className="flex-1 h-[2px] rounded-full bg-primary" />
          <div className="flex-1 h-[2px] rounded-full bg-primary" />
          <div className="flex-1 h-[2px] rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { setFeedback(""); }} className="text-base text-muted-foreground hover:text-foreground">←</button>
          <button onClick={() => navigate("/time-promise")} className="text-xs text-muted-foreground hover:text-foreground">Skip</button>
        </div>

        <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-3">TRY IT NOW</p>

          {/* AI feedback card */}
          <div className="rounded-lg p-5 mb-6 border-2 border-ai-card-border bg-ai-card">
            <p className="text-sm text-ai-card-foreground leading-[1.7]">{feedback}</p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => navigate("/time-promise")}
              className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              That's what every session feels like →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-border" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-base text-muted-foreground hover:text-foreground">←</button>
        <button onClick={() => navigate("/time-promise")} className="text-xs text-muted-foreground hover:text-foreground">Skip</button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-3">TRY IT NOW</p>

        <h1 className="font-serif text-[1.6rem] text-foreground mb-2" style={{ marginTop: 12 }}>
          {"30 seconds.\nThat's all this takes."}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Read this. Then explain it back in your own words.
        </p>

        {/* Source card */}
        <div className="rounded-lg p-5 mb-4 bg-section">
          <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-2">THE IDEA</p>
          <p className="text-sm text-foreground leading-[1.6] italic">
            {TASTE_SOURCE}
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Explain this in your own words..."
          className="w-full min-h-[90px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
        />
        <div className="mb-6">
          <MicButton onTranscript={(t) => setText(t)} />
        </div>

        {error && <ErrorBox message={error} />}

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || text.trim().length < 10}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "See how I did →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg px-4 py-3 mb-4 text-[13px]" style={{ background: "#FFF8F5", border: "1px solid hsl(var(--block-low))", color: "#C05050" }}>
      {message}
    </div>
  );
}
