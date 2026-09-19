"use client";

import { useEffect, useRef, useState } from "react";

const SURFACES = [
  "HTML",
  "MARKDOWN",
  "JSON",
  "JSON-LD",
  "SEARCH",
  "AGENT",
  "MCP",
];

const LOOP_STEPS = [
  "OBSERVE",
  "UNDERSTAND",
  "REASON",
  "CHALLENGE",
  "HEAL",
  "VERIFY",
  "REALITY",
];

export function OneTruthScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / (windowH * 2), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeSurfaceCount = Math.min(Math.floor(scrollProgress * 10), 7);
  const loopActiveIdx = Math.min(Math.floor((scrollProgress - 0.4) * 12), 6);

  return (
    <section
      id="architecture"
      ref={containerRef}
      className="relative w-full h-[260vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            07 // UNIVERSAL PROJECTION
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans">
            One contract.
            <br />
            Every surface.
          </h2>
        </div>

        {/* Diagnostic Tree & Closed Loop Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-auto w-full max-w-[1000px]">
          {/* Left: Contract to Surfaces Tree */}
          <div className="font-mono-tech text-[13px] space-y-3">
            <div className="flex items-center gap-3 text-[#EDE9DF] font-semibold text-[15px] pb-2 border-b border-[#282823]">
              <span className="w-2 h-2 bg-[#D8663D]" />
              <span>CANONICAL CONTRACT</span>
            </div>

            <div className="pl-5 space-y-2 border-l border-[#282823]">
              {SURFACES.map((surf, idx) => {
                const isActive = activeSurfaceCount >= idx + 1;
                return (
                  <div
                    key={surf}
                    className={`flex items-center justify-between transition-colors duration-200 ${
                      isActive ? "text-[#EDE9DF]" : "text-[#393832]"
                    }`}
                  >
                    <span>├── {surf}</span>
                    <span className={isActive ? "text-[#9AA68A] text-[11px]" : "text-[#282823] text-[11px]"}>
                      {isActive ? "SYNCHRONIZED" : "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>

            {activeSurfaceCount >= 7 && (
              <div className="pt-2 text-[11px] text-[#9AA68A] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#9AA68A]" />
                <span>SYSTEM COHERENT ACROSS ALL SURFACES</span>
              </div>
            )}
          </div>

          {/* Right: The Final Cognitive Loop */}
          <div className="border border-[#282823] p-8 bg-[#0E0E0B]">
            <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] mb-4">
              CONTINUOUS MAINTENANCE LOOP
            </div>

            <div className="space-y-3 font-mono-tech text-[12px]">
              {LOOP_STEPS.map((step, idx) => {
                const isStepActive = loopActiveIdx >= idx;
                return (
                  <div key={step} className="flex flex-col items-start">
                    <div
                      className={`flex items-center gap-3 transition-colors ${
                        isStepActive ? "text-[#EDE9DF]" : "text-[#282823]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 ${isStepActive ? "bg-[#D8663D]" : "bg-[#282823]"}`} />
                      <span>{step}</span>
                    </div>
                    {idx < LOOP_STEPS.length - 1 && (
                      <div className="w-[1px] h-3 ml-0.5 bg-[#282823]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Loopback Arrow */}
            <div className="mt-4 pt-3 border-t border-[#282823] text-[10px] font-mono-tech text-[#D8663D]">
              ↺ LOOPS TO OBSERVE // UNBROKEN CYCLE
            </div>
          </div>
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>SURFACES RECONCILED: {activeSurfaceCount} / 7</span>
          <span>CYCLE CONTINUITY: ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
