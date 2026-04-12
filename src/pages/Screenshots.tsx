
const IPhoneShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 393, height: 852, borderRadius: 55, background: "linear-gradient(145deg, #5A5A5A, #3A3A3A)", boxShadow: "0 32px 64px rgba(17,16,9,0.14), 0 2px 8px rgba(17,16,9,0.06), 0 0 0 1px rgba(255,255,255,0.08) inset, inset 0 1px 0 rgba(255,255,255,0.15)", position: "relative" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 55, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", left: -2.5, top: 180, width: 3, height: 32, borderRadius: "2px 0 0 2px", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />
    <div style={{ position: "absolute", left: -2.5, top: 230, width: 3, height: 32, borderRadius: "2px 0 0 2px", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />
    <div style={{ position: "absolute", right: -2.5, top: 220, width: 3, height: 48, borderRadius: "0 2px 2px 0", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />
    <div style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 44, background: "#000" }}>
      <div style={{ position: "absolute", zIndex: 20, top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, borderRadius: 20, background: "#000" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 44, overflow: "hidden", background: "hsl(var(--background))", display: "flex", flexDirection: "column" }}>
        {/* Status bar */}
        <div style={{ height: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 32px 4px", fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="9" width="3" height="3" rx="0.5" fill="white" /><rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="white" /><rect x="9" y="3" width="3" height="9" rx="0.5" fill="white" /><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white" /></svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="white" /><path d="M4.93 7.76a4.5 4.5 0 016.14 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M2.34 5.17a7.5 7.5 0 0111.32 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M.1 2.75a10.5 10.5 0 0115.8 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="white" strokeOpacity="0.35" /><rect x="2" y="2" width="19" height="9" rx="1.5" fill="white" /><path d="M24 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" /></svg>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8, paddingTop: 4 }}>
          <div style={{ width: 134, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.9)" }} />
        </div>
      </div>
    </div>
  </div>
);

function LandingScreen() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontSize: "1.1rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", marginBottom: 24 }}>Fluency</p>
      <h1 style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontSize: "2.4rem", lineHeight: 1.1, letterSpacing: -1, color: "hsl(var(--foreground))", marginBottom: 16 }}>
        Learn anything.<br />Own it forever.
      </h1>
      <p style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)", fontSize: 15, color: "hsl(var(--ink-3))", marginBottom: 32, maxWidth: 340 }}>
        Paste anything you're learning. We coach you until you can explain it yourself.
      </p>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ width: "100%", borderRadius: 999, background: "hsl(var(--primary))", padding: "16px 0", fontSize: 13, fontWeight: 600, color: "hsl(var(--primary-foreground))", textAlign: "center" }}>
          Get started
        </div>
      </div>
      <div style={{ marginTop: 32, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          ["1.", "Paste a topic, article, or anything you want to know better."],
          ["2.", "Your AI coach breaks it down and asks you to explain it back."],
          ["3.", "You talk. We coach. You keep going until it clicks."],
        ].map(([num, text], i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ color: "hsl(var(--amber-bright))", fontSize: 16, marginTop: 2 }}>{num}</span>
            <p style={{ fontSize: 13, color: "hsl(var(--ink-3))", textAlign: "left" }}>{text}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "hsl(var(--ink-3))", marginTop: 24 }}>No account needed to start.</p>
    </div>
  );
}

export default function Screenshots() {
  return (
    <div style={{ background: "#1a1a1a", minHeight: "100vh", display: "flex", flexWrap: "wrap", gap: 48, padding: 48, justifyContent: "center", alignItems: "center" }}>
      <IPhoneShell><LandingScreen /></IPhoneShell>
    </div>
  );
}
