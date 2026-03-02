import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { getState, updateState } from "@/lib/store";

type DrillPhase = "prompt" | "recording" | "feedback" | "application" | "app-feedback" | "complete";

interface Feedback {
  completeness: string;
  structure: string;
  clarity: string;
  precision: string;
  followUp: string | null;
}

const FOLLOW_UPS = [
  "What assumption underlies this idea?",
  "How would you defend this in a meeting?",
  "This explanation is abstract. Provide a concrete example.",
];

const APP_FEEDBACK_LINES = [
  { label: "Application Depth", value: "Moderate" },
  { label: "Suggestion", value: "Improve by adding constraints or stakeholder perspective." },
];

export default function Drill() {
  const state = useMemo(() => getState(), []);
  const concepts = state.concepts;

  const [conceptIndex, setConceptIndex] = useState(0);
  const [phase, setPhase] = useState<DrillPhase>(concepts.length > 0 ? "prompt" : "complete");
  const [transcript, setTranscript] = useState("");
  const [followUpCount, setFollowUpCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const currentConcept = concepts[conceptIndex];

  const simulateRecording = useCallback(() => {
    setIsRecording(true);
    setPhase("recording");
    // Simulate 3-second recording
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("The concept relates to strategic decision-making under constraints, where stakeholders must balance short-term pressures against long-term value creation...");
      
      // Generate simulated feedback
      const needsFollowUp = followUpCount < 2 && Math.random() > 0.4;
      setFeedback({
        completeness: "Partial",
        structure: "Adequate",
        clarity: "Moderate",
        precision: "Needs specificity",
        followUp: needsFollowUp ? FOLLOW_UPS[followUpCount] : null,
      });
      setPhase("feedback");
    }, 3000);
  }, [followUpCount]);

  const handleFollowUp = () => {
    setFollowUpCount((c) => c + 1);
    setTranscript("");
    setFeedback(null);
    setPhase("prompt");
  };

  const handleApplicationMode = () => {
    setTranscript("");
    setPhase("application");
  };

  const simulateApplicationRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("In a consulting engagement, I would apply this by framing the client's decision as a trade-off matrix...");
      setPhase("app-feedback");
    }, 3000);
  };

  const handleNext = () => {
    // Update concept strength
    updateState((s) => ({
      ...s,
      concepts: s.concepts.map((c) =>
        c.id === currentConcept?.id
          ? { ...c, strength: "building" as const, drillCount: c.drillCount + 1, lastArticulated: new Date().toISOString() }
          : c
      ),
      retentionScore: Math.min(100, s.retentionScore + 5),
    }));

    if (conceptIndex < concepts.length - 1) {
      setConceptIndex((i) => i + 1);
      setPhase("prompt");
      setTranscript("");
      setFeedback(null);
      setFollowUpCount(0);
    } else {
      setPhase("complete");
    }
  };

  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-sm text-muted-foreground mb-4">No concepts available for drilling.</p>
        <Link
          to="/input"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Input Content
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <AnimatePresence mode="wait">
        {phase === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center w-full max-w-2xl"
          >
            <p className="metric-label mb-6">
              Concept {conceptIndex + 1} of {concepts.length}
            </p>

            {followUpCount > 0 && feedback?.followUp ? (
              <p className="drill-question mb-10">{feedback.followUp}</p>
            ) : (
              <p className="drill-question mb-10">
                Explain the core idea in your own words.
              </p>
            )}

            <div className="mb-8 rounded-lg border border-border bg-card px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">Concept</p>
              <p className="text-sm text-foreground leading-relaxed">{currentConcept.text}</p>
            </div>

            <button
              onClick={simulateRecording}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Begin Recording
            </button>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-2xl"
          >
            <p className="metric-label mb-6">Listening</p>
            <div className="mb-8">
              <WaveformVisualizer active={isRecording} />
            </div>
            <p className="text-xs text-muted-foreground">Speak clearly. Recording will end automatically.</p>
          </motion.div>
        )}

        {phase === "feedback" && feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-2xl"
          >
            <p className="metric-label mb-6">Evaluation</p>

            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(["completeness", "structure", "clarity", "precision"] as const).map((key) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{key}</p>
                    <p className="font-medium text-foreground">{feedback[key]}</p>
                  </div>
                ))}
              </div>
            </div>

            {transcript && (
              <div className="rounded-lg border border-border bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">Your response</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{transcript}</p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {feedback.followUp && followUpCount < 3 && (
                <button
                  onClick={handleFollowUp}
                  className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Respond to Probe
                </button>
              )}
              <button
                onClick={handleApplicationMode}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Application Mode
              </button>
            </div>
          </motion.div>
        )}

        {phase === "application" && (
          <motion.div
            key="application"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center w-full max-w-2xl"
          >
            <p className="metric-label mb-6">Application</p>
            <p className="drill-question mb-10">
              How would you apply this in a real professional scenario?
            </p>

            <button
              onClick={simulateApplicationRecording}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse-subtle" />
              Record Response
            </button>
          </motion.div>
        )}

        {phase === "app-feedback" && (
          <motion.div
            key="app-feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-2xl"
          >
            <p className="metric-label mb-6">Application Evaluation</p>

            <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-3">
              {APP_FEEDBACK_LINES.map((line) => (
                <div key={line.label}>
                  <p className="text-xs text-muted-foreground mb-0.5">{line.label}</p>
                  <p className="text-sm font-medium text-foreground">{line.value}</p>
                </div>
              ))}
            </div>

            {transcript && (
              <div className="rounded-lg border border-border bg-surface-sunken px-5 py-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">Your response</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{transcript}</p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {conceptIndex < concepts.length - 1 ? "Next Concept" : "Complete Session"}
            </button>
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-md"
          >
            <p className="metric-label mb-2">Session Complete</p>
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-8">
              {concepts.length} concept{concepts.length !== 1 ? "s" : ""} drilled
            </h2>
            <div className="flex gap-3 justify-center">
              <Link
                to="/dashboard"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                View Metrics
              </Link>
              <Link
                to="/graph"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Cognitive Graph
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
