"use client";

import { useState } from "react";

export function MonolithicForensics() {
  const [sliderPos, setSliderPos] = useState(50); // 0 (Documented) to 100 (Observed)
  const [expandedWhy, setExpandedWhy] = useState(false);

  return (
    <section
      id="forensics"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            02 // CONTRACT FORENSICS
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1100px]">
            FIND THE PROMISE
            <br />
            THAT BROKE.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[620px] font-sans mt-8 leading-[1.5]">
            Software rarely announces broken guarantees. Cognis isolates the exact boundary where
            observed runtime behavior diverged from documented commitments.
          </p>
        </div>

        {/* Museum-Grade Forensic Specimen Canvas */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* Specimen Metadata Header */}
          <div className="flex flex-wrap items-center justify-between pb-8 mb-12 border-b border-[#1C1C17] text-[11px] font-mono-tech text-[#8C887B] gap-4">
            <span className="uppercase tracking-[0.16em] text-[#F2EFE9]">
              FORENSIC SPECIMEN // C-017: RETRY POLICY INVARIANT
            </span>
            <div className="flex items-center gap-6">
              <span>TARGET: HTTP CLIENT RETRY BOUNDARY</span>
              <span className="text-[#B84A3A] font-semibold">[ CONTRADICTION DETECTED ]</span>
            </div>
          </div>

          {/* Interactive Wipe Comparison Container */}
          <div className="relative border border-[#282823] bg-[#0E0E0B] p-8 sm:p-12 overflow-hidden">
            {/* Range Scrubber to Wipe between Documented & Observed */}
            <div className="mb-8 flex items-center justify-between text-[11px] font-mono-tech text-[#66655E]">
              <span className="uppercase tracking-[0.14em]">INTERACTIVE COMPARISON WIPE</span>
              <div className="flex items-center gap-3">
                <span className={sliderPos < 50 ? "text-[#F2EFE9]" : "text-[#66655E]"}>DOCUMENTED (3)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-32 accent-[#E05A2B] cursor-pointer"
                  aria-label="Wipe between documented and observed"
                />
                <span className={sliderPos >= 50 ? "text-[#E05A2B]" : "text-[#66655E]"}>OBSERVED (5)</span>
              </div>
            </div>

            {/* Side-by-Side Large Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 pb-8 border-b border-[#1C1C17]">
              {/* Documented Guarantee */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#66655E]">
                  PUBLISHED PROMISE (STALE)
                </span>
                <div className="text-[32px] sm:text-[44px] font-sans font-medium text-[#F2EFE9] leading-tight">
                  Requests retry <span className="text-[#B84A3A] line-through font-mono-tech">3</span> times.
                </div>
                <p className="text-[13px] text-[#8C887B] font-sans">
                  Published across guides/reliability.md and SDK README.
                </p>
              </div>

              {/* Observed Runtime Execution */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#E05A2B]">
                  ACTUAL TELEMETRY (LIVE)
                </span>
                <div className="text-[32px] sm:text-[44px] font-sans font-medium text-[#F2EFE9] leading-tight">
                  Requests retry <span className="text-[#E05A2B] font-mono-tech">5</span> times.
                </div>
                <p className="text-[13px] text-[#8C887B] font-sans">
                  Observed in retry.ts:42 and verified in retry.test.ts:18.
                </p>
              </div>
            </div>

            {/* Action to Expand Deep Reasoning */}
            <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-[11px] font-mono-tech text-[#8C887B]">
                <span>EVIDENCE STRENGTH: DIRECT + REPRODUCIBLE</span>
                <span>•</span>
                <span>CERTAINTY SCORE: 1.00</span>
              </div>

              <button
                type="button"
                onClick={() => setExpandedWhy(!expandedWhy)}
                className="px-5 py-2.5 border border-[#393832] rounded-[2px] text-[11px] font-mono-tech uppercase tracking-[0.14em] text-[#E05A2B] hover:border-[#E05A2B] hover:bg-[#E05A2B]/[0.06] transition-all"
              >
                {expandedWhy ? "[ HIDE EVIDENCE AUDIT ]" : "[ AUDIT FORENSIC PROOF → ]"}
              </button>
            </div>

            {/* Grand-Scale Expandable Proof Audit */}
            {expandedWhy && (
              <div className="mt-8 pt-8 border-t border-[#E05A2B]/30 space-y-6 text-[12px] font-mono-tech">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#E05A2B] font-semibold">
                  MATHEMATICAL FORENSIC TRACE AUDIT:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#080806] border border-[#1C1C17]">
                    <div className="text-[#66655E] mb-2">01 // CODE ROOT DELTA</div>
                    <div className="text-[#F2EFE9] font-mono-tech mb-2">client/retry.ts:42</div>
                    <p className="text-[#8C887B] font-sans text-[13px] leading-relaxed">
                      Loop condition altered from 3 to 5 in PR #184 without accompanying doc updates.
                    </p>
                  </div>

                  <div className="p-5 bg-[#080806] border border-[#1C1C17]">
                    <div className="text-[#66655E] mb-2">02 // INTEGRATION CONFIRMATION</div>
                    <div className="text-[#F2EFE9] font-mono-tech mb-2">tests/retry_backoff.test.ts:18</div>
                    <p className="text-[#8C887B] font-sans text-[13px] leading-relaxed">
                      TestSuite executes 5 sequential attempts before terminal backoff abort.
                    </p>
                  </div>

                  <div className="p-5 bg-[#080806] border border-[#1C1C17]">
                    <div className="text-[#66655E] mb-2">03 // CANONICAL BREACH</div>
                    <div className="text-[#F2EFE9] font-mono-tech mb-2">docs/reliability.md:38</div>
                    <p className="text-[#8C887B] font-sans text-[13px] leading-relaxed">
                      Published contract states 3 attempts; callers configure timeouts for 3 attempts and fail prematurely.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#141411] border border-[#282823] text-[12px] font-mono-tech text-[#E05A2B]">
                  VERDICT: Documented behavioral contract C-017 is mathematically falsified by reality.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
