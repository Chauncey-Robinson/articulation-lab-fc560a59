import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useTTS } from "@/hooks/useSpeech";

export default function Library() {
  const navigate = useNavigate();
  const { sessions, totalPractices } = useApp();
  const { speak } = useTTS();

  const sorted = [...sessions].reverse();

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

        {sorted.map((s, i) => (
          <div key={i} className="rounded-lg bg-card p-5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-muted-foreground" style={{ maxWidth: "60%" }}>
                {s.topic_snippet?.slice(0, 50)}
              </p>
              <p className="text-[11px] text-legal">{s.date}</p>
            </div>
            <p className="text-sm italic leading-[1.6] mt-2" style={{ color: "hsl(var(--meeting-text))" }}>
              "{s.say_tomorrow}"
            </p>
            <button
              onClick={() => speak(s.say_tomorrow)}
              className="text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              ↺
            </button>
          </div>
        ))}

        {totalPractices < 3 && (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            Keep practising — this gets more useful the more you add to it.
          </p>
        )}
      </div>
    </div>
  );
}
