import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import MicButton from "@/components/MicButton";

export default function ContentInput() {
  const navigate = useNavigate();
  const { contextLabel, setSource, muted, toggleMute } = useApp();
  const [tab, setTab] = useState<"paste" | "topic">("paste");
  const [pasteText, setPasteText] = useState("");
  const [topicText, setTopicText] = useState("");

  const activeText = tab === "paste" ? pasteText : topicText;
  const minChars = tab === "paste" ? 20 : 3;
  const isValid = activeText.trim().length >= minChars;

  const handleStart = () => {
    setSource(activeText);
    navigate("/practice", { state: { source: activeText } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-base text-muted-foreground hover:text-foreground">←</button>
        <button onClick={toggleMute} className="text-base text-muted-foreground hover:text-foreground">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-1">{contextLabel}</p>
        <p className="text-xs text-muted-foreground mb-1">About 5 minutes · you explain it twice</p>

        <h1 className="font-serif text-[1.4rem] text-foreground mb-2 whitespace-pre-line" style={{ marginTop: 4 }}>
          {"What do you want to\nget better at explaining?"}
        </h1>

        {/* Tabs */}
        <div className="flex gap-6 mb-5 mt-3">
          <button
            onClick={() => setTab("paste")}
            className="text-[13px] pb-1 transition-colors"
            style={{
              color: tab === "paste" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              borderBottom: tab === "paste" ? "1.5px solid hsl(var(--selected-border))" : "none",
            }}
          >
            I'll paste something
          </button>
          <button
            onClick={() => setTab("topic")}
            className="text-[13px] pb-1 transition-colors"
            style={{
              color: tab === "topic" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              borderBottom: tab === "topic" ? "1.5px solid hsl(var(--selected-border))" : "none",
            }}
          >
            I'll just type a topic
          </button>
        </div>

        {tab === "paste" ? (
          <>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"Paste anything — a book chapter, article,\nnotes, an email, a podcast summary.\nWe'll find what matters."}
              className="w-full min-h-[160px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-1"
            />
            {pasteText.length > 0 && (
              <p className="text-[11px] text-legal text-right mb-3">{pasteText.length} characters</p>
            )}
          </>
        ) : (
          <>
            <input
              value={topicText}
              onChange={(e) => setTopicText(e.target.value)}
              placeholder="e.g. behavioural economics, the book I just read about habits, how vaccines work..."
              className="w-full h-14 rounded-lg border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border mb-2"
            />
            <p className="text-xs text-muted-foreground mb-3">
              We'll build a question from just this. No need to paste anything.
            </p>
          </>
        )}

        <div className="mb-6">
          <MicButton onTranscript={(t) => tab === "paste" ? setPasteText(t) : setTopicText(t)} />
        </div>

        <div className="mt-auto">
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Let's go
          </button>
        </div>
      </div>
    </div>
  );
}
