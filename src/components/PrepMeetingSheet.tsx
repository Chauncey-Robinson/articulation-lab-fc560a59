import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomSheet from "@/components/BottomSheet";
import { useTutor } from "@/lib/TutorContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TIME_OPTIONS = [
  { key: "30m", label: "30 min", minutes: 5 },
  { key: "1h", label: "1 hour", minutes: 10 },
  { key: "2h", label: "2 hours", minutes: 15 },
  { key: "today", label: "Today", minutes: 20 },
];

function scoreModule(title: string, source: string, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  const haystack = `${title} ${source}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (haystack.includes(t)) score += 2;
  }
  if (haystack.includes(q)) score += 5;
  return score;
}

export default function PrepMeetingSheet({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { modules } = useTutor();
  const [topic, setTopic] = useState("");
  const [timeKey, setTimeKey] = useState("1h");

  const handleBuild = () => {
    const time = TIME_OPTIONS.find(t => t.key === timeKey) ?? TIME_OPTIONS[1];
    const q = topic.trim();

    if (!q || modules.length === 0) {
      onClose();
      navigate("/upload");
      return;
    }

    const ranked = modules
      .map(m => ({ m, score: scoreModule(m.title, (m as any).source_content || "", q) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    onClose();
    if (!best || best.score === 0) {
      navigate("/upload");
      return;
    }
    navigate(`/session/${best.m.id}?len=${time.minutes}&prep=${encodeURIComponent(q)}`);
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxVh={75}>
      <div className="pt-2 pb-2">
        <h2 className="font-serif text-[1.5rem] text-foreground mb-1.5 tracking-tight">
          Prep for a meeting.
        </h2>
        <p className="text-[13px] font-sans text-ink-3 mb-6 leading-[1.55]">
          We'll build a short session from what you know.
        </p>

        <label className="block text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-ink-3 mb-2">
          Meeting topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. revenue recognition"
          className="w-full rounded-[16px] bg-surface-2 px-5 py-3.5 text-[14px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none mb-7"
          autoFocus
        />

        <label className="block text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-ink-3 mb-3">
          Time until meeting
        </label>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setTimeKey(opt.key)}
              className={`rounded-pill py-3 text-[12px] font-sans font-medium transition-all duration-[180ms] ${
                timeKey === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-ink-2 hover:bg-surface-3"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleBuild}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms]"
        >
          Build my session
        </button>
      </div>
    </BottomSheet>
  );
}
