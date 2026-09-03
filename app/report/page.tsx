"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ScanResult } from "@/lib/scanner/types";
import { ScoreOverview } from "@/components/report/ScoreOverview";
import { CategoryGrid } from "@/components/report/CategoryGrid";
import { FindingsList } from "@/components/report/FindingsList";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");
  const directUrl = searchParams.get("url");

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    // 1. Try to load from sessionStorage (set during /scan)
    if (typeof window !== "undefined") {
      let cached: string | null = null;
      if (scanId) {
        cached = sessionStorage.getItem(`scan_${scanId}`);
      }
      if (!cached) {
        cached = sessionStorage.getItem("latest_scan");
      }

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ScanResult;
          // If scanId was supplied, check if match or fall back
          if (!scanId || parsed.id === scanId) {
            setScan(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore cache parse error and continue
        }
      }
    }

    // 2. If directUrl provided or we don't have cached data, trigger instant scan via API
    const target = directUrl || (scanId ? `https://${scanId.replace("scn_", "")}` : null);
    if (!target) {
      setError("Aucun rapport d'analyse disponible. Veuillez lancer une analyse depuis la page d'accueil.");
      setLoading(false);
      return;
    }

    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: target }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success || !json.data) {
          setError(json.error || "Impossible de charger le rapport.");
        } else {
          setScan(json.data);
          sessionStorage.setItem("latest_scan", JSON.stringify(json.data));
          sessionStorage.setItem(`scan_${json.data.id}`, JSON.stringify(json.data));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erreur de connexion");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scanId, directUrl]);

  const handleCopyJson = () => {
    if (!scan) return;
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleRescan = () => {
    if (!scan) return;
    router.push(`/scan?url=${encodeURIComponent(scan.url)}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-space-md py-space-3xl text-center flex flex-col items-center justify-center gap-space-md">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <span className="material-symbols-outlined text-2xl animate-spin">refresh</span>
        </div>
        <div className="font-headline-sm text-slate-900 font-semibold">Chargement du rapport d&apos;analyse...</div>
        <p className="font-body-sm text-slate-500">Récupération des métriques et des en-têtes de sécurité.</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-3xl mx-auto px-space-md py-space-3xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-space-md">
          <span className="material-symbols-outlined text-3xl">info</span>
        </div>
        <h1 className="font-headline-lg text-slate-900 font-semibold mb-space-xs">
          Rapport introuvable
        </h1>
        <p className="font-body-md text-slate-600 max-w-lg mb-space-lg leading-relaxed">
          {error || "Aucun rapport n'a été trouvé en mémoire pour cette session. Les résultats ne sont pas persistés dans une base de données en V1."}
        </p>
        <Link
          href="/"
          className="px-space-xl py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-headline-sm font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">search</span>
          <span>Lancer une nouvelle analyse</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(scan.timestamp).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col w-full">
      {/* Target Audit Header Strip */}
      <section className="w-full bg-white border-b border-slate-200 px-space-md sm:px-space-xl py-space-lg shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-label-code-sm font-semibold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                CIBLE ACTIVE
              </span>
              <span className="font-label-code-sm text-slate-500 text-xs">ID : {scan.id}</span>
            </div>

            <div className="flex items-baseline gap-space-sm flex-wrap">
              <h1 className="font-headline-lg text-slate-900 font-semibold tracking-tight truncate max-w-2xl">
                {scan.url}
              </h1>
              <a
                href={scan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium text-xs font-body-sm inline-flex items-center gap-0.5"
              >
                <span>consulter le site</span>
                <span className="material-symbols-outlined text-xs">north_east</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-slate-500 font-label-code-sm text-xs pt-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                {formattedDate}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">timer</span>
                Latence : {scan.telemetry.latencyMs}ms
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">memory</span>
                Moteur : v2.4.0 ({scan.telemetry.tlsVersion})
              </span>
            </div>
          </div>

          {/* Quick Action Toolset */}
          <div className="flex flex-wrap items-center gap-2 pt-space-xs xl:pt-0" id="quick-action-bar">
            <button
              onClick={handleRescan}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-label-code-sm text-xs hover:bg-blue-700 transition-colors shadow-sm font-semibold active:scale-95"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Réanalyser le domaine</span>
            </button>

            <button
              onClick={() => window.print()}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-label-code-sm text-xs hover:bg-slate-50 transition-colors shadow-2xs font-medium"
            >
              <span className="material-symbols-outlined text-base text-blue-600">picture_as_pdf</span>
              <span>Exporter en PDF</span>
            </button>

            <button
              onClick={handleCopyJson}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-label-code-sm text-xs hover:bg-slate-50 transition-colors shadow-2xs font-medium"
            >
              <span className="material-symbols-outlined text-base text-slate-500">
                {copiedJson ? "check" : "code"}
              </span>
              <span>{copiedJson ? "JSON Copié !" : "Copier le JSON"}</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-label-code-sm text-xs hover:bg-slate-50 transition-colors shadow-2xs font-medium"
            >
              <span className="material-symbols-outlined text-base text-slate-500">
                {copiedShare ? "check" : "share"}
              </span>
              <span>{copiedShare ? "Lien copié !" : "Partager le rapport"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="w-full max-w-7xl mx-auto px-space-md sm:px-space-xl py-space-xl flex flex-col gap-space-xl">
        {/* Top Score Radar & Telecom context */}
        <ScoreOverview scan={scan} />

        {/* 6 Category Breakdown Cards */}
        <CategoryGrid categories={scan.categories} />

        {/* Detailed Findings List & Filters */}
        <div className="flex flex-col gap-space-sm pt-space-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-slate-900 font-semibold tracking-tight">
              Constats détaillés &amp; Recommandations de remédiation
            </h2>
            <span className="font-label-code-sm text-slate-500 text-xs">
              Classés par priorité d&apos;impact
            </span>
          </div>

          <FindingsList findings={scan.findings} />
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-space-md py-space-3xl text-center">
          <div className="inline-flex items-center gap-2 text-slate-600 font-headline-sm">
            <span className="material-symbols-outlined animate-spin text-blue-600">refresh</span>
            <span>Chargement du rapport...</span>
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
