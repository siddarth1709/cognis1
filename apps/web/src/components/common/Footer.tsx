import React from "react";
import { SplitBrainLogo } from "../ui/SplitBrainLogo";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.05] bg-[#07090D] py-16 px-6 sm:px-8 md:px-12 text-[#A7B0BD]">
      <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        {/* Left: Brand mark & tagline */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <SplitBrainLogo size={24} />
            <span className="text-[16px] font-sans font-medium text-[#F4F7FA]">Cognis</span>
          </div>
          <p className="text-[13px] text-[#697482] font-sans">
            Knowledge that keeps up.
          </p>
          <div className="text-[11px] font-mono-tech text-[#3D4652] pt-2">
            © {new Date().getFullYear()} Cognis Technologies. All rights reserved.
          </div>
        </div>

        {/* Navigation & Link Columns */}
        <div className="grid grid-cols-3 gap-8 sm:gap-14 text-[13px] font-sans">
          <div>
            <div className="text-[11px] font-mono-tech text-[#F4F7FA] uppercase tracking-wider mb-3">
              Product
            </div>
            <ul className="space-y-2 text-[#A7B0BD]">
              <li>
                <a href="#cognition" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Cognition
                </a>
              </li>
              <li>
                <a href="#forensics" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Forensics
                </a>
              </li>
              <li>
                <a href="#self-healing" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Self-Healing
                </a>
              </li>
              <li>
                <a href="#agent-ready" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono-tech text-[#F4F7FA] uppercase tracking-wider mb-3">
              Resources
            </div>
            <ul className="space-y-2 text-[#A7B0BD]">
              <li>
                <a href="#" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com" className="hover:text-[#5CEBFF] transition-colors" target="_blank" rel="noreferrer" data-interactive="true">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-mono-tech text-[#F4F7FA] uppercase tracking-wider mb-3">
              Legal
            </div>
            <ul className="space-y-2 text-[#A7B0BD]">
              <li>
                <a href="#" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#5CEBFF] transition-colors" data-interactive="true">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
