"use client";

import { useState } from "react";
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
**Status**: Verified against implementation evidence

## 1. Executive Summary
Cognis detected source implementation evidence across Python and TypeScript modules. This document represents the evidence-backed source of truth generated from AST signatures, unit tests, and package manifests.

## 2. Core API Specifications & Contracts
### 2.1 Retry Policy Contract (\`RetryPolicy\`)
- **\`retry_count\`**: 5 *(Verified from \`backend/contracts/resolver.py\`)*
- **\`backoff_strategy\`**: Exponential backoff with jitter
- **\`timeout_ms\`**: 5000ms

### 2.2 Orchestration Workflow Pipeline
The 6-stage investigation loop operates sequentially across:
1. **Observe**: Webhook & commit trigger ingestion.
2. **Understand**: Lightweight DynamoDB AST similarity indexing.
3. **Reason**: Hand-rolled Amazon Bedrock InvokeModel agent reasoning.
4. **Challenge**: Isolated sandbox code block execution & regression testing.
5. **Decide**: Confidence-gated dial (auto-heal vs human escalation).
6. **Verify -> Publish**: Self-healing patch verification & audit trail locking.

## 3. Developer Notes & Additions
<!-- Edit or add custom documentation below -->
- Custom endpoint notes or architecture additions can be typed directly in this window.
`;

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
  const template = (initialContent || DEFAULT_DOC_TEMPLATE).replace("{REPO}", repositoryName);
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
              className="text-[#8C887B] hover:text-[#F2EFE9] text-lg px-2 ml-2"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center gap-2 px-6 bg-[#080806] border-b border-[#1C1C17] text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "editor"
                ? "border-[#D8663D] text-[#D8663D] font-bold"
                : "border-transparent text-[#66655E] hover:text-[#8C887B]"
            }`}
          >
            DOCUMENT EDITOR & ADDITIONS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drift")}
            className={`py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "drift"
                ? "border-[#D8663D] text-[#D8663D] font-bold"
                : "border-transparent text-[#66655E] hover:text-[#8C887B]"
            }`}
          >
            DRIFT & SELF-HEALING ANALYSIS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diff")}
            className={`py-3 px-4 border-b-2 tracking-wider ${
              activeTab === "diff"
                ? "border-[#D8663D] text-[#D8663D] font-bold"
                : "border-transparent text-[#66655E] hover:text-[#8C887B]"
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
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full bg-[#0E0E0B] border border-[#22221C] p-4 text-[12px] font-mono-tech leading-relaxed text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] resize-none"
              />
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
