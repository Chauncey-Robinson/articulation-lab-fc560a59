import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

function getStatusPill(status: string) {
  switch (status) {
    case "solid":
      return { label: "Solid", bgClass: "bg-sage text-white" };
    case "getting_there":
      return { label: "Getting there", bgClass: "bg-accent-pale text-accent" };
    default:
      return { label: "Practicing", bgClass: "bg-surface-2 text-ink-3" };
  }
}

export default function Library() {
  const navigate = useNavigate();
  const { concepts } = useApp();

  const today = new Date().toISOString().split("T")[0];

  const sorted = [...concepts].sort((a, b) =>
    a.next_practice_date.localeCompare(b.next_practice_date)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms] mb-6 self-start">
        ←
      </button>

      <div className="max-w-[640px] mx-auto w-full">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">Your library.</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-8 animate-fade-up stagger-2">
          Concepts you've trained. They come back at the right time.
        </p>

        {sorted.length === 0 && (
          <p className="text-[14px] font-sans text-ink-3 text-center py-10">
            Complete a session to start building your library.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((concept, idx) => {
            const pill = getStatusPill(concept.status);
            const isDue = concept.next_practice_date <= today;

            return (
              <div
                key={concept.id}
                className={`bg-card rounded-[22px] border-[1.5px] border-border p-6 hover:border-accent hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-[180ms] cursor-pointer animate-fade-up`}
                style={{ animationDelay: `${(idx + 2) * 65}ms` }}
                onClick={() => isDue ? navigate("/practice", {
                  state: {
                    source: concept.source_content,
                    conceptId: concept.id,
                    keyIdea: concept.key_idea,
                    practiceCount: concept.practice_count,
                  }
                }) : undefined}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-[20px] text-foreground leading-tight" style={{ maxWidth: "70%" }}>
                    {concept.topic_snippet}
                  </h3>
                  <span className={`text-[11px] font-sans font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-pill ${pill.bgClass}`}>
                    {pill.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px] font-sans text-ink-3 mb-3">
                  <span>{concept.practice_count} rep{concept.practice_count !== 1 ? "s" : ""}</span>
                  {concept.last_practiced && (
                    <span>
                      Last: {new Date(concept.last_practiced).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>

                {isDue ? (
                  <p className="text-[13px] font-sans text-accent font-medium">Ready now →</p>
                ) : (
                  <p className="text-[12px] font-sans text-ink-3">
                    Practice again on {new Date(concept.next_practice_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length > 0 && sorted.length < 3 && (
          <p className="text-[14px] font-sans text-ink-3 text-center py-8">
            Keep going. This gets more useful the more you add to it.
          </p>
        )}
      </div>
    </div>
  );
}
