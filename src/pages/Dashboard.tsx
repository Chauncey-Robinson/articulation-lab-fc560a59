import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function getStatusColor(status: string) {
  switch (status) {
    case "completed": return "bg-sage text-white";
    case "testing": return "bg-accent-pale text-accent";
    case "learning": return "bg-accent-bright/20 text-accent-bright";
    default: return "bg-surface-2 text-ink-3";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed": return "Done";
    case "testing": return "Testing";
    case "learning": return "Learning";
    default: return "New";
  }
}

export default function Dashboard() {
  const { modules, loading, progress, profile } = useTutor();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch quiz accuracy for "progress" stat
  const [quizAccuracy, setQuizAccuracy] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("is_correct")
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        const correct = data.filter((a: any) => a.is_correct).length;
        setQuizAccuracy(Math.round((correct / data.length) * 100));
      }
    })();
  }, [user]);

  // Get display name from profile, OAuth metadata, or email
  const displayName = profile?.display_name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "";
  const firstName = displayName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? `Good morning, ${firstName}.` : hour < 17 ? `Good afternoon, ${firstName}.` : `Good evening, ${firstName}.`;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const activeModules = modules.filter(m => m.status !== "completed");
  const completedModules = modules.filter(m => m.status === "completed");

  // Check deadlines from localStorage
  const deadlines = JSON.parse(localStorage.getItem("tutor_deadlines") || "[]");
  const upcomingDeadlines = deadlines.filter((d: any) => {
    const diff = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  // Compute overall completion %
  const totalLessons = modules.reduce((a, m) => a + m.lesson_count, 0);
  const doneLessons = modules.reduce((a, m) => a + m.completed_lessons, 0);
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-24">
      <div className="max-w-[460px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {progress.current_streak > 0 && (
              <span className="text-[13px] font-sans font-medium text-foreground">🔥 {progress.current_streak}</span>
            )}
          </div>
          <button onClick={signOut} className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors">Sign out</button>
        </div>

        {/* Greeting */}
        <div className="mb-6 animate-fade-up stagger-1">
          <h1 className="font-serif text-[2rem] text-foreground mb-1">{greeting}</h1>
          {modules.length === 0 ? (
            <p className="text-[14px] font-sans text-ink-3">Upload something to start learning.</p>
          ) : (
            <p className="text-[14px] font-sans text-ink-3">{activeModules.length} active module{activeModules.length !== 1 ? "s" : ""} · {overallPct}% complete</p>
          )}
        </div>

        {/* Deadline alerts */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-4 animate-fade-up stagger-2">
            {upcomingDeadlines.map((d: any) => {
              const diff = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={d.moduleId} className="bg-accent-bright/10 border-[1.5px] border-accent-bright/30 rounded-[14px] px-4 py-3 mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-sans font-medium text-foreground">{d.moduleTitle}</p>
                    <p className="text-[11px] font-sans text-accent-bright">{diff === 0 ? "Due today!" : diff === 1 ? "Due tomorrow" : `${diff} days left`}</p>
                  </div>
                  <button onClick={() => navigate(`/module/${d.moduleId}`)} className="text-[11px] font-sans font-medium text-accent hover:text-foreground transition-colors">
                    Go →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats row */}
        {(progress.total_sessions > 0 || modules.length > 0) && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up stagger-2">
            <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center">
              <p className="font-serif text-[2rem] leading-none text-foreground">{modules.length}</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1">modules</p>
            </div>
            <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center">
              <p className="font-serif text-[2rem] leading-none text-foreground">{progress.current_streak}</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1">streak</p>
            </div>
            <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 text-center">
              <p className="font-serif text-[2rem] leading-none text-foreground">{overallPct}%</p>
              <p className="text-[11px] font-sans text-ink-3 mt-1">progress</p>
            </div>
          </div>
        )}

        {/* Active modules */}
        {activeModules.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-3">CONTINUE</p>
            {activeModules.map((mod, idx) => (
              <button key={mod.id}
                onClick={() => navigate(`/module/${mod.id}`)}
                className={`w-full text-left bg-card rounded-[18px] border-[1.5px] border-border p-5 mb-3 hover:border-accent hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-[180ms] animate-fade-up`}
                style={{ animationDelay: `${(idx + 3) * 65}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-pill ${getStatusColor(mod.status)}`}>
                    {getStatusLabel(mod.status)}
                  </span>
                  {mod.lesson_count > 0 && (
                    <span className="text-[11px] font-sans text-ink-3">{mod.completed_lessons}/{mod.lesson_count} lessons</span>
                  )}
                </div>
                <h3 className="font-serif text-[18px] text-foreground leading-tight mb-1">{mod.title}</h3>
                {mod.lesson_count > 0 && (
                  <div className="w-full h-1 bg-border rounded-pill mt-3">
                    <div className="h-full bg-accent rounded-pill transition-all duration-300" style={{ width: `${(mod.completed_lessons / mod.lesson_count) * 100}%` }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Completed modules */}
        {completedModules.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">COMPLETED</p>
            {completedModules.map(mod => (
              <button key={mod.id} onClick={() => navigate(`/module/${mod.id}`)}
                className="w-full text-left bg-card rounded-[18px] border-[1.5px] border-border p-5 mb-3 hover:border-accent transition-all duration-[180ms] opacity-70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sage text-[14px]">✓</span>
                  <h3 className="font-serif text-[16px] text-foreground">{mod.title}</h3>
                </div>
                <p className="text-[12px] font-sans text-ink-3">{mod.lesson_count} lessons completed</p>
              </button>
            ))}
          </div>
        )}

        {/* Upload CTA */}
        <Link to="/upload"
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] text-center block animate-fade-up stagger-6">
          Upload new material
        </Link>

        {/* Bottom nav */}
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/analytics" className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">Progress</Link>
          <Link to="/deadlines" className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">Deadlines</Link>
          <Link to="/settings" className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">Settings</Link>
        </div>
      </div>
    </div>
  );
}
