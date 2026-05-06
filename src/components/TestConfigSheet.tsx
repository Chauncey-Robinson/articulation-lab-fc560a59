import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomSheet from "@/components/BottomSheet";

const LENGTHS = [
  { key: 5, label: "5 min", desc: "Quick recall" },
  { key: 10, label: "10 min", desc: "Standard" },
  { key: 20, label: "20 min", desc: "Deep practice" },
];

interface TestConfigSheetProps {
  open: boolean;
  onClose: () => void;
  moduleId: string;
}

/**
 * Adaptive session length picker. Default 10 min.
 * Routes into the swipeable session container.
 */
export default function TestConfigSheet({ open, onClose, moduleId }: TestConfigSheetProps) {
  const navigate = useNavigate();
  const [length, setLength] = useState<number>(10);

  useEffect(() => {
    if (!open) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`test_config_${moduleId}`) || "null");
      if (saved?.duration) setLength(Number(saved.duration));
    } catch {}
  }, [open, moduleId]);

  const handleStart = () => {
    localStorage.setItem(
      `test_config_${moduleId}`,
      JSON.stringify({ duration: String(length) })
    );
    onClose();
    navigate(`/session/${moduleId}?len=${length}`);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="pt-2">
        <h2 className="font-serif text-[1.6rem] text-foreground tracking-tight mb-1">
          How long do you have?
        </h2>
        <p className="text-[13px] font-sans text-ink-3 mb-6">
          Lily picks the cards based on your time.
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {LENGTHS.map((l) => {
            const on = length === l.key;
            return (
              <button
                key={l.key}
                onClick={() => setLength(l.key)}
                className={`rounded-[20px] py-5 text-center transition-all ${
                  on
                    ? "bg-foreground text-background"
                    : "bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                <p className="font-serif text-[20px] tracking-tight">{l.label}</p>
                <p className={`text-[11px] font-sans mt-1 ${on ? "text-background/70" : "text-ink-3"}`}>
                  {l.desc}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-[12px] font-sans text-ink-3 mb-5 text-center">
          {length === 5
            ? "Two cards: a quick read and a quick check."
            : length === 20
            ? "Five cards: read, quiz, flashcards, explain, apply."
            : "Four cards: read, quiz, flashcards, and explain."}
        </p>

        <button
          onClick={handleStart}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-95 transition-all"
        >
          Start session
        </button>
      </div>
    </BottomSheet>
  );
}
