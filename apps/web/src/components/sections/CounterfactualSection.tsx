"use client";

import { useState } from "react";

const CONSEQUENCES = [
  {
    target: "Documentation",
    status: "STALE",
    statusColor: "#FF667A",
    impact: "Human guide promises 3 retries max; users will experience 5.",
    severity: "HIGH",
  },
  {
    target: "SDK Behavior",
    status: "CHANGED",
    statusColor: "#F4C95D",
    impact: "Exponential backoff ceiling shifts from 7s to 31s under downtime.",
    severity: "CRITICAL",
  },
  {
    target: "Worst-Case Latency",
    status: "INCREASED",
    statusColor: "#FF667A",
    impact: "Timeout thresholds for upstream callers may abort prematurely.",
    severity: "HIGH",
  },
  {
    target: "Troubleshooting Guidance",
    status: "AFFECTED",
    statusColor: "#F4C95D",
    impact: "Log signature analysis expecting 3 attempt events will fail audit.",
    severity: "MEDIUM",
  },
  {
    target: "API Schema",
    status: "UNCHANGED",
    statusColor: "#65E6A5",
    impact: "Payload structure and HTTP contract signatures remain compliant.",
    severity: "NONE",
  },
];

export function CounterfactualSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(0);

  return (
    <section className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#07090D] border-t border-white/[0.04]">
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20 sm:mb-24">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            COUNTERFACTUAL REASONING
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[760px]">
            Don&apos;t ask what changed.
            <br />
            Ask what becomes false.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            A delta in code is easy to calculate. What matters is the cascade: the assumptions,
            invariants, and guarantees that were true yesterday but are violated today.
          </p>
        </div>

        {/* Split Screen Composition: Left CHANGE, Right CONSEQUENCES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: The Primitive Change (PR / Delta) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0B0F15] sticky top-28">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06] text-[11px] font-mono-tech">
              <span className="text-[#697482] uppercase tracking-[0.08em]">ROOT CHANGE INITIATOR</span>
              <span className="text-[#5CEBFF]">TRIGGER DELTA</span>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#10151D] mb-6">
              <div className="text-[11px] font-mono-tech text-[#697482] uppercase mb-1">
                PARAMETER DELTA
              </div>
              <div className="text-[20px] font-mono-tech text-[#F4F7FA] font-medium flex items-center gap-3">
                <span>RETRY LIMIT</span>
                <span className="text-[14px] text-[#FF667A] line-through">3</span>
                <span className="text-[#5CEBFF]">→</span>
                <span className="text-[14px] text-[#65E6A5]">5</span>
              </div>
              <div className="text-[11px] font-mono-tech text-[#A7B0BD] mt-2">
                Commit: <code>fa82c01</code> in <code>config/network.ts</code>
              </div>
            </div>

            {/* Micro consequence tracker summary */}
            <div className="space-y-2 text-[12px] font-mono-tech">
              <div className="text-[#697482] text-[11px] uppercase tracking-wider mb-2">
                DOWNSTREAM IMPACT PROJECTION
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#A7B0BD]">Total Surfaces Assessed:</span>
                <span className="text-[#F4F7FA]">5</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-[#A7B0BD]">Contradictions Generated:</span>
                <span className="text-[#FF667A]">3 Violations</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#A7B0BD]">Invariant Integrity:</span>
                <span className="text-[#F4C95D]">Compromised (Requires Healing)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cascading Invariant Consequence Stack */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="text-[11px] font-mono-tech text-[#697482] uppercase tracking-[0.1em] mb-4">
              EPISTEMIC CONSEQUENCE CASCADE
            </div>

            {CONSEQUENCES.map((item, idx) => {
              const isSelected = hoveredIdx === idx;
              return (
                <div
                  key={item.target}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className={`p-5 rounded-xl border transition-all duration-300 relative cursor-pointer ${
                    isSelected
                      ? "border-[#5CEBFF]/50 bg-[#10151D] shadow-[0_0_24px_rgba(92,235,255,0.06)]"
                      : "border-white/[0.06] bg-[#0B0F15]/80 hover:border-white/[0.14]"
                  }`}
                  data-interactive="true"
                >
                  {/* Active highlight marker */}
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-[#5CEBFF] rounded-r" />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[14px] font-mono-tech font-medium text-[#F4F7FA]">
                        {item.target}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-mono-tech font-medium px-2 py-0.5 rounded border"
                      style={{
                        color: item.statusColor,
                        borderColor: `${item.statusColor}40`,
                        backgroundColor: `${item.statusColor}10`,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#A7B0BD] leading-relaxed font-sans">
                    {item.impact}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-[10px] font-mono-tech text-[#697482]">
                    <span>SEVERITY: {item.severity}</span>
                    <span>•</span>
                    <span>AUTOMATIC REMEDIATION: AVAILABLE</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
