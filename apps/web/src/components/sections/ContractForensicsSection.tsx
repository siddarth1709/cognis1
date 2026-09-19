"use client";

import { useState } from "react";

export function ContractForensicsSection() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"diff" | "trace">("diff");

  return (
    <section
      id="forensics"
      className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#080B11] border-t border-white/[0.04]"
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            03 / CONTRACT FORENSICS
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[700px]">
            Find the promise that broke.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            Software rarely tells you directly which promise changed. Cognis traces behavioral changes
            back to the contracts your users depend on.
          </p>
        </div>

        {/* Engineering Investigation Console */}
        <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#07090D] overflow-hidden shadow-2xl">
          {/* Top Console Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0B0F15] text-[12px] font-mono-tech gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-[#FF667A]">
                <span className="w-2 h-2 rounded-full bg-[#FF667A] animate-ping" />
                CHANGE DETECTED
              </span>
              <span className="text-[#3D4652]">|</span>
              <span className="text-[#F4F7FA]">PR #184</span>
              <span className="text-[#697482]">client/retry_policy.ts</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#A7B0BD]">RETRY POLICY:</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[#5CEBFF]">
                3 → 5
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="ml-2 px-3 py-1 rounded border border-[#5CEBFF]/40 bg-[#5CEBFF]/10 text-[#5CEBFF] text-[11px] font-mono-tech tracking-wider uppercase flex items-center gap-1.5 hover:bg-[#5CEBFF]/20 transition-colors"
                data-interactive="true"
              >
                <span>WHY?</span>
                <span className="text-[10px]">↗</span>
              </button>
            </div>
          </div>

          {/* Horizontal Forensic Chain */}
          <div className="p-6 sm:p-10 border-b border-white/[0.06] bg-[#0B0F15]/30">
            <div className="text-[11px] font-mono-tech text-[#697482] uppercase tracking-[0.1em] mb-6">
              INCIDENT EVIDENCE CHAIN
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* 1. IMPLEMENTATION */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#10151D] flex flex-col justify-between relative group hover:border-[#5CEBFF]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono-tech text-[#697482]">01 / CODE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5CEBFF]" />
                  </div>
                  <div className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium mb-1">
                    IMPLEMENTATION
                  </div>
                  <p className="text-[11px] text-[#A7B0BD] leading-relaxed mb-4">
                    retry.ts updated internal loop counter.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#07090D] border border-white/[0.06] text-[11px] font-mono-tech space-y-1">
                  <div className="text-[#FF667A] line-through">- MAX_RETRIES = 3</div>
                  <div className="text-[#65E6A5]">+ MAX_RETRIES = 5</div>
                </div>
              </div>

              {/* 2. BEHAVIOR */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#10151D] flex flex-col justify-between relative group hover:border-[#8B7CFF]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono-tech text-[#697482]">02 / RUNTIME</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />
                  </div>
                  <div className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium mb-1">
                    BEHAVIOR
                  </div>
                  <p className="text-[11px] text-[#A7B0BD] leading-relaxed mb-4">
                    Integration test execution traces.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#07090D] border border-white/[0.06] text-[11px] font-mono-tech text-[#8B7CFF]">
                  Requests execute up to 5 attempts.
                </div>
              </div>

              {/* 3. CONTRACT */}
              <div className="p-4 rounded-xl border border-[#FF667A]/40 bg-[#FF667A]/[0.04] flex flex-col justify-between relative shadow-[0_0_20px_rgba(255,102,122,0.06)]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono-tech text-[#FF667A]">03 / INVARIANT</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF667A] animate-pulse" />
                  </div>
                  <div className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium mb-1">
                    CONTRACT
                  </div>
                  <p className="text-[11px] text-[#A7B0BD] leading-relaxed mb-4">
                    C-017: Retry policy guarantee.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#07090D] border border-[#FF667A]/30 text-[11px] font-mono-tech space-y-1">
                  <div className="text-[#A7B0BD]">&quot;Requests retry 3 times.&quot;</div>
                  <div className="text-[10px] text-[#FF667A] font-semibold tracking-wider uppercase">
                    CONTRADICTION DETECTED
                  </div>
                </div>
              </div>

              {/* 4. DOCUMENTATION */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#10151D] flex flex-col justify-between relative group hover:border-[#F4C95D]/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono-tech text-[#697482]">04 / SURFACE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4C95D]" />
                  </div>
                  <div className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium mb-1">
                    DOCUMENTATION
                  </div>
                  <p className="text-[11px] text-[#A7B0BD] leading-relaxed mb-4">
                    guides/reliability.md &amp; SDK docs.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#07090D] border border-white/[0.06] text-[11px] font-mono-tech text-[#F4C95D]">
                  Stale guarantee published (3 retries).
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Log Details */}
          <div className="p-6 bg-[#07090D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] font-mono-tech text-[#A7B0BD]">
            <div className="flex items-center gap-2">
              <span className="text-[#697482]">CORRELATION CONFIDENCE:</span>
              <span className="text-[#65E6A5]">0.994 (DIRECT CODE &amp; TEST GROUNDING)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#697482]">AFFECTED RUNTIMES: 3</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-[#5CEBFF] hover:underline flex items-center gap-1"
                data-interactive="true"
              >
                Inspect evidence proofs →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Evidence Drawer (Slides smoothly in from right) */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] bg-[#0B0F15] border-l border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col justify-between transition-transform duration-350 ease-out will-change-transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF667A]" />
              <span className="text-[12px] font-mono-tech tracking-[0.1em] text-[#F4F7FA] uppercase">
                FORENSIC EVIDENCE AUDIT
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-lg border border-white/[0.1] flex items-center justify-center text-[#A7B0BD] hover:text-[#F4F7FA] hover:border-white/[0.3] transition-colors"
              data-interactive="true"
              aria-label="Close evidence drawer"
            >
              ✕
            </button>
          </div>

          <h3 className="text-[17px] font-sans font-medium text-[#F4F7FA] mb-4">
            WHY IS THIS CONTRACT INVALID?
          </h3>

          {/* Evidence Steps */}
          <div className="space-y-4 mb-8">
            <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#10151D] text-[12px] font-mono-tech">
              <div className="text-[#5CEBFF] mb-1">1. retry.ts changed MAX_RETRIES</div>
              <p className="text-[#A7B0BD] text-[11px] font-sans leading-relaxed">
                Line 42 changed default retry boundary from 3 to 5 within client configuration.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#10151D] text-[12px] font-mono-tech">
              <div className="text-[#8B7CFF] mb-1">2. integration test observes 5 attempts</div>
              <p className="text-[#A7B0BD] text-[11px] font-sans leading-relaxed">
                Test suite retry_backoff.test.ts executes 5 sequential attempts before giving up.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#FF667A]/30 bg-[#FF667A]/[0.05] text-[12px] font-mono-tech">
              <div className="text-[#FF667A] mb-1">3. documentation still states 3 attempts</div>
              <p className="text-[#A7B0BD] text-[11px] font-sans leading-relaxed">
                Markdown documentation in guides/reliability.md explicit guarantees have not been revised.
              </p>
            </div>
          </div>

          {/* Metadata Specs */}
          <div className="p-4 rounded-lg border border-white/[0.06] bg-[#07090D] space-y-3 text-[12px] font-mono-tech">
            <div className="flex justify-between items-center">
              <span className="text-[#697482]">EVIDENCE STRENGTH</span>
              <span className="text-[#5CEBFF]">DIRECT + INDEPENDENT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#697482]">STATUS</span>
              <span className="text-[#FF667A] font-semibold">CONTRADICTED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#697482]">REPAIR CERTAINTY</span>
              <span className="text-[#65E6A5]">PROVABLE (1.00)</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-6 border-t border-white/[0.08] flex items-center gap-3">
          <a
            href="#self-healing"
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 h-[42px] rounded-lg bg-[#5CEBFF]/10 border border-[#5CEBFF]/50 text-[#5CEBFF] text-[13px] font-medium flex items-center justify-center hover:bg-[#5CEBFF]/20 transition-all"
            data-interactive="true"
          >
            Review automated repair plan →
          </a>
        </div>
      </div>

      {/* Backdrop overlay for drawer */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
        />
      )}
    </section>
  );
}
