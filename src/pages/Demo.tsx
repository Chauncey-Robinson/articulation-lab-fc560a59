import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import PhoneMockup from "@/components/demo/PhoneMockup";

const PANEL_COUNT = 6;

/* ─── animation variants ─── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease, delay: i * 0.08 },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease, delay: i * 0.12 },
  }),
};

/* ─── reusable bits ─── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-[2px] bg-accent-bright" />
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-bright">
        {children}
      </span>
    </div>
  );
}

function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div
      className="rounded-[12px] border-[1.5px] border-border bg-card p-5 mt-6"
      style={{ borderLeft: "3px solid hsl(var(--amber-bright))" }}
    >
      <p className="font-serif text-[16px] italic leading-[1.55] text-ink-2">"{quote}"</p>
      <p className="font-sans text-[11px] text-ink-3 mt-2">— {author}</p>
    </div>
  );
}

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Dot nav ─── */
function DotNav({ active }: { active: number }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: PANEL_COUNT }).map((_, i) => (
        <a
          key={i}
          href={`#panel-${i}`}
          className="block rounded-full transition-all duration-300"
          style={{
            width: i === active ? 10 : 8,
            height: i === active ? 10 : 8,
            background: i === active ? "hsl(var(--amber-bright))" : "hsl(var(--border))",
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
    <div className="fixed bottom-0 left-0 right-0 h-[3px] z-50" style={{ background: "hsl(var(--border))" }}>
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: "hsl(var(--amber-bright))" }}
      />
    </div>
  );
}

/* ─── fluency bar ─── */
function FluencyBar({
  label,
  pct,
  color,
  animate,
}: {
  label: string;
  pct: number;
  color: string;
  animate: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[11px] w-[110px] text-right" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
      <div className="flex-1 h-[4px] rounded-[2px]" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-[2px] transition-all"
          style={{
            width: animate ? `${pct}%` : "0%",
            background: color,
            transitionDuration: "1200ms",
            transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <span className="font-sans text-[10px] w-8" style={{ color: "rgba(255,255,255,0.25)" }}>
        {pct}%
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PANELS
   ═══════════════════════════════════════════ */

function Panel0({ scrollTo }: { scrollTo: (n: number) => void }) {
  return (
    <section
      id="panel-0"
      className="min-h-screen snap-start flex items-center relative overflow-hidden"
      style={{ background: "#F8F6F2" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          right: "-10%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsla(32,82%,51%,0.08) 0%, transparent 70%)",
          animation: "breathe 6s ease-in-out infinite",
        }}
      />
      <div
        className="mx-auto w-full items-center"
        style={{ maxWidth: 1100, padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 80 }}
      >
        {/* Left */}
        <AnimatedSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2 mb-6">
            <span className="w-[6px] h-[6px] rounded-full bg-accent-bright amber-pulse" />
            <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-bright">
              Professional training app · 2025
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-serif text-[clamp(48px,5.5vw,85px)] font-normal leading-[0.97]"
            style={{ letterSpacing: "-2px", color: "hsl(var(--foreground))" }}
          >
            You know more
            <br />
            than you can{" "}
            <span className="italic text-accent-bright">explain.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="font-serif text-[20px] font-light leading-[1.6] text-ink-2 mt-6 max-w-[440px]"
          >
            Practice explaining ideas until they stick. The app that trains professionals to speak
            their knowledge under pressure.
          </motion.p>

          <motion.ul custom={3} variants={fadeUp} className="mt-8 space-y-3">
            {[
              "Paste anything. The key idea appears instantly.",
              "Say it back. In a real situation.",
              "Do it again. Until you own it.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 items-start text-ink-2">
                <span className="mt-1.5 w-[7px] h-[7px] rounded-full bg-accent-bright shrink-0" />
                <span className="font-sans text-[14px] leading-[1.55]">{t}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div custom={4} variants={fadeUp} className="flex items-center gap-4 mt-10">
            <button
              onClick={() => scrollTo(1)}
              className="rounded-pill px-8 py-3 font-sans text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-accent-bright hover:-translate-y-[2px] transition-all duration-[180ms]"
            >
              See how it works →
            </button>
            <button
              onClick={() => scrollTo(5)}
              className="font-sans text-[13px] text-ink-3 hover:text-accent-bright transition-colors duration-[180ms]"
            >
              Skip to demo ↓
            </button>
          </motion.div>
        </AnimatedSection>

        {/* Right — phone */}
        <AnimatedSection className="flex justify-center">
          <motion.div custom={2} variants={slideRight}>
            <PhoneMockup />
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Panel1() {
  return (
    <section id="panel-1" className="min-h-screen snap-start flex items-center">
      <div className="mx-auto w-full max-w-[1160px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <AnimatedSection>
          <Eyebrow>The problem</Eyebrow>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05] text-foreground"
          >
            You finished it. Then nothing.
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] text-ink-2 mt-6">
            107 people told us the same thing. They studied. They finished. Then someone asked — and nothing came out.
          </motion.p>
          <motion.div custom={3} variants={fadeUp}>
            <QuoteCard
              quote="I started forgetting the details in the weeks after I finished it. When it came to applying it in a real client engagement — I couldn't structure my thoughts quickly."
              author="ESG Professional, GRI Certification, 2025"
            />
          </motion.div>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div custom={0} variants={slideRight} className="mb-6">
            <span className="font-serif text-[80px] leading-none text-foreground">
              87<span className="italic text-accent-bright">%</span>
            </span>
            <p className="font-sans text-[14px] text-ink-3 mt-2 max-w-[320px]">
              of professionals in our survey said real-life application is the most important feature
              they're missing from any current tool.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "4×", desc: "average times a professional revisits material before it sticks under pressure" },
              { stat: "£0", desc: "the value of knowledge that can't be explained when it's needed most" },
            ].map((c, i) => (
              <motion.div
                key={c.stat}
                custom={i + 1}
                variants={slideRight}
                className="rounded-[16px] border-[1.5px] border-border bg-card p-5 hover:border-accent-bright hover:-translate-y-[2px] transition-all duration-[180ms]"
              >
                <span className="font-serif text-[32px] text-foreground">{c.stat}</span>
                <p className="font-sans text-[12px] text-ink-3 mt-1 leading-[1.45]">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Panel2() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section id="panel-2" className="min-h-screen snap-start flex items-center">
      <div className="mx-auto w-full max-w-[1160px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Dark card */}
        <AnimatedSection>
          <motion.div
            ref={ref}
            custom={0}
            variants={fadeUp}
            className="rounded-[22px] p-7"
            style={{ background: "hsl(var(--foreground))" }}
          >
            <span className="font-serif text-[72px] italic leading-none text-accent-bright">14</span>
            <p className="font-sans text-[11px] uppercase tracking-[0.14em] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Day streak
            </p>

            {/* 7-day pips */}
            <div className="flex gap-2 mt-4">
              {[1, 1, 1, 1, 1, 0.4, 0].map((op, i) => (
                <div
                  key={i}
                  className="w-6 h-[6px] rounded-full"
                  style={{
                    background:
                      op > 0 ? `hsla(32,82%,51%,${op})` : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>

            <p
              className="font-sans text-[10px] uppercase tracking-[0.14em] mt-6 mb-3"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Explanation fluency
            </p>

            <div className="space-y-2.5">
              <FluencyBar label="GRI Standards" pct={78} color="hsl(var(--amber-bright))" animate={inView} />
              <FluencyBar label="IFRS 15" pct={54} color="hsl(var(--sage))" animate={inView} />
              <FluencyBar label="Atomic Habits" pct={93} color="hsl(var(--amber-bright))" animate={inView} />
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Right */}
        <AnimatedSection>
          <Eyebrow>How it works</Eyebrow>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05] text-foreground">
            A gym for <span className="italic text-accent-bright">professional knowledge.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] text-ink-2 mt-6">
            Same concept. New situation. Right timing. You show up, say it, get sharper. That's it.
          </motion.p>

          <div className="mt-8 space-y-4">
            {[
              { label: "ONE SESSION", title: "4 minutes. One idea. Say it out loud.", body: "Not a test. A rep. Like going to the gym." },
              { label: "IT COMES BACK", title: "The same idea returns. In a new situation.", body: "Until saying it feels like nothing at all." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                custom={i + 3}
                variants={slideRight}
                className="rounded-[16px] border-[1.5px] border-border bg-card p-5 hover:border-accent-bright hover:-translate-y-[2px] transition-all duration-[180ms]"
              >
                <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-accent-bright">{c.label}</span>
                <p className="font-sans text-[14px] font-semibold text-foreground mt-1">{c.title}</p>
                <p className="font-sans text-[13px] text-ink-2 mt-1 leading-[1.5]">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Panel3() {
  return (
    <section id="panel-3" className="min-h-screen snap-start flex items-center">
      <div className="mx-auto w-full max-w-[1160px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <AnimatedSection>
          <Eyebrow>The AI does the work first</Eyebrow>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal leading-[1.05] text-foreground">
            It does the work. <span className="italic text-accent-bright">You just talk.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] text-ink-2 mt-6">
            Paste what you studied. The app finds the one idea that matters and puts you in a real situation. No setup. No filing. Just go.
          </motion.p>
          <motion.div custom={3} variants={fadeUp}>
            <QuoteCard
              quote="The most important part for me would be application — being able to use knowledge in real situations. That's what truly reinforces learning."
              author="ACCA Professional, 2025"
            />
          </motion.div>
        </AnimatedSection>

        {/* 3-step visual */}
        <AnimatedSection className="flex flex-col gap-3">
          <motion.div
            custom={0}
            variants={slideRight}
            className="rounded-[16px] border-[1.5px] border-border bg-card p-5"
          >
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-ink-3">You paste this →</span>
            <p className="font-serif text-[11px] font-light leading-[1.6] text-ink-2 mt-2">
              "GRI 3 requires organisations to determine which topics are material to their
              business… double materiality considers both financial materiality and impact
              materiality…"
            </p>
          </motion.div>

          <motion.div custom={1} variants={slideRight} className="flex flex-col items-center gap-1 py-1">
            <span className="text-accent-bright text-[20px]">↓</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-ink-3">
              AI extracts in seconds
            </span>
          </motion.div>

          <motion.div
            custom={2}
            variants={slideRight}
            className="rounded-[16px] border-[1.5px] border-accent-bright bg-card p-5"
          >
            <span className="font-sans text-[9px] uppercase tracking-[0.12em] font-semibold text-accent-bright">
              ✦ Key concept
            </span>
            <p className="font-serif text-[17px] text-foreground mt-1">Double Materiality</p>
            <p className="font-serif text-[12px] font-light text-ink-2 mt-1 leading-[1.55]">
              Two-way mirror: the world's impact on you, and your impact on the world.
            </p>
            <div
              className="mt-3 rounded-[8px] p-3 font-serif text-[12px] italic leading-[1.5] text-ink-2"
              style={{
                borderLeft: "2px solid hsl(var(--amber-bright))",
                background: "hsl(var(--surface-2))",
              }}
            >
              "A CFO has two minutes. Explain this in plain English."
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Panel4() {
  const APP = "This App";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const rows = [
    ["Explanation practice (speak it back)", true, false, false],
    ["AI extracts key idea first", true, false, true],
    ["Real-world scenario framing", true, false, false],
    ["Spaced repetition of explanations", true, "partial", false],
    ["Fluency score (not just recall)", true, false, false],
    ["Designed for professional pressure", true, false, false],
  ] as const;

  return (
    <section id="panel-4" className="min-h-screen snap-start flex items-center">
      <div className="mx-auto w-full max-w-[1160px] px-6">
        <AnimatedSection className="text-center mb-12">
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-[2px] bg-accent-bright" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-bright">
              Why now
            </span>
            <div className="w-6 h-[2px] bg-accent-bright" />
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} className="font-serif text-[clamp(36px,4vw,50px)] font-normal text-foreground">
            Nobody else does <span className="italic text-accent-bright">this.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} className="font-serif text-[19px] font-light leading-[1.6] text-ink-2 mt-4 max-w-[640px] mx-auto">
            Other apps save what you read. This one trains you to say it. That gap — between knowing and explaining — is what we close.
          </motion.p>
        </AnimatedSection>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease }}
          className="rounded-[18px] border-[1.5px] border-border bg-card overflow-hidden max-w-[860px] mx-auto"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="font-sans text-[12px] font-medium text-ink-3 p-4">Feature</th>
                <th className="font-sans text-[12px] font-semibold text-accent-bright p-4 text-center">{APP}</th>
                <th className="font-sans text-[12px] font-medium text-ink-3 p-4 text-center">Readwise</th>
                <th className="font-sans text-[12px] font-medium text-ink-3 p-4 text-center">NotebookLM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feat, us, rw, nb]) => (
                <tr key={feat as string} className="border-b border-border last:border-0 hover:bg-surface-light transition-colors">
                  <td className="font-sans text-[13px] text-ink-2 p-4">{feat as string}</td>
                  <td className="text-center p-4">
                    <span className="text-accent-bright font-semibold">✓</span>
                  </td>
                  <td className="text-center p-4">
                    {rw === "partial" ? (
                      <span className="text-sage font-semibold">✓*</span>
                    ) : rw ? (
                      <span className="text-sage font-semibold">✓</span>
                    ) : (
                      <span className="text-border-strong">✗</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {nb ? (
                      <span className="text-sage font-semibold">✓</span>
                    ) : (
                      <span className="text-border-strong">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-sans text-[11px] text-ink-3 p-4 border-t border-border">
            *Readwise surfaces highlights; it does not test explanation ability
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Panel5({ scrollTo }: { scrollTo: (n: number) => void }) {
  return (
    <section
      id="panel-5"
      className="min-h-screen snap-start flex items-center"
      style={{ background: "hsl(var(--foreground))" }}
    >
      <div className="mx-auto w-full max-w-[1160px] px-6 text-center">
        <AnimatedSection>
          <motion.div custom={0} variants={fadeUp} className="flex items-center justify-center gap-2 mb-6">
            <span
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              The opportunity
            </span>
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            className="font-serif text-[clamp(36px,4.5vw,56px)] font-normal leading-[1.05]"
            style={{ color: "hsl(var(--background))" }}
          >
            Train your knowledge.{" "}
            <span className="italic text-accent-bright">Own the room.</span>
          </motion.h2>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="font-serif text-[19px] font-light leading-[1.6] mt-6 max-w-[560px] mx-auto"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            107 people. Same problem. One fix.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap justify-center gap-5 mt-12">
            {[
              { stat: "107+", desc: "professionals surveyed & interviewed" },
              { stat: "87%", desc: "say application is what's missing", accent: true },
              { stat: "4 min", desc: "per session — fits any professional schedule" },
            ].map((c) => (
              <div
                key={c.stat}
                className="rounded-[16px] p-6 text-left w-[260px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-serif text-[36px] leading-none" style={{ color: "hsl(var(--background))" }}>
                  {c.accent ? (
                    <>
                      87<span className="italic text-accent-bright">%</span>
                    </>
                  ) : (
                    c.stat
                  )}
                </span>
                <p
                  className="font-sans text-[12px] mt-2 leading-[1.45]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fadeUp} className="mt-12">
            <button
              onClick={() => scrollTo(0)}
              className="rounded-pill px-12 py-4 font-sans text-[14px] font-semibold text-white bg-accent-bright hover:-translate-y-[2px] transition-all duration-[180ms]"
              style={{
                boxShadow: "0 0 40px hsla(32,82%,51%,0.3)",
                animation: "ctaGlow 3s ease-in-out infinite",
              }}
            >
              See it again ↑
            </button>
            <p className="font-sans text-[13px] mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Oxford EMBA Entrepreneurship Project · 2025
            </p>
          </motion.div>
        </AnimatedSection>
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

  const scrollTo = useCallback((n: number) => {
    const el = document.getElementById(`panel-${n}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Observer for active panel
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

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
  }, [scrollTo]);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto bg-background"
      style={{ scrollSnapType: "y mandatory" }}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 0 30px hsla(32,82%,51%,0.25); }
          50% { box-shadow: 0 0 50px hsla(32,82%,51%,0.4); }
        }
      `}</style>
      <DotNav active={active} />
      <ProgressBar active={active} />
      <Panel0 scrollTo={scrollTo} />
      <Panel1 />
      <Panel2 />
      <Panel3 />
      <Panel4 />
      <Panel5 scrollTo={scrollTo} />
    </div>
  );
}
