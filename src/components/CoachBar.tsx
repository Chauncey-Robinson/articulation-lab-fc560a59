import { useState } from "react";
import { Mic, Keyboard, ArrowUp, Square } from "lucide-react";
import { useSTT } from "@/hooks/useSpeech";

interface CoachBarProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

/**
 * Mic-first coach bar. Mic is the primary action.
 * Text input appears only after the user taps the secondary "type instead" link below.
 */
export default function CoachBar({ onSubmit, placeholder = "Tap to speak" }: CoachBarProps) {
  const [text, setText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { recording, start, stop, supported } = useSTT((t) => setText(t));

  const send = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
      <div className="max-w-[560px] mx-auto pointer-events-auto flex flex-col items-center gap-3">
        {/* Primary: large mic in glass pill */}
        {!showInput && (
          <button
            type="button"
            onClick={() => (recording ? stop() : supported && start())}
            aria-label={recording ? "Stop recording" : "Start speaking"}
            className="glass rounded-pill px-8 py-4 flex items-center gap-4 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                recording ? "bg-foreground animate-pulse" : "bg-primary"
              }`}
            >
              {recording ? (
                <Square className="w-4 h-4 text-background" strokeWidth={2} fill="currentColor" />
              ) : (
                <Mic className="w-5 h-5 text-primary-foreground" strokeWidth={1.75} />
              )}
            </span>
            <span className="text-[14px] font-sans text-foreground pr-2">
              {recording ? "Listening…" : text || placeholder}
            </span>
          </button>
        )}

        {/* Text mode (revealed after tapping secondary action) */}
        {showInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="glass w-full rounded-pill pl-5 pr-2 py-2 flex items-center gap-3"
          >
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer…"
              className="flex-1 bg-transparent text-[14px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none py-2"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 active:scale-95 transition-all disabled:opacity-30 shrink-0"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2} />
            </button>
          </form>
        )}

        {/* Secondary toggle */}
        <button
          type="button"
          onClick={() => {
            if (recording) stop();
            setShowInput((v) => !v);
          }}
          className="text-[11px] font-sans text-ink-3 hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <Keyboard className="w-3 h-3" strokeWidth={1.75} />
          {showInput ? "Use mic instead" : "Type instead"}
        </button>

        {/* Send-after-speech action */}
        {!showInput && text && !recording && (
          <button
            type="button"
            onClick={send}
            className="rounded-pill bg-primary px-5 py-2 text-[12px] font-sans font-medium text-primary-foreground hover:opacity-95 transition-all"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
