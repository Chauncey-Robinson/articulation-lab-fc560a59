import { useIsMobile } from "@/hooks/use-mobile";

function StatusBar() {
  return (
    <div
      className="flex items-end justify-between px-8 pb-1"
      style={{ height: 54, fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
    >
      <span className="text-[15px] font-semibold text-white">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="9" width="3" height="3" rx="0.5" fill="white" />
          <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="white" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" fill="white" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="white" />
          <path d="M4.93 7.76a4.5 4.5 0 016.14 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M2.34 5.17a7.5 7.5 0 0111.32 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M.1 2.75a10.5 10.5 0 0115.8 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="white" strokeOpacity="0.35" />
          <rect x="2" y="2" width="19" height="9" rx="1.5" fill="white" />
          <path d="M24 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="flex justify-center pb-2 pt-1">
      <div className="rounded-full bg-white/90" style={{ width: 134, height: 5 }} />
    </div>
  );
}

export default function IPhoneFrame({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  // On small screens, render app full-screen without frame
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(145deg, #1A1A1A, #111111)" }}
    >
      {/* Outer shell */}
      <div
        className="relative"
        style={{
          width: 393,
          height: 852,
          borderRadius: 55,
          background: "linear-gradient(145deg, #5A5A5A, #3A3A3A)",
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.08) inset,
            0 40px 80px -20px rgba(0,0,0,0.6),
            0 0 40px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.15)
          `,
        }}
      >
        {/* Subtle gloss reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 55,
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
          }}
        />

        {/* Side buttons — left: volume */}
        <div
          className="absolute"
          style={{
            left: -2.5,
            top: 180,
            width: 3,
            height: 32,
            borderRadius: "2px 0 0 2px",
            background: "linear-gradient(180deg, #555, #3A3A3A)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: -2.5,
            top: 230,
            width: 3,
            height: 32,
            borderRadius: "2px 0 0 2px",
            background: "linear-gradient(180deg, #555, #3A3A3A)",
          }}
        />
        {/* Side button — right: power */}
        <div
          className="absolute"
          style={{
            right: -2.5,
            top: 220,
            width: 3,
            height: 48,
            borderRadius: "0 2px 2px 0",
            background: "linear-gradient(180deg, #555, #3A3A3A)",
          }}
        />

        {/* Inner bezel */}
        <div
          className="absolute"
          style={{
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            borderRadius: 44,
            background: "#000",
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute z-20"
            style={{
              top: 11,
              left: "50%",
              transform: "translateX(-50%)",
              width: 126,
              height: 37,
              borderRadius: 20,
              background: "#000",
            }}
          />

          {/* Screen area */}
          <div
            className="absolute overflow-hidden flex flex-col"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 44,
              background: "hsl(var(--background))",
            }}
          >
            {/* Status bar */}
            <StatusBar />

            {/* App content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {children}
            </div>

            {/* Home indicator */}
            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}
