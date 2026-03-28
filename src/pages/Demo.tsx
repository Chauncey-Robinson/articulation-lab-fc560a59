import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhoneMockup from "@/components/demo/PhoneMockup";
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
import { useTTS } from "@/hooks/useSpeech";

const PANEL_COUNT = 12;
const DARK_BG = "hsl(var(--foreground))";
const LIGHT_TEXT = "hsl(var(--background))";
const DIM_TEXT = "rgba(255,255,255,0.5)";
const FAINT_TEXT = "rgba(255,255,255,0.35)";
const GRID_LINE = "rgba(255,255,255,0.03)";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(255,255,255,0.08)";

const panelNarrations = [
  "You know more than you can explain. Upload what you're studying. Your AI coach breaks it down. Then you prove you own it.",
  "87 percent of professionals said the same thing. They studied. They finished. Then someone asked and nothing came out.",
  "Think of it as a gym for your knowledge. Upload anything. Your coach personalises everything to how you learn. Then you prove it five ways.",
  "Paste text, upload a PDF, drop in your notes. The AI pulls out the key ideas and builds your topics. Smart suggestions help you go deeper on what matters.",
  "Every session is read aloud by Lily, your AI coach. Toggle voice on or off. Then discuss with her or speak your answers back.",
  "Five coaching modes that adapt to you. Quizzes that progress from easy to hard. Explain-it-back with live feedback. Real-world scenarios. Dialogue. And smart flashcards.",
  "Flashcards that remember what you struggle with. You rate difficulty, track accuracy, and the app brings back hard cards at exactly the right time.",
  "Everything feeds into your analytics. Streak tracking, concept mastery stages, daily focus nudges, and accuracy across every coaching mode. You always know exactly where you stand.",
  "Nobody else combines voice coaching, progressive quizzes, and five coaching modes. This is genuinely unique.",
  "Meeting mode. Walk into any conference, lecture, or meeting. Hit record. The AI transcribes everything live. Then it pulls out key learnings, action items, and turns it into a study topic.",
  "Three simple plans. Start free with one full session. Go Pro for unlimited everything. Or bring your whole team.",
  "That's it. Upload, learn, prove it. Own the room.",
];
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Cinematic animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease, delay: i * 0.12 },
  }),
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease, delay: i * 0.15 },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease, delay: i * 0.12 },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease, delay: i * 0.12 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Narration badge ─── */
function NarrationBadge({ speaking }: { speaking: boolean }) {
  if (!speaking) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-pill px-4 py-2"
      style={{
        background: "hsla(0,0%,0%,0.6)",
        border: "1px solid hsla(32,82%,51%,0.4)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 0 40px hsla(32,82%,51%,0.2), 0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center gap-[2px] h-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div key={i} className="w-[2px] rounded-full"
            style={{ background: "hsl(var(--amber-bright))" }}
            animate={{ height: [2, 10 + Math.random() * 6, 2] }}
            transition={{ duration: 0.3 + i * 0.08, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "hsl(var(--amber-bright))" }}>
        Lily is speaking
      </span>
    </motion.div>
  );
}

/* ─── Speaking glow ─── */
function SpeakingGlow({ speaking, children, className = "", delay = 0 }: { speaking: boolean; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={speaking ? {
        boxShadow: [
          "0 0 0px hsla(32,82%,51%,0), inset 0 0 0px hsla(32,82%,51%,0)",
          "0 0 40px hsla(32,82%,51%,0.25), inset 0 0 20px hsla(32,82%,51%,0.05)",
          "0 0 0px hsla(32,82%,51%,0), inset 0 0 0px hsla(32,82%,51%,0)",
        ],
        borderColor: [
          "hsla(32,82%,51%,0)",
          "hsla(32,82%,51%,0.4)",
          "hsla(32,82%,51%,0)",
        ],
      } : {
        boxShadow: "0 0 0px hsla(32,82%,51%,0)",
        borderColor: "hsla(32,82%,51%,0)",
      }}
      transition={{
        duration: 2.5,
        repeat: speaking ? Infinity : 0,
        ease: "easeInOut",
        delay,
      }}
      style={{ borderRadius: 16, border: "1.5px solid transparent" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Reusable ─── */
function CinematicSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={staggerContainer} className={className}>
      {children}
    </motion.div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: 3 + Math.random() * 4, height: 3 + Math.random() * 4,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: `hsla(32,82%,51%,${0.15 + Math.random() * 0.2})`,
          animation: `float${i % 3} ${6 + Math.random() * 8}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
    </div>
  );
}

function ProgressBar({ active }: { active: number }) {
  const pct = ((active + 1) / PANEL_COUNT) * 100;
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[2px] z-50" style={{ background: "transparent" }}>
      <motion.div className="h-full relative" style={{ background: "hsl(var(--amber-bright))" }}
        animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease }}>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.8), 0 0 30px hsla(32,82%,51%,0.4)" }} />
      </motion.div>
    </div>
  );
}

function SideNav({ active }: { active: number }) {
  const labels = ["Intro", "Problem", "Solution", "Upload", "Coach", "Prove It", "Flashcards", "Analytics", "Compare", "Meeting", "Pricing", "Close"];
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5 items-end">
      {labels.map((l, i) => (
        <a key={i} href={`#panel-${i}`} className="flex items-center gap-2 group">
          <span className="font-sans text-[9px] uppercase tracking-[0.12em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: i === active ? "hsl(var(--amber-bright))" : FAINT_TEXT }}>
            {l}
          </span>
          <div className="rounded-full transition-all duration-500"
            style={{ width: i === active ? 24 : 6, height: 6, background: i === active ? "hsl(var(--amber-bright))" : "rgba(255,255,255,0.15)" }} />
        </a>
      ))}
    </div>
  );
}

function FluencyBar({ label, pct, color, animate }: { label: string; pct: number; color: string; animate: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[11px] w-[110px] text-right" style={{ color: DIM_TEXT }}>{label}</span>
      <div className="flex-1 h-[4px] rounded-[2px]" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div className="h-full rounded-[2px]" initial={{ width: 0 }}
          animate={{ width: animate ? `${pct}%` : 0 }} transition={{ duration: 1.4, ease }}
          style={{ background: color }} />
      </div>
      <span className="font-sans text-[10px] w-8" style={{ color: DIM_TEXT }}>{pct}%</span>
    </div>
  );
}

/* ─── Chapter Card ─── */
function ChapterCard({ number, title }: { number: string; title: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} className="h-[40vh] snap-start flex items-center justify-center relative overflow-hidden"
      style={{ background: DARK_BG }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-1/2 left-0 w-full h-[1px]"
          style={{ background: "linear-gradient(to right, transparent, hsla(32,82%,51%,0.3), transparent)" }}
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.2, ease }} />
      </div>
      <div className="text-center relative z-10">
        <motion.span className="font-sans text-[11px] font-bold uppercase tracking-[0.4em] block mb-4"
          style={{ color: "hsl(var(--amber-bright))" }}
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.4em" } : {}}
          transition={{ duration: 1.5, ease }}>
          Chapter {number}
        </motion.span>
        <motion.h3 className="font-serif text-[clamp(32px,4vw,52px)] italic"
          style={{ color: LIGHT_TEXT }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease }}>
          {title}
        </motion.h3>
        <motion.div className="mx-auto mt-6"
          style={{ width: 40, height: 1, background: "hsla(32,82%,51%,0.4)" }}
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease }} />
      </div>
    </div>
  );
}

/* ─── HUD Components ─── */
function HudCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");
  return (
    <div className="absolute" style={{
      [isTop ? "top" : "bottom"]: 0, [isLeft ? "left" : "right"]: 0,
      width: 16, height: 16, borderColor: "hsla(32,82%,51%,0.4)",
      [isTop ? "borderTop" : "borderBottom"]: "1.5px solid",
      [isLeft ? "borderLeft" : "borderRight"]: "1.5px solid",
    }} />
  );
}

function HudCard({ children, className = "", delay = 0, style: extraStyle }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease }}
      className={`relative ${className}`}
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24, ...extraStyle }}
    >
      <HudCorner position="tl" /><HudCorner position="tr" />
      <HudCorner position="bl" /><HudCorner position="br" />
      {children}
    </motion.div>
  );
}

function HudCallout({ label, side, delay = 0 }: { label: string; side: "left" | "right"; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: side === "left" ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6, delay, ease }}
      className="flex items-center gap-2" style={{ flexDirection: side === "left" ? "row" : "row-reverse" }}>
      <div className="flex items-center gap-1.5" style={{ flexDirection: side === "left" ? "row" : "row-reverse" }}>
        <motion.div className="w-2 h-2 rounded-full"
          style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 8px hsla(32,82%,51%,0.5)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        <div style={{ width: 40, height: 1, background: "linear-gradient(to right, hsla(32,82%,51%,0.6), hsla(32,82%,51%,0.1))" }} />
      </div>
      <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>{label}</span>
    </motion.div>
  );
}

function ScanLine() {
  return (
    <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
      style={{ background: "linear-gradient(to right, transparent, hsla(32,82%,51%,0.15), transparent)" }}
      animate={{ top: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
  );
}

/* Grid overlay used in all panels */
function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
    }} />
  );
}

/* ═══════════════════════════════════════════
   PANELS — ALL DARK BACKGROUND
   ═══════════════════════════════════════════ */

/* PANEL 0 — CINEMATIC HERO */
function Panel0({ scrollTo, speaking }: { scrollTo: (n: number) => void; speaking: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="panel-0" className="min-h-screen snap-start flex items-center relative overflow-hidden lens-flare"
      style={{ background: DARK_BG }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{ top: "-30%", right: "-15%", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, hsla(32,82%,51%,0.12) 0%, transparent 60%)", animation: "breathe 8s ease-in-out infinite" }} />
        <div className="absolute" style={{ bottom: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, hsla(140,22%,45%,0.06) 0%, transparent 60%)", animation: "breathe 10s ease-in-out infinite 2s" }} />
      </div>
      <FloatingParticles />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto w-full max-w-[1200px] px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-center">
          <CinematicSection>
            <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>
                Your AI coach for professional knowledge · 2025
              </span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} className="font-serif font-normal leading-[0.92]"
              style={{ fontSize: "clamp(52px,6vw,92px)", letterSpacing: "-3px", color: LIGHT_TEXT }}>
              <motion.span className="block overflow-hidden">
                <motion.span className="block" initial={{ y: "120%" }} animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>You know more</motion.span>
              </motion.span>
              <motion.span className="block overflow-hidden">
                <motion.span className="block" initial={{ y: "120%" }} animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>than you can</motion.span>
              </motion.span>
              <motion.span className="block overflow-hidden">
                <motion.span className="italic block" style={{ color: "hsl(var(--amber-bright))" }}
                  initial={{ y: "120%" }} animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}>
                  <motion.span animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>explain.</motion.span>
                </motion.span>
              </motion.span>
            </motion.h1>

            <SpeakingGlow speaking={speaking}>
              <motion.p custom={2} variants={fadeUp} className="font-serif text-[22px] font-light leading-[1.6] mt-8 max-w-[480px]"
                style={{ color: DIM_TEXT }}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.4, delay: 1 }}>
                Upload what you're studying. Your AI coach breaks it down and teaches it back to you. Then you prove you own it.
              </motion.p>
            </SpeakingGlow>

            <motion.div custom={3} variants={fadeUp} className="flex items-center gap-5 mt-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}>
              <motion.button onClick={() => scrollTo(1)}
                className="rounded-pill px-10 py-4 font-sans text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 60px hsla(32,82%,51%,0.3), 0 4px 20px hsla(32,82%,51%,0.2)" }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 100px hsla(32,82%,51%,0.5), 0 8px 40px hsla(32,82%,51%,0.3)" }}
                whileTap={{ scale: 0.97 }}>
                See how it works →
              </motion.button>
              <button onClick={() => scrollTo(10)} className="font-sans text-[13px] transition-colors duration-300" style={{ color: FAINT_TEXT }}>
                Skip to pricing ↓
              </button>
            </motion.div>
          </CinematicSection>

          <CinematicSection className="flex justify-center">
            <motion.div custom={2} variants={fadeScale} style={{ filter: "drop-shadow(0 0 80px hsla(32,82%,51%,0.15))" }}>
              <PhoneMockup />
            </motion.div>
          </CinematicSection>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <span className="font-sans text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</span>
        <div className="w-[1px] h-6" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
      </motion.div>
    </section>
  );
}

/* PANEL 1 — THE PROBLEM */
function Panel1({ speaking }: { speaking: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="panel-1" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <motion.div className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }}>
        <div className="flex items-center gap-2 mb-1">
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 8px hsla(8,50%,52%,0.6)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(8,50%,52%,0.7)" }}>Warning · Knowledge decay detected</span>
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 12px hsla(8,50%,52%,0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(8,50%,52%)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(8,50%,52%)" }}>System · Alert</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,4.5vw,58px)] font-normal leading-[1]" style={{ letterSpacing: "-1.5px", color: LIGHT_TEXT }}>
            You finished it.<br />
            <span className="italic" style={{ color: "hsl(8,50%,52%)" }}>Then nothing.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8" style={{ color: DIM_TEXT }}>
            107 professionals told us the same thing. They studied. They finished. Then someone asked. Nothing came out.
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <SpeakingGlow speaking={speaking}>
              <HudCard delay={0.3} style={{ borderLeft: "2px solid hsl(8,50%,52%)" }}>
                <p className="font-serif text-[16px] italic leading-[1.55]" style={{ color: DIM_TEXT }}>
                  "I started forgetting the details in the weeks after. When it came to applying it, I couldn't structure my thoughts."
                </p>
                <p className="font-sans text-[10px] mt-3" style={{ color: FAINT_TEXT }}>ESG Professional, GRI Certification, 2025</p>
              </HudCard>
            </SpeakingGlow>
          </motion.div>
        </CinematicSection>

        <CinematicSection>
          <motion.div style={{ y: parallaxY }}>
            <motion.div custom={0} variants={slideRight} className="relative">
              <HudCard delay={0.1}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                    style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>Survey data</span>
                  <HudCallout label="Verified" side="right" delay={0.4} />
                </div>
                <span className="font-serif leading-none" style={{ fontSize: "clamp(72px,8vw,100px)", color: LIGHT_TEXT }}>
                  87<span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>%</span>
                </span>
                <p className="font-sans text-[14px] mt-3 max-w-[340px]" style={{ color: DIM_TEXT }}>
                  of professionals say real-life application is the most important feature they're missing.
                </p>
              </HudCard>
            </motion.div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { stat: "4×", desc: "times revisited before it sticks", tag: "PRACTICE" },
                { stat: "£0", desc: "value of knowledge that can't be explained", tag: "FLUENCY" },
              ].map((c, i) => (
                <motion.div key={c.stat} custom={i + 1} variants={slideRight}>
                  <HudCard delay={(i + 2) * 0.15}>
                    <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded mb-2 inline-block"
                      style={{ background: "hsla(8,50%,52%,0.15)", color: "hsl(8,50%,52%)" }}>{c.tag}</span>
                    <span className="font-serif text-[36px] block" style={{ color: LIGHT_TEXT }}>{c.stat}</span>
                    <p className="font-sans text-[11px] mt-1 leading-[1.45]" style={{ color: DIM_TEXT }}>{c.desc}</p>
                    <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 4px hsl(8,50%,52%)" }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                      <span className="font-sans text-[7px] uppercase tracking-[0.15em]" style={{ color: FAINT_TEXT }}>Critical</span>
                    </div>
                  </HudCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 2 — THE SOLUTION */
function Panel2({ speaking }: { speaking: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="panel-2" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <FloatingParticles />
      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div ref={ref} custom={0} variants={fadeScale}
            className="rounded-[24px] p-8" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <span className="font-serif text-[80px] italic leading-none" style={{ color: "hsl(var(--amber-bright))" }}>14</span>
            <p className="font-sans text-[11px] uppercase tracking-[0.14em] mt-1" style={{ color: DIM_TEXT }}>Day streak</p>
            <div className="flex gap-2 mt-5">
              {[1, 1, 1, 1, 1, 0.4, 0].map((op, i) => (
                <motion.div key={i} className="w-6 h-[6px] rounded-full"
                  initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08, ease }}
                  style={{ background: op > 0 ? `hsla(32,82%,51%,${op})` : "rgba(255,255,255,0.08)", transformOrigin: "left" }} />
              ))}
            </div>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] mt-8 mb-3" style={{ color: DIM_TEXT }}>Explanation fluency</p>
            <div className="space-y-3">
              <FluencyBar label="GRI Standards" pct={78} color="hsl(var(--amber-bright))" animate={inView} />
              <FluencyBar label="IFRS 15" pct={54} color="hsl(var(--sage))" animate={inView} />
              <FluencyBar label="Atomic Habits" pct={93} color="hsl(var(--amber-bright))" animate={inView} />
            </div>
          </motion.div>
        </CinematicSection>

        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2 mb-6">
            <div className="w-8 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "hsl(var(--amber-bright))" }}>How it works</span>
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,4.5vw,58px)] font-normal leading-[1]"
            style={{ letterSpacing: "-1.5px", color: LIGHT_TEXT }}>
            A gym for <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>professional knowledge.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8" style={{ color: DIM_TEXT }}>
            Upload → Learn → Prove. The AI does the heavy lifting. You just show up and speak.
          </motion.p>

          <div className="mt-10 space-y-4">
            {[
              { num: "00", title: "Tell us how you like to learn", desc: "A quick setup finds your preferences. Then everything adapts to you." },
              { num: "01", title: "Upload anything", desc: "Paste text, upload PDFs, or drop notes. AI breaks it into bite-sized topics with a clear key idea per session." },
              { num: "02", title: "Lily reads it to you", desc: "Your AI coach reads each session aloud. Toggle voice on or off. Then discuss with her or speak your answers back." },
              { num: "03", title: "Prove you own it", desc: "Quizzes, explain-it-back with live feedback, real-world scenarios, dialogue, and smart flashcards. Five ways to prove mastery." },
            ].map((c, i) => (
              <SpeakingGlow speaking={speaking} key={c.num}>
                <motion.div custom={i + 3} variants={slideRight}
                  className="rounded-[16px] p-5 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <div className="flex items-start gap-4">
                    <span className="font-serif text-[28px] italic" style={{ color: "hsl(var(--amber-bright))" }}>{c.num}</span>
                    <div>
                      <p className="font-sans text-[14px] font-semibold" style={{ color: LIGHT_TEXT }}>{c.title}</p>
                      <p className="font-sans text-[13px] mt-1 leading-[1.5]" style={{ color: DIM_TEXT }}>{c.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </SpeakingGlow>
            ))}
          </div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 3 — UPLOAD */
function Panel3({ speaking }: { speaking: boolean }) {
  return (
    <section id="panel-3" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <motion.div className="absolute top-8 right-8 pointer-events-none text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(32,82%,51%,0.5)" }}>Ingestion pipeline · Active</span>
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 8px hsl(var(--sage))" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Content Ingestion</span>
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05]" style={{ color: LIGHT_TEXT }}>
            Paste anything. <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>The AI does the rest.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] mt-6" style={{ color: DIM_TEXT }}>
            Drop in your study notes, textbook passages, PDFs, or certification material. The AI extracts key ideas and builds structured topics.
          </motion.p>

          <div className="mt-8 space-y-3">
            {[
              { step: "01", title: "Content ingestion", desc: "Paste text or upload PDF, DOCX, and more", icon: "📄" },
              { step: "02", title: "Key idea isolation", desc: "AI identifies core concepts per section", icon: "🧠" },
              { step: "03", title: "Topic generation", desc: "Structured sessions personalised to how you learn", icon: "📦" },
            ].map((s, i) => (
              <motion.div key={s.step} custom={i + 3} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.4}>
                  <HudCard delay={i * 0.12}>
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}` }}>
                        <span className="text-[16px]">{s.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                            style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>Step {s.step}</span>
                        </div>
                        <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT_TEXT }}>{s.title}</p>
                        <p className="font-sans text-[10px] mt-0.5" style={{ color: DIM_TEXT }}>{s.desc}</p>
                      </div>
                      <motion.div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col items-center gap-6">
          <DemoPhoneFrame dark>
            <PhoneUploadScreen />
          </DemoPhoneFrame>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 4 — MEET LILY */
function Panel4({ speaking }: { speaking: boolean }) {
  return (
    <section id="panel-4" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>System · AI Coach</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4.5vw,54px)] font-normal leading-[1.05]"
            style={{ letterSpacing: "-1px", color: LIGHT_TEXT }}>
            Meet <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>Lily.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[18px] font-light leading-[1.6] mt-6" style={{ color: DIM_TEXT }}>
            Lily is your AI coach. She reads every session aloud with a natural voice. Ask her questions. Challenge ideas. She adapts to you in real time.
          </motion.p>

          <div className="mt-10 space-y-3">
            {[
              { tag: "VOICE OUTPUT", icon: "🔊", title: "Lily reads every session", desc: "Natural ElevenLabs voice. Toggle on or off from any screen." },
              { tag: "AI COACH", icon: "🤖", title: "Live dialogue with Lily", desc: "Ask questions. Challenge ideas. She adapts and pushes you deeper." },
              { tag: "VOICE INPUT", icon: "🎤", title: "Speak back", desc: "Use your mic to explain. Lily listens, evaluates, and responds with live feedback." },
            ].map((f, i) => (
              <motion.div key={f.tag} custom={i + 3} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.5}>
                  <HudCard delay={i * 0.1}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}` }}>
                        <span className="text-[18px]">{f.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                            style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>{f.tag}</span>
                        </div>
                        <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT_TEXT }}>{f.title}</p>
                        <p className="font-sans text-[11px] mt-0.5" style={{ color: DIM_TEXT }}>{f.desc}</p>
                      </div>
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col items-center justify-center">
          <DemoPhoneFrame dark>
            <PhoneStudyScreen />
          </DemoPhoneFrame>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 5 — PROVE IT */
function Panel5({ speaking }: { speaking: boolean }) {
  const features = [
    { icon: "📝", title: "Quiz", tag: "PROGRESSIVE", desc: "Starts with multiple choice, then true/false, then open-ended." },
    { icon: "🎤", title: "Explain It", tag: "LIVE FEEDBACK", desc: "Explain in your own words. Lily scores clarity, depth, and example use." },
    { icon: "🌍", title: "Real-World", tag: "SCENARIO", desc: "A real situation. A time limit. Prove you can apply it under pressure." },
    { icon: "💬", title: "Dialogue", tag: "AI COACH", desc: "Live conversation with Lily. Challenge, question, go deeper." },
    { icon: "🃏", title: "Flashcards", tag: "SPACED REP", desc: "Voice reads front and back. Spaced repetition with difficulty tracking." },
  ];

  return (
    <section id="panel-5" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="600" height="600" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="280" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="300" cy="300" r="200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="300" cy="300" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="300" cy="300" r="280" fill="none" stroke="hsla(32,82%,51%,0.12)" strokeWidth="1" strokeDasharray="8 20" />
          </svg>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-8 relative z-10">
        <CinematicSection className="text-center mb-12">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Coaching Modes</span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,5vw,62px)] font-normal"
            style={{ letterSpacing: "-2px", color: LIGHT_TEXT }}>
            Five ways to <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>prove it.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[18px] font-light leading-[1.6] mt-4 max-w-[550px] mx-auto" style={{ color: DIM_TEXT }}>
            Not just recall. We test whether you can explain, apply, and defend.
          </motion.p>
        </CinematicSection>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start max-w-[1100px] mx-auto">
          <CinematicSection className="space-y-3">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.3}>
                  <HudCard delay={i * 0.1}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                        style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>{f.tag}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[24px]">{f.icon}</span>
                      <div>
                        <p className="font-sans text-[14px] font-bold" style={{ color: LIGHT_TEXT }}>{f.title}</p>
                        <p className="font-sans text-[10px] mt-0.5 leading-[1.4]" style={{ color: DIM_TEXT }}>{f.desc}</p>
                      </div>
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </CinematicSection>

          <CinematicSection className="flex flex-col items-center justify-center">
            <DemoPhoneFrame dark>
              <PhoneQuizScreen />
            </DemoPhoneFrame>
          </CinematicSection>

          <CinematicSection className="hidden lg:flex flex-col items-center justify-center">
            <DemoPhoneFrame dark>
              <PhoneExplainScreen />
            </DemoPhoneFrame>
          </CinematicSection>
        </div>
      </div>
    </section>
  );
}

/* PANEL — FLASHCARDS */
function PanelFlashcards({ speaking }: { speaking: boolean }) {
  return (
    <section id="panel-6" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <motion.div className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-1">
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 8px hsl(var(--sage))" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(140,22%,45%,0.6)" }}>Spaced repetition · Active</span>
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Flashcards</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05]" style={{ color: LIGHT_TEXT }}>
            Smarter <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>flashcards.</span>
          </motion.h2>

          <SpeakingGlow speaking={speaking}>
            <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] mt-6" style={{ color: DIM_TEXT }}>
              Not just flip and forget. Every card tracks difficulty, timing, and accuracy. Then it comes back at the perfect moment.
            </motion.p>
          </SpeakingGlow>

          <div className="mt-8 space-y-3">
            {[
              { icon: "🃏", title: "Difficulty rating", desc: "Mark each card easy, medium, or hard. The system adapts." },
              { icon: "⏱", title: "Time tracking", desc: "Average time per card shows where you hesitate." },
              { icon: "🔁", title: "Spaced repetition", desc: "Hard cards come back sooner. Easy ones space out." },
              { icon: "📊", title: "Session accuracy", desc: "See your accuracy %, difficulty breakdown, and trends." },
            ].map((s, i) => (
              <motion.div key={s.title} custom={i + 3} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.4}>
                  <HudCard delay={i * 0.12}>
                    <div className="flex items-start gap-4">
                      <span className="text-[20px]">{s.icon}</span>
                      <div className="flex-1">
                        <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT_TEXT }}>{s.title}</p>
                        <p className="font-sans text-[10px] mt-0.5" style={{ color: DIM_TEXT }}>{s.desc}</p>
                      </div>
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col items-center justify-center">
          <DemoPhoneFrame dark>
            <PhoneFlashcardScreen />
          </DemoPhoneFrame>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL — ANALYTICS */
function PanelAnalytics({ speaking }: { speaking: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} id="panel-7" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <motion.div className="absolute top-8 right-8 pointer-events-none text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(32,82%,51%,0.5)" }}>Analytics engine · Live</span>
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 8px hsl(var(--sage))" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Analytics</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4.5vw,58px)] font-normal leading-[1.05]" style={{ color: LIGHT_TEXT }}>
            Analyze your{" "}
            <motion.span className="italic" style={{ color: "hsl(var(--amber-bright))" }}
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              learning data.
            </motion.span>
          </motion.h2>

          <SpeakingGlow speaking={speaking}>
            <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] mt-6" style={{ color: DIM_TEXT }}>
              Streak tracking, concept mastery stages, repetition schedules, and accuracy across every test type. You always know exactly where you stand.
            </motion.p>
          </SpeakingGlow>

          <div className="mt-8 space-y-3">
            {[
              { icon: "🔥", title: "Streak tracking", desc: "Visualise your daily consistency with a 7-day heatmap" },
              { icon: "📈", title: "Knowledge retention", desc: "Average score across quizzes, explain-it-back, and scenario modes" },
              { icon: "🎯", title: "Daily focus nudge", desc: "Each day, Lily suggests what to review based on your weakest areas" },
              { icon: "📅", title: "Repetition schedule", desc: "A bar chart of what's due today, tomorrow, and this week" },
            ].map((s, i) => (
              <motion.div key={s.title} custom={i + 3} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.4}>
                  <HudCard delay={i * 0.12}>
                    <div className="flex items-start gap-4">
                      <span className="text-[20px]">{s.icon}</span>
                      <div className="flex-1">
                        <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT_TEXT }}>{s.title}</p>
                        <p className="font-sans text-[10px] mt-0.5" style={{ color: DIM_TEXT }}>{s.desc}</p>
                      </div>
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col items-center justify-center">
          <DemoPhoneFrame dark>
            <PhoneAnalyticsScreen />
          </DemoPhoneFrame>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 6 — COMPARISON */
function Panel6({ speaking }: { speaking: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const rows = [
    ["AI breaks content into topics and sessions", true, false, true],
    ["Personalised to how you learn", true, false, false],
    ["PDF and document upload", true, false, true],
    ["Voice reads sessions aloud", true, false, false],
    ["Smart suggestion chips", true, false, false],
    ["AI coach persona (Lily)", true, false, false],
    ["Progressive quiz difficulty", true, false, false],
    ["AI dialogue / conversation", true, false, true],
    ["Explain-it-back with live feedback", true, false, false],
    ["Real-world scenario practice", true, false, false],
    ["Daily focus nudges", true, false, false],
    ["Flashcards with spaced repetition", true, false, false],
    ["Fluency score (not just recall)", true, false, false],
    ["Live meeting transcription", true, false, false],
    ["Ask anything across topics", true, false, false],
  ] as const;

  return (
    <section id="panel-8" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />

      <motion.div className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 8px hsla(32,82%,51%,0.6)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(32,82%,51%,0.5)" }}>Competitive analysis · Live</span>
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1100px] px-8">
        <CinematicSection className="text-center mb-12">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Market Scan</span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal" style={{ color: LIGHT_TEXT }}>
            Nobody else does <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>this.</span>
          </motion.h2>
        </CinematicSection>

        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }} className="relative max-w-[900px] mx-auto">
          <SpeakingGlow speaking={speaking}>
            <HudCard className="!p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                    <th className="font-sans text-[11px] font-medium p-4" style={{ color: DIM_TEXT }}>Feature</th>
                    <th className="font-sans text-[11px] font-bold p-4 text-center" style={{ color: "hsl(var(--amber-bright))" }}>This App</th>
                    <th className="font-sans text-[11px] font-medium p-4 text-center" style={{ color: DIM_TEXT }}>Readwise</th>
                    <th className="font-sans text-[11px] font-medium p-4 text-center" style={{ color: DIM_TEXT }}>NotebookLM</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([feat, us, rw, nb], rowIdx) => (
                    <motion.tr key={feat as string} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
                      initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: rowIdx * 0.08, ease }}>
                      <td className="font-sans text-[12px] p-4" style={{ color: DIM_TEXT }}>{feat as string}</td>
                      <td className="text-center p-4">
                        <motion.span className="font-semibold text-[16px]" style={{ color: "hsl(var(--amber-bright))" }}
                          animate={{ textShadow: ["0 0 0px transparent", "0 0 8px hsla(32,82%,51%,0.4)", "0 0 0px transparent"] }}
                          transition={{ duration: 2, repeat: Infinity, delay: rowIdx * 0.15 }}>✓</motion.span>
                      </td>
                      <td className="text-center p-4">
                        {rw ? <span className="font-semibold" style={{ color: "hsl(var(--sage))" }}>✓</span>
                          : <span style={{ color: "rgba(255,255,255,0.12)" }}>✗</span>}
                      </td>
                      <td className="text-center p-4">
                        {nb ? <span className="font-semibold" style={{ color: "hsl(var(--sage))" }}>✓</span>
                          : <span style={{ color: "rgba(255,255,255,0.12)" }}>✗</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-2 p-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="font-sans text-[8px] uppercase tracking-[0.15em]" style={{ color: DIM_TEXT }}>
                  *Readwise surfaces highlights; does not test explanation ability
                </span>
              </div>
            </HudCard>
          </SpeakingGlow>

          <div className="absolute -left-[130px] top-[20%] hidden lg:block">
            <HudCallout label="Unique features" side="left" delay={0.5} />
          </div>
          <div className="absolute -right-[110px] top-[50%] hidden lg:block">
            <HudCallout label={`${rows.length - 3} exclusives`} side="right" delay={0.7} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* PANEL 7 — MEETING MODE */
function Panel7({ speaking }: { speaking: boolean }) {
  return (
    <section id="panel-9" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <motion.div className="absolute top-8 right-8 pointer-events-none text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(8,50%,52%,0.6)" }}>Live capture · ElevenLabs Scribe</span>
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 8px hsla(8,50%,52%,0.6)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-3 h-3 rounded-full"
              style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 16px hsla(8,50%,52%,0.6)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(8,50%,52%)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(8,50%,52%)" }}>New · Meeting Mode</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4.5vw,58px)] font-normal leading-[1.05]" style={{ color: LIGHT_TEXT }}>
            Walk in. Hit{" "}
            <motion.span className="italic" style={{ color: "hsl(8,50%,52%)" }}
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              record.
            </motion.span>
          </motion.h2>

          <SpeakingGlow speaking={speaking}>
            <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] mt-6" style={{ color: DIM_TEXT }}>
              Conference, lecture, or team meeting. The AI transcribes live, then extracts key learnings, action items, and turns everything into a study topic.
            </motion.p>
          </SpeakingGlow>

          <div className="mt-8 space-y-3">
            {[
              { step: "01", title: "Live transcription", desc: "Real-time speech-to-text with ElevenLabs Scribe", icon: "🎙" },
              { step: "02", title: "AI analysis", desc: "Summary, action items, decisions, and key learnings extracted automatically", icon: "🧠" },
              { step: "03", title: "Turn into a topic", desc: "One tap to generate sessions, quizzes, and flashcards from the meeting", icon: "📚" },
            ].map((s, i) => (
              <motion.div key={s.step} custom={i + 3} variants={slideLeft}>
                <SpeakingGlow speaking={speaking} delay={i * 0.4}>
                  <HudCard delay={i * 0.12}>
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}` }}>
                        <span className="text-[16px]">{s.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                            style={{ background: "hsla(8,50%,52%,0.15)", color: "hsl(8,50%,52%)" }}>Step {s.step}</span>
                        </div>
                        <p className="font-sans text-[13px] font-semibold" style={{ color: LIGHT_TEXT }}>{s.title}</p>
                        <p className="font-sans text-[10px] mt-0.5" style={{ color: DIM_TEXT }}>{s.desc}</p>
                      </div>
                      <motion.div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ background: "hsl(8,50%,52%)", boxShadow: "0 0 4px hsl(8,50%,52%)" }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                    </div>
                  </HudCard>
                </SpeakingGlow>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col items-center justify-center">
          <DemoPhoneFrame dark>
            <PhoneMeetingScreen />
          </DemoPhoneFrame>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL — PRICING */
function PanelPricing({ speaking }: { speaking: boolean }) {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      tagline: "Try one full session",
      cta: "Start free",
      isPrimary: false,
      features: [
        { text: "1 coaching session", included: true },
        { text: "1 content upload", included: true },
        { text: "AI-generated key insight", included: true },
        { text: "Unlimited sessions", included: false },
        { text: "Unlimited uploads", included: false },
        { text: "Real-life application prompts", included: false },
        { text: "Session history and library", included: false },
        { text: "Spaced return reminders", included: false },
      ],
    },
    {
      name: "Pro",
      price: { monthly: 14.99, annual: 9.99 },
      tagline: "For professionals who apply what they know",
      cta: "Start 7-day trial",
      isPrimary: true,
      badge: "Most popular",
      features: [
        { text: "1 coaching session", included: true },
        { text: "1 content upload", included: true },
        { text: "AI-generated key insight", included: true },
        { text: "Unlimited sessions", included: true },
        { text: "Unlimited uploads", included: true },
        { text: "Real-life application prompts", included: true },
        { text: "Session history and library", included: true },
        { text: "Spaced return reminders", included: true },
      ],
    },
    {
      name: "Teams",
      price: { monthly: 12, annual: 9 },
      tagline: "Per seat. For firms investing in their people.",
      cta: "Contact us",
      isPrimary: false,
      badge: "Min. 5 seats",
      features: [
        { text: "1 coaching session", included: true },
        { text: "1 content upload", included: true },
        { text: "AI-generated key insight", included: true },
        { text: "Unlimited sessions", included: true },
        { text: "Unlimited uploads", included: true },
        { text: "Real-life application prompts", included: true },
        { text: "Session history and library", included: true },
        { text: "Spaced return reminders", included: true },
      ],
      teamOnly: ["Admin dashboard", "Usage analytics", "Shared content library", "Priority support"],
    },
  ];

  return (
    <section id="panel-10" className="min-h-screen snap-start flex items-center relative overflow-hidden py-20" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <div className="mx-auto w-full max-w-[1100px] px-8">
        <CinematicSection className="text-center mb-12">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Pricing</span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,5vw,62px)] font-normal"
            style={{ letterSpacing: "-2px", color: LIGHT_TEXT }}>
            Simple{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>pricing.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[18px] font-light leading-[1.6] mt-4 max-w-[450px] mx-auto" style={{ color: DIM_TEXT }}>
            Start free. Go Pro when you're ready. No card required.
          </motion.p>

          {/* Toggle */}
          <motion.div custom={3} variants={fadeUp} className="inline-flex items-center rounded-pill p-1 mt-8"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}` }}>
            {["Monthly", "Annual"].map((label) => {
              const isActive = (label === "Annual") === annual;
              return (
                <button key={label} onClick={() => setAnnual(label === "Annual")}
                  className="px-5 py-2 rounded-pill border-none cursor-pointer text-[13px] font-sans font-medium transition-all duration-200"
                  style={{ background: isActive ? "hsl(var(--amber-bright))" : "transparent", color: isActive ? "#fff" : DIM_TEXT }}>
                  {label}
                  {label === "Annual" && <span className="ml-1.5 text-[10px] font-semibold" style={{ color: isActive ? "#fff" : "hsl(var(--amber-bright))" }}>-33%</span>}
                </button>
              );
            })}
          </motion.div>
        </CinematicSection>

        {/* Cards */}
        <motion.div ref={ref} className="flex flex-col md:flex-row gap-5 items-stretch"
          initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}>
          {plans.map((plan, planIdx) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: planIdx * 0.15, ease }}
                className="flex-1 rounded-2xl p-7 flex flex-col relative"
                style={{
                  background: plan.isPrimary ? "rgba(255,255,255,0.06)" : CARD_BG,
                  border: plan.isPrimary ? "2px solid hsl(var(--amber-bright))" : `1px solid ${CARD_BORDER}`,
                  boxShadow: plan.isPrimary ? "0 0 60px hsla(32,82%,51%,0.15)" : "none",
                }}>
                {plan.badge && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-pill text-[11px] font-sans font-semibold"
                    style={{ background: plan.isPrimary ? "hsl(var(--amber-bright))" : "rgba(255,255,255,0.1)", color: plan.isPrimary ? "#fff" : DIM_TEXT }}>
                    {plan.badge}
                  </div>
                )}

                <h3 className="font-serif text-2xl mt-2 mb-1" style={{ color: LIGHT_TEXT }}>{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-1">
                  {price === 0 ? (
                    <span className="font-sans text-3xl font-semibold" style={{ color: LIGHT_TEXT }}>Free</span>
                  ) : (
                    <>
                      <span className="font-sans text-3xl font-semibold" style={{ color: LIGHT_TEXT }}>${price.toFixed(2)}</span>
                      <span className="font-sans text-sm" style={{ color: DIM_TEXT }}>/mo</span>
                    </>
                  )}
                </div>

                {annual && price > 0 && (
                  <p className="font-sans text-xs mb-1" style={{ color: DIM_TEXT }}>Billed ${(price * 12).toFixed(0)}/year</p>
                )}

                <p className="font-sans text-sm mb-5" style={{ color: DIM_TEXT }}>{plan.tagline}</p>

                <div className="h-px mb-5" style={{ background: CARD_BORDER }} />

                <div className="flex flex-col gap-3 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {f.included ? (
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--sage))" }} />
                      ) : (
                        <Minus className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />
                      )}
                      <span className="font-sans text-[13px]" style={{ color: f.included ? LIGHT_TEXT : FAINT_TEXT }}>{f.text}</span>
                    </div>
                  ))}

                  {plan.teamOnly && (
                    <>
                      <div className="h-px my-1" style={{ background: CARD_BORDER }} />
                      {plan.teamOnly.map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--amber-bright))" }} />
                          <span className="font-sans text-[13px] font-medium" style={{ color: LIGHT_TEXT }}>{f}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (plan.name !== "Teams") navigate("/signin");
                  }}
                  className="w-full py-3.5 rounded-pill font-sans text-[13px] font-semibold cursor-pointer transition-all duration-200"
                  style={{
                    background: plan.isPrimary ? "hsl(var(--amber-bright))" : "transparent",
                    color: plan.isPrimary ? "#fff" : LIGHT_TEXT,
                    border: plan.isPrimary ? "none" : `2px solid ${CARD_BORDER}`,
                  }}>
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p className="font-sans text-xs mt-10 text-center"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ color: FAINT_TEXT }}>
          No card required for the free session. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}

/* PANEL 8 — CINEMATIC CLOSE */
function Panel8({ scrollTo, speaking }: { scrollTo: (n: number) => void; speaking: boolean }) {
  return (
    <section id="panel-11" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: DARK_BG }}>
      <GridOverlay />
      <ScanLine />
      <FloatingParticles />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top: "20%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 1000, borderRadius: "50%",
          background: "radial-gradient(circle, hsla(32,82%,51%,0.08) 0%, transparent 50%)", animation: "breathe 8s ease-in-out infinite",
        }} />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="700" height="700" viewBox="0 0 700 700">
            <circle cx="350" cy="350" r="320" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="350" cy="350" r="320" fill="none" stroke="hsla(32,82%,51%,0.08)" strokeWidth="1" strokeDasharray="8 24" />
            <circle cx="350" cy="350" r="240" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-8 text-center relative z-10">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>System · Mission Brief</span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif font-normal leading-[1.05] mx-auto max-w-[800px]"
            style={{ fontSize: "clamp(40px,5vw,64px)", letterSpacing: "-2px", color: LIGHT_TEXT }}>
            Train your knowledge.{" "}
            <motion.span className="italic" style={{ color: "hsl(var(--amber-bright))" }}
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              Own the room.
            </motion.span>
          </motion.h2>

          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8 max-w-[560px] mx-auto" style={{ color: DIM_TEXT }}>
            Upload → Learn with voice → Prove it five ways. That's it.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap justify-center gap-5 mt-14">
            {[
              { stat: "107+", desc: "professionals surveyed", tag: "RESEARCH" },
              { stat: "87%", desc: "say application is missing", accent: true, tag: "INSIGHT" },
              { stat: "5", desc: "ways to prove mastery", tag: "MODES" },
              { stat: "4 min", desc: "per session", tag: "EFFICIENCY" },
            ].map((c, i) => (
              <motion.div key={c.stat} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <HudCard delay={i * 0.12} style={{ width: 200, textAlign: "left" as const }}>
                  <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded mb-2 inline-block"
                    style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>{c.tag}</span>
                  <span className="font-serif text-[32px] leading-none block" style={{ color: LIGHT_TEXT }}>
                    {c.accent ? <>87<span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>%</span></> : c.stat}
                  </span>
                  <p className="font-sans text-[11px] mt-2 leading-[1.45]" style={{ color: DIM_TEXT }}>{c.desc}</p>
                  <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                    <span className="font-sans text-[7px] uppercase tracking-[0.15em]" style={{ color: DIM_TEXT }}>Verified</span>
                  </div>
                </HudCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fadeUp} className="flex flex-col items-center gap-4 mt-14">
            <button onClick={() => scrollTo(10)}
              className="rounded-pill px-14 py-4 font-sans text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 80px hsla(32,82%,51%,0.3), 0 4px 30px hsla(32,82%,51%,0.2)", animation: "ctaGlow 3s ease-in-out infinite" }}>
              See pricing ↑
            </button>
            <button onClick={() => scrollTo(0)}
              className="font-sans text-[12px] transition-colors duration-300" style={{ color: FAINT_TEXT }}>
              Watch again ↑
            </button>
            <p className="font-sans text-[12px] mt-4" style={{ color: FAINT_TEXT }}>
              Oxford EMBA Entrepreneurship Project · 2025
            </p>
          </motion.div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function Demo() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef(true);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSpokenPanel = useRef(-1);
  const { speak, stop, muted, toggleMute, speaking } = useTTS();

  const scrollTo = useCallback((n: number) => {
    const el = document.getElementById(`panel-${n}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (active !== lastSpokenPanel.current && panelNarrations[active]) {
      lastSpokenPanel.current = active;
      stop();
      const t = setTimeout(() => speak(panelNarrations[active]), 600);
      return () => clearTimeout(t);
    }
  }, [active, speak, stop]);

  useEffect(() => {
    if (speaking) return;
    if (!autoPlayRef.current) return;
    const t = setTimeout(() => {
      if (!autoPlayRef.current) return;
      const next = (active + 1) % PANEL_COUNT;
      setActive(next);
      scrollTo(next);
    }, 1200);
    return () => clearTimeout(t);
  }, [active, scrollTo, speaking]);

  const pauseAutoPlay = useCallback(() => {
    autoPlayRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      autoPlayRef.current = true;
      setActive((a) => a);
    }, 8000);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = () => pauseAutoPlay();
    const onTouch = () => pauseAutoPlay();
    container.addEventListener("wheel", onWheel, { passive: true });
    container.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouch);
    };
  }, [pauseAutoPlay]);

  useEffect(() => {
    const panels = Array.from({ length: PANEL_COUNT }, (_, i) =>
      document.getElementById(`panel-${i}`)
    ).filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = panels.indexOf(e.target as HTMLElement);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    panels.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      pauseAutoPlay();
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setActive((a) => { const next = Math.min(a + 1, PANEL_COUNT - 1); scrollTo(next); return next; });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => { const prev = Math.max(a - 1, 0); scrollTo(prev); return prev; });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollTo, pauseAutoPlay]);

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto" style={{ scrollSnapType: "y mandatory" }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
        @keyframes float0 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-8px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 0 40px hsla(32,82%,51%,0.25); }
          50% { box-shadow: 0 0 70px hsla(32,82%,51%,0.4); }
        }
        @keyframes lensFlare {
          0% { transform: translateX(-120%) rotate(-10deg); opacity: 0; }
          15% { opacity: 0.06; }
          50% { opacity: 0.03; }
          100% { transform: translateX(120%) rotate(10deg); opacity: 0; }
        }
        .lens-flare::after {
          content: '';
          position: absolute;
          top: 0; left: -50%; right: -50%; bottom: 0;
          background: linear-gradient(105deg, transparent 40%, hsla(32,82%,51%,0.08) 45%, hsla(32,82%,51%,0.12) 50%, hsla(32,82%,51%,0.08) 55%, transparent 60%);
          animation: lensFlare 12s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes vignettePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.85; }
        }
        @keyframes lightLeak {
          0% { opacity: 0; transform: translateX(-100%) skewX(-15deg); }
          20% { opacity: 0.12; }
          80% { opacity: 0.05; }
          100% { opacity: 0; transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes filmFlicker {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
          73% { opacity: 0.02; }
        }
      `}</style>

      {/* Cinematic letterbox bars */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: 28, background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)" }} />
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none" style={{ height: 28, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />

      {/* Global vignette */}
      <div className="fixed inset-0 z-30 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at center, transparent 50%, rgba(0,0,0,0.35) 100%)", animation: "vignettePulse 8s ease-in-out infinite" }} />

      {/* Ambient light leak */}
      <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "10%", left: 0, width: "40%", height: "80%",
          background: "linear-gradient(105deg, transparent, hsla(32,82%,51%,0.06), hsla(32,82%,51%,0.1), transparent)",
          animation: "lightLeak 18s ease-in-out infinite",
        }} />
      </div>

      {/* Film grain */}
      <div className="fixed inset-0 z-30 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          animation: "filmFlicker 3s linear infinite", mixBlendMode: "overlay",
        }} />

      <SideNav active={active} />
      <ProgressBar active={active} />

      <button onClick={toggleMute}
        className="fixed top-10 left-6 z-50 flex items-center gap-2 rounded-pill px-3 py-1.5 transition-all duration-300 hover:scale-105"
        style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${CARD_BORDER}`, backdropFilter: "blur(8px)" }}>
        <span className="text-[14px]">{muted ? "🔇" : "🔊"}</span>
        <span className="font-sans text-[9px] uppercase tracking-[0.15em]" style={{ color: DIM_TEXT }}>{muted ? "Unmute" : "Narrating"}</span>
      </button>
      <NarrationBadge speaking={speaking} />

      <Panel0 scrollTo={scrollTo} speaking={speaking && active === 0} />
      <ChapterCard number="01" title="The Problem" />
      <Panel1 speaking={speaking && active === 1} />
      <ChapterCard number="02" title="The Solution" />
      <Panel2 speaking={speaking && active === 2} />
      <ChapterCard number="03" title="Upload" />
      <Panel3 speaking={speaking && active === 3} />
      <ChapterCard number="04" title="Your Coach" />
      <Panel4 speaking={speaking && active === 4} />
      <ChapterCard number="05" title="Prove It" />
      <Panel5 speaking={speaking && active === 5} />
      <ChapterCard number="06" title="Flashcards" />
      <PanelFlashcards speaking={speaking && active === 6} />
      <ChapterCard number="07" title="Analytics" />
      <PanelAnalytics speaking={speaking && active === 7} />
      <ChapterCard number="08" title="The Edge" />
      <Panel6 speaking={speaking && active === 8} />
      <ChapterCard number="09" title="Meeting Mode" />
      <Panel7 speaking={speaking && active === 9} />
      <ChapterCard number="10" title="Pricing" />
      <PanelPricing speaking={speaking && active === 10} />
      <Panel8 scrollTo={scrollTo} speaking={speaking && active === 11} />
    </div>
  );
}
