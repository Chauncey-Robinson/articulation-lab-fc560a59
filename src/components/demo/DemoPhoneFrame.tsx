import { motion } from "framer-motion";

/**
 * A lightweight iPhone-style frame for the demo page.
 * Shows content inside a phone outline at a fixed size.
 */
export default function DemoPhoneFrame({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const shellBg = dark
    ? "linear-gradient(145deg, #444, #222)"
    : "linear-gradient(145deg, #5A5A5A, #3A3A3A)";
  const screenBg = dark ? "hsl(var(--foreground))" : "hsl(var(--background))";

  return (
    <motion.div
      className={`relative select-none shrink-0 ${className}`}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 260,
        height: 540,
        borderRadius: 40,
        background: shellBg,
        boxShadow:
          "0 32px 64px rgba(17,16,9,0.18), 0 2px 8px rgba(17,16,9,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      {/* Gloss */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 40,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%)",
        }}
      />

      {/* Side buttons */}
      <div className="absolute" style={{ left: -2, top: 120, width: 2.5, height: 24, borderRadius: "2px 0 0 2px", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />
      <div className="absolute" style={{ left: -2, top: 155, width: 2.5, height: 24, borderRadius: "2px 0 0 2px", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />
      <div className="absolute" style={{ right: -2, top: 145, width: 2.5, height: 36, borderRadius: "0 2px 2px 0", background: "linear-gradient(180deg, #555, #3A3A3A)" }} />

      {/* Inner bezel */}
      <div
        className="absolute"
        style={{
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          borderRadius: 33,
          background: "#000",
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute z-20"
          style={{
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 26,
            borderRadius: 14,
            background: "#000",
          }}
        />

        {/* Screen */}
        <div
          className="absolute overflow-hidden flex flex-col"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 33,
            background: screenBg,
          }}
        >
          {/* Status bar */}
          <div
            className="flex items-end justify-between px-6 pb-0.5 shrink-0"
            style={{ height: 40, fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
          >
            <span className="text-[11px] font-semibold" style={{ color: dark ? "white" : "hsl(var(--foreground))" }}>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="13" height="10" viewBox="0 0 17 12" fill="none">
                <rect x="0" y="9" width="3" height="3" rx="0.5" fill={dark ? "white" : "hsl(40,50%,3%)"} />
                <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill={dark ? "white" : "hsl(40,50%,3%)"} />
                <rect x="9" y="3" width="3" height="9" rx="0.5" fill={dark ? "white" : "hsl(40,50%,3%)"} />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill={dark ? "white" : "hsl(40,50%,3%)"} />
              </svg>
              <svg width="20" height="10" viewBox="0 0 27 13" fill="none">
                <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke={dark ? "white" : "hsl(40,50%,3%)"} strokeOpacity="0.35" />
                <rect x="2" y="2" width="19" height="9" rx="1.5" fill={dark ? "white" : "hsl(40,50%,3%)"} />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-1.5 pt-0.5 shrink-0">
            <div
              className="rounded-full"
              style={{
                width: 100,
                height: 4,
                background: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
