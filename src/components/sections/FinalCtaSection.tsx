"use client";

import { SplitBrainLogo } from "../ui/SplitBrainLogo";

const STRUCTURED_NODES = [
  { label: "SOURCE", sub: "AST & Diffs", color: "#5CEBFF" },
  { label: "BEHAVIOR", sub: "Runtime Traces", color: "#8B7CFF" },
  { label: "CONTRACT", sub: "Invariant Proofs", color: "#5CEBFF" },
  { label: "KNOWLEDGE", sub: "Living Canonical", color: "#65E6A5" },
  { label: "AGENT", sub: "MCP & Context", color: "#8B7CFF" },
];

export function FinalCtaSection() {
  return (
    <section className="relative w-full pt-36 pb-28 px-6 sm:px-8 md:px-12 bg-[#07090D] border-t border-white/[0.04] overflow-hidden">
      <div className="max-w-[1180px] mx-auto text-center flex flex-col items-center">
        {/* Subtle Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8">
          <SplitBrainLogo size={18} />
          <span className="text-[12px] font-mono-tech tracking-[0.14em] uppercase text-[#A7B0BD]">
            THE COGNITIVE LAYER
          </span>
        </div>

        {/* Huge Centered Statement */}
        <h2 className="headline-hero text-[#F4F7FA] font-sans tracking-[-0.045em] max-w-[850px] mb-8">
          Keep your software&apos;s
          <br />
          <span className="text-gradient-cognis inline-block">knowledge alive.</span>
        </h2>

        {/* Supporting Sentence */}
        <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] font-sans mb-12">
          Cognis continuously connects what your software does with what your users,
          developers and agents believe it does.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 mb-32">
          <a
            href="mailto:contact@cognis.dev"
            data-interactive="true"
            className="h-[48px] px-7 rounded-[12px] border border-[#5CEBFF]/50 bg-[#5CEBFF]/[0.08] text-[#F4F7FA] text-[14px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:border-[#5CEBFF] hover:bg-[#5CEBFF]/[0.18] hover:shadow-[0_0_28px_rgba(92,235,255,0.25)] group"
          >
            <span>Enter Cognis</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 text-[#5CEBFF]">→</span>
          </a>

          <a
            href="#agent-ready"
            data-interactive="true"
            className="text-[14px] font-medium text-[#A7B0BD] hover:text-[#F4F7FA] transition-colors duration-200 relative group py-1"
          >
            Explore the architecture
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#A7B0BD] transition-all duration-300 group-hover:w-full group-hover:bg-[#5CEBFF]" />
          </a>
        </div>

        {/* Final Visual: Structured Coherent Knowledge Graph */}
        <div className="w-full max-w-[840px] pt-12 pb-16 flex flex-col items-center">
          <div className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#697482] mb-8">
            RECONSTRUCTED SYSTEM ARCHITECTURE
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
            {STRUCTURED_NODES.map((node, idx) => (
              <div
                key={node.label}
                className="p-4 rounded-xl border border-white/[0.08] bg-[#0B0F15] text-center relative group hover:border-[#5CEBFF]/40 transition-all"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: node.color }}
                />
                <div className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium tracking-wider">
                  {node.label}
                </div>
                <div className="text-[10px] text-[#697482] mt-1 font-mono-tech">
                  {node.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Connected Lines Visual */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#65E6A5] animate-pulse" />
            <span className="text-[11px] font-mono-tech tracking-[0.16em] uppercase text-[#65E6A5]">
              SYSTEM COHERENT
            </span>
          </div>

          {/* Fade to darkness gradient */}
          <div className="w-full h-24 bg-gradient-to-b from-transparent to-[#07090D] mt-8 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
