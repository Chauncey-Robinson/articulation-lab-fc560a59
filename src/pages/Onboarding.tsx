import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateState } from "@/lib/store";

const useCases = ["MBA", "Consulting", "Strategy", "Legal", "Policy"];
const tones = ["Direct", "Analytical", "Socratic"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [useCase, setUseCase] = useState("");
  const [tone, setTone] = useState("");

  const handleComplete = () => {
    updateState((s) => ({
      ...s,
      profile: { useCase, tone, onboarded: true },
      retentionScore: 42,
      articulationDepth: "moderate",
      applicationClarity: "low",
    }));
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="usecase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <p className="metric-label mb-2">Step 1 of 2</p>
              <h1 className="text-2xl font-light tracking-tight text-foreground mb-8">
                What are you preparing for?
              </h1>
              <div className="flex flex-col gap-2">
                {useCases.map((uc) => (
                  <button
                    key={uc}
                    onClick={() => {
                      setUseCase(uc);
                      setStep(1);
                    }}
                    className={`rounded-lg border px-5 py-3.5 text-left text-sm font-medium tracking-wide transition-all ${
                      useCase === uc
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="tone"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <p className="metric-label mb-2">Step 2 of 2</p>
              <h1 className="text-2xl font-light tracking-tight text-foreground mb-8">
                How should the tool challenge you?
              </h1>
              <div className="flex flex-col gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t);
                    }}
                    className={`rounded-lg border px-5 py-3.5 text-left text-sm font-medium tracking-wide transition-all ${
                      tone === t
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tone && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleComplete}
                  className="mt-8 w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Begin
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
