"use client";

import { useState } from "react";
import type { Finding } from "@/lib/scanner/types";
import { SeverityBadge, StatusBadge } from "../ui/Badges";

interface FindingItemProps {
  finding: Finding;
}

export function FindingItem({ finding }: FindingItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (finding.remediationSnippet) {
      navigator.clipboard.writeText(finding.remediationSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFail = finding.status === "fail";
  const isWarning = finding.status === "warning";

  let cardBorder = "border-slate-200";
  let iconBg = "bg-emerald-50 border-emerald-200 text-emerald-600";
  let iconName = "verified";

  if (isFail) {
    cardBorder = "border-red-200/80";
    iconBg = "bg-red-50 border-red-200 text-red-600";
    iconName = "error";
  } else if (isWarning) {
    cardBorder = "border-amber-200/80";
    iconBg = "bg-amber-50 border-amber-200 text-amber-600";
    iconName = "warning";
  }

  return (
    <article className={`bg-white border ${cardBorder} rounded-xl p-space-md sm:p-space-lg flex flex-col gap-space-md shadow-sm transition-all hover:shadow`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
        <div className="flex items-start gap-space-sm">
          <span className={`material-symbols-outlined text-xl p-2 rounded-lg border ${iconBg}`}>
            {iconName}
          </span>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-xs">
              <SeverityBadge severity={finding.severity} />
              <span className="text-slate-400">•</span>
              <span className="font-label-code-sm text-slate-500">{finding.categoryTitle}</span>
              {finding.cwe && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="font-label-code-sm font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                    {finding.cwe}
                  </span>
                </>
              )}
            </div>
            <h3 className="font-headline-sm text-slate-900 font-semibold mt-1">
              {finding.title}
            </h3>
          </div>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          <StatusBadge status={finding.status} />
        </div>
      </div>

      {/* Description */}
      <p className="font-body-md text-slate-600 leading-relaxed">{finding.description}</p>

      {/* Importance */}
      {finding.importance && (
        <div className="bg-slate-50/70 border-l-2 border-slate-400 pl-3 py-1.5 text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Pourquoi c&apos;est important : </span>
          <span>{finding.importance}</span>
        </div>
      )}

      {/* Detected Value */}
      {finding.detectedValue && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-label-code-sm">
          <span className="text-slate-500 text-xs shrink-0">Valeur observée :</span>
          <code className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-xs overflow-x-auto max-w-full">
            {finding.detectedValue}
          </code>
        </div>
      )}

      {/* Remediation Snippet */}
      {finding.remediationSnippet && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-space-sm sm:p-space-md flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-blue-700 flex items-center gap-1.5 font-medium text-xs">
              <span className="material-symbols-outlined text-sm">build_circle</span>
              Recommandation de remédiation
            </span>
            <button
              onClick={handleCopy}
              type="button"
              className="text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded shadow-2xs font-label-code-sm text-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <span className={`material-symbols-outlined text-xs ${copied ? "text-emerald-600" : ""}`}>
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copié !" : "Copier la configuration"}</span>
            </button>
          </div>
          <pre className="font-label-code-sm text-slate-800 overflow-x-auto p-2.5 bg-white border border-slate-200 rounded text-xs selection:bg-blue-600 selection:text-white">
            <code>{finding.remediationSnippet}</code>
          </pre>
        </div>
      )}

      {/* Reference Links */}
      {finding.referenceLinks && finding.referenceLinks.length > 0 && (
        <div className="flex flex-wrap items-center gap-space-md text-xs font-body-sm pt-space-2xs">
          <span className="text-slate-500">Guides et standards :</span>
          {finding.referenceLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              <span>{link.title}</span>
              <span className="material-symbols-outlined text-xs">north_east</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
