"use client";

import type { CSSProperties, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MonumentalNav } from "@/components/common/MonumentalNav";
import { useAuth } from "@/context/AuthContext";
import { getInvestigations, InvestigationRecordDTO, saveInvestigationId, transactionsFor } from "@/lib/healing-data";

type RuntimeStatus = "checking" | "ready" | "offline";
type Repository = { id: number; fullName: string; name: string; owner: string; defaultBranch: string };
const stamp = (value?: number) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value * 1000) : "Awaiting runtime response";

function insight(records: InvestigationRecordDTO[]) {
  const transactions = transactionsFor(records);
  const contracts = records.flatMap((record) => [...(record.result?.resolved_contracts ?? []), ...(record.result?.resolved_retry_contracts ?? [])]);
  const count = (status: string) => contracts.filter((item) => item.status === status).length;
  return {
    contracts, transactions, consistent: count("consistent"), conflicts: count("contradiction"),
    undocumented: count("code_only"), escalated: records.reduce((total, item) => total + (item.result?.escalated?.length ?? 0), 0),
    checks: records.reduce((total, item) => total + (item.result?.regression_checks?.length ?? 0), 0),
    generated: transactions.filter((item) => item.plan.operation === "create").length,
    verified: transactions.filter((item) => item.verified).length,
    score: contracts.length ? Math.round(count("consistent") / contracts.length * 100) : 0,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [runtime, setRuntime] = useState<RuntimeStatus>("checking");
  const [records, setRecords] = useState<InvestigationRecordDTO[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [startedInvestigationId, setStartedInvestigationId] = useState<string | null>(null);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [form, setForm] = useState({ owner: "", repository: "", ref: "main", autonomy_threshold: "0.75" });

  const refresh = useCallback(async () => {
    if (!user) return;
    const [config, saved] = await Promise.all([
      fetch("/api/investigations", { cache: "no-store" }).then((response) => response.json() as Promise<{ configured: boolean }>),
      getInvestigations(user.uid),
    ]);
    setRuntime(config.configured ? "ready" : "offline");
    setRecords(saved.sort((a, b) => b.created_at - a.created_at));
  }, [user]);

  useEffect(() => { if (!loading && !user) router.replace("/sign-in"); }, [loading, router, user]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/github/repositories", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ connected: boolean; repositories: Repository[] }>)
      .then((data) => { setConnected(data.connected); setRepositories(data.repositories); })
      .catch(() => { setConnected(false); setRepositories([]); });
  }, [user]);
  useEffect(() => {
    const started = records.find((record) => record.investigation_id === startedInvestigationId);
    const shouldPoll = records.some((record) => record.status === "RUNNING") || (startedInvestigationId && !started);
    if (!shouldPoll) return;
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [records, refresh, startedInvestigationId]);

  const data = useMemo(() => insight(records), [records]);
  if (loading || !user) return <main className="min-h-screen bg-[#080806] grid place-items-center font-mono-tech text-[11px] text-[#F2EFE9]">Loading workspace…</main>;
  const completed = records.filter((record) => record.status === "SUCCEEDED").length;
  const running = records.filter((record) => record.status === "RUNNING").length;
  const userId = user.uid;
  const userName = user.displayName || user.email?.split("@")[0] || "Operator";

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(null); setStartedInvestigationId(null);
    try {
      const response = await fetch("/api/investigations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, autonomy_threshold: Number(form.autonomy_threshold) }) });
      const payload = await response.json() as { investigation_id?: string; error?: string };
      if (!response.ok || !payload.investigation_id) throw new Error(payload.error ?? "The runtime could not start this investigation.");
      saveInvestigationId(userId, payload.investigation_id);
      setStartedInvestigationId(payload.investigation_id);
      setSelectedInvestigationId(payload.investigation_id);
      await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to start the investigation."); }
    finally { setBusy(false); }
  }

  const scoreStyle = { "--consistency-score": `${data.score}%` } as CSSProperties;
  const startedRecord = startedInvestigationId ? records.find((record) => record.investigation_id === startedInvestigationId) : null;
  const generatedDocument = data.transactions.find((item) => item.plan.operation === "create");
  const selectedRecord = records.find((record) => record.investigation_id === selectedInvestigationId) ?? null;
  const runMessage = startedInvestigationId
    ? !startedRecord
      ? `Investigation ${startedInvestigationId.slice(0, 8)} is being queued.`
      : startedRecord.status === "RUNNING"
        ? `Investigation ${startedInvestigationId.slice(0, 8)} is running.`
        : startedRecord.status === "SUCCEEDED"
          ? `Investigation ${startedInvestigationId.slice(0, 8)} completed. Results are ready below.`
          : `Investigation ${startedInvestigationId.slice(0, 8)} failed. Review the activity record below.`
    : notice;

  async function downloadGeneratedDocument(investigationId = generatedDocument?.investigation_id) {
    if (!investigationId) return;
    setDownloadBusy(true);
    try {
      const response = await fetch(`/api/investigations/${encodeURIComponent(investigationId)}/artifact`, { cache: "no-store" });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "The generated document is not available yet.");
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to prepare the generated document.");
    } finally {
      setDownloadBusy(false);
    }
  }

  async function generateDocumentation() {
    const target = selectedRecord ?? records[0];
    if (!target) {
      setNotice("Select an investigation first so Cognis knows which repository to document.");
      return;
    }
    setBusy(true);
    setNotice(null);
    setStartedInvestigationId(null);
    try {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: target.owner,
          repository: target.repository,
          ref: target.ref,
          autonomy_threshold: Number(form.autonomy_threshold),
          force_documentation: true,
        }),
      });
      const payload = await response.json() as { investigation_id?: string; error?: string };
      if (!response.ok || !payload.investigation_id) throw new Error(payload.error ?? "The documentation run could not start.");
      saveInvestigationId(userId, payload.investigation_id);
      setStartedInvestigationId(payload.investigation_id);
      setSelectedInvestigationId(payload.investigation_id);
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to start documentation generation.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="dashboard-shell min-h-screen bg-[#080806] text-[#F2EFE9] selection:bg-[#E05A2B]/30">
    <MonumentalNav />
    <div className="dashboard-grid max-w-[1480px] mx-auto px-6 sm:px-12 pt-[112px] pb-16">
      <section className="dashboard-reveal dashboard-reveal-1 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8 border-b border-[#1C1C17] pb-9 mb-8">
        <div><p className="font-mono-tech text-[10px] tracking-[.18em] text-[#D8663D] mb-4">CHANGE INTELLIGENCE / LIVE RUNTIME</p><h1 className="font-monumental-section">Good to see you,<br />{userName}.</h1></div>
        <div className="font-mono-tech text-[10px] tracking-[.12em] text-[#8C887B] xl:text-right"><span className={`dashboard-status-dot ${runtime === "ready" ? "text-[#9AA68A]" : "text-[#C5A85A]"}`}>●</span>{runtime === "ready" ? "RUNTIME CONNECTED" : runtime === "checking" ? "CHECKING RUNTIME" : "RUNTIME NOT CONFIGURED"}<br />{user.email}</div>
      </section>

      <section className="dashboard-reveal dashboard-reveal-2 grid grid-cols-2 xl:grid-cols-5 gap-3 mb-8">{[["Investigations", records.length], ["In progress", running], ["Contracts evaluated", data.contracts.length], ["Verified actions", data.verified], ["Documents created", data.generated]].map(([label, value]) => <div key={String(label)} className="dashboard-metric panel-industrial p-5"><p className="font-mono-tech text-[9px] tracking-[.16em] uppercase text-[#66655E]">{label}</p><p className="dashboard-count mt-3 font-mono-tech text-2xl">{value}</p></div>)}</section>

      <section className="dashboard-reveal dashboard-reveal-3 dashboard-intelligence-grid mb-8">
        <div className="dashboard-consistency panel-elevated p-6 sm:p-7"><div><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#D8663D]">KNOWLEDGE CONSISTENCY</p><h2 className="text-2xl tracking-[-.04em] mt-2">Evidence-backed health.</h2><p className="text-[13px] leading-relaxed text-[#8C887B] mt-3 max-w-[360px]">Calculated from contracts Cognis resolved across source, tests, manifests, and documentation.</p></div><div className="dashboard-score" style={scoreStyle}><div><strong>{data.score}%</strong><span>consistent</span></div></div></div>
        <div className="dashboard-signal-grid panel-industrial p-2">{[["CONTRADICTIONS", data.conflicts, data.conflicts ? "text-[#D8663D]" : "text-[#9AA68A]", "Evidence conflicts requiring repair review."], ["UNDOCUMENTED", data.undocumented, data.undocumented ? "text-[#E3B65A]" : "text-[#9AA68A]", "Code-side signals without matching documentation."], ["ESCALATED", data.escalated, data.escalated ? "text-[#E3B65A]" : "text-[#9AA68A]", "Cases held for human review."], ["REGRESSION CHECKS", data.checks, "text-[#F2EFE9]", "Checks created to catch repeat drift."]].map(([label, value, color, description]) => <article key={String(label)} className="dashboard-signal-card"><span className="dashboard-signal-label">{label}</span><strong className={String(color)}>{value}</strong><p>{description}</p></article>)}</div>
      </section>

      <section className="dashboard-reveal dashboard-reveal-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
        <div className="dashboard-command panel-elevated p-6 sm:p-8"><div className="flex justify-between gap-4 border-b border-[#1C1C17] pb-5 mb-6"><div><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#D8663D]">NEW INVESTIGATION</p><h2 className="text-2xl tracking-[-.04em] mt-2">Inspect a repository.</h2></div><button type="button" onClick={() => void refresh()} className="btn-monumental-secondary text-[9px]">REFRESH</button></div>
          {connected ? <label className="block mb-5"><span className="label-monumental">Import from GitHub</span><select value="" onChange={(event) => { const repo = repositories.find((item) => String(item.id) === event.target.value); if (repo) setForm((current) => ({ ...current, owner: repo.owner, repository: repo.name, ref: repo.defaultBranch })); }} className="input-monumental"><option value="">Choose a connected public repository</option>{repositories.map((repo) => <option key={repo.id} value={repo.id}>{repo.fullName}</option>)}</select></label> : <a href="/api/github/connect" className="btn-monumental-secondary text-[9px] mb-5">CONNECT GITHUB TO IMPORT REPOSITORIES →</a>}
          <form onSubmit={start} className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[["owner", "Repository owner", "e.g. octo-org"], ["repository", "Repository", "e.g. service-api"], ["ref", "Branch or SHA", "main"], ["autonomy_threshold", "Autonomy threshold", "0.75"]].map(([name, label, placeholder]) => <label key={name} className="dashboard-field block"><span className="label-monumental">{label}</span><input required={name !== "autonomy_threshold"} min={name === "autonomy_threshold" ? "0" : undefined} max={name === "autonomy_threshold" ? "1" : undefined} step={name === "autonomy_threshold" ? "0.01" : undefined} type={name === "autonomy_threshold" ? "number" : "text"} value={form[name as keyof typeof form]} placeholder={placeholder} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="input-monumental" /></label>)}<div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2"><button disabled={busy || runtime !== "ready"} className={`btn-monumental text-[10px] disabled:opacity-40 ${busy ? "dashboard-submit-busy" : ""}`}>{busy ? "STARTING…" : "START INVESTIGATION"}<span className="text-[#D8663D]">→</span></button>{runMessage && <p className={`dashboard-notice text-[12px] text-[#8C887B] ${startedRecord?.status === "RUNNING" || !startedRecord && startedInvestigationId ? "dashboard-notice-live" : ""}`}><span className="dashboard-notice-signal" aria-hidden="true" />{runMessage}</p>}</div></form>
        </div>
        <aside className="dashboard-guide panel-industrial p-6"><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#66655E]">SELF HEALING WORKFLOW</p><ol className="mt-5 space-y-5 text-[13px] leading-relaxed text-[#8C887B]"><li><span className="dashboard-step text-[#E3B65A] font-mono-tech">01</span> Map code, manifests, tests, and docs into evidence.</li><li><span className="dashboard-step text-[#E3B65A] font-mono-tech">02</span> Verify conflicts; undocumented repositories receive a separate generated baseline.</li><li><span className="dashboard-step text-[#E3B65A] font-mono-tech">03</span> Review the diff and download the patched artifact from the ledger.</li></ol><Link href="/healing" className="btn-monumental-secondary text-[9px] mt-7">OPEN HEALING LEDGER →</Link></aside>
      </section>

      <section className="dashboard-reveal dashboard-reveal-4 mt-8 dashboard-document-stage panel-elevated p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-[660px]"><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#D8663D]">DOCUMENTATION RECOVERY</p><h2 className="text-2xl tracking-[-.04em] mt-2">Generate the missing source of truth.</h2><p className="text-[13px] leading-relaxed text-[#8C887B] mt-3">When Cognis finds implementation evidence but no documentation, it creates a reviewable baseline from the repository evidence. The generated file is included in the patched artifact; it is never silently committed.</p></div>
          <div className="flex flex-wrap items-center gap-3">{generatedDocument ? <><div className="font-mono-tech text-[10px] tracking-[.12em] text-[#9AA68A] border border-[#9AA68A]/30 px-3 py-2">DOCUMENT READY · {generatedDocument.plan.target_file}</div><button type="button" onClick={() => void downloadGeneratedDocument()} disabled={downloadBusy} className="btn-monumental text-[9px] disabled:opacity-40">{downloadBusy ? "PREPARING…" : "DOWNLOAD GENERATED DOC"} <span className="text-[#D8663D]">→</span></button></> : <><p className="font-mono-tech text-[10px] tracking-[.1em] text-[#66655E]">NO GENERATED DOCUMENT IN THIS WORKSPACE YET</p><button type="button" onClick={() => void generateDocumentation()} disabled={busy || records.length === 0} className="btn-monumental text-[9px] disabled:opacity-40">{busy ? "STARTING…" : "GENERATE DOCUMENTATION"} <span className="text-[#D8663D]">→</span></button></>}</div>
        </div>
      </section>

      <section className="dashboard-reveal dashboard-reveal-4 mt-8 panel-industrial overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1C1C17] flex items-center justify-between gap-4"><div><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#66655E]">INVESTIGATION ACTIVITY</p><p className="text-sm text-[#8C887B] mt-1">Select a run to inspect its outcome.</p></div><span className="font-mono-tech text-[10px] text-[#66655E]">{completed} COMPLETED</span></div>
        {records.length ? <div>{records.map((record) => { const contracts = (record.result?.resolved_contracts?.length ?? 0) + (record.result?.resolved_retry_contracts?.length ?? 0); const actions = record.result?.transactions?.length ?? 0; const isSelected = selectedRecord?.investigation_id === record.investigation_id; return <button type="button" key={record.investigation_id} onClick={() => setSelectedInvestigationId(record.investigation_id)} className={`dashboard-investigation-row w-full text-left px-6 py-5 border-b last:border-0 border-[#1C1C17] flex flex-wrap gap-4 items-center justify-between ${isSelected ? "bg-[#F2EFE9]/[.035]" : ""}`}><div><p className="font-mono-tech text-[12px]">{record.owner}/{record.repository} <span className="text-[#66655E]">@ {record.ref}</span></p><p className="text-[11px] text-[#66655E] mt-1">{stamp(record.created_at)} · {record.investigation_id}</p><div className="dashboard-row-metadata"><span>{contracts} CONTRACTS</span><span>{actions} ACTIONS</span>{record.result?.transactions?.some((item) => item.plan.operation === "create") && <span>DOC CREATED</span>}</div></div><span className={`dashboard-run-status ${record.status === "RUNNING" ? "dashboard-run-status-live" : ""} font-mono-tech text-[10px] tracking-[.12em] ${record.status === "SUCCEEDED" ? "text-[#9AA68A]" : record.status === "FAILED" ? "text-[#B84A3A]" : "text-[#E3B65A]"}`}>{record.status}</span></button>; })}</div> : <p className="px-6 py-12 text-center text-sm text-[#8C887B]">Start an investigation to build your workspace history.</p>}
      </section>

      {selectedRecord && <section className="dashboard-reveal dashboard-reveal-4 mt-6 dashboard-case-file panel-elevated p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 border-b border-[#1C1C17] pb-5"><div><p className="font-mono-tech text-[10px] tracking-[.16em] text-[#D8663D]">SELECTED CASE FILE</p><h2 className="text-xl tracking-[-.04em] mt-2">{selectedRecord.owner}/{selectedRecord.repository}</h2><p className="font-mono-tech text-[10px] text-[#66655E] mt-2">{selectedRecord.investigation_id} · {stamp(selectedRecord.created_at)}</p></div><span className={`dashboard-run-status font-mono-tech text-[10px] tracking-[.12em] ${selectedRecord.status === "SUCCEEDED" ? "text-[#9AA68A]" : selectedRecord.status === "FAILED" ? "text-[#B84A3A]" : "text-[#E3B65A]"}`}>{selectedRecord.status}</span></div>
        {selectedRecord.status === "FAILED" ? <p className="mt-5 font-mono-tech text-[11px] leading-relaxed text-[#D87864] whitespace-pre-wrap">{selectedRecord.error ?? "The runtime did not return an error message."}</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">{[["CONTRACTS", (selectedRecord.result?.resolved_contracts?.length ?? 0) + (selectedRecord.result?.resolved_retry_contracts?.length ?? 0)], ["ACTIONS", selectedRecord.result?.transactions?.length ?? 0], ["REGRESSION CHECKS", selectedRecord.result?.regression_checks?.length ?? 0], ["ESCALATIONS", selectedRecord.result?.escalated?.length ?? 0]].map(([label, value]) => <div key={String(label)} className="panel-industrial p-4"><p className="font-mono-tech text-[9px] tracking-[.13em] text-[#66655E]">{label}</p><p className="font-mono-tech text-xl mt-2">{value}</p></div>)}</div>}
        <div className="flex flex-wrap gap-3 mt-6"><Link href="/healing" className="btn-monumental-secondary text-[9px]">VIEW HEALING CASES →</Link>{selectedRecord.result?.transactions?.some((item) => item.plan.operation === "create") && <button type="button" onClick={() => void downloadGeneratedDocument(selectedRecord.investigation_id)} disabled={downloadBusy} className="btn-monumental text-[9px] disabled:opacity-40">{downloadBusy ? "PREPARING…" : "DOWNLOAD GENERATED DOC"} <span className="text-[#D8663D]">→</span></button>}</div>
      </section>}
    </div>
  </main>;
}
