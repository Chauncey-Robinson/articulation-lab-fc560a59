import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();

  const handleAllow = async () => {
    try {
      await Notification.requestPermission();
    } catch {}
    navigate("/summary");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-[460px] w-full text-center">
        <h1 className="font-serif text-[1.6rem] text-foreground mb-8" style={{ lineHeight: 1.3 }}>
          {"Stay sharp\nevery day."}
        </h1>

        <div className="flex flex-col gap-4 text-left mb-8 mx-auto max-w-[340px]">
          {[
            "A 5-minute reminder at your best time of day",
            "Weekly summary of how your thinking is improving",
            "A nudge before you break your streak",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span className="text-[13px] text-foreground">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleAllow}
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity mb-3"
        >
          Allow notifications
        </button>
        <button
          onClick={() => navigate("/summary")}
          className="text-[13px] text-muted-foreground hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
