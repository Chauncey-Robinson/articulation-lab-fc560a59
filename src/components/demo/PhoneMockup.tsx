import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const amber = "hsl(var(--amber-bright))";
const amberPale = "hsl(var(--amber-pale))";
const sage = "hsl(var(--sage))";
const ink = "hsl(var(--foreground))";
const ink2 = "hsl(var(--ink-2))";
const ink3 = "hsl(var(--ink-3))";
const surface2 = "hsl(var(--surface-2))";
const bg = "hsl(var(--background))";

/* ─── States ─── */

function StateDashboard() {
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div>
        <p className="font-serif text-[16px] leading-[1.15]" style={{ color: ink }}>Your Topics</p>
        <p className="font-sans text-[9px] mt-1" style={{ color: ink3 }}>3 topics · 12 sessions</p>
      </div>
      {[
        { title: "GRI Standards", lessons: "5 sessions", progress: 60, color: amber },
        { title: "Atomic Habits", lessons: "4 sessions", progress: 100, color: sage },
        { title: "IFRS 15", lessons: "3 sessions", progress: 25, color: amber },
      ].map((m) => (
        <div key={m.title} className="rounded-[12px] border-[1.5px] border-border bg-card p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-serif text-[12px]" style={{ color: ink }}>{m.title}</p>
              <p className="font-sans text-[8px] mt-0.5" style={{ color: ink3 }}>{m.lessons}</p>
            </div>
            <span className="font-sans text-[9px] font-semibold" style={{ color: m.color }}>{m.progress}%</span>
          </div>
          <div className="mt-2 h-[3px] rounded-full" style={{ background: surface2 }}>
            <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StateUpload() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: ink3 }}>Upload</span>
      <p className="font-serif text-[14px]" style={{ color: ink }}>Paste your study material</p>
      <div className="rounded-[10px] border-[1.5px] border-dashed border-border p-4 text-center" style={{ background: surface2 }}>
        <span className="text-[20px]">📄</span>
        <p className="font-sans text-[9px] mt-1" style={{ color: ink3 }}>Paste text, PDF, or notes</p>
      </div>
      <div className="rounded-[10px] border-[1.5px] border-border p-2.5" style={{ background: surface2 }}>
        <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink2 }}>
          "GRI 3 requires organisations to determine which topics are material… double materiality considers both financial and impact materiality…"
        </p>
      </div>
      <button className="w-full rounded-pill py-2 font-sans text-[9px] font-semibold" style={{ background: amber, color: "#fff" }}>
        Generate Module →
      </button>
    </div>
  );
}

function StateLessonStudy() {
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className="flex justify-between items-center">
        <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Session 1 of 5</span>
        <span className="font-sans text-[8px] px-2 py-0.5 rounded-full" style={{ background: amberPale, color: amber }}>🔊 Lily speaking</span>
      </div>
      <p className="font-serif text-[15px]" style={{ color: ink }}>Double Materiality</p>
      <p className="font-serif text-[10px] font-light leading-[1.6]" style={{ color: ink2 }}>
        A two-way lens: how the world impacts your organisation, and how your organisation impacts the world. Most practitioners only look one way.
      </p>
      <div className="rounded-[8px] p-2.5" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-sans text-[8px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: amber }}>Key Idea</p>
        <p className="font-serif text-[10px] italic leading-[1.5]" style={{ color: ink2 }}>
          "Two-way mirror: the world's impact on you, and your impact on the world."
        </p>
      </div>
      <div className="flex gap-2 mt-1">
        <button className="flex-1 rounded-pill py-2 font-sans text-[9px] font-semibold" style={{ background: ink, color: bg }}>
          Discuss 💬
        </button>
        <button className="flex-1 rounded-pill py-2 font-sans text-[9px] font-semibold" style={{ background: amber, color: "#fff" }}>
          Test Me 📝
        </button>
      </div>
    </div>
  );
}

function StateDialogue() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>AI Dialogue</span>
      <div className="space-y-2">
        <div className="rounded-[10px] p-2.5" style={{ background: surface2 }}>
          <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink2 }}>
            🎙️ "Can you explain double materiality to a board member who only cares about financial risk?"
          </p>
        </div>
        <div className="rounded-[10px] p-2.5 ml-4" style={{ background: amberPale }}>
          <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink }}>
            "Think of it as a two-way mirror. On one side, you see risks to the company…"
          </p>
        </div>
        <div className="rounded-[10px] p-2.5" style={{ background: surface2 }}>
          <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink2 }}>
            🎙️ "Good start. Now push deeper — what's the impact side?"
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-[8px] border-[1.5px] border-border p-1.5 mt-1" style={{ background: bg }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: amber }}>
          <span className="text-[8px] text-white">🎤</span>
        </div>
        <span className="font-sans text-[8px] italic" style={{ color: ink3 }}>Tap to speak…</span>
      </div>
    </div>
  );
}

function StateQuiz() {
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Quiz · Q2 of 5</span>
      <p className="font-serif text-[13px]" style={{ color: ink }}>
        Which type of materiality focuses on how a company affects society?
      </p>
      {["Financial materiality", "Impact materiality", "Double materiality", "Single materiality"].map((opt, i) => (
        <div
          key={opt}
          className="rounded-[10px] border-[1.5px] p-2.5 font-sans text-[10px]"
          style={{
            borderColor: i === 1 ? sage : "hsl(var(--border))",
            background: i === 1 ? "hsla(140,22%,45%,0.08)" : "transparent",
            color: ink2,
          }}
        >
          {i === 1 && <span style={{ color: sage }}>✓ </span>}{opt}
        </div>
      ))}
      <p className="font-sans text-[8px]" style={{ color: sage }}>🔊 "Correct! Impact materiality looks outward…"</p>
    </div>
  );
}

function StateApply() {
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Real-World Scenario</span>
      <div className="rounded-[10px] p-3" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-serif text-[10px] italic leading-[1.5]" style={{ color: ink2 }}>
          "A CFO has two minutes before a board meeting. Explain double materiality in plain English — and why it matters to their bottom line."
        </p>
      </div>
      <div className="rounded-[10px] border-[1.5px] border-border p-2.5" style={{ background: bg }}>
        <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink2 }}>
          Your answer: "Think of it as looking through a window both ways…"
        </p>
      </div>
      <div className="rounded-[10px] p-2.5" style={{ background: "hsla(140,22%,45%,0.08)", border: `1px solid hsla(140,22%,45%,0.2)` }}>
        <p className="font-sans text-[8px] font-semibold" style={{ color: sage }}>Score: 8/10</p>
        <p className="font-sans text-[8px] mt-0.5" style={{ color: ink3 }}>Clear analogy. Add a concrete example next time.</p>
      </div>
    </div>
  );
}

function StateFlashcards() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4" style={{ minHeight: 260 }}>
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Flashcards · 3 of 8</span>
      <div
        className="w-full rounded-[16px] border-[1.5px] border-border p-5 text-center"
        style={{ background: bg, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
      >
        <p className="font-serif text-[14px]" style={{ color: ink }}>Double Materiality</p>
        <div className="w-8 h-[1px] mx-auto my-2" style={{ background: amber }} />
        <p className="font-serif text-[10px] italic leading-[1.5]" style={{ color: ink2 }}>
          Two-way mirror: the world's impact on you, and your impact on the world.
        </p>
      </div>
      <p className="font-sans text-[8px]" style={{ color: ink3 }}>🔊 Reading aloud…</p>
      <div className="flex gap-4">
        <span className="font-sans text-[9px] font-semibold" style={{ color: "hsl(var(--destructive))" }}>✗ Again</span>
        <span className="font-sans text-[9px] font-semibold" style={{ color: sage }}>✓ Got it</span>
      </div>
    </div>
  );
}

/* ─── Main ─── */
const STATES = [StateDashboard, StateUpload, StateLessonStudy, StateDialogue, StateQuiz, StateApply, StateFlashcards];
const AUTO_TIMES = [3500, 3500, 4000, 4000, 3500, 3500, 3500];

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
