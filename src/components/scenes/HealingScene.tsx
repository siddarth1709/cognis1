"use client";

import { useEffect, useRef, useState } from "react";

const HEALING_STEPS = [
  "CONTRADICTED",
  "INVESTIGATING",
  "REPAIR PLANNED",
  "HEALING",
  "VERIFYING",
  "RESTORED",
];

const CHECKS = [
  "IMPLEMENTATION",
  "TEST",
  "EXAMPLE",
  "DOCUMENTATION",
  "JSON",
  "JSON-LD",
  "AGENT",
  "MCP",
];

export function HealingScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / (windowH * 1.6), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stepIdx = Math.min(Math.floor(scrollProgress * 6), 5);
  const currentStep = HEALING_STEPS[stepIdx];
  const isDiffHealed = stepIdx >= 3;
  const isRestored = stepIdx === 5;
  const checksVisible = Math.min(Math.floor((scrollProgress - 0.5) * 16), 8);

  return (
    <section
      id="healing"
      ref={containerRef}
      className="relative w-full h-[220vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            05 // SELF-HEALING
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans">
            Knowledge broke.
            <br />
            Cognis repairs it.
          </h2>
        </div>

        {/* Large Repair Terminal */}
        <div className="w-full max-w-[1000px] my-auto border border-[#282823] bg-[#0E0E0B] p-6 sm:p-8">
          {/* Terminal Header Bar */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#282823] text-[11px] font-mono-tech gap-4">
            <span className="text-[#EDE9DF]">HEALING TRANSACTION // H-184</span>
            <div className="flex items-center gap-6 text-[#66655E]">
              <span>CONTRACT: C-017</span>
              <span>TARGETS: 03</span>
              <span>VALIDATION: 06</span>
            </div>
            <span
              className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider ${
                isRestored
                  ? "border-[#9AA68A] text-[#9AA68A]"
                  : "border-[#D8663D] text-[#D8663D]"
              }`}
            >
              [ {currentStep} ]
            </span>
          </div>

          {/* Character-Level Documentation Diff */}
          <div className="py-6 border-b border-[#282823] font-mono-tech text-[13px] space-y-2">
            <div className="text-[#66655E] text-[11px]">docs/retries.mdx : line 38</div>

            {/* Old Diff Line Fading */}
            <div
              className={`transition-all duration-300 ${
                isDiffHealed
                  ? "line-through text-[#66655E] opacity-30"
                  : "text-[#B84A3A]"
              }`}
            >
              - Requests retry 3 times.
            </div>

            {/* Repaired Diff Line */}
            <div
              className={`transition-all duration-300 ${
                isDiffHealed ? "text-[#9AA68A] opacity-100" : "text-[#282823] opacity-20"
              }`}
            >
              + Requests retry up to 5 times.
            </div>
          </div>

          {/* Sequential 8 Verification Checks */}
          <div className="pt-6">
            <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] mb-4">
              EXHAUSTIVE REPRESENTATION VERIFICATION
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono-tech">
              {CHECKS.map((check, idx) => {
                const passed = checksVisible > idx;
                return (
                  <div
                    key={check}
                    className={`p-2.5 border transition-all duration-200 flex items-center justify-between ${
                      passed
                        ? "border-[#282823] bg-[#141411] text-[#EDE9DF]"
                        : "border-transparent text-[#393832]"
                    }`}
                  >
                    <span>{check}</span>
                    <span className={passed ? "text-[#9AA68A]" : "text-[#282823]"}>
                      {passed ? "✓" : "·"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Restored Verdict */}
            {isRestored && (
              <div className="mt-6 pt-4 border-t border-[#282823] flex items-center justify-between text-[11px] font-mono-tech text-[#9AA68A]">
                <span>8 / 8 VERIFICATION PROTOCOLS SATISFIED</span>
                <span>SYSTEM COHERENT</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>TRANSACTION STATE: {currentStep}</span>
          <span>HEALING BOUND: COMPLETE</span>
        </div>
      </div>
    </section>
  );
}
