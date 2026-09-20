"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/ui/Icons";
import type { ReplayStep } from "@/app/api/investigations/[investigationId]/replay/route";

interface InvestigationReplayModalProps {
  investigationId: string;
  onClose: () => void;
}

export function InvestigationReplayModal({ investigationId, onClose }: InvestigationReplayModalProps) {
  const [trajectory, setTrajectory] = useState<ReplayStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReplay() {
      try {
        setLoading(true);
        const res = await fetch(`/api/investigations/${encodeURIComponent(investigationId)}/replay`);
        const data = (await res.json()) as { trajectory?: ReplayStep[]; error?: string };
        if (!res.ok || !data.trajectory) throw new Error(data.error ?? "Failed to load replay.");
        setTrajectory(data.trajectory);
        setCurrentStepIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading replay.");
      } finally {
        setLoading(false);
      }
    }
    void loadReplay();
  }, [investigationId]);

  const step = trajectory[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#0E0E0B] border border-[#2A2A22] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl text-[#F2EFE9]">
        {/* Header */}
        <div className="p-5 bg-[#141410] border-b border-[#2A2A22] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[.18em] text-[#D8663D] uppercase font-bold">
                INVESTIGATION REPLAY
              </span>
              <span className="text-[9px] text-[#9AA68A] border border-[#9AA68A]/30 px-2 py-0.5">
                AUDIT TRACE
              </span>
            </div>
            <h3 className="text-sm font-bold mt-1 text-[#F2EFE9]">{investigationId}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8C887B] hover:text-[#F2EFE9] p-2 transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-12 text-center text-[12px] text-[#D8663D] animate-pulse">
              Fetching scrubbable audit trail trajectory...
            </div>
          )}

          {error && (
            <div className="p-4 bg-[#B84A3A]/20 border border-[#B84A3A] text-[#E87A68] text-xs">
              {error}
            </div>
          )}

          {!loading && step && (
            <div className="space-y-6">
              {/* Timeline step indicators */}
              <div className="flex items-center justify-between gap-1 border-b border-[#1C1C17] pb-4 overflow-x-auto">
                {trajectory.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex-1 min-w-[70px] text-center p-2 border transition-all text-[10px] ${
                      idx === currentStepIndex
                        ? "border-[#D8663D] bg-[#D8663D]/10 text-[#D8663D] font-bold"
                        : idx < currentStepIndex
                        ? "border-[#9AA68A]/40 text-[#9AA68A]"
                        : "border-[#1C1C17] text-[#66655E]"
                    }`}
                  >
                    <div>Step {s.step_index}</div>
                    <div className="text-[9px] uppercase tracking-wider">{s.stage}</div>
                  </button>
                ))}
              </div>

              {/* Current Step Card */}
              <div className="p-5 bg-[#141410] border border-[#22221C] space-y-4">
                <div className="flex justify-between items-center border-b border-[#22221C] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-[#D8663D] font-bold">0{step.step_index + 1}</span>
                    <div>
                      <span className="text-[12px] font-bold tracking-wider text-[#F2EFE9] uppercase">
                        STAGE: {step.stage}
                      </span>
                      <p className="text-[10px] text-[#66655E]">{step.timestamp}</p>
                    </div>
                  </div>
                  {step.confidence !== undefined && (
                    <div className="text-right">
                      <span className="text-[9px] text-[#8C887B]">CONFIDENCE</span>
                      <p className="text-sm font-bold text-[#9AA68A]">{(step.confidence * 100).toFixed(0)}%</p>
                    </div>
                  )}
                </div>

                {/* Thought */}
                <div>
                  <span className="text-[9px] tracking-wider text-[#D8663D] block mb-1">
                    AGENT REASONING / THOUGHT:
                  </span>
                  <p className="text-[12px] text-[#D8D5CC] leading-relaxed bg-[#080806] p-3 border border-[#1F1F1A]">
                    {step.thought}
                  </p>
                </div>

                {/* Tool Call */}
                {step.tool_call && (
                  <div>
                    <span className="text-[9px] tracking-wider text-[#9AA68A] block mb-1">
                      TOOL INVOKED: <strong className="text-[#F2EFE9]">{step.tool_call.name}</strong>
                    </span>
                    <pre className="text-[10px] bg-[#0A0A08] p-3 border border-[#1F1F1A] text-[#9AA68A] overflow-x-auto">
                      {JSON.stringify(step.tool_call.params, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Tool Output / Log */}
                {step.tool_output && (
                  <div>
                    <span className="text-[9px] tracking-wider text-[#8C887B] block mb-1">
                      SANDBOX RUN LOG / TOOL OUTPUT:
                    </span>
                    <pre className="text-[10px] bg-[#080806] p-3 border border-[#1F1F1A] text-[#D8D5CC] whitespace-pre-wrap">
                      {step.tool_output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-[#141410] border-t border-[#2A2A22] flex items-center justify-between">
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 border border-[#22221C] hover:border-[#D8663D] disabled:opacity-30 text-[10px]"
          >
            ← PREVIOUS STEP
          </button>

          <span className="text-[10px] text-[#8C887B]">
            Step {currentStepIndex + 1} of {trajectory.length}
          </span>

          <button
            type="button"
            disabled={currentStepIndex === trajectory.length - 1}
            onClick={() => setCurrentStepIndex((prev) => Math.min(trajectory.length - 1, prev + 1))}
            className="px-4 py-2 bg-[#D8663D] text-[#080806] font-bold text-[10px] disabled:opacity-30"
          >
            NEXT STEP →
          </button>
        </div>
      </div>
    </div>
  );
}
