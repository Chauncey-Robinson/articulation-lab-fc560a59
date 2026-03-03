import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { extractKeyIdea, getChallenge, getSummary } from "@/lib/ai";
import { useTTS } from "@/hooks/useSpeech";
import MicButton from "@/components/MicButton";

type Phase = "extracting" | "first" | "second";

export default function Drill() {
  const navigate = useNavigate();
  const app = useApp();
  const { speak } = useTTS();

  const [phase, setPhase] = useState<Phase>("extracting");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challengeReceived, setChallengeReceived] = useState(false);

  // Extract key idea on mount
  useEffect(() => {
    if (phase !== "extracting") return;
    let cancelled = false;
    (async () => {
      try {
        const result = await extractKeyIdea(app.source);
        if (cancelled) return;
        app.setKeyIdea(result.keyIdea);
        app.setKeyQuestion(result.question);
        setPhase("first");
        if (!app.muted) speak(result.question);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Something went wrong. Check your connection and try again.");
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (challengeReceived && app.challengeText && !app.muted) {
      speak(app.challengeText);
    }
  }, [challengeReceived, app.challengeText, app.muted, speak]);

  const replayChallenge = useCallback(() => {
    if (app.challengeText) speak(app.challengeText);
  }, [app.challengeText, speak]);

  const replayQuestion = useCallback(() => {
    if (app.keyQuestion) speak(app.keyQuestion);
  }, [app.keyQuestion, speak]);

  const submitFirst = async () => {
    setLoading(true);
    setError("");
    try {
      const challenge = await getChallenge(app.contextLabel, app.keyIdea, text);
      app.setAttempt1(text);
      app.setChallengeText(challenge);
      setChallengeReceived(true);
      setPhase("second");
      setText("");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitSecond = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await getSummary(app.contextLabel, app.keyIdea, app.attempt1, text);
      app.setAttempt2(text);
      app.setSummary(summary);
      const today = new Date().toISOString().split("T")[0];
      app.addSession({
        clarity: summary.clarity,
        example: summary.example,
        held_together: summary.held_together,
        date: today,
        context: app.contextLabel,
        key_idea: app.keyIdea,
        topic_snippet: app.source.slice(0, 60),
        say_tomorrow: summary.say_tomorrow,
      });
      navigate("/summary");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extracting phase — loading screen
  if (phase === "extracting" && !error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Reading what you shared...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-base text-muted-foreground hover:text-foreground">←</button>
        <button onClick={app.toggleMute} className="text-base text-muted-foreground hover:text-foreground">
          {app.muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">

        {/* Key idea card — always visible */}
        <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-2">WE FOUND THIS</p>
        <div className="rounded-lg p-5 mb-5 bg-section">
          <p className="text-sm text-foreground leading-[1.6]">{app.keyIdea}</p>
        </div>

        {phase === "first" && (
          <>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">FIRST TRY</p>

            {/* Question card */}
            <div className="rounded-lg p-5 mb-5 border-2 border-ai-card-border bg-ai-card relative">
              <p className="text-sm text-ai-card-foreground italic leading-[1.6]">{app.keyQuestion}</p>
              <button onClick={replayQuestion} className="absolute bottom-3 right-4 text-xs text-muted-foreground hover:text-foreground">↺</button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Explain it like you're telling a friend..."
              className="w-full min-h-[120px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
            />
            <div className="mb-4">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto">
              <button
                onClick={submitFirst}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "See what I missed"}
              </button>
            </div>
          </>
        )}

        {phase === "second" && (
          <>
            {/* AI challenge card */}
            <div className="rounded-lg p-5 mb-4 relative border-2 border-ai-card-border bg-ai-card">
              <p className="text-sm text-ai-card-foreground leading-[1.7]">{app.challengeText}</p>
              <button onClick={replayChallenge} className="absolute bottom-3 right-4 text-xs text-muted-foreground hover:text-foreground">↺ Replay</button>
            </div>

            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">SECOND TRY</p>
            <p className="text-[13px] text-muted-foreground mb-4">
              Have another go. Use what it said above.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Try again — you've got this..."
              className="w-full min-h-[120px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
            />
            <div className="mb-4">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto">
              <button
                onClick={submitSecond}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "That's my best"}
              </button>
            </div>
          </>
        )}

        {/* Show error on extract phase */}
        {phase === "extracting" && error && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <ErrorBox message={error} />
            <button
              onClick={() => { setError(""); setPhase("extracting"); }}
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity mt-4"
            >
              Try again
            </button>
          </div>
        )}
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
