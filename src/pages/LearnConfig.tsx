import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Module } from "@/lib/TutorContext";

const digestPeriods = [
  { key: "quick", label: "Quick dive", desc: "1-2 days", days: 2 },
  { key: "standard", label: "Standard", desc: "3-5 days", days: 5 },
  { key: "deep", label: "Deep study", desc: "1-2 weeks", days: 14 },
  { key: "extended", label: "Extended", desc: "1 month+", days: 30 },
];

export default function LearnConfig() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [digestPeriod, setDigestPeriod] = useState("standard");
  const [priorKnowledge, setPriorKnowledge] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    (async () => {
      const { data } = await supabase.from("modules").select("*").eq("id", moduleId).single();
      if (data) setModule(data as unknown as Module);
      setLoading(false);
    })();
  }, [moduleId]);

  const handleContinue = () => {
    // Save config to localStorage for this module
    const config = { digestPeriod, priorKnowledge };
    localStorage.setItem(`learn_config_${moduleId}`, JSON.stringify(config));
    navigate(`/module/${moduleId}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Learning configuration.</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">
          Set up how you'd like to digest "{module?.title}".
        </p>

        {/* Duration of digesting period */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-3">DIGESTING PERIOD</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {digestPeriods.map(p => (
            <button key={p.key} onClick={() => setDigestPeriod(p.key)}
              className={`rounded-[16px] border-[1.5px] p-4 text-left transition-all duration-[180ms] animate-fade-up stagger-3 ${
                digestPeriod === p.key ? "border-accent bg-accent-pale/20" : "border-border bg-card hover:border-accent"
              }`}>
              <p className="text-[13px] font-sans font-semibold text-foreground">{p.label}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-1">{p.desc}</p>
            </button>
          ))}
        </div>

        {/* Refer to previous knowledge */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-4">PRIOR KNOWLEDGE</p>
        <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 mb-6 animate-fade-up stagger-5">
          <label className="flex items-center gap-4 cursor-pointer">
            <div onClick={() => setPriorKnowledge(!priorKnowledge)}
              className={`w-12 h-7 rounded-pill relative transition-colors duration-[180ms] ${
                priorKnowledge ? "bg-accent" : "bg-border"
              }`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all duration-[180ms] ${
                priorKnowledge ? "left-[22px]" : "left-0.5"
              }`} />
            </div>
            <div>
              <p className="text-[14px] font-sans font-medium text-foreground">Refer to previous knowledge</p>
              <p className="text-[12px] font-sans text-ink-3 mt-0.5">Connect to concepts from your other modules</p>
            </div>
          </label>
        </div>

        {/* Module info */}
        {module && (
          <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 mb-6 animate-fade-up stagger-6">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">MODULE READY</p>
            <h3 className="font-serif text-[18px] text-foreground mb-1">{module.title}</h3>
            <p className="text-[12px] font-sans text-ink-3">{module.lesson_count} lessons generated</p>
          </div>
        )}

        <button onClick={handleContinue}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] mt-auto animate-fade-up stagger-7">
          Start learning
        </button>
      </div>
    </div>
  );
}
