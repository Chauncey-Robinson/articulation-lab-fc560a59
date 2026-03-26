import { motion } from "framer-motion";

const amber = "hsl(var(--amber-bright))";
const sage = "hsl(var(--sage))";
const ink = "hsl(var(--foreground))";
const ink3 = "hsl(var(--ink-3))";
const surface2 = "hsl(var(--surface-2))";
const bg = "hsl(var(--background))";
const border = "hsl(var(--border))";

/* ─── Upload Screen ─── */
export function PhoneUploadScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: ink3 }}>Upload</span>
      <p className="font-serif text-[14px]" style={{ color: ink }}>What are you learning?</p>
      <div className="rounded-[10px] border-[1.5px] border-dashed p-4 text-center" style={{ borderColor: border, background: surface2 }}>
        <div className="w-6 h-6 mx-auto mb-1 rounded-[6px] flex items-center justify-center" style={{ background: "hsla(32,82%,51%,0.12)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={amber} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
        </div>
        <p className="font-sans text-[8px] mt-1" style={{ color: ink3 }}>Paste it, link it, or drop in a file.</p>
      </div>
      <div className="rounded-[10px] p-2.5" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-sans text-[8px] leading-[1.5]" style={{ color: ink3 }}>
          "GRI 3 requires organisations to determine which topics are material…"
        </p>
      </div>
      <div className="rounded-pill py-2 text-center font-sans text-[9px] font-semibold text-white" style={{ background: amber }}>
        Start coaching session →
      </div>
    </div>
  );
}

/* ─── Study / Lesson Screen with Suggestion Chips ─── */
export function PhoneStudyScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Session 1 of 5</span>
        <span className="font-sans text-[8px] px-2 py-0.5 rounded-full" style={{ background: "hsla(32,82%,51%,0.12)", color: amber }}>
          <svg className="inline w-2.5 h-2.5 mr-0.5 -mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          Reading aloud
        </span>
      </div>
      <p className="font-serif text-[14px]" style={{ color: ink }}>Double Materiality</p>
      <p className="font-serif text-[9px] font-light leading-[1.6]" style={{ color: ink3 }}>
        A two-way lens: how the world impacts your organisation, and how your organisation impacts the world.
      </p>
      <div className="rounded-[8px] p-2.5" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-sans text-[7px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: amber }}>The Main Point</p>
        <p className="font-serif text-[9px] italic leading-[1.5]" style={{ color: ink3 }}>
          "Two-way mirror: the world's impact on you, and your impact on the world."
        </p>
      </div>
      {/* Smart suggestion chips */}
      <div className="flex flex-wrap gap-1">
        {["Give me an example", "Why does this matter?", "Quiz me on this"].map(chip => (
          <span key={chip} className="rounded-full px-2 py-0.5 font-sans text-[7px]"
            style={{ background: "hsla(32,82%,51%,0.1)", color: amber, border: "1px solid hsla(32,82%,51%,0.25)" }}>
            {chip}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-pill py-1.5 text-center font-sans text-[8px] font-semibold text-white" style={{ background: ink }}>
          Talk it through
        </div>
        <div className="flex-1 rounded-pill py-1.5 text-center font-sans text-[8px] font-semibold text-white" style={{ background: amber }}>
          Explain It
        </div>
      </div>
    </div>
  );
}

/* ─── Quiz Screen ─── */
export function PhoneQuizScreen() {
  return (
    <div className="p-4 flex flex-col gap-2">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Coach Mode · 2 of 5</span>
      <p className="font-serif text-[12px]" style={{ color: ink }}>
        Which type of materiality focuses on how a company affects society?
      </p>
      {["Financial materiality", "Impact materiality", "Double materiality", "Single materiality"].map((opt, i) => (
        <div
          key={opt}
          className="rounded-[8px] border-[1.5px] p-2 font-sans text-[9px]"
          style={{
            borderColor: i === 1 ? sage : border,
            background: i === 1 ? "hsla(140,22%,45%,0.08)" : "transparent",
            color: ink3,
          }}
        >
          {i === 1 && <span style={{ color: sage }}>✓ </span>}{opt}
        </div>
      ))}
      <div className="rounded-[8px] p-1.5" style={{ background: "hsla(140,22%,45%,0.06)", border: "1px solid hsla(140,22%,45%,0.15)" }}>
        <p className="font-sans text-[7px]" style={{ color: sage }}>
          <svg className="inline w-2.5 h-2.5 mr-0.5 -mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          "Correct! Impact materiality looks outward at how the company affects the world."
        </p>
      </div>
    </div>
  );
}

/* ─── Flashcard Screen ─── */
export function PhoneFlashcardScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center gap-2.5" style={{ minHeight: 240 }}>
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Card 3 of 8</span>
      <div
        className="w-full rounded-[14px] border-[1.5px] p-4 text-center"
        style={{ borderColor: border, background: bg, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}
      >
        <p className="font-serif text-[13px]" style={{ color: ink }}>Double Materiality</p>
        <div className="w-6 h-[1px] mx-auto my-2" style={{ background: amber }} />
        <p className="font-serif text-[9px] italic leading-[1.5]" style={{ color: ink3 }}>
          Two-way mirror: the world's impact on you, and your impact on the world.
        </p>
      </div>
      <div className="w-full rounded-[8px] overflow-hidden flex items-center justify-center" style={{ height: 50, background: surface2 }}>
        <div className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span className="font-sans text-[7px]" style={{ color: ink3 }}>AI illustration</span>
        </div>
      </div>
      <div className="flex gap-4">
        <span className="font-sans text-[8px] font-semibold" style={{ color: "hsl(var(--destructive))" }}>✗ Didn't know</span>
        <span className="font-sans text-[8px] font-semibold" style={{ color: sage }}>✓ Knew it</span>
      </div>
    </div>
  );
}

/* ─── Analytics Screen ─── */
export function PhoneAnalyticsScreen() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const active = [true, true, true, true, true, false, false];
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <p className="font-serif text-[14px]" style={{ color: ink }}>Your progress.</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: "3", label: "topics" },
          { val: "5", label: "day streak" },
          { val: "72%", label: "mastery" },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] p-2 text-center" style={{ background: surface2 }}>
            <p className="font-serif text-[16px] leading-none" style={{ color: ink }}>{s.val}</p>
            <p className="font-sans text-[7px] mt-0.5" style={{ color: ink3 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 justify-between">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px]"
              style={{ background: active[i] ? amber : surface2, color: active[i] ? "white" : ink3 }}>
              {active[i] ? "✓" : "·"}
            </div>
            <span className="font-sans text-[6px]" style={{ color: ink3 }}>{d}</span>
          </div>
        ))}
      </div>
      {/* Daily nudge */}
      <div className="rounded-[8px] p-2" style={{ background: "hsla(32,82%,51%,0.08)", border: "1px solid hsla(32,82%,51%,0.15)" }}>
        <p className="font-sans text-[7px] font-semibold" style={{ color: amber }}>Today's focus</p>
        <p className="font-sans text-[7px] mt-0.5" style={{ color: ink3 }}>GRI Standards Session 4 is due. You got 60% last time.</p>
      </div>
      {/* Mini bars */}
      <div>
        <p className="font-sans text-[7px] uppercase tracking-[0.12em] mb-1" style={{ color: ink3 }}>By topic</p>
        {[
          { name: "GRI Standards", pct: 78 },
          { name: "Atomic Habits", pct: 93 },
          { name: "IFRS 15", pct: 45 },
        ].map(t => (
          <div key={t.name} className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[7px] w-[70px] truncate" style={{ color: ink3 }}>{t.name}</span>
            <div className="flex-1 h-[3px] rounded-full" style={{ background: surface2 }}>
              <motion.div className="h-full rounded-full" style={{ background: amber, width: `${t.pct}%` }} />
            </div>
            <span className="font-sans text-[7px]" style={{ color: ink3 }}>{t.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Meeting Screen ─── */
export function PhoneMeetingScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: "hsl(var(--destructive))" }}>
        Meeting Mode
      </span>
      <p className="font-serif text-[14px]" style={{ color: ink }}>Recording</p>
      <div className="flex items-center gap-2">
        <motion.div className="w-3 h-3 rounded-full"
          style={{ background: "hsl(var(--destructive))", boxShadow: "0 0 8px hsla(8,50%,52%,0.6)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
        <span className="font-sans text-[10px] font-semibold" style={{ color: "hsl(var(--destructive))" }}>● 14:32</span>
      </div>
      <div className="space-y-1.5">
        {[
          "We need to prioritise the mobile experience for Q2.",
          "The API team confirmed new endpoints by March.",
        ].map((l, i) => (
          <p key={i} className="font-sans text-[8px] leading-[1.5]" style={{ color: ink3 }}>{l}</p>
        ))}
      </div>
      <div className="rounded-[8px] p-2" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-sans text-[7px] font-semibold mb-0.5" style={{ color: amber }}>Key Learnings</p>
        <p className="font-sans text-[7px]" style={{ color: ink3 }}>1. Mobile-first strategy for Q2</p>
        <p className="font-sans text-[7px]" style={{ color: ink3 }}>2. API readiness confirmed</p>
      </div>
      <div className="rounded-pill py-1.5 text-center font-sans text-[8px] font-semibold" style={{ background: "hsla(32,82%,51%,0.15)", color: amber, border: "1px solid hsla(32,82%,51%,0.3)" }}>
        Turn into study topic →
      </div>
    </div>
  );
}

/* ─── Explain It Screen with Real-time Feedback ─── */
export function PhoneExplainScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Round 1</span>
      <p className="font-serif text-[12px]" style={{ color: ink }}>Explain this like you're teaching someone.</p>
      <div className="rounded-[8px] p-2" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-sans text-[7px] font-semibold mb-0.5" style={{ color: amber }}>The Idea</p>
        <p className="font-serif text-[9px] italic leading-[1.4]" style={{ color: ink3 }}>Double Materiality</p>
      </div>
      <div className="rounded-[8px] border-[1.5px] p-2" style={{ borderColor: border, background: bg }}>
        <p className="font-sans text-[8px]" style={{ color: ink3 }}>
          "It means looking at things from two directions…"
        </p>
      </div>
      {/* Real-time feedback meters */}
      <div className="rounded-[8px] p-2" style={{ background: surface2 }}>
        <p className="font-sans text-[7px] font-semibold mb-1.5" style={{ color: ink3 }}>Live feedback</p>
        {[
          { label: "Clarity", pct: 72, color: amber },
          { label: "Depth", pct: 45, color: "hsl(var(--destructive))" },
          { label: "Example use", pct: 30, color: "hsl(var(--destructive))" },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-1.5 mb-1">
            <span className="font-sans text-[6px] w-[42px]" style={{ color: ink3 }}>{m.label}</span>
            <div className="flex-1 h-[3px] rounded-full" style={{ background: "hsl(var(--border))" }}>
              <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
            </div>
            <span className="font-sans text-[6px]" style={{ color: ink3 }}>{m.pct}%</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-pill py-1.5 text-center font-sans text-[8px] font-semibold" style={{ background: surface2, color: ink3 }}>
          Say it instead
        </div>
        <div className="flex-1 rounded-pill py-1.5 text-center font-sans text-[8px] font-semibold text-white" style={{ background: amber }}>
          Get feedback
        </div>
      </div>
    </div>
  );
}

/* ─── Dialogue Screen with Coach Persona ─── */
export function PhoneDialogueScreen() {
  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Discuss</span>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded-full" style={{ background: "hsla(32,82%,51%,0.2)", border: "1px solid hsla(32,82%,51%,0.4)" }}>
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <span style={{ fontSize: 6, color: amber }}>L</span>
            </div>
          </div>
          <span className="font-sans text-[7px] font-semibold" style={{ color: amber }}>Lily</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="rounded-[8px] p-2" style={{ background: surface2 }}>
          <p className="font-sans text-[8px] leading-[1.5]" style={{ color: ink3 }}>
            "Can you explain double materiality to someone who only cares about financial risk?"
          </p>
        </div>
        <div className="rounded-[8px] p-2 ml-3" style={{ background: "hsla(32,82%,51%,0.08)" }}>
          <p className="font-sans text-[8px] leading-[1.5]" style={{ color: ink }}>
            "Think of it as a two-way mirror. On one side, you see risks to the company…"
          </p>
        </div>
        <div className="rounded-[8px] p-2" style={{ background: surface2 }}>
          <p className="font-sans text-[8px] leading-[1.5]" style={{ color: ink3 }}>
            "Good start. Now push deeper. What's the impact side?"
          </p>
        </div>
      </div>
      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1">
        {["Give me a hint", "Try a different angle"].map(chip => (
          <span key={chip} className="rounded-full px-2 py-0.5 font-sans text-[6px]"
            style={{ background: "hsla(32,82%,51%,0.1)", color: amber, border: "1px solid hsla(32,82%,51%,0.25)" }}>
            {chip}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-[6px] border-[1.5px] p-1.5" style={{ borderColor: border, background: bg }}>
        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: amber }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        </div>
        <span className="font-sans text-[7px] italic" style={{ color: ink3 }}>Tap to speak…</span>
      </div>
    </div>
  );
}

/* ─── Dashboard with Daily Nudge ─── */
export function PhoneDashboardScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <p className="font-serif text-[14px]" style={{ color: ink }}>Good morning.</p>
      {/* Daily nudge card */}
      <div className="rounded-[10px] p-2.5" style={{ background: "hsla(32,82%,51%,0.08)", border: "1px solid hsla(32,82%,51%,0.2)" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={amber} strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
          <span className="font-sans text-[7px] font-semibold" style={{ color: amber }}>Today's focus</span>
        </div>
        <p className="font-sans text-[8px]" style={{ color: ink3 }}>Session 4 of GRI Standards is due. You scored 60% last time. Let's improve that.</p>
        <div className="mt-1.5 rounded-pill py-1 text-center font-sans text-[7px] font-semibold" style={{ background: amber, color: "white" }}>
          Start session →
        </div>
      </div>
      {/* Topics */}
      {[
        { title: "GRI Standards", sessions: "5 sessions", progress: 60 },
        { title: "Atomic Habits", sessions: "4 sessions", progress: 100 },
      ].map(m => (
        <div key={m.title} className="rounded-[10px] border-[1.5px] p-2.5" style={{ borderColor: border, background: bg }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-serif text-[11px]" style={{ color: ink }}>{m.title}</p>
              <p className="font-sans text-[7px]" style={{ color: ink3 }}>{m.sessions}</p>
            </div>
            <span className="font-sans text-[9px] font-semibold" style={{ color: m.progress === 100 ? sage : amber }}>{m.progress}%</span>
          </div>
          <div className="mt-1.5 h-[3px] rounded-full" style={{ background: surface2 }}>
            <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.progress === 100 ? sage : amber }} />
          </div>
        </div>
      ))}
      {/* Ask anything */}
      <div className="rounded-[8px] border-[1.5px] p-2 flex items-center gap-2" style={{ borderColor: border, background: surface2 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="font-sans text-[7px] italic" style={{ color: ink3 }}>Ask anything about your topics…</span>
      </div>
    </div>
  );
}

/* ─── Apply / Scenario Screen ─── */
export function PhoneApplyScreen() {
  return (
    <div className="p-4 flex flex-col gap-2.5">
      <span className="font-sans text-[8px] uppercase tracking-[0.14em]" style={{ color: amber }}>Real-World Scenario</span>
      <div className="rounded-[10px] p-3" style={{ background: surface2, borderLeft: `2px solid ${amber}` }}>
        <p className="font-serif text-[10px] italic leading-[1.5]" style={{ color: ink3 }}>
          "A CFO has two minutes before a board meeting. Explain double materiality in plain English. Why does it matter to their bottom line?"
        </p>
      </div>
      <div className="rounded-[10px] border-[1.5px] p-2.5" style={{ borderColor: border, background: bg }}>
        <p className="font-sans text-[9px] leading-[1.5]" style={{ color: ink3 }}>
          Your answer: "Think of it as looking through a window both ways…"
        </p>
      </div>
      <div className="rounded-[10px] p-2" style={{ background: "hsla(140,22%,45%,0.08)", border: "1px solid hsla(140,22%,45%,0.2)" }}>
        <p className="font-sans text-[8px] font-semibold" style={{ color: sage }}>Score: 8/10</p>
        <p className="font-sans text-[8px] mt-0.5" style={{ color: ink3 }}>Clear analogy. Add a concrete example next time.</p>
      </div>
    </div>
  );
}
