"use client";

import { useEffect, useState } from "react";

export function IndustrialCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hoverType, setHoverType] = useState<"none" | "evidence" | "contract">("none");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reducedMotion) return;

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("[data-cursor='evidence']")) {
        setHoverType("evidence");
      } else if (target.closest("[data-cursor='contract']")) {
        setHoverType("contract");
      } else {
        setHoverType("none");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!enabled || hoverType === "none") return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-transform duration-75 ease-out"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      {hoverType === "evidence" && (
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* Micro Oxide Crosshair */}
          <div className="w-3 h-3 relative">
            <div className="absolute top-1.5 left-0 w-3 h-[1px] bg-[#D8663D]" />
            <div className="absolute left-1.5 top-0 w-[1px] h-3 bg-[#D8663D]" />
          </div>
        </div>
      )}

      {hoverType === "contract" && (
        <div className="translate-x-3 translate-y-3">
          <span className="px-1.5 py-0.5 bg-[#1C1C17] border border-[#393832] text-[9px] font-mono-tech text-[#D8663D] uppercase tracking-wider">
            INSPECT
          </span>
        </div>
      )}
    </div>
  );
}
