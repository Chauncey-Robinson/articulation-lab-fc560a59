import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    tagline: "Try one full session",
    cta: "Start free",
    ctaStyle: "outline" as const,
    badge: null,
    features: [
      { text: "1 coaching session", included: true },
      { text: "1 content upload", included: true },
      { text: "AI-generated key insight", included: true },
      { text: "Unlimited sessions", included: false },
      { text: "Unlimited uploads", included: false },
      { text: "Real-life application prompts", included: false },
      { text: "Session history & library", included: false },
      { text: "Spaced return reminders", included: false },
    ],
    teamOnly: undefined as string[] | undefined,
  },
  {
    name: "Pro",
    price: { monthly: 14.99, annual: 9.99 },
    tagline: "For professionals who apply what they know",
    cta: "Start 7-day trial",
    ctaStyle: "filled" as const,
    badge: "Most popular",
    features: [
      { text: "1 coaching session", included: true },
      { text: "1 content upload", included: true },
      { text: "AI-generated key insight", included: true },
      { text: "Unlimited sessions", included: true },
      { text: "Unlimited uploads", included: true },
      { text: "Real-life application prompts", included: true },
      { text: "Session history & library", included: true },
      { text: "Spaced return reminders", included: true },
    ],
    teamOnly: undefined as string[] | undefined,
  },
  {
    name: "Teams",
    price: { monthly: 12, annual: 9 },
    tagline: "Per seat. For firms investing in their people.",
    cta: "Contact us",
    ctaStyle: "outline" as const,
    badge: "Min. 5 seats",
    features: [
      { text: "1 coaching session", included: true },
      { text: "1 content upload", included: true },
      { text: "AI-generated key insight", included: true },
      { text: "Unlimited sessions", included: true },
      { text: "Unlimited uploads", included: true },
      { text: "Real-life application prompts", included: true },
      { text: "Session history & library", included: true },
      { text: "Spaced return reminders", included: true },
    ],
    teamOnly: [
      "Admin dashboard",
      "Usage analytics",
      "Shared content library",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-10 max-w-lg">
        <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">
          Pricing
        </p>

        <h1 className="font-serif text-4xl md:text-5xl leading-[1.08] tracking-tight text-foreground mb-4">
          You know more than<br />you can explain.
        </h1>

        <p className="font-sans text-sm text-ink-3">
          Pay monthly or save with an annual plan.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center bg-muted rounded-pill p-1 mt-6">
          {["Monthly", "Annual"].map((label) => {
            const isActive = (label === "Annual") === annual;
            return (
              <button
                key={label}
                onClick={() => setAnnual(label === "Annual")}
                className={`px-5 py-2 rounded-pill border-none cursor-pointer text-[13px] font-sans font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-ink-3"
                }`}
              >
                {label}
                {label === "Annual" && (
                  <span className="ml-1.5 text-[10px] font-semibold text-accent-bright">
                    −33%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-5 w-full max-w-4xl items-stretch">
        {plans.map((plan) => {
          const isPro = plan.name === "Pro";
          const price = annual ? plan.price.annual : plan.price.monthly;

          return (
            <div
              key={plan.name}
              className={`flex-1 rounded-2xl p-7 flex flex-col relative transition-shadow duration-300 ${
                isPro
                  ? "bg-card border-2 border-accent shadow-card-hover"
                  : "bg-card border border-border"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-6 px-3 py-1 rounded-pill text-[11px] font-sans font-semibold ${
                    isPro
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-ink-3"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <h2 className="font-serif text-2xl text-foreground mt-2 mb-1">
                {plan.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                {price === 0 ? (
                  <span className="font-sans text-3xl font-semibold text-foreground">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="font-sans text-3xl font-semibold text-foreground">
                      ${price.toFixed(2)}
                    </span>
                    <span className="font-sans text-sm text-ink-3">/mo</span>
                  </>
                )}
              </div>

              {/* Annual note */}
              {annual && price > 0 && (
                <p className="font-sans text-xs text-ink-3 mb-1">
                  Billed ${(price * 12).toFixed(0)}/year
                </p>
              )}

              {/* Tagline */}
              <p className="font-sans text-sm text-ink-3 mb-5">
                {plan.tagline}
              </p>

              {/* Divider */}
              <div className="h-px bg-border mb-5" />

              {/* Features */}
              <div className="flex flex-col gap-3 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {f.included ? (
                      <Check className="w-4 h-4 text-sage flex-shrink-0" />
                    ) : (
                      <Minus className="w-4 h-4 text-border-strong flex-shrink-0" />
                    )}
                    <span
                      className={`font-sans text-[13px] ${
                        f.included ? "text-foreground" : "text-ink-3"
                      }`}
                    >
                      {f.text}
                    </span>
                  </div>
                ))}

                {/* Teams extras */}
                {plan.teamOnly && (
                  <>
                    <div className="h-px bg-border my-1" />
                    {plan.teamOnly.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="font-sans text-[13px] font-medium text-foreground">
                          {f}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (plan.name === "Teams") {
                    // Could open mailto or contact form
                  } else {
                    navigate("/signin");
                  }
                }}
                className={`w-full py-3.5 rounded-pill font-sans text-[13px] font-semibold cursor-pointer transition-all duration-200 ${
                  isPro
                    ? "bg-accent text-accent-foreground hover:opacity-90 border-none"
                    : "bg-transparent text-foreground border-2 border-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="font-sans text-xs text-ink-3 mt-10 text-center">
        No card required for the free session. Cancel anytime.
      </p>
    </div>
  );
}
