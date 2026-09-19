"use client";

import { useEffect, useState } from "react";
import { IndustrialLogo } from "../ui/IndustrialLogo";

export function EditorialNav() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 180, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-[68px] bg-[#0B0B09]/90 backdrop-blur-sm transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
      }`}
    >
      <div className="w-full h-full px-6 sm:px-10 md:px-14 flex items-center justify-between">
        {/* Left: Minimal Logo & Brand Wordmark */}
        <a href="#" className="flex items-center gap-3 group">
          <IndustrialLogo size={20} />
          <span className="text-[15px] font-mono-tech tracking-[0.14em] uppercase text-[#EDE9DF]">
            COGNIS
          </span>
        </a>

        {/* Center: Monospace Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 text-[11px] font-mono-tech tracking-[0.12em] text-[#66655E]">
          <a
            href="#problem"
            className="hover:text-[#EDE9DF] transition-colors duration-200"
          >
            SYSTEM
          </a>
          <a
            href="#cognition"
            className="hover:text-[#EDE9DF] transition-colors duration-200"
          >
            METHOD
          </a>
          <a
            href="#forensics"
            className="hover:text-[#EDE9DF] transition-colors duration-200"
          >
            FORENSICS
          </a>
          <a
            href="#architecture"
            className="hover:text-[#EDE9DF] transition-colors duration-200"
          >
            ARCHITECTURE
          </a>
        </nav>

        {/* Right: Rectangular Editorial Button [ ENTER COGNIS ] */}
        <div className="flex items-center gap-4">
          <a
            href="#reprise"
            className="h-[38px] px-4 border border-[#393832] rounded-[2px] text-[11px] font-mono-tech text-[#EDE9DF] tracking-[0.1em] flex items-center justify-center transition-all duration-200 hover:border-[#D8663D] hover:text-[#D8663D] active:translate-y-[1px]"
          >
            [ ENTER COGNIS ]
          </a>
        </div>
      </div>

      {/* Thin Horizontal Progress Line Underneath (grows 0% to 100% on scroll) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1C1C17]">
        <div
          className="h-full bg-[#282823] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </header>
  );
}
