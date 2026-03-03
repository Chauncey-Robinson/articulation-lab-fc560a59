import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { getChallenge, getSummary } from "@/lib/ai";
import { useTTS } from "@/hooks/useSpeech";
import MicButton from "@/components/MicButton";

export default function Drill() {
  const navigate = useNavigate();
  const app = useApp();
  const { speak } = useTTS();

  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challengeReceived, setChallengeReceived] = useState(false);

  useEffect(() => {
    if (challengeReceived && app.challengeText && !app.muted) {
      speak(app.challengeText);
    }
  }, [challengeReceived, app.challengeText, app.muted, speak]);

  const replayChallenge = useCallback(() => {
    if (app.challengeText) speak(app.challengeText);
  }, [app.challengeText, speak]);

  const submitAttempt1 = async () => {
    setLoading(true);
    setError("");
    try {
      const challenge = await getChallenge(app.contextLabel, app.source, text);
      app.setAttempt1(text);
      app.setChallengeText(challenge);
      setChallengeReceived(true);
      setAttempt(2);
      setText("");
    } catch (e: any) {
      setError(e.message || "Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt2 = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await getSummary(app.contextLabel, app.source, app.attempt1, text);
      app.setAttempt2(text);
      app.setSummary(summary);
      const today = new Date().toISOString().split("T")[0];
      app.addSession({
        clarity: summary.clarity,
        example: summary.example,
        argument: summary.argument,
        date: today,
        context: app.contextLabel,
      });
      navigate("/summary");
    } catch (e: any) {
      setError(e.message || "Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
          {attempt === 1 ? "FIRST TRY" : "SECOND TRY"}
        </p>

        {attempt === 1 && (
          <>
            <p className="text-xs text-accent mb-4">Just say what you know</p>

            {/* Prompt card */}
            <div
              className="rounded-r-lg p-5 mb-5 bg-section"
              style={{ borderLeft: "3px solid hsl(var(--ai-card-border))" }}
            >
              <p className="text-sm text-foreground italic leading-[1.6]">
                Explain this like you're telling a friend what you just learned.
              </p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your explanation — or use the mic."
              className="w-full min-h-[140px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
            />
            <div className="mb-4">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto">
              <button
                onClick={submitAttempt1}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "See what I missed"}
              </button>
            </div>
          </>
        )}

        {attempt === 2 && (
          <>
            {/* AI challenge card */}
            <div className="rounded-lg p-5 mb-4 relative border-2 border-ai-card-border bg-ai-card">
              <p className="text-sm text-ai-card-foreground leading-[1.7]">
                {app.challengeText}
              </p>
              <button
                onClick={replayChallenge}
                className="absolute bottom-3 right-4 text-xs text-muted-foreground hover:text-foreground"
              >
                ↺ Replay
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Have another go. Use what it said above.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your second attempt..."
              className="w-full min-h-[140px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-3"
            />
            <div className="mb-4">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto">
              <button
                onClick={submitAttempt2}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "That's my best"}
              </button>
            </div>
          </>
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
