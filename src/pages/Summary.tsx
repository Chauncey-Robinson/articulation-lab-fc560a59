import { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

export default function Summary() {
  const { summary, context, muted } = useApp();
  const { speak } = useTTS();

  const replayMeetingLine = useCallback(() => {
    if (summary?.meeting_line) speak(summary.meeting_line);
  }, [summary, speak]);

  // Auto-read meeting line after 600ms
  useEffect(() => {
    if (!summary?.meeting_line || muted) return;
    const timer = setTimeout(() => {
      speak(`Here is a line you can use in your next meeting: ${summary.meeting_line}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [summary, muted, speak]);

  if (!summary) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">No session data. Start a drill first.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-serif text-2xl text-foreground mb-1">Session complete.</h1>
      <p className="text-[13px] text-muted-foreground mb-8">{context} · 2 attempts</p>

      <div className="rounded-lg border border-border bg-card overflow-hidden mb-8">
        <Row label="WHAT YOU GOT RIGHT" value={summary.what_worked} />
        <Row label="CORE GAP THAT REMAINED" value={summary.core_gap} border />
        <div className="px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 mb-2">
            SAY THIS IN YOUR NEXT MEETING
          </p>
          <p className="text-sm italic text-primary leading-relaxed">
            "{summary.meeting_line}"
            <button onClick={replayMeetingLine} className="ml-2 text-xs text-muted-foreground hover:text-foreground">
              ↺
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/input"
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Drill Again
        </Link>
        <Link
          to="/progress"
          className="rounded-full border border-border bg-card px-8 py-3.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          View Progress
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`px-5 py-4 ${border ? "" : "border-b border-border"}`}>
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 mb-2">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
