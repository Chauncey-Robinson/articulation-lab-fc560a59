import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTTS } from "@/hooks/useSpeech";
import DemoPhoneFrame from "@/components/demo/DemoPhoneFrame";
import {
  PhoneUploadScreen,
  PhoneStudyScreen,
  PhoneQuizScreen,
  PhoneFlashcardScreen,
  PhoneAnalyticsScreen,
  PhoneMeetingScreen,
  PhoneExplainScreen,
  PhoneDialogueScreen,
  PhoneDashboardScreen,
  PhoneApplyScreen,
} from "@/components/demo/DemoPhoneScreens";
import { Check, Minus } from "lucide-react";

/* ─── TOKENS ─── */
const DARK = "#111009";
const LIGHT = "#F8F6F2";
const DIM = "rgba(248,246,242,0.5)";
const FAINT = "rgba(248,246,242,0.3)";
const AMBER = "hsl(32,82%,51%)";
const SAGE = "hsl(140,22%,45%)";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(255,255,255,0.08)";

/* ─── SECTIONS ─── */
interface Section {
  id: string;
  label: string;
  heading: React.ReactNode;
  body: string;
  narration: string;
  phone: React.FC;
  bullets?: { icon: string; title: string; desc: string }[];
}

const SECTIONS: Section[] = [
  {
    id: "dashboard",
    label: "Home",
    heading: <>Good morning. <span className="italic" style={{ color: AMBER }}>Here's your focus.</span></>,
    body: "Open the app and your AI coach already knows what to review. Daily nudges, streak tracking, and smart topic suggestions — all personalised.",
    narration: "Open the app and your AI coach already knows what you need. Daily nudges. Streak tracking. Everything personalised to how you learn.",
    phone: PhoneDashboardScreen,
    bullets: [
      { icon: "🎯", title: "Daily nudge", desc: "Lily suggests what to review today" },
      { icon: "🔥", title: "Streak tracking", desc: "Stay consistent, build momentum" },
      { icon: "📚", title: "Topic library", desc: "All your learning in one place" },
    ],
  },
  {
    id: "upload",
    label: "Upload",
    heading: <>Paste anything. <span className="italic" style={{ color: AMBER }}>The AI does the rest.</span></>,
    body: "Drop in study notes, textbook passages, PDFs, or certification material. The AI extracts key ideas and builds structured coaching sessions.",
    narration: "Paste text, upload a PDF, drop in your notes. Watch the AI pull out the key ideas and build your personalised coaching sessions.",
    phone: PhoneUploadScreen,
    bullets: [
      { icon: "📄", title: "Content ingestion", desc: "Paste text or upload PDF, DOCX, and more" },
      { icon: "🧠", title: "Key idea isolation", desc: "AI identifies core concepts per section" },
      { icon: "📦", title: "Session generation", desc: "Structured topics personalised to you" },
    ],
  },
  {
    id: "study",
    label: "Learn",
    heading: <>Meet <span className="italic" style={{ color: AMBER }}>Lily.</span> Your AI coach.</>,
    body: "Lily reads every session aloud with a natural voice. Ask her questions. Challenge ideas. Smart suggestion chips help you go deeper on what matters.",
    narration: "Every session is read aloud by Lily, your AI coach. Toggle voice on or off. Then discuss with her or speak your answers back.",
    phone: PhoneStudyScreen,
    bullets: [
      { icon: "🔊", title: "Voice narration", desc: "Natural ElevenLabs voice reads sessions" },
      { icon: "💡", title: "Smart suggestions", desc: "Contextual chips to go deeper" },
      { icon: "🎤", title: "Voice input", desc: "Speak your answers back to Lily" },
    ],
  },
  {
    id: "dialogue",
    label: "Discuss",
    heading: <>Talk it through <span className="italic" style={{ color: AMBER }}>with Lily.</span></>,
    body: "A live conversation with your AI coach. She challenges you, asks follow-up questions, and adapts in real time. Like having a tutor in your pocket.",
    narration: "Have a real conversation with Lily. She challenges you, asks follow-ups, and adapts in real time. Like a tutor in your pocket.",
    phone: PhoneDialogueScreen,
    bullets: [
      { icon: "💬", title: "Live dialogue", desc: "Socratic coaching conversation" },
      { icon: "🤖", title: "Adaptive AI", desc: "Lily adjusts to your level" },
      { icon: "🎤", title: "Speak or type", desc: "Use your voice or keyboard" },
    ],
  },
  {
    id: "quiz",
    label: "Quiz",
    heading: <>Progressive <span className="italic" style={{ color: AMBER }}>quizzes.</span></>,
    body: "Starts easy, then gets harder. The AI adapts difficulty based on your answers. Voice feedback explains why you got it right or wrong.",
    narration: "Quizzes that start easy then get harder. The AI adapts to you. Voice feedback explains exactly why you got it right or wrong.",
    phone: PhoneQuizScreen,
    bullets: [
      { icon: "📝", title: "Adaptive difficulty", desc: "Questions get harder as you improve" },
      { icon: "🔊", title: "Voice feedback", desc: "Lily explains each answer" },
      { icon: "📊", title: "Score tracking", desc: "Accuracy across all attempts" },
    ],
  },
  {
    id: "explain",
    label: "Explain",
    heading: <>Explain it back. <span className="italic" style={{ color: AMBER }}>Get scored.</span></>,
    body: "Type or speak your explanation. The AI scores you on clarity, depth, and example use in real time. The best way to truly own knowledge.",
    narration: "Explain the concept in your own words. The AI scores you live on clarity, depth, and example use. This is where real learning happens.",
    phone: PhoneExplainScreen,
    bullets: [
      { icon: "🎤", title: "Speak or type", desc: "Explain in your own words" },
      { icon: "📊", title: "Live scoring", desc: "Clarity, depth, and examples" },
      { icon: "🔄", title: "Iterate", desc: "Get feedback and try again" },
    ],
  },
  {
    id: "apply",
    label: "Apply",
    heading: <>Real-world <span className="italic" style={{ color: AMBER }}>scenarios.</span></>,
    body: "Apply your knowledge under pressure. A CFO needs an answer in two minutes. A client challenges your reasoning. Can you perform?",
    narration: "Real-world scenarios that test whether you can apply knowledge under pressure. A CFO needs an answer. A client challenges you. Can you perform?",
    phone: PhoneApplyScreen,
    bullets: [
      { icon: "🌍", title: "Realistic pressure", desc: "Scenarios from your profession" },
      { icon: "⏱", title: "Time pressure", desc: "Two minutes. Go." },
      { icon: "✅", title: "AI scoring", desc: "Scored on clarity and accuracy" },
    ],
  },
  {
    id: "flashcards",
    label: "Cards",
    heading: <>Smarter <span className="italic" style={{ color: AMBER }}>flashcards.</span></>,
    body: "Not just flip and forget. Every card tracks difficulty, timing, and accuracy. Hard cards come back sooner. AI-generated illustrations.",
    narration: "Flashcards that remember what you struggle with. You rate difficulty. The app brings back hard cards at exactly the right time.",
    phone: PhoneFlashcardScreen,
    bullets: [
      { icon: "🃏", title: "Spaced repetition", desc: "Hard cards return sooner" },
      { icon: "🖼", title: "AI illustrations", desc: "Visual memory aids" },
      { icon: "📊", title: "Accuracy tracking", desc: "See your progress per card" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    heading: <>Your learning <span className="italic" style={{ color: AMBER }}>data.</span></>,
    body: "Streak tracking, concept mastery stages, daily focus nudges, and accuracy across every coaching mode. Everything feeds into your analytics.",
    narration: "Everything feeds into your analytics. Streaks, concept mastery, daily nudges, and accuracy across every coaching mode.",
    phone: PhoneAnalyticsScreen,
    bullets: [
      { icon: "🔥", title: "Streak heatmap", desc: "7-day consistency tracking" },
      { icon: "📈", title: "Mastery stages", desc: "Practicing → Getting there → Solid" },
      { icon: "🎯", title: "Daily focus", desc: "AI suggests what to review" },
    ],
  },
  {
    id: "meeting",
    label: "Meeting",
    heading: <>Walk in. Hit <span className="italic" style={{ color: "hsl(8,50%,52%)" }}>record.</span></>,
    body: "Meeting mode. The AI transcribes everything live, identifies speakers, pulls out key learnings and action items. Then turns it into a study topic.",
    narration: "Walk into any meeting. Hit record. The AI transcribes everything live. Then it pulls out key learnings and turns them into study topics.",
    phone: PhoneMeetingScreen,
    bullets: [
      { icon: "🎙", title: "Live transcription", desc: "Real-time speech-to-text" },
      { icon: "📋", title: "Smart extraction", desc: "Key learnings pulled automatically" },
      { icon: "📚", title: "Auto-convert", desc: "Turn meetings into study topics" },
    ],
  },
];

const SECTION_COUNT = SECTIONS.length;

/* ─── REUSABLE ─── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SectionLabel({ label, color = AMBER }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <motion.div className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
      <div className="w-10 h-[1px]" style={{ background: color }} />
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>{label}</span>
    </div>
  );
}

function HudTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
      style={{ background: "hsla(32,82%,51%,0.12)", color: AMBER }}>{children}</span>
  );
}

function NarrationBadge({ speaking }: { speaking: boolean }) {
  if (!speaking) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full px-4 py-2"
      style={{ background: "hsla(0,0%,0%,0.7)", border: "1px solid hsla(32,82%,51%,0.4)", backdropFilter: "blur(16px)" }}>
      <div className="flex items-center gap-[2px] h-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div key={i} className="w-[2px] rounded-full"
            style={{ background: AMBER }}
            animate={{ height: [2, 10 + Math.random() * 6, 2] }}
            transition={{ duration: 0.3 + i * 0.08, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: AMBER }}>Lily</span>
    </motion.div>
  );
}

/* ─── PRICING (inline at bottom) ─── */
function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();
  const plans = [
    { name: "Free", price: { m: 0, a: 0 }, tagline: "Try one full session", cta: "Start free", primary: false, badge: null,
      features: [
        { t: "1 coaching session", ok: true }, { t: "1 content upload", ok: true }, { t: "AI-generated key insight", ok: true },
        { t: "Unlimited sessions", ok: false }, { t: "Unlimited uploads", ok: false }, { t: "Spaced return reminders", ok: false },
      ],
    },
    { name: "Pro", price: { m: 14.99, a: 9.99 }, tagline: "For professionals who apply what they know", cta: "Start 7-day trial", primary: true, badge: "Most popular",
      features: [
        { t: "Everything in Free", ok: true }, { t: "Unlimited sessions", ok: true }, { t: "Unlimited uploads", ok: true },
        { t: "Real-life application prompts", ok: true }, { t: "Session history & library", ok: true }, { t: "Spaced return reminders", ok: true },
      ],
    },
    { name: "Teams", price: { m: 12, a: 9 }, tagline: "Per seat. For firms investing in people.", cta: "Contact us", primary: false, badge: "Min. 5 seats",
      features: [
        { t: "Everything in Pro", ok: true }, { t: "Admin dashboard", ok: true }, { t: "Usage analytics", ok: true },
        { t: "Shared content library", ok: true }, { t: "Priority support", ok: true },
      ],
    },
  ];

  return (
    <div className="py-32 px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <SectionLabel label="Pricing" />
          <h2 className="font-serif text-[clamp(40px,5vw,62px)] font-normal" style={{ letterSpacing: "-2px", color: LIGHT }}>
            Simple <span className="italic" style={{ color: AMBER }}>pricing.</span>
          </h2>
          <p className="font-serif text-[18px] font-light mt-4 max-w-[450px] mx-auto" style={{ color: DIM }}>
            Start free. Go Pro when you're ready. No card required.
          </p>
          <div className="inline-flex items-center rounded-full p-1 mt-6"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}` }}>
            {["Monthly", "Annual"].map(l => {
              const active = (l === "Annual") === annual;
              return (
                <button key={l} onClick={() => setAnnual(l === "Annual")}
                  className="px-5 py-2 rounded-full border-none cursor-pointer text-[13px] font-sans font-medium transition-all duration-200"
                  style={{ background: active ? AMBER : "transparent", color: active ? "#fff" : DIM }}>
                  {l}{l === "Annual" && <span className="ml-1 text-[10px] font-semibold" style={{ color: active ? "#fff" : AMBER }}>-33%</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.price.a : plan.price.m;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}
                className="flex-1 rounded-2xl p-7 flex flex-col relative"
                style={{
                  background: plan.primary ? "rgba(255,255,255,0.06)" : CARD_BG,
                  border: plan.primary ? `2px solid ${AMBER}` : `1px solid ${CARD_BORDER}`,
                  boxShadow: plan.primary ? "0 0 60px hsla(32,82%,51%,0.15)" : "none",
                }}>
                {plan.badge && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[11px] font-sans font-semibold"
                    style={{ background: plan.primary ? AMBER : "rgba(255,255,255,0.1)", color: plan.primary ? "#fff" : DIM }}>{plan.badge}</div>
                )}
                <h3 className="font-serif text-2xl mt-2 mb-1" style={{ color: LIGHT }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  {price === 0 ? (
                    <span className="font-sans text-3xl font-semibold" style={{ color: LIGHT }}>Free</span>
                  ) : (
                    <><span className="font-sans text-3xl font-semibold" style={{ color: LIGHT }}>${price.toFixed(2)}</span>
                    <span className="font-sans text-sm" style={{ color: DIM }}>/mo</span></>
                  )}
                </div>
                {annual && price > 0 && <p className="font-sans text-xs mb-1" style={{ color: DIM }}>Billed ${(price * 12).toFixed(0)}/year</p>}
                <p className="font-sans text-sm mb-5" style={{ color: DIM }}>{plan.tagline}</p>
                <div className="h-px mb-5" style={{ background: CARD_BORDER }} />
                <div className="flex flex-col gap-2.5 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {f.ok ? <Check className="w-4 h-4 shrink-0" style={{ color: SAGE }} /> : <Minus className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />}
                      <span className="font-sans text-[13px]" style={{ color: f.ok ? LIGHT : FAINT }}>{f.t}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => plan.name !== "Teams" && navigate("/signin")}
                  className="w-full py-3.5 rounded-full font-sans text-[13px] font-semibold cursor-pointer transition-all duration-200"
                  style={{ background: plan.primary ? AMBER : "transparent", color: plan.primary ? "#fff" : LIGHT, border: plan.primary ? "none" : `2px solid ${CARD_BORDER}` }}>
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
        <p className="font-sans text-xs mt-8 text-center" style={{ color: FAINT }}>No card required for the free session. Cancel anytime.</p>
      </div>
    </div>
  );
}

/* ─── CLOSE CTA ─── */
function CloseCTA() {
  const navigate = useNavigate();
  return (
    <div className="py-32 px-8 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="700" height="700" viewBox="0 0 700 700">
            <circle cx="350" cy="350" r="320" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="350" cy="350" r="320" fill="none" stroke="hsla(32,82%,51%,0.08)" strokeWidth="1" strokeDasharray="8 24" />
          </svg>
        </motion.div>
      </div>
      <div className="relative z-10 max-w-[800px] mx-auto">
        <SectionLabel label="Mission" />
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 1, ease }}
          className="font-serif font-normal leading-[1.05]"
          style={{ fontSize: "clamp(40px,5vw,64px)", letterSpacing: "-2px", color: LIGHT }}>
          Train your knowledge.{" "}
          <motion.span className="italic" style={{ color: AMBER }}
            animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
            Own the room.
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease }}
          className="font-serif text-[20px] font-light leading-[1.6] mt-8 mx-auto max-w-[560px]" style={{ color: DIM }}>
          Upload → Learn with voice → Prove it five ways. That's it.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-5 mt-14">
          {[
            { stat: "107+", desc: "professionals surveyed" },
            { stat: "87%", desc: "say application is missing" },
            { stat: "5", desc: "ways to prove mastery" },
            { stat: "4 min", desc: "per session" },
          ].map((c, i) => (
            <motion.div key={c.stat}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease }}
              className="rounded-2xl p-5 text-left" style={{ width: 180, background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <span className="font-serif text-[32px] leading-none block" style={{ color: LIGHT }}>{c.stat}</span>
              <p className="font-sans text-[11px] mt-2 leading-[1.45]" style={{ color: DIM }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6, ease }}
          className="flex flex-col items-center gap-4 mt-14">
          <button onClick={() => navigate("/signin")}
            className="rounded-full px-14 py-4 font-sans text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1"
            style={{ background: AMBER, boxShadow: "0 0 80px hsla(32,82%,51%,0.3), 0 4px 30px hsla(32,82%,51%,0.2)" }}>
            Get started free →
          </button>
          <p className="font-sans text-[12px] mt-4" style={{ color: FAINT }}>Oxford EMBA Entrepreneurship Project · 2025</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCROLL-DRIVEN DEMO
   ═══════════════════════════════════════════ */

export default function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const lastNarrated = useRef(-1);
  const { speak, stop, muted, toggleMute, speaking } = useTTS();
  const navigate = useNavigate();

  // Create refs for each section
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection observer to detect active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIdx(i);
          }
        },
        { threshold: 0.4, rootMargin: "-20% 0px -20% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Narrate on section change
  useEffect(() => {
    if (activeIdx !== lastNarrated.current && activeIdx < SECTIONS.length) {
      lastNarrated.current = activeIdx;
      stop();
      const t = setTimeout(() => speak(SECTIONS[activeIdx].narration), 600);
      return () => clearTimeout(t);
    }
  }, [activeIdx, speak, stop]);

  const progress = ((activeIdx + 1) / SECTION_COUNT) * 100;

  return (
    <div ref={containerRef} className="min-h-screen relative" style={{ background: DARK }}>
      {/* Global ambient */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at center, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />

      {/* ─── HERO ─── */}
      <div className="min-h-screen flex items-center relative px-8">
        <div className="absolute pointer-events-none" style={{ top: "-20%", right: "-10%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, hsla(32,82%,51%,0.1) 0%, transparent 60%)" }} />
        <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }}
              className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px]" style={{ background: AMBER }} />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: AMBER }}>
                Your AI coach for professional knowledge · 2025
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }}
              className="font-serif font-normal leading-[0.92]"
              style={{ fontSize: "clamp(48px,5.5vw,88px)", letterSpacing: "-3px", color: LIGHT }}>
              You know more<br />than you can<br />
              <span className="italic" style={{ color: AMBER }}>explain.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }}
              className="font-serif text-[20px] font-light leading-[1.6] mt-8 max-w-[480px]" style={{ color: DIM }}>
              Upload what you're studying. Your AI coach breaks it down. Then you prove you own it — five different ways.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease }}
              className="flex items-center gap-4 mt-10">
              <button onClick={() => navigate("/signin")}
                className="rounded-full px-8 py-3.5 font-sans text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: AMBER, boxShadow: "0 0 40px hsla(32,82%,51%,0.25)" }}>
                Start free →
              </button>
              <span className="font-sans text-[12px]" style={{ color: FAINT }}>Scroll to explore ↓</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── PROBLEM BANNER ─── */}
      <div className="py-24 px-8">
        <div className="mx-auto max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}>
            <SectionLabel label="The problem" color="hsl(8,50%,52%)" />
            <h2 className="font-serif text-[clamp(36px,4vw,54px)] font-normal leading-[1.05]" style={{ color: LIGHT }}>
              You finished it.<br /><span className="italic" style={{ color: "hsl(8,50%,52%)" }}>Then nothing.</span>
            </h2>
            <p className="font-serif text-[18px] font-light leading-[1.6] mt-6" style={{ color: DIM }}>
              107 professionals told us the same thing. They studied. They finished. Then someone asked. Nothing came out.
            </p>
            <div className="mt-8 rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderLeft: "2px solid hsl(8,50%,52%)" }}>
              <p className="font-serif text-[16px] italic leading-[1.55]" style={{ color: DIM }}>
                "I started forgetting the details in the weeks after. When it came to applying it, I couldn't structure my thoughts."
              </p>
              <p className="font-sans text-[10px] mt-3" style={{ color: FAINT }}>ESG Professional, GRI Certification, 2025</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2, ease }}
            className="flex flex-col gap-4">
            <div className="rounded-2xl p-8" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <HudTag>Survey data</HudTag>
              <span className="block font-serif leading-none mt-3" style={{ fontSize: "clamp(60px,7vw,90px)", color: LIGHT }}>
                87<span className="italic" style={{ color: AMBER }}>%</span>
              </span>
              <p className="font-sans text-[13px] mt-3 max-w-[340px]" style={{ color: DIM }}>
                of professionals say real-life application is the most important feature they're missing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ stat: "4×", desc: "times revisited before it sticks" }, { stat: "£0", desc: "value of knowledge that can't be explained" }].map(c => (
                <div key={c.stat} className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <span className="font-serif text-[32px]" style={{ color: LIGHT }}>{c.stat}</span>
                  <p className="font-sans text-[11px] mt-1 leading-[1.45]" style={{ color: DIM }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── SCROLL SECTIONS: Sticky phone + scrolling text ─── */}
      <div className="relative">
        {/* Section heading */}
        <div className="py-16 px-8 text-center">
          <SectionLabel label="How it works" />
          <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] font-normal" style={{ letterSpacing: "-1.5px", color: LIGHT }}>
            A gym for <span className="italic" style={{ color: AMBER }}>professional knowledge.</span>
          </h2>
          <p className="font-serif text-[18px] font-light mt-4 max-w-[500px] mx-auto" style={{ color: DIM }}>
            Upload → Learn → Prove. Scroll to see each step in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] max-w-[1200px] mx-auto gap-8 px-8">
          {/* Left: scrolling sections */}
          <div>
            {SECTIONS.map((section, i) => {
              const PhoneScreen = section.phone;
              return (
                <div
                  key={section.id}
                  ref={el => { sectionRefs.current[i] = el; }}
                  className="min-h-[90vh] flex items-center py-16"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease }}
                    className="w-full"
                  >
                    <SectionLabel label={section.label} color={section.id === "meeting" ? "hsl(8,50%,52%)" : AMBER} />
                    <h2 className="font-serif text-[clamp(28px,3.5vw,44px)] font-normal leading-[1.1] mb-4" style={{ color: LIGHT }}>
                      {section.heading}
                    </h2>
                    <p className="font-serif text-[17px] font-light leading-[1.6] max-w-[500px] mb-8" style={{ color: DIM }}>
                      {section.body}
                    </p>
                    {section.bullets && (
                      <div className="space-y-3 max-w-[460px]">
                        {section.bullets.map((b, bi) => (
                          <motion.div key={b.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 + bi * 0.1, ease }}
                            className="rounded-xl p-3.5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                            <div className="flex items-start gap-3">
                              <span className="text-[18px]">{b.icon}</span>
                              <div>
                                <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT }}>{b.title}</p>
                                <p className="font-sans text-[11px] mt-0.5" style={{ color: DIM }}>{b.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Phone visible on mobile only */}
                    <div className="lg:hidden flex justify-center mt-10">
                      <DemoPhoneFrame dark><PhoneScreen /></DemoPhoneFrame>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Right: sticky phone */}
          <div className="hidden lg:block">
            <div className="sticky top-[50%] -translate-y-[50%] flex justify-center">
              <div style={{ filter: "drop-shadow(0 0 60px hsla(32,82%,51%,0.12))" }}>
                <DemoPhoneFrame dark>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIdx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.5, ease }}
                    >
                      {(() => {
                        const Screen = SECTIONS[activeIdx]?.phone ?? PhoneDashboardScreen;
                        return <Screen />;
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </DemoPhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRICING ─── */}
      <PricingSection />

      {/* ─── CLOSE ─── */}
      <CloseCTA />

      {/* ─── HUD ─── */}

      {/* Mute */}
      <button onClick={toggleMute}
        className="fixed top-6 left-6 z-[60] flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:scale-105"
        style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${CARD_BORDER}`, backdropFilter: "blur(8px)" }}>
        <span className="text-[14px]">{muted ? "🔇" : "🔊"}</span>
        <span className="font-sans text-[9px] uppercase tracking-[0.15em]" style={{ color: DIM }}>{muted ? "Unmute" : "Narrating"}</span>
      </button>

      {/* Narration badge */}
      <AnimatePresence><NarrationBadge speaking={speaking} /></AnimatePresence>

      {/* Side nav */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-1.5 items-end">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="flex items-center gap-2 group py-0.5">
            <span className="font-sans text-[8px] uppercase tracking-[0.12em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: i === activeIdx ? AMBER : FAINT }}>{s.label}</span>
            <div className="rounded-full transition-all duration-500"
              style={{ width: i === activeIdx ? 20 : 5, height: 5, background: i === activeIdx ? AMBER : "rgba(255,255,255,0.15)" }} />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] z-[60]">
        <motion.div className="h-full" style={{ background: AMBER }}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease }} />
      </div>
    </div>
  );
}
