import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { getState, updateState } from "@/lib/store";

type Phase = "prompt" | "recording" | "feedback" | "round2-prompt" | "round2-recording" | "round2-feedback" | "complete";

const CONSTRAINTS = [
  "Explain this idea to a skeptical colleague.",
  "Explain without using jargon.",
  "Defend this against a critical CFO.",
  "Summarize in 30 seconds.",
  "Explain the trade-offs.",
];

const ROUND1_FEEDBACK = [
  "You defined the concept.",
  "You did not explain why it matters.",
  "No concrete example was given.",
];

const ROUND2_IMPROVEMENT = [
  "You added an example.",
  "Your explanation became more concrete.",
  "Your structure improved.",
];

const ROUND2_STILL_NEEDED = [
  "Structure remained similar.",
  "Still abstract.",
  "Add a stakeholder perspective.",
];

function CountdownTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const called = useRef(false);

  useEffect(() => {
    called.current = false;
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          if (!called.current) {
            called.current = true;
            setTimeout(onComplete, 0);
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, onComplete]);

  const pct = (remaining / seconds) * 100;

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary/40 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{remaining}s</span>
    </div>
  );
}

export default function Drill() {
  const state = useMemo(() => getState(), []);
  const concepts = state.concepts;
  const sessionCount = state.drillResults.length;

  const [conceptIndex, setConceptIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(concepts.length > 0 ? "prompt" : "complete");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [improved, setImproved] = useState(true);

  const currentConcept = concepts[conceptIndex];
  const constraint = CONSTRAINTS[sessionCount % CONSTRAINTS.length];

  const simulateRecording = useCallback((nextPhase: Phase) => {
    setIsRecording(true);
    setPhase(phase.includes("round2") ? "round2-recording" : "recording");
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("The concept relates to strategic decision-making under constraints, balancing short-term pressures against long-term value creation...");
      setPhase(nextPhase);
    }, 3000);
  }, [phase]);

  const handleFinish = () => {
    updateState((s) => ({
      ...s,
      concepts: s.concepts.map((c) =>
        c.id === currentConcept?.id
          ? { ...c, strength: "building" as const, drillCount: c.drillCount + 1, lastArticulated: new Date().toISOString() }
          : c
      ),
      drillResults: [
        ...s.drillResults,
        {
          conceptId: currentConcept?.id || "",
          date: new Date().toISOString(),
          completeness: 70,
          structure: 75,
          clarity: 65,
          precision: 60,
          specificity: 55,
          applicationDepth: "moderate" as const,
        },
      ],
    }));
    setPhase("complete");
  };

  const onTimerComplete = useCallback(() => {
    // Auto-stop after timer expires if still recording
  }, []);

  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="text-sm text-muted-foreground mb-4">Nothing to rehearse yet.</p>
        <Link to="/input" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Add Content
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <AnimatePresence mode="wait">
        {/* ROUND 1 — Constrained Explanation */}
        {phase === "prompt" && (
          <motion.div key="prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-6">Round 1</p>

            <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-tight text-foreground mb-3 max-w-lg mx-auto">
              You have 60 seconds.
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              {constraint}
            </p>

            <div className="mb-10 rounded-lg border border-border bg-card px-5 py-4 max-w-md mx-auto">
              <p className="text-sm text-foreground leading-relaxed">{currentConcept.text}</p>
            </div>

            <button
              onClick={() => simulateRecording("feedback")}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Record
            </button>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-xl">
            <CountdownTimer seconds={60} onComplete={onTimerComplete} />
            <p className="text-xs text-muted-foreground mb-8">Listening...</p>
            <WaveformVisualizer active={isRecording} />
            <button
              onClick={() => {
                setIsRecording(false);
                setTranscript("The concept relates to strategic decision-making under constraints, balancing short-term pressures against long-term value creation...");
                setPhase("feedback");
              }}
              className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Done
            </button>
          </motion.div>
        )}

        {/* ROUND 1 FEEDBACK */}
        {phase === "feedback" && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-4">Round 1 — Feedback</p>

            <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-2">
              {ROUND1_FEEDBACK.map((line, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
              ))}
            </div>

            {transcript && (
              <div className="rounded-lg bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">What you said</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{transcript}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-lg font-light text-foreground mb-6">
                Try again.<br />
                <span className="text-muted-foreground">This time: include one real-world example.</span>
              </p>
              <button
                onClick={() => {
                  setTranscript("");
                  setPhase("round2-prompt");
                }}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Round 2
              </button>
            </div>
          </motion.div>
        )}

        {/* ROUND 2 — Revision */}
        {phase === "round2-prompt" && (
          <motion.div key="round2-prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-6">Round 2 — Revision</p>

            <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-tight text-foreground mb-3 max-w-lg mx-auto">
              Same idea. Sharper this time.
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Include a concrete example and explain why it matters.
            </p>

            <div className="mb-10 rounded-lg border border-border bg-card px-5 py-4 max-w-md mx-auto">
              <p className="text-sm text-foreground leading-relaxed">{currentConcept.text}</p>
            </div>

            <button
              onClick={() => {
                setIsRecording(true);
                setPhase("round2-recording");
                setTimeout(() => {
                  setIsRecording(false);
                  setTranscript("For example, in Q3 when the team faced budget constraints, we applied this framework by prioritizing stakeholder alignment over speed...");
                  setImproved(Math.random() > 0.3);
                  setPhase("round2-feedback");
                }, 3000);
              }}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Record
            </button>
          </motion.div>
        )}

        {phase === "round2-recording" && (
          <motion.div key="round2-recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-xl">
            <CountdownTimer seconds={60} onComplete={onTimerComplete} />
            <p className="text-xs text-muted-foreground mb-8">Listening...</p>
            <WaveformVisualizer active={isRecording} />
            <button
              onClick={() => {
                setIsRecording(false);
                setTranscript("For example, in Q3 when the team faced budget constraints, we applied this framework by prioritizing stakeholder alignment over speed...");
                setImproved(true);
                setPhase("round2-feedback");
              }}
              className="mt-8 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Done
            </button>
          </motion.div>
        )}

        {/* ROUND 2 FEEDBACK — Comparison */}
        {phase === "round2-feedback" && (
          <motion.div key="round2-feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-4">Round 2 — Comparison</p>

            <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-2">
              {(improved ? ROUND2_IMPROVEMENT : ROUND2_STILL_NEEDED).map((line, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
              ))}
            </div>

            {transcript && (
              <div className="rounded-lg bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">What you said</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{transcript}</p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleFinish}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Session Complete
              </button>
            </div>
          </motion.div>
        )}

        {/* COMPLETION */}
        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-md">
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
              Session complete.
            </h2>

            <div className="rounded-xl border border-border bg-card p-6 mb-8 text-left space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Today's Insight</p>
              <p className="text-sm text-foreground">• You tend to stay abstract.</p>
              <p className="text-sm text-foreground">• You improve when prompted for examples.</p>
              <p className="text-sm text-muted-foreground">• Focus next time: explain why it matters.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link
                to="/home"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Finish
              </Link>
              <Link
                to="/progress"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                View Progress
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
