"use client";

import { useState } from "react";

const SURFACES = [
  { id: "html", label: "HTML Portals", type: "Customer Web Docs", format: "Semantic HTML5" },
  { id: "markdown", label: "Markdown / MDX", type: "Developer Guides", format: "Git Commits" },
  { id: "json", label: "OpenAPI JSON", type: "API Contracts", format: "RFC 7946" },
  { id: "jsonld", label: "JSON-LD", type: "Search Structured Data", format: "Schema.org" },
  { id: "search", label: "Vector Search", type: "Semantic Knowledge Embeddings", format: "Hybrid RAG" },
  { id: "agent", label: "Agent Invariants", type: "LLM Context Window", format: "Markdown & Rules" },
  { id: "mcp", label: "MCP Protocol", type: "Model Context Protocol", format: "Tool Schemas" },
];

export function AgentReadySection() {
  const [hoveredSurface, setHoveredSurface] = useState<string | null>(null);

  return (
    <section
      id="agent-ready"
      className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#07090D] border-t border-white/[0.04]"
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center max-w-[760px] mx-auto">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            UNIVERSAL SURFACE PROJECTION
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans">
            One truth.
            <br />
            Every surface.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] mt-6">
            Cognis doesn&apos;t just update a human documentation website. It synchronously projects the
            canonical contract across every format your developers, consumers, and AI agents depend on.
          </p>
        </div>

        {/* Radial System Diagram */}
        <div className="relative w-full max-w-[900px] mx-auto p-6 sm:p-12 rounded-2xl border border-white/[0.07] bg-[#0B0F15] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none rounded-full blur-[120px]"
            style={{
              background: "radial-gradient(circle, rgba(92,235,255,0.05) 0%, rgba(139,124,255,0.03) 60%, transparent 80%)",
            }}
          />

          {/* Central Canonical Contract Nucleus */}
          <div className="flex flex-col items-center justify-center my-8 relative z-10">
            <div className="p-6 rounded-2xl border border-[#5CEBFF]/50 bg-[#10151D] text-center shadow-[0_0_35px_rgba(92,235,255,0.1)] max-w-[280px]">
              <span className="text-[10px] font-mono-tech uppercase tracking-[0.16em] text-[#5CEBFF] block mb-1">
                CANONICAL TRUTH
              </span>
              <div className="text-[17px] font-sans font-semibold text-[#F4F7FA]">
                Verified Contract Invariant
              </div>
              <div className="mt-2 text-[11px] font-mono-tech text-[#65E6A5] flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#65E6A5]" />
                SINGLE RECONSTRUCTED MODEL
              </div>
            </div>
          </div>

          {/* Radiating Surfaces Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10 mt-8">
            {SURFACES.map((surface) => {
              const isHovered = hoveredSurface === surface.id;
              return (
                <div
                  key={surface.id}
                  onMouseEnter={() => setHoveredSurface(surface.id)}
                  onMouseLeave={() => setHoveredSurface(null)}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isHovered
                      ? "border-[#5CEBFF]/60 bg-[#10151D] shadow-[0_0_20px_rgba(92,235,255,0.08)] -translate-y-0.5"
                      : "border-white/[0.06] bg-[#07090D]/80 hover:border-white/[0.15]"
                  }`}
                  data-interactive="true"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-mono-tech text-[#F4F7FA] font-medium">
                      {surface.label}
                    </span>
                    <span className="text-[10px] font-mono-tech text-[#5CEBFF] uppercase">
                      SYNCED ✓
                    </span>
                  </div>
                  <div className="text-[12px] text-[#A7B0BD] font-sans mb-2">
                    {surface.type}
                  </div>
                  <div className="text-[10px] font-mono-tech text-[#697482]">
                    FORMAT: {surface.format}
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
