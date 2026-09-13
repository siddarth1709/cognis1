"use client";

import { useEffect, useRef, useState } from "react";

export function ProblemDriftSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [driftFactor, setDriftFactor] = useState(0); // 0 (aligned) to 1 (drifted)
  const [isHoveringBadge, setIsHoveringBadge] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      
      // Calculate how far into the section the user has scrolled
      const progress = Math.min(
        Math.max((windowH * 0.7 - rect.top) / (windowH * 0.6), 0),
        1
      );
      setDriftFactor(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute positions
  // Top tier moves ahead horizontally or stretches vertically
  const codeShift = driftFactor * 36;
  const behaviorShift = driftFactor * 24;
  const contractShift = driftFactor * 12;
  const docLag = -driftFactor * 28; // lags back
  const agentLag = -driftFactor * 32;

  const gapHeight = 24 + driftFactor * 52; // vertical gap grows

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#07090D] border-t border-white/[0.03]"
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20 sm:mb-24">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            01 / THE PROBLEM
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans max-w-[700px]">
            Your code changed.
            <br />
            Did everything else?
          </h2>
          <p className="text-[17px] leading-[1.6] text-[#A7B0BD] max-w-[560px] mt-6">
            When software moves, downstream artifacts rarely move with it at the same speed.
            A microscopic divergence cascades into broken client integrations, stale docs, and hallucinating AI agents.
          </p>
        </div>

        {/* Vertical Divergence Sequence Visualizer */}
        <div className="relative max-w-[680px] mx-auto py-12 px-6 sm:px-12 rounded-2xl border border-white/[0.05] bg-[#0B0F15]/70 backdrop-blur-sm">
          {/* Subtle Grid / Scanline background */}
          <div className="absolute inset-0 bg-tech-grid opacity-50 rounded-2xl pointer-events-none" />

          {/* Interactive Playback Control if user wants to scrub manually */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/[0.05] relative z-10">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.08em] text-[#697482]">
              TIMELINE OF AN UNCOORDINATED CHANGE
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tech text-[#A7B0BD]">
                DRIFT: {Math.round(driftFactor * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setDriftFactor(driftFactor > 0.5 ? 0.05 : 1)}
                className="text-[10px] font-mono-tech px-2.5 py-1 rounded border border-white/[0.1] text-[#A7B0BD] hover:text-[#5CEBFF] hover:border-[#5CEBFF]/40 transition-colors"
                data-interactive="true"
              >
                {driftFactor > 0.5 ? "Reset Alignment" : "Simulate Change"}
              </button>
            </div>
          </div>

          {/* Vertical Pipeline Nodes */}
          <div className="flex flex-col items-center relative z-10 space-y-4">
            {/* 1. CODE NODE */}
            <div
              className="w-full max-w-[340px] p-3.5 rounded-lg border border-white/[0.12] bg-[#10151D] flex items-center justify-between transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${codeShift}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-sm bg-[#5CEBFF]" />
                <span className="text-[13px] font-mono-tech tracking-wide text-[#F4F7FA]">CODE</span>
              </div>
              <span className="text-[11px] font-mono-tech text-[#5CEBFF]">v2.4.0 (PR #184)</span>
            </div>

            {/* Connecting line */}
            <div className="w-[1px] h-5 bg-gradient-to-b from-[#5CEBFF]/60 to-[#8B7CFF]/50" />

            {/* 2. BEHAVIOR NODE */}
            <div
              className="w-full max-w-[340px] p-3.5 rounded-lg border border-white/[0.08] bg-[#10151D] flex items-center justify-between transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${behaviorShift}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-sm bg-[#8B7CFF]" />
                <span className="text-[13px] font-mono-tech tracking-wide text-[#F4F7FA]">BEHAVIOR</span>
              </div>
              <span className="text-[11px] font-mono-tech text-[#8B7CFF]">RETRIES 3 → 5</span>
            </div>

            {/* Connecting line */}
            <div className="w-[1px] h-5 bg-gradient-to-b from-[#8B7CFF]/50 to-[#697482]/40" />

            {/* 3. CONTRACT NODE */}
            <div
              className="w-full max-w-[340px] p-3.5 rounded-lg border border-white/[0.08] bg-[#10151D] flex items-center justify-between transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${contractShift}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-sm bg-[#A7B0BD]" />
                <span className="text-[13px] font-mono-tech tracking-wide text-[#F4F7FA]">CONTRACT</span>
              </div>
              <span className="text-[11px] font-mono-tech text-[#F4C95D]">IMPLICIT BREACH</span>
            </div>

            {/* KNOWLEDGE DRIFT GAP ZONE */}
            <div
              className="relative w-full flex flex-col items-center justify-center transition-all duration-400 ease-out"
              style={{ height: `${gapHeight}px` }}
            >
              {/* Divergence Line */}
              <div className="absolute inset-y-0 w-[1px] bg-dashed border-l border-dashed border-[#FF667A]/50" />

              {/* Drift Badge */}
              <div
                onMouseEnter={() => setIsHoveringBadge(true)}
                onMouseLeave={() => setIsHoveringBadge(false)}
                className={`relative z-20 cursor-pointer transition-all duration-300 ${
                  driftFactor > 0.35 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
                data-interactive="true"
              >
                <div className="px-3 py-1 rounded-full border border-[#FF667A]/60 bg-[#FF667A]/10 text-[#FF667A] text-[11px] font-mono-tech uppercase tracking-[0.1em] flex items-center gap-2 shadow-[0_0_16px_rgba(255,102,122,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF667A] animate-ping" />
                  <span>KNOWLEDGE DRIFT DETECTED</span>
                </div>

                {/* Micro-interaction Tooltip */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-64 p-2.5 rounded-lg border border-white/[0.1] bg-[#141A23] text-[#F4F7FA] text-[12px] shadow-xl pointer-events-none transition-all duration-180 ease-out z-30 ${
                    isHoveringBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[#F4C95D] font-mono-tech text-[10px] uppercase mb-1">
                    <span>⚠</span> Divergence Alert
                  </div>
                  <p className="text-[#A7B0BD] leading-snug">
                    Product reality and published knowledge no longer agree.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. DOCUMENTATION NODE */}
            <div
              className="w-full max-w-[340px] p-3.5 rounded-lg border border-white/[0.06] bg-[#07090D] flex items-center justify-between transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${docLag}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-sm bg-[#697482]" />
                <span className="text-[13px] font-mono-tech tracking-wide text-[#A7B0BD]">DOCUMENTATION</span>
              </div>
              <span className="text-[11px] font-mono-tech text-[#FF667A]">OUT OF DATE</span>
            </div>

            {/* Connecting line */}
            <div className="w-[1px] h-5 bg-white/[0.08]" />

            {/* 5. AGENT KNOWLEDGE NODE */}
            <div
              className="w-full max-w-[340px] p-3.5 rounded-lg border border-white/[0.06] bg-[#07090D] flex items-center justify-between transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${agentLag}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-sm bg-[#3D4652]" />
                <span className="text-[13px] font-mono-tech tracking-wide text-[#697482]">AGENT KNOWLEDGE</span>
              </div>
              <span className="text-[11px] font-mono-tech text-[#FF667A]">HALLUCINATING</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
