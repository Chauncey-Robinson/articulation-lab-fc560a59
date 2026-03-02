import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateState, generateId, addDaysToDate, type Concept } from "@/lib/store";

function extractConcepts(text: string): string[] {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  if (sentences.length <= 4) return sentences.slice(0, 4);
  const step = Math.max(1, Math.floor(sentences.length / 4));
  const picked: string[] = [];
  for (let i = 0; i < sentences.length && picked.length < 4; i += step) {
    picked.push(sentences[i]);
  }
  return picked;
}

export default function ContentInput() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [concepts, setConcepts] = useState<string[]>([]);
  const [extracted, setExtracted] = useState(false);

  const handleExtract = () => {
    setConcepts(extractConcepts(text));
    setExtracted(true);
  };

  const handleSave = () => {
    const now = new Date();
    const newConcepts: Concept[] = concepts.map((c) => ({
      id: generateId(),
      text: c,
      source: "manual",
      strength: "weak" as const,
      retentionScore: 0,
      lastArticulated: now.toISOString(),
      nextReview: addDaysToDate(now, 2),
      createdAt: now.toISOString(),
      drillCount: 0,
    }));
    updateState((s) => ({ ...s, concepts: [...s.concepts, ...newConcepts] }));
    navigate("/drill");
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          What are you working on?
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {!extracted ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste notes, summary, or key ideas."
              className="w-full min-h-[200px] rounded-xl border border-border bg-card p-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
            />
            <button
              onClick={handleExtract}
              disabled={text.trim().length < 30}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Prepare Drill
            </button>
          </motion.div>
        ) : (
          <motion.div key="concepts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs text-muted-foreground mb-4">
              {concepts.length} key idea{concepts.length !== 1 ? "s" : ""} identified
            </p>
            <div className="space-y-2.5 mb-8">
              {concepts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground leading-relaxed"
                >
                  {c}
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setExtracted(false); setConcepts([]); }}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Re-enter
              </button>
              <button
                onClick={handleSave}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Begin Drill
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
