"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { id: "source", label: "SOURCE", pos: 0.12 },
  { id: "behavior", label: "BEHAVIOR", pos: 0.36 },
  { id: "contract", label: "CONTRACT", pos: 0.62 },
  { id: "knowledge", label: "KNOWLEDGE", pos: 0.88 },
];

export function DiagnosticSpine() {
  const [scrollFraction, setScrollFraction] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalDoc = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = totalDoc > 0 ? Math.min(Math.max(scrollY / totalDoc, 0), 1) : 0;
      setScrollFraction(fraction);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-24 bottom-16 right-4 sm:right-[12vw] z-30 pointer-events-none flex flex-col items-center select-none"
      aria-hidden="true"
    >
      {/* 1px Vertical Track Line */}
      <div className="relative w-[1px] h-full bg-[#282823]">
        {/* Active Traveling Oxide Marker */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#D8663D] transition-transform duration-75 ease-out"
          style={{
            top: `${scrollFraction * 100}%`,
          }}
        />

        {/* Diagnostic Stage Milestone Markers */}
        {STAGES.map((st) => {
          const isPassed = scrollFraction >= st.pos - 0.05;
          return (
            <div
              key={st.id}
              className="absolute left-0 -translate-y-1/2 flex items-center"
              style={{ top: `${st.pos * 100}%` }}
            >
              {/* Horizontal tick line */}
              <div
                className={`w-2.5 h-[1px] transition-colors ${
                  isPassed ? "bg-[#D8663D]" : "bg-[#282823]"
                }`}
              />
              {/* Monospace label */}
              <span
                className={`hidden lg:inline-block ml-2 text-[9px] font-mono-tech uppercase tracking-[0.14em] transition-colors ${
                  isPassed ? "text-[#EDE9DF]" : "text-[#66655E]"
                }`}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
