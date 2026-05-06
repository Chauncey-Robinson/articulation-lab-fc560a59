import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useTutor();
  const [step, setStep] = useState(0);

  const markOnboarded = async () => {
    try { await saveProfile({ onboarded: true } as any); } catch {}
  };

  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goUpload = async () => {
    await markOnboarded();
    navigate("/upload");
  };

  const goDashboard = async () => {
    await markOnboarded();
    navigate("/dashboard");
  };

  const skipLater = async () => {
    setStep(1);
  };

  const steps = [
    {
      heading: "Start with something you're learning.",
      body: "Upload a book, article, PDF or paste a link. The app turns it into a session.",
      action: { label: "Upload something", onClick: goUpload },
      skip: { label: "I'll do this later.", onClick: skipLater },
    },
    {
      heading: "Your session is built for you.",
      body: "You'll get a summary, then practice explaining it back. That's how it sticks.",
      action: null,
      skip: null,
    },
    {
      heading: "Your coach is always here.",
      body: "Tap the mic at any time to explain what you know. It listens and helps you go deeper.",
      action: { label: "Take me to my dashboard", onClick: goDashboard },
      skip: null,
    },
  ];

  const current = steps[step];

  const handleTap = () => {
    if (step === 1) setStep(2);
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 pt-10 pb-10"
      style={{ background: "#FDFCFB" }}
      onClick={handleTap}
    >
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-pill transition-all duration-[180ms]"
            style={{
              width: i === step ? 24 : 6,
              height: 6,
              background: i === step ? "hsl(var(--primary))" : "hsl(var(--surface-3))",
            }}
          />
        ))}
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col justify-center">
        <div key={step} className="animate-fade-up">
          <h1
            className="font-serif text-foreground mb-5"
            style={{ fontSize: "2.25rem", fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            {current.heading}
          </h1>
          <p className="font-sans text-ink-2" style={{ fontSize: 14, lineHeight: 1.6 }}>
            {current.body}
          </p>
        </div>
      </div>

      <div className="max-w-[460px] mx-auto w-full">
        {current.action && (
          <button
            onClick={(e) => { e.stopPropagation(); current.action!.onClick(); }}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] animate-fade-up stagger-2"
          >
            {current.action.label}
          </button>
        )}
        {current.skip && (
          <button
            onClick={(e) => { e.stopPropagation(); current.skip!.onClick(); }}
            className="w-full text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] mt-4 text-center animate-fade-up stagger-3"
          >
            {current.skip.label}
          </button>
        )}
      </div>
    </div>
  );
}
