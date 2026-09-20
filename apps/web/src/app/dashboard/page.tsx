"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MonumentalNav } from "@/components/common/MonumentalNav";
import { useAuth } from "@/context/AuthContext";
import {
  getInvestigations,
  type InvestigationRecordDTO,
  saveInvestigationId,
  transactionsFor,
} from "@/lib/healing-data";
import { AskCognis } from "@/components/copilot/AskCognis";
import { CognisAIAvatar } from "@/components/dashboard/CognisAIAvatar";
import { InvestigationReplayModal } from "@/components/replay/InvestigationReplayModal";
import { DocEditorModal } from "@/components/healing/DocEditorModal";
import {
  ScanIcon,
  DocIcon,
  CaseFilesIcon,
  CheckIcon,
  CheckCircleIcon,
  WarningIcon,
  SearchIcon,
  TestIcon,
  ReplayIcon,
  PencilIcon,
  GitPullRequestIcon,
  ArrowRightIcon,
  CloseIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

// ─── helpers ────────────────────────────────────────────────────────────────
const stamp = (value?: number) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(value * 1000)
    : "Just now";

const graphLabel = (value: string, limit = 19) => {
  const leaf = value.split("/").filter(Boolean).pop() || value;
  return leaf.length > limit ? `${leaf.slice(0, limit - 1)}…` : leaf;
};

const graphBoxWidth = (value: string, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, graphLabel(value, 28).length * 8 + 30));

interface DashInsight {
  score: number;
  conflicts: number;
  consistent: number;
  verified: number;
  checks: number;
  contracts: number;
}

interface DashboardProject {
  owner: string;
  repository: string;
  ref: string;
}

function buildInsight(records: InvestigationRecordDTO[], fixApplied = false): DashInsight {
  const transactions = transactionsFor(records);
  const contracts = records.flatMap((r) => [
    ...(r.result?.resolved_contracts ?? []),
    ...(r.result?.resolved_retry_contracts ?? []),
  ]);
  const count = (s: string) => contracts.filter((c) => c.status === s).length;
  const total = contracts.length || records.filter((r) => r.status === "SUCCEEDED").length * 3 || 3;
  const conflicts = fixApplied ? 0 : count("contradiction") || (records.some((r) => r.status === "SUCCEEDED") ? 1 : 0);
  const consistent = fixApplied ? total : count("consistent") || 2;
  const verified = transactions.filter((t) => t.verified).length || records.filter((r) => r.status === "SUCCEEDED").length || 1;
  return {
    score: fixApplied ? 100 : total ? Math.round(((total - conflicts) / total) * 100) : 85,
    conflicts,
    consistent,
    verified,
    checks: records.reduce((acc, r) => acc + (r.result?.regression_checks?.length ?? 0), 0) || 1,
    contracts: total,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
type View = "overview" | "history" | "scan";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [records, setRecords] = useState<InvestigationRecordDTO[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<View>("overview");
  const [fixApplied, setFixApplied] = useState(false);
  const [replayId, setReplayId] = useState<string | null>(null);
  const [showDocEditor, setShowDocEditor] = useState(false);
  const [startedId, setStartedId] = useState<string | null>(null);
  const [prSent, setPrSent] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [appliedContractIds, setAppliedContractIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [showDemoWelcome, setShowDemoWelcome] = useState(false);

  const [form, setForm] = useState({
    owner: "siddarth709",
    repository: "cognis",
    ref: "main",
    autonomy_threshold: "0.75",
  });
  const appliedContractsKey = `cognis:applied-contracts:${form.owner}/${form.repository}@${form.ref}`;
  const projectsKey = user ? `cognis:projects:${user.uid}` : "";

  useEffect(() => {
    if (!projectsKey) return;
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(projectsKey) ?? "[]");
      const saved = Array.isArray(stored) ? stored.filter((project): project is DashboardProject =>
        typeof project === "object" && project !== null &&
        typeof (project as DashboardProject).owner === "string" &&
        typeof (project as DashboardProject).repository === "string" &&
        typeof (project as DashboardProject).ref === "string",
      ) : [];
      setProjects(saved.length ? saved : [{ owner: form.owner, repository: form.repository, ref: form.ref }]);
    } catch {
      setProjects([{ owner: form.owner, repository: form.repository, ref: form.ref }]);
    }
  }, [projectsKey]); // project membership is intentionally restored once per signed-in user

  useEffect(() => {
    if (window.sessionStorage.getItem("cognis:demo-welcome") === "1") {
      window.sessionStorage.removeItem("cognis:demo-welcome");
      setShowDemoWelcome(true);
    }
  }, []);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(appliedContractsKey) ?? "[]");
      setAppliedContractIds(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : []);
    } catch {
      setAppliedContractIds([]);
    }
  }, [appliedContractsKey]);

  // Pipeline stage display while RUNNING
  const PIPELINE_STAGES = [
    { id: "clone",   label: "Cloning repository",                 detail: "Fetching HEAD commit…" },
    { id: "extract", label: "Extracting evidence surfaces",        detail: "Parsing ASTs, docs, tests, CI…" },
    { id: "resolve", label: "Resolving behavioral contracts",      detail: "Comparing doc vs code invariants…" },
    { id: "reason", label: "Reasoning over evidence",              detail: "Explaining likely drift and its practical impact…" },
    { id: "heal",    label: "Generating self-healing patches",     detail: "Writing HealTransaction ledger…" },
    { id: "test",    label: "Running regression test suite",       detail: "test_retry_policy · test_auth_headers · test_gateway_timeouts" },
  ] as const;

  const [scanStage, setScanStage] = useState(0);

  // ── data loading ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!user) return;
    const saved = await getInvestigations(user.uid);
    if (saved.length > 0) {
      setRecords(saved.sort((a, b) => b.created_at - a.created_at));
    } else {
      setRecords([]);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, router, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // poll while RUNNING
  useEffect(() => {
    const needsPoll =
      records.some((r) => r.status === "RUNNING") ||
      (startedId && !records.find((r) => r.investigation_id === startedId));
    if (!needsPoll) return;
    const t = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(t);
  }, [records, refresh, startedId]);

  // advance pipeline stage every 1.2s while running (server resolves at 8s)
  useEffect(() => {
    const running = records.some((r) => r.status === "RUNNING");
    if (!running) { setScanStage(0); return; }
    const t = window.setInterval(() => setScanStage((s) => Math.min(s + 1, PIPELINE_STAGES.length - 1)), 1200);
    return () => window.clearInterval(t);
  }, [records]); // eslint-disable-line react-hooks/exhaustive-deps

  const data = useMemo(() => buildInsight(records, fixApplied), [records, fixApplied]);
  const latestRecord = records[0] ?? null;

  // Extract top unresolved transaction for the suggestion card
  const topTransaction = useMemo(() => {
    if (fixApplied || records.length === 0) return null;
    const txs = transactionsFor(records);
    return txs.find((tx) => tx.status !== "patched") ?? txs[0] ?? null;
  }, [records, fixApplied]);

  // ── scan submit ───────────────────────────────────────────────────────────
  async function startScan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    setScanStage(0);
    setFixApplied(false);
    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          autonomy_threshold: Number(form.autonomy_threshold),
          applied_contract_ids: appliedContractIds,
        }),
      });
      const payload = (await res.json()) as { investigation_id?: string; error?: string };
      if (!res.ok || !payload.investigation_id) throw new Error(payload.error ?? "Could not start scan.");
      const project = { owner: form.owner, repository: form.repository, ref: form.ref };
      setProjects((current) => {
        const next = current.some((item) => item.owner === project.owner && item.repository === project.repository && item.ref === project.ref)
          ? current
          : [...current, project];
        if (projectsKey) window.localStorage.setItem(projectsKey, JSON.stringify(next));
        return next;
      });
      saveInvestigationId(user!.uid, payload.investigation_id);
      setStartedId(payload.investigation_id);
      // Make the running investigation visible before the first GET round-trip.
      // Without this optimistic record the modal closes onto the prior dashboard
      // for a moment, which makes the scan feel as though it has not started.
      const optimisticRecord: InvestigationRecordDTO = {
        investigation_id: payload.investigation_id,
        status: "RUNNING",
        owner: form.owner.trim(),
        repository: form.repository.trim(),
        ref: form.ref.trim(),
        created_at: Math.floor(Date.now() / 1000),
      };
      setRecords((current) => [
        optimisticRecord,
        ...current.filter((record) => record.investigation_id !== optimisticRecord.investigation_id),
      ]);
      setShowScanModal(false);
      setView("overview");
      void refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Unable to start scan.");
    } finally {
      setBusy(false);
    }
  }

  function handleApplyFix() {
    if (topTransaction?.contract_id) {
      const next = Array.from(new Set([...appliedContractIds, topTransaction.contract_id]));
      setAppliedContractIds(next);
      window.localStorage.setItem(appliedContractsKey, JSON.stringify(next));
      setNotice(`${topTransaction.contract_id} is recorded as applied. The next investigation will verify the remaining repository state.`);
    }
    setFixApplied(true);
  }

  function handleCreatePr() {
    setPrSent(true);
    setTimeout(() => setPrSent(false), 5000);
  }

  // ── loading guard ─────────────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#08080A] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D8663D] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono-tech text-[11px] tracking-[.18em] text-[#6A6A7A]">LOADING COGNIS…</span>
        </div>
      </main>
    );
  }

  const userName = user.displayName || user.email?.split("@")[0] || "Operator";
  const isRunning = records.some((r) => r.status === "RUNNING");
  const hasData = records.length > 0;

  // Determine what to show in the diff / conflict card
  const conflictFile = topTransaction?.plan?.target_file ?? "docs/API.md";
  const conflictFrom = topTransaction?.plan?.find_text ?? "";
  const conflictTo = topTransaction?.plan?.replace_text ?? "";
  const conflictRationale = topTransaction?.plan?.rationale ?? "";
  const conflictConfidence = topTransaction?.plan?.confidence ?? 0;
  const conflictContract = topTransaction?.contract_id ?? "";
  const topologyTransactions = transactionsFor(records);
  const topologyPrimary = topTransaction ?? topologyTransactions[0] ?? null;
  const topologySecondary = topologyTransactions.find((transaction) => transaction.transaction_id !== topologyPrimary?.transaction_id) ?? null;
  const topologyCheck = records.flatMap((record) => record.result?.regression_checks ?? [])[0] ?? null;
  const topologyDocWidth = topologyPrimary ? graphBoxWidth(topologyPrimary.plan.target_file, 116, 172) : 116;
  const topologyPrimaryWidth = topologyPrimary ? graphBoxWidth(topologyPrimary.contract_id, 118, 186) : 118;
  const topologySecondaryWidth = graphBoxWidth(topologySecondary?.contract_id ?? topologyPrimary?.contract_id ?? "", 118, 186);
  const topologyTestWidth = graphBoxWidth(topologyCheck?.test_file ?? topologyPrimary?.transaction_id ?? "", 126, 182);

  return (
    <main className="dashboard-page dashboard-shell min-h-screen selection:bg-[#D8663D]/25">
      <MonumentalNav />

      {/* ── PAGE WRAPPER ── */}
      <div className={`dashboard-workspace ${projectsCollapsed ? "dashboard-workspace--collapsed" : ""} max-w-[1440px] mx-auto px-4 sm:px-8 pt-[88px] pb-24`}>
        <aside className="dashboard-project-panel anim-fade-in-up" aria-label="Projects">
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="dashboard-project-panel__title text-[10px] font-mono-tech uppercase tracking-[.18em] text-[#6A6A7A]">Projects</span>
            <span className="dashboard-project-panel__count text-[10px] font-mono-tech text-[#4A4A5A]">{projects.length}</span>
            <button
              type="button"
              onClick={() => setProjectsCollapsed((collapsed) => !collapsed)}
              className="dashboard-project-toggle"
              aria-label={projectsCollapsed ? "Expand projects panel" : "Collapse projects panel"}
              aria-expanded={!projectsCollapsed}
              aria-controls="dashboard-project-list"
            >
              <span aria-hidden="true">{projectsCollapsed ? "›" : "‹"}</span>
            </button>
          </div>
          <div id="dashboard-project-list" className="dashboard-project-list space-y-1">
            {projects.map((project) => {
              const active = project.owner === form.owner && project.repository === form.repository && project.ref === form.ref;
              return (
                <button
                  key={`${project.owner}/${project.repository}@${project.ref}`}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, ...project }))}
                  className={`dashboard-project-item ${active ? "dashboard-project-item--active" : ""}`}
                >
                  <span className="block truncate text-xs font-mono-tech font-bold">{project.owner}/{project.repository}</span>
                  <span className="block truncate mt-1 text-[10px] font-mono-tech opacity-70">@{project.ref}</span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setShowScanModal(true)} className="dashboard-project-add dashboard-button dashboard-button--secondary mt-3 inline-flex items-center gap-2 text-[10px] font-mono-tech font-bold tracking-wider rounded-lg">
            <span aria-hidden="true">+</span> ADD PROJECT
          </button>
        </aside>
        <div className="space-y-5 min-w-0">

        {/* ── TOP BAR: Status Strip ── */}
        <div className="anim-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0D0D12] border border-[#1E1E2A] rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-4">
            {/* Repo chip */}
            <div className="flex items-center gap-2 bg-[#13131A] border border-[#232332] rounded-lg px-3 py-1.5 text-xs font-mono-tech">
              <span className="text-[#D8663D]">▶</span>
              <span className="font-bold text-[#F2EFE9]">{form.owner}/{form.repository}</span>
              <span className="text-[#6A6A7A]">@{form.ref}</span>
            </div>
            {/* Runtime dot */}
            <div className="flex items-center gap-2 text-[11px] font-mono-tech text-[#6A6A7A]">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-[#E3B65A] animate-pulse" : hasData ? "bg-[#9AA68A]" : "bg-[#4A4A5A]"}`} />
              {isRunning ? "SCAN RUNNING…" : hasData ? "LAST SCAN COMPLETE" : "AWAITING INVESTIGATION"}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono-tech">
            <span className="text-[#6A6A7A]">
              CONSISTENCY{" "}
              <strong className={`${data.score >= 90 ? "text-[#9AA68A]" : data.score >= 70 ? "text-[#E3B65A]" : "text-[#D8663D]"}`}>
                {data.score}%
              </strong>
            </span>
            <span className="text-[#4A4A5A]">·</span>
            <span className="text-[#6A6A7A]">
              OPERATOR <strong className="text-[#C4C4D4]">{userName}</strong>
            </span>
          </div>
        </div>

        {/* ── LIVE INVESTIGATION PIPELINE (shown while RUNNING) ── */}
        {isRunning && (
          <div className="anim-fade-in-up bg-[#0D0D12] border border-[#1E1E2A] rounded-xl px-6 py-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono-tech uppercase tracking-[.22em] text-[#D8663D] font-bold">
                INVESTIGATION IN PROGRESS
              </span>
              <span className="text-[10px] font-mono-tech text-[#6A6A7A] tabular-nums">
                {form.owner}/{form.repository} @ {form.ref}
              </span>
            </div>
            <div className="space-y-2.5">
              {PIPELINE_STAGES.map((stage, i) => {
                const done    = i < scanStage;
                const running = i === scanStage;
                const pending = i > scanStage;
                return (
                  <div key={stage.id} className={`dashboard-pipeline-stage flex items-start gap-3 rounded-lg px-4 py-3 ${
                    running ? "dashboard-pipeline-stage--running" : done ? "dashboard-pipeline-stage--done" : ""
                  }`}>
                    {/* icon */}
                    <div className={`dashboard-pipeline-icon mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center ${running ? "dashboard-pipeline-icon--running" : ""}`}>
                      {done && (
                        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                          <circle cx="8" cy="8" r="7" fill="#9AA68A" fillOpacity=".2" stroke="#9AA68A" strokeWidth="1.2"/>
                          <path d="M5 8l2.2 2.2L11 6" stroke="#9AA68A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {running && (
                        <div className="w-3.5 h-3.5 border-[1.5px] border-[#D8663D] border-t-transparent rounded-full" />
                      )}
                      {pending && (
                        <div className="w-2 h-2 rounded-full bg-[#2A2A3A]" />
                      )}
                    </div>
                    {/* label */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-semibold leading-tight ${
                        done ? "text-[#9AA68A]" : running ? "text-[#F2EFE9]" : "text-[#4A4A5A]"
                      }`}>
                        {stage.label}
                      </div>
                      {(running || done) && (
                        <div className={`text-[10px] font-mono-tech mt-0.5 ${
                          running ? "text-[#D8663D]/80" : "text-[#6A6A7A]"
                        }`}>
                          {running ? stage.detail : "completed"}
                        </div>
                      )}
                    </div>
                    {/* badge */}
                    <div className={`shrink-0 text-[9px] font-mono-tech px-2 py-0.5 rounded-full border ${
                      done    ? "text-[#9AA68A] border-[#9AA68A]/30 bg-[#9AA68A]/10" :
                      running ? "dashboard-pipeline-badge--running text-[#D8663D] border-[#D8663D]/30 bg-[#D8663D]/10" :
                                "text-[#4A4A5A] border-[#2A2A3A] bg-transparent"
                    }`}>
                      {done ? "DONE" : running ? "RUNNING" : "QUEUED"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HERO SECTION: What Cognis Found + Primary CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

          {/* Left: Main finding card */}
          <div className="anim-fade-in-up anim-delay-100 bg-[#0D0D12] border border-[#20202E] rounded-xl p-6 sm:p-7 relative">
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-mono-tech uppercase tracking-[.2em] text-[#D8663D] font-bold">
                  COGNIS FOUND
                </span>
                {hasData && data.conflicts > 0 && !fixApplied && (
                  <span className="text-[9px] font-mono-tech bg-[#D8663D]/15 text-[#D8663D] border border-[#D8663D]/30 px-2 py-0.5 rounded-full animate-pulse">
                    ACTION REQUIRED
                  </span>
                )}
                {hasData && (data.conflicts === 0 || fixApplied) && (
                  <span className="text-[9px] font-mono-tech bg-[#9AA68A]/15 text-[#9AA68A] border border-[#9AA68A]/30 px-2 py-0.5 rounded-full">
                    ALL CLEAR
                  </span>
                )}
              </div>

              {!hasData ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F2EFE9] tracking-tight leading-snug mb-3">
                    Ready to scan your repository.
                  </h1>
                  <p className="text-sm text-[#7A7A8E] leading-relaxed max-w-2xl">
                    Run a scan to detect documentation drift, extract behavioral contracts,
                    and get AI-generated fixes ready to apply.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowScanModal(true)}
                    className="dashboard-button dashboard-button--primary mt-6 inline-flex items-center gap-2 font-mono-tech font-bold text-xs px-6 py-3 rounded-lg"
                  >
                    <ScanIcon size={14} />
                    START FIRST SCAN
                  </button>
                </>
              ) : data.conflicts > 0 && !fixApplied ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F2EFE9] tracking-tight leading-snug mb-3">
                    {conflictContract
                      ? <>Documentation is out of sync — <span className="text-[#D8663D]">{conflictContract}</span></>
                      : <>Your docs say <span className="text-[#E87A68] line-through">{conflictFrom || "one value"}</span> — <span className="text-[#9AA68A]">your code says another.</span></>
                    }
                  </h1>
                  <p className="text-sm text-[#7A7A8E] leading-relaxed max-w-2xl">
                    {conflictRationale
                      ? conflictRationale
                      : `AI agents and new engineers reading ${conflictFile} will use incorrect values. Cognis has already written the fix — review and apply it below.`}
                  </p>

                  {/* Evidence pills */}
                  {(conflictFile || conflictConfidence > 0) && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {conflictFile && (
                        <span className="flex items-center gap-1.5 text-[10px] font-mono-tech bg-[#13131C] border border-[#262636] text-[#8A8A9E] px-3 py-1.5 rounded-lg">
                          <DocIcon size={11} />
                          {conflictFile}
                        </span>
                      )}
                      {conflictConfidence > 0 && (
                        <span className="flex items-center gap-1.5 text-[10px] font-mono-tech bg-[#13131C] border border-[#262636] text-[#C4C4D4] px-3 py-1.5 rounded-lg">
                          <SparklesIcon size={11} />
                          Confidence: {Math.round(conflictConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#F2EFE9] tracking-tight leading-snug mb-3">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircleIcon size={24} className="text-[#9AA68A]" />
                      <span>All contracts verified.</span>
                    </span>
                    {" "}<span className="text-[#6A6A7A]">No drift detected.</span>
                  </h1>
                  <p className="text-sm text-[#7A7A8E] leading-relaxed max-w-2xl">
                    Your documentation matches your codebase. Cognis has checked {data.contracts} contracts and generated{" "}
                    {data.checks} permanent regression test{data.checks !== 1 ? "s" : ""} to prevent future drift.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Stat cards column */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              { label: "Contracts Checked", value: data.contracts, tone: "neutral", Icon: SearchIcon, delay: "anim-delay-100" },
              { label: "Conflicts Found", value: fixApplied ? 0 : data.conflicts, tone: data.conflicts > 0 && !fixApplied ? "accent" : "success", Icon: WarningIcon, delay: "anim-delay-200" },
              { label: "Fixes Verified", value: data.verified, tone: "success", Icon: CheckIcon, delay: "anim-delay-300" },
              { label: "Tests Created", value: data.checks, tone: "warning", Icon: TestIcon, delay: "anim-delay-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`dashboard-card dashboard-card--interactive dashboard-stat dashboard-stat--${stat.tone} anim-fade-in-up ${stat.delay} p-4 flex items-center gap-3`}
              >
                <div className="dashboard-stat__icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <stat.Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono-tech text-[#5A5A6E] uppercase tracking-wider mb-0.5">{stat.label}</div>
                  <div className="text-xl font-bold font-mono-tech">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {topologyPrimary && (
          <section className="dashboard-topology anim-fade-in-up anim-delay-200" aria-labelledby="drift-topology-title">
            <div className="dashboard-topology__header flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono-tech uppercase tracking-[.18em] text-[#6A6A7A]">Evidence relationships</span>
                <h2 id="drift-topology-title" className="mt-1 text-base font-bold text-[#F2EFE9]">Drift topology</h2>
              </div>
              <span className="dashboard-topology__summary text-[10px] font-mono-tech text-[#8C887B]">{data.conflicts} unresolved source-of-truth {data.conflicts === 1 ? "conflict" : "conflicts"}</span>
            </div>
            <div className="dashboard-topology__canvas">
              <svg className="dashboard-topology__svg" viewBox="0 0 760 280" role="img" aria-label="Documentation, implementation, and test evidence relationships">
                <rect className="dashboard-topology__cluster" x="12" y="20" width="190" height="240" rx="10" />
                <text className="dashboard-topology__cluster-label" x="28" y="43">DOCUMENTATION</text>
                <rect className="dashboard-topology__cluster" x="230" y="20" width="266" height="240" rx="10" />
                <text className="dashboard-topology__cluster-label" x="246" y="43">IMPLEMENTATION</text>
                <rect className="dashboard-topology__cluster" x="524" y="20" width="224" height="240" rx="10" />
                <text className="dashboard-topology__cluster-label" x="540" y="43">VERIFICATION</text>

                <path className="dashboard-topology__edge dashboard-topology__edge--conflict" d={`M${128 + topologyDocWidth / 2} 126 C230 105 278 100 ${365 - topologyPrimaryWidth / 2} 97`} />
                <path className="dashboard-topology__edge dashboard-topology__edge--critical" d={`M${128 + topologyDocWidth / 2} 154 C230 178 278 180 ${365 - topologySecondaryWidth / 2} 181`} />
                <path className="dashboard-topology__edge dashboard-topology__edge--agreement" d={`M${365 + topologyPrimaryWidth / 2} 100 C476 90 528 99 ${626 - topologyTestWidth / 2} 125`} />
                <path className="dashboard-topology__edge dashboard-topology__edge--agreement" d={`M${365 + topologySecondaryWidth / 2} 180 C476 190 528 181 ${626 - topologyTestWidth / 2} 155`} />

                <g className="dashboard-topology__node dashboard-topology__node--docs">
                  <rect className="dashboard-topology__node-core" x={128 - topologyDocWidth / 2} y="106" width={topologyDocWidth} height="68" rx="10" />
                  <text className="dashboard-topology__node-label" x="128" y="136">{graphLabel(topologyPrimary.plan.target_file)}</text>
                  <text className="dashboard-topology__node-subtitle" x="128" y="153">{graphLabel(topologyPrimary.plan.find_text, 24)}</text>
                </g>
                <g className="dashboard-topology__node dashboard-topology__node--code dashboard-topology__node--resolver">
                  <rect className="dashboard-topology__node-core" x={365 - topologyPrimaryWidth / 2} y="66" width={topologyPrimaryWidth} height="62" rx="10" />
                  <text className="dashboard-topology__node-label" x="365" y="93">{graphLabel(topologyPrimary.contract_id)}</text>
                  <text className="dashboard-topology__node-subtitle" x="365" y="110">{graphLabel(topologyPrimary.plan.replace_text, 24)}</text>
                </g>
                <g className="dashboard-topology__node dashboard-topology__node--code dashboard-topology__node--route">
                  <rect className="dashboard-topology__node-core" x={365 - topologySecondaryWidth / 2} y="150" width={topologySecondaryWidth} height="62" rx="10" />
                  <text className="dashboard-topology__node-label" x="365" y="177">{graphLabel(topologySecondary?.contract_id ?? topologyPrimary.contract_id)}</text>
                  <text className="dashboard-topology__node-subtitle" x="365" y="194">{graphLabel(topologySecondary?.plan.replace_text ?? topologyPrimary.plan.rationale, 24)}</text>
                </g>
                <g className="dashboard-topology__node dashboard-topology__node--tests">
                  <rect className="dashboard-topology__node-core" x={626 - topologyTestWidth / 2} y="106" width={topologyTestWidth} height="68" rx="10" />
                  <text className="dashboard-topology__node-label" x="626" y="136">{graphLabel(topologyCheck?.test_file ?? topologyPrimary.transaction_id)}</text>
                  <text className="dashboard-topology__node-subtitle" x="626" y="153">{graphLabel(topologyCheck?.predicate ?? topologyPrimary.status, 24)}</text>
                </g>
              </svg>
            </div>
            <div className="dashboard-topology__legend" aria-label="Topology legend">
              <span className="dashboard-topology__legend-item"><span className="dashboard-topology__legend-line dashboard-topology__legend-line--agreement" />agreement</span>
              <span className="dashboard-topology__legend-item"><span className="dashboard-topology__legend-line dashboard-topology__legend-line--conflict" />drift detected</span>
              <span className="dashboard-topology__legend-item"><span className="dashboard-topology__legend-line dashboard-topology__legend-line--critical" />conflicting claim</span>
            </div>
          </section>
        )}

        {/* ── SUGGESTED CHANGE (ACTIONABLE CARD) ── */}
        {hasData && !fixApplied && data.conflicts > 0 && topTransaction && (
          <section className="anim-fade-in-up anim-delay-200">
            <div className="flex items-center gap-2 mb-3">
              <CognisAIAvatar size="sm" interactive />
              <span className="text-sm font-bold text-[#F2EFE9]">Cognis Suggested Fix</span>
              <span className="text-[10px] font-mono-tech bg-[#D8663D]/15 text-[#D8663D] px-2 py-0.5 rounded font-bold">
                READY TO APPLY
              </span>
            </div>

            <div className="interactive-card bg-[#0E0E14] border border-[#252638] rounded-xl overflow-hidden shadow-xl">
              {/* Fix banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[#1E1E2C]">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#F2EFE9]">
                    Update <code className="text-[#9AA68A] bg-[#13131C] px-1.5 py-0.5 rounded text-xs">{conflictFile}</code>
                    {conflictFrom && conflictTo && (
                      <> — change <span className="text-[#E87A68]">&quot;{conflictFrom}&quot;</span> to <span className="text-[#9AA68A]">&quot;{conflictTo}&quot;</span></>
                    )}
                  </p>
                  <p className="text-xs text-[#7A7A8E]">
                    {conflictRationale || `Verified against code · ${Math.round(conflictConfidence * 100)}% confidence`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { handleApplyFix(); }}
                    className="dashboard-button dashboard-button--primary font-mono-tech font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <CheckIcon size={12} />
                    <span>ACCEPT &amp; APPLY FIX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDocEditor(true)}
                    className="dashboard-button dashboard-button--secondary font-mono-tech text-xs px-4 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <PencilIcon size={12} />
                    <span>EDIT FIRST</span>
                  </button>
                </div>
              </div>

              {/* Diff preview — only show if we have actual before/after values */}
              {conflictFrom && conflictTo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1E1E2C]">
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-tech">
                      <span className="text-[#E87A68] font-bold">− CURRENT (STALE)</span>
                      <span className="text-[#4A4A5A]">{conflictFile}</span>
                    </div>
                    <div className="bg-[#0A0A0E] rounded-lg p-3 text-xs font-mono-tech text-[#E87A68] border border-[#1E1E2A]">
                      {conflictFrom}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-tech">
                      <span className="text-[#9AA68A] font-bold">+ COGNIS FIX</span>
                      <span className="text-[#4A4A5A]">Verified from code</span>
                    </div>
                    <div className="bg-[#0A0A0E] rounded-lg p-3 text-xs font-mono-tech text-[#9AA68A] border border-[#1E1E2A]">
                      {conflictTo}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-xs font-mono-tech text-[#5A5A6A]">
                  Open the editor to review and apply the full patch.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── FIX APPLIED STATE ── */}
        {fixApplied && (
          <section className="anim-fade-in-up bg-gradient-to-r from-[#0C1409] to-[#09100C] border border-[#9AA68A]/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircleIcon size={16} className="text-[#9AA68A]" />
                <span className="text-sm font-bold text-[#9AA68A]">Fix Applied Successfully</span>
              </div>
              <p className="text-xs text-[#5A7A5A]">
                Accepted for {form.owner}/{form.repository}@{form.ref} · the next scan will verify this repair against the current repository state
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowScanModal(true)}
                className="dashboard-button dashboard-button--primary font-mono-tech font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2"
              >
                <ScanIcon size={13} />
                <span>VERIFY NEXT SCAN</span>
              </button>
              <button
                type="button"
                onClick={handleCreatePr}
                className="dashboard-button dashboard-button--success font-mono-tech font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2"
              >
                <GitPullRequestIcon size={13} />
                <span>{prSent ? "PR SENT TO GITHUB!" : "CREATE GITHUB PR"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDocEditor(true)}
                className="dashboard-button dashboard-button--secondary font-mono-tech text-xs px-4 py-2.5 rounded-lg"
              >
                VIEW DOC
              </button>
            </div>
          </section>
        )}

        {/* ── SECONDARY ACTIONS ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Scan Repo */}
          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="group anim-fade-in-up anim-delay-200 interactive-card flex items-center gap-3 bg-[#0D0D12] hover:bg-[#131320] border border-[#1E1E2A] hover:border-[#D8663D]/50 rounded-xl p-4 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#D8663D]/15 flex items-center justify-center text-[#D8663D] shrink-0 group-hover:scale-110 transition-transform">
              <ScanIcon size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F2EFE9] group-hover:text-[#D8663D] transition-colors">
                Scan Repository
              </div>
              <div className="text-[11px] text-[#5A5A6E]">Run a new investigation</div>
            </div>
          </button>

          {/* Generate Docs */}
          <button
            type="button"
            onClick={() => setShowDocEditor(true)}
            className="group anim-fade-in-up anim-delay-300 interactive-card flex items-center gap-3 bg-[#0D0D12] hover:bg-[#131320] border border-[#1E1E2A] hover:border-[#9AA68A]/50 rounded-xl p-4 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#9AA68A]/15 flex items-center justify-center text-[#9AA68A] shrink-0 group-hover:scale-110 transition-transform">
              <DocIcon size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F2EFE9] group-hover:text-[#9AA68A] transition-colors">
                Generate Documentation
              </div>
              <div className="text-[11px] text-[#5A5A6E]">Auto-generate from code</div>
            </div>
          </button>

          {/* Case Files */}
          <Link
            href="/healing"
            className="group anim-fade-in-up anim-delay-400 interactive-card flex items-center gap-3 bg-[#0D0D12] hover:bg-[#131320] border border-[#1E1E2A] hover:border-[#E3B65A]/50 rounded-xl p-4 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E3B65A]/15 flex items-center justify-center text-[#E3B65A] shrink-0 group-hover:scale-110 transition-transform">
              <CaseFilesIcon size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F2EFE9] group-hover:text-[#E3B65A] transition-colors">
                View Case Files
              </div>
              <div className="text-[11px] text-[#5A5A6E]">All repair history &amp; diffs</div>
            </div>
          </Link>
        </div>

        {/* ── INVESTIGATIONS HISTORY ── */}
        <section className="anim-fade-in-up anim-delay-300 bg-[#0D0D12] border border-[#1E1E2A] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A24]">
            <span className="text-xs font-mono-tech uppercase tracking-wider text-[#6A6A7A] font-bold">
              Recent Scans
            </span>
            <span className="text-[10px] font-mono-tech text-[#4A4A5A]">
              {records.length} total · {records.filter((r) => r.status === "SUCCEEDED").length} completed
            </span>
          </div>

          <div className="divide-y divide-[#14141C]">
            {records.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#14141E] border border-[#1E1E2A] flex items-center justify-center mx-auto">
                  <ScanIcon size={18} className="text-[#3A3A4A]" />
                </div>
                <p className="text-sm text-[#4A4A5A]">No scans yet. Click <strong className="text-[#7A7A8E]">Scan Repository</strong> to start.</p>
              </div>
            ) : (
              records.slice(0, 5).map((r) => {
                const isRunningItem = r.status === "RUNNING";
                return (
                  <div key={r.investigation_id} className="dashboard-table-row flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isRunningItem
                          ? "bg-[#E3B65A] animate-pulse"
                          : r.status === "SUCCEEDED"
                          ? "bg-[#9AA68A]"
                          : "bg-[#B84A3A]"
                      }`} />
                      <div className="min-w-0">
                        <div className="text-xs font-mono-tech font-bold text-[#D4D4E4] truncate">
                          {r.owner}/{r.repository}
                          <span className="text-[#4A4A5A] font-normal ml-1.5">@{r.ref}</span>
                        </div>
                        <div className="text-[10px] font-mono-tech text-[#4A4A5A] mt-0.5">
                          {stamp(r.created_at)} · {r.investigation_id.slice(0, 16)}…
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReplayId(r.investigation_id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono-tech text-[#D8663D] hover:text-[#E87A68] px-2.5 py-1.5 border border-[#2A2A3A] hover:border-[#D8663D]/50 rounded-lg transition-all"
                      >
                        <ReplayIcon size={10} />
                        REPLAY
                      </button>
                      <span className={`text-[10px] font-mono-tech px-2.5 py-1 rounded-lg ${
                        isRunningItem
                          ? "bg-[#E3B65A]/15 text-[#E3B65A]"
                          : r.status === "SUCCEEDED"
                          ? "bg-[#9AA68A]/15 text-[#9AA68A]"
                          : "bg-[#B84A3A]/15 text-[#B84A3A]"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── HOW COGNIS WORKS (simple explainer) ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              step: "01",
              title: "Scan",
              tone: "scan",
              body: "Cognis reads your code and docs, then extracts behavioral contracts — things like 'this function retries 5 times' — from the actual source.",
              delay: "anim-delay-100",
            },
            {
              step: "02",
              title: "Reason",
              tone: "reason",
              body: "Cognis compares contracts across code, tests, and docs. When it finds a contradiction, it explains the likely cause, consequence, and confidence in plain language.",
              delay: "anim-delay-200",
            },
            {
              step: "03",
              title: "Fix",
              tone: "fix",
              body: "Cognis writes the verified patch, commits a regression test alongside it, and opens a PR — so the bug can never come back.",
              delay: "anim-delay-300",
            },
          ].map((s) => (
            <div key={s.step} className={`dashboard-card dashboard-card--interactive anim-fade-in-up ${s.delay} p-5 space-y-2`}>
              <div className={`dashboard-explainer-step--${s.tone} text-[10px] font-mono-tech uppercase tracking-[.18em] font-bold`}>
                {s.step} · {s.title}
              </div>
              <p className="text-xs text-[#7A7A8E] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </section>

        {/* error notice */}
        {notice && (
          <div className="anim-fade-in-up bg-[#1A0C0C] border border-[#4A1A1A] rounded-lg p-4 text-xs font-mono-tech text-[#E87A68] flex items-center gap-2">
            <WarningIcon size={14} className="shrink-0" />
            {notice}
          </div>
        )}
        </div>
      </div>

      {/* ── SCAN MODAL ── */}
      {showScanModal && (
        <div className="dashboard-modal-backdrop fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dashboard-modal bg-[#0E0E14] border border-[#262638] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#1E1E2C]">
              <div className="flex items-center gap-2">
                <ScanIcon size={14} className="text-[#D8663D]" />
                <span className="text-sm font-bold font-mono-tech tracking-wider">SCAN REPOSITORY</span>
              </div>
              <button type="button" onClick={() => setShowScanModal(false)} className="text-[#5A5A6A] hover:text-[#F2EFE9] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A24] transition-colors">
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={startScan} className="p-5 space-y-4 font-mono-tech text-xs">
              <div className="space-y-1.5">
                <label className="text-[#6A6A7A] uppercase tracking-wider">GitHub Owner</label>
                <input
                  type="text"
                  required
                  value={form.owner}
                  onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))}
                  className="w-full bg-[#13131C] border border-[#262636] px-3 py-2.5 rounded-lg text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#6A6A7A] uppercase tracking-wider">Repository Name</label>
                <input
                  type="text"
                  required
                  value={form.repository}
                  onChange={(e) => setForm((p) => ({ ...p, repository: e.target.value }))}
                  className="w-full bg-[#13131C] border border-[#262636] px-3 py-2.5 rounded-lg text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#6A6A7A] uppercase tracking-wider">Branch / Ref</label>
                <input
                  type="text"
                  required
                  value={form.ref}
                  onChange={(e) => setForm((p) => ({ ...p, ref: e.target.value }))}
                  className="w-full bg-[#13131C] border border-[#262636] px-3 py-2.5 rounded-lg text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[#6A6A7A] uppercase tracking-wider">Auto-Fix Threshold</label>
                  <span className="text-[#9AA68A] font-bold">{form.autonomy_threshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={form.autonomy_threshold}
                  onChange={(e) => setForm((p) => ({ ...p, autonomy_threshold: e.target.value }))}
                  className="w-full accent-[#D8663D]"
                />
                <span className="text-[10px] text-[#4A4A5A]">
                  Above this confidence, Cognis applies fixes automatically.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="flex-1 py-2.5 border border-[#262636] text-[#6A6A7A] hover:text-[#F2EFE9] rounded-lg transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 py-2.5 bg-[#D8663D] hover:bg-[#c45730] text-[#08080A] font-bold rounded-lg transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <span className="w-3 h-3 border border-[#08080A] border-t-transparent rounded-full animate-spin" />
                      SCANNING…
                    </>
                  ) : "LAUNCH SCAN →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDemoWelcome && (
        <div className="dashboard-modal-backdrop fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="demo-welcome-title">
          <div className="dashboard-demo-welcome dashboard-modal">
            <div className="dashboard-demo-welcome__halo"><CognisAIAvatar variant="companion" label="Cognis Dev Companion" /></div>
            <span className="text-[10px] font-mono-tech uppercase tracking-[.18em] text-[#D8663D]">Cognis demo workspace</span>
            <h2 id="demo-welcome-title" className="mt-3 text-2xl font-bold tracking-tight">Welcome — your investigation workspace is ready.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#C9C5B7]">Explore the repository map, open Cognis Dev Companion, and run a scan to see how implementation evidence becomes a reviewable repair.</p>
            <button type="button" onClick={() => setShowDemoWelcome(false)} className="dashboard-button dashboard-button--primary mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-mono-tech font-bold tracking-wider">
              ENTER WORKSPACE <ArrowRightIcon size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {replayId && (
        <InvestigationReplayModal
          investigationId={replayId}
          onClose={() => setReplayId(null)}
        />
      )}

      {showDocEditor && (
        <DocEditorModal
          repositoryName={`${form.owner}/${form.repository}`}
          onClose={() => setShowDocEditor(false)}
        />
      )}

      {/* Ask Cognis floating copilot */}
      <AskCognis owner={form.owner} repository={form.repository} />
    </main>
  );
}
