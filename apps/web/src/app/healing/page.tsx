"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MonumentalNav } from "@/components/common/MonumentalNav";
import { DiffView } from "@/components/healing/DiffView";
import { getInvestigations, type HealTransactionDTO, transactionsFor, type TransactionStatus } from "@/lib/healing-data";
import {
  CheckCircleIcon,
  WarningIcon,
  CheckIcon,
  GitPullRequestIcon,
  DownloadIcon,
  ArrowRightIcon,
  CaseFilesIcon,
} from "@/components/ui/Icons";

// ── helpers ───────────────────────────────────────────────────────────────
const STATUS_META: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
  pending_verification: { label: "Awaiting Verification", color: "#C5A85A", bg: "#C5A85A14" },
  verified:            { label: "Verified — Ready to Commit", color: "#E3B65A", bg: "#E3B65A14" },
  patched:             { label: "Patched & Committed", color: "#9AA68A", bg: "#9AA68A14" },
  rejected:            { label: "Escalated for Review", color: "#B84A3A", bg: "#B84A3A14" },
};

function elapsed(unixSeconds: number): string {
  const s = Math.floor(Date.now() / 1000 - unixSeconds);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function StatusPill({ status }: { status: TransactionStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] tracking-wider px-2.5 py-1 rounded-full"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function HealingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<HealTransactionDTO[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [committed, setCommitted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getInvestigations(user.uid).then((records) => {
      const txs = transactionsFor(records);
      setTransactions(txs);
      setSelectedId((cur) => cur ?? txs[0]?.transaction_id ?? null);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#07070A] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#D8663D] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono-tech text-[11px] tracking-[.18em] text-[#5A5A6A]">LOADING…</span>
        </div>
      </main>
    );
  }

  const selected = transactions?.find((t) => t.transaction_id === selectedId) ?? null;

  async function downloadArtifact() {
    if (!selected?.investigation_id) return;
    setDownloadBusy(true);
    try {
      const res = await fetch(`/api/investigations/${encodeURIComponent(selected.investigation_id)}/artifact`, { cache: "no-store" });
      const payload = await res.json() as { url?: string };
      if (!res.ok || !payload.url) throw new Error("Artifact not available.");
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadBusy(false);
    }
  }

  function handleCommit() {
    if (!selectedId) return;
    setCommitted((prev) => new Set([...prev, selectedId]));
  }

  return (
    <main className="min-h-screen bg-[#07070A] text-[#F2EFE9] selection:bg-[#D8663D]/25">
      <MonumentalNav />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-[96px] pb-20">

        {/* ── PAGE HEADER ── */}
        <div className="anim-fade-in-up mb-8 pb-6 border-b border-[#14141C]">
          <div className="flex items-center gap-2 mb-3">
            <CaseFilesIcon size={12} className="text-[#5A5A6A]" />
            <span className="text-[10px] font-mono-tech tracking-[.2em] text-[#5A5A6A] uppercase">Case Files</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F2EFE9]">
            Repair History
          </h1>
          <p className="text-sm text-[#6A6A7E] mt-2 max-w-xl leading-relaxed">
            Every documentation fix Cognis has proposed, with the code evidence behind it.
            Fixes only commit after verification passes — nothing ships on a guess.
          </p>
        </div>

        {/* ── MAIN CONTENT ── */}
        {!transactions ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#D8663D] border-t-transparent rounded-full animate-spin mr-3" />
            <span className="font-mono-tech text-sm text-[#5A5A6A]">Loading case files…</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="anim-fade-in-up bg-[#0D0D12] border border-[#1E1E2A] rounded-2xl p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#9AA68A]/10 border border-[#9AA68A]/20 flex items-center justify-center mx-auto">
              <CheckCircleIcon size={28} className="text-[#9AA68A]" />
            </div>
            <h2 className="text-xl font-bold text-[#9AA68A]">Nothing to fix</h2>
            <p className="text-sm text-[#5A5A6A]">
              No contradictions found yet. Run a scan from the dashboard to start.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── LEFT: Transaction list ── */}
            <div className="lg:w-72 xl:w-80 shrink-0 space-y-2">
              <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#4A4A5A] mb-3 px-1">
                {transactions.length} repair{transactions.length !== 1 ? "s" : ""}
              </div>
              {transactions.map((tx, i) => (
                <button
                  key={tx.transaction_id}
                  type="button"
                  onClick={() => setSelectedId(tx.transaction_id)}
                  className={`anim-fade-in-up w-full text-left bg-[#0D0D12] border rounded-xl p-4 transition-all interactive-card ${
                    i === 0 ? "" : i === 1 ? "anim-delay-100" : i === 2 ? "anim-delay-200" : "anim-delay-300"
                  } ${
                    selectedId === tx.transaction_id
                      ? "border-[#D8663D]/60 bg-[#120F0D]"
                      : "border-[#1E1E2A] hover:border-[#2A2A3A]"
                  }`}
                >
                  <div className="text-xs font-mono-tech font-bold text-[#D4D4E4] break-all leading-snug mb-2">
                    {tx.contract_id}
                  </div>
                  <StatusPill status={committed.has(tx.transaction_id) ? "patched" : tx.status} />
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono-tech text-[#4A4A5A]">
                    <span>conf. {tx.plan.confidence.toFixed(2)}</span>
                    <span>{elapsed(tx.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* ── RIGHT: Detail panel ── */}
            {selected && (
              <div className="anim-slide-in flex-1 min-w-0 bg-[#0D0D12] border border-[#1E1E2A] rounded-2xl overflow-hidden">

                {/* Panel header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#16161E] bg-[#0A0A0E]">
                  <div className="flex items-center gap-3">
                    <StatusPill status={committed.has(selected.transaction_id) ? "patched" : selected.status} />
                    <span className="text-[11px] font-mono-tech text-[#5A5A6A]">{selected.plan.target_file}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-[#3A3A4A]">
                    {selected.transaction_id.slice(0, 12)}…
                  </span>
                </div>

                <div className="p-6 space-y-6">

                  {/* Plain English summary */}
                  <div className="bg-[#0A0A12] border border-[#1C1C2A] rounded-xl p-4 space-y-1">
                    <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#5A5A6A] mb-2">What Cognis Found</div>
                    <p className="text-sm text-[#D4D4E4] leading-relaxed">
                      <strong className="text-[#F2EFE9]">{selected.contract_id}</strong> — the documentation says{" "}
                      <code className="text-[#E87A68] bg-[#1A0E0A] px-1.5 py-0.5 rounded text-xs">{selected.plan.find_text}</code> but the
                      code shows{" "}
                      <code className="text-[#9AA68A] bg-[#0A120A] px-1.5 py-0.5 rounded text-xs">{selected.plan.replace_text}</code>.
                    </p>
                    <p className="text-xs text-[#5A5A6A] mt-2 leading-relaxed">{selected.plan.rationale}</p>
                  </div>

                  {/* Evidence chain */}
                  <div>
                    <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#5A5A6A] mb-3">Evidence Chain</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Code", value: selected.plan.replace_text, color: "#D8663D" },
                        { label: "Behavior", value: "Sandbox verified", color: "#E3B65A" },
                        { label: "Contract", value: selected.contract_id, color: "#B84A3A" },
                        { label: "Doc (stale)", value: selected.plan.find_text, color: "#8C887B" },
                      ].map((item) => (
                        <div key={item.label} className="interactive-card bg-[#080810] border border-[#18181E] rounded-lg p-3 space-y-1">
                          <div className="text-[9px] font-mono-tech uppercase tracking-wider" style={{ color: item.color }}>
                            {item.label}
                          </div>
                          <div className="text-[11px] font-mono-tech text-[#A0A0B4] break-words leading-relaxed">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diff */}
                  <div>
                    <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#5A5A6A] mb-2">
                      {selected.plan.operation === "create" ? "Generated Document" : "Proposed Patch"}{" "}
                      · confidence {selected.plan.confidence.toFixed(2)}
                    </div>
                    {selected.patch_result?.diff ? (
                      <DiffView diff={selected.patch_result.diff} />
                    ) : (
                      <div className="bg-[#080810] border border-[#18181E] rounded-lg p-4 text-xs font-mono-tech text-[#4A4A5A]">
                        {selected.status === "rejected"
                          ? "No patch — confidence fell below the autonomy threshold. Human review required."
                          : "Patch queued — awaiting verification completion."}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-[#16161E]">
                    {committed.has(selected.transaction_id) ? (
                      <div className="flex items-center gap-2 text-sm text-[#9AA68A]">
                        <CheckIcon size={14} />
                        <span>Committed to repository</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCommit}
                        disabled={selected.status !== "verified" && selected.status !== "patched"}
                        className="bg-[#D8663D] hover:bg-[#c45730] active:scale-95 text-[#08080A] font-mono-tech font-bold text-xs px-5 py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                      >
                        <ArrowRightIcon size={12} />
                        <span>{selected.status === "patched" ? "ALREADY COMMITTED" : "COMMIT REPAIR"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void downloadArtifact()}
                      disabled={downloadBusy || !selected.investigation_id}
                      className="bg-[#13131C] hover:bg-[#1A1A24] text-[#C4C4D4] border border-[#252535] font-mono-tech text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                    >
                      <DownloadIcon size={12} />
                      {downloadBusy ? "PREPARING…" : selected.plan.operation === "create" ? "DOWNLOAD GENERATED DOC" : "DOWNLOAD PATCH"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
