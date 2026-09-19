"use client";

import React from "react";
import Link from "next/link";

interface HeroInitialCopyProps {
  progress: number; // 0.0 to 1.0 from master scroll
}

export function HeroInitialCopy({ progress }: HeroInitialCopyProps) {
  // Phase 1 to 2 transition: Fades out smoothly between progress 0.08 and 0.18
  const opacity = Math.max(1 - (progress - 0.08) / 0.10, 0);
  const translateX = -Math.min(Math.max((progress - 0.08) / 0.10, 0), 1) * 80;

  if (opacity <= 0.01) return null;

  return (
    <div
      className="w-full max-w-[740px] z-20 pointer-events-auto transition-transform duration-75 pt-16 sm:pt-0"
      style={{
        opacity,
        transform: `translate3d(${translateX}px, 0, 0)`,
      }}
    >
      {/* Eyebrow Milestone Tag */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4 sm:mb-8">
        <span>COGNIS</span>
        <span className="text-[#D8663D]">/ 001</span>
        <span className="text-[#282823]">—</span>
        <span>THE COGNITIVE LAYER BETWEEN SOFTWARE &amp; TRUTH</span>
      </div>

      {/* Monolithic Edge-to-Edge Headline */}
      <h1 className="font-monumental-hero text-[#F2EFE9] uppercase tracking-[-0.065em]">
        <div>SOFTWARE CHANGES.</div>
        <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-8">
          <span className="scan-signal-text inline-block">KNOWLEDGE</span>
          <span className="text-[#8C887B]">DOESN&apos;T.</span>
        </div>
      </h1>

      {/* Supporting Copy */}
      <div className="mt-6 sm:mt-10 max-w-[540px]">
        <p className="text-[16px] sm:text-[19px] md:text-[21px] leading-[1.45] text-[#8C887B] font-sans font-normal">
          Cognis reconstructs what software actually does, detects where product knowledge diverges
          from reality, and safely repairs what can be proven wrong.
        </p>

        {/* Action Button & Hint */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <Link href="/sign-up" className="btn-monumental">
            <span>EXPLORE THE ENTITY</span>
            <span className="text-[#D8663D]">→</span>
          </Link>

          <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8663D] animate-pulse" />
            <span>SCROLL TO ENTER COGNITION ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
