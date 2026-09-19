"use client";

import { useEffect, useRef, useState } from "react";

const EVIDENCE_ITEMS = [
  { id: "diff", name: "git diff", label: "MODIFIED", line: "MAX_RETRIES: 3 → 5", col: "left" },
  { id: "src", name: "src/retry.ts", label: "SOURCE", line: "const MAX_RETRIES = 5;", col: "left" },
  { id: "test", name: "retry.test.ts", label: "ASSERTION", line: "expect(attempts).toBe(5);", col: "left" },
  { id: "api", name: "openapi.yaml", label: "SCHEMA", line: "x-retry-limit: 5", col: "right" },
  { id: "ex", name: "example.ts", label: "USAGE", line: "client.connect({ retry: 5 })", col: "right" },
  { id: "doc", name: "retries.mdx", label: "DOCUMENT", line: "Retries 3 times max.", col: "right", contradict: true },
];

export function CognitionScene() {
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

  const step = Math.min(Math.floor(scrollProgress * 6), 5);
  const isConverged = scrollProgress > 0.85;

  return (
    <section
      id="cognition"
      ref={containerRef}
      className="relative w-full h-[240vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Header */}
        <div>
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
            02 // COGNITION
          </div>
          <h2 className="headline-editorial-section text-[#EDE9DF] font-sans max-w-[800px]">
            Don&apos;t compare files.
            <br />
            Understand behavior.
          </h2>
        </div>

        {/* Evidence Field & Convergence Canvas */}
        <div className="relative w-full max-w-[1000px] my-auto py-10">
          {!isConverged ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 relative">
              {EVIDENCE_ITEMS.map((item, idx) => {
                const isActive = step >= idx;
                return (
                  <div
                    key={item.id}
                    className={`transition-all duration-300 ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-25 translate-y-2"
                    }`}
                    data-cursor="evidence"
                  >
                    {/* Item Name + Label */}
                    <div className="flex items-center justify-between text-[11px] font-mono-tech mb-2">
                      <span className="text-[#EDE9DF] font-medium">{item.name}</span>
                      <span
                        className={`text-[10px] ${
                          item.contradict && isActive ? "text-[#B84A3A]" : "text-[#66655E]"
                        }`}
                      >
                        {item.contradict && isActive ? "[ CONTRADICTION ]" : item.label}
                      </span>
                    </div>

                    {/* Thin Rule */}
                    <div
                      className={`w-full h-[1px] mb-2.5 transition-colors ${
                        isActive ? "bg-[#D8663D]" : "bg-[#282823]"
                      }`}
                    />

                    {/* Code / Content Snippet */}
                    <div
                      className={`text-[13px] font-mono-tech ${
                        item.contradict && isActive ? "text-[#B84A3A]" : "text-[#A9A69D]"
                      }`}
                    >
                      {item.line}
                    </div>
                  </div>
                );
              })}

              {/* Connecting Electrical Traces */}
              {step >= 2 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[1px] h-full bg-[#D8663D]/40" />
                </div>
              )}
            </div>
          ) : (
            /* Converged State: BEHAVIORAL CONTRACT */
            <div className="w-full p-10 border border-[#D8663D] bg-[#141411] text-center transition-all duration-500">
              <div className="text-[11px] font-mono-tech text-[#D8663D] uppercase tracking-[0.2em] mb-3">
                EVIDENCE CONVERGENCE ACHIEVED
              </div>
              <div className="text-[32px] sm:text-[48px] font-sans font-medium text-[#EDE9DF]">
                BEHAVIORAL CONTRACT
              </div>
              <div className="text-[13px] font-mono-tech text-[#A9A69D] mt-3 max-w-[500px] mx-auto">
                6 multi-surface artifacts unified into a single verifiable invariant model.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>ACTIVE SOURCES: {Math.min(step + 1, 6)} / 6</span>
          <span>RECONSTRUCTION STATUS: {isConverged ? "CONVERGED" : "EVALUATING"}</span>
        </div>
      </div>
    </section>
  );
}
