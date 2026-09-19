import React from "react";

const CHANNELS = [
  { name: "HTML DOCS", format: "Semantic Web", desc: "Customer documentation & reference guides" },
  { name: "MARKDOWN / MDX", format: "Git Commits", desc: "Repository developer handbooks & READMEs" },
  { name: "OPENAPI JSON", format: "RFC 7946", desc: "Machine-readable API schemas & contracts" },
  { name: "JSON-LD GRAPH", format: "Schema.org", desc: "Structured search engine semantic knowledge" },
  { name: "VECTOR SEARCH", format: "Hybrid RAG", desc: "Living embeddings for developer search" },
  { name: "AGENT CONTEXT", format: "Rules & Prompt", desc: "Autonomous AI system prompt invariants" },
  { name: "MCP PROTOCOL", format: "Tool Signatures", desc: "Anthropic / OpenAI tool context manifests" },
];

export function UniversalArchitecture() {
  return (
    <section
      id="architecture"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            06 // UNIVERSAL PROJECTION
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1100px]">
            ONE CONTRACT.
            <br />
            EVERY SURFACE.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[660px] font-sans mt-8 leading-[1.5]">
            Cognis doesn&apos;t just maintain human documentation. It continuously projects one canonical
            truth across every format consumed by developers, search engines, and AI agents.
          </p>
        </div>

        {/* Monolithic Architecture Grid */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* Central Canonical Nucleus */}
          <div className="p-8 border border-[#E05A2B]/40 bg-[#141411] mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#E05A2B] block mb-1">
                CANONICAL TRUTH
              </span>
              <div className="text-[26px] sm:text-[34px] font-sans font-medium text-[#F2EFE9]">
                Verified Behavioral Invariant Model
              </div>
            </div>
            <span className="px-4 py-1.5 border border-[#9AA68A] text-[#9AA68A] text-[11px] font-mono-tech uppercase tracking-wider self-start sm:self-center">
              SYNCHRONIZED // 100%
            </span>
          </div>

          {/* 7 Surface Projections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map((ch, idx) => (
              <div
                key={ch.name}
                className="p-6 border border-[#282823] bg-[#0E0E0B] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C1C17] text-[10px] font-mono-tech text-[#66655E]">
                    <span>CHANNEL 0{idx + 1}</span>
                    <span>FORMAT: {ch.format}</span>
                  </div>
                  <div className="text-[16px] font-mono-tech font-medium text-[#F2EFE9] mb-2">
                    {ch.name}
                  </div>
                  <p className="text-[12px] font-sans text-[#8C887B] leading-relaxed">
                    {ch.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#1C1C17] flex items-center justify-between text-[10px] font-mono-tech text-[#9AA68A]">
                  <span>SYNCHRONIZED</span>
                  <span>✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
