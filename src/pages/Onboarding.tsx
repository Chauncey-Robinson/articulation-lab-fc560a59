import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";

const professions = ["Student", "Engineer", "Manager", "Designer", "Researcher", "Healthcare", "Finance", "Legal", "Teacher", "Other"];
const degrees = ["High School", "Bachelor's", "Master's", "PhD", "Self-taught", "Other"];
const interestOptions = ["Business", "Technology", "Science", "Health", "Finance", "Leadership", "Psychology", "Law", "Design", "Marketing"];
const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"];
const presentationOptions = [
  { key: "text", emoji: "📝", label: "Text summaries", desc: "Clear, concise written explanations" },
  { key: "infographics", emoji: "📊", label: "Infographics", desc: "Visual breakdowns of key ideas" },
  { key: "podcast", emoji: "🎧", label: "Podcast style", desc: "Conversational audio explanations" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useTutor();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(() => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  });
  const [profession, setProfession] = useState("");
  const [degree, setDegree] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState("");
  const [presentations, setPresentations] = useState<string[]>(["text"]);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const togglePresentation = (key: string) => {
    setPresentations(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveProfile({ profession, degree, interests, age_range: ageRange, onboarded: true });
    localStorage.setItem("tutor_presentation_prefs", JSON.stringify(presentations));
    setSaving(false);
    navigate("/dashboard");
  };

  const handleSkip = async () => {
    setSaving(true);
    await saveProfile({ onboarded: true });
    setSaving(false);
    navigate("/dashboard");
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-8 pb-10">
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-pill transition-colors duration-300" style={{ background: i <= step ? "hsl(var(--accent))" : "hsl(var(--border))" }} />
          ))}
        </div>

        {step === 0 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What do you do?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">This helps us tailor scenarios to your world.</p>
            <div className="grid grid-cols-2 gap-3">
              {professions.map(p => (
                <button key={p} onClick={() => { setProfession(p); setStep(1); }}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${profession === p ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">Your education?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">So we pitch things at the right level.</p>
            <div className="grid grid-cols-2 gap-3">
              {degrees.map(d => (
                <button key={d} onClick={() => { setDegree(d); setStep(2); }}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${degree === d ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What interests you?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">Pick as many as you like.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {interestOptions.map(i => (
                <button key={i} onClick={() => toggleInterest(i)}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${interests.includes(i) ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {i}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(3)} disabled={interests.length === 0}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">How do you learn best?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">Pick your preferred format for digesting info.</p>
            <div className="flex flex-col gap-3 mb-6">
              {presentationOptions.map(opt => (
                <button key={opt.key} onClick={() => togglePresentation(opt.key)}
                  className={`rounded-[16px] border-[1.5px] px-5 py-4 text-left transition-all duration-[180ms] ${
                    presentations.includes(opt.key) ? "border-accent bg-accent-pale/20" : "border-border bg-card hover:border-accent"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{opt.emoji}</span>
                    <div>
                      <p className="text-[14px] font-sans font-medium text-foreground">{opt.label}</p>
                      <p className="text-[12px] font-sans text-ink-3">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(4)} disabled={presentations.length === 0}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">How old are you?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">Last one. Promise.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ageRanges.map(a => (
                <button key={a} onClick={() => setAgeRange(a)}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${ageRange === a ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {a}
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={saving || !ageRange}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              {saving ? "Saving..." : "Let's go"}
            </button>
          </div>
        )}

        <button onClick={handleSkip} className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] mt-4 text-center">
          Skip for now
        </button>
      </div>
    </div>
  );
}
