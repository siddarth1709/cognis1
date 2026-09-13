"use client";

import { useEffect, useRef, useState } from "react";

const EVIDENCE_FRAGMENTS = [
  { id: "source", name: "source.ts", type: "Implementation", color: "#5CEBFF", delay: 0 },
  { id: "test", name: "test.ts", type: "Test Assertion", color: "#8B7CFF", delay: 1 },
  { id: "api", name: "openapi.yaml", type: "Interface Schema", color: "#5CEBFF", delay: 2 },
  { id: "example", name: "example.ts", type: "Usage Sample", color: "#A7B0BD", delay: 3 },
  { id: "guide", name: "guide.mdx", type: "Human Doc", color: "#697482", delay: 4 },
  { id: "diff", name: "git diff", type: "Commit Delta", color: "#8B7CFF", delay: 5 },
];

const STAGES = [
  { num: "01", name: "OBSERVE", desc: "Ingest multi-surface ASTs, diffs & traces" },
  { num: "02", name: "UNDERSTAND", desc: "Synthesize executable runtime behaviors" },
  { num: "03", name: "REASON", desc: "Cross-correlate against implied contracts" },
  { num: "04", name: "CHALLENGE", desc: "Falsify assumptions via counterfactuals" },
  { num: "05", name: "DECIDE", desc: "Determine epistemic certainty & repair safety" },
  { num: "06", name: "VERIFY", desc: "Validate 8 knowledge representations" },
];

const CENTER_TRANSFORMS = [
  { title: "COGNIS", subtitle: "SYNTHESIS CORE", status: "INGESTING EVIDENCE" },
  { title: "BEHAVIORAL MODEL", subtitle: "RUNTIME TOPOLOGY", status: "RECONSTRUCTING STATE" },
  { title: "CONTRACT ENGINE", subtitle: "PROMISE INVARIANTS", status: "TRACING BOUNDARIES" },
  { title: "CONSEQUENCE GRAPH", subtitle: "DOWNSTREAM IMPACT", status: "CALCULATING DELTAS" },
  { title: "DECISION MATRIX", subtitle: "EPISTEMIC VERDICT", status: "BOUNDING REPAIR" },
];

export function CognitiveEngineSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [cycleIndex, setCycleIndex] = useState(0);

  // Cycle center state automatically or based on active stage
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % CENTER_TRANSFORMS.length);
      setActiveStage((prev) => (prev % STAGES.length) + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const currentCenter = CENTER_TRANSFORMS[cycleIndex];

  return (
    <section
      id="cognition"
      ref={sectionRef}
      className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#0B0F15] border-t border-white/[0.04] transition-colors duration-1000"
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            02 / COGNITION
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[760px]">
            Cognis doesn&apos;t compare files.
            <br />
            It reconstructs behavior.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            It turns source code, tests, APIs, examples and documentation into an evidence-backed model
            of what the product actually does.
          </p>
        </div>

        {/* Central Convergence Visualization Diagram */}
        <div className="relative w-full rounded-2xl border border-white/[0.07] bg-[#07090D]/90 p-8 sm:p-12 overflow-hidden mb-20">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] pointer-events-none rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, rgba(92,235,255,0.06) 0%, rgba(139,124,255,0.04) 50%, transparent 80%)",
            }}
          />

          {/* Diagram Title Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 mb-10 border-b border-white/[0.06] text-[11px] font-mono-tech gap-3">
            <span className="text-[#697482] uppercase tracking-[0.08em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5CEBFF]" />
              EVIDENCE SYNTHESIS TOPOLOGY
            </span>
            <span className="text-[#5CEBFF] bg-[#5CEBFF]/10 px-2.5 py-0.5 rounded border border-[#5CEBFF]/20">
              REAL-TIME RECONSTRUCTION ACTIVE
            </span>
          </div>

          {/* Convergence Stage Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Source Fragments (Source, Test, OpenAPI) */}
            <div className="lg:col-span-3 space-y-4">
              {EVIDENCE_FRAGMENTS.slice(0, 3).map((frag, idx) => (
                <div
                  key={frag.id}
                  className="p-3.5 rounded-xl border border-white/[0.08] bg-[#10151D]/90 flex items-center justify-between hover:border-[#5CEBFF]/40 transition-all duration-300 group"
                  data-interactive="true"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: frag.color }}
                    />
                    <span className="text-[13px] font-mono-tech text-[#F4F7FA]">{frag.name}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-[#697482]">{frag.type}</span>
                </div>
              ))}
            </div>

            {/* Central Synthesis Nucleus */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center py-6 sm:py-10">
              <div className="relative w-full max-w-[340px] aspect-square rounded-full border border-white/[0.1] flex flex-col items-center justify-center p-8 bg-[#0B0F15]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                {/* Orbiting Subtle Rings */}
                <div className="absolute inset-2 rounded-full border border-dashed border-[#5CEBFF]/20 animate-spin" style={{ animationDuration: "60s" }} />
                <div className="absolute inset-6 rounded-full border border-white/[0.04]" />

                {/* Pulsing Core */}
                <div className="relative z-10 text-center flex flex-col items-center">
                  <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#5CEBFF] mb-2">
                    {currentCenter.subtitle}
                  </span>
                  <div className="text-[21px] sm:text-[24px] font-sans font-semibold tracking-tight text-[#F4F7FA] transition-all duration-300">
                    {currentCenter.title}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B7CFF]/30 bg-[#8B7CFF]/[0.08] text-[10px] font-mono-tech text-[#8B7CFF]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-pulse" />
                    {currentCenter.status}
                  </div>
                </div>

                {/* Small indicator dots around core */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#5CEBFF]" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#A7B0BD]" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#5CEBFF]" />
              </div>
            </div>

            {/* Right Column: Ground Truth & Diffs (Example, Guide, Diff) */}
            <div className="lg:col-span-3 space-y-4">
              {EVIDENCE_FRAGMENTS.slice(3, 6).map((frag, idx) => (
                <div
                  key={frag.id}
                  className="p-3.5 rounded-xl border border-white/[0.08] bg-[#10151D]/90 flex items-center justify-between hover:border-[#8B7CFF]/40 transition-all duration-300 group"
                  data-interactive="true"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: frag.color }}
                    />
                    <span className="text-[13px] font-mono-tech text-[#F4F7FA]">{frag.name}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-[#697482]">{frag.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6 Cognitive Stages (Horizontal on desktop, vertical on mobile) */}
        <div>
          <div className="text-[11px] font-mono-tech text-[#697482] uppercase tracking-[0.1em] mb-6">
            EXECUTION PIPELINE
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STAGES.map((stage, idx) => {
              const isActive = activeStage === idx + 1;
              return (
                <div
                  key={stage.num}
                  onClick={() => {
                    setActiveStage(idx + 1);
                    setCycleIndex(idx % CENTER_TRANSFORMS.length);
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                    isActive
                      ? "border-[#5CEBFF]/60 bg-[#10151D] shadow-[0_0_20px_rgba(92,235,255,0.08)]"
                      : "border-white/[0.05] bg-[#07090D]/60 hover:border-white/[0.15]"
                  }`}
                  data-interactive="true"
                >
                  {/* Top 1px Cyan Line when active */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5CEBFF] to-[#8B7CFF] rounded-t-xl" />
                  )}
                  <div className="text-[11px] font-mono-tech text-[#697482] mb-1.5">
                    {stage.num}
                  </div>
                  <div
                    className={`text-[13px] font-sans font-medium tracking-wide mb-1 transition-colors ${
                      isActive ? "text-[#5CEBFF]" : "text-[#A7B0BD]"
                    }`}
                  >
                    {stage.name}
                  </div>
                  <div className="text-[11px] text-[#697482] leading-snug font-sans">
                    {stage.desc}
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
