import React from "react";
import { IndustrialLogo } from "../ui/IndustrialLogo";

export function MonumentalFooter() {
  return (
    <footer className="w-full border-t border-[#1C1C17] bg-[#060604] py-20 px-6 sm:px-12 lg:px-16 text-[#8C887B] select-none">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-14">
        {/* Left: Brand Monolith */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <IndustrialLogo size={22} />
            <span className="text-[16px] font-mono-tech tracking-[0.16em] uppercase text-[#F2EFE9] font-medium">
              COGNIS TECHNOLOGIES
            </span>
          </div>
          <div className="text-[12px] font-mono-tech tracking-[0.16em] uppercase text-[#66655E]">
            THE COGNITIVE LAYER BETWEEN SOFTWARE &amp; PRODUCT KNOWLEDGE.
          </div>
          <div className="text-[10px] font-mono-tech text-[#393832] pt-4">
            © {new Date().getFullYear()} COGNIS TECHNOLOGIES. DETERMINISTIC ARCHITECTURE.
          </div>
        </div>

        {/* Right: Architectural Directory Columns */}
        <div className="flex flex-wrap items-start gap-12 sm:gap-20 text-[11px] font-mono-tech">
          <div>
            <div className="text-[#66655E] uppercase tracking-[0.16em] mb-4">ENGINE</div>
            <ul className="space-y-2.5 text-[#8C887B]">
              <li>
                <a href="#gap" className="hover:text-[#F2EFE9] transition-colors">
                  01 // DRIFT GAP
                </a>
              </li>
              <li>
                <a href="#forensics" className="hover:text-[#F2EFE9] transition-colors">
                  02 // FORENSICS
                </a>
              </li>
              <li>
                <a href="#consequence" className="hover:text-[#F2EFE9] transition-colors">
                  03 // CONSEQUENCE
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[#66655E] uppercase tracking-[0.16em] mb-4">RESTRICTION</div>
            <ul className="space-y-2.5 text-[#8C887B]">
              <li>
                <a href="#healing" className="hover:text-[#F2EFE9] transition-colors">
                  04 // HEALING
                </a>
              </li>
              <li>
                <a href="#refusal" className="hover:text-[#F2EFE9] transition-colors">
                  05 // REFUSAL
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-[#F2EFE9] transition-colors">
                  06 // PROJECTION
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[#66655E] uppercase tracking-[0.16em] mb-4">NETWORK</div>
            <ul className="space-y-2.5 text-[#8C887B]">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#F2EFE9] transition-colors">
                  GITHUB
                </a>
              </li>
              <li>
                <a href="mailto:contact@cognis.dev" className="hover:text-[#F2EFE9] transition-colors">
                  CONTACT
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
