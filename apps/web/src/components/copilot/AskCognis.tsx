"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { WarningIcon, CloseIcon, SparklesIcon, DocIcon } from "@/components/ui/Icons";
import { CognisAIAvatar } from "@/components/dashboard/CognisAIAvatar";
import type { Citation, CopilotResponse } from "@/app/api/copilot/route";

interface Message {
  role: "user" | "assistant";
  content: string;
  explanation?: string;
  citations?: Citation[];
  contradiction_warning?: CopilotResponse["contradiction_warning"];
  model_used?: string;
  confidence?: number;
  source?: string;
}

interface AskCognisProps {
  owner?: string;
  repository?: string;
}

const QUICK_PROMPTS = [
  "Analyze behavioral contradiction in RetryPolicy",
  "Evaluate AI Agent Drift in AGENTS.md",
  "Explain Split-Brain Consistency formulation",
  "Verify AST code contracts against docs",
];

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded px-1 py-0.5">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function CognisMarkdown({ content }: { content: string }) {
  return (
    <div className="cognis-markdown space-y-2.5 leading-relaxed">
      {content.split("\n").map((line, index) => {
        const heading = line.match(/^(#{1,4})\s+(.+)$/);
        if (heading) {
          const level = heading[1].length;
          const classes = level === 1
            ? "text-base font-bold"
            : "cognis-markdown__heading--minor text-[12px] font-bold";
          return <div key={index} className={classes}>{formatInline(heading[2])}</div>;
        }

        const bullet = line.match(/^\s*[-*]\s+(.+)$/);
        if (bullet) {
          return <div key={index} className="flex gap-2"><span className="cognis-markdown__marker">•</span><span>{formatInline(bullet[1])}</span></div>;
        }

        const ordered = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (ordered) {
          return <div key={index} className="flex gap-2"><span className="cognis-markdown__marker">{ordered[1]}.</span><span>{formatInline(ordered[2])}</span></div>;
        }

        if (!line.trim()) return <div key={index} className="h-1" />;
        return <p key={index}>{formatInline(line)}</p>;
      })}
    </div>
  );
}

export function AskCognis({ owner = "siddarth709", repository = "cognis" }: AskCognisProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### Cognis is ready

Ask about a repository contract, a documentation claim, or a possible source-of-truth conflict. Cognis will explain the evidence, practical consequence, and safest next action.`,
      explanation: `I compare what the repository documents with what its source code and tests demonstrate for ${owner}/${repository}.`,
      confidence: 0.98,
    },
  ]);

  async function sendQuery(text: string) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText, owner, repository }),
      });
      const data = (await res.json()) as CopilotResponse & { error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error || "Cognis could not complete the analysis.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          explanation: data.brief_explanation,
          citations: data.citations,
          contradiction_warning: data.contradiction_warning,
          model_used: data.model_used,
          confidence: data.confidence,
          source: data.source,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Cognis could not complete this analysis right now. Please retry after checking the local service configuration.",
          explanation: "The reasoning service was unavailable, so no evidence-backed conclusion was produced.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    void sendQuery(query);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cognis-copilot-launcher cognis-companion-launcher dashboard-button flex items-center gap-2.5 font-mono-tech font-bold"
        >
          <CognisAIAvatar variant="companion" interactive label="Cognis Dev Companion" />
          <span className="cognis-companion-launcher__copy">
            <span className="cognis-companion-launcher__eyebrow">DEV COMPANION</span>
            <span className="text-xs tracking-[.14em]">ASK COGNIS</span>
          </span>
          <span className="dashboard-status-live w-2 h-2 rounded-full bg-[#080806] ml-0.5" />
        </button>
      ) : (
        <div className="cognis-copilot-frame">
        <div className="cognis-copilot-panel w-[min(480px,calc(100vw-2.5rem))] h-[560px] max-h-[85vh] rounded-2xl flex flex-col font-mono-tech text-xs overflow-hidden anim-fade-in-up">
          {/* Header */}
          <div className="cognis-copilot-header p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CognisAIAvatar size="sm" interactive />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-[.14em] text-[#F2EFE9] text-xs">COGNIS INTELLECT</span>
                </div>
                <div className="text-[10px] text-[#6A6A80] tracking-wider truncate max-w-[260px]">
                  Evidence-led repository reasoning
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="dashboard-icon-button p-1.5 rounded-lg"
            >
              <CloseIcon size={15} />
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-[11px] leading-relaxed">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[94%] p-3.5 rounded-xl border ${
                    msg.role === "user"
                      ? "cognis-copilot-message--user"
                      : "cognis-copilot-message--assistant"
                  }`}
                >
                  {msg.role === "assistant" && msg.explanation && (
                    <div className="cognis-copilot-brief mb-3 p-2.5 border rounded-lg">
                      <span className="text-[9px] tracking-wider text-[#9AA68A] font-bold block mb-1">IN BRIEF</span>
                      <p className="text-[10px] text-[#C4C4D4] leading-relaxed">{msg.explanation}</p>
                      {msg.confidence && <span className="text-[9px] text-[#6A6A80] block mt-1.5">Evidence confidence: {Math.round(msg.confidence * 100)}%</span>}
                    </div>
                  )}

                  {/* Body Text */}
                  <CognisMarkdown content={msg.content} />

                  {/* Contradiction Warning Badge */}
                  {msg.contradiction_warning && (
                    <div className="mt-3 p-3 bg-[#B84A3A]/15 border border-[#B84A3A]/40 text-[#E87A68] rounded-lg">
                      <div className="font-bold tracking-wider flex items-center gap-1.5 mb-1 text-[10px]">
                        <WarningIcon size={12} className="shrink-0" />
                        CONTRADICTION DIVERGENCE DETECTED
                      </div>
                      <p className="text-[10px] text-[#D8D5CC]">
                        {msg.contradiction_warning.reason}
                      </p>
                      <div className="mt-2 text-[9px] text-[#8C887B] flex flex-wrap gap-2">
                        <span>Doc: <code className="text-[#E87A68]">{msg.contradiction_warning.doc_file}</code></span>
                        <span>Code: <code className="text-[#9AA68A]">{msg.contradiction_warning.code_file}</code></span>
                      </div>
                    </div>
                  )}

                  {/* Citations list */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#1C1C2C] space-y-1.5">
                      <span className="text-[9px] tracking-wider text-[#6A6A80] block font-bold">
                        GROUNDED EVIDENCE VECTORS:
                      </span>
                      {msg.citations.map((c, i) => (
                        <div
                          key={i}
                          className="text-[10px] text-[#9AA68A] bg-[#0A0A10] p-2 rounded border border-[#1A1A26]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1 text-[#C4C4D4]">
                              <DocIcon size={10} />
                              {c.file}
                            </span>
                            {c.lineRange && (
                              <span className="text-[#D8663D] text-[9px]">{c.lineRange}</span>
                            )}
                          </div>
                          <p className="text-[9px] text-[#7A7A90] italic mt-1 font-mono-tech truncate">
                            {c.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-3 bg-[#11111B] border border-[#1F1F30] rounded-xl flex items-center gap-2.5 text-[11px] text-[#D8663D] animate-pulse">
                <SparklesIcon size={14} className="animate-spin" />
                <span>Reviewing evidence surfaces and synthesizing an explanation…</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="cognis-copilot-prompts px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void sendQuery(prompt)}
                disabled={loading}
                className="dashboard-chip shrink-0 text-[9px] px-2.5 py-1 rounded-md"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="cognis-copilot-footer p-3 border-t flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about contracts, documentation drift, or repository behavior..."
              className="dashboard-input flex-1 px-3 py-2 text-[11px] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="dashboard-button dashboard-button--primary font-bold text-[10px] px-4 py-2 rounded-lg disabled:opacity-40 font-mono-tech"
            >
              TRANSMIT
            </button>
          </form>
        </div>
        </div>
      )}
    </div>
  );
}
