"use client";

import { useEffect, useState } from "react";

const HEALING_STATES = [
  { id: "contradicted", label: "CONTRADICTED", color: "#FF667A", desc: "Contract discrepancy detected" },
  { id: "investigating", label: "INVESTIGATING", color: "#F4C95D", desc: "Correlating multi-surface evidence" },
  { id: "planned", label: "REPAIR PLANNED", color: "#8B7CFF", desc: "Synthesizing minimal semantic diff" },
  { id: "healing", label: "HEALING", color: "#5CEBFF", desc: "Applying bounded document patch" },
  { id: "verifying", label: "VERIFYING", color: "#8B7CFF", desc: "Cross-testing all 8 representations" },
  { id: "restored", label: "RESTORED", color: "#65E6A5", desc: "Consensus verified across ecosystem" },
];

const SURFACES = [
  { name: "IMPLEMENTATION", file: "src/retry_policy.ts" },
  { name: "TESTS", file: "tests/retry_backoff.test.ts" },
  { name: "EXAMPLE", file: "examples/quickstart.ts" },
  { name: "DOCUMENTATION", file: "docs/reliability.md" },
  { name: "JSON", file: "schemas/contracts/C-017.json" },
  { name: "JSON-LD", file: "meta/graph.jsonld" },
  { name: "AGENT", file: "agent_context/invariants.md" },
  { name: "MCP", file: "tools/cognis_protocol.json" },
];

export function SelfHealingSection() {
  const [currentStateIdx, setCurrentStateIdx] = useState(3); // default to HEALING / VERIFYING
  const [verifiedCount, setVerifiedCount] = useState(8);
  const [autoRun, setAutoRun] = useState(false);

  // Progressive state animator
  useEffect(() => {
    if (!autoRun) return;
    const interval = setInterval(() => {
      setCurrentStateIdx((prev) => (prev + 1) % HEALING_STATES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [autoRun]);

  const activeState = HEALING_STATES[currentStateIdx];
  const isHealed = currentStateIdx >= 3;
  const isRestored = currentStateIdx === 5;

  return (
    <section
      id="self-healing"
      className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#090D12] border-t border-white/[0.04]"
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            04 / SELF-HEALING
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[760px]">
            When knowledge breaks,
            <br />
            Cognis repairs it.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            Repairs are bounded by evidence, policy and verification. When the system cannot prove a safe
            correction, it stops and asks for a human decision.
          </p>
        </div>

        {/* State Machine Pipeline Progress Tracker */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#07090D] mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
            <span className="text-[11px] font-mono-tech text-[#697482] uppercase tracking-[0.08em]">
              KNOWLEDGE STATE MACHINE TRANSITION
            </span>
            <button
              type="button"
              onClick={() => {
                setAutoRun(!autoRun);
                if (isRestored) setCurrentStateIdx(0);
              }}
              className="text-[11px] font-mono-tech px-3 py-1 rounded border border-white/[0.1] text-[#A7B0BD] hover:text-[#5CEBFF] hover:border-[#5CEBFF]/40 transition-colors"
              data-interactive="true"
            >
              {autoRun ? "Pause Simulation" : "Step Sequence"}
            </button>
          </div>

          {/* Pipeline Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {HEALING_STATES.map((state, idx) => {
              const isActive = idx === currentStateIdx;
              const isPast = idx < currentStateIdx;
              return (
                <div
                  key={state.id}
                  onClick={() => setCurrentStateIdx(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#10151D] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                      : isPast
                      ? "border-white/[0.08] bg-white/[0.01] opacity-70"
                      : "border-white/[0.04] bg-transparent opacity-40"
                  }`}
                  style={{
                    borderColor: isActive ? state.color : undefined,
                  }}
                  data-interactive="true"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-tech text-[#697482]">
                      STAGE 0{idx + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full transition-transform"
                      style={{
                        backgroundColor: state.color,
                        boxShadow: isActive ? `0 0 8px ${state.color}` : "none",
                      }}
                    />
                  </div>
                  <div
                    className="text-[12px] font-mono-tech font-semibold tracking-wider uppercase mb-1"
                    style={{ color: isActive ? state.color : "#F4F7FA" }}
                  >
                    {state.label}
                  </div>
                  <p className="text-[10px] text-[#697482] leading-snug">{state.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Climax Visual: Live Documentation Diff Repair & 8-Surface Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Live Document Diff Being Repaired */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#07090D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06] text-[11px] font-mono-tech">
                <span className="text-[#697482] uppercase">SYNTACTIC PATCH GENERATION</span>
                <span className="text-[#5CEBFF]">docs/reliability.md</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F15] border border-white/[0.06] font-mono-tech text-[12px] space-y-3">
                <div className="text-[#697482] text-[11px]">
                  @@ -14,7 +14,7 @@ section: Network Invariants
                </div>
                <div className="text-[#697482]">
                  {" "}The Cognis HTTP gateway enforces exponential backoff.
                </div>

                {/* Old Stale Text fading */}
                <div
                  className={`p-2.5 rounded border border-[#FF667A]/30 bg-[#FF667A]/10 text-[#FF667A] transition-all duration-500 ${
                    isHealed ? "line-through opacity-40" : "opacity-100"
                  }`}
                >
                  - Requests retry 3 times before terminal error.
                </div>

                {/* Repaired Text Appearing */}
                <div
                  className={`p-2.5 rounded border border-[#65E6A5]/40 bg-[#65E6A5]/10 text-[#65E6A5] transition-all duration-500 ${
                    isHealed ? "opacity-100 translate-y-0" : "opacity-20 translate-y-1"
                  }`}
                >
                  + Requests retry up to 5 times before terminal error.
                </div>

                <div className="text-[#697482]">
                  {" "}Failure events propagate to telemetry buffers.
                </div>
              </div>
            </div>

            {/* Repair Bounding Proof */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono-tech text-[#697482]">
              <span>PROOF BOUND: EXHAUSTIVE</span>
              <span className="text-[#65E6A5]">SAFETY SCORE: 1.0 (NO AMBIGUITY)</span>
            </div>
          </div>

          {/* Right Column: 8-Surface Sequential Verification */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#07090D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06] text-[11px] font-mono-tech">
                <span className="text-[#697482] uppercase">MULTI-SURFACE CONSENSUS VERIFICATION</span>
                <span className="text-[#65E6A5]">8 / 8 SURFACES VERIFIED</span>
              </div>

              {/* 8 Surfaces Checklist */}
              <div className="space-y-2.5">
                {SURFACES.map((surface, idx) => (
                  <div
                    key={surface.name}
                    className="p-3 rounded-lg border border-white/[0.05] bg-[#0B0F15] flex items-center justify-between text-[12px] font-mono-tech"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#65E6A5]" />
                      <span className="text-[#F4F7FA] font-medium">{surface.name}</span>
                      <span className="text-[#697482] text-[11px] hidden sm:inline">{surface.file}</span>
                    </div>
                    <span className="text-[#65E6A5] font-bold text-[13px]">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restored Climax Banner */}
            <div className="mt-6 p-4 rounded-xl border border-[#65E6A5]/30 bg-[#65E6A5]/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65E6A5] animate-subtle-pulse" />
                <div>
                  <div className="text-[14px] font-sans font-semibold tracking-wide text-[#65E6A5]">
                    KNOWLEDGE RESTORED
                  </div>
                  <div className="text-[11px] font-mono-tech text-[#A7B0BD]">
                    All canonical artifacts and agent contexts in perfect alignment.
                  </div>
                </div>
              </div>
              <span className="text-[12px] font-mono-tech px-2.5 py-1 rounded bg-[#65E6A5]/10 text-[#65E6A5]">
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
