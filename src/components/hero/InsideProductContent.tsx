"use client";

import React, { useState } from "react";

interface InsideProductContentProps {
  progress: number; // 0.0 to 1.0 from master scroll timeline
}

interface WaypointData {
  id: string;
  step: string;
  tag: string;
  headline: string;
  description: string;
  metrics: string;
  targetU: number; // Normalized focal position in [0, 1]
  renderVisual?: () => React.ReactNode;
}

// Helper: Hermite smooth interpolation
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function InsideProductContent({ progress }: InsideProductContentProps) {
  // Local interactive states for inside-universe micro-specimens
  const [driftValue, setDriftValue] = useState(48);
  const [activeConsequence, setActiveConsequence] = useState(0);
  const [isHealed, setIsHealed] = useState(true);

  // Active inside-universe window
  const INSIDE_START = 0.22;
  const INSIDE_END = 0.88;

  if (progress < INSIDE_START - 0.02 || progress > INSIDE_END + 0.02) {
    return null;
  }

  // Normalized spatial coordinate u within the inside universe: 0.0 to 1.0
  const u = Math.max(0, Math.min(1, (progress - INSIDE_START) / (INSIDE_END - INSIDE_START)));

  // Master container opacity for smooth threshold entry and exit
  const masterOpacity = Math.min(
    smoothstep(INSIDE_START - 0.01, INSIDE_START + 0.03, progress),
    1.0 - smoothstep(INSIDE_END - 0.03, INSIDE_END + 0.01, progress)
  );

  const WAYPOINTS: WaypointData[] = [
    {
      id: "drift-gap",
      step: "01",
      tag: "THE DRIFT GAP",
      headline: "YOUR CODE MOVED. YOUR KNOWLEDGE STAYED.",
      description:
        "When software moves, downstream artifacts rarely advance in lockstep. A microscopic divergence cascades into broken client integrations, stale documentation, and hallucinating AI agents.",
      metrics: "AXIS A // REALITY (COMMIT 0x7FA) • AXIS B // KNOWLEDGE (STALE v1.2)",
      targetU: 0.07,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
          <div className="flex flex-wrap items-center justify-between pb-2 mb-2.5 border-b border-[#1C1C17] text-[10px] font-mono-tech text-[#8C887B] gap-2">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B]" />
              INTERACTIVE DRIFT: {driftValue}%
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={driftValue}
              onChange={(e) => setDriftValue(Number(e.target.value))}
              className="w-24 accent-[#E05A2B] bg-[#1C1C17] cursor-pointer"
              aria-label="Simulate knowledge drift"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[11px] font-mono-tech">
            <div className="p-2 sm:p-2.5 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[#E05A2B] text-[9px] block mb-1">OPERATIONAL REALITY</span>
              <span className="text-[#F2EFE9]">MAX_RETRIES = 5</span>
              <span className="text-[9px] text-[#66655E] block mt-0.5">Live telemetry AST trace</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[#8C887B] text-[9px] block mb-1">PUBLISHED DOCS</span>
              <span className="text-[#66655E] line-through">MAX_RETRIES = 3</span>
              <span className="text-[9px] text-[#B84A3A] block mt-0.5">
                {(driftValue * 0.18).toFixed(1)}ms Async Gap
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "forensics",
      step: "02",
      tag: "INVARIANT CONTRACT FORENSICS",
      headline: "FIND THE PROMISE THAT BROKE.",
      description:
        "Software rarely announces broken guarantees. Cognis isolates the microscopic boundary where observed runtime behavior diverged from documented commitments before downstream systems break.",
      metrics: "FALSIFICATION: 0.04ms • SPECIMEN: C-017 RETRY POLICY INVARIANT",
      targetU: 0.21,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
          <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-[#1C1C17] text-[10px] font-mono-tech gap-2">
            <span className="text-[#F2EFE9] tracking-[0.14em]">SPECIMEN // C-017 RETRY INVARIANT</span>
            <span className="text-[#B84A3A] font-semibold">[ CONTRADICTION DETECTED ]</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-[#0E0E0B] border border-[#1C1C17] font-mono-tech text-[10px] sm:text-[11px] text-[#8C887B] space-y-1">
            <div className="text-[#E05A2B]">EXPECTED: retry.count == 3 (contracts/http.md:42)</div>
            <div className="text-[#F2EFE9]">OBSERVED: retry.count == 5 (src/client.ts:88 commit 0x7FA)</div>
            <div className="text-[9px] text-[#66655E] pt-1 border-t border-[#1C1C17]">
              PROOF: Deterministic execution delta confirmed across 1,420 telemetry transactions.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "consequence",
      step: "03",
      tag: "RUNTIME CONSEQUENCE ENGINE",
      headline: "3 → 5. WHAT BECOMES FALSE.",
      description:
        "A code commit initiates a shockwave of downstream invalidation across human documentation, client SDKs, and autonomous agent context.",
      metrics: "DOWNSTREAM IMPACT: 5 SURFACES COMPROMISED • LATENCY CEILING: 31s",
      targetU: 0.36,
      renderVisual: () => {
        const consequences = [
          { label: "SDK TIMEOUT", desc: "Backoff ceiling shifts 7s → 31s." },
          { label: "DIAGNOSTICS", desc: "Troubleshooting logs fail audit." },
          { label: "AGENT INVARIANT", desc: "LLM system prompts hallucinate 3 retries." },
        ];
        return (
          <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
            <div className="flex items-center justify-center gap-4 sm:gap-6 py-1 border-b border-[#1C1C17] font-mono-tech">
              <span className="text-[28px] sm:text-[36px] text-[#66655E] line-through leading-none">3</span>
              <span className="text-[20px] text-[#E05A2B]">→</span>
              <span className="text-[28px] sm:text-[36px] text-[#F2EFE9] font-medium leading-none">5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5">
              {consequences.map((c, i) => (
                <button
                  type="button"
                  key={c.label}
                  onClick={() => setActiveConsequence(i)}
                  className={`p-2 text-left border rounded-[2px] transition-all cursor-pointer ${
                    activeConsequence === i
                      ? "border-[#E05A2B] bg-[#E05A2B]/10 text-[#F2EFE9]"
                      : "border-[#1C1C17] bg-[#0E0E0B] text-[#8C887B]"
                  }`}
                >
                  <div className="text-[9px] font-mono-tech text-[#E05A2B] uppercase mb-0.5">{c.label}</div>
                  <div className="text-[10px] leading-snug line-clamp-2">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      id: "restoration",
      step: "04",
      tag: "DETERMINISTIC RESTORATION",
      headline: "KNOWLEDGE BROKE. COGNIS REPAIRS IT.",
      description:
        "Repairs are strictly bounded by mathematical evidence and verified against 8 independent software surfaces before committing to publication.",
      metrics: "CONSENSUS SEALS: 8/8 VERIFIED • CRYPTOGRAPHIC PROOF: 1.00",
      targetU: 0.50,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
          <div className="flex flex-wrap items-center justify-between pb-1.5 mb-2 border-b border-[#1C1C17] text-[10px] font-mono-tech gap-2">
            <span className="text-[#9AA68A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9AA68A]" />
              TRANSACTION H-184 // 8/8 SURFACES SEALED
            </span>
            <button
              type="button"
              onClick={() => setIsHealed(!isHealed)}
              className="px-2 py-0.5 border border-[#393832] text-[#F2EFE9] hover:border-[#E05A2B] text-[9px] uppercase cursor-pointer"
            >
              {isHealed ? "VIEW DIFF" : "APPLY SEAL"}
            </button>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#0E0E0B] font-mono-tech text-[10px] space-y-1">
            <div className="text-[#B84A3A] line-through">- default_retries: 3  # stale reference</div>
            <div className="text-[#9AA68A]">+ default_retries: 5  # verified from AST commit 0x7FA</div>
            <div className="text-[#66655E] text-[9px] pt-1 border-t border-[#1C1C17]/60">
              SURFACES: Docs • OpenAPI JSON • SDK Types • MCP Manifests • Agent Prompt
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "refusal",
      step: "05",
      tag: "EPISTEMIC RESTRAINT",
      headline: "SOMETIMES THE SMARTEST ACTION IS TO REFUSE.",
      description:
        "Most tools brag about aggressive autonomy. Cognis earns enterprise trust through strict mathematical restraint. When telemetry and docs present genuine contradiction, it stops.",
      metrics: "REFUSAL PROOF: CONTRADICTION UNRESOLVED • REPAIR HALTED SAFELY",
      targetU: 0.65,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1C1C17] text-[10px] font-mono-tech">
            <span className="text-[#D8663D]">AMBIGUITY THRESHOLD EXCEEDED</span>
            <span className="text-[#8C887B]">[ RESTRAINT TRIGGERED ]</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-tech text-[10px] text-center">
            <div className="p-1.5 sm:p-2 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[9px] text-[#66655E] block">CODE</span>
              <span className="text-[#F2EFE9]">5000ms</span>
            </div>
            <div className="p-1.5 sm:p-2 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[9px] text-[#66655E] block">DOCS</span>
              <span className="text-[#F2EFE9]">5s</span>
            </div>
            <div className="p-1.5 sm:p-2 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[9px] text-[#66655E] block">TESTS</span>
              <span className="text-[#D8663D]">mixed</span>
            </div>
            <div className="p-1.5 sm:p-2 bg-[#0E0E0B] border border-[#1C1C17]">
              <span className="text-[9px] text-[#66655E] block">ENV CONFIG</span>
              <span className="text-[#8C887B]">dynamic</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "architecture",
      step: "06",
      tag: "UNIVERSAL PROJECTION",
      headline: "ONE INVARIANT MODEL. SEVEN PROJECTIONS.",
      description:
        "Cognis continuously projects one canonical verified truth across every format consumed by developers, search engines, and AI agents.",
      metrics: "CANONICAL MODEL // SYNCHRONIZED: 100% ACROSS 7 FORMATS",
      targetU: 0.80,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 panel-industrial max-w-[640px] mx-auto text-left">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1C1C17] text-[10px] font-mono-tech text-[#9AA68A]">
            <span>CANONICAL TRUTH: VERIFIED MODEL</span>
            <span>100% IN SYNC</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[9px] sm:text-[10px] font-mono-tech">
            {["HTML Docs", "Markdown MDX", "OpenAPI JSON", "JSON-LD Graph", "Vector Search", "Agent Context", "MCP Protocol"].map((ch) => (
              <span key={ch} className="px-2 py-0.5 bg-[#0E0E0B] border border-[#1C1C17] text-[#EDE9DF]">
                ✓ {ch}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "reprise",
      step: "07",
      tag: "NARRATIVE CLOSURE // EXPLORATION COMPLETE",
      headline: "MAKE YOUR SOFTWARE EXPLAIN ITSELF.",
      description:
        "Cognis continuously connects software behavior, product contracts, and the living intelligence built around them. The cognitive loop is complete.",
      metrics: "ALL PRODUCT STAGES DISCOVERED • PREPARE TO EXIT UNIVERSE",
      targetU: 0.94,
      renderVisual: () => (
        <div className="mt-3 p-3 sm:p-4 border border-[#D8663D]/40 bg-[#0A0A08]/95 rounded-[2px] max-w-[640px] mx-auto text-center">
          <div className="text-[10px] sm:text-[11px] font-mono-tech text-[#D8663D] tracking-[0.2em] uppercase mb-1">
            NARRATIVE REPRISE
          </div>
          <div className="text-[13px] sm:text-[15px] font-mono-tech text-[#F2EFE9] uppercase tracking-wide">
            SOFTWARE CHANGES. KNOWLEDGE <span className="text-[#D8663D]">KEEPS</span> UP.
          </div>
          <div className="text-[9px] font-mono-tech text-[#8C887B] tracking-wider mt-1.5">
            SCROLL TO RETURN TO THE SURFACE ↓
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="relative w-full max-w-[960px] mx-auto h-[540px] sm:h-[600px] flex items-center justify-center pointer-events-none select-none px-4 sm:px-6"
      style={{ opacity: masterOpacity }}
    >
      {/* Spatially Separated Product Waypoints Traveling along the Y/Depth Axis */}
      {WAYPOINTS.map((stage) => {
        const delta = u - stage.targetU;

        // Controlled spatial Y travel calibrated to avoid colliding with nav or bottom telemetry
        let translateY = 0;
        if (delta < 0) {
          translateY = Math.min(-delta * 380, 200);
        } else {
          translateY = Math.max(-delta * 360, -220);
        }

        // Tighter opacity profile: each waypoint has a clear distinct focal window without overlapping adjacent stages
        let opacity = 0;
        if (delta < 0) {
          opacity = smoothstep(-0.09, -0.015, delta);
        } else {
          opacity = 1.0 - smoothstep(0.015, 0.09, delta);
        }

        // Depth scale & subtle blur cues
        const scale =
          delta < 0
            ? 0.92 + 0.08 * smoothstep(-0.09, 0.0, delta)
            : 1.0 - 0.06 * smoothstep(0.0, 0.09, delta);

        const blur =
          delta < 0
            ? 4 * (1.0 - smoothstep(-0.08, 0.0, delta))
            : 4 * smoothstep(0.02, 0.09, delta);

        // Discard completely out of range elements
        if (opacity < 0.01) return null;

        const isPrimary = Math.abs(delta) < 0.06;

        return (
          <div
            key={stage.id}
            className="absolute inset-x-0 mx-auto max-w-[820px] text-center px-4 sm:px-6 transition-all duration-75 max-h-[calc(100vh-180px)] overflow-y-auto"
            style={{
              transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              opacity,
              filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none",
              pointerEvents: isPrimary ? "auto" : "none",
            }}
          >
            {/* Ambient Radial Scrim for crystal-clear legibility */}
            <div className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-2xl pointer-events-none scrim-radial-inside" />

            {/* Core Entity Stamp */}
            <div className="badge-tech mb-2 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8663D] animate-pulse" />
              <span>
                COGNIS CORE // WAYPOINT {stage.step} OF 07
              </span>
            </div>

            {/* Eyebrow Stage Tag */}
            <div className="text-[9px] sm:text-[10px] font-mono-tech tracking-[0.22em] text-[#D8663D] uppercase mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {stage.tag}
            </div>

            {/* Main Monumental Headline */}
            <h2 className="font-monumental-section text-[#F2EFE9] uppercase tracking-[-0.05em] mb-2 sm:mb-3 leading-tight drop-shadow-[0_6px_28px_rgba(0,0,0,0.95)]">
              {stage.headline}
            </h2>

            {/* High-Contrast Bone Description */}
            <p className="text-[14px] sm:text-[17px] md:text-[19px] text-[#EDE9DF] font-sans leading-[1.45] max-w-[640px] mx-auto mb-2 sm:mb-3 font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {stage.description}
            </p>

            {/* Embedded Spatial Visual / Specimen */}
            {stage.renderVisual && stage.renderVisual()}

            {/* Coordinate / Metrics Stamp */}
            <div className="mt-2.5 text-[9px] font-mono-tech tracking-[0.16em] text-[#8C887B] uppercase flex items-center justify-center gap-3">
              <span>{stage.metrics}</span>
            </div>
          </div>
        );
      })}

      {/* Bottom Spatial Telemetry inside Universe - hidden on tiny mobile to prevent coordinate bar overlap */}
      <div className="hidden sm:flex absolute -bottom-10 inset-x-0 items-center justify-center gap-3 md:gap-5 text-[9px] font-mono-tech text-[#8C887B] overflow-x-auto px-4">
        {WAYPOINTS.map((s) => {
          const delta = Math.abs(u - s.targetU);
          const active = delta < 0.06;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 transition-colors duration-200 shrink-0 ${
                active ? "text-[#D8663D] font-medium" : "text-[#55544E]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  active ? "bg-[#D8663D]" : "bg-[#282823]"
                }`}
              />
              <span>{s.step} // {s.tag.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
