import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

export default function Privacy() {
  const navigate = useNavigate();
  const { setPrivacyMode } = useApp();
  const [selected, setSelected] = useState<"improve" | "private">("private");

  const handleContinue = () => {
    setPrivacyMode(selected);
    navigate("/trial");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
        <div className="flex-1 h-[2px] rounded-full bg-primary" />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="text-base text-muted-foreground hover:text-foreground mb-8 self-start"
      >
        ←
      </button>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col items-center">
        <h1 className="font-serif text-[1.8rem] text-foreground text-center mb-0 whitespace-pre-line" style={{ lineHeight: 1.3 }}>
          {"Your ideas\nstay yours."}
        </h1>

        <div className="flex flex-col gap-3 w-full mt-7">
          <button
            onClick={() => setSelected("improve")}
            className="w-full text-left rounded-2xl p-5 transition-colors"
            style={{
              background: selected === "improve" ? "hsl(var(--selected))" : "hsl(var(--card))",
              borderColor: selected === "improve" ? "hsl(var(--selected-border))" : "hsl(var(--border))",
              borderWidth: selected === "improve" ? "1.5px" : "1px",
              borderStyle: "solid",
            }}
          >
            <p className="text-sm font-medium text-foreground mb-1">Help make this better</p>
            <p className="text-[13px] text-muted-foreground leading-[1.5]">
              Your practices help improve the coaching for everyone who uses this.
            </p>
          </button>

          <button
            onClick={() => setSelected("private")}
            className="w-full text-left rounded-2xl p-5 transition-colors relative"
            style={{
              background: selected === "private" ? "hsl(var(--selected))" : "hsl(var(--card))",
              borderColor: selected === "private" ? "hsl(var(--selected-border))" : "hsl(var(--border))",
              borderWidth: selected === "private" ? "1.5px" : "1px",
              borderStyle: "solid",
            }}
          >
            <span className="absolute top-4 right-4 text-[13px]">🔒</span>
            <p className="text-sm font-medium text-foreground mb-1">Keep everything private</p>
            <p className="text-[13px] text-muted-foreground leading-[1.5]">
              Nothing you paste or say is ever stored, shared, or used to train anything. Ever.
            </p>
          </button>
        </div>

        <div className="mt-auto w-full">
          <button
            onClick={handleContinue}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
