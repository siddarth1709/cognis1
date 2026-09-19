"use client";

import { useEffect, useRef, useState } from "react";

export function MonumentalHero() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 16;
    const y = (e.clientY / innerHeight - 0.5) * 16;
    setMouseOffset({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] w-full flex flex-col justify-between px-6 sm:px-12 lg:px-16 pt-36 pb-14 bg-[#080806] select-none overflow-hidden"
    >
      {/* Subtle Ambient Depth */}
      <div
        className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #E05A2B 0%, transparent 70%)",
          transform: `translate3d(${mouseOffset.x * 2}px, ${mouseOffset.y * 2}px, 0)`,
        }}
      />

      {/* Main Monumental Composition */}
      <div className="max-w-[1400px] z-10">
        {/* Eyebrow Milestone Tag */}
        <div className="flex items-center gap-3 text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-10">
          <span>COGNIS</span>
          <span className="text-[#E05A2B]">/ 001</span>
          <span className="text-[#282823]">—</span>
          <span>THE COGNITIVE LAYER BETWEEN SOFTWARE &amp; TRUTH</span>
        </div>

        {/* Monolithic Edge-to-Edge Headline */}
        <h1 className="font-monumental-hero text-[#F2EFE9] uppercase tracking-[-0.065em]">
          <div>SOFTWARE CHANGES.</div>
          <div className="flex flex-wrap items-baseline gap-x-6 sm:gap-x-10">
            <span className="scan-signal-text inline-block">KNOWLEDGE</span>
            <span className="text-[#8C887B]">DOESN&apos;T.</span>
          </div>
        </h1>

        {/* Architectural Two-Column Supporting Block */}
        <div className="mt-16 pt-12 border-t border-[#1C1C17] grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          {/* Left Column: Mission Definition */}
          <div className="lg:col-span-7">
            <p className="text-[20px] sm:text-[24px] leading-[1.4] text-[#8C887B] max-w-[660px] font-sans font-normal">
              Cognis reconstructs what software actually does, detects where product knowledge diverges
              from reality, and safely repairs what can be proven wrong.
            </p>
          </div>

          {/* Right Column: Monumental Action & Coordinates */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-6">
            <a
              href="#gap"
              className="h-[48px] px-8 border border-[#393832] rounded-[2px] text-[12px] font-mono-tech uppercase tracking-[0.16em] text-[#F2EFE9] flex items-center justify-center gap-3 transition-all duration-300 hover:border-[#E05A2B] hover:text-[#E05A2B] hover:bg-[#E05A2B]/[0.04] active:scale-[0.98]"
            >
              <span>EXPLORE THE ENGINE</span>
              <span className="text-[#E05A2B]">→</span>
            </a>

            <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B] animate-pulse" />
              <span>SYSTEM READY // SCROLL TO INVESTIGATE ↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Milestones Bar */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.18em] border-t border-[#1C1C17] pt-5 mt-16">
        <span>ARCH: DETERMINISTIC FORENSICS</span>
        <span className="hidden sm:inline">STATE ENGINE: MATHEMATICAL CONSENSUS</span>
        <span>LATENCY: 0.04ms</span>
      </div>
    </section>
  );
}
