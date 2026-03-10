import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── tiny helpers ─── */
const amber = "hsl(var(--amber-bright))";
const amberPale = "hsl(var(--amber-pale))";
const sage = "hsl(var(--sage))";
const sagePale = "hsl(var(--sage-pale))";
const ink = "hsl(var(--foreground))";
const ink2 = "hsl(var(--ink-2))";
const ink3 = "hsl(var(--ink-3))";
const surface2 = "hsl(var(--surface-2))";
const bg = "hsl(var(--background))";

const TYPING_TEXT = `GRI 3 requires organisations to determine which topics are material to their business… double materiality considers both financial materiality and impact materiality…`;

function TypingText({ onDone }: { onDone: () => void }) {
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (len >= TYPING_TEXT.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLen((l) => l + 1), 22);
    return () => clearTimeout(t);
  }, [len, onDone]);

  return (
    <div
      className="font-sans text-[10px] leading-[1.55]"
      style={{ color: ink2, minHeight: 80 }}
    >
      {TYPING_TEXT.slice(0, len)}
      {len < TYPING_TEXT.length && (
        <span
          className="inline-block w-[2px] h-[11px] ml-[1px] align-text-bottom"
          style={{ background: amber, animation: "blink 1s step-end infinite" }}
        />
      )}
    </div>
  );
}

/* ─── Phone States ─── */

function StateHome() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <p className="font-serif text-[18px] leading-[1.15]" style={{ color: ink }}>
          Good morning,
        </p>
        <p className="font-serif text-[18px] italic leading-[1.15]" style={{ color: amber }}>
          Chauncey.
        </p>
        <p className="font-sans text-[9px] mt-1.5" style={{ color: ink3 }}>
          Your session is ready. 4 minutes.
        </p>
      </div>
      {/* Card 1 */}
      <div className="rounded-[14px] border-[1.5px] border-border bg-card p-3">
        <span
          className="font-sans text-[8px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: amber }}
        >
          GRI Standards · Rep 5
        </span>
        <p className="font-serif text-[13px] mt-1" style={{ color: ink }}>
          Double Materiality
        </p>
        <p className="font-serif text-[10px] italic mt-0.5" style={{ color: ink3 }}>
          "Explain to a CFO in 30 seconds."
        </p>
      </div>
      {/* Card 2 */}
      <div className="rounded-[14px] border-[1.5px] border-border bg-card p-3">
        <span
          className="font-sans text-[8px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: sage }}
        >
          Revisit · 8 days ago
        </span>
        <p className="font-serif text-[13px] mt-1" style={{ color: ink }}>
          Scope 3 Emissions
        </p>
        <p className="font-serif text-[10px] italic mt-0.5" style={{ color: ink3 }}>
          "Still sharp on this one?"
        </p>
      </div>
      {/* CTA */}
      <button
        className="w-full rounded-pill py-2.5 font-sans text-[10px] font-semibold"
        style={{ background: ink, color: bg }}
      >
        Begin session →
      </button>
    </div>
  );
}

function StatePaste({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: ink3 }}>
        Step 1 of 1
      </span>
      <p className="font-serif text-[15px]" style={{ color: ink }}>
        Paste something you've been studying.
      </p>
      <div className="rounded-[10px] border-[1.5px] border-border p-2.5" style={{ background: surface2, minHeight: 100 }}>
        <TypingText onDone={onDone} />
      </div>
      <button
        className="w-full rounded-pill py-2.5 font-sans text-[10px] font-semibold"
        style={{ background: amber, color: "#fff" }}
      >
        Find the key idea →
      </button>
    </div>
  );
}

function StateExtracting() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4" style={{ minHeight: 260 }}>
      <div
        className="w-9 h-9 rounded-full border-[2.5px] border-transparent"
        style={{
          borderTopColor: amber,
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p className="font-serif text-[10px] italic" style={{ color: ink3 }}>
        Reading your content…
      </p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[5px] h-[5px] rounded-full"
            style={{
              background: amber,
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StateConcept() {
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <span
        className="self-start rounded-pill px-2 py-0.5 font-sans text-[7px] font-semibold"
        style={{ background: amberPale, color: amber }}
      >
        ✦ Key concept extracted
      </span>
      <p className="font-serif text-[16px]" style={{ color: ink }}>
        Double Materiality
      </p>
      <p className="font-serif text-[10px] font-light leading-[1.6]" style={{ color: ink2 }}>
        Two-way mirror: the world's impact on you, and your impact on the world. Most ESG
        practitioners only look one way.
      </p>
      <div
        className="rounded-[8px] p-2.5 font-serif text-[10px] italic leading-[1.55]"
        style={{
          borderLeft: `2px solid ${amber}`,
          background: surface2,
          color: ink2,
        }}
      >
        "A CFO has two minutes before a board meeting. Explain double materiality in plain English."
      </div>
      <div
        className="flex items-center gap-1.5 rounded-[8px] border-[1.5px] border-border p-1.5"
        style={{ background: bg }}
      >
        <span className="flex-1 font-sans text-[9px] italic" style={{ color: ink3 }}>
          Start your explanation…
        </span>
        <span
          className="flex items-center justify-center rounded-[6px] text-[10px] text-white font-bold"
          style={{ background: amber, width: 22, height: 22 }}
        >
          →
        </span>
      </div>
    </div>
  );
}

function StateFeedback() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: ink3 }}>
        Feedback
      </span>

      <div>
        <span className="font-sans text-[8px] uppercase tracking-[0.12em] font-semibold" style={{ color: sage }}>
          ✓ What landed
        </span>
        <p className="font-serif text-[10px] mt-0.5 leading-[1.55]" style={{ color: ink2 }}>
          Clear on the two directions. Good plain-English instinct.
        </p>
      </div>

      <div>
        <span className="font-sans text-[8px] uppercase tracking-[0.12em] font-semibold" style={{ color: amber }}>
          → Sharpen this
        </span>
        <p className="font-serif text-[10px] mt-0.5 leading-[1.55]" style={{ color: ink2 }}>
          Missing the "why it matters" — add one concrete example.
        </p>
      </div>

      <div>
        <span className="font-sans text-[8px] uppercase tracking-[0.12em] font-semibold" style={{ color: ink3 }}>
          ↗ Try next time
        </span>
        <p className="font-serif text-[10px] mt-0.5 leading-[1.55]" style={{ color: ink2 }}>
          "Think of it as a two-way mirror — you see your own risk, but also the impact you're having
          on others."
        </p>
      </div>

      <div
        className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 mt-1"
        style={{
          background: `hsla(140,22%,45%,0.1)`,
          border: `1px solid ${sagePale}`,
        }}
      >
        <span className="w-[6px] h-[6px] rounded-full" style={{ background: sage }} />
        <span className="font-sans text-[8px]" style={{ color: sage }}>
          Saved · fluency: 34% · returns in 6 days
        </span>
      </div>
    </div>
  );
}

/* ─── Main Phone ─── */
const STATES = [StateHome, StatePaste, StateExtracting, StateConcept, StateFeedback] as const;
const AUTO_TIMES = [4000, -1, 2200, 4000, 4000]; // -1 = driven by typing callback

export default function PhoneMockup() {
  const [state, setState] = useState(0);

  const advance = useCallback(() => {
    setState((s) => (s + 1) % STATES.length);
  }, []);

  // auto-advance for timed states
  useEffect(() => {
    const ms = AUTO_TIMES[state];
    if (ms < 0) return;
    const t = setTimeout(advance, ms);
    return () => clearTimeout(t);
  }, [state, advance]);

  const CurrentState = STATES[state];

  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={advance}
      style={{
        width: 260,
        borderRadius: 42,
        border: "2px solid hsl(var(--border))",
        background: "#fff",
        boxShadow:
          "0 32px 72px rgba(17,16,9,.15), 0 2px 8px rgba(17,16,9,.06)",
        overflow: "hidden",
      }}
    >
      {/* Notch */}
      <div className="flex justify-center pt-2.5">
        <div className="rounded-full" style={{ width: 80, height: 22, background: "#000" }} />
      </div>

      {/* Screen */}
      <div
        className="relative overflow-hidden"
        style={{
          margin: "4px 6px 6px",
          borderRadius: 20,
          background: bg,
          minHeight: 420,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {state === 1 ? (
              <StatePaste onDone={advance} />
            ) : (
              <CurrentState />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 pt-0.5">
        <div className="rounded-full" style={{ width: 80, height: 4, background: "#000", opacity: 0.15 }} />
      </div>
    </div>
  );
}
