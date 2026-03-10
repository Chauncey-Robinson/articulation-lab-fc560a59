import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { extractKeyIdea, getChallenge, getSummary, getScenario } from "@/lib/ai";
import { useTTS } from "@/hooks/useSpeech";
import MicButton from "@/components/MicButton";

type Phase = "extracting" | "first" | "second";

export default function Drill() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useApp();
  const { speak } = useTTS();

  const [phase, setPhase] = useState<Phase>("extracting");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challengeReceived, setChallengeReceived] = useState(false);
  const [scenarioText, setScenarioText] = useState("");
  const [isColdRecall, setIsColdRecall] = useState(false);

  const sourceText = (location.state as any)?.source || app.source;
  const existingConceptId = (location.state as any)?.conceptId || app.currentConceptId;
  const existingKeyIdea = (location.state as any)?.keyIdea || "";
  const practiceCount = (location.state as any)?.practiceCount || 0;

  useEffect(() => {
    if (sourceText && !app.source) app.setSource(sourceText);
  }, [sourceText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract key idea on mount OR handle scenario/cold recall
  useEffect(() => {
    if (phase !== "extracting") return;
    let cancelled = false;

    (async () => {
      try {
        // Cold recall mode: practice_count >= 3
        if (practiceCount >= 3 && existingKeyIdea) {
          setIsColdRecall(true);
          app.setKeyIdea(existingKeyIdea);
          app.setKeyQuestion("Explain this back to me like you are telling a friend who has never heard of this.");
          if (existingConceptId) app.setCurrentConceptId(existingConceptId);
          setPhase("first");
          return;
        }

        // Scenario mode: practice_count >= 1 (second session onwards)
        if (practiceCount >= 1 && existingKeyIdea) {
          app.setKeyIdea(existingKeyIdea);
          if (existingConceptId) app.setCurrentConceptId(existingConceptId);
          try {
            const scenario = await getScenario(
              sourceText?.slice(0, 60) || "",
              existingKeyIdea
            );
            if (cancelled) return;
            setScenarioText(scenario);
            app.setKeyQuestion(scenario);
            if (!app.muted) speak(scenario);
          } catch {
            app.setKeyQuestion("Explain this back to me like you are telling a friend who has never heard of this.");
          }
          setPhase("first");
          return;
        }

        // Standard extraction
        const result = await extractKeyIdea(sourceText);
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

      await app.saveConceptAndSession({
        topicSnippet: sourceText?.slice(0, 60) || app.keyIdea.slice(0, 60),
        keyIdea: app.keyIdea,
        sourceContent: sourceText || "",
        summary,
        existingConceptId: existingConceptId || undefined,
      });

      navigate("/summary", { state: { isColdRecall } });
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
        <p className="text-[15px] font-sans text-ink-3">Reading what you shared...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">←</button>
        <button onClick={app.toggleMute} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">
          {app.muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="max-w-[640px] mx-auto w-full flex-1 flex flex-col">

        {/* Cold recall banner */}
        {isColdRecall && phase === "first" && (
          <div className="mb-5 animate-fade-up stagger-1">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-1">LET'S SEE IF THIS STUCK</p>
            <p className="text-[12px] font-sans text-ink-3">No hints this time.</p>
          </div>
        )}

        {/* Key idea card — visible unless cold recall */}
        {!isColdRecall && (
          <div className="animate-fade-up stagger-1">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">HERE'S THE CORE IDEA</p>
            <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 mb-5">
              <p className="font-serif text-[19px] font-light leading-[1.65] text-ink-2">{app.keyIdea}</p>
            </div>
          </div>
        )}

        {phase === "first" && (
          <>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-2">NOW YOU EXPLAIN IT</p>

            {/* Question / scenario card */}
            {scenarioText ? (
              <div className="border-l-[2.5px] border-accent-bright bg-surface-2 rounded-[12px] px-[18px] py-4 mb-5 relative animate-fade-up stagger-3">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">HERE'S A SITUATION</p>
                <p className="font-serif text-[16px] italic text-ink-2 leading-[1.6]">{scenarioText}</p>
                <p className="text-[12px] font-sans text-ink-3 mt-2">How do you respond?</p>
                <button onClick={replayQuestion} className="absolute bottom-3 right-4 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">↺</button>
              </div>
            ) : !isColdRecall ? (
              <div className="border-l-[2.5px] border-accent-bright bg-surface-2 rounded-[12px] px-[18px] py-4 mb-5 relative animate-fade-up stagger-3">
                <p className="font-serif text-[16px] italic text-ink-2 leading-[1.6]">{app.keyQuestion}</p>
                <button onClick={replayQuestion} className="absolute bottom-3 right-4 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">↺</button>
              </div>
            ) : null}

            <div className="animate-fade-up stagger-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start your explanation…"
                className="w-full min-h-[120px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y mb-2"
              />
              <p className="text-[12px] font-sans text-ink-3 mb-3">Write like you'd speak. Don't worry about being perfect.</p>
            </div>

            <div className="mb-4 animate-fade-up stagger-5">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto animate-fade-up stagger-6">
              <button
                onClick={submitFirst}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Thinking..." : "See what I missed"}
              </button>
            </div>
          </>
        )}

        {phase === "second" && (
          <>
            {/* AI challenge card */}
            <div className="bg-card rounded-[22px] border-[1.5px] border-border p-6 mb-5 relative animate-fade-up stagger-1">
              <p className="font-serif text-[17px] font-light leading-[1.7] text-ink-2">{app.challengeText}</p>
              <button onClick={replayChallenge} className="absolute bottom-4 right-5 text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]">↺</button>
            </div>

            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2 animate-fade-up stagger-2">LET'S GO DEEPER</p>
            <p className="text-[14px] font-sans text-ink-3 mb-4 animate-fade-up stagger-2">
              Have another go. Use what it said above.
            </p>

            <div className="animate-fade-up stagger-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Try again — you've got this…"
                className="w-full min-h-[120px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y mb-3"
              />
            </div>

            <div className="mb-4 animate-fade-up stagger-4">
              <MicButton onTranscript={(t) => setText(t)} />
            </div>

            {error && <ErrorBox message={error} />}

            <div className="mt-auto animate-fade-up stagger-5">
              <button
                onClick={submitSecond}
                disabled={loading || text.trim().length < 10}
                className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="rounded-pill bg-primary px-8 py-3 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] mt-4"
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
    <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive">
      {message}
    </div>
  );
}
