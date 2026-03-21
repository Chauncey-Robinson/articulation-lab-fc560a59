import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import PhoneMockup from "@/components/demo/PhoneMockup";
import { useTTS } from "@/hooks/useSpeech";

const PANEL_COUNT = 8;

const panelNarrations = [
  "You know more than you can explain. Upload what you're studying. The AI breaks it down. A British voice teaches it back to you. Then you prove you own it.",
  "87 percent of professionals say real-life application is the most important feature they're missing. They studied. They finished. Then someone asked — and nothing came out.",
  "A gym for professional knowledge. Upload anything. The AI personalises to your learning style. Then prove you own it five ways.",
  "Paste text, upload PDFs, or drop in your notes. The AI extracts key ideas and builds structured modules automatically.",
  "Each lesson is read aloud by Lily — a natural British AI voice. Toggle voice on or off anytime. Then discuss with the AI tutor, or speak your answers back.",
  "Five ways to prove mastery. Quizzes start with multiple choice, then true or false, then open-ended — adapting to your learning style. Plus teach-back, real-world scenarios, dialogue, and flashcards.",
  "Nobody else combines voice-taught lessons, learning style personalisation, progressive quizzes, and five assessment modes. This is unique.",
  "Train your knowledge. Own the room. Upload, learn with voice, prove it five ways. That's it.",
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

/* ─── reusable bits ─── */

function CinematicSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating particles ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsla(32,82%,51%,${0.15 + Math.random() * 0.2})`,
            animation: `float${i % 3} ${6 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ active }: { active: number }) {
  const pct = ((active + 1) / PANEL_COUNT) * 100;
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[3px] z-50" style={{ background: "hsl(var(--muted))" }}>
      <motion.div
        className="h-full"
        style={{ background: "hsl(var(--amber-bright))" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease }}
      />
    </div>
  );
}

/* ─── Side nav ─── */
function SideNav({ active }: { active: number }) {
  const labels = ["Intro", "Problem", "Solution", "Upload", "Learn", "Test", "Compare", "Close"];
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5 items-end">
      {labels.map((l, i) => (
        <a
          key={i}
          href={`#panel-${i}`}
          className="flex items-center gap-2 group"
        >
          <span
            className="font-sans text-[9px] uppercase tracking-[0.12em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: i === active ? "hsl(var(--amber-bright))" : "hsl(var(--ink-3))" }}
          >
            {l}
          </span>
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: i === active ? 24 : 6,
              height: 6,
              background: i === active ? "hsl(var(--amber-bright))" : "hsl(var(--border))",
            }}
          />
        </a>
      ))}
    </div>
  );
}

/* ─── Fluency bar ─── */
function FluencyBar({ label, pct, color, animate }: { label: string; pct: number; color: string; animate: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[11px] w-[110px] text-right" style={{ color: "hsl(var(--ink-3))" }}>{label}</span>
      <div className="flex-1 h-[4px] rounded-[2px]" style={{ background: "hsl(var(--surface-2))" }}>
        <motion.div
          className="h-full rounded-[2px]"
          initial={{ width: 0 }}
          animate={{ width: animate ? `${pct}%` : 0 }}
          transition={{ duration: 1.4, ease }}
          style={{ background: color }}
        />
      </div>
      <span className="font-sans text-[10px] w-8" style={{ color: "hsl(var(--muted-foreground))" }}>{pct}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PANELS
   ═══════════════════════════════════════════ */

/* PANEL 0 — CINEMATIC HERO */
function Panel0({ scrollTo }: { scrollTo: (n: number) => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="panel-0"
      className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "hsl(var(--foreground))" }}
    >
      {/* Dramatic gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top: "-30%", right: "-15%", width: 900, height: 900, borderRadius: "50%",
          background: "radial-gradient(circle, hsla(32,82%,51%,0.12) 0%, transparent 60%)",
          animation: "breathe 8s ease-in-out infinite",
        }} />
        <div className="absolute" style={{
          bottom: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, hsla(140,22%,45%,0.06) 0%, transparent 60%)",
          animation: "breathe 10s ease-in-out infinite 2s",
        }} />
      </div>
      <FloatingParticles />

      {/* Film grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto w-full max-w-[1200px] px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-center">
          <CinematicSection>
            <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "hsl(var(--amber-bright))" }}>
                A new kind of learning tool · 2025
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-serif font-normal leading-[0.92]"
              style={{ fontSize: "clamp(52px,6vw,92px)", letterSpacing: "-3px", color: "hsl(var(--background))" }}
            >
              You know more
              <br />
              than you can
              <br />
              <motion.span
                className="italic"
                style={{ color: "hsl(var(--amber-bright))" }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                explain.
              </motion.span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="font-serif text-[22px] font-light leading-[1.6] mt-8 max-w-[480px]"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Upload what you're studying. The AI breaks it down. A British voice teaches it back to you.
              Then you prove you own it.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex items-center gap-5 mt-12">
              <button onClick={() => scrollTo(1)}
                className="rounded-pill px-10 py-4 font-sans text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "hsl(var(--amber-bright))",
                  boxShadow: "0 0 60px hsla(32,82%,51%,0.3), 0 4px 20px hsla(32,82%,51%,0.2)",
                }}>
                See how it works →
              </button>
              <button onClick={() => scrollTo(7)}
                className="font-sans text-[13px] transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                Skip to end ↓
              </button>
            </motion.div>
          </CinematicSection>

          <CinematicSection className="flex justify-center">
            <motion.div custom={2} variants={fadeScale}
              style={{ filter: "drop-shadow(0 0 80px hsla(32,82%,51%,0.15))" }}>
              <PhoneMockup />
            </motion.div>
          </CinematicSection>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-sans text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</span>
        <div className="w-[1px] h-6" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
      </motion.div>
    </section>
  );
}

/* PANEL 1 — THE PROBLEM (HUD style) */
function Panel1() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="panel-1" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />
      <FloatingParticles />

      {/* Diagnostic overlay */}
      <motion.div className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}>
        <div className="flex items-center gap-2 mb-1">
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(var(--destructive))", boxShadow: "0 0 8px hsla(var(--destructive) / 0.6)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsl(var(--destructive) / 0.7)" }}>Warning · Knowledge decay detected</span>
        </div>
        <span className="font-sans text-[7px] tracking-[0.15em]" style={{ color: "hsl(var(--border))" }}>DIAG-001 · RETENTION FAILURE</span>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--destructive))", boxShadow: "0 0 12px hsla(var(--destructive) / 0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--destructive))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--destructive))" }}>System · Alert</span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,4.5vw,58px)] font-normal leading-[1]" style={{ letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
            You finished it.<br />
            <span className="italic" style={{ color: "hsl(var(--destructive))" }}>Then nothing.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8" style={{ color: "hsl(var(--ink-3))" }}>
            107 professionals told us the same thing. They studied. They finished. Then someone asked — and nothing came out.
          </motion.p>

          <motion.div custom={3} variants={fadeUp}>
            <HudCard delay={0.3} style={{ borderLeft: "2px solid hsl(8,50%,52%)" }}>
              <p className="font-serif text-[16px] italic leading-[1.55]" style={{ color: "hsl(var(--ink-2))" }}>
                "I started forgetting the details in the weeks after. When it came to applying it — I couldn't structure my thoughts."
              </p>
              <p className="font-sans text-[10px] mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>— ESG Professional, GRI Certification, 2025</p>
            </HudCard>
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
                <span className="font-serif leading-none" style={{ fontSize: "clamp(72px,8vw,100px)", color: "hsl(var(--foreground))" }}>
                  87<span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>%</span>
                </span>
                <p className="font-sans text-[14px] mt-3 max-w-[340px]" style={{ color: "hsl(var(--ink-3))" }}>
                  of professionals say real-life application is the most important feature they're missing.
                </p>
              </HudCard>
            </motion.div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { stat: "4×", desc: "times revisited before it sticks", tag: "RETENTION" },
                { stat: "£0", desc: "value of knowledge that can't be explained", tag: "FLUENCY" },
              ].map((c, i) => (
                <motion.div key={c.stat} custom={i + 1} variants={slideRight}>
                  <HudCard delay={(i + 2) * 0.15}>
                    <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded mb-2 inline-block"
                      style={{ background: "hsl(var(--destructive) / 0.12)", color: "hsl(var(--destructive))" }}>{c.tag}</span>
                    <span className="font-serif text-[36px] block" style={{ color: "hsl(var(--foreground))" }}>{c.stat}</span>
                    <p className="font-sans text-[11px] mt-1 leading-[1.45]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.desc}</p>
                    <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(var(--destructive))", boxShadow: "0 0 4px hsl(var(--destructive))" }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                      <span className="font-sans text-[7px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>Critical</span>
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

/* PANEL 2 — THE SOLUTION (overview) */
function Panel2() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="panel-2" className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}>
      <FloatingParticles />
      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Dark analytics card */}
        <CinematicSection>
          <motion.div ref={ref} custom={0} variants={fadeScale}
            className="rounded-[24px] p-8" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
            <span className="font-serif text-[80px] italic leading-none text-accent-bright">14</span>
            <p className="font-sans text-[11px] uppercase tracking-[0.14em] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Day streak</p>

            <div className="flex gap-2 mt-5">
              {[1, 1, 1, 1, 1, 0.4, 0].map((op, i) => (
                <motion.div key={i} className="w-6 h-[6px] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08, ease }}
                  style={{ background: op > 0 ? `hsla(32,82%,51%,${op})` : "hsl(var(--border))", transformOrigin: "left" }}
                />
              ))}
            </div>

            <p className="font-sans text-[10px] uppercase tracking-[0.14em] mt-8 mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
              Explanation fluency
            </p>
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
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "hsl(var(--amber-bright))" }}>
              How it works
            </span>
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(40px,4.5vw,58px)] font-normal leading-[1]"
            style={{ letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
            A gym for{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>professional knowledge.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8"
            style={{ color: "hsl(var(--ink-2))" }}>
            Upload → Learn → Prove. The AI does the heavy lifting. You just show up and speak.
          </motion.p>

          <div className="mt-10 space-y-4">
            {[
              { num: "00", title: "Discover your learning style", desc: "A quick assessment finds whether you're visual, auditory, reading, or hands-on — then personalises everything." },
              { num: "01", title: "Upload anything", desc: "Paste text, upload PDFs, or drop notes. AI breaks it into bite-sized modules with a clear key idea per lesson." },
              { num: "02", title: "A British voice teaches you", desc: "Each lesson is read aloud by Lily. Toggle voice on or off. Then discuss with the AI tutor." },
              { num: "03", title: "Prove you own it", desc: "Quizzes progress from multiple choice to open-ended. Plus teach-back, real-world scenarios, and flashcards." },
            ].map((c, i) => (
              <motion.div key={c.num} custom={i + 3} variants={slideRight}
                className="rounded-[16px] p-5 hover:-translate-y-1 transition-all duration-300"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-start gap-4">
                  <span className="font-serif text-[28px] italic" style={{ color: "hsl(var(--amber-bright))" }}>{c.num}</span>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{c.title}</p>
                    <p className="font-sans text-[13px] mt-1 leading-[1.5]" style={{ color: "hsl(var(--ink-3))" }}>{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 3 — UPLOAD & EXTRACT (HUD style) */
function Panel3() {
  return (
    <section id="panel-3" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />
      <FloatingParticles />

      {/* Top-right system label */}
      <motion.div className="absolute top-8 right-8 pointer-events-none text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(32,82%,51%,0.5)" }}>Ingestion pipeline · Active</span>
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(var(--sage))", boxShadow: "0 0 8px hsl(var(--sage))" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
        <span className="font-sans text-[7px] tracking-[0.15em]" style={{ color: "hsl(var(--border))" }}>MOD-GEN v2.1 · GEMINI-2.5-FLASH</span>
      </motion.div>

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--amber-bright))" }}>
              System · Content Ingestion
            </span>
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05]" style={{ color: "hsl(var(--foreground))" }}>
            Paste anything.{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>The AI does the rest.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] mt-6" style={{ color: "hsl(var(--ink-3))" }}>
            Drop in your study notes, textbook passages, PDFs, or certification material. The AI extracts key ideas and builds structured modules.
          </motion.p>

          {/* Pipeline steps */}
          <div className="mt-8 space-y-3">
            {[
              { step: "01", title: "Content ingestion", desc: "Paste text or upload PDF, DOCX, and more", icon: "📄" },
              { step: "02", title: "Key idea isolation", desc: "AI identifies core concepts per section", icon: "🧠" },
              { step: "03", title: "Module generation", desc: "Structured lessons personalised to your learning style", icon: "📦" },
            ].map((s, i) => (
              <motion.div key={s.step} custom={i + 3} variants={slideLeft}>
                <HudCard delay={i * 0.12}>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                      <span className="text-[16px]">{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                          style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>Step {s.step}</span>
                      </div>
                      <p className="font-sans text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{s.title}</p>
                      <p className="font-sans text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</p>
                    </div>
                    <motion.div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                  </div>
                </HudCard>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        <CinematicSection className="flex flex-col gap-4">
          {/* Input card */}
          <motion.div custom={0} variants={slideRight}>
            <HudCard delay={0.1}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--ink-3))" }}>Input</span>
                <HudCallout label="Raw text" side="right" delay={0.3} />
              </div>
              <p className="font-serif text-[11px] font-light leading-[1.6]" style={{ color: "hsl(var(--ink-2))" }}>
                "GRI 3 requires organisations to determine which topics are material… double materiality considers both financial and impact materiality…"
              </p>
            </HudCard>
          </motion.div>

          {/* Arrow */}
          <motion.div custom={1} variants={fadeUp} className="flex flex-col items-center gap-1 py-1">
            <motion.div className="flex flex-col items-center"
              animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <div className="w-[1px] h-6" style={{ background: "linear-gradient(to bottom, hsla(32,82%,51%,0.6), hsla(32,82%,51%,0.1))" }} />
              <div className="w-0 h-0" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid hsla(32,82%,51%,0.5)" }} />
            </motion.div>
            <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsl(var(--muted-foreground))" }}>Processing</span>
          </motion.div>

          {/* Output card */}
          <motion.div custom={2} variants={slideRight} className="relative">
            <HudCard delay={0.3} style={{ border: "1px solid hsla(32,82%,51%,0.3)" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <HudCallout label="AI generated" side="right" delay={0.6} />
                <HudCallout label="5 lessons" side="right" delay={0.8} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                  style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>✦ Module generated</span>
              </div>
              <p className="font-serif text-[18px]" style={{ color: "hsl(var(--foreground))" }}>GRI Standards</p>
              <p className="font-sans text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>5 lessons · 12 quiz questions</p>
              <div className="mt-3 space-y-1.5">
                {["Double Materiality", "Stakeholder Engagement", "Scope 3 Emissions", "Reporting Boundaries", "Assurance Standards"].map((l, i) => (
                  <motion.div key={l} className="flex items-center gap-2 font-sans text-[11px]"
                    style={{ color: "hsl(var(--ink-2))" }}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}>
                    <motion.span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
                      style={{ background: "hsla(32,82%,51%,0.15)", color: "hsl(var(--amber-bright))" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}>
                      {i + 1}
                    </motion.span>
                    {l}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <motion.div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="font-sans text-[7px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>Ready · Module compiled</span>
              </div>
            </HudCard>
          </motion.div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* ─── HUD Components ─── */
function HudCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");
  return (
    <div className="absolute" style={{
      [isTop ? "top" : "bottom"]: 0,
      [isLeft ? "left" : "right"]: 0,
      width: 16, height: 16,
      borderColor: "hsla(32,82%,51%,0.4)",
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
      style={{
        background: "hsl(var(--muted))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 16,
        padding: 24,
        ...extraStyle,
      }}
    >
      <HudCorner position="tl" /><HudCorner position="tr" />
      <HudCorner position="bl" /><HudCorner position="br" />
      {children}
    </motion.div>
  );
}

function HudCallout({ label, side, delay = 0 }: { label: string; side: "left" | "right"; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease }}
      className="flex items-center gap-2"
      style={{ flexDirection: side === "left" ? "row" : "row-reverse" }}
    >
      <div className="flex items-center gap-1.5" style={{ flexDirection: side === "left" ? "row" : "row-reverse" }}>
        <motion.div className="w-2 h-2 rounded-full"
          style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 8px hsla(32,82%,51%,0.5)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div style={{ width: 40, height: 1, background: "linear-gradient(to right, hsla(32,82%,51%,0.6), hsla(32,82%,51%,0.1))" }} />
      </div>
      <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em]"
        style={{ color: "hsl(var(--amber-bright))" }}>
        {label}
      </span>
    </motion.div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[1px] pointer-events-none"
      style={{ background: "linear-gradient(to right, transparent, hsla(32,82%,51%,0.15), transparent)" }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* PANEL 4 — LEARN WITH VOICE (HUD style) */
function Panel4() {
  return (
    <section id="panel-4" className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />
      <FloatingParticles />

      <div className="mx-auto w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3 mb-6">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsl(var(--amber-bright))" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "hsl(var(--amber-bright))" }}>
              System · Voice Engine
            </span>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp}
            className="font-serif text-[clamp(36px,4.5vw,54px)] font-normal leading-[1.05]"
            style={{ letterSpacing: "-1px", color: "hsl(var(--foreground))" }}>
            A voice that{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>teaches.</span>
          </motion.h2>

          <motion.p custom={2} variants={fadeUp}
            className="font-serif text-[18px] font-light leading-[1.6] mt-6"
            style={{ color: "hsl(var(--ink-3))" }}>
            Each lesson is read aloud by Lily — a natural British AI voice. Toggle voice on or off anytime. Then discuss with the tutor and speak it back.
          </motion.p>

          {/* HUD feature callouts */}
          <div className="mt-10 space-y-3">
            {[
              { tag: "VOICE OUTPUT", icon: "🔊", title: "AI reads every lesson", desc: "Natural ElevenLabs TTS. Toggle on or off from any screen." },
              { tag: "AI TUTOR", icon: "🤖", title: "Live dialogue", desc: "Ask questions. Challenge ideas. The tutor adapts in real time." },
              { tag: "VOICE INPUT", icon: "🎤", title: "Speak back", desc: "Use your mic to explain. The AI listens, evaluates, responds." },
            ].map((f, i) => (
              <motion.div key={f.tag} custom={i + 3} variants={slideLeft}>
                <HudCard delay={i * 0.1}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                      <span className="text-[18px]">{f.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                          style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>
                          {f.tag}
                        </span>
                      </div>
                      <p className="font-sans text-[13px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>{f.title}</p>
                      <p className="font-sans text-[11px] mt-0.5" style={{ color: "hsl(var(--ink-3))" }}>{f.desc}</p>
                    </div>
                  </div>
                </HudCard>
              </motion.div>
            ))}
          </div>
        </CinematicSection>

        {/* Right: HUD voice visualiser */}
        <CinematicSection className="flex flex-col items-center justify-center">
          <motion.div custom={0} variants={fadeScale} className="relative">
            {/* Rotating ring */}
            <motion.div className="absolute" style={{ inset: -30 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <circle cx="200" cy="200" r="180" fill="none" stroke="hsla(32,82%,51%,0.08)" strokeWidth="1" />
                <circle cx="200" cy="200" r="180" fill="none" stroke="hsla(32,82%,51%,0.4)" strokeWidth="1.5"
                  strokeDasharray="20 40 10 30" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* Inner rotating ring */}
            <motion.div className="absolute" style={{ inset: -15 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <circle cx="200" cy="200" r="185" fill="none" stroke="hsla(32,82%,51%,0.06)" strokeWidth="0.5"
                  strokeDasharray="5 15" />
              </svg>
            </motion.div>

            <HudCard className="!rounded-[28px] !p-8 text-center" style={{ width: 300 }}>
              {/* Callout labels around the card */}
              <div className="absolute -left-[140px] top-[30%]">
                <HudCallout label="ElevenLabs API" side="left" delay={0.3} />
              </div>
              <div className="absolute -right-[120px] top-[25%]">
                <HudCallout label="British accent" side="right" delay={0.5} />
              </div>
              <div className="absolute -left-[130px] top-[65%]">
                <HudCallout label="Real-time stream" side="left" delay={0.7} />
              </div>
              <div className="absolute -right-[110px] top-[70%]">
                <HudCallout label="Voice ID: Lily" side="right" delay={0.9} />
              </div>

              <motion.div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--amber-bright)), hsla(32,82%,51%,0.4))",
                  boxShadow: "0 0 40px hsla(32,82%,51%,0.3)",
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <span className="text-white text-[30px]">🔊</span>
              </motion.div>
              <p className="font-serif text-[20px] italic" style={{ color: "hsl(var(--foreground))" }}>Lily</p>
              <p className="font-sans text-[10px] mt-1 uppercase tracking-[0.15em]"
                style={{ color: "hsl(var(--muted-foreground))" }}>Neural voice engine</p>

              {/* Waveform */}
              <div className="flex items-end justify-center gap-[2px] mt-6 h-10">
                {Array.from({ length: 28 }).map((_, i) => (
                  <motion.div key={i} className="w-[2.5px] rounded-full"
                    style={{ background: `hsla(32,82%,51%,${0.4 + Math.random() * 0.5})` }}
                    animate={{ height: [3, 6 + Math.random() * 28, 3] }}
                    transition={{ duration: 0.4 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
                  />
                ))}
              </div>

              {/* Status line */}
              <motion.div className="flex items-center justify-center gap-2 mt-4"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--sage))", boxShadow: "0 0 6px hsl(var(--sage))" }} />
                <span className="font-sans text-[9px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--sage))" }}>
                  Streaming
                </span>
              </motion.div>
            </HudCard>
          </motion.div>
        </CinematicSection>
      </div>
    </section>
  );
}

/* PANEL 5 — TEST & PROVE (Iron Man HUD explainer) */
function Panel5() {
  const features = [
    { icon: "📝", title: "Quiz", tag: "PROGRESSIVE", desc: "Starts with multiple choice, then true/false, then open-ended. Adapts to your learning style.", position: { top: "5%", left: "2%" }, lineAngle: 25 },
    { icon: "🎤", title: "Teach Back", tag: "VOICE INPUT", desc: "Explain the concept in your own words. AI scores your fluency.", position: { top: "5%", right: "2%" }, lineAngle: -25 },
    { icon: "🌍", title: "Real-World", tag: "SCENARIO", desc: "A real situation. A time limit. Prove you can apply it under pressure.", position: { bottom: "8%", left: "2%" }, lineAngle: -20 },
    { icon: "💬", title: "Dialogue", tag: "AI TUTOR", desc: "Live conversation with the AI. Challenge, question, go deeper.", position: { bottom: "8%", right: "2%" }, lineAngle: 20 },
    { icon: "🃏", title: "Flashcards", tag: "SPACED REP", desc: "Voice reads front & back. Spaced repetition keeps it fresh.", position: { top: "50%", left: "50%", transform: "translate(-50%,-50%)" } as any, lineAngle: 0 },
  ];

  return (
    <section id="panel-5" className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />

      {/* Radial target */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="600" height="600" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="280" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="300" cy="300" r="200" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="300" cy="300" r="120" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="300" cy="300" r="280" fill="none" stroke="hsla(32,82%,51%,0.12)" strokeWidth="1" strokeDasharray="8 20" />
          </svg>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-8 relative z-10">
        {/* Header */}
        <CinematicSection className="text-center mb-16">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: "hsl(var(--amber-bright))" }}>
              System · Assessment Modes
            </span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp}
            className="font-serif text-[clamp(40px,5vw,62px)] font-normal"
            style={{ letterSpacing: "-2px", color: "hsl(var(--foreground))" }}>
            Five ways to{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>prove it.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp}
            className="font-serif text-[18px] font-light leading-[1.6] mt-4 max-w-[550px] mx-auto"
            style={{ color: "hsl(var(--ink-3))" }}>
            Not just recall. We test whether you can explain, apply, and defend.
          </motion.p>
        </CinematicSection>

        {/* HUD Feature Cards — positioned like a technical diagram */}
        <div className="relative mx-auto" style={{ maxWidth: 1000, minHeight: 420 }}>
          {/* Connecting lines from center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 20px hsla(32,82%,51%,0.5)" }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Grid layout for the 5 cards */}
          <div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: "auto auto" }}>
            {/* Top row: Quiz — center title — Teach Back */}
            {[features[0], features[4], features[1]].map((f, idx) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease }}>
                <HudCard delay={idx * 0.1}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                      style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>
                      {f.tag}
                    </span>
                    <HudCallout label="" side="right" delay={0} />
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.span className="text-[28px]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}>
                      {f.icon}
                    </motion.span>
                    <div>
                      <p className="font-sans text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{f.title}</p>
                    </div>
                  </div>
                  <p className="font-sans text-[11px] mt-2 leading-[1.5]" style={{ color: "hsl(var(--ink-3))" }}>
                    {f.desc}
                  </p>
                  {/* Mini data readout */}
                  <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                    <span className="font-sans text-[8px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Active · AI powered
                    </span>
                  </div>
                </HudCard>
              </motion.div>
            ))}

            {/* Bottom row: Real-World — spacer — Dialogue */}
            {[features[2], null, features[3]].map((f, idx) => (
              f ? (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: (idx + 3) * 0.15, ease }}>
                  <HudCard delay={(idx + 3) * 0.1}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                        style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>
                        {f.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.span className="text-[28px]"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, delay: idx * 0.4 }}>
                        {f.icon}
                      </motion.span>
                      <div>
                        <p className="font-sans text-[15px] font-bold" style={{ color: "hsl(var(--foreground))" }}>{f.title}</p>
                      </div>
                    </div>
                    <p className="font-sans text-[11px] mt-2 leading-[1.5]" style={{ color: "hsl(var(--ink-3))" }}>
                      {f.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                      <span className="font-sans text-[8px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Active · AI powered
                      </span>
                    </div>
                  </HudCard>
                </motion.div>
              ) : (
                <div key="spacer" className="flex items-center justify-center">
                  <motion.div className="flex flex-col items-center gap-2"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <motion.circle cx="30" cy="30" r="25" fill="none" stroke="hsla(32,82%,51%,0.2)" strokeWidth="1"
                        strokeDasharray="4 4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "center" }} />
                      <circle cx="30" cy="30" r="4" fill="hsla(32,82%,51%,0.3)" />
                    </svg>
                    <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsl(var(--border))" }}>
                      Neural core
                    </span>
                  </motion.div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* PANEL 6 — COMPARISON (HUD style) */
function Panel6() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const rows = [
    ["AI breaks content into modules & lessons", true, false, true],
    ["Voice reads lessons aloud (ElevenLabs)", true, false, false],
    ["AI dialogue / conversation", true, false, true],
    ["Teach-back evaluation", true, false, false],
    ["Real-world scenario practice", true, false, false],
    ["Flashcards with voice", true, false, false],
    ["Spaced repetition of explanations", true, "partial", false],
    ["Fluency score (not just recall)", true, false, false],
  ] as const;

  return (
    <section id="panel-6" className="min-h-screen snap-start flex items-center relative overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />

      {/* Top diagnostic */}
      <motion.div className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}>
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 8px hsla(32,82%,51%,0.6)" }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: "hsla(32,82%,51%,0.5)" }}>Competitive analysis · Live</span>
        </div>
      </motion.div>

      <div className="mx-auto w-full max-w-[1100px] px-8">
        <CinematicSection className="text-center mb-12">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>
              System · Market Scan
            </span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal" style={{ color: "hsl(var(--foreground))" }}>
            Nobody else does{" "}
            <span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>this.</span>
          </motion.h2>
        </CinematicSection>

        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
          className="relative max-w-[900px] mx-auto">
          <HudCard className="!p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <th className="font-sans text-[11px] font-medium p-4" style={{ color: "hsl(var(--muted-foreground))" }}>Feature</th>
                  <th className="font-sans text-[11px] font-bold p-4 text-center" style={{ color: "hsl(var(--amber-bright))" }}>This App</th>
                  <th className="font-sans text-[11px] font-medium p-4 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>Readwise</th>
                  <th className="font-sans text-[11px] font-medium p-4 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>NotebookLM</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([feat, us, rw, nb], rowIdx) => (
                  <motion.tr key={feat as string}
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: rowIdx * 0.08, ease }}>
                    <td className="font-sans text-[12px] p-4" style={{ color: "hsl(var(--ink-2))" }}>{feat as string}</td>
                    <td className="text-center p-4">
                      <motion.span className="font-semibold text-[16px]" style={{ color: "hsl(var(--amber-bright))" }}
                        animate={{ textShadow: ["0 0 0px transparent", "0 0 8px hsla(32,82%,51%,0.4)", "0 0 0px transparent"] }}
                        transition={{ duration: 2, repeat: Infinity, delay: rowIdx * 0.15 }}>✓</motion.span>
                    </td>
                    <td className="text-center p-4">
                      {rw === "partial" ? <span className="font-semibold" style={{ color: "hsl(var(--sage))" }}>✓*</span>
                        : rw ? <span className="font-semibold" style={{ color: "hsl(var(--sage))" }}>✓</span>
                        : <span style={{ color: "hsl(var(--border))" }}>✗</span>}
                    </td>
                    <td className="text-center p-4">
                      {nb ? <span className="font-semibold" style={{ color: "hsl(var(--sage))" }}>✓</span>
                        : <span style={{ color: "hsl(var(--border))" }}>✗</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 p-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <motion.div className="w-1.5 h-1.5 rounded-full"
                style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="font-sans text-[8px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>
                *Readwise surfaces highlights; does not test explanation ability
              </span>
            </div>
          </HudCard>

          {/* Callouts on the side */}
          <div className="absolute -left-[130px] top-[20%] hidden lg:block">
            <HudCallout label="Unique features" side="left" delay={0.5} />
          </div>
          <div className="absolute -right-[110px] top-[50%] hidden lg:block">
            <HudCallout label="6 exclusives" side="right" delay={0.7} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* PANEL 7 — CINEMATIC CLOSE (HUD style) */
function Panel7({ scrollTo }: { scrollTo: (n: number) => void }) {
  return (
    <section id="panel-7" className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <ScanLine />
      <FloatingParticles />

      {/* Central radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{
          top: "20%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 1000, borderRadius: "50%",
          background: "radial-gradient(circle, hsla(32,82%,51%,0.08) 0%, transparent 50%)",
          animation: "breathe 8s ease-in-out infinite",
        }} />
      </div>

      {/* Rotating rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="700" height="700" viewBox="0 0 700 700">
            <circle cx="350" cy="350" r="320" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="350" cy="350" r="320" fill="none" stroke="hsla(32,82%,51%,0.08)" strokeWidth="1" strokeDasharray="8 24" />
            <circle cx="350" cy="350" r="240" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-8 text-center relative z-10">
        <CinematicSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "hsl(var(--amber-bright))" }}>
              System · Mission Brief
            </span>
            <div className="w-10 h-[1px]" style={{ background: "hsla(32,82%,51%,0.5)" }} />
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--amber-bright))", boxShadow: "0 0 12px hsla(32,82%,51%,0.6)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp}
            className="font-serif font-normal leading-[1.05] mx-auto max-w-[800px]"
            style={{ fontSize: "clamp(40px,5vw,64px)", letterSpacing: "-2px", color: "hsl(var(--foreground))" }}>
            Train your knowledge.{" "}
            <motion.span className="italic" style={{ color: "hsl(var(--amber-bright))" }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              Own the room.
            </motion.span>
          </motion.h2>

          <motion.p custom={2} variants={fadeUp} className="font-serif text-[20px] font-light leading-[1.6] mt-8 max-w-[560px] mx-auto"
            style={{ color: "hsl(var(--ink-3))" }}>
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
                <HudCard delay={i * 0.12} style={{ width: 200, textAlign: "left" }}>
                  <span className="font-sans text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded mb-2 inline-block"
                    style={{ background: "hsla(32,82%,51%,0.12)", color: "hsl(var(--amber-bright))" }}>{c.tag}</span>
                  <span className="font-serif text-[32px] leading-none block" style={{ color: "hsl(var(--foreground))" }}>
                    {c.accent ? <>87<span className="italic" style={{ color: "hsl(var(--amber-bright))" }}>%</span></> : c.stat}
                  </span>
                  <p className="font-sans text-[11px] mt-2 leading-[1.45]" style={{ color: "hsl(var(--ink-3))" }}>{c.desc}</p>
                  <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "hsl(var(--sage))", boxShadow: "0 0 4px hsl(var(--sage))" }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                    <span className="font-sans text-[7px] uppercase tracking-[0.15em]" style={{ color: "hsl(var(--muted-foreground))" }}>Verified</span>
                  </div>
                </HudCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fadeUp} className="mt-14">
            <button onClick={() => scrollTo(0)}
              className="rounded-pill px-14 py-4 font-sans text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "hsl(var(--amber-bright))",
                boxShadow: "0 0 80px hsla(32,82%,51%,0.3), 0 4px 30px hsla(32,82%,51%,0.2)",
                animation: "ctaGlow 3s ease-in-out infinite",
              }}>
              Watch again ↑
            </button>
            <p className="font-sans text-[12px] mt-8" style={{ color: "hsl(var(--border))" }}>
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

  const scrollTo = useCallback((n: number) => {
    const el = document.getElementById(`panel-${n}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll through panels
  useEffect(() => {
    const AUTO_TIMES = [5000, 4000, 4500, 4000, 5000, 4500, 4000, 6000];
    if (!autoPlayRef.current) return;

    const t = setTimeout(() => {
      if (!autoPlayRef.current) return;
      const next = (active + 1) % PANEL_COUNT;
      setActive(next);
      scrollTo(next);
    }, AUTO_TIMES[active]);

    return () => clearTimeout(t);
  }, [active, scrollTo]);

  // Pause auto-scroll on user interaction, resume after 8s
  const pauseAutoPlay = useCallback(() => {
    autoPlayRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      autoPlayRef.current = true;
      // Trigger re-render to restart auto-scroll
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
        setActive((a) => {
          const next = Math.min(a + 1, PANEL_COUNT - 1);
          scrollTo(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => {
          const prev = Math.max(a - 1, 0);
          scrollTo(prev);
          return prev;
        });
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
      `}</style>
      <SideNav active={active} />
      <ProgressBar active={active} />
      <Panel0 scrollTo={scrollTo} />
      <Panel1 />
      <Panel2 />
      <Panel3 />
      <Panel4 />
      <Panel5 />
      <Panel6 />
      <Panel7 scrollTo={scrollTo} />
    </div>
  );
}
