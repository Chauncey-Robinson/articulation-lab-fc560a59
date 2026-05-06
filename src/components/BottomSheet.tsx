import { ReactNode, useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional max height in vh; default 90 */
  maxVh?: number;
}

/**
 * Bottom sheet with surface-1 background, 32px top radius, drag handle.
 * Drag down or tap backdrop to close.
 */
export default function BottomSheet({ open, onClose, children, maxVh = 90 }: BottomSheetProps) {
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setDrag(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current == null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDrag(dy);
  };
  const onPointerUp = () => {
    if (drag > 110) onClose();
    setDrag(0);
    startY.current = null;
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-[220ms] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-[220ms] ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute inset-x-0 bottom-0 bg-surface-1 rounded-t-[32px] shadow-[0_-12px_40px_-8px_rgba(20,15,10,0.18)] transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{
          transform: open ? `translateY(${drag}px)` : "translateY(100%)",
          maxHeight: `${maxVh}vh`,
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="block w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        <div className="overflow-y-auto px-6 pb-8" style={{ maxHeight: `calc(${maxVh}vh - 32px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
