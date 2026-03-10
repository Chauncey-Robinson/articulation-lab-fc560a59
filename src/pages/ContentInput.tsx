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
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">←</button>
        <button onClick={toggleMute} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-1 animate-fade-up stagger-1">{contextLabel}</p>
        <p className="text-[12px] font-sans text-ink-3 mb-1 animate-fade-up stagger-1">About 5 minutes · you explain it twice</p>

        <h1 className="font-serif text-[1.6rem] text-foreground mb-2 animate-fade-up stagger-2" style={{ marginTop: 4 }}>
          What do you want to get better at explaining?
        </h1>

        {/* Tabs */}
        <div className="flex gap-6 mb-5 mt-3 animate-fade-up stagger-3">
          <button
            onClick={() => setTab("paste")}
            className="text-[13px] font-sans pb-1 transition-colors duration-[180ms]"
            style={{
              color: tab === "paste" ? "hsl(var(--foreground))" : "hsl(var(--ink-3))",
              borderBottom: tab === "paste" ? "1.5px solid hsl(var(--accent))" : "none",
            }}
          >
            I'll paste something
          </button>
          <button
            onClick={() => setTab("topic")}
            className="text-[13px] font-sans pb-1 transition-colors duration-[180ms]"
            style={{
              color: tab === "topic" ? "hsl(var(--foreground))" : "hsl(var(--ink-3))",
              borderBottom: tab === "topic" ? "1.5px solid hsl(var(--accent))" : "none",
            }}
          >
            I'll just type a topic
          </button>
        </div>

        <div className="animate-fade-up stagger-4">
          {tab === "paste" ? (
            <>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste anything — a book chapter, article, notes, an email, a podcast summary. We'll find what matters."
                className="w-full min-h-[180px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y mb-1"
              />
              {pasteText.length > 0 && (
                <p className="text-[11px] font-sans text-ink-3 text-right mb-3">{pasteText.length} characters</p>
              )}
            </>
          ) : (
            <>
              <input
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                placeholder="e.g. behavioural economics, the book I just read about habits, how vaccines work..."
                className="w-full h-14 rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] mb-2"
              />
              <p className="text-[12px] font-sans text-ink-3 mb-3">
                We'll build a question from just this. No need to paste anything.
              </p>
            </>
          )}
        </div>

        <div className="mb-6 animate-fade-up stagger-5">
          <MicButton onTranscript={(t) => tab === "paste" ? setPasteText(t) : setTopicText(t)} />
        </div>

        <div className="mt-auto animate-fade-up stagger-6">
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Let's go
          </button>
        </div>
      </div>
    </div>
  );
}
