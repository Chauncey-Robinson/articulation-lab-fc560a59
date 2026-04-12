
export default function Screenshots() {
  return (
    <div style={{ background: "#1a1a1a", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 48 }}>
      <div style={{ width: 393, height: 852, borderRadius: 55, background: "linear-gradient(145deg, #5A5A5A, #3A3A3A)", boxShadow: "0 32px 64px rgba(17,16,9,0.14)", position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 44, background: "#000" }}>
          <div style={{ position: "absolute", zIndex: 20, top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, borderRadius: 20, background: "#000" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 44, overflow: "hidden", background: "#F8F5EF", display: "flex", flexDirection: "column" }}>
            {/* Status bar */}
            <div style={{ height: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 32px 4px", fontFamily: "-apple-system, system-ui, sans-serif" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>9:41</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="9" width="3" height="3" rx="0.5" fill="#000" /><rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="#000" /><rect x="9" y="3" width="3" height="9" rx="0.5" fill="#000" /><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#000" /></svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="#000" /><path d="M4.93 7.76a4.5 4.5 0 016.14 0" stroke="#000" strokeWidth="1.4" strokeLinecap="round" /><path d="M2.34 5.17a7.5 7.5 0 0111.32 0" stroke="#000" strokeWidth="1.4" strokeLinecap="round" /></svg>
                <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="#000" strokeOpacity="0.35" /><rect x="2" y="2" width="19" height="9" rx="1.5" fill="#000" /></svg>
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ flex: 1, overflow: "hidden", padding: "8px 20px 0" }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>Good morning, Alex.</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 56, fontFamily: "'Instrument Serif', Georgia, serif", color: "#1a1a1a", lineHeight: 1 }}>7</span>
                </div>
                <p style={{ fontSize: 12, color: "#999", fontFamily: "system-ui, sans-serif" }}>Day streak. Nice.</p>
              </div>

              {/* Week dots */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 999, background: i < 5 ? "#C87941" : "#E8E4DD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i < 5 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <span style={{ fontSize: 10, color: "#999", fontFamily: "system-ui" }}>{d}</span>
                  </div>
                ))}
              </div>

              {/* Active module card */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #E8E4DD", padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(200,121,65,0.12)", color: "#C87941", fontFamily: "system-ui" }}>Rep 3</span>
                  <span style={{ fontSize: 10, color: "#999", fontFamily: "system-ui" }}>GRI Standards</span>
                </div>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 15, color: "#444", marginBottom: 6 }}>Materiality assessment determines which ESG topics matter most...</p>
                <p style={{ fontSize: 12, color: "#C87941", fontWeight: 500, fontFamily: "system-ui" }}>Pick up where you left off →</p>
              </div>

              {/* Second card */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #E8E4DD", padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(200,121,65,0.12)", color: "#C87941", fontFamily: "system-ui" }}>Rep 1</span>
                  <span style={{ fontSize: 10, color: "#999", fontFamily: "system-ui" }}>Atomic Habits</span>
                </div>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 15, color: "#444", marginBottom: 6 }}>Identity-based habits focus on who you wish to become...</p>
                <p style={{ fontSize: 12, color: "#C87941", fontWeight: 500, fontFamily: "system-ui" }}>Pick up where you left off →</p>
              </div>

              {/* Third card */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #E8E4DD", padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(200,121,65,0.12)", color: "#C87941", fontFamily: "system-ui" }}>Rep 5</span>
                  <span style={{ fontSize: 10, color: "#999", fontFamily: "system-ui" }}>IFRS 15</span>
                </div>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 15, color: "#444", marginBottom: 6 }}>Revenue is recognized when control transfers to the customer...</p>
                <p style={{ fontSize: 12, color: "#C87941", fontWeight: 500, fontFamily: "system-ui" }}>Pick up where you left off →</p>
              </div>

              {/* New session button */}
              <div style={{ background: "#1a1a1a", borderRadius: 999, padding: "14px 0", textAlign: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F8F5EF", fontFamily: "system-ui" }}>New session</span>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                <span style={{ fontSize: 12, color: "#999", fontFamily: "system-ui" }}>Library</span>
                <span style={{ fontSize: 12, color: "#999", fontFamily: "system-ui" }}>Progress</span>
              </div>
            </div>

            {/* Home indicator */}
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8, paddingTop: 4 }}>
              <div style={{ width: 134, height: 5, borderRadius: 999, background: "rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
