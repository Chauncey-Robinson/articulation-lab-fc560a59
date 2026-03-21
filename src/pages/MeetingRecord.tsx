import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useScribe } from "@elevenlabs/react";
import { toast } from "sonner";

export default function MeetingRecord() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetingType, setMeetingType] = useState<"meeting" | "conference" | "lecture">("meeting");
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [transcriptChunks, setTranscriptChunks] = useState<Array<{ id: string; text: string; speaker?: string }>>([]);
  const [partialText, setPartialText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: "vad",
    onPartialTranscript: (data) => {
      setPartialText(data.text);
    },
    onCommittedTranscript: (data) => {
      setTranscriptChunks((prev) => [...prev, { id: crypto.randomUUID(), text: data.text }]);
      setPartialText("");
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcriptChunks, partialText]);

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    if (!user) return;

    try {
      // Create meeting record
      const { data: meeting, error: meetingErr } = await supabase
        .from("meetings")
        .insert({ user_id: user.id, meeting_type: meetingType, title: `${meetingType.charAt(0).toUpperCase() + meetingType.slice(1)} – ${new Date().toLocaleDateString()}` } as any)
        .select()
        .single();

      if (meetingErr) throw meetingErr;
      setMeetingId((meeting as any).id);

      // Get scribe token
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke("elevenlabs-scribe-token");
      if (tokenErr || !tokenData?.token) throw new Error("Failed to get transcription token");

      await scribe.connect({
        token: tokenData.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setIsRecording(true);
      setDuration(0);
      toast.success("Recording started");
    } catch (e) {
      console.error("Start recording error:", e);
      toast.error("Failed to start recording");
    }
  }, [user, meetingType, scribe]);

  const stopRecording = useCallback(async () => {
    scribe.disconnect();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const fullTranscript = transcriptChunks.map((c) => c.text).join(" ");

    if (meetingId && fullTranscript.trim()) {
      // Save transcript
      await supabase
        .from("meetings")
        .update({ transcript: fullTranscript, status: "processing", duration_seconds: duration, ended_at: new Date().toISOString() } as any)
        .eq("id", meetingId);

      toast.info("Processing your meeting...");

      // Generate summary
      try {
        const { data: summary, error: summaryErr } = await supabase.functions.invoke("meeting-summary", {
          body: { transcript: fullTranscript, meetingType },
        });

        if (summaryErr) throw summaryErr;

        await supabase
          .from("meetings")
          .update({
            title: summary.title || `${meetingType} notes`,
            summary: summary.summary,
            action_items: summary.action_items,
            key_learnings: summary.key_learnings,
            status: "completed",
          } as any)
          .eq("id", meetingId);

        toast.success("Meeting processed!");
        navigate(`/meeting/${meetingId}`);
      } catch (e) {
        console.error("Summary error:", e);
        await supabase.from("meetings").update({ status: "completed" } as any).eq("id", meetingId);
        toast.error("Summary generation failed, but transcript is saved");
        navigate(`/meeting/${meetingId}`);
      }
    } else {
      toast("No transcript captured");
      navigate("/dashboard");
    }
  }, [scribe, transcriptChunks, meetingId, duration, meetingType, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-24">
      <div className="max-w-[460px] mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/dashboard")} className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors">
            ← Back
          </button>
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-[13px] font-sans font-medium text-foreground">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {!isRecording && transcriptChunks.length === 0 ? (
          /* Pre-recording UI */
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="font-serif text-[1.75rem] text-foreground text-center mb-2">Meeting Mode</h1>
            <p className="text-[14px] font-sans text-ink-3 text-center mb-8">
              Capture, transcribe, and learn from any live session.
            </p>

            {/* Type selector */}
            <div className="flex gap-2 mb-8">
              {(["meeting", "conference", "lecture"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMeetingType(t)}
                  className={`px-4 py-2 rounded-pill text-[13px] font-sans font-medium transition-all duration-[180ms] border-[1.5px] ${
                    meetingType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-ink-3 border-border hover:border-accent"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Start button */}
            <button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-destructive flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
            <p className="text-[12px] font-sans text-ink-3 mt-3">Tap to start recording</p>
          </div>
        ) : (
          /* Recording UI */
          <div className="flex-1 flex flex-col">
            <h2 className="font-serif text-[1.25rem] text-foreground mb-3">Live Transcript</h2>

            {/* Transcript view */}
            <div
              ref={scrollRef}
              className="flex-1 bg-card rounded-[16px] border-[1.5px] border-border p-4 overflow-y-auto mb-4"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              {transcriptChunks.length === 0 && !partialText && (
                <p className="text-[13px] font-sans text-ink-3 italic">Listening...</p>
              )}
              {transcriptChunks.map((chunk) => (
                <p key={chunk.id} className="text-[14px] font-sans text-foreground mb-2 leading-relaxed">
                  {chunk.text}
                </p>
              ))}
              {partialText && (
                <p className="text-[14px] font-sans text-ink-3 italic mb-2">{partialText}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <button
                onClick={stopRecording}
                className="px-8 py-3 rounded-pill bg-destructive text-[13px] font-sans font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span className="w-3 h-3 bg-white rounded-sm" />
                Stop & Process
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
