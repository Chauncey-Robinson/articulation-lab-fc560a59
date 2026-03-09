import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MicButton from "@/components/MicButton";

export default function Landing() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    // Check if user is signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Store input for after auth
      sessionStorage.setItem("pending_source", text);
      navigate("/signin");
      return;
    }
    // User is signed in — go to practice
    navigate("/practice", { state: { source: text } });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-10 bg-surface-light">
      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent text-center mb-4">
          KNOW IT. SAY IT.
        </p>

        <h1 className="font-serif text-[2.2rem] leading-[1.2] text-foreground text-center mb-3 whitespace-pre-line">
          {"You know more than\nyou can explain."}
        </h1>

        <p className="text-sm text-muted-foreground text-center mb-8">
          Practice explaining ideas until they stick.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste something you want to be able to explain — an article, meeting notes, a concept from a course."}
          className="w-full min-h-[160px] rounded-lg border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-selected-border resize-y mb-2"
        />

        <p className="text-xs text-muted-foreground text-center mb-4">
          Takes about 5 minutes. Your content stays private.
        </p>

        <div className="mb-6">
          <MicButton onTranscript={(t) => setText(t)} />
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 mb-4 text-[13px]" style={{ background: "#FFF8F5", border: "1px solid hsl(var(--block-low))", color: "#C05050" }}>
            {error}
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={handleStart}
            disabled={text.trim().length < 20}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start practicing
          </button>

          <p className="text-[10px] text-legal text-center mt-5">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
