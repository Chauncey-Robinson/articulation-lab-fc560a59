import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

function getStatusPill(status: string) {
  switch (status) {
    case "solid":
      return { label: "Solid", bg: "hsl(var(--block-high))", text: "#FFFFFF" };
    case "getting_there":
      return { label: "Getting there", bg: "hsl(var(--block-mid))", text: "hsl(var(--foreground))" };
    default:
      return { label: "Practicing", bg: "hsl(var(--border))", text: "hsl(var(--foreground))" };
  }
}

export default function Library() {
  const navigate = useNavigate();
  const { concepts } = useApp();
  const { speak } = useTTS();

  const today = new Date().toISOString().split("T")[0];

  // Sort by next_practice_date ascending
  const sorted = [...concepts].sort((a, b) =>
    a.next_practice_date.localeCompare(b.next_practice_date)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate(-1)} className="text-base text-muted-foreground hover:text-foreground mb-6 self-start">
        ←
      </button>

      <div className="max-w-[460px] mx-auto w-full">
        <h1 className="font-serif text-[1.6rem] text-foreground mb-2">Your explanations.</h1>
        <p className="text-[13px] text-muted-foreground mb-6">
          Every time you practice, we save the clearest thing you said. This is yours.
        </p>

        {sorted.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            Complete a practice to start building your library.
          </p>
        )}

        {sorted.map((concept) => {
          const pill = getStatusPill(concept.status);
          const isDue = concept.next_practice_date <= today;

          return (
            <div key={concept.id} className="rounded-lg bg-card p-5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground" style={{ maxWidth: "65%" }}>
                  {concept.topic_snippet}
                </p>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: pill.bg, color: pill.text }}
                >
                  {pill.label}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                Practiced {concept.practice_count} time{concept.practice_count !== 1 ? "s" : ""}
              </p>

              {isDue ? (
                <button
                  onClick={() => navigate("/practice", {
                    state: {
                      source: concept.source_content,
                      conceptId: concept.id,
                      keyIdea: concept.key_idea,
                      practiceCount: concept.practice_count,
                    }
                  })}
                  className="text-xs text-accent underline"
                >
                  Ready now →
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Practice again on {new Date(concept.next_practice_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          );
        })}

        {sorted.length > 0 && sorted.length < 3 && (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            Keep practising — this gets more useful the more you add to it.
          </p>
        )}
      </div>
    </div>
  );
}
