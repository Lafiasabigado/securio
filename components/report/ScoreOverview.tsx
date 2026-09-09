"use client";

import type { ScanResult } from "@/lib/scanner/types";
import { ScoreRadar } from "../ui/ScoreRadar";

interface ScoreOverviewProps {
  scan: ScanResult;
}

export function ScoreOverview({ scan }: ScoreOverviewProps) {
  const { score, grade, summary, stats, telemetry } = scan;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Circular Score Radar Card */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <ScoreRadar score={score} grade={grade} size="md" />

          <div className="flex flex-col gap-2 text-center sm:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 self-center sm:self-start px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-semibold uppercase tracking-wider">
              <span>Bilan global de protection</span>
            </div>

            <h2 className="text-lg sm:text-xl text-slate-900 font-bold leading-snug">
              {score >= 80
                ? "Très bon niveau de protection : les défenses essentielles sont actives."
                : score >= 50
                ? "Niveau intermédiaire : des réglages simples permettent de renforcer votre site."
                : "Attention requise : des faiblesses importantes doivent être corrigées."}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {summary ||
                "Nous avons analysé la configuration publique de votre site pour repérer ce qui protège vos utilisateurs et ce qui pourrait être exploité par des attaquants."}
            </p>
          </div>
        </div>

        {/* Breakdown counters - Fully responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Points forts
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl text-emerald-700 font-extrabold">{stats.passed}</span>
              <span className="text-xs text-slate-600">tests réussis</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Éléments bien sécurisés
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              À améliorer
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl text-amber-700 font-extrabold">{stats.warning}</span>
              <span className="text-xs text-slate-600">modérés</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Améliorations conseillées
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Priorités
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl text-red-600 font-extrabold">{stats.critical}</span>
              <span className="text-xs text-slate-600">critiques</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              À corriger en priorité
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Context Card */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fiche technique du site
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              En ligne &amp; accessible
            </span>
          </div>

          <h3 className="text-base text-slate-900 font-bold">
            Informations de connexion observées
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
              <span className="text-slate-500 text-[11px] font-medium">Serveur web</span>
              <span className="text-slate-900 font-semibold truncate mt-0.5" title={telemetry.serverHeader}>
                {telemetry.serverHeader || "Standard (masqué)"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
              <span className="text-slate-500 text-[11px] font-medium">Cadenas SSL / Chiffrement</span>
              <span className="text-slate-900 font-semibold truncate mt-0.5" title={telemetry.tlsCipher || telemetry.tlsVersion}>
                {telemetry.tlsVersion || "Protocole sécurisé"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
              <span className="text-slate-500 text-[11px] font-medium">Adresse IP du serveur</span>
              <span className="text-slate-900 font-semibold truncate mt-0.5 font-mono text-[11px]">
                {telemetry.ip || "Serveur public"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
              <span className="text-slate-500 text-[11px] font-medium">Temps de réponse</span>
              <span className="text-emerald-700 font-semibold truncate mt-0.5">
                {telemetry.latencyMs} millisecondes (rapide)
              </span>
            </div>
          </div>
        </div>

        {/* Reassuring Guidance Box */}
        <div className="pt-5 border-t border-slate-100 mt-5 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-900">
            Comment agir sur vos résultats ?
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consultez les constats détaillés plus bas : chaque point inclut une explication simple du risque et la solution prête à copier pour votre équipe ou hébergeur.
          </p>
        </div>
      </div>
    </div>
  );
}
