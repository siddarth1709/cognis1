"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MonumentalNav } from "@/components/common/MonumentalNav";
import { DiffView } from "@/components/healing/DiffView";
import { getHealTransactions, HealTransactionDTO, TransactionStatus } from "@/lib/healing-data";

const STATUS_LABEL: Record<TransactionStatus, string> = {
  pending_verification: "AWAITING VERIFICATION",
  verified: "VERIFIED — AWAITING COMMIT",
  patched: "PATCHED",
  rejected: "ESCALATED TO REVIEW",
};

const STATUS_COLOR: Record<TransactionStatus, string> = {
  pending_verification: "#C5A85A",
  verified: "#E3B65A",
  patched: "#9AA68A",
  rejected: "#B84A3A",
};

function StatusStamp({ status }: { status: TransactionStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-2 font-mono-tech text-[9px] tracking-[0.16em] uppercase px-2.5 py-1 rounded-[2px] border"
      style={{ color, borderColor: `${color}55`, background: `${color}0F` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatElapsed(unixSeconds: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unixSeconds);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/** Code -> Behavior -> Contract -> Documentation, re-skinned from the
 * landing page's ContractForensicsSection in the dashboard's own warm
 * industrial tokens instead of that section's one-off cyan/purple palette. */
function EvidenceChain({ tx }: { tx: HealTransactionDTO }) {
  const steps = [
    { label: "01 / CODE", title: "IMPLEMENTATION", color: "#D8663D", detail: tx.plan.replace_text },
    { label: "02 / RUNTIME", title: "BEHAVIOR", color: "#E3B65A", detail: "Sandbox re-run confirms the code-side value." },
    { label: "03 / INVARIANT", title: "CONTRACT", color: "#B84A3A", detail: tx.contract_id },
    { label: "04 / DOCS", title: "DOCUMENTATION", color: "#8C887B", detail: tx.plan.find_text },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {steps.map((step) => (
        <div key={step.label} className="panel-industrial p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[9px] font-mono-tech tracking-[0.14em]" style={{ color: step.color }}>
                {step.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
            </div>
            <div className="text-[11px] font-mono-tech text-[#F2EFE9] font-medium mb-2 tracking-[0.04em]">
              {step.title}
            </div>
          </div>
          <div className="text-[11px] font-mono-tech text-[#8C887B] leading-relaxed break-words bg-[#0C0C09] border border-[#282823] rounded-[2px] px-2.5 py-2">
            {step.detail}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HealingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [transactions, setTransactions] = useState<HealTransactionDTO[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

  useEffect(() => {
    getHealTransactions().then((txs) => {
      setTransactions(txs);
      setSelectedId((current) => current ?? txs[0]?.transaction_id ?? null);
    });
  }, []);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#080806] text-[#F2EFE9] flex items-center justify-center font-mono-tech text-[12px] tracking-[0.2em]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#D8663D] animate-pulse" />
          <span>SYNCHRONIZING SECURE TELEMETRY STREAM...</span>
        </div>
      </main>
    );
  }

  const selected = transactions?.find((t) => t.transaction_id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-[#080806] text-[#F2EFE9] selection:bg-[#E05A2B]/30 selection:text-[#F2EFE9]">
      <MonumentalNav />

      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-[104px] sm:pt-[124px] pb-16">
        <div className="mb-10 pb-8 border-b border-[#1C1C17]">
          <div className="text-[11px] font-mono-tech tracking-[0.14em] text-[#697482] uppercase mb-4">
            04 // HEALING
          </div>
          <h1 className="font-monumental-section text-[#F2EFE9] max-w-[640px]">Case files.</h1>
          <p className="text-[15px] sm:text-[17px] leading-[1.6] text-[#8C887B] max-w-[620px] mt-5">
            Every repair Cognis proposes, with the evidence chain behind it. Commit unlocks only once
            verification has passed — nothing here ships on a guess.
          </p>
        </div>

        {!transactions ? (
          <div className="font-mono-tech text-[11px] tracking-[0.16em] text-[#66655E] uppercase">
            Loading case files…
          </div>
        ) : transactions.length === 0 ? (
          <div className="panel-industrial p-8 text-center">
            <p className="font-mono-tech text-[11px] tracking-[0.16em] text-[#66655E] uppercase mb-1">
              No open case files
            </p>
            <p className="text-[13px] text-[#8C887B]">Nothing contradicts its own documentation right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            <div className="flex flex-col gap-3">
              {transactions.map((tx) => (
                <button
                  key={tx.transaction_id}
                  onClick={() => setSelectedId(tx.transaction_id)}
                  className={`text-left panel-industrial p-4 transition-colors ${
                    selectedId === tx.transaction_id ? "border-[#D8663D]/60" : "hover:border-[#393832]"
                  }`}
                >
                  <span className="text-[12px] font-mono-tech text-[#F2EFE9] break-all leading-snug block mb-2">
                    {tx.contract_id}
                  </span>
                  <StatusStamp status={tx.status} />
                  <div className="flex items-center justify-between mt-3 text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.1em]">
                    <span>confidence {tx.plan.confidence.toFixed(2)}</span>
                    <span>{formatElapsed(tx.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="panel-elevated overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-4 border-b border-[#1C1C17] bg-[#0E0E0B]">
                  <div className="flex items-center gap-3 text-[11px] font-mono-tech">
                    <StatusStamp status={selected.status} />
                    <span className="text-[#393832]">|</span>
                    <span className="text-[#8C887B]">{selected.plan.target_file}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-[#66655E]">
                    {selected.transaction_id.slice(0, 8)}
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="text-[10px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] mb-4">
                    Evidence chain
                  </div>
                  <EvidenceChain tx={selected} />

                  <div className="mt-8">
                    <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
                      Testimony
                    </span>
                    <p className="text-[14px] text-[#EDE9DF] font-sans leading-relaxed">{selected.plan.rationale}</p>
                  </div>

                  <div className="mt-6">
                    <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
                      Patch — measured confidence {selected.plan.confidence.toFixed(2)}
                    </span>
                    {selected.patch_result?.diff ? (
                      <DiffView diff={selected.patch_result.diff} />
                    ) : (
                      <div className="font-mono-tech text-[11px] text-[#66655E] border border-[#282823] rounded-[2px] px-4 py-3 bg-[#0C0C09]">
                        {selected.status === "rejected"
                          ? "No patch drafted — investigation confidence fell below the autonomy threshold."
                          : "Patch not yet applied. Verified and awaiting Commit."}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-[#1C1C17]">
                    <button type="button" className="btn-monumental-secondary text-[10px]">
                      DOWNLOAD PATCH
                    </button>
                    <button
                      type="button"
                      disabled={selected.status !== "verified" && selected.status !== "patched"}
                      className="btn-monumental text-[10px] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <span>{selected.status === "patched" ? "ALREADY COMMITTED" : "COMMIT REPAIR"}</span>
                      {selected.status !== "patched" && <span className="text-[#D8663D]">→</span>}
                    </button>
                  </div>
                </div>

                <div className="px-6 sm:px-8 py-4 border-t border-[#1C1C17] bg-[#0E0E0B] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-tech text-[#8C887B]">
                  <span>
                    <span className="text-[#66655E]">INVESTIGATION:</span>{" "}
                    {typeof selected.verification_detail.investigation_id === "string"
                      ? selected.verification_detail.investigation_id
                      : "—"}
                  </span>
                  {typeof selected.verification_detail.summary === "string" && (
                    <span className="text-[#66655E] max-w-[480px] truncate">
                      {selected.verification_detail.summary}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}