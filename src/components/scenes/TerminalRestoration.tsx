"use client";

import { useState } from "react";

const SURFACES = [
  { id: "impl", name: "IMPLEMENTATION", file: "src/retry.ts:42", status: "VERIFIED" },
  { id: "test", name: "TEST SUITE", file: "tests/retry.test.ts:18", status: "VERIFIED" },
  { id: "ex", name: "EXAMPLES", file: "examples/quickstart.ts", status: "VERIFIED" },
  { id: "docs", name: "DOCUMENTATION", file: "docs/reliability.md:38", status: "VERIFIED" },
  { id: "json", name: "OPENAPI JSON", file: "contracts/schema.json", status: "VERIFIED" },
  { id: "jsonld", name: "JSON-LD GRAPH", file: "meta/context.jsonld", status: "VERIFIED" },
  { id: "agent", name: "AGENT INVARIANTS", file: "agent_context/rules.md", status: "VERIFIED" },
  { id: "mcp", name: "MCP PROTOCOL", file: "tools/cognis_mcp.json", status: "VERIFIED" },
];

export function TerminalRestoration() {
  const [isHealed, setIsHealed] = useState(true);

  return (
    <section
      id="healing"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4">
            04 // SELF-HEALING ENGINE
          </div>
          <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] max-w-[1100px]">
            KNOWLEDGE BROKE.
            <br />
            COGNIS REPAIRS IT.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#8C887B] max-w-[620px] font-sans mt-8 leading-[1.5]">
            Repairs are strictly bounded by mathematical evidence and verified against 8 independent
            software surfaces before committing to publication.
          </p>
        </div>

        {/* Monolithic Terminal Restoration Canvas */}
        <div className="border border-[#1C1C17] bg-[#0C0C09] p-8 sm:p-14">
          {/* Terminal Header */}
          <div className="flex flex-wrap items-center justify-between pb-8 mb-10 border-b border-[#1C1C17] text-[11px] font-mono-tech gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#9AA68A]" />
              <span className="text-[#F2EFE9] tracking-[0.16em]">
                HEALING RUN // TRANSACTION H-184
              </span>
            </div>
            <div className="flex items-center gap-6 text-[#66655E]">
              <span>TARGET CONTRACT: C-017</span>
              <span>PROOF CERTAINTY: 1.00</span>
              <button
                type="button"
                onClick={() => setIsHealed(!isHealed)}
                className="px-3 py-1 border border-[#393832] rounded-[2px] text-[#F2EFE9] hover:border-[#E05A2B] hover:text-[#E05A2B] transition-colors"
              >
                {isHealed ? "VIEW UNPATCHED STATE" : "APPLY BOUNDED REPAIR"}
              </button>
            </div>
          </div>

          {/* Live Documentation Diff Patching */}
          <div className="p-8 border border-[#282823] bg-[#0E0E0B] font-mono-tech text-[13px] sm:text-[14px] mb-12">
            <div className="text-[11px] text-[#66655E] pb-3 mb-4 border-b border-[#1C1C17] flex items-center justify-between">
              <span>PATCH FILE: docs/reliability.md (LINE 38)</span>
              <span>STATUS: {isHealed ? "PATCH APPLIED" : "STALE STATE"}</span>
            </div>

            <div className="text-[#66655E] text-[12px] mb-2">@@ -37,3 +37,3 @@</div>
            <div className="text-[#8C887B] mb-2">
              {" "}The Cognis HTTP gateway client enforces bounded exponential backoff retry cycles.
            </div>

            {/* Stale text fading */}
            <div
              className={`p-3 border text-[#B84A3A] transition-all duration-300 ${
                isHealed
                  ? "line-through opacity-25 border-transparent bg-transparent"
                  : "border-[#B84A3A]/40 bg-[#B84A3A]/[0.05]"
              }`}
            >
              - Requests retry 3 times before terminal backoff abort.
            </div>

            {/* Restored text appearing */}
            <div
              className={`p-3 border text-[#9AA68A] mt-2 transition-all duration-300 ${
                isHealed
                  ? "border-[#9AA68A]/40 bg-[#9AA68A]/[0.05] opacity-100"
                  : "border-transparent bg-transparent opacity-10"
              }`}
            >
              + Requests retry up to 5 times before terminal backoff abort.
            </div>
          </div>

          {/* 8-Surface Verification Protocols */}
          <div>
            <div className="text-[11px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] mb-6">
              MULTI-SURFACE CONSENSUS VERIFICATION PROTOCOL (8 SURFACES)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SURFACES.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border border-[#282823] bg-[#0E0E0B] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2 text-[10px] font-mono-tech">
                    <span className="text-[#66655E]">{s.name}</span>
                    <span className="text-[#9AA68A] font-bold">✓</span>
                  </div>
                  <div className="text-[11px] font-mono-tech text-[#8C887B] truncate">
                    {s.file}
                  </div>
                </div>
              ))}
            </div>

            {/* Final Restored Seal */}
            <div className="mt-8 pt-6 border-t border-[#1C1C17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono-tech text-[#9AA68A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9AA68A]" />
                <span className="font-semibold uppercase tracking-[0.16em]">
                  8 / 8 SURFACES SYNCHRONIZED &amp; VERIFIED
                </span>
              </div>
              <span className="text-[#8C887B]">TRANSACTION COMMITTED TO CANONICAL LEDGER</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
