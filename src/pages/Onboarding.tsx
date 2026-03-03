import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";

const options = ["MBA", "Consulting", "Strategy", "Legal", "Policy", "Other"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setContext } = useApp();

  const handleSelect = (option: string) => {
    setContext(option);
    navigate("/input");
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
        Step 1 of 1
      </p>
      <h1 className="font-serif text-2xl text-foreground mb-8">
        What are you preparing for?
      </h1>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className="w-full text-left px-5 py-4 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary hover:bg-accent transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
