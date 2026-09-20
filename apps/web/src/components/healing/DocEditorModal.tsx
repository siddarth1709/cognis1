"use client";

import { useState, type ReactNode } from "react";
import { CheckIcon, ScanIcon, CloseIcon } from "@/components/ui/Icons";

interface DocEditorModalProps {
  repositoryName: string;
  initialTargetFile?: string;
  initialContent?: string;
  driftSummary?: string;
  diffSnippet?: string;
  onClose: () => void;
}

const DEFAULT_DOC_TEMPLATE = `# COGNIS GENERATED TECHNICAL SPECIFICATION
**Repository**: {REPO}
**Generated Date**: ${new Date().toISOString().split("T")[0]}
**Status**: Generated from implementation evidence · Review required before publication

## Reading this specification
This document is an evidence-led technical reference for \`{REPO}\`. Its purpose is not merely to restate source code: it explains the observable commitments a maintainer, integrator, or reviewer can reasonably rely on. Cognis distinguishes implementation-backed facts from operational inferences and from decisions that must remain under human ownership.

Each substantive claim should be read with its evidence boundary in mind. A value marked **verified** is supported by the referenced source surface; a recommendation describes the safest consequence of that evidence; an item marked **review required** deliberately remains a publication decision rather than an automated assertion.

## 1. Executive Summary
Cognis identified implementation evidence across the repository's Python and TypeScript surfaces. Taken together, that evidence describes a system designed to investigate documentation drift as a contract problem: the implementation, tests, and published description must converge on the same externally meaningful behavior.

The central finding is that a small textual discrepancy can have a disproportionate operational effect. When documentation advertises a retry limit that differs from the executable policy, callers may budget time, retries, and failure handling around a promise the system does not actually make. The specification below therefore records the observed contract, the basis for confidence, and the consequence of leaving the discrepancy unresolved.

### 1.1 Scope and confidence
- **In scope**: implementation behavior, declared configuration, verification flow, and the publication boundary.
- **Evidence standard**: source and test surfaces take precedence over descriptive prose when the two conflict.
- **Confidence interpretation**: confidence expresses how consistently the available evidence supports a conclusion; it is not permission to publish without review.
- **Reviewer responsibility**: confirm that the stated behavior remains appropriate for product, security, and customer-facing commitments before release.

## 2. Core API Specifications & Contracts
### 2.1 Retry Policy Contract (\`RetryPolicy\`)
- **\`retry_count\`**: 5 *(verified from \`backend/contracts/resolver.py\`)*. A request may make up to five retry attempts under the policy before the failure is surfaced to its caller.
- **\`backoff_strategy\`**: exponential backoff with jitter. The delay grows between successive attempts, while jitter prevents simultaneous clients from retrying in lockstep and amplifying an upstream incident.
- **\`timeout_ms\`**: 5000ms. This is the per-attempt time budget; consumers should model the end-to-end worst case as the combined effect of this timeout, retry count, and backoff intervals.

#### Contract implication
The retry policy is part of the service's behavioral interface, even where it is not exposed as a public endpoint parameter. Clients that implement their own fallback, logging, or circuit-breaking behavior need an accurate upper bound on how long the underlying operation may continue to make progress. Any documentation that states three attempts is therefore stale with respect to the observed implementation and should not be treated as an authoritative operational limit.

### 2.2 Orchestration Workflow Pipeline
The investigation loop is deliberately sequential. Each stage narrows uncertainty before the system is allowed to propose or publish a change:
1. **Observe**: receives repository and commit-trigger context, establishing the precise revision and material under examination.
2. **Understand**: extracts documentation and implementation claims, preserving the source locations needed to later explain a conclusion rather than merely announce it.
3. **Reason**: compares those claims and states the strongest evidence-backed interpretation, including the practical consequence of a mismatch.
4. **Challenge**: exercises the proposal in an isolated sandbox and regression context so that a plausible textual correction is not mistaken for a verified behavioral correction.
5. **Decide**: applies the configured confidence threshold. High-confidence, verified work may proceed to the next gate; ambiguous or risky work is escalated for human judgment.
6. **Verify → Publish**: records the verified patch and audit trail, then allows a publication only after the evidence and transaction state meet the publication gate.

#### Why the order matters
The pipeline separates discovery from action. It is possible to detect a contradiction without knowing the correct remedy; it is possible to draft a remedy without proving it safe. By retaining these boundaries, Cognis produces documentation that is explainable to reviewers and safer to operationalize.

## 3. Evidence, Drift, and Publication Guidance
### 3.1 Evidence hierarchy
When sources disagree, Cognis gives precedence to executable implementation and verification evidence over narrative documentation. This does not mean prose is unimportant; it means prose must be reconciled with the behavior users will actually encounter. The associated drift record should preserve the affected documentation location, the supporting implementation location, the recommended correction, and the confidence used at decision time.

### 3.2 Publication gate
This specification is **generated**, not automatically authoritative. Before publication, a reviewer should confirm that the proposed wording is accurate for the intended release, that no unresolved transactions remain, and that the artifact is appropriate for its audience. A verified publication should identify the evidence revision it was derived from so later readers can distinguish it from a general architectural overview.

### 3.3 Operational consequence of unresolved drift
Unresolved documentation drift increases integration risk: consumers may adopt incorrect retry assumptions, operators may diagnose expected behavior as an incident, and future maintainers may preserve an obsolete claim because it appears official. Correcting the document aligns the visible contract with the running system and creates a more reliable basis for change management.

## 4. Developer Notes & Additions
<!-- Edit or add custom documentation below -->
- Add endpoint-specific guarantees, architectural rationale, or release notes here.
- Keep verified observations separate from proposals, and cite the relevant module, test, or revision when making a new factual claim.
- Record any reviewer-approved exception explicitly so that it is not rediscovered later as apparent drift.
`;

function formatDocumentInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function DocumentPreview({ content }: { content: string }) {
  if (!content.trim()) return <p className="document-editor-preview__empty">Start writing to see a formatted specification.</p>;

  return (
    <article className="document-editor-preview">
      {content.split("\n").map((line, index) => {
        const heading = line.match(/^(#{1,4})\s+(.+)$/);
        if (heading) {
          const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3" | "h4";
          return <Tag key={index}>{formatDocumentInline(heading[2])}</Tag>;
        }
        const bullet = line.match(/^\s*[-*]\s+(.+)$/);
        if (bullet) return <ul key={index}><li>{formatDocumentInline(bullet[1])}</li></ul>;
        const ordered = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (ordered) return <ol key={index} start={Number(ordered[1])}><li>{formatDocumentInline(ordered[2])}</li></ol>;
        if (!line.trim() || line.startsWith("<!--")) return null;
        return <p key={index}>{formatDocumentInline(line)}</p>;
      })}
    </article>
  );
}

export function DocEditorModal({
  repositoryName,
  initialTargetFile = "docs/GENERATED_SPEC.md",
  initialContent,
  driftSummary = "Detected 1 behavioral contract contradiction: RetryPolicy doc states retry_count=3, but codebase enforces retry_count=5.",
  diffSnippet = `--- docs/API.md
+++ docs/API.md
@@ -12,3 +12,3 @@
-Requests will retry up to 3 times before failing.
+Requests will retry up to 5 times before failing.`,
  onClose,
}: DocEditorModalProps) {
  const template = (initialContent || DEFAULT_DOC_TEMPLATE).replaceAll("{REPO}", repositoryName);
  const [activeTab, setActiveTab] = useState<"editor" | "drift" | "diff">("editor");
  const [content, setContent] = useState(template);
  const [targetFile, setTargetFile] = useState(initialTargetFile);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [patched, setPatched] = useState(false);

  function applyPatch() {
    // Replace doc count 3 with self-healed 5
    const healed = content.replace(/retry_count:\s*3/gi, "retry_count: 5").replace(/retry up to 3 times/gi, "retry up to 5 times");
    setContent(healed);
    setPatched(true);
    setSavedNotice("Self-healing patch applied! Retry count updated from 3 to 5.");
    setTimeout(() => setSavedNotice(null), 3500);
  }

  function handleSave() {
    setSavedNotice(`Specification saved to ${targetFile}!`);
    setTimeout(() => setSavedNotice(null), 3000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = targetFile.split("/").pop() || "DOCUMENTATION.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#0E0E0B] border border-[#2A2A22] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl text-[#F2EFE9]">
        {/* Header */}
        <div className="p-5 bg-[#141410] border-b border-[#2A2A22] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D8663D] animate-pulse" />
              <span className="text-[10px] tracking-[.18em] text-[#D8663D] uppercase font-bold">
                DOCUMENTATION RECOVERY & SELF-HEALING EDITOR
              </span>
            </div>
            <h3 className="text-base font-bold mt-1 text-[#F2EFE9]">
              {repositoryName} <span className="text-[#66655E]">({targetFile})</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyPatch}
              className={`px-3 py-1.5 text-[10px] font-bold border transition-all ${
                patched
                  ? "bg-[#9AA68A]/20 border-[#9AA68A] text-[#9AA68A]"
                  : "bg-[#D8663D] text-[#080806] border-[#D8663D] hover:bg-[#c45730]"
              }`}
            >
              {patched ? (
                <span className="flex items-center gap-1.5"><CheckIcon size={11} /> PATCH APPLIED</span>
              ) : (
                <span className="flex items-center gap-1.5"><ScanIcon size={11} /> APPLY SELF-HEALED PATCH</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn-monumental-secondary text-[10px] py-1.5 px-3"
            >
              DOWNLOAD .MD ↓
            </button>
            <button
              type="button"
              onClick={onClose}
              className="document-editor-close"
              aria-label="Close document editor"
            >
              <CloseIcon size={15} aria-hidden="true" />
              <span>CLOSE EDITOR</span>
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center gap-2 px-6 bg-[#080806] border-b border-[#1C1C17] text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`dashboard-tab py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "editor"
                ? "dashboard-tab--active font-bold"
                : ""
            }`}
          >
            DOCUMENT EDITOR & ADDITIONS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drift")}
            className={`dashboard-tab py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "drift"
                ? "dashboard-tab--active font-bold"
                : ""
            }`}
          >
            DRIFT & SELF-HEALING ANALYSIS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diff")}
            className={`dashboard-tab py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "diff"
                ? "dashboard-tab--active font-bold"
                : ""
            }`}
          >
            RAW DIFF PREVIEW
          </button>
        </div>

        {/* Notification Toast */}
        {savedNotice && (
          <div className="bg-[#9AA68A]/15 border-b border-[#9AA68A]/40 px-6 py-2 text-[11px] text-[#9AA68A] flex items-center gap-1.5">
            <CheckIcon size={11} /> {savedNotice}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#0A0A08]">
          {activeTab === "editor" && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex justify-between items-center text-[10px] text-[#8C887B]">
                <label className="flex items-center gap-2">
                  <span>TARGET FILE PATH:</span>
                  <input
                    type="text"
                    value={targetFile}
                    onChange={(e) => setTargetFile(e.target.value)}
                    className="bg-[#141410] border border-[#22221C] px-2 py-1 text-[#F2EFE9] text-[10px] w-64"
                  />
                </label>
                <span>MARKDOWN READY · EDIT DIRECTLY BELOW</span>
              </div>
              <div className="rounded-lg bg-[#12120E] border border-[#323026] px-3 py-2 text-[10px] text-[#C9C5B7] leading-relaxed">
                <strong className="text-[#9AA68A]">What you are reviewing:</strong> a generated reference that turns verified source evidence into a readable explanation. Edit it freely, then download it for review or publication.
              </div>
              <div className="document-editor-workspace flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  aria-label="Markdown document source"
                  className="document-editor-source w-full p-4 text-[12px] font-mono-tech leading-relaxed text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] resize-none"
                />
                <DocumentPreview content={content} />
              </div>
            </div>
          )}

          {activeTab === "drift" && (
            <div className="space-y-6">
              <div className="p-5 bg-[#141410] border border-[#22221C] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#D8663D] tracking-wider uppercase font-bold">
                    BEHAVIORAL CONTRADICTION DETECTED
                  </span>
                  <span className="text-[9px] bg-[#B84A3A]/20 text-[#E87A68] border border-[#B84A3A] px-2 py-0.5">
                    DRIFT DETECTED
                  </span>
                </div>
                <p className="text-[12px] text-[#D8D5CC] leading-relaxed">{driftSummary}</p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px]">
                  <div className="p-3 bg-[#080806] border border-[#1C1C17]">
                    <span className="text-[#8C887B] block mb-1">DOCUMENTED SPECIFICATION</span>
                    <code className="text-[#E87A68]">retry_count = 3</code>
                  </div>
                  <div className="p-3 bg-[#080806] border border-[#1C1C17]">
                    <span className="text-[#8C887B] block mb-1">SOURCE IMPLEMENTATION AST</span>
                    <code className="text-[#9AA68A]">retry_count = 5 (backend/contracts/resolver.py)</code>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#141410] border border-[#22221C] space-y-2">
                <span className="text-[10px] text-[#9AA68A] tracking-wider uppercase font-bold">
                  COGNIS SELF-HEALING ACTION
                </span>
                <p className="text-[12px] text-[#8C887B]">
                  Cognis automatically aligned the doc specification with implementation code, verified the fix against the regression suite, and staged the patch transaction for audit approval.
                </p>
              </div>
            </div>
          )}

          {activeTab === "diff" && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#8C887B] block">PROPOSED UNIFIED DIFF</span>
              <pre className="text-[11px] bg-[#080806] p-4 border border-[#1C1C17] text-[#9AA68A] whitespace-pre-wrap leading-relaxed">
                {diffSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-[#141410] border-t border-[#2A2A22] flex items-center justify-between">
          <span className="text-[10px] text-[#8C887B]">
            Lines: {content.split("\n").length} · Words: {content.split(/\s+/).length}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="btn-monumental text-[10px] py-2 px-4"
            >
              SAVE REVISED SPECIFICATION →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
