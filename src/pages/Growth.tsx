// no hooks needed beyond render
import { useTutor } from "@/lib/TutorContext";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";

// Quiet cohort — placeholder, no rankings
const COHORT = [
  { initials: "EM", name: "Eleanor M.", score: 412, topic: "Behavioural economics" },
  { initials: "JR", name: "Jamie R.", score: 388, topic: "Systems thinking" },
  { initials: "AS", name: "Aaron S.", score: 354, topic: "Negotiation tactics" },
  { initials: "PV", name: "Priya V.", score: 327, topic: "Revenue recognition" },
  { initials: "TO", name: "Tomás O.", score: 309, topic: "Strategic planning" },
];

export default function Growth() {
  const { modules, progress, profile } = useTutor();
  const { user } = useAuth();

  const totalLessons = modules.reduce((a, m) => a + m.lesson_count, 0);
  const doneLessons = modules.reduce((a, m) => a + Math.min(m.completed_lessons, m.lesson_count), 0);
  const completionPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  // Growth Score = lessons + sessions + streak weighted
  const growthScore = doneLessons * 8 + progress.total_sessions * 4 + progress.current_streak * 6;

  // Ring math
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const ringPct = Math.min(growthScore / 500, 1);
  const dashOffset = circumference * (1 - ringPct);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "You";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Quiet cohort presentation — no rankings, no sorting
  const cohort = COHORT;

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-12 pb-40">
      <div className="max-w-[560px] mx-auto w-full">
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4 animate-fade-up stagger-1">
          Growth
        </p>
        <h1 className="font-serif text-[2.75rem] leading-[1.05] text-foreground mb-3 tracking-tight animate-fade-up stagger-1">
          Quiet, steady progress.
        </h1>
        <p className="text-[15px] font-sans text-ink-3 leading-[1.6] mb-12 animate-fade-up stagger-2">
          Your growth score reflects practice depth, not noise.
        </p>

        {/* Growth Score ring */}
        <div className="bg-surface-1 rounded-[32px] p-10 mb-10 flex flex-col items-center animate-fade-up stagger-3">
          <div className="relative w-[180px] h-[180px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r={radius} fill="none" stroke="hsl(var(--surface-3))" strokeWidth="3" />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-serif text-[3rem] leading-none text-foreground tracking-tight">{growthScore}</p>
              <p className="text-[10px] font-sans uppercase tracking-[0.22em] text-ink-3 mt-2">Growth Score</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-10 w-full">
            <Stat value={progress.current_streak} label="Streak" />
            <Stat value={progress.total_sessions} label="Sessions" />
            <Stat value={completionPct + "%"} label="Mastered" />
          </div>
        </div>

        {/* Your cohort — quiet, no rankings */}
        <div className="mb-12 animate-fade-up stagger-4">
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-5">
            Your cohort
          </p>
          <div className="space-y-3">
            {cohort.map((row) => {
              const r = 14;
              const c = 2 * Math.PI * r;
              const pct = Math.min(row.score / 500, 1);
              const offset = c * (1 - pct);
              return (
                <div
                  key={row.initials}
                  className="bg-surface-1 rounded-[24px] px-6 py-4 flex items-center gap-5"
                >
                  <div className="relative w-9 h-9 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--surface-3))" strokeWidth="2" />
                      <circle
                        cx="18" cy="18" r={r} fill="none"
                        stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"
                        strokeDasharray={c} strokeDashoffset={offset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-sans font-medium text-foreground">{row.initials}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-sans text-foreground truncate">{row.name}</p>
                    <p className="text-[12px] font-sans text-ink-3 truncate mt-0.5">
                      Working on <span className="text-ink-2">{row.topic}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-[1.75rem] leading-none text-foreground tracking-tight">{value}</p>
      <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-ink-3 mt-2">{label}</p>
    </div>
  );
}
