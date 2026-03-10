import { useSTT } from "@/hooks/useSpeech";

interface MicButtonProps {
  onTranscript: (text: string) => void;
}

export default function MicButton({ onTranscript }: MicButtonProps) {
  const { recording, start, stop, supported } = useSTT(onTranscript);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      className="text-[13px] font-sans transition-colors duration-[180ms]"
      style={{ color: recording ? "hsl(var(--accent))" : "hsl(var(--ink-3))" }}
    >
      {recording ? "⏹ Stop" : "🎤 Say it instead"}
    </button>
  );
}
