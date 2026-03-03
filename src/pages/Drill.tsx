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

  // Speak challenge when received
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
      const challenge = await getChallenge(app.context, app.source, text);
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
      const summary = await getSummary(app.context, app.source, app.attempt1, text);
      app.setAttempt2(text);
      app.setSummary(summary);
      app.addSession({ clarity: summary.clarity, example: summary.example, argument: summary.argument });
      navigate("/summary");
    } catch (e: any) {
      setError(e.message || "Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [attempt, loading]);

  // Reset timer on attempt change
  useEffect(() => {
    setSeconds(60);
  }, [attempt]);

  const timerPct = (seconds / 60) * 100;

  return (
    <div className="max-w-lg mx-auto">
      {/* Timer bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[3px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary/40 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums w-7 text-right">{seconds}s</span>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Attempt {attempt} of 2
      </p>

      {/* Attempt 1 prompt */}
      {attempt === 1 && (
        <>
          <div className="rounded-lg border border-border bg-card px-5 py-4 mb-6 border-l-[3px] border-l-primary">
            <p className="text-sm italic text-foreground leading-relaxed">
              Explain this in your own words — as if you're in a meeting and someone just asked you to summarise it.
            </p>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your explanation — or use the mic below."
            className="w-full min-h-[140px] rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
          <div className="mt-2 mb-4">
            <MicButton onTranscript={(t) => setText(t)} />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            onClick={submitAttempt1}
            disabled={loading || text.trim().length < 10}
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "Submit & Get Challenge"}
          </button>
        </>
      )}

      {/* Attempt 2 */}
      {attempt === 2 && (
        <>
          {/* AI challenge dark card */}
          <div className="rounded-lg bg-surface-dark px-5 py-4 mb-4 relative">
            <p className="text-sm text-surface-dark-foreground leading-[1.7]">
              {app.challengeText}
            </p>
            <button
              onClick={replayChallenge}
              className="absolute bottom-3 right-4 text-xs text-surface-dark-foreground/60 hover:text-surface-dark-foreground"
            >
              ↺ Replay
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Now try again. Use the challenge above.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your explanation — or use the mic below."
            className="w-full min-h-[140px] rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
          <div className="mt-2 mb-4">
            <MicButton onTranscript={(t) => setText(t)} />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            onClick={submitAttempt2}
            disabled={loading || text.trim().length < 10}
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "Submit Final Attempt"}
          </button>
        </>
      )}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: "#fff5f5", border: "1px solid #fcc", color: "#c00" }}>
      {message}
    </div>
  );
}
