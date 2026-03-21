import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";

const professions = ["Student", "Engineer", "Manager", "Designer", "Researcher", "Healthcare", "Finance", "Legal", "Teacher", "Other"];
const degrees = ["High School", "Bachelor's", "Master's", "PhD", "Self-taught", "Other"];
const interestOptions = ["Business", "Technology", "Science", "Health", "Finance", "Leadership", "Psychology", "Law", "Design", "Marketing"];
const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"];
const presentationOptions = [
  { key: "text", emoji: "📝", label: "Text summaries" },
  { key: "infographics", emoji: "📊", label: "Infographics" },
  { key: "podcast", emoji: "🎧", label: "Podcast style" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useTutor();
  const { user, signOut } = useAuth();

  const [profession, setProfession] = useState(profile?.profession || "");
  const [degree, setDegree] = useState(profile?.degree || "");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [ageRange, setAgeRange] = useState(profile?.age_range || "");
  const [presentations, setPresentations] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tutor_presentation_prefs") || '["text"]'); } catch { return ["text"]; }
  });
  const [muted, setMuted] = useState(() => localStorage.getItem("tutor_muted") === "true");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync profile changes
  useEffect(() => {
    if (profile) {
      setProfession(profile.profession || "");
      setDegree(profile.degree || "");
      setInterests(profile.interests || []);
      setAgeRange(profile.age_range || "");
    }
  }, [profile]);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const togglePresentation = (key: string) => {
    setPresentations(prev => {
      if (prev.includes(key) && prev.length === 1) return prev; // keep at least one
      return prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveProfile({ profession, degree, interests, age_range: ageRange });
    localStorage.setItem("tutor_presentation_prefs", JSON.stringify(presentations));
    localStorage.setItem("tutor_muted", String(muted));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-24">
      <div className="max-w-[460px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up stagger-1">
          <button onClick={() => navigate(-1)} className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">
            ← Back
          </button>
          <h1 className="font-serif text-[1.5rem] text-foreground">Settings</h1>
          <div className="w-10" />
        </div>

        {/* Profile Section */}
        <Section title="PROFILE" delay={1}>
          <p className="text-[12px] font-sans text-ink-3 mb-3">What do you do?</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {professions.map(p => (
              <Chip key={p} label={p} selected={profession === p} onClick={() => setProfession(p)} />
            ))}
          </div>

          <p className="text-[12px] font-sans text-ink-3 mb-3">Education level</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {degrees.map(d => (
              <Chip key={d} label={d} selected={degree === d} onClick={() => setDegree(d)} />
            ))}
          </div>

          <p className="text-[12px] font-sans text-ink-3 mb-3">Age range</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ageRanges.map(a => (
              <Chip key={a} label={a} selected={ageRange === a} onClick={() => setAgeRange(a)} />
            ))}
          </div>

          <p className="text-[12px] font-sans text-ink-3 mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(i => (
              <Chip key={i} label={i} selected={interests.includes(i)} onClick={() => toggleInterest(i)} />
            ))}
          </div>
        </Section>

        {/* Presentation Preferences */}
        <Section title="CONTENT FORMAT" delay={2}>
          <p className="text-[12px] font-sans text-ink-3 mb-3">How do you prefer to digest information?</p>
          <div className="flex flex-col gap-2">
            {presentationOptions.map(opt => (
              <button key={opt.key} onClick={() => togglePresentation(opt.key)}
                className={`flex items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-left transition-all duration-[180ms] ${
                  presentations.includes(opt.key) ? "border-accent bg-accent-pale/20 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"
                }`}>
                <span className="text-[18px]">{opt.emoji}</span>
                <span className="text-[13px] font-sans font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Learning Style */}
        <Section title="LEARNING STYLE" delay={3}>
          <div className="bg-card rounded-[14px] border-[1.5px] border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-sans font-medium text-foreground">
                  {profile?.learning_style ? `${profile.learning_style.charAt(0).toUpperCase()}${profile.learning_style.slice(1)} learner` : "Not assessed yet"}
                </p>
                <p className="text-[11px] font-sans text-ink-3">
                  {profile?.learning_style ? "Personalizes quizzes, content, and study recommendations" : "Complete onboarding to assess your style"}
                </p>
              </div>
              <span className="text-[20px]">
                {profile?.learning_style === "visual" ? "👁️" : profile?.learning_style === "auditory" ? "👂" : profile?.learning_style === "reading" ? "📚" : profile?.learning_style === "kinesthetic" ? "🤲" : "❓"}
              </span>
            </div>
          </div>
        </Section>

        {/* Voice & Sound */}
        <Section title="VOICE & SOUND" delay={3}>
          <div className="flex items-center justify-between bg-card rounded-[14px] border-[1.5px] border-border px-4 py-4">
            <div>
              <p className="text-[13px] font-sans font-medium text-foreground">Sound effects & voice</p>
              <p className="text-[11px] font-sans text-ink-3">AI voice reads lessons aloud</p>
            </div>
            <button onClick={() => setMuted(!muted)}
              className={`w-11 h-6 rounded-full transition-colors duration-[180ms] relative ${muted ? "bg-input" : "bg-accent"}`}>
              <span className={`block w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform duration-[180ms] ${muted ? "left-0.5" : "left-[22px]"}`} />
            </button>
          </div>
          <div className="bg-card rounded-[14px] border-[1.5px] border-border px-4 py-4 mt-2">
            <p className="text-[13px] font-sans font-medium text-foreground">Voice</p>
            <p className="text-[11px] font-sans text-ink-3">Lily · British English</p>
          </div>
        </Section>

        {/* Account */}
        <Section title="ACCOUNT" delay={4}>
          <div className="bg-card rounded-[14px] border-[1.5px] border-border px-4 py-4 mb-2">
            <p className="text-[13px] font-sans font-medium text-foreground">Email</p>
            <p className="text-[12px] font-sans text-ink-3">{user?.email || "—"}</p>
          </div>
          <button onClick={signOut}
            className="w-full text-left bg-card rounded-[14px] border-[1.5px] border-border px-4 py-4 text-[13px] font-sans text-destructive hover:border-destructive transition-colors duration-[180ms]">
            Sign out
          </button>
        </Section>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className={`w-full rounded-pill py-4 text-[13px] font-sans font-semibold transition-all duration-[180ms] mt-6 ${
            saved ? "bg-sage text-white" : "bg-primary text-primary-foreground hover:opacity-90"
          } disabled:opacity-40`}>
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <div className={`mb-6 animate-fade-up stagger-${delay + 1}`}>
      <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-pill border-[1.5px] px-3 py-2 text-[12px] font-sans text-center transition-all duration-[180ms] ${
        selected ? "border-accent bg-accent-pale/30 text-foreground" : "border-border bg-card text-ink-2 hover:border-accent"
      }`}>
      {label}
    </button>
  );
}
