import React from "react";
import { IndustrialLogo } from "../ui/IndustrialLogo";

export function EditorialFooter() {
  return (
    <footer className="w-full border-t border-[#1C1C17] bg-[#070705] py-14 px-6 sm:px-12 lg:px-[8vw] text-[#A9A69D] select-none">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        {/* Left: Brand mark & Core Position */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <IndustrialLogo size={18} />
            <span className="text-[13px] font-mono-tech tracking-[0.16em] uppercase text-[#EDE9DF]">
              COGNIS
            </span>
          </div>
          <div className="text-[11px] font-mono-tech tracking-[0.12em] uppercase text-[#66655E]">
            KNOWLEDGE THAT KEEPS UP.
          </div>
        </div>

        {/* Right: Tiny Editorial Links & Copyright */}
        <div className="flex flex-wrap items-center gap-8 text-[11px] font-mono-tech text-[#66655E]">
          <a href="#problem" className="hover:text-[#EDE9DF] transition-colors">
            SYSTEM
          </a>
          <a href="#cognition" className="hover:text-[#EDE9DF] transition-colors">
            METHOD
          </a>
          <a href="#forensics" className="hover:text-[#EDE9DF] transition-colors">
            FORENSICS
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#EDE9DF] transition-colors">
            SOURCE
          </a>
          <span className="text-[#282823]">|</span>
          <span>© {new Date().getFullYear()} COGNIS TECHNOLOGIES.</span>
        </div>
      </div>
    </footer>
  );
}
