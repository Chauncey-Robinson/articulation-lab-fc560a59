import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const CASCADE_ROWS = [
  "F",
  "l u",
  "e n c",
  "y F l u",
  "e n c y F",
  "l u e n c y",
  "F l u e n c y",
  "F l u e n c y F",
  "l u e n c y F l u",
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);

  const handleStart = () => {
    navigate(user ? "/dashboard" : "/signin");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-10">
      <div className="flex-1 flex flex-col items-center w-full max-w-[460px] mx-auto">
        {/* Cascading typographic mark */}
        <div
          className="flex flex-col items-center gap-1.5 mb-12 animate-fade-up stagger-1 select-none"
          aria-hidden="true"
        >
          {CASCADE_ROWS.map((row, i) => {
            const opacity = 0.25 + (i / (CASCADE_ROWS.length - 1)) * 0.55;
            return (
              <div
                key={i}
                className="flex justify-center gap-3 font-serif text-[15px] tracking-[0.05em]"
                style={{ color: `hsl(var(--foreground) / ${opacity})` }}
              >
                {row.split(" ").map((ch, j) => (
                  <span key={j}>{ch}</span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Wordmark */}
        <h1 className="font-serif text-[3.4rem] leading-[1] tracking-[-2px] text-foreground mb-4 animate-fade-up stagger-2">
          Fluency.
        </h1>
        <p className="font-sans text-[15px] text-ink-3 mb-12 animate-fade-up stagger-3">
          Turn knowledge into action.
        </p>

        <div className="flex-1" />

        {/* CTA */}
        <div className="w-full max-w-[340px] flex flex-col gap-3 animate-fade-up stagger-4">
          <button
            onClick={handleStart}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms]"
          >
            Get started
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex gap-2 mt-8 animate-fade-up stagger-5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-[180ms] ${
                slide === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
