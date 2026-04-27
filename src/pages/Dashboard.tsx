import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Flame, CheckCircle, Mic, GraduationCap, Briefcase, Zap, Brain, RotateCcw, Plus, Target } from "lucide-react";
import BottomNav from "@/components/BottomNav";

function getStatusColor(status: string) {
  switch (status) {
    case "completed": return "bg-sage/15 text-sage";
    case "testing": return "bg-surface-2 text-foreground";
    case "learning": return "bg-surface-2 text-foreground";
    default: return "bg-surface-2 text-ink-3";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed": return "Done";
    case "testing": return "Coaching";
    case "learning": return "In Progress";
    default: return "New";
  }
}

export default function Dashboard() {
  const { modules, loading, progress, profile } = useTutor();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!profile || !profile.onboarded) {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [loading, profile, user, navigate]);

  const [meetings, setMeetings] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const meetingsRes = await supabase.from("meetings").select("id, title, meeting_type, status, created_at, duration_seconds").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      if (meetingsRes.data) setMeetings(meetingsRes.data);
    })();
  }, [user]);

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

  const deadlines = JSON.parse(localStorage.getItem("tutor_deadlines") || "[]");
  const upcomingDeadlines = deadlines.filter((d: any) => {
    const diff = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  const totalLessons = modules.reduce((a, m) => a + m.lesson_count, 0);
  const doneLessons = modules.reduce((a, m) => a + Math.min(m.completed_lessons, m.lesson_count), 0);
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  // Daily learning goal — persisted locally
  const today = new Date().toISOString().split("T")[0];
  const [dailyGoalOn, setDailyGoalOn] = useState<boolean>(() => localStorage.getItem("daily_goal_on") !== "false");
  useEffect(() => { localStorage.setItem("daily_goal_on", String(dailyGoalOn)); }, [dailyGoalOn]);
  const practisedToday = progress.last_practice_date === today;
  // Subtle background tint when goal is on and not yet met
  const headerTintClass = dailyGoalOn
    ? practisedToday
      ? "bg-[hsl(150,18%,94%)]" // soft sage wash when goal hit
      : "bg-[hsl(33,22%,96%)]" // gentle paper warmth when pending
    : "";

  // Growth Score (mirrors /growth)
  const totalLessonsAll = modules.reduce((a, m) => a + m.lesson_count, 0);
  const doneLessonsAll = modules.reduce((a, m) => a + Math.min(m.completed_lessons, m.lesson_count), 0);
  const growthScore = doneLessonsAll * 8 + progress.total_sessions * 4 + progress.current_streak * 6;
  const ringR = 30;
  const ringC = 2 * Math.PI * ringR;
  const ringPct = Math.min(growthScore / 500, 1);
  const ringOffset = ringC * (1 - ringPct);

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-10 pb-40">
      <div className="max-w-[520px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            {progress.current_streak > 0 && (
              <span className="text-[13px] font-sans font-medium text-foreground flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-foreground" /> {progress.current_streak}
              </span>
            )}
          </div>
          <button onClick={signOut} className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors">Sign out</button>
        </div>

        {/* Greeting + contextual nudge — header tints subtly based on daily goal */}
        <div className={`mb-10 -mx-4 px-4 py-6 rounded-[28px] transition-colors duration-500 animate-fade-up stagger-1 ${headerTintClass}`}>
          <h1 className="font-serif text-[2.75rem] leading-[1.1] text-foreground mb-3 tracking-tight">{greeting}</h1>
          {modules.length === 0 ? (
            <p className="text-[15px] font-sans text-ink-3 leading-[1.6]">Upload something to start.</p>
          ) : activeModules.length > 0 ? (
            <p className="text-[15px] font-sans text-ink-3 leading-[1.6]">
              You were working on <span className="text-foreground font-medium">{activeModules[0].title}</span>. Pick up where you left off?
            </p>
          ) : (
            <p className="text-[15px] font-sans text-ink-3 leading-[1.6]">All topics complete. Add something new or review what you know.</p>
          )}

          {/* Daily goal toggle */}
          <button
            onClick={() => setDailyGoalOn((v) => !v)}
            className="mt-5 inline-flex items-center gap-2.5 text-[11px] font-sans text-ink-3 hover:text-foreground transition-colors"
          >
            <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Daily goal {dailyGoalOn ? "on" : "off"}{dailyGoalOn && practisedToday ? " · met today" : ""}</span>
            <span className={`relative inline-block w-8 h-[18px] rounded-pill transition-colors ${dailyGoalOn ? "bg-foreground" : "bg-surface-3"}`}>
              <span className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-background transition-all ${dailyGoalOn ? "left-[16px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        {/* Smart suggestion chips */}
        {modules.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 mb-10 animate-fade-up stagger-2 scrollbar-hide -mx-2 px-2">
            {activeModules.length > 0 && (
              <button
                onClick={() => navigate(`/module/${activeModules[0].id}`)}
                className="flex-shrink-0 flex items-center gap-2 rounded-pill bg-surface-2 px-5 py-3 hover:bg-surface-3 transition-all duration-[180ms]"
              >
                <Zap className="w-3.5 h-3.5 text-foreground" />
                <span className="text-[12px] font-sans font-medium text-foreground whitespace-nowrap">Continue {activeModules[0].title.length > 20 ? activeModules[0].title.slice(0, 20) + "..." : activeModules[0].title}</span>
              </button>
            )}
            {completedModules.length > 0 && (
              <button
                onClick={() => navigate(`/module/${completedModules[0].id}`)}
                className="flex-shrink-0 flex items-center gap-2 rounded-pill bg-surface-2 px-5 py-3 hover:bg-surface-3 transition-all duration-[180ms]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-3" />
                <span className="text-[12px] font-sans font-medium text-foreground whitespace-nowrap">Review a past topic</span>
              </button>
            )}
            {activeModules.some(m => m.completed_lessons > 0) && (
              <button
                onClick={() => {
                  const mod = activeModules.find(m => m.completed_lessons > 0);
                  if (mod) navigate(`/test-config/${mod.id}`);
                }}
                className="flex-shrink-0 flex items-center gap-2 rounded-pill bg-surface-2 px-5 py-3 hover:bg-surface-3 transition-all duration-[180ms]"
              >
                <Brain className="w-3.5 h-3.5 text-foreground" />
                <span className="text-[12px] font-sans font-medium text-foreground whitespace-nowrap">Coach me on my weakest area</span>
              </button>
            )}
            <button
              onClick={() => navigate("/upload")}
              className="flex-shrink-0 flex items-center gap-2 rounded-pill bg-surface-2 px-5 py-3 hover:bg-surface-3 transition-all duration-[180ms]"
            >
              <Plus className="w-3.5 h-3.5 text-ink-3" />
              <span className="text-[12px] font-sans font-medium text-foreground whitespace-nowrap">Add new material</span>
            </button>
          </div>
        )}

        {/* Deadline alerts — borderless tinted tile */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-8 animate-fade-up stagger-2 space-y-3">
            {upcomingDeadlines.map((d: any) => {
              const diff = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={d.moduleId} className="bg-surface-2 rounded-[28px] px-7 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-sans font-medium text-foreground">{d.moduleTitle}</p>
                    <p className="text-[12px] font-sans text-ink-3 mt-1">{diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `${diff} days left`}</p>
                  </div>
                  <button onClick={() => navigate(`/module/${d.moduleId}`)} className="text-[12px] font-sans font-medium text-foreground hover:opacity-70 transition-opacity">
                    Go →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats — Topics tile + Growth Score ring tile (sophisticated, not arcade) */}
        {(progress.total_sessions > 0 || modules.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-up stagger-2">
            <div className="bg-surface-1 rounded-[28px] px-7 py-8">
              <p className="font-serif text-[2.75rem] leading-none text-foreground tracking-tight">{modules.length}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-3 tracking-wide">Topics</p>
            </div>
            <button
              onClick={() => navigate("/growth")}
              className="bg-surface-1 rounded-[28px] px-6 py-6 flex items-center gap-4 text-left hover:bg-surface-2 transition-colors"
            >
              <div className="relative w-[68px] h-[68px] shrink-0">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle cx="36" cy="36" r={ringR} fill="none" stroke="hsl(var(--surface-3))" strokeWidth="2.5" />
                  <circle
                    cx="36" cy="36" r={ringR} fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={ringC} strokeDashoffset={ringOffset}
                    style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-[15px] text-foreground tabular-nums">{growthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-sans text-ink-3 tracking-wide">Growth Score</p>
                <p className="text-[11px] font-sans text-ink-3 mt-0.5">{progress.current_streak}-day streak</p>
              </div>
            </button>
          </div>
        )}

        {/* Active topics — borderless tiles with fill-effect progress */}
        {activeModules.length > 0 && (
          <div className="mb-12">
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-5 animate-fade-up stagger-3">Continue</p>
            <div className="space-y-4">
              {activeModules.map((mod, idx) => {
                const pct = mod.lesson_count > 0 ? Math.min((mod.completed_lessons / mod.lesson_count) * 100, 100) : 0;
                return (
                  <button key={mod.id}
                    onClick={() => navigate(`/module/${mod.id}`)}
                    className="relative w-full text-left rounded-[28px] p-7 hover:-translate-y-0.5 hover:shadow-tile-hover transition-all duration-[220ms] animate-fade-up overflow-hidden bg-surface-1"
                    style={{ animationDelay: `${(idx + 3) * 80}ms` }}>
                    {/* Fill-effect progress: surface-2 wash that fills as user completes */}
                    <div
                      className="absolute inset-0 bg-surface-2 transition-all duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-sans font-medium uppercase tracking-[0.16em] px-3 py-1 rounded-pill ${getStatusColor(mod.status)}`}>
                          {getStatusLabel(mod.status)}
                        </span>
                        {mod.lesson_count > 0 && (
                          <span className="text-[11px] font-sans text-ink-3">{Math.min(mod.completed_lessons, mod.lesson_count)} / {mod.lesson_count}</span>
                        )}
                      </div>
                      <h3 className="font-serif text-[22px] leading-[1.2] text-foreground tracking-tight">{mod.title}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed topics */}
        {completedModules.length > 0 && (
          <div className="mb-12">
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-5">Completed</p>
            <div className="space-y-3">
              {completedModules.map(mod => (
                <button key={mod.id} onClick={() => navigate(`/module/${mod.id}`)}
                  className="w-full text-left rounded-[28px] p-6 bg-surface-1 hover:bg-surface-2 transition-all duration-[180ms] opacity-75 hover:opacity-100">
                  <div className="flex items-center gap-2.5 mb-1">
                    <CheckCircle className="w-4 h-4 text-sage" />
                    <h3 className="font-serif text-[18px] text-foreground tracking-tight">{mod.title}</h3>
                  </div>
                  <p className="text-[12px] font-sans text-ink-3 ml-6">{mod.lesson_count} sessions completed</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent meetings */}
        {meetings.length > 0 && (
          <div className="mb-12">
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-5">Meetings</p>
            <div className="space-y-3">
              {meetings.map(m => {
                const formatDuration = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m` : `${s}s`;
                return (
                  <button key={m.id} onClick={() => navigate(`/meeting/${m.id}`)}
                    className="w-full text-left rounded-[28px] p-5 bg-surface-1 hover:bg-surface-2 transition-all duration-[180ms]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {m.meeting_type === "conference" ? <Mic className="w-4 h-4 text-ink-3" /> : m.meeting_type === "lecture" ? <GraduationCap className="w-4 h-4 text-ink-3" /> : <Briefcase className="w-4 h-4 text-ink-3" />}
                        <div>
                          <h3 className="text-[14px] font-sans font-medium text-foreground">{m.title}</h3>
                          <p className="text-[11px] font-sans text-ink-3 mt-0.5">{new Date(m.created_at).toLocaleDateString()} · {m.duration_seconds ? formatDuration(m.duration_seconds) : ""}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2.5 py-1 rounded-pill ${m.status === "completed" ? "bg-sage/15 text-sage" : "bg-surface-2 text-foreground"}`}>
                        {m.status === "completed" ? "Done" : m.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Oversized pill CTA */}
        <div className="animate-fade-up stagger-6">
          <Link to="/upload"
            className="w-full rounded-pill bg-primary py-6 text-[15px] font-sans font-semibold text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all duration-[200ms] text-center block tracking-wide">
            Start a session
          </Link>
        </div>

        {/* Secondary text links — primary nav lives in BottomNav */}
        <div className="flex justify-center gap-8 mt-10">
          <Link to="/deadlines" className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors">Deadlines</Link>
          <Link to="/settings" className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors">Settings</Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
