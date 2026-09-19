"use client";

import React from "react";
import Link from "next/link";

interface HeroFinalCtaProps {
  progress: number; // 0.0 to 1.0 from master scroll
}

export function HeroFinalCta({ progress }: HeroFinalCtaProps) {
  // Phase 6 reveal between 0.92 and 1.0
  if (progress < 0.92) return null;

  const opacity = Math.min((progress - 0.92) / 0.06, 1);
  const translateY = (1 - opacity) * 36;

  return (
    <div
      className="w-full max-w-[680px] z-20 pointer-events-auto transition-transform duration-75 select-none pt-16 sm:pt-0"
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, 0)`,
      }}
    >
      <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mb-4 sm:mb-6">
        <span>COGNIS // JOURNEY COMPLETE</span>
        <span className="text-[#9AA68A]">✓ COHERENT</span>
      </div>

      <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] mb-4 sm:mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
        KNOWLEDGE
        <br />
        <span className="text-[#D8663D]">KEEPS UP.</span>
      </h2>

      <p className="text-[15px] sm:text-[18px] md:text-[21px] text-[#EDE9DF] font-sans leading-[1.5] max-w-[540px] mb-6 sm:mb-8 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] font-normal">
        The cognitive loop is closed. Continuous synchronization between software changes, product
        contracts, and agent intelligence.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <Link href="/sign-up" className="btn-monumental">
          <span>GET STARTED NOW</span>
          <span className="text-[#D8663D]">→</span>
        </Link>

        <a
          href="#footer"
          className="btn-monumental-secondary"
        >
          PROJECT ARCHITECTURE ↓
        </a>
      </div>
    </div>
  );
}
