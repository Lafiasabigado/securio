"use client";

import type { ScanResult } from "@/lib/scanner/types";
import { ScoreRadar } from "../ui/ScoreRadar";

interface ScoreOverviewProps {
  scan: ScanResult;
}

export function ScoreOverview({ scan }: ScoreOverviewProps) {
  const { score, grade, summary, stats, telemetry } = scan;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Circular Score Radar Card */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-space-md sm:p-space-lg flex flex-col justify-between relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-space-lg z-10">
          <ScoreRadar score={score} grade={grade} size="md" />

          <div className="flex flex-col gap-space-xs text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 self-center sm:self-start px-2 py-0.5 rounded bg-blue-50 border border-blue-100 font-label-code-sm text-blue-700 font-medium">
              <span className="material-symbols-outlined text-sm">shield_with_heart</span>
              <span>ÉVALUATION SYNTHÉTIQUE DE SÉCURITÉ</span>
            </div>
            <h2 className="font-headline-md text-slate-900 font-semibold leading-tight">
              {score >= 80
                ? "Bonne posture de sécurité de base avec quelques ajustements défensifs."
                : score >= 50
                ? "Posture de sécurité intermédiaire avec des vulnérabilités de configuration exposées."
                : "Attention : Risques importants détectés nécessitant une remédiation urgente."}
            </h2>
            <p className="font-body-md text-slate-600 leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-3 gap-3 pt-space-lg mt-space-md border-t border-slate-100 z-10">
          <div className="bg-slate-50 border border-slate-200/80 px-3 sm:px-4 py-3 rounded-lg flex flex-col">
            <span className="font-label-code-sm text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              CONTRÔLES VALIDÉS
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-metric-stat text-2xl text-emerald-700 font-bold">{stats.passed}</span>
              <span className="text-body-sm text-slate-500 hidden sm:inline">tests conformes</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 px-3 sm:px-4 py-3 rounded-lg flex flex-col">
            <span className="font-label-code-sm text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              ATTENTION REQUISE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-metric-stat text-2xl text-amber-700 font-bold">{stats.warning}</span>
              <span className="text-body-sm text-slate-500 hidden sm:inline">modérés</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 px-3 sm:px-4 py-3 rounded-lg flex flex-col">
            <span className="font-label-code-sm text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              ANOMALIE IMPORTANTE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-metric-stat text-2xl text-red-600 font-bold">{stats.critical}</span>
              <span className="text-body-sm text-slate-500 hidden sm:inline">critiques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Context Card */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-space-md sm:p-space-lg flex flex-col justify-between shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              VÉRIFICATION PÉRIMÉTRIQUE
            </span>
            <span className="font-label-code-sm text-emerald-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span> Validé en direct
            </span>
          </div>
          <h3 className="font-headline-sm text-slate-900 font-semibold">Origin Telemetry Stack</h3>

          <div className="grid grid-cols-2 gap-2 pt-2 font-label-code-sm">
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded flex flex-col">
              <span className="text-slate-500 text-xs">Signature serveur</span>
              <span className="text-slate-900 font-semibold truncate" title={telemetry.serverHeader}>
                {telemetry.serverHeader || "Inconnue"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded flex flex-col">
              <span className="text-slate-500 text-xs">Chiffrement TLS</span>
              <span className="text-slate-900 font-semibold truncate" title={telemetry.tlsCipher || telemetry.tlsVersion}>
                {telemetry.tlsVersion || "TLS standard"}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded flex flex-col">
              <span className="text-slate-500 text-xs">Routage IP</span>
              <span className="text-slate-900 font-semibold truncate">{telemetry.ip || "104.21.xx.xx"}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded flex flex-col">
              <span className="text-slate-500 text-xs">Latence d&apos;analyse</span>
              <span className="text-emerald-700 font-semibold">{telemetry.latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Historical Sparkline */}
        <div className="pt-space-md flex flex-col gap-1.5 border-t border-slate-100 mt-4">
          <div className="flex items-center justify-between font-label-code-sm text-slate-500 text-xs">
            <span>Projection de posture relative</span>
            <span className="text-blue-600 font-semibold">Évaluation passive RFC</span>
          </div>
          <div className="h-16 w-full bg-slate-50 border border-slate-200/80 rounded p-2 flex items-end">
            <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 300 48">
              <path
                className="text-blue-600"
                d="M0,40 L30,38 L60,42 L90,34 L120,36 L150,28 L180,30 L210,22 L240,24 L270,14 L300,12"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                className="text-blue-100"
                d="M0,40 L30,38 L60,42 L90,34 L120,36 L150,28 L180,30 L210,22 L240,24 L270,14 L300,12 L300,48 L0,48 Z"
                fill="currentColor"
                opacity="0.6"
              />
              <circle className="fill-blue-600 stroke-white stroke-2" cx="300" cy="12" r="4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
