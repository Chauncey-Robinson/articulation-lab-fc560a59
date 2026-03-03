import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    callout: "KNOW IT. SAY IT.",
    visual: (
      <div className="flex flex-col items-center">
        <span className="font-serif text-[180px] leading-none" style={{ color: "#F5F0E8" }}>7</span>
        <span className="text-sm" style={{ color: "#F5F0E8" }}>minutes</span>
      </div>
    ),
    headline: "Learn it once.\nUse it forever.",
  },
  {
    callout: "THE GAP",
    visual: (
      <div className="flex flex-col items-start gap-1 text-[1.4rem]" style={{ color: "#F5F0E8" }}>
        <span>You read it.</span>
        <span>You got it.</span>
        <span className="italic mt-2" style={{ color: "#C8B89A" }}>Now try explaining it.</span>
      </div>
    ),
    headline: "You know more than\nyou can explain.",
  },
  {
    callout: "HOW IT WORKS",
    visual: (
      <div className="flex flex-col gap-4 text-[13px]" style={{ color: "#F5F0E8" }}>
        <span>01 — Paste what you learned</span>
        <span>02 — Explain it back</span>
        <span>03 — Get a line you can use tomorrow</span>
      </div>
    ),
    headline: "Practice explaining\nwhat you know.",
  },
];

export default function Splash() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c < slides.length - 1 ? c + 1 : c));
  }, []);

  // Auto-advance every 4s
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-10 cursor-pointer select-none"
      style={{ background: "#1C1A17" }}
      onClick={next}
    >
      {/* Top: Logo */}
      <div className="text-center">
        <h1 className="font-serif text-lg text-white">Cognitive Drill</h1>
        <p
          className="mt-2 text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "#C8B89A" }}
        >
          {slide.callout}
        </p>
      </div>

      {/* Middle: Visual */}
      <div className="flex-1 flex items-center justify-center w-full max-w-[320px]">
        {slide.visual}
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-[6px] rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 6,
              background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Bottom: Headline + CTA */}
      <div className="text-center w-full max-w-[400px]">
        <h2 className="font-serif text-[2.6rem] leading-tight text-white mb-8 whitespace-pre-line">
          {slide.headline}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/signin");
          }}
          className="w-full rounded-full py-4 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "#fff", color: "#1C1A17" }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
