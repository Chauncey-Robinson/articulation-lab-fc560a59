import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateState, generateId, addDaysToDate, type Concept } from "@/lib/store";

// Simulates concept extraction from pasted content
function extractConcepts(text: string): string[] {
  const sentences = text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length <= 5) return sentences.slice(0, 5);

  // Pick distributed sentences as "core concepts"
  const step = Math.max(1, Math.floor(sentences.length / 5));
  const picked: string[] = [];
  for (let i = 0; i < sentences.length && picked.length < 5; i += step) {
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
    const c = extractConcepts(text);
    setConcepts(c);
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

    updateState((s) => ({
      ...s,
      concepts: [...s.concepts, ...newConcepts],
    }));

    navigate("/drill");
  };

  return (
    <div>
      <div className="mb-8">
        <p className="metric-label mb-1">Content Input</p>
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Paste your material
        </h1>
      </div>

      {!extracted ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste notes, summaries, excerpts, or key concepts..."
            className="w-full min-h-[240px] rounded-xl border border-border bg-card p-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <button
            onClick={handleExtract}
            disabled={text.trim().length < 30}
            className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Extract Concepts
          </button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="metric-label mb-4">
              {concepts.length} concept{concepts.length !== 1 ? "s" : ""} identified
            </p>
            <div className="space-y-3 mb-8">
              {concepts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-lg border border-border bg-card px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{c}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setExtracted(false);
                  setConcepts([]);
                }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Re-enter
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Begin Drill
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
