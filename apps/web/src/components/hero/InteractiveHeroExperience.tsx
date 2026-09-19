"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CognisCanvas } from "../3d/CognisCanvas";
import { HeroInitialCopy } from "./HeroInitialCopy";
import { InsideProductContent } from "./InsideProductContent";
import { HeroFinalCta } from "./HeroFinalCta";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function InteractiveHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;

    // Use GSAP context for strict React 19 cleanup and hot-reload safety
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: stickyRef.current,
        scrub: 1.2, // Cinematic smooth scrub inertia
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero-experience"
      className="relative w-full h-[900vh] bg-[#080806]"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={stickyRef}
        className="w-full h-screen overflow-hidden flex items-center justify-between px-4 sm:px-10 lg:px-16 relative"
      >
        {/* Single Persistent R3F Canvas */}
        <CognisCanvas scrollProgress={scrollProgress} />

        {/* Phase 1 & 2: Left Initial Hero Content */}
        <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-10 lg:px-16 pointer-events-none">
          <HeroInitialCopy progress={scrollProgress} />
        </div>

        {/* Phase 3: Inside the Entity Universe Product Milestones (All 7 Waypoints) */}
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-10 lg:px-16 pointer-events-none">
          <InsideProductContent progress={scrollProgress} />
        </div>

        {/* Phase 6: Exit CTA & Re-emergence */}
        <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-10 lg:px-16 pointer-events-none">
          <HeroFinalCta progress={scrollProgress} />
        </div>

        {/* Persistent Bottom Coordinate Bar */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 sm:left-10 sm:right-10 lg:left-16 lg:right-16 z-20 flex items-center justify-between text-[9px] sm:text-[10px] font-mono-tech text-[#66655E] tracking-[0.16em] sm:tracking-[0.18em] border-t border-[#1C1C17] pt-3 select-none pointer-events-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8663D]" />
            <span className="hidden xs:inline sm:inline">COGNIS 3D ENTITY // PIVOT: [0, 0, 0]</span>
            <span className="xs:hidden sm:hidden">COGNIS ENTITY</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span>
              JOURNEY: {
                scrollProgress < 0.12
                  ? "01 / HERO IDLE"
                  : scrollProgress < 0.22
                  ? "02 / CENTERING & APPROACH"
                  : scrollProgress < 0.88
                  ? "03 / INSIDE UNIVERSE (7 WAYPOINTS)"
                  : scrollProgress < 0.94
                  ? "04 / PORTAL EXIT"
                  : "05 / KNOWLEDGE KEEPS UP"
              }
            </span>
            <span>PROGRESS: {Math.round(scrollProgress * 100)}%</span>
          </div>

          <span>LATENCY: 0.04ms</span>
        </div>
      </div>
    </section>
  );
}
