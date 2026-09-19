"use client";

export function MonolithicRefusal() {
  return (
    <section
      id="refusal"
      className="relative w-full py-36 sm:py-52 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            05 // EPISTEMIC RESTRAINT
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1200px]">
            SOMETIMES THE SMARTEST ACTION
            <br />
            IS TO REFUSE.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[660px] font-sans mt-8 leading-[1.5]">
            Most software tools brag about aggressive autonomy. Cognis earns enterprise trust through
            strict mathematical restraint. When telemetry and docs present genuine ambiguity, it stops.
          </p>
        </div>

        {/* Monolithic Refusal Canvas */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* 4 Contradictory Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-[#1C1C17]">
            <div className="p-6 border border-[#282823] bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] block mb-2">
                01 // IMPLEMENTATION
              </span>
              <div className="text-[18px] sm:text-[22px] font-mono-tech text-[#F2EFE9]">milliseconds</div>
              <div className="text-[11px] text-[#8C887B] mt-1 font-sans">timeout: 5000 (literal)</div>
            </div>

            <div className="p-6 border border-[#282823] bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] block mb-2">
                02 // DOCUMENTATION
              </span>
              <div className="text-[18px] sm:text-[22px] font-mono-tech text-[#F2EFE9]">seconds</div>
              <div className="text-[11px] text-[#8C887B] mt-1 font-sans">&quot;Defaults to 5s&quot;</div>
            </div>

            <div className="p-6 border border-[#282823] bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] block mb-2">
                03 // TEST SUITE
              </span>
              <div className="text-[18px] sm:text-[22px] font-mono-tech text-[#C5A85A]">mixed</div>
              <div className="text-[11px] text-[#8C887B] mt-1 font-sans">Unit mocks 5s; e2e 5000ms</div>
            </div>

            <div className="p-6 border border-[#282823] bg-[#0E0E0B]">
              <span className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] block mb-2">
                04 // RUNTIME CONFIG
              </span>
              <div className="text-[18px] sm:text-[22px] font-mono-tech text-[#8C887B]">conditional</div>
              <div className="text-[11px] text-[#8C887B] mt-1 font-sans">Dynamic env parser</div>
            </div>
          </div>

          {/* Monumental Vermillion Stamp */}
          <div className="pt-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B84A3A] animate-pulse" />
              <span className="text-[12px] font-mono-tech uppercase tracking-[0.2em] text-[#B84A3A] font-semibold">
                SYSTEM ARBITRATION GATE // ENGAGED
              </span>
            </div>

            <div className="text-[34px] sm:text-[56px] md:text-[76px] font-mono-tech font-semibold text-[#B84A3A] uppercase tracking-tight leading-none">
              AUTOMATIC REPAIR BLOCKED
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-[#1C1C17] text-[13px] font-mono-tech">
              <div className="space-y-1">
                <div className="text-[#F2EFE9]">Reason: Evidence is contradictory.</div>
                <div className="text-[#8C887B]">Autonomous repair withheld to prevent breaking user callers.</div>
              </div>

              <span className="px-5 py-2 border border-[#B84A3A]/50 bg-[#B84A3A]/10 text-[#B84A3A] rounded-[2px] uppercase tracking-wider text-[11px] whitespace-nowrap">
                Human Investigation Required
              </span>
            </div>
          </div>
        </div>

        {/* Breathless Cinematic Negative Space */}
        <div className="py-24 sm:py-36 text-center">
          <div className="text-[12px] font-mono-tech uppercase tracking-[0.28em] text-[#66655E] mb-2">
            PHILOSOPHY OF INTEGRITY
          </div>
          <div className="text-[22px] sm:text-[32px] font-sans font-medium text-[#8C887B] max-w-[500px] mx-auto">
            Good systems know their limits.
          </div>
        </div>
      </div>
    </section>
  );
}
