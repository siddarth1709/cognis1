"use client";

import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { id: "code", label: "CODE", speed: 1.6, lag: false },
  { id: "behavior", label: "BEHAVIOR", speed: 1.2, lag: false },
  { id: "contract", label: "CONTRACT", speed: 0.8, lag: false },
  { id: "doc", label: "DOCUMENTATION", speed: -0.9, lag: true },
  { id: "agent", label: "AGENT", speed: -1.3, lag: true },
];

export function GapScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / (windowH * 1.5), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDiverged = scrollProgress > 0.35;
  const isCompressed = scrollProgress > 0.82;

  return (
    <section
      id="problem"
      ref={containerRef}
      className="relative w-full h-[220vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Top Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            01 // THE PROBLEM
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans max-w-[760px]">
            Your code moved.
            <br />
            Your knowledge stayed.
          </h2>
        </div>

        {/* 5 Horizontal Tracks Sequence */}
        <div className="w-full max-w-[900px] my-auto py-8">
          {!isCompressed ? (
            <div className="space-y-6">
              {TRACKS.map((t) => {
                const shift = scrollProgress * t.speed * 80;
                return (
                  <div key={t.id} className="relative">
                    <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#66655E] mb-2">
                      <span
                        className={`transition-colors ${
                          t.lag ? "text-[#B84A3A]" : "text-[#EDE9DF]"
                        }`}
                        style={{
                          transform: `translate3d(${shift}px, 0, 0)`,
                          transition: "transform 100ms ease-out",
                        }}
                      >
                        {t.label}
                      </span>
                      <span className="text-[10px] text-[#282823]">
                        {t.lag ? "LAG DETECTED" : "ADVANCED"}
                      </span>
                    </div>

                    {/* Thin Horizontal Track Line */}
                    <div className="relative w-full h-[1px] bg-[#282823] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${
                          t.lag ? "bg-[#B84A3A]/60" : "bg-[#D8663D]"
                        }`}
                        style={{
                          width: `${Math.min(Math.max(40 + shift, 10), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Broken Oxide Connection between Reality & Knowledge */}
              {isDiverged && (
                <div className="pt-8 flex items-center justify-between border-t border-dashed border-[#B84A3A]/40 transition-opacity duration-300">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#B84A3A]" />
                    <span className="text-[10px] font-mono-tech text-[#B84A3A] uppercase tracking-[0.16em]">
                      REALITY ↮ KNOWLEDGE CONNECTION BROKEN
                    </span>
                  </div>

                  {/* Huge Quiet Label */}
                  <div className="text-[28px] sm:text-[42px] font-mono-tech uppercase tracking-[0.08em] text-[#EDE9DF] font-medium animate-pulse">
                    KNOWLEDGE DRIFT
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Compressed single line: THE CONTRACT */
            <div className="p-8 border border-[#282823] bg-[#141411] transition-all duration-500">
              <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] mb-2">
                SYNTHESIS REDUCTION
              </div>
              <div className="text-[24px] sm:text-[32px] font-sans text-[#EDE9DF] font-medium flex items-center justify-between">
                <span>THE CONTRACT</span>
                <span className="text-[12px] font-mono-tech text-[#D8663D]">
                  INVARIANT TARGET
                </span>
              </div>
              <div className="w-full h-[1px] bg-[#D8663D] mt-4" />
            </div>
          )}
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>INVARIANT DRIFT INDEX: {(scrollProgress * 2.4).toFixed(2)}x</span>
          <span>COMPRESSION: {isCompressed ? "COMPLETE" : "EXPANDING"}</span>
        </div>
      </div>
    </section>
  );
}
