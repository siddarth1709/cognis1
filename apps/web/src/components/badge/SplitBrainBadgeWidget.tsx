"use client";

import { useState } from "react";

interface SplitBrainBadgeWidgetProps {
  owner?: string;
  repository?: string;
  score?: number;
}

export function SplitBrainBadgeWidget({
  owner = "octo-org",
  repository = "service-api",
  score = 85,
}: SplitBrainBadgeWidgetProps) {
  const [copied, setCopied] = useState<"md" | "html" | null>(null);
  const repoSlug = `${owner}/${repository}`;

  const badgeUrl = `/api/badge/${encodeURIComponent(repoSlug)}`;
  const markdownSnippet = `[![Cognis Knowledge Consistency](${badgeUrl})](https://cognis.dev)`;
  const htmlSnippet = `<a href="https://cognis.dev"><img src="${badgeUrl}" alt="Cognis Knowledge Consistency %" /></a>`;

  function copyText(text: string, type: "md" | "html") {
    void navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="panel-industrial p-6 space-y-4 font-mono-tech text-[11px] text-[#F2EFE9]">
      <div className="flex items-center justify-between border-b border-[#1C1C17] pb-3">
        <div>
          <p className="text-[10px] tracking-[.16em] text-[#D8663D] uppercase">
            SPLIT-BRAIN BADGE
          </p>
          <h3 className="text-sm font-bold text-[#F2EFE9] mt-0.5">Live Knowledge Consistency</h3>
        </div>
        <span className="text-[10px] text-[#9AA68A] border border-[#9AA68A]/30 px-2 py-0.5">
          PUBLIC ENDPOINT
        </span>
      </div>

      <p className="text-[#8C887B] text-[12px] leading-relaxed">
        Embed this dynamic badge directly in your GitHub README or live docs site. It alerts developers in real-time when docs are trustworthy vs undergoing contradiction repair.
      </p>

      {/* Live Badge Preview */}
      <div className="p-4 bg-[#080806] border border-[#1C1C17] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[9px] text-[#66655E] block mb-1">LIVE RENDERED BADGE</span>
          <img src={badgeUrl} alt="Split-Brain Badge Preview" className="h-10" />
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#8C887B] block">CURRENT SCORE</span>
          <span className="text-lg font-bold text-[#9AA68A]">{score}%</span>
        </div>
      </div>

      {/* Code Snippet Copy Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="bg-[#141410] border border-[#22221C] p-3 space-y-2">
          <span className="text-[9px] text-[#8C887B] block">MARKDOWN EMBED</span>
          <code className="text-[9px] text-[#D8D5CC] block truncate">{markdownSnippet}</code>
          <button
            type="button"
            onClick={() => copyText(markdownSnippet, "md")}
            className="btn-monumental-secondary text-[9px] w-full py-1.5"
          >
            {copied === "md" ? "COPIED MARKDOWN!" : "COPY MARKDOWN"}
          </button>
        </div>

        <div className="bg-[#141410] border border-[#22221C] p-3 space-y-2">
          <span className="text-[9px] text-[#8C887B] block">HTML EMBED</span>
          <code className="text-[9px] text-[#D8D5CC] block truncate">{htmlSnippet}</code>
          <button
            type="button"
            onClick={() => copyText(htmlSnippet, "html")}
            className="btn-monumental-secondary text-[9px] w-full py-1.5"
          >
            {copied === "html" ? "COPIED HTML!" : "COPY HTML"}
          </button>
        </div>
      </div>
    </div>
  );
}
