"use client";

import { useState, type FormEvent } from "react";
import { WarningIcon, CloseIcon, SparklesIcon, CpuIcon, DocIcon } from "@/components/ui/Icons";
import type { Citation, CopilotResponse } from "@/app/api/copilot/route";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export function AskCognis({ owner = "siddarth709", repository = "cognis" }: AskCognisProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### Cognis Epistemological Copilot Initialized

I am **Cognis Epistemological Copilot**, powered by **Amazon Bedrock (Claude 3.5 Sonnet)**. I conduct cross-surface topological audits to detect **knowledge divergence** between code ASTs, runtime test traces, and documentation.

Ask me any architectural inquiry regarding **${owner}/${repository}**, contract invariants, or AI agent drift risks.`,
      model_used: "anthropic.claude-3-5-sonnet-20241022-v2:0 (Amazon Bedrock)",
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
      const data = (await res.json()) as CopilotResponse;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
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
          content: "Unable to query the Bedrock reasoning pipeline. Verify network connectivity or check AWS Bedrock credentials.",
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
          className="flex items-center gap-2.5 bg-gradient-to-r from-[#D8663D] to-[#b8522b] hover:from-[#e0734a] hover:to-[#c45730] text-[#08080A] font-mono-tech text-xs font-bold tracking-[.14em] px-4 py-3 rounded-xl shadow-2xl transition-all active:scale-95 border border-[#F2A27A]/30"
        >
          <SparklesIcon size={14} className="text-[#08080A]" />
          <span>ASK COGNIS (BEDROCK AI)</span>
          <span className="w-2 h-2 rounded-full bg-[#08080A] animate-pulse ml-0.5" />
        </button>
      ) : (
        <div className="w-[380px] sm:w-[480px] h-[560px] max-h-[85vh] bg-[#0A0A0F] border border-[#26263A] rounded-2xl shadow-2xl flex flex-col font-mono-tech text-xs text-[#F2EFE9] overflow-hidden anim-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-[#0F0F18] border-b border-[#1E1E2E] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D8663D]/15 border border-[#D8663D]/40 flex items-center justify-center text-[#D8663D]">
                <CpuIcon size={14} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-[.14em] text-[#F2EFE9] text-xs">COGNIS INTELLECT</span>
                  <span className="text-[9px] bg-[#9AA68A]/20 text-[#9AA68A] border border-[#9AA68A]/40 px-1.5 py-0.2 rounded font-bold">
                    BEDROCK
                  </span>
                </div>
                <div className="text-[10px] text-[#6A6A80] tracking-wider truncate max-w-[260px]">
                  Claude 3.5 Sonnet · Epistemological Engine
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#8A8A9E] hover:text-[#F2EFE9] p-1.5 rounded-lg hover:bg-[#1A1A28] transition-colors"
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
                      ? "bg-[#D8663D]/12 border-[#D8663D]/30 text-[#F2EFE9]"
                      : "bg-[#11111B] border-[#1F1F30] text-[#D0D0E0]"
                  }`}
                >
                  {/* Model Telemetry Banner */}
                  {msg.role === "assistant" && msg.model_used && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#1E1E2E] text-[9px] text-[#6A6A80]">
                      <span className="flex items-center gap-1 text-[#9AA68A]">
                        <SparklesIcon size={10} />
                        {msg.model_used.split(" ")[0]}
                      </span>
                      {msg.confidence && (
                        <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                      )}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="leading-relaxed whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

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
                <span>Invoking Bedrock reasoning loop & AST evidence synthesis…</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#0C0C14] border-t border-[#1A1A28] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void sendQuery(prompt)}
                disabled={loading}
                className="shrink-0 text-[9px] bg-[#141420] hover:bg-[#1E1E2E] text-[#9A9AB0] hover:text-[#F2EFE9] border border-[#252535] px-2.5 py-1 rounded-md transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 bg-[#0E0E16] border-t border-[#1E1E2E] flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Bedrock about AST contracts, retry divergence, drift..."
              className="flex-1 bg-[#07070C] border border-[#202030] rounded-lg px-3 py-2 text-[11px] text-[#F2EFE9] focus:outline-none focus:border-[#D8663D] placeholder-[#4A4A60]"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-[#D8663D] hover:bg-[#c45730] text-[#08080A] font-bold text-[10px] px-4 py-2 rounded-lg disabled:opacity-40 transition-all font-mono-tech active:scale-95 shadow-lg"
            >
              TRANSMIT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
