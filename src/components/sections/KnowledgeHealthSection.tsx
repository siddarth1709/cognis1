"use client";

import { useState } from "react";

interface ContractPoint {
  id: string;
  name: string;
  status: "PROVEN" | "UNPROVEN" | "CONTRADICTED";
  evidence: string;
}

// Generate 142 contracts matrix
const CONTRACTS: ContractPoint[] = Array.from({ length: 142 }, (_, i) => {
  const num = (i + 1).toString().padStart(3, "0");
  if (i === 16) {
    return { id: "C-017", name: "Retry policy guarantee", status: "CONTRADICTED", evidence: "PR #184 mismatch" };
  }
  if (i === 81) {
    return { id: "C-082", name: "Timeout resolution unit", status: "CONTRADICTED", evidence: "Conflicting ms vs s" };
  }
  if (i === 24 || i === 48 || i === 95 || i === 118) {
    return { id: `C-${num}`, name: `Dynamic fallback invariant ${num}`, status: "UNPROVEN", evidence: "Pending traces" };
  }
  return {
    id: `C-${num}`,
    name: `Contract specification ${num}`,
    status: "PROVEN",
    evidence: `${Math.floor(Math.random() * 4) + 3} multi-surface sources`,
  };
});

export function KnowledgeHealthSection() {
  const [activePoint, setActivePoint] = useState<ContractPoint>(CONTRACTS[16]); // defaults to C-017

  return (
    <section className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#0B0F15] border-t border-white/[0.04]">
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            KNOWLEDGE INTEGRITY
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[700px]">
            The living contract topology.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] mt-6">
            A real-time telemetry census of every promise, invariant, and behavioral boundary across
            your codebase.
          </p>
        </div>

        {/* Large Architectural 97% Composition */}
        <div className="p-8 sm:p-12 rounded-2xl border border-white/[0.08] bg-[#07090D] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-12 border-b border-white/[0.06]">
            {/* Left: 97% Big Number */}
            <div className="lg:col-span-5">
              <div className="text-[84px] sm:text-[104px] font-sans font-medium tracking-tight text-[#F4F7FA] leading-none mb-3">
                97<span className="text-[#5CEBFF]">%</span>
              </div>
              <div className="text-[13px] font-mono-tech uppercase tracking-[0.14em] text-[#A7B0BD]">
                VERIFIED PRODUCT KNOWLEDGE
              </div>
            </div>

            {/* Right: Contract Breakdown Metrics */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] font-mono-tech">
              <div className="p-4 rounded-xl border border-white/[0.05] bg-[#0B0F15]">
                <div className="text-[#697482] mb-1">TOTAL CONTRACTS</div>
                <div className="text-[20px] text-[#F4F7FA] font-medium">142</div>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.05] bg-[#0B0F15]">
                <div className="text-[#65E6A5] mb-1">PROVEN INVARIANTS</div>
                <div className="text-[20px] text-[#65E6A5] font-medium">136</div>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.05] bg-[#0B0F15]">
                <div className="text-[#F4C95D] mb-1">UNPROVEN / PENDING</div>
                <div className="text-[20px] text-[#F4C95D] font-medium">4</div>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.05] bg-[#0B0F15]">
                <div className="text-[#FF667A] mb-1">CONTRADICTED</div>
                <div className="text-[20px] text-[#FF667A] font-medium">2</div>
              </div>
            </div>
          </div>

          {/* 142 Points Field Grid */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4 text-[11px] font-mono-tech text-[#697482]">
              <span>POINT FIELD MATRIX (142 ACTIVE CONTRACTS)</span>
              <span>HOVER TO PROBE INVARIANT</span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-2.5 p-4 rounded-xl bg-[#0B0F15]/80 border border-white/[0.04]">
              {CONTRACTS.map((contract) => {
                const isContradicted = contract.status === "CONTRADICTED";
                const isUnproven = contract.status === "UNPROVEN";
                const isCurrent = activePoint.id === contract.id;

                let dotColor = "bg-[#5CEBFF]/30 hover:bg-[#5CEBFF]";
                if (isContradicted) dotColor = "bg-[#FF667A] animate-pulse";
                else if (isUnproven) dotColor = "bg-[#F4C95D]";

                return (
                  <button
                    key={contract.id}
                    type="button"
                    aria-label={`Inspect contract ${contract.id}`}
                    onMouseEnter={() => setActivePoint(contract)}
                    onClick={() => setActivePoint(contract)}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm transition-all cursor-pointer ${dotColor} ${
                      isCurrent ? "scale-125 ring-2 ring-white/50" : ""
                    }`}
                    data-interactive="true"
                  />
                );
              })}
            </div>

            {/* Invariant Detail Tooltip Card */}
            <div className="mt-6 p-4 rounded-xl border border-white/[0.08] bg-[#10151D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12px] font-mono-tech">
              <div className="flex items-center gap-4">
                <span className="text-[#5CEBFF] font-semibold">{activePoint.id}</span>
                <span className="text-[#3D4652]">|</span>
                <span className="text-[#F4F7FA] font-sans">{activePoint.name}</span>
              </div>

              <div className="flex items-center gap-6 text-[11px]">
                <div>
                  <span className="text-[#697482] mr-2">STATUS:</span>
                  <span
                    className={`font-semibold ${
                      activePoint.status === "PROVEN"
                        ? "text-[#65E6A5]"
                        : activePoint.status === "CONTRADICTED"
                        ? "text-[#FF667A]"
                        : "text-[#F4C95D]"
                    }`}
                  >
                    {activePoint.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#697482] mr-2">EVIDENCE:</span>
                  <span className="text-[#A7B0BD]">{activePoint.evidence}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
