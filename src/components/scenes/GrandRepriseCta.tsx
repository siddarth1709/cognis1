import React from "react";

export function GrandRepriseCta() {
  return (
    <section
      id="reprise"
      className="relative w-full py-36 sm:py-52 px-6 sm:px-12 lg:px-16 bg-[#080806] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Milestone Tag */}
        <div className="text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-10">
          NARRATIVE CLOSURE // 007
        </div>

        {/* Monumental Reprise */}
        <div className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] mb-24 max-w-[1200px]">
          <div>SOFTWARE CHANGES.</div>
          <div>
            KNOWLEDGE <span className="text-[#E05A2B]">KEEPS</span> UP.
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="w-full h-[1px] bg-[#1C1C17] mb-24" />

        {/* Grand Final CTA Statement */}
        <div className="max-w-[1100px]">
          <h2 className="font-monumental-hero text-[#F2EFE9] uppercase tracking-[-0.065em] mb-10">
            MAKE YOUR SOFTWARE
            <br />
            EXPLAIN ITSELF.
          </h2>

          <p className="text-[20px] sm:text-[24px] leading-[1.45] text-[#8C887B] max-w-[660px] font-sans mb-14">
            Cognis continuously connects software behavior, product contracts, and the knowledge
            built around them.
          </p>

          <a
            href="mailto:contact@cognis.dev"
            className="group inline-flex items-center gap-4 h-[54px] px-10 border border-[#393832] rounded-[2px] text-[13px] font-mono-tech tracking-[0.16em] text-[#F2EFE9] uppercase hover:border-[#E05A2B] hover:text-[#E05A2B] hover:bg-[#E05A2B]/[0.05] transition-all"
          >
            <span>ENTER COGNIS</span>
            <span className="transition-transform duration-200 group-hover:translate-x-2 text-[#E05A2B]">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
