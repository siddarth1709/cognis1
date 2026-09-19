import React from "react";

export function RepriseCtaScene() {
  return (
    <section
      id="reprise"
      className="relative w-full py-36 sm:py-48 px-6 sm:px-12 lg:px-[8vw] bg-[#0B0B09] border-t border-[#1C1C17] select-none"
    >
      <div className="max-w-[900px]">
        {/* Eyebrow Milestone */}
        <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#66655E] uppercase mb-8">
          NARRATIVE RESOLUTION // 008
        </div>

        {/* Narrative Reprise Headline */}
        <div className="headline-editorial-section text-[#EDE9DF] font-sans mb-20">
          <div>Software changes.</div>
          <div>
            Knowledge <span className="text-[#D8663D] font-medium">keeps</span> up.
          </div>
        </div>

        {/* Thin Structural Divider Rule */}
        <div className="w-full h-[1px] bg-[#282823] mb-20" />

        {/* Final Architectural Statement & CTA */}
        <div>
          <h2 className="headline-editorial-hero text-[#EDE9DF] font-sans mb-8">
            Make your product
            <br />
            explain itself.
          </h2>

          <p className="text-[18px] leading-[1.55] text-[#A9A69D] max-w-[560px] font-sans mb-12">
            Cognis continuously connects software behavior, product contracts and the knowledge
            built around them.
          </p>

          <a
            href="mailto:contact@cognis.dev"
            className="group inline-flex items-center gap-3 px-6 h-[44px] border border-[#393832] rounded-[2px] text-[12px] font-mono-tech tracking-[0.14em] text-[#EDE9DF] uppercase hover:border-[#D8663D] hover:text-[#D8663D] transition-colors"
            data-cursor="contract"
          >
            <span>ENTER COGNIS</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1.5 text-[#D8663D]">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
