"use client";

import { useState } from "react";

const CONSEQUENCES = [
  { id: "sdk", label: "SDK BEHAVIOR", status: "ALTERED", desc: "Backoff timeout ceiling shifts from 7s to 31s under network saturation." },
  { id: "diag", label: "TROUBLESHOOTING", status: "STALE", desc: "Diagnostic log analysis expecting 3 attempt events will fail operational audit." },
  { id: "ex", label: "CODE EXAMPLES", status: "STALE", desc: "Quickstart sample configurations deploy with obsolete backoff assumptions." },
  { id: "api", label: "API SCHEMA", status: "COMPLIANT", desc: "Payload structures and HTTP header wire contracts remain unviolated." },
  { id: "agent", label: "AGENT CONTEXT", status: "STALE", desc: "LLM system prompt invariants hallucinate 3 retries during user troubleshooting." },
];

export function MonumentalConsequence() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section
      id="consequence"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            03 // CONSEQUENCE ENGINE
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1100px]">
            WHAT BECOMES FALSE?
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[620px] font-sans mt-8 leading-[1.5]">
            A code commit doesn&apos;t just change syntax. It initiates a shockwave of downstream invalidation
            across human documentation, SDK runtimes, and autonomous agents.
          </p>
        </div>

        {/* 180px Monolithic Delta & Consequence Matrix */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* Monumental 3 -> 5 Display */}
          <div className="py-12 border-b border-[#1C1C17] flex items-center justify-center gap-8 sm:gap-16">
            <span className="text-[100px] sm:text-[150px] md:text-[180px] font-mono-tech font-light text-[#66655E] line-through leading-none">
              3
            </span>
            <span className="text-[48px] sm:text-[80px] font-mono-tech text-[#E05A2B]">
              →
            </span>
            <span className="text-[100px] sm:text-[150px] md:text-[180px] font-mono-tech font-light text-[#F2EFE9] leading-none">
              5
            </span>
          </div>

          {/* Hard 90° Industrial Consequence Traces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-12">
            {CONSEQUENCES.map((item, idx) => {
              const isSelected = activeIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`p-6 border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-[#E05A2B] bg-[#141411]"
                      : "border-[#1C1C17] bg-[#0E0E0B] hover:border-[#282823]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1C1C17]">
                    <span className="text-[10px] font-mono-tech uppercase tracking-[0.16em] text-[#66655E]">
                      0{idx + 1}
                    </span>
                    <span
                      className={`text-[11px] font-mono-tech font-semibold ${
                        item.status === "COMPLIANT" ? "text-[#9AA68A]" : "text-[#E05A2B]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[15px] font-mono-tech font-medium text-[#F2EFE9] mb-2">
                    {item.label}
                  </div>

                  <p className="text-[12px] font-sans text-[#8C887B] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Coordinate Bar */}
          <div className="mt-12 pt-6 border-t border-[#1C1C17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono-tech text-[#8C887B]">
            <span>DOWNSTREAM INVARIANT SHOCKWAVE: 4 VIOLATIONS DETECTED</span>
            <span className="text-[#E05A2B]">AUTOMATED REMEDIATION PLAN: COMPILED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
