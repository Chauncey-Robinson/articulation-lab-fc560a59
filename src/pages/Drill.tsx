import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { getState, updateState } from "@/lib/store";

type Phase = "prompt" | "recording" | "feedback" | "application" | "app-feedback" | "complete";

const FOLLOW_UPS = [
  "Can you give a concrete example?",
  "How would you defend this point in a meeting?",
];

export default function Drill() {
  const state = useMemo(() => getState(), []);
  const concepts = state.concepts;

  const [conceptIndex, setConceptIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(concepts.length > 0 ? "prompt" : "complete");
  const [transcript, setTranscript] = useState("");
  const [followUpCount, setFollowUpCount] = useState(0);
  const [currentFollowUp, setCurrentFollowUp] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const currentConcept = concepts[conceptIndex];

  const simulateRecording = useCallback((nextPhase: Phase, feedbackFollowUp?: string) => {
    setIsRecording(true);
    setPhase("recording");
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("The concept relates to strategic decision-making under constraints, balancing short-term pressures against long-term value creation...");
      if (feedbackFollowUp) setCurrentFollowUp(feedbackFollowUp);
      setPhase(nextPhase);
    }, 3000);
  }, []);

  const handleNext = () => {
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

    if (conceptIndex < concepts.length - 1) {
      setConceptIndex((i) => i + 1);
      setPhase("prompt");
      setTranscript("");
      setFollowUpCount(0);
      setCurrentFollowUp("");
    } else {
      setPhase("complete");
    }
  };

  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="text-sm text-muted-foreground mb-4">Nothing to drill yet.</p>
        <Link to="/input" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Add Content
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <AnimatePresence mode="wait">
        {phase === "prompt" && (
          <motion.div key="prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-8">
              Idea {conceptIndex + 1} of {concepts.length}
            </p>

            <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-tight text-foreground mb-10 max-w-lg mx-auto">
              {followUpCount > 0 && currentFollowUp ? currentFollowUp : "Explain the core idea in your own words."}
            </p>

            <div className="mb-10 rounded-lg border border-border bg-card px-5 py-4 max-w-md mx-auto">
              <p className="text-sm text-foreground leading-relaxed">{currentConcept.text}</p>
            </div>

            <button
              onClick={() => simulateRecording("feedback", "")}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Record
            </button>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-xl">
            <p className="text-xs text-muted-foreground mb-8">Listening...</p>
            <WaveformVisualizer active={isRecording} />
          </motion.div>
        )}

        {phase === "feedback" && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xl">
            <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">Clear structure.</p>
              <p className="text-sm text-foreground leading-relaxed">Missing: concrete example.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Try again with one real scenario.</p>
            </div>

            {transcript && (
              <div className="rounded-lg bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">What you said</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{transcript}</p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {followUpCount < 2 && (
                <button
                  onClick={() => {
                    setFollowUpCount((c) => c + 1);
                    setCurrentFollowUp(FOLLOW_UPS[followUpCount] || "");
                    setTranscript("");
                    setPhase("prompt");
                  }}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => {
                  setTranscript("");
                  setPhase("application");
                }}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {phase === "application" && (
          <motion.div key="application" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-xl">
            <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-tight text-foreground mb-10 max-w-lg mx-auto">
              How would you apply this in a real professional situation?
            </p>
            <button
              onClick={() => simulateRecording("app-feedback", "")}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Record
            </button>
          </motion.div>
        )}

        {phase === "app-feedback" && (
          <motion.div key="app-feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xl">
            <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-3">
              <p className="text-sm text-foreground leading-relaxed">Strong insight.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Consider stakeholder constraints next time.</p>
            </div>

            {transcript && (
              <div className="rounded-lg bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">What you said</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{transcript}</p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {conceptIndex < concepts.length - 1 ? "Next Idea" : "Finish"}
            </button>
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-md">
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
              Session complete.
            </h2>

            <div className="rounded-xl border border-border bg-card p-6 mb-8 text-left space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Today's Insight</p>
              <p className="text-sm text-foreground">• You explain ideas clearly.</p>
              <p className="text-sm text-foreground">• You stay abstract when applying them.</p>
              <p className="text-sm text-muted-foreground">• Next time: add a specific example.</p>
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
