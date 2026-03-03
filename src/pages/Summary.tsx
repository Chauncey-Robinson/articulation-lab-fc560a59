import { useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

export default function Summary() {
  const { summary, contextLabel, muted, sessions, streakCount, totalSessions, notificationPromptShown, setNotificationPromptShown } = useApp();
  const { speak } = useTTS();
  const navigate = useNavigate();

  const replayMeetingLine = useCallback(() => {
    if (summary?.meeting_line) speak(summary.meeting_line);
  }, [summary, speak]);

  // Auto-read meeting line after 600ms
  useEffect(() => {
    if (!summary?.meeting_line || muted) return;
    const timer = setTimeout(() => {
      speak(`Here is a line you can use tomorrow: ${summary.meeting_line}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [summary, muted, speak]);

  // Show notification prompt after first drill
  useEffect(() => {
    if (totalSessions === 1 && !notificationPromptShown && summary) {
      const timer = setTimeout(() => {
        navigate("/notifications");
        setNotificationPromptShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [totalSessions, notificationPromptShown, summary, navigate, setNotificationPromptShown]);

  if (!summary) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">No session data. Start a drill first.</p>
        <Link to="/home" className="mt-4 inline-block text-sm text-accent hover:underline">Go Home</Link>
      </div>
    );
  }

  let nudge = "";
  if (totalSessions === 1) {
    nudge = "First one done. Come back tomorrow.";
  } else if (streakCount >= 3) {
    nudge = `🔥 ${streakCount} days in a row. Come back tomorrow.`;
  } else if (streakCount <= 2 && streakCount > 0) {
    nudge = "First one done. Come back tomorrow.";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="max-w-[460px] mx-auto w-full">
        <h1 className="font-serif text-[1.8rem] text-foreground mb-1">Nice work.</h1>
        <p className="text-[13px] text-muted-foreground mb-7">{contextLabel} · 2 attempts</p>

        <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
          <Row label="WHAT WORKED" value={summary.what_worked} />
          <Row label="WHAT TO WORK ON NEXT TIME" value={summary.core_gap} border />
          <div className="px-5 py-4" style={{ background: "hsl(var(--meeting-card))" }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">
              TRY SAYING THIS
            </p>
            <p className="text-sm italic leading-relaxed" style={{ color: "hsl(var(--meeting-text))" }}>
              "{summary.meeting_line}"
              <button onClick={replayMeetingLine} className="ml-2 text-xs text-accent hover:opacity-80">
                ↺
              </button>
            </p>
          </div>
        </div>

        {nudge && (
          <p className="text-[13px] text-muted-foreground text-center mb-6">{nudge}</p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/input"
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
          >
            Practice something else
          </Link>
          <Link
            to="/progress"
            className="w-full rounded-full border border-border bg-secondary py-4 text-sm font-medium text-secondary-foreground hover:opacity-90 transition-opacity text-center block"
          >
            View Progress
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`px-5 py-4 ${border ? "" : ""}`} style={{ borderBottom: "1px solid hsl(var(--block-empty))" }}>
      <p className="text-[10px] uppercase tracking-[0.1em] text-legal mb-1">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
