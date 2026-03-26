import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneDashboardScreen,
  PhoneUploadScreen,
  PhoneStudyScreen,
  PhoneDialogueScreen,
  PhoneQuizScreen,
  PhoneApplyScreen,
  PhoneFlashcardScreen,
  PhoneExplainScreen,
} from "@/components/demo/DemoPhoneScreens";

const amber = "hsl(var(--amber-bright))";
const bg = "hsl(var(--background))";

const STATES = [
  PhoneDashboardScreen,
  PhoneUploadScreen,
  PhoneStudyScreen,
  PhoneDialogueScreen,
  PhoneQuizScreen,
  PhoneExplainScreen,
  PhoneApplyScreen,
  PhoneFlashcardScreen,
];
const AUTO_TIMES = [3500, 3500, 4000, 4000, 3500, 3500, 3500, 3500];

export default function PhoneMockup() {
  const [state, setState] = useState(0);

  const advance = useCallback(() => {
    setState((s) => (s + 1) % STATES.length);
  }, []);

  useEffect(() => {
    const t = setTimeout(advance, AUTO_TIMES[state]);
    return () => clearTimeout(t);
  }, [state, advance]);

  const CurrentState = STATES[state];

  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={advance}
      style={{
        width: 240,
        height: 520,
        borderRadius: 36,
        border: "2px solid hsl(var(--border))",
        background: "#fff",
        boxShadow: "0 32px 72px rgba(17,16,9,.15), 0 2px 8px rgba(17,16,9,.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex justify-center pt-2 shrink-0">
        <div className="rounded-full" style={{ width: 68, height: 20, background: "#000" }} />
      </div>
      <div className="relative overflow-hidden flex-1" style={{ margin: "3px 5px 4px", borderRadius: 18, background: bg }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <CurrentState />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* State indicator dots */}
      <div className="flex justify-center gap-1 pb-2 pt-0.5 shrink-0">
        {STATES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === state ? 12 : 4,
              height: 4,
              background: i === state ? amber : "rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
