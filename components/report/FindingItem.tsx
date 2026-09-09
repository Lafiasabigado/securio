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

  let cardBorder = "border-slate-200 hover:border-slate-300";
  let iconBg = "bg-emerald-50 border-emerald-200 text-emerald-600";

  if (isFail) {
    cardBorder = "border-red-200 hover:border-red-300";
    iconBg = "bg-red-50 border-red-200 text-red-600";
  } else if (isWarning) {
    cardBorder = "border-amber-200 hover:border-amber-300";
    iconBg = "bg-amber-50 border-amber-200 text-amber-600";
  }

  return (
    <article
      className={`bg-white border ${cardBorder} rounded-2xl p-5 sm:p-7 flex flex-col gap-4 shadow-xs transition-all`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Status Icon SVG */}
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
            {isFail ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : isWarning ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <SeverityBadge severity={finding.severity} />
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-500">{finding.categoryTitle}</span>
              {finding.cwe && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    Réf : {finding.cwe}
                  </span>
                </>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
              {finding.title}
            </h3>
          </div>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          <StatusBadge status={finding.status} />
        </div>
      </div>

      {/* Description simple */}
      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
        <span className="font-semibold text-slate-900">En clair : </span>
        <span>{finding.description}</span>
      </div>

      {/* Importance */}
      {finding.importance && (
        <div className="border-l-3 border-blue-500 pl-3.5 py-0.5 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">Quel est l&apos;impact ? </span>
          <span>{finding.importance}</span>
        </div>
      )}

      {/* Detected Value */}
      {finding.detectedValue && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Valeur actuellement détectée :</span>
          <code className="text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded font-mono text-[11px] overflow-x-auto max-w-full">
            {finding.detectedValue}
          </code>
        </div>
      )}

      {/* Remediation Snippet */}
      {finding.remediationSnippet && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-900">
              Solution technique (à transmettre à votre hébergeur ou développeur) :
            </span>

            <button
              onClick={handleCopy}
              type="button"
              className="text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-emerald-700 font-semibold">Copié !</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Copier le code</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-slate-800 overflow-x-auto p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono selection:bg-blue-600 selection:text-white">
            <code>{finding.remediationSnippet}</code>
          </pre>
        </div>
      )}

      {/* Reference Links */}
      {finding.referenceLinks && finding.referenceLinks.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Documentation complémentaire :</span>
          {finding.referenceLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{link.title}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
