"use client";

import { useEffect, useRef, useState } from "react";

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollFraction, setScrollFraction] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Fraction of scroll inside hero pin
      const fraction = Math.min(Math.max(-rect.top / windowH, 0), 1);
      setScrollFraction(fraction);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute transformations for the scroll sequence
  const headlineX = -scrollFraction * 60;
  const headlineY = -scrollFraction * 90;
  const knowledgeShiftX = scrollFraction * 70;
  const driftOpacity = Math.min(Math.max((scrollFraction - 0.45) * 3, 0), 1);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[180vh] bg-[#0B0B09]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between px-6 sm:px-12 lg:px-[8vw] pt-[28vh] pb-12 overflow-hidden select-none">
        {/* Asymmetric Content Layout */}
        <div className="max-w-[900px]">
          {/* Eyebrow: Raw monospace metadata, no capsule, no border */}
          <div className="flex items-center gap-2 text-[11px] font-mono-tech tracking-[0.12em] text-[#66655E] uppercase mb-8">
            <span>COGNIS</span>
            <span className="text-[#D8663D]">/ 001</span>
            <span className="text-[#282823]">•</span>
            <span>COGNITIVE INFRASTRUCTURE</span>
          </div>

          {/* Architectural Headline with dynamic scroll separation */}
          <h1
            className="headline-editorial-hero text-[#EDE9DF] font-sans"
            style={{
              transform: `translate3d(${headlineX}px, ${headlineY}px, 0)`,
              transition: "transform 100ms ease-out",
            }}
          >
            <div>Software changes.</div>
            <div className="flex items-center gap-3 sm:gap-4 mt-1">
              <span
                className="scan-signal-text inline-block transition-transform duration-150"
                style={{
                  transform: `translate3d(${knowledgeShiftX}px, 0, 0)`,
                }}
              >
                Knowledge
              </span>
              <span>doesn&apos;t.</span>

              {/* Drift Badge appearing as gap widens */}
              <span
                className="text-[11px] font-mono-tech uppercase tracking-[0.16em] text-[#D8663D] ml-4 transition-opacity duration-200"
                style={{ opacity: driftOpacity }}
              >
                [ DRIFT ]
              </span>
            </div>
          </h1>

          {/* Supporting Copy offset to the right */}
          <div className="mt-12 sm:ml-20 max-w-[470px]">
            <p className="text-[17px] sm:text-[18px] leading-[1.55] text-[#A9A69D] font-sans">
              Cognis reconstructs what software actually does, finds where product knowledge
              diverges from reality, and repairs what can be proven wrong.
            </p>

            {/* Single Textual Editorial Action */}
            <div className="mt-8 flex flex-col items-start gap-3">
              <a
                href="#problem"
                className="group inline-flex items-center gap-2 text-[13px] font-mono-tech tracking-[0.1em] text-[#EDE9DF] uppercase py-1 border-b border-[#282823] hover:border-[#D8663D] transition-colors"
                data-cursor="contract"
              >
                <span>ENTER THE SYSTEM</span>
                <span className="transition-transform duration-200 group-hover:translate-x-2 text-[#D8663D]">
                  →
                </span>
              </a>

              <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.14em] flex items-center gap-1.5 pt-2">
                <span>SCROLL TO INVESTIGATE</span>
                <span className="text-[#D8663D]">↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Coordinate Marker */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-[#66655E] tracking-[0.14em] border-t border-[#1C1C17] pt-4">
          <span>LAT: 37.7749 // LON: -122.4194</span>
          <span>SYS_STATUS: MONITORING</span>
          <span className="hidden sm:inline">CYCLE: 0x88F</span>
        </div>
      </div>
    </section>
  );
}
