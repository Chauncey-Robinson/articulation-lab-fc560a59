import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson } from "@/lib/TutorContext";
import { useTTS } from "@/hooks/useSpeech";

interface Flashcard {
  front: string;
  back: string;
}

type Difficulty = "easy" | "medium" | "hard";

interface CardResult {
  knew: boolean;
  difficulty: Difficulty;
  timeSpentMs: number;
}

export default function Flashcards() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak, stop } = useTTS();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<(CardResult | null)[]>([]);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  // Image state: map card index → base64 image URL
  const [cardImages, setCardImages] = useState<Record<number, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const fetchedImages = useRef<Set<number>>(new Set());

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

  // Lazily generate image for the current card
  useEffect(() => {
    const card = cards[currentIdx];
    if (!card || fetchedImages.current.has(currentIdx)) return;

    fetchedImages.current.add(currentIdx);
    setImageLoading(prev => ({ ...prev, [currentIdx]: true }));

    supabase.functions.invoke("flashcard-image", {
      body: { front: card.front, back: card.back },
    }).then(({ data, error }) => {
      if (!error && data?.image) {
        setCardImages(prev => ({ ...prev, [currentIdx]: data.image }));
      }
      setImageLoading(prev => ({ ...prev, [currentIdx]: false }));
    }).catch(() => {
      setImageLoading(prev => ({ ...prev, [currentIdx]: false }));
    });

    // Also prefetch the next card's image
    const nextCard = cards[currentIdx + 1];
    if (nextCard && !fetchedImages.current.has(currentIdx + 1)) {
      fetchedImages.current.add(currentIdx + 1);
      setImageLoading(prev => ({ ...prev, [currentIdx + 1]: true }));
      supabase.functions.invoke("flashcard-image", {
        body: { front: nextCard.front, back: nextCard.back },
      }).then(({ data, error }) => {
        if (!error && data?.image) {
          setCardImages(prev => ({ ...prev, [currentIdx + 1]: data.image }));
        }
        setImageLoading(prev => ({ ...prev, [currentIdx + 1]: false }));
      }).catch(() => {
        setImageLoading(prev => ({ ...prev, [currentIdx + 1]: false }));
      });
    }
  }, [currentIdx, cards]);

  const currentCard = cards[currentIdx];

  // Speak card front when it changes
  useEffect(() => {
    if (currentCard && !flipped) {
      speak(currentCard.front);
      setCardStartTime(Date.now());
    }
    return () => stop();
  }, [currentIdx]);

  const handleResult = (knew: boolean, difficulty: Difficulty) => {
    const timeSpentMs = Date.now() - cardStartTime;
    setResults(prev => {
      const n = [...prev];
      n[currentIdx] = { knew, difficulty, timeSpentMs };
      return n;
    });
    setFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Stats
  const completedResults = results.filter(r => r !== null) as CardResult[];
  const knewCount = completedResults.filter(r => r.knew).length;
  const didntCount = completedResults.filter(r => !r.knew).length;
  const isFinished = results.every(r => r !== null) && cards.length > 0;
  const remaining = cards.length - completedResults.length;

  const avgTimePerCard = useMemo(() => {
    if (completedResults.length === 0) return 0;
    const total = completedResults.reduce((a, r) => a + r.timeSpentMs, 0);
    return Math.round(total / completedResults.length / 1000);
  }, [completedResults]);

  const difficultyBreakdown = useMemo(() => {
    const easy = completedResults.filter(r => r.difficulty === "easy").length;
    const medium = completedResults.filter(r => r.difficulty === "medium").length;
    const hard = completedResults.filter(r => r.difficulty === "hard").length;
    return { easy, medium, hard };
  }, [completedResults]);

  const accuracyPct = completedResults.length > 0 ? Math.round((knewCount / completedResults.length) * 100) : 0;

  // Save session to localStorage for analytics
  useEffect(() => {
    if (isFinished && cards.length > 0) {
      const sessions = JSON.parse(localStorage.getItem("flashcard_sessions") || "[]");
      sessions.push({
        date: new Date().toISOString(),
        moduleId,
        totalCards: cards.length,
        knew: knewCount,
        didnt: didntCount,
        avgTimePerCard,
        difficulty: difficultyBreakdown,
        accuracy: accuracyPct,
      });
      localStorage.setItem("flashcard_sessions", JSON.stringify(sessions.slice(-50)));
    }
  }, [isFinished]);

  const currentImage = cardImages[currentIdx];
  const isImageLoading = imageLoading[currentIdx];

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
          <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Session complete!</h1>
          <p className="text-[13px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">Here's how you did across {cards.length} cards.</p>

          {/* Accuracy hero */}
          <div className="bg-card rounded-[20px] border-[1.5px] border-border p-6 w-full mb-4 animate-fade-up stagger-2">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-2">ACCURACY</p>
            <p className="font-serif text-[3.5rem] leading-none text-foreground">{accuracyPct}%</p>
            <p className="text-[12px] font-sans text-ink-3 mt-2">{knewCount} of {cards.length} cards correct</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 w-full mb-4 animate-fade-up stagger-3">
            <div className="bg-sage/10 rounded-[16px] border-[1.5px] border-sage/30 p-5 text-center">
              <p className="font-serif text-[2.5rem] leading-none text-sage">{knewCount}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-2">Knew it</p>
            </div>
            <div className="bg-accent-bright/10 rounded-[16px] border-[1.5px] border-accent-bright/30 p-5 text-center">
              <p className="font-serif text-[2.5rem] leading-none text-accent-bright">{didntCount}</p>
              <p className="text-[12px] font-sans text-ink-3 mt-2">Review needed</p>
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 w-full mb-4 animate-fade-up stagger-4">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3">DIFFICULTY BREAKDOWN</p>
            <div className="flex gap-2 mb-3">
              {[
                { label: "Easy", count: difficultyBreakdown.easy, color: "bg-sage" },
                { label: "Medium", count: difficultyBreakdown.medium, color: "bg-accent" },
                { label: "Hard", count: difficultyBreakdown.hard, color: "bg-accent-bright" },
              ].map(d => (
                <div key={d.label} className="flex-1">
                  <div className="w-full h-2 bg-border rounded-pill mb-1.5">
                    <div className={`h-full ${d.color} rounded-pill transition-all`} style={{ width: `${cards.length > 0 ? (d.count / cards.length) * 100 : 0}%` }} />
                  </div>
                  <p className="text-[10px] font-sans text-ink-3">{d.label} · {d.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="bg-card rounded-[16px] border-[1.5px] border-border p-4 w-full mb-6 animate-fade-up stagger-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-sans text-ink-3">Avg time per card</p>
              <p className="text-[14px] font-sans font-medium text-foreground">{avgTimePerCard}s</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full animate-fade-up stagger-6">
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
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
        <span className="text-[13px] font-sans text-ink-3">{remaining} card{remaining !== 1 ? "s" : ""} remaining</span>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-4">
          {cards.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-pill transition-colors" style={{
              background: results[i]?.knew ? "hsl(var(--sage))" : results[i] && !results[i]?.knew ? "hsl(var(--amber-bright))" : i <= currentIdx ? "hsl(var(--accent))" : "hsl(var(--border))"
            }} />
          ))}
        </div>

        {/* Live accuracy counter */}
        {completedResults.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-sans text-sage font-medium">✓ {knewCount}</span>
              <span className="text-[12px] font-sans text-accent-bright font-medium">✗ {didntCount}</span>
            </div>
            <span className="text-[12px] font-sans text-ink-3">{accuracyPct}% accuracy</span>
          </div>
        )}

        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent mb-4 animate-fade-up">FLASHCARD {currentIdx + 1} of {cards.length}</p>

        {/* Card */}
        <button onClick={() => { setFlipped(!flipped); if (!flipped && currentCard) speak(currentCard.back); }}
          className="w-full bg-card rounded-[20px] border-[1.5px] border-border p-6 min-h-[280px] flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-card-hover mb-6 animate-fade-up stagger-2 overflow-hidden">
          
          {/* AI-generated illustration */}
          {currentImage && (
            <div className="w-full max-w-[200px] h-[120px] mb-4 rounded-[12px] overflow-hidden">
              <img
                src={currentImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: flipped ? "none" : "saturate(0.7) brightness(1.05)" }}
              />
            </div>
          )}
          {isImageLoading && !currentImage && (
            <div className="w-[200px] h-[120px] mb-4 rounded-[12px] bg-muted animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-sans text-ink-3">Generating illustration...</span>
            </div>
          )}

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

        {/* Response buttons */}
        {flipped && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-1">DID YOU KNOW IT?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleResult(false, "hard")}
                className="rounded-pill border-[1.5px] border-accent-bright/40 bg-accent-bright/10 py-4 text-[13px] font-sans font-medium text-accent-bright hover:bg-accent-bright/20 transition-all">
                Didn't know
              </button>
              <button onClick={() => handleResult(true, "easy")}
                className="rounded-pill border-[1.5px] border-sage/40 bg-sage/10 py-4 text-[13px] font-sans font-medium text-sage hover:bg-sage/20 transition-all">
                Knew it
              </button>
            </div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mt-3 mb-1">HOW HARD WAS IT?</p>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                <button key={d} onClick={() => handleResult(true, d)}
                  className={`rounded-pill border-[1.5px] py-3 text-[12px] font-sans font-medium transition-all ${
                    d === "easy" ? "border-sage/30 text-sage hover:bg-sage/10" :
                    d === "medium" ? "border-accent/30 text-accent hover:bg-accent/10" :
                    "border-accent-bright/30 text-accent-bright hover:bg-accent-bright/10"
                  }`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
