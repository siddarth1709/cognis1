"use client";

export function RestraintSection() {
  return (
    <section className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#07090D] border-t border-white/[0.04]">
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            EPISTEMIC RESTRAINT
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[760px]">
            Sometimes the smartest action
            <br />
            is to stop.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            Autonomous hallucinated repairs destroy developer trust. Cognis enforces mathematical
            evidence bounds: when the telemetry and code are genuinely contradictory, it halts and
            requests engineer arbitration.
          </p>
        </div>

        {/* Ambiguous Contradiction Interface */}
        <div className="max-w-[880px] mx-auto rounded-2xl border border-white/[0.08] bg-[#0B0F15] p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.06] text-[11px] font-mono-tech">
            <span className="text-[#697482] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4C95D]" />
              CONTRACT ARBITRATION CASE: C-082 (TIMEOUT RESOLUTION)
            </span>
            <span className="text-[#F4C95D] bg-[#F4C95D]/10 px-2.5 py-0.5 rounded border border-[#F4C95D]/20">
              EVIDENCE CONFLICT
            </span>
          </div>

          {/* 4 Contradictory Evidence Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {/* 1. Implementation */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#10151D]">
              <div className="text-[10px] font-mono-tech text-[#697482] uppercase mb-2">
                01 / IMPLEMENTATION
              </div>
              <div className="text-[14px] font-mono-tech text-[#F4F7FA] font-medium">
                milliseconds
              </div>
              <p className="text-[11px] text-[#A7B0BD] mt-1 font-sans">
                timeout: 5000 (unit unspecified in numeric literal)
              </p>
            </div>

            {/* 2. Documentation */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#10151D]">
              <div className="text-[10px] font-mono-tech text-[#697482] uppercase mb-2">
                02 / DOCUMENTATION
              </div>
              <div className="text-[14px] font-mono-tech text-[#F4F7FA] font-medium">
                seconds
              </div>
              <p className="text-[11px] text-[#A7B0BD] mt-1 font-sans">
                &quot;Defaults to 5 seconds timeout&quot;
              </p>
            </div>

            {/* 3. Tests */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#10151D]">
              <div className="text-[10px] font-mono-tech text-[#697482] uppercase mb-2">
                03 / TESTS
              </div>
              <div className="text-[14px] font-mono-tech text-[#F4C95D] font-medium">
                mixed
              </div>
              <p className="text-[11px] text-[#A7B0BD] mt-1 font-sans">
                Unit test mocks 5s; e2e awaits 5000ms
              </p>
            </div>

            {/* 4. Configuration */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#10151D]">
              <div className="text-[10px] font-mono-tech text-[#697482] uppercase mb-2">
                04 / CONFIGURATION
              </div>
              <div className="text-[14px] font-mono-tech text-[#A7B0BD] font-medium">
                conditional
              </div>
              <p className="text-[11px] text-[#A7B0BD] mt-1 font-sans">
                Env override parsed with fallback parser
              </p>
            </div>
          </div>

          {/* Deliberate Stop Verdict Banner */}
          <div className="p-6 rounded-xl border border-[#F4C95D]/30 bg-[#F4C95D]/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[12px] font-mono-tech font-semibold tracking-wider text-[#F4C95D] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#F4C95D]" />
                AUTOMATIC REPAIR BLOCKED
              </div>
              <p className="text-[13px] text-[#A7B0BD] font-sans">
                Reason: <strong className="text-[#F4F7FA] font-medium">Evidence is contradictory.</strong> Heuristic patching risks breaking valid user callers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono-tech text-[#F4C95D] border border-[#F4C95D]/40 bg-[#F4C95D]/10 px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                Human investigation required
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
