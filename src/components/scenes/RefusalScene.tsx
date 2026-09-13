"use client";

import { useEffect, useRef, useState } from "react";

export function RefusalScene() {
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

  const isStopped = scrollProgress > 0.45;

  return (
    <section
      id="refusal"
      ref={containerRef}
      className="relative w-full h-[200vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            06 // EPISTEMIC RESTRAINT
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans">
            It knows when
            <br />
            not to heal.
          </h2>
        </div>

        {/* Ambiguous Invariant Examination Grid */}
        <div className="w-full max-w-[900px] my-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-[#282823]">
            <div className="border border-[#282823] p-4 bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase block mb-1">
                IMPLEMENTATION
              </span>
              <span className="text-[16px] font-mono-tech text-[#EDE9DF]">milliseconds</span>
            </div>
            <div className="border border-[#282823] p-4 bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase block mb-1">
                DOCUMENTATION
              </span>
              <span className="text-[16px] font-mono-tech text-[#EDE9DF]">seconds</span>
            </div>
            <div className="border border-[#282823] p-4 bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase block mb-1">
                TESTS
              </span>
              <span className="text-[16px] font-mono-tech text-[#C5A85A]">mixed</span>
            </div>
            <div className="border border-[#282823] p-4 bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase block mb-1">
                CONFIGURATION
              </span>
              <span className="text-[16px] font-mono-tech text-[#A9A69D]">conditional</span>
            </div>
          </div>

          {/* System Halts: Massive Refusal Verdict */}
          <div className="pt-10">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 ${isStopped ? "bg-[#B84A3A]" : "bg-[#D8663D]"}`} />
              <span className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#66655E]">
                EPISTEMIC SAFETY GATE
              </span>
            </div>

            <div
              className={`text-[32px] sm:text-[54px] md:text-[68px] font-mono-tech uppercase font-medium leading-none transition-colors ${
                isStopped ? "text-[#B84A3A]" : "text-[#393832]"
              }`}
            >
              AUTOMATIC REPAIR BLOCKED
            </div>

            <div
              className={`mt-4 space-y-1 text-[13px] font-mono-tech transition-opacity duration-300 ${
                isStopped ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-[#EDE9DF]">Evidence is contradictory.</div>
              <div className="text-[#66655E]">Human investigation required.</div>
            </div>
          </div>
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>ARBITRATION STATUS: {isStopped ? "HALTED" : "COMPUTING"}</span>
          <span>AUTONOMOUS OVERRIDE: INHIBITED</span>
        </div>
      </div>
    </section>
  );
}
