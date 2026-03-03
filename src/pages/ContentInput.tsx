import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import MicButton from "@/components/MicButton";

export default function ContentInput() {
  const navigate = useNavigate();
  const { context, setSource } = useApp();
  const [text, setText] = useState("");

  const handleStart = () => {
    setSource(text);
    navigate("/drill");
  };

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-xs text-muted-foreground mb-1">
        {context} · 7-Minute Drill
      </p>
      <h1 className="font-serif text-2xl text-foreground mb-6">
        What are you preparing to explain?
      </h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste notes, summary, or key ideas."
        className="w-full min-h-[160px] rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />
      <div className="mt-2 mb-6">
        <MicButton onTranscript={(t) => setText(t)} />
      </div>
      <button
        onClick={handleStart}
        disabled={text.trim().length < 20}
        className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Rehearsal
      </button>
    </div>
  );
}
