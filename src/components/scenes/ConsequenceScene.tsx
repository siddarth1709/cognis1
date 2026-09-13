"use client";

import { useEffect, useRef, useState } from "react";

const CONSEQUENCES = [
  { id: "sdk", label: "SDK", status: "BEHAVIOR CHANGED", desc: "Backoff ceiling shifts 7s → 31s" },
  { id: "trouble", label: "TROUBLESHOOTING", status: "STALE", desc: "Log analyzer audit expecting 3 attempts" },
  { id: "ex", label: "EXAMPLE", status: "STALE", desc: "Quickstart sample code config outdated" },
  { id: "schema", label: "API SCHEMA", status: "UNCHANGED", desc: "Wire protocol signatures remain valid" },
  { id: "agent", label: "AGENT", status: "STALE", desc: "LLM system prompt rules out of sync" },
];

export function ConsequenceScene() {
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

  const activeCount = Math.min(Math.floor(scrollProgress * 6), 5);

  return (
    <section
      id="consequence"
      ref={containerRef}
      className="relative w-full h-[220vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            04 // CONSEQUENCE ENGINE
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans">
            What becomes false?
          </h2>
        </div>

        {/* Central 160px Delta & Electrical Wiring Traces */}
        <div className="relative w-full max-w-[1000px] my-auto py-6">
          {/* Enormous 3 -> 5 */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 my-6">
            <span className="text-[90px] sm:text-[140px] md:text-[160px] font-mono-tech text-[#66655E] line-through font-light leading-none">
              3
            </span>
            <span className="text-[40px] sm:text-[70px] text-[#D8663D] font-mono-tech">
              →
            </span>
            <span className="text-[90px] sm:text-[140px] md:text-[160px] font-mono-tech text-[#EDE9DF] font-light leading-none">
              5
            </span>
          </div>

          {/* Electrical Trace Wiring & Terminal Consequence Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {CONSEQUENCES.map((c, idx) => {
              const isReached = activeCount >= idx;
              return (
                <div
                  key={c.id}
                  className={`border transition-all duration-300 p-4 bg-[#0E0E0B] relative ${
                    isReached
                      ? "border-[#282823] opacity-100"
                      : "border-transparent opacity-20"
                  }`}
                  data-cursor="evidence"
                >
                  {/* Hard 90° wiring stub on top */}
                  <div className="w-full flex items-center mb-3">
                    <div className="w-2 h-2 border border-[#393832] bg-[#141411]" />
                    <div className="flex-1 h-[1px] bg-[#282823]" />
                  </div>

                  <div className="text-[11px] font-mono-tech text-[#66655E] mb-1">
                    {c.label}
                  </div>
                  <div
                    className={`text-[12px] font-mono-tech font-semibold mb-2 ${
                      c.status === "UNCHANGED" ? "text-[#9AA68A]" : "text-[#D8663D]"
                    }`}
                  >
                    {c.status}
                  </div>
                  <p className="text-[11px] font-sans text-[#A9A69D] leading-snug">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>ELECTRICAL TRACE PROPAGATION: {activeCount} / 5</span>
          <span>IMPACT INVARIANTS EVALUATED</span>
        </div>
      </div>
    </section>
  );
}
