import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";
import { Search, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";

// Heuristic to bucket a module title into a topic folder
const TOPIC_KEYWORDS: { folder: string; words: string[] }[] = [
  { folder: "Accounting", words: ["accounting", "ledger", "balance sheet", "tax", "audit", "ifrs", "gaap"] },
  { folder: "Finance", words: ["finance", "investing", "valuation", "equity", "macro", "bond", "portfolio", "wacc"] },
  { folder: "Strategy", words: ["strategy", "porter", "moat", "competition", "playbook"] },
  { folder: "AI & Tech", words: ["ai", "ml", "machine learning", "neural", "model", "transformer", "llm", "engineering", "code"] },
  { folder: "Leadership", words: ["leadership", "team", "manager", "executive", "ceo", "people"] },
  { folder: "Marketing", words: ["marketing", "brand", "growth", "funnel", "positioning"] },
  { folder: "Psychology", words: ["psychology", "behaviour", "cognitive", "bias", "habit"] },
  { folder: "Literature", words: ["literature", "novel", "poetry", "essay", "shakespeare"] },
  { folder: "Law", words: ["law", "legal", "contract", "litigation", "compliance"] },
  { folder: "Health", words: ["health", "medicine", "biology", "nutrition", "sleep"] },
];

function bucketize(title: string): string {
  const t = title.toLowerCase();
  for (const { folder, words } of TOPIC_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return folder;
  }
  return "General";
}

export default function Library() {
  const navigate = useNavigate();
  const { modules } = useTutor();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const lastY = useRef(0);

  // Invisible search: hidden until user scrolls UP
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY.current - 6 && y > 40) setShowSearch(true);
      else if (y > lastY.current + 6) setShowSearch(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = modules.filter((m) =>
    !query.trim() ? true : m.title.toLowerCase().includes(query.toLowerCase())
  );

  const folders = filtered.reduce<Record<string, typeof modules>>((acc, m) => {
    const f = bucketize(m.title);
    (acc[f] ||= []).push(m);
    return acc;
  }, {});

  const folderEntries = Object.entries(folders).sort((a, b) => b[1].length - a[1].length);

  // Bento sizing pattern
  const sizes = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1"];

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 pt-12 pb-40">
      {/* Scroll-up search bar */}
      <div
        className={`fixed top-3 inset-x-0 px-6 z-30 pointer-events-none transition-all duration-300 ${
          showSearch ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
      >
        <div className="mx-auto max-w-[420px] pointer-events-auto">
          <div className="glass rounded-pill flex items-center gap-3 px-5 py-3">
            <Search className="w-4 h-4 text-ink-3" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your library"
              className="flex-1 bg-transparent text-[14px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto w-full">
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4 animate-fade-up stagger-1">
          Library
        </p>
        <h1 className="font-serif text-[2.75rem] leading-[1.05] text-foreground mb-3 tracking-tight animate-fade-up stagger-1">
          Knowledge at your fingertips.
        </h1>
        <p className="text-[15px] font-sans text-ink-3 leading-[1.6] mb-12 animate-fade-up stagger-2">
          Everything you've practiced, organised by subject.
        </p>

        {modules.length === 0 ? (
          <div className="bg-surface-1 rounded-[28px] p-10 text-center animate-fade-up stagger-3">
            <p className="font-serif text-[20px] text-foreground mb-2 tracking-tight">Your shelves are empty.</p>
            <p className="text-[13px] font-sans text-ink-3 mb-6">Add material to start building your library.</p>
            <button
              onClick={() => navigate("/upload")}
              className="rounded-pill bg-primary px-7 py-3.5 text-[13px] font-sans font-medium text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Add your first topic
            </button>
          </div>
        ) : (
          <>
            {/* Bento grid of topic folders */}
            <div className="grid grid-cols-3 auto-rows-[140px] gap-4 mb-12">
              {folderEntries.map(([folder, mods], idx) => (
                <button
                  key={folder}
                  onClick={() => {
                    const target = document.getElementById(`folder-${folder}`);
                    target?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`${sizes[idx % sizes.length]} bg-surface-1 hover:bg-surface-2 transition-all duration-[200ms] rounded-[28px] p-6 text-left flex flex-col justify-between animate-fade-up`}
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <BookOpen className="w-4 h-4 text-ink-3" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-[20px] text-foreground tracking-tight leading-[1.1]">{folder}</h3>
                    <p className="text-[11px] font-sans text-ink-3 mt-1.5">
                      {mods.length} {mods.length === 1 ? "topic" : "topics"}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Folder contents */}
            {folderEntries.map(([folder, mods]) => (
              <div key={folder} id={`folder-${folder}`} className="mb-10 scroll-mt-20">
                <p className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-ink-3 mb-4">{folder}</p>
                <div className="space-y-3">
                  {mods.map((m) => {
                    const pct = m.lesson_count > 0 ? Math.round((m.completed_lessons / m.lesson_count) * 100) : 0;
                    return (
                      <button
                        key={m.id}
                        onClick={() => navigate(`/module/${m.id}`)}
                        className="w-full text-left bg-surface-1 hover:bg-surface-2 transition-all duration-[180ms] rounded-[24px] p-6"
                      >
                        <h4 className="font-serif text-[18px] text-foreground tracking-tight leading-[1.2]">{m.title}</h4>
                        <p className="text-[11px] font-sans text-ink-3 mt-2">
                          {m.completed_lessons} / {m.lesson_count} sessions · {pct}%
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
