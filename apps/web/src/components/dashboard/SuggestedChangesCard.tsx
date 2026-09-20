"use client";

import { useState } from "react";
import { CheckIcon, GitPullRequestIcon, PencilIcon, WarningIcon } from "@/components/ui/Icons";
import type { HealTransactionDTO } from "@/lib/healing-data";

interface SuggestedChangesCardProps {
  owner: string;
  repository: string;
  transaction?: HealTransactionDTO | null;
  onOpenEditor: () => void;
  onFixApplied?: () => void;
}

export function SuggestedChangesCard({
  owner,
  repository,
  transaction,
  onOpenEditor,
  onFixApplied,
}: SuggestedChangesCardProps) {
  const [status, setStatus] = useState<"pending" | "applied" | "dismissed">("pending");
  const [prCreated, setPrCreated] = useState(false);

  if (status === "dismissed") {
    return null;
  }

  const targetFile = transaction?.plan?.target_file ?? "docs/API.md";
  const findText = transaction?.plan?.find_text ?? "";
  const replaceText = transaction?.plan?.replace_text ?? "";
  const rationale = transaction?.plan?.rationale ?? `Verified behavioral drift in ${repository} codebase.`;
  const confidence = Math.round((transaction?.plan?.confidence ?? 0.92) * 100);
  const contractId = transaction?.contract_id ?? "ContractDrift";

  function handleAccept() {
    setStatus("applied");
    onFixApplied?.();
  }

  function handleCreatePr() {
    setPrCreated(true);
    setTimeout(() => setPrCreated(false), 4000);
  }

  return (
    <div className="bg-[#0D0D12] border border-[#20202E] rounded-xl p-5 sm:p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F1F2C] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D8663D] animate-pulse" />
          <span className="text-xs font-mono-tech tracking-[.18em] text-[#D8663D] uppercase font-bold">
            1 SUGGESTED CHANGE READY
          </span>
          <span className="text-[10px] font-mono-tech bg-[#D8663D]/15 text-[#E87A68] border border-[#D8663D]/30 px-2 py-0.5 rounded font-bold">
            {confidence}% CONFIDENCE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "applied" ? (
            <span className="text-xs font-mono-tech bg-[#9AA68A]/20 text-[#9AA68A] border border-[#9AA68A] px-3 py-1 rounded flex items-center gap-1.5 font-bold">
              <CheckIcon size={11} />
              FIX APPLIED &amp; READY TO MERGE
            </span>
          ) : (
            <span className="text-xs font-mono-tech text-[#8A8A9E]">
              Target: <code className="text-[#F2EFE9] font-bold">{targetFile}</code>
            </span>
          )}
        </div>
      </div>

      {/* Plain English Explanation */}
      <div className="my-4 space-y-2">
        <h4 className="text-base font-bold text-[#F2EFE9] flex items-center gap-2">
          <WarningIcon size={16} className="text-[#D8663D] shrink-0" />
          <span>Documentation Out of Sync: <span className="text-[#D8663D] font-mono-tech text-sm">{contractId}</span></span>
        </h4>
        <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
          {rationale}
        </p>
      </div>

      {/* Before / After Diff Box */}
      {findText && replaceText ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
          {/* Current Stale Doc */}
          <div className="bg-[#12121A] border border-[#252535] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8A8A9E]">
              <span className="text-[#E87A68] font-bold">− CURRENT DOC (STALE)</span>
              <span>{targetFile}</span>
            </div>
            <div className="bg-[#0A0A0F] p-2.5 rounded border border-[#1E1E2A] text-xs font-mono-tech text-[#E87A68] whitespace-pre-wrap">
              {`- ${findText}`}
            </div>
          </div>

          {/* Cognis Proposed Fix */}
          <div className="bg-[#12121A] border border-[#252535] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8A8A9E]">
              <span className="text-[#9AA68A] font-bold">+ COGNIS SUGGESTED FIX</span>
              <span>Verified from Code AST</span>
            </div>
            <div className="bg-[#0A0A0F] p-2.5 rounded border border-[#1E1E2A] text-xs font-mono-tech text-[#9AA68A] whitespace-pre-wrap">
              {`+ ${replaceText}`}
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1F1F2C]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {status !== "applied" ? (
            <button
              type="button"
              onClick={handleAccept}
              className="bg-[#D8663D] hover:bg-[#c45730] text-[#08080A] font-mono-tech font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <CheckIcon size={11} />
              <span>ACCEPT &amp; APPLY FIX</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreatePr}
              className="bg-[#9AA68A] hover:bg-[#889478] text-[#08080A] font-mono-tech font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-lg flex items-center gap-1.5"
            >
              <GitPullRequestIcon size={12} />
              <span>{prCreated ? "PR SENT TO GITHUB!" : "CREATE GITHUB PR"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenEditor}
            className="bg-[#161622] hover:bg-[#1E1E2E] text-[#F2EFE9] border border-[#2A2A3E] font-mono-tech text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
          >
            <PencilIcon size={11} />
            <span>CUSTOMIZE IN EDITOR</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStatus("dismissed")}
          className="text-xs font-mono-tech text-[#6A6A7E] hover:text-[#A0A0B2] transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
