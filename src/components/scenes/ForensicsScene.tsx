"use client";

import { useEffect, useRef, useState } from "react";

export function ForensicsScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [whyExpanded, setWhyExpanded] = useState(false);

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

  const showObserved = scrollProgress > 0.25;
  const showContradiction = scrollProgress > 0.55;
  const shiftThree = scrollProgress > 0.45 ? -18 : 0;

  return (
    <section
      id="forensics"
      ref={containerRef}
      className="relative w-full min-h-[220vh] bg-[#0B0B09] border-t border-[#1C1C17]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 min-h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-24 pb-14 overflow-hidden select-none">
        {/* Main Grid: Left Headline, Right Forensic Specimen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-auto">
          {/* Left: Editorial Headline */}
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-4">
              03 // FORENSICS
            </div>
            <h2 className="headline-editorial-section text-[#EDE9DF] font-sans">
              Find the promise
              <br />
              that broke.
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#A9A69D] mt-6 max-w-[420px]">
              Software rarely announces broken guarantees. Cognis isolates the exact boundary where
              observed execution diverged from documented commitments.
            </p>
          </div>

          {/* Right: Forensic Specimen Document */}
          <div className="lg:col-span-7 border border-[#282823] bg-[#0E0E0B] p-6 sm:p-8 rounded-[2px]">
            {/* Metadata Header */}
            <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#66655E] pb-4 border-b border-[#282823]">
              <span>CONTRACT // C-017</span>
              <span>RETRY POLICY</span>
            </div>

            {/* Documented Guarantee */}
            <div className="py-6 border-b border-[#282823]">
              <div className="text-[10px] font-mono-tech uppercase tracking-[0.14em] text-[#66655E] mb-2">
                DOCUMENTED
              </div>
              <div className="text-[20px] sm:text-[24px] font-sans text-[#EDE9DF]">
                Requests retry{" "}
                <span
                  className="inline-block transition-transform duration-300 font-mono-tech text-[#D8663D]"
                  style={{ transform: `translateX(${shiftThree}px)` }}
                >
                  3
                </span>{" "}
                times.
              </div>
            </div>

            {/* Observed Runtime Execution */}
            <div
              className={`py-6 border-b border-[#282823] transition-opacity duration-400 ${
                showObserved ? "opacity-100" : "opacity-20"
              }`}
            >
              <div className="text-[10px] font-mono-tech uppercase tracking-[0.14em] text-[#66655E] mb-2">
                OBSERVED
              </div>
              <div className="text-[20px] sm:text-[24px] font-sans text-[#EDE9DF]">
                Requests retry{" "}
                <span className="font-mono-tech text-[#B84A3A]">5</span> times.
              </div>
            </div>

            {/* Status + "WHY?" Action */}
            <div className="pt-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono-tech uppercase tracking-[0.14em] text-[#66655E] mb-1">
                  STATUS
                </div>
                <div
                  className={`text-[16px] font-mono-tech font-semibold tracking-wider transition-colors ${
                    showContradiction ? "text-[#B84A3A]" : "text-[#66655E]"
                  }`}
                >
                  {showContradiction ? "CONTRADICTED" : "COMPARING..."}
                </div>
              </div>

              {/* Inline "WHY?" expansion trigger */}
              <button
                type="button"
                onClick={() => setWhyExpanded(!whyExpanded)}
                className="px-3 py-1.5 border border-[#393832] rounded-[2px] text-[11px] font-mono-tech uppercase tracking-[0.12em] text-[#D8663D] hover:border-[#D8663D] transition-colors"
                data-cursor="contract"
              >
                {whyExpanded ? "[ HIDE REASONING ]" : "[ WHY? ]"}
              </button>
            </div>

            {/* Forensic References */}
            {showContradiction && (
              <div className="mt-6 pt-4 border-t border-dashed border-[#282823] flex flex-wrap gap-4 text-[10px] font-mono-tech text-[#66655E]">
                <span className="hover:text-[#EDE9DF] transition-colors cursor-pointer" data-cursor="evidence">
                  retry.ts:42
                </span>
                <span className="text-[#282823]">/</span>
                <span className="hover:text-[#EDE9DF] transition-colors cursor-pointer" data-cursor="evidence">
                  retry.test.ts:18
                </span>
                <span className="text-[#282823]">/</span>
                <span className="hover:text-[#EDE9DF] transition-colors cursor-pointer" data-cursor="evidence">
                  retries.mdx:38
                </span>
              </div>
            )}

            {/* Inline Expanding "WHY?" Reasoning Drawer (No Modal!) */}
            {whyExpanded && (
              <div className="mt-8 pt-6 border-t border-[#D8663D]/40 space-y-4 text-[12px] font-mono-tech transition-all animate-fadeIn">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#D8663D]">
                  FORENSIC RECONSTRUCTION PROOF:
                </div>

                <div className="p-3 bg-[#141411] border border-[#282823]">
                  <span className="text-[#66655E] block mb-1">01 // CODE CHANGE</span>
                  <p className="text-[#EDE9DF] font-sans text-[13px]">
                    Implementation in client/retry.ts modified loop condition limit from 3 to 5.
                  </p>
                </div>

                <div className="p-3 bg-[#141411] border border-[#282823]">
                  <span className="text-[#66655E] block mb-1">02 // RUNTIME EVIDENCE</span>
                  <p className="text-[#EDE9DF] font-sans text-[13px]">
                    Integration test execution traces confirm five attempts before timeout signal.
                  </p>
                </div>

                <div className="p-3 bg-[#141411] border border-[#282823]">
                  <span className="text-[#66655E] block mb-1">03 // STALE PUBLICATION</span>
                  <p className="text-[#EDE9DF] font-sans text-[13px]">
                    Published documentation guides/retries.mdx still states three attempts.
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-[#D8663D] font-mono-tech uppercase">
                  CONCLUSION: The documented behavioral contract is stale.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Coordinate Indicator */}
        <div className="flex justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.12em] border-t border-[#1C1C17] pt-4">
          <span>FORENSIC SPECIMEN: C-017</span>
          <span>EVIDENCE STRENGTH: DIRECT + INDEPENDENT</span>
        </div>
      </div>
    </section>
  );
}
