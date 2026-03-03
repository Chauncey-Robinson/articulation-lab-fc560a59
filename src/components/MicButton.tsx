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
      className="text-[13px] transition-colors"
      style={{ color: recording ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}
    >
      {recording ? "⏹ Stop" : "🎤 Say it instead"}
    </button>
  );
}
