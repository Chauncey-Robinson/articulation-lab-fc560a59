import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomSheet from "@/components/BottomSheet";

const PACES = [
  { key: "quick", label: "Fast", desc: "1-2 days" },
  { key: "standard", label: "Standard", desc: "3-5 days" },
  { key: "deep", label: "Thorough", desc: "1-2 weeks" },
  { key: "extended", label: "Extended", desc: "1 month+" },
];

interface LearnConfigSheetProps {
  open: boolean;
  onClose: () => void;
  moduleId: string;
}

const LENGTHS = [5, 10, 20] as const;

export default function LearnConfigSheet({ open, onClose, moduleId }: LearnConfigSheetProps) {
  const navigate = useNavigate();
  const [pace, setPace] = useState("standard");
  const [link, setLink] = useState(false);
  const [length, setLength] = useState<number>(10);

  useEffect(() => {
    if (!open) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`learn_config_${moduleId}`) || "null");
      if (saved) {
        if (saved.digestPeriod) setPace(saved.digestPeriod);
        if (typeof saved.priorKnowledge === "boolean") setLink(saved.priorKnowledge);
        if (typeof saved.length === "number" && LENGTHS.includes(saved.length as any)) setLength(saved.length);
      }
    } catch {}
  }, [open, moduleId]);

  const handleStart = () => {
    localStorage.setItem(
      `learn_config_${moduleId}`,
      JSON.stringify({ digestPeriod: pace, priorKnowledge: link, length })
    );
    onClose();
    navigate(`/session/${moduleId}?len=${length}`);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="pt-2">
        <h2 className="font-serif text-[1.6rem] text-foreground tracking-tight mb-1">
          How do you want to study?
        </h2>
        <p className="text-[13px] font-sans text-ink-3 mb-6">
          Pick a pace. We'll break it into sessions.
        </p>

        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-3">
          Pace
        </p>
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {PACES.map((p) => {
            const on = pace === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPace(p.key)}
                className={`rounded-[20px] p-4 text-left transition-all ${
                  on ? "bg-foreground text-background" : "bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                <p className="text-[13px] font-sans font-semibold">{p.label}</p>
                <p className={`text-[11px] font-sans mt-0.5 ${on ? "text-background/70" : "text-ink-3"}`}>
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setLink((v) => !v)}
          className="w-full bg-surface-2 rounded-[20px] p-4 flex items-center justify-between mb-6"
        >
          <div className="text-left">
            <p className="text-[13px] font-sans font-medium text-foreground">
              Link to my other topics
            </p>
            <p className="text-[11px] font-sans text-ink-3 mt-0.5">
              Lily makes connections across what you know.
            </p>
          </div>
          <span
            className={`relative inline-block w-9 h-5 rounded-pill transition-colors ${link ? "bg-foreground" : "bg-surface-3"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all ${link ? "left-[18px]" : "left-0.5"}`}
            />
          </span>
        </button>

        <button
          onClick={handleStart}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-95 transition-all"
        >
          Let's go
        </button>
      </div>
    </BottomSheet>
  );
}
