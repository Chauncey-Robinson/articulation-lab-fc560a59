import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";

const professions = ["Student", "Engineer", "Manager", "Designer", "Researcher", "Healthcare", "Finance", "Legal", "Teacher", "Other"];
const interestOptions = ["Business", "Technology", "Science", "Health", "Finance", "Leadership", "Psychology", "Law", "Design", "Marketing"];
const presentationOptions = [
  { key: "text", emoji: "📝", label: "Written" },
  { key: "infographics", emoji: "📊", label: "Visual" },
  { key: "podcast", emoji: "🎧", label: "Audio" },
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
  const [interests, setInterests] = useState<string[]>([]);
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
    await saveProfile({
      profession, interests,
      onboarded: true,
      display_name: displayName.trim() || null,
    } as any);
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

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-8 pb-10">
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Step counter */}
        <p className="text-[13px] font-sans text-ink-3 mb-8">Step {step + 1} of {totalSteps}</p>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What's your name?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">We'll use this to personalise your experience.</p>
            <input
              type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-3 text-[15px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none focus:border-accent-bright transition-colors mb-6"
              autoFocus
            />
            <button onClick={() => setStep(1)} disabled={!displayName.trim()}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {/* Step 1: Profession */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What do you do?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">Pick the one that fits best.</p>
            <div className="grid grid-cols-2 gap-3">
              {professions.map(p => (
                <button key={p} onClick={() => { setProfession(p); setStep(2); }}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${profession === p ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What interests you?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">What do you study or work on?</p>
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

        {/* Step 3: Content format */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">How do you want things explained?</h1>
            <div className="flex flex-col gap-3 mb-6">
              {presentationOptions.map(opt => (
                <button key={opt.key} onClick={() => togglePresentation(opt.key)}
                  className={`rounded-[16px] border-[1.5px] px-5 py-4 text-left transition-all duration-[180ms] ${
                    presentations.includes(opt.key) ? "border-accent bg-accent-pale/20" : "border-border bg-card hover:border-accent"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{opt.emoji}</span>
                    <p className="text-[14px] font-sans font-medium text-foreground">{opt.label}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={saving || presentations.length === 0}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              {saving ? "Setting things up..." : "Let's go"}
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
