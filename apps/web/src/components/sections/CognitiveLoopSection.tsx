"use client";

import { useEffect, useState } from "react";
import { SplitBrainLogo } from "../ui/SplitBrainLogo";

const ORBIT_STEPS = [
  { step: "01", name: "OBSERVE", detail: "Runtime telemetry & diff tracking" },
  { step: "02", name: "UNDERSTAND", detail: "Behavioral topology reconstruction" },
  { step: "03", name: "REASON", detail: "Epistemic invariant evaluation" },
  { step: "04", name: "CHALLENGE", detail: "Counterfactual falsification tests" },
  { step: "05", name: "HEAL", detail: "Safe bounded repair generation" },
  { step: "06", name: "VERIFY", detail: "Exhaustive surface consensus" },
];

export function CognitiveLoopSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % ORBIT_STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-36 sm:py-44 px-6 sm:px-8 md:px-12 bg-[#0B0F15] border-t border-white/[0.04]">
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center max-w-[700px] mx-auto">
          <div className="text-[12px] font-mono-tech tracking-[0.12em] text-[#697482] uppercase mb-4">
            CONTINUOUS EPISTEMIC CYCLE
          </div>
          <h2 className="headline-section text-[#F4F7FA] font-sans">
            The Cognitive Loop.
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] mt-6">
            Software evolution never stops. Cognis runs an uninterrupted cycle of observation,
            reasoning, and consensus to ensure knowledge stays perpetually synchronized with reality.
          </p>
        </div>

        {/* Central Orbital System Visual */}
        <div className="relative w-full max-w-[800px] mx-auto aspect-square sm:aspect-[16/11] rounded-2xl border border-white/[0.07] bg-[#07090D] flex items-center justify-center p-8 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, rgba(92,235,255,0.06) 0%, rgba(139,124,255,0.04) 60%, transparent 80%)",
            }}
          />

          {/* Center Cognis Nucleus */}
          <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-2xl border border-white/[0.12] bg-[#0B0F15] shadow-2xl text-center">
            <SplitBrainLogo size={36} className="mb-2" />
            <div className="text-[16px] font-sans font-semibold text-[#F4F7FA]">COGNIS</div>
            <span className="text-[10px] font-mono-tech uppercase tracking-[0.14em] text-[#5CEBFF] mt-1">
              CONTINUOUS SYNC
            </span>
          </div>

          {/* Circular Track */}
          <div className="absolute w-[280px] sm:w-[440px] aspect-square rounded-full border border-white/[0.05] pointer-events-none" />
          <div className="absolute w-[360px] sm:w-[560px] aspect-square rounded-full border border-dashed border-white/[0.03] pointer-events-none" />

          {/* Orbital Steps Positioned in Circle */}
          <div className="absolute inset-0 pointer-events-none">
            {ORBIT_STEPS.map((item, idx) => {
              const total = ORBIT_STEPS.length;
              const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
              const radiusPercent = 38; // percentage radius from center
              const left = 50 + radiusPercent * Math.cos(angle);
              const top = 50 + radiusPercent * Math.sin(angle);
              const isActive = activeStep === idx;

              return (
                <div
                  key={item.step}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 ${
                    isActive ? "scale-110 z-30" : "scale-100 opacity-60 z-10"
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <div
                    onClick={() => setActiveStep(idx)}
                    className={`px-3 sm:px-4 py-2 rounded-xl border text-center cursor-pointer backdrop-blur-md transition-all ${
                      isActive
                        ? "border-[#5CEBFF] bg-[#10151D] shadow-[0_0_20px_rgba(92,235,255,0.15)]"
                        : "border-white/[0.08] bg-[#07090D]/90 hover:border-white/[0.2]"
                    }`}
                    data-interactive="true"
                  >
                    <div className="text-[9px] font-mono-tech text-[#697482]">{item.step}</div>
                    <div
                      className={`text-[12px] sm:text-[13px] font-mono-tech font-semibold ${
                        isActive ? "text-[#5CEBFF]" : "text-[#F4F7FA]"
                      }`}
                    >
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Return to Reality Cycle Indicator */}
        <div className="mt-12 text-center text-[12px] font-mono-tech text-[#A7B0BD] flex items-center justify-center gap-2">
          <span>Loop returns to</span>
          <span className="text-[#65E6A5] font-semibold uppercase">REALITY</span>
          <span className="text-[#697482]">and starts again.</span>
        </div>
      </div>
    </section>
  );
}
