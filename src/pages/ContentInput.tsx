import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import MicButton from "@/components/MicButton";

export default function ContentInput() {
  const navigate = useNavigate();
  const { contextLabel, setSource } = useApp();
  const [text, setText] = useState("");

  const handleStart = () => {
    setSource(text);
    navigate("/drill");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-base text-muted-foreground hover:text-foreground">←</button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-1">{contextLabel}</p>
        <p className="text-xs text-muted-foreground mb-1">Under 5 minutes · 2 attempts</p>

        <h1 className="font-serif text-[1.4rem] text-foreground mb-5" style={{ marginTop: 4 }}>
          {"What are you preparing\nto explain?"}
        </h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes, a summary, or key ideas."
          className="w-full min-h-[160px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
        />
        <div className="mb-6">
          <MicButton onTranscript={(t) => setText(t)} />
        </div>

        <div className="mt-auto">
          <button
            onClick={handleStart}
            disabled={text.trim().length < 20}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Rehearsal
          </button>
        </div>
      </div>
    </div>
  );
}
