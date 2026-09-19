import React from "react";

const TICKER_ITEMS = [
  "AUTONOMOUS BEHAVIOR RECONSTRUCTION",
  "INVARIANT MATHEMATICAL PROOFS",
  "EPISTEMIC RESTRAINT PROTOCOLS",
  "SOFTWARE CONTRACT FORENSICS",
  "MULTI-SURFACE KNOWLEDGE CONSENSUS",
  "BOUNDED REPAIR VERIFICATION",
  "REALITY SYNCHRONIZATION",
];

export function FullBleedTicker() {
  return (
    <div
      className="w-full overflow-hidden border-y border-[#1C1C17] bg-[#0A0A08] py-3.5 select-none"
      aria-hidden="true"
    >
      <div className="animate-ticker-marquee flex items-center gap-12 text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#8C887B]">
        {/* Sequence repeated twice for seamless infinite loop */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-12 whitespace-nowrap">
            <span className="hover:text-[#F2EFE9] transition-colors">{item}</span>
            <span className="text-[#E05A2B]">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
