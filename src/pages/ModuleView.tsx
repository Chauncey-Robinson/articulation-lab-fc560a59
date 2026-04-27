import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Check, MessageCircle, ArrowUp, RefreshCw, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTutor, type Lesson, type Module } from "@/lib/TutorContext";
import { toast } from "@/hooks/use-toast";

export default function ModuleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachQuery, setCoachQuery] = useState("");
  const [refresher, setRefresher] = useState<{ summary: string; questions: string[] } | null>(null);
  const [refresherLoading, setRefresherLoading] = useState(false);
  const [books, setBooks] = useState<{ title: string; author: string; why: string }[] | null>(null);
  const [booksLoading, setBooksLoading] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const [modRes, lessRes] = await Promise.all([
        supabase.from("modules").select("*").eq("id", id).single(),
        supabase.from("lessons").select("*").eq("module_id", id).order("lesson_order", { ascending: true }),
      ]);
      if (modRes.data) setModule(modRes.data as unknown as Module);
      if (lessRes.data) setLessons(lessRes.data as unknown as Lesson[]);
      setLoading(false);
    })();
  }, [user, id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground/80 rounded-full animate-spin" /></div>;
  }

  if (!module) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Topic not found.</p></div>;
  }

  const completedCount = lessons.filter(l => l.completed).length;
  const allCompleted = completedCount === lessons.length && lessons.length > 0;
  const nextLesson = lessons.find(l => !l.completed);
  const pct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const submitCoachQuery = () => {
    if (!coachQuery.trim() || !nextLesson) return;
    const target = nextLesson || lessons.find(l => l.completed);
    if (target) navigate(`/dialogue/${target.id}`, { state: { initialQuestion: coachQuery } });
  };

  const requestRefresher = async () => {
    if (refresherLoading || refresher) return;
    setRefresherLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("topic-extras", {
        body: { type: "refresher", title: module.title, source: module.source_content },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRefresher({ summary: data.summary, questions: data.questions });
    } catch (e: any) {
      toast({ title: "Couldn't load refresher", description: e?.message || "Try again shortly.", variant: "destructive" });
    } finally {
      setRefresherLoading(false);
    }
  };

  // Auto-load curated reading when topic is fully completed
  useEffect(() => {
    if (!allCompleted || books || booksLoading || !module) return;
    setBooksLoading(true);
    supabase.functions
      .invoke("topic-extras", { body: { type: "books", title: module.title } })
      .then(({ data, error }) => {
        if (error || data?.error) return;
        if (Array.isArray(data?.books)) setBooks(data.books);
      })
      .finally(() => setBooksLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCompleted, module?.id]);


  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-6 pb-40">
      <button
        onClick={() => navigate("/dashboard")}
        className="text-ink-3 hover:text-foreground transition-colors mb-10 self-start"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
      </button>

      <div className="max-w-[560px] mx-auto w-full">
        {/* Topic header */}
        <div className="mb-12 animate-fade-up stagger-1">
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">
            {completedCount} of {lessons.length} done
          </p>
          <h1 className="font-serif text-[2.25rem] leading-[1.15] text-foreground mb-6 tracking-tight">{module.title}</h1>
          {/* 2px progress, brand accent */}
          <div className="w-full h-[2px] bg-[hsl(var(--surface-3))] rounded-pill overflow-hidden">
            <div className="h-full bg-primary rounded-pill transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Path selection — borderless tinted tiles */}
        {!allCompleted && nextLesson && (
          <div className="grid grid-cols-2 gap-4 mb-10 animate-fade-up stagger-3">
            <button
              onClick={() => navigate(`/study/${nextLesson.id}`)}
              className="bg-[hsl(var(--surface-1))] rounded-[32px] p-7 text-left hover:bg-[hsl(var(--surface-2))] hover:-translate-y-0.5 transition-all duration-[200ms] shadow-feather"
            >
              <BookOpen className="w-5 h-5 text-foreground mb-4" strokeWidth={1.5} />
              <p className="font-serif text-[18px] text-foreground tracking-tight">Learn</p>
              <p className="text-[12px] font-sans text-ink-3 mt-1">Read it</p>
            </button>
            <button
              onClick={() => navigate(`/test-config/${module.id}`)}
              className="bg-[hsl(var(--surface-1))] rounded-[32px] p-7 text-left hover:bg-[hsl(var(--surface-2))] hover:-translate-y-0.5 transition-all duration-[200ms] shadow-feather"
            >
              <Sparkles className="w-5 h-5 text-foreground mb-4" strokeWidth={1.5} />
              <p className="font-serif text-[18px] text-foreground tracking-tight">Test</p>
              <p className="text-[12px] font-sans text-ink-3 mt-1">Explain it back</p>
            </button>
          </div>
        )}

        {allCompleted && (
          <>
            <div className="bg-[hsl(var(--surface-1))] rounded-[32px] p-8 mb-6 text-center animate-fade-up stagger-2 shadow-feather">
              <p className="font-serif text-[20px] text-foreground tracking-tight mb-2">You've finished all the reading.</p>
              <button
                onClick={() => navigate(`/test-config/${module.id}`)}
                className="mt-4 rounded-pill bg-primary px-7 py-3.5 text-[13px] font-sans font-medium text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all tracking-wide"
              >
                Now explain it back
              </button>
            </div>

            {/* Request Refresher — glass button to mirror coach bar */}
            <div className="mb-10 animate-fade-up stagger-3">
              {!refresher ? (
                <button
                  onClick={requestRefresher}
                  disabled={refresherLoading}
                  className="glass w-full rounded-pill px-6 py-4 flex items-center justify-center gap-3 text-[13px] font-sans font-medium text-foreground hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refresherLoading ? "animate-spin" : ""}`} strokeWidth={1.5} />
                  {refresherLoading ? "Curating your refresher…" : "Request Refresher"}
                </button>
              ) : (
                <div className="bg-[hsl(var(--surface-1))] rounded-[28px] p-7 shadow-feather">
                  <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-3">Refresher</p>
                  <p className="font-serif italic text-[17px] leading-[1.55] text-foreground mb-5 tracking-tight">
                    {refresher.summary}
                  </p>
                  <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-3">Deep Recall · 3 questions</p>
                  <ol className="space-y-3">
                    {refresher.questions.map((q, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-serif text-[14px] text-ink-3 tabular-nums">{i + 1}</span>
                        <span className="text-[14px] font-sans text-foreground leading-[1.55]">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Curated Reading — high-end horizontal book carousel */}
            {(books || booksLoading) && (
              <div className="mb-12 animate-fade-up stagger-4">
                <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">Curated Reading</p>
                <p className="text-[13px] font-sans text-ink-3 leading-[1.6] mb-5">
                  Three books to deepen your fluency on this topic.
                </p>
                <div className="-mx-8 px-8 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-5 pb-2">
                    {booksLoading && !books
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="w-[150px] shrink-0">
                            <div className="w-[150px] h-[210px] bg-surface-2 rounded-[14px] animate-pulse" />
                          </div>
                        ))
                      : books?.map((b, i) => (
                          <div key={i} className="w-[150px] shrink-0">
                            <div
                              className="w-[150px] h-[210px] rounded-[14px] p-5 flex flex-col justify-between shadow-feather"
                              style={{
                                background: `linear-gradient(155deg, hsl(${(i * 47 + 30) % 360}, 18%, 22%) 0%, hsl(${(i * 47 + 50) % 360}, 22%, 14%) 100%)`,
                              }}
                            >
                              <div className="w-full h-[1px] bg-white/15" />
                              <div>
                                <p className="font-serif italic text-[15px] leading-[1.15] text-white tracking-tight">
                                  {b.title}
                                </p>
                                <p className="text-[9px] font-sans uppercase tracking-[0.22em] text-white/55 mt-2">
                                  {b.author}
                                </p>
                              </div>
                              <div className="w-full h-[1px] bg-white/15" />
                            </div>
                            <p className="text-[11px] font-sans text-ink-3 leading-[1.45] mt-3 italic">{b.why}</p>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sessions list — borderless, monochromatic */}
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-5 animate-fade-up stagger-3">Sessions</p>
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => navigate(`/study/${lesson.id}`)}
              className={`w-full text-left rounded-[24px] p-6 transition-all duration-[180ms] animate-fade-up bg-[hsl(var(--surface-1))] hover:bg-[hsl(var(--surface-2))] ${lesson.completed ? "opacity-60 hover:opacity-90" : ""}`}
              style={{ animationDelay: `${(idx + 3) * 65}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-sans font-medium shrink-0 ${lesson.completed ? "bg-foreground text-background" : "bg-[hsl(var(--surface-3))] text-ink-3"}`}>
                  {lesson.completed ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-sans font-medium text-foreground">{lesson.title}</h3>
                  <p className="text-[12px] font-sans text-ink-3 mt-0.5 truncate">{lesson.key_idea}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating glass coach bar */}
      {completedCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
          <div className="max-w-[560px] mx-auto pointer-events-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); submitCoachQuery(); }}
              className="glass rounded-pill pl-5 pr-2 py-2 flex items-center gap-3"
            >
              <MessageCircle className="w-4 h-4 text-ink-3 shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                value={coachQuery}
                onChange={(e) => setCoachQuery(e.target.value)}
                placeholder="Ask your coach a question…"
                className="flex-1 bg-transparent text-[14px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none py-2"
              />
              <button
                type="submit"
                disabled={!coachQuery.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 active:scale-95 transition-all disabled:opacity-30 shrink-0"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
