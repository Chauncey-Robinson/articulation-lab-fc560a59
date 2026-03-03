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
      className="text-sm transition-colors"
      style={{ color: recording ? "#c00" : "hsl(var(--muted-foreground))" }}
    >
      {recording ? "⏹ Stop recording" : "🎤 Speak instead"}
    </button>
  );
}
