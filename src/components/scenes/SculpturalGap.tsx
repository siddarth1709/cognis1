"use client";

import { useState } from "react";

export function SculpturalGap() {
  const [driftValue, setDriftValue] = useState(48); // 0 to 100%

  return (
    <section
      id="gap"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Milestone Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            01 // THE DRIFT GAP
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1100px]">
            YOUR CODE MOVED.
            <br />
            YOUR KNOWLEDGE STAYED.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[620px] font-sans mt-8 leading-[1.5]">
            When software moves, downstream artifacts rarely advance in lockstep.
            A microscopic divergence cascades into broken client integrations, stale documentation,
            and hallucinating AI agents.
          </p>
        </div>

        {/* Sculptural Interactive Split Canvas */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* Interactive Tension Slider Controller */}
          <div className="flex flex-wrap items-center justify-between pb-8 mb-12 border-b border-[#1C1C17] text-[11px] font-mono-tech text-[#8C887B] gap-4">
            <span className="uppercase tracking-[0.16em] flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B]" />
              INTERACTIVE DRIFT SIMULATOR
            </span>
            <div className="flex items-center gap-4">
              <span>SIMULATED DRIFT: {driftValue}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={driftValue}
                onChange={(e) => setDriftValue(Number(e.target.value))}
                className="w-36 accent-[#E05A2B] bg-[#1C1C17] cursor-pointer"
                aria-label="Simulate knowledge drift"
              />
            </div>
          </div>

          {/* Monumental Two-Sided Kinetic Divergence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative py-6">
            {/* Left Monolith: REALITY */}
            <div
              className="lg:col-span-5 p-8 border border-[#282823] bg-[#0E0E0B] transition-transform duration-200"
              style={{
                transform: `translateX(${-driftValue * 0.4}px)`,
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C17]">
                <span className="text-[11px] font-mono-tech text-[#E05A2B] tracking-[0.16em] uppercase">
                  AXIS A // REALITY
                </span>
                <span className="text-[10px] font-mono-tech text-[#66655E]">COMMIT 0x7FA</span>
              </div>
              <div className="text-[28px] sm:text-[36px] font-sans font-medium text-[#F2EFE9] mb-3">
                Source &amp; Telemetry
              </div>
              <p className="text-[13px] text-[#8C887B] font-sans leading-relaxed mb-6">
                Runtime execution, compiler AST, and live HTTP traces confirming the true operational behavior.
              </p>
              <div className="p-3 bg-[#080806] border border-[#1C1C17] font-mono-tech text-[12px] text-[#E05A2B]">
                MAX_RETRIES = 5 (ADVANCED)
              </div>
            </div>

            {/* Center: The Growing Drift Void */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-6">
              <div
                className="h-[1px] bg-gradient-to-r from-[#E05A2B] via-[#B84A3A] to-transparent w-full mb-3"
                style={{ opacity: driftValue / 100 }}
              />
              <span
                className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#B84A3A] font-semibold block transition-opacity duration-200"
                style={{ opacity: driftValue > 25 ? 1 : 0.2 }}
              >
                KNOWLEDGE DRIFT
              </span>
              <span className="text-[10px] font-mono-tech text-[#66655E] mt-1">
                {(driftValue * 0.18).toFixed(1)}ms ASYNC GAP
              </span>
            </div>

            {/* Right Monolith: KNOWLEDGE */}
            <div
              className="lg:col-span-5 p-8 border border-[#282823] bg-[#0E0E0B] transition-transform duration-200"
              style={{
                transform: `translateX(${driftValue * 0.4}px)`,
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C17]">
                <span className="text-[11px] font-mono-tech text-[#B84A3A] tracking-[0.16em] uppercase">
                  AXIS B // PUBLISHED
                </span>
                <span className="text-[10px] font-mono-tech text-[#66655E]">STALE REVISION</span>
              </div>
              <div className="text-[28px] sm:text-[36px] font-sans font-medium text-[#F2EFE9] mb-3">
                Published Knowledge
              </div>
              <p className="text-[13px] text-[#8C887B] font-sans leading-relaxed mb-6">
                Documentation guides, client SDK contracts, and agent indexes that lagged behind the code update.
              </p>
              <div className="p-3 bg-[#080806] border border-[#1C1C17] font-mono-tech text-[12px] text-[#B84A3A]">
                &quot;Retries 3 times&quot; (LAGGED BEHIND)
              </div>
            </div>
          </div>

          {/* Architectural Verdict */}
          <div className="mt-10 pt-6 border-t border-[#1C1C17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono-tech text-[#8C887B]">
            <span>COGNIS RECONSTRUCTION: RUNNING CONSTANT PROOFS</span>
            <span className="text-[#E05A2B]">AUTOMATIC CONTRADICTION DETECTION: ENGAGED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
