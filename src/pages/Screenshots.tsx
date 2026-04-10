
import { useState } from "react";
import { FileText, Link as LinkIcon, Mic, Type, CheckCircle, Flame, Brain, RotateCcw, Plus } from "lucide-react";

/* ─── Static Upload Screen ─── */
function UploadScreen() {
  const inputMethods = [
    { key: "text", icon: Type, label: "Paste text", active: true },
    { key: "file", icon: FileText, label: "Upload file", desc: "PDF or document" },
    { key: "url", icon: LinkIcon, label: "Paste a link" },
    { key: "record", icon: Mic, label: "Record audio", desc: "Something you heard at a talk or meeting" },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[15px] font-sans text-ink-3">←</span>
      </div>
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2rem] text-foreground mb-2">What are you learning?</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6">Paste it, link it, or drop in a file.</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {inputMethods.map(m => (
            <div key={m.key} className={`rounded-[16px] border-[1.5px] p-4 text-left ${m.active ? "border-accent bg-accent-pale/20" : "border-border bg-card"}`}>
              <m.icon className="w-5 h-5 mb-1 text-ink-3" />
              <p className="text-[13px] font-sans font-semibold text-foreground">{m.label}</p>
              {m.desc && <p className="text-[11px] font-sans text-ink-3 mt-1 leading-[1.4]">{m.desc}</p>}
            </div>
          ))}
        </div>
        <div className="w-full min-h-[180px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-ink-3 italic mb-4">
          Paste anything here. Even one paragraph is enough to start.
        </div>
        <div className="mt-auto">
          <button className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground">
            Start coaching session
          </button>
          <p className="text-[12px] font-sans text-ink-3 text-center mt-3">AI will split this into 3–5 sessions you can study and explain back.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Static LearnConfig Screen ─── */
function LearnConfigScreen() {
  const periods = [
    { key: "quick", label: "Fast", desc: "1-2 days" },
    { key: "standard", label: "Standard", desc: "3-5 days", active: true },
    { key: "deep", label: "Thorough", desc: "1-2 weeks" },
    { key: "extended", label: "Extended", desc: "1 month+" },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <span className="text-[15px] font-sans text-ink-3 mb-6">←</span>
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2rem] text-foreground mb-2">How do you want to study this?</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6">Pick a pace. We'll break it into sessions.</p>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">PACE</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {periods.map(p => (
            <div key={p.key} className={`rounded-[16px] border-[1.5px] p-4 text-left ${p.active ? "border-accent bg-accent-pale/20" : "border-border bg-card"}`}>
              <p className="text-[13px] font-sans font-semibold text-foreground">{p.label}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">CONNECT TO WHAT YOU KNOW</p>
        <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-7 rounded-pill bg-border relative">
              <div className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow-sm" />
            </div>
            <div>
              <p className="text-[14px] font-sans font-medium text-foreground">Link to my other topics</p>
              <p className="text-[12px] font-sans text-ink-3 mt-0.5">Your coach will make connections across everything you've studied.</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 mb-6">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">READY TO START</p>
          <h3 className="font-serif text-[18px] text-foreground mb-1">Understanding PDF Structure</h3>
          <p className="text-[12px] font-sans text-ink-3">4 sessions ready</p>
        </div>
        <button className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground mt-auto">
          Let's go
        </button>
      </div>
    </div>
  );
}

/* ─── Static TestConfig Screen ─── */
function TestConfigScreen() {
  const durations = [
    { label: "5 min", desc: "Quick session" },
    { label: "10 min", desc: "Standard", active: true },
    { label: "15 min", desc: "Deep practice" },
  ];
  const modes = [
    { emoji: "✏️", label: "Quiz", desc: "Pick the right answer", active: true },
    { emoji: "🃏", label: "Flashcards", desc: "Flip and check yourself" },
    { emoji: "🎙️", label: "Explain It", desc: "Say it in your own words" },
    { emoji: "🌍", label: "Apply", desc: "Answer a real situation" },
  ];
  const topics = [
    { title: "Market Failure Defined", selected: true },
    { title: "Externalities, Costs & Benefits on Others", selected: true },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <span className="text-[15px] font-sans text-ink-3 mb-6">←</span>
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-2">How do you want to be coached?</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6">5–10 minutes is all you need.</p>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">DURATION</p>
        <div className="flex gap-3 mb-6">
          {durations.map(d => (
            <div key={d.label} className={`flex-1 rounded-[14px] border-[1.5px] py-3 text-center ${d.active ? "border-accent bg-accent-pale/20" : "border-border bg-card"}`}>
              <p className="text-[13px] font-sans font-semibold text-foreground">{d.label}</p>
              <p className="text-[11px] font-sans text-ink-3">{d.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">COACH MODE</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {modes.map(m => (
            <div key={m.label} className={`bg-card rounded-[16px] border-[1.5px] p-4 text-left ${m.active ? "border-accent bg-accent-pale/20" : "border-border"}`}>
              <p className="text-[18px] mb-1">{m.emoji}</p>
              <p className="text-[13px] font-sans font-semibold text-foreground">{m.label}</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1 leading-[1.4]">{m.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">TOPICS</p>
        <div className="flex flex-col gap-2 mb-6">
          {topics.map(t => (
            <div key={t.title} className={`w-full text-left rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans ${t.selected ? "border-accent bg-accent-pale/20 text-foreground" : "border-border bg-card text-ink-2"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center text-[10px] ${t.selected ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}>
                  {t.selected && "✓"}
                </div>
                <span>{t.title}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground mt-auto">
          Start session
        </button>
      </div>
    </div>
  );
}

/* ─── Static Analytics Screen ─── */
function AnalyticsScreen() {
  const streakDays = [
    { label: "Mon", active: true },
    { label: "Tue", active: true },
    { label: "Wed", active: true },
    { label: "Thu", active: true },
    { label: "Fri", active: false },
    { label: "Sat", active: false },
    { label: "Sun", active: false },
  ];
  const concepts = [
    { label: "Practicing", count: 4, color: "bg-accent" },
    { label: "Getting there", count: 6, color: "bg-amber-400" },
    { label: "Solid", count: 3, color: "bg-sage" },
  ];
  const topics = [
    { name: "GRI Standards", pct: 78, sessions: "4/5" },
    { name: "Atomic Habits", pct: 93, sessions: "5/5" },
    { name: "IFRS 15", pct: 45, sessions: "2/4" },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-sans text-ink-3">←</span>
      </div>
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col gap-5">
        <h1 className="font-serif text-[2rem] text-foreground">Your progress</h1>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: "4", label: "day streak", icon: <Flame className="w-4 h-4 text-accent" /> },
            { val: "13", label: "concepts", icon: <Brain className="w-4 h-4 text-accent" /> },
            { val: "72%", label: "retention", icon: <CheckCircle className="w-4 h-4 text-sage" /> },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-[14px] border-[1.5px] border-border p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-serif text-[22px] leading-none text-foreground">{s.val}</p>
              <p className="text-[10px] font-sans text-ink-3 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Streak calendar */}
        <div className="bg-card rounded-[14px] border-[1.5px] border-border p-4">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">THIS WEEK</p>
          <div className="flex justify-between">
            {streakDays.map(d => (
              <div key={d.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${d.active ? "bg-accent text-white" : "bg-surface-2 text-ink-3"}`}>
                  {d.active ? "✓" : "·"}
                </div>
                <span className="text-[9px] font-sans text-ink-3">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Concept stages */}
        <div className="bg-card rounded-[14px] border-[1.5px] border-border p-4">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">CONCEPT MASTERY</p>
          <div className="flex gap-2 mb-3">
            {concepts.map(c => (
              <div key={c.label} className="flex-1 text-center">
                <p className="font-serif text-[20px] text-foreground">{c.count}</p>
                <div className={`h-[3px] rounded-full ${c.color} mt-1 mb-1`} />
                <p className="text-[9px] font-sans text-ink-3">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic progress */}
        <div className="bg-card rounded-[14px] border-[1.5px] border-border p-4">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">BY TOPIC</p>
          {topics.map(t => (
            <div key={t.name} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-[12px] font-sans text-ink-3 w-[90px] truncate">{t.name}</span>
              <div className="flex-1 h-[4px] rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${t.pct}%` }} />
              </div>
              <span className="text-[11px] font-sans font-semibold text-foreground">{t.pct}%</span>
            </div>
          ))}
        </div>

        {/* Spaced repetition */}
        <div className="bg-card rounded-[14px] border-[1.5px] border-border p-4">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">REVIEW SCHEDULE</p>
          <p className="text-[12px] font-sans text-ink-3 mb-3">3 concepts due today</p>
          <button className="w-full rounded-pill bg-accent-pale/30 py-3 text-[12px] font-sans font-semibold text-accent">
            Start review session
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Screenshots Page ─── */
const screens = [
  { id: "upload", label: "Upload", component: UploadScreen },
  { id: "learn", label: "Learn Config", component: LearnConfigScreen },
  { id: "test", label: "Test Config", component: TestConfigScreen },
  { id: "analytics", label: "Analytics", component: AnalyticsScreen },
];

export default function Screenshots() {
  const [active, setActive] = useState("upload");
  const ActiveScreen = screens.find(s => s.id === active)?.component || UploadScreen;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center py-8">
      {/* Screen selector */}
      <div className="flex gap-2 mb-6">
        {screens.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`px-4 py-2 rounded-full text-[13px] font-sans transition-all ${active === s.id ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
            {s.label}
          </button>
        ))}
      </div>
      {/* Phone frame */}
      <div style={{
        width: 390,
        height: 844,
        borderRadius: 50,
        border: "6px solid #333",
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        position: "relative",
      }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ width: 126, height: 34, background: "#000", borderRadius: "0 0 20px 20px" }} />
        <div className="w-full h-full overflow-auto" style={{ paddingTop: 34 }}>
          <ActiveScreen />
        </div>
      </div>
    </div>
  );
}
