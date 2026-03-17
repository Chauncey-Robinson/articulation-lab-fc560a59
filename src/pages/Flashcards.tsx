import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson } from "@/lib/TutorContext";

interface Flashcard {
  front: string;
  back: string;
}

export default function Flashcards() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<("knew" | "didnt" | null)[]>([]);

  useEffect(() => {
    if (!user || !moduleId) return;
    (async () => {
      try {
        const { data: lessons } = await supabase.from("lessons").select("*").eq("module_id", moduleId).eq("completed", true).order("lesson_order");
        if (!lessons || lessons.length === 0) {
          setError("Complete at least one lesson first.");
          setLoading(false);
          return;
        }
        const { data, error: fnErr } = await supabase.functions.invoke("ai-tutor", {
          body: {
            type: "generate_flashcards",
            lessons: (lessons as unknown as Lesson[]).map(l => ({ title: l.title, key_idea: l.key_idea, content: l.content })),
          },
        });
        if (fnErr) throw new Error(fnErr.message);
        if (data?.error) throw new Error(data.error);
        setCards(data.flashcards || []);
        setResults(new Array(data.flashcards?.length || 0).fill(null));
      } catch (e: any) {
        setError(e.message || "Failed to generate flashcards.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, moduleId]);

  const currentCard = cards[currentIdx];

  const handleResult = (result: "knew" | "didnt") => {
    setResults(prev => { const n = [...prev]; n[currentIdx] = result; return n; });
    setFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const knewCount = results.filter(r => r === "knew").length;
  const didntCount = results.filter(r => r === "didnt").length;
  const isFinished = results.every(r => r !== null) && cards.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[14px] font-sans text-ink-3">Creating flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive">{error}</div>
        <button onClick={() => navigate(-1)} className="rounded-pill bg-primary px-8 py-3 text-[13px] font-sans font-semibold text-primary-foreground">Go back</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
        <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-[2rem] text-foreground mb-4 animate-fade-up stagger-1">Flashcards done!</h1>
          <div className="grid grid-cols-2 gap-4 w-full mb-8 animate-fade-up stagger-2">
            <div className="bg-sage/10 rounded-[16px] border-[1.5px] border-sage/30 p-5 text-center">
              <p className="font-serif text-[2.5rem] leading-none text-sage">{knewCount}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-2">Knew it</p>
            </div>
            <div className="bg-accent-bright/10 rounded-[16px] border-[1.5px] border-accent-bright/30 p-5 text-center">
              <p className="font-serif text-[2.5rem] leading-none text-accent-bright">{didntCount}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-2">Review needed</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full animate-fade-up stagger-3">
            <button onClick={() => { setCurrentIdx(0); setFlipped(false); setResults(new Array(cards.length).fill(null)); }}
              className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all">
              Go again
            </button>
            <button onClick={() => navigate(`/module/${moduleId}`)}
              className="w-full rounded-pill border-[1.5px] border-border bg-card py-4 text-[13px] font-sans font-medium text-foreground hover:border-accent transition-all">
              Back to module
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
        <span className="text-[13px] font-sans text-ink-3">{currentIdx + 1} / {cards.length}</span>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {cards.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-pill transition-colors" style={{
              background: results[i] === "knew" ? "hsl(var(--sage))" : results[i] === "didnt" ? "hsl(var(--amber-bright))" : i <= currentIdx ? "hsl(var(--accent))" : "hsl(var(--border))"
            }} />
          ))}
        </div>

        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-4 animate-fade-up">FLASHCARD</p>

        {/* Card */}
        <button onClick={() => setFlipped(!flipped)}
          className="w-full bg-card rounded-[20px] border-[1.5px] border-border p-8 min-h-[240px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-card-hover mb-6 animate-fade-up stagger-2">
          {!flipped ? (
            <>
              <p className="font-serif text-[20px] font-light leading-[1.6] text-foreground">{currentCard.front}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-4">Tap to reveal</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-sage mb-3">ANSWER</p>
              <p className="font-serif text-[17px] font-light leading-[1.65] text-foreground">{currentCard.back}</p>
            </>
          )}
        </button>

        {/* Buttons */}
        {flipped && (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            <button onClick={() => handleResult("didnt")}
              className="rounded-pill border-[1.5px] border-accent-bright/40 bg-accent-bright/10 py-4 text-[13px] font-sans font-medium text-accent-bright hover:bg-accent-bright/20 transition-all">
              Didn't know
            </button>
            <button onClick={() => handleResult("knew")}
              className="rounded-pill border-[1.5px] border-sage/40 bg-sage/10 py-4 text-[13px] font-sans font-medium text-sage hover:bg-sage/20 transition-all">
              Knew it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
