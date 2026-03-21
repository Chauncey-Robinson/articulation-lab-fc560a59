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

interface LearningScenario {
  question: string;
  options: { label: string; emoji: string; style: string }[];
}

const learningScenarios: LearningScenario[] = [
  {
    question: "You need to learn a new software tool. What do you do first?",
    options: [
      { label: "Watch a tutorial video", emoji: "🎬", style: "visual" },
      { label: "Listen to someone explain it", emoji: "🎧", style: "auditory" },
      { label: "Read the documentation", emoji: "📖", style: "reading" },
      { label: "Open it and start clicking around", emoji: "🖱️", style: "kinesthetic" },
    ],
  },
  {
    question: "You're preparing for a big presentation. How do you memorize your points?",
    options: [
      { label: "Create visual slides or mind maps", emoji: "🗺️", style: "visual" },
      { label: "Record yourself and listen back", emoji: "🎙️", style: "auditory" },
      { label: "Write detailed notes and re-read them", emoji: "✍️", style: "reading" },
      { label: "Practice presenting it out loud, pacing around", emoji: "🚶", style: "kinesthetic" },
    ],
  },
  {
    question: "A friend explains a complex idea. How do you make sense of it?",
    options: [
      { label: "Draw a diagram or picture in my head", emoji: "🧠", style: "visual" },
      { label: "Ask them to talk me through it again", emoji: "💬", style: "auditory" },
      { label: "Look it up and read about it myself", emoji: "🔍", style: "reading" },
      { label: "Find a way to try it or build it myself", emoji: "🔧", style: "kinesthetic" },
    ],
  },
];

const learningStyleCards = [
  { key: "visual", emoji: "👁️", label: "Visual", desc: "Diagrams, charts, and imagery help me learn" },
  { key: "auditory", emoji: "👂", label: "Auditory", desc: "I learn best by listening and discussing" },
  { key: "reading", emoji: "📚", label: "Reading/Writing", desc: "I prefer detailed text and note-taking" },
  { key: "kinesthetic", emoji: "🤲", label: "Hands-on", desc: "I learn by doing and experimenting" },
];

function determineLearningStyle(scenarioAnswers: string[], selfSelected: string | null): string {
  const counts: Record<string, number> = { visual: 0, auditory: 0, reading: 0, kinesthetic: 0 };
  scenarioAnswers.forEach(s => { if (counts[s] !== undefined) counts[s]++; });
  if (selfSelected) counts[selfSelected] = (counts[selfSelected] || 0) + 2; // self-selection weighted more

  let best = "visual";
  let max = 0;
  for (const [style, count] of Object.entries(counts)) {
    if (count > max) { max = count; best = style; }
  }
  return best;
}

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

  // Learning style assessment
  const [selfSelectedStyle, setSelfSelectedStyle] = useState<string | null>(null);
  const [scenarioAnswers, setScenarioAnswers] = useState<string[]>([]);
  const [currentScenario, setCurrentScenario] = useState(0);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const togglePresentation = (key: string) => {
    setPresentations(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const handleScenarioAnswer = (style: string) => {
    const updated = [...scenarioAnswers, style];
    setScenarioAnswers(updated);
    if (currentScenario < learningScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      // All scenarios done, move to next step
      setStep(7);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const learningStyle = determineLearningStyle(scenarioAnswers, selfSelectedStyle);
    await saveProfile({
      profession, degree, interests, age_range: ageRange,
      onboarded: true,
      display_name: displayName.trim() || null,
      learning_style: learningStyle,
    } as any);
    localStorage.setItem("tutor_presentation_prefs", JSON.stringify(presentations));
    localStorage.setItem("tutor_learning_style", learningStyle);
    setSaving(false);
    navigate("/dashboard");
  };

  const handleSkip = async () => {
    setSaving(true);
    await saveProfile({ onboarded: true });
    setSaving(false);
    navigate("/dashboard");
  };

  const totalSteps = 8;

  const styleResult = determineLearningStyle(scenarioAnswers, selfSelectedStyle);
  const styleLabels: Record<string, { emoji: string; title: string; desc: string }> = {
    visual: { emoji: "👁️", title: "Visual Learner", desc: "You learn best through images, diagrams, and spatial understanding. We'll prioritize visual content and infographics for you." },
    auditory: { emoji: "👂", title: "Auditory Learner", desc: "You absorb information best by listening and discussing. We'll keep voice-first explanations and dialogue mode front and center." },
    reading: { emoji: "📚", title: "Reading/Writing Learner", desc: "You thrive with detailed text and note-taking. We'll give you rich written content and structured summaries." },
    kinesthetic: { emoji: "🤲", title: "Hands-on Learner", desc: "You learn by doing and applying. We'll emphasize real-world scenarios and teach-back exercises." },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-8 pb-10">
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-pill transition-colors duration-300" style={{ background: i <= step ? "hsl(var(--accent))" : "hsl(var(--border))" }} />
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">What's your name?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">So we know what to call you.</p>
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
            <p className="text-[14px] font-sans text-ink-3 mb-6">This helps us tailor scenarios to your world.</p>
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

        {/* Step 2: Education */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">Your education?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">So we pitch things at the right level.</p>
            <div className="grid grid-cols-2 gap-3">
              {degrees.map(d => (
                <button key={d} onClick={() => { setDegree(d); setStep(3); }}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-left transition-all duration-[180ms] ${degree === d ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
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
            <button onClick={() => setStep(4)} disabled={interests.length === 0}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Content format */}
        {step === 4 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">How do you like info served?</h1>
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
            <button onClick={() => setStep(5)} disabled={presentations.length === 0}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {/* Step 5: Self-select learning style */}
        {step === 5 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <h1 className="font-serif text-[2rem] text-foreground mb-2">How do you learn best?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-6">Pick what resonates most with you.</p>
            <div className="flex flex-col gap-3 mb-6">
              {learningStyleCards.map(card => (
                <button key={card.key} onClick={() => setSelfSelectedStyle(card.key)}
                  className={`rounded-[16px] border-[1.5px] px-5 py-4 text-left transition-all duration-[180ms] ${
                    selfSelectedStyle === card.key ? "border-accent bg-accent-pale/20" : "border-border bg-card hover:border-accent"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[24px]">{card.emoji}</span>
                    <div>
                      <p className="text-[14px] font-sans font-medium text-foreground">{card.label}</p>
                      <p className="text-[12px] font-sans text-ink-3">{card.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setStep(6); setCurrentScenario(0); setScenarioAnswers([]); }} disabled={!selfSelectedStyle}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 mt-auto">
              Continue
            </button>
          </div>
        )}

        {/* Step 6: Scenario questions */}
        {step === 6 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent">
                SCENARIO {currentScenario + 1} OF {learningScenarios.length}
              </p>
            </div>
            <h1 className="font-serif text-[1.6rem] text-foreground mb-6 leading-[1.3]">
              {learningScenarios[currentScenario].question}
            </h1>
            <div className="flex flex-col gap-3">
              {learningScenarios[currentScenario].options.map((opt, i) => (
                <button key={i} onClick={() => handleScenarioAnswer(opt.style)}
                  className="rounded-[16px] border-[1.5px] border-border bg-card px-5 py-4 text-left hover:border-accent hover:translate-y-[-1px] transition-all duration-[180ms]">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{opt.emoji}</span>
                    <p className="text-[14px] font-sans text-foreground">{opt.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Results + age + finish */}
        {step === 7 && (
          <div className="flex-1 flex flex-col animate-fade-up stagger-1">
            {/* Learning style result */}
            <div className="bg-accent-pale/15 rounded-[18px] border-[1.5px] border-accent/30 p-6 mb-6 text-center">
              <span className="text-[40px] block mb-3">{styleLabels[styleResult]?.emoji}</span>
              <h2 className="font-serif text-[1.5rem] text-foreground mb-2">{styleLabels[styleResult]?.title}</h2>
              <p className="text-[13px] font-sans text-ink-2 leading-[1.6]">{styleLabels[styleResult]?.desc}</p>
            </div>

            <h1 className="font-serif text-[1.5rem] text-foreground mb-2">One last thing — your age?</h1>
            <p className="text-[14px] font-sans text-ink-3 mb-4">Last one. Promise.</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ageRanges.map(a => (
                <button key={a} onClick={() => setAgeRange(a)}
                  className={`rounded-[14px] border-[1.5px] px-4 py-3 text-[14px] font-sans text-center transition-all duration-[180ms] ${ageRange === a ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"}`}>
                  {a}
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={saving || !ageRange}
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
