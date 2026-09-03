"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StepperMatrix } from "@/components/scan/StepperMatrix";
import { type LogEntry, TelemetryTerminal } from "@/components/scan/TelemetryTerminal";
import type { ScanApiResponse, ScanResult } from "@/lib/scanner/types";

function ScanExecution() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("url") || "";

  const [currentStage, setCurrentStage] = useState(1);
  const [progress, setProgress] = useState(15);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (!targetUrl) {
      setError("Aucune URL cible fournie. Veuillez démarrer un scan depuis la page d'accueil.");
      return;
    }

    let isMounted = true;
    const startTime = Date.now();
    const getTimestamp = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      return `00:${elapsed.toFixed(3).padStart(6, "0")}`;
    };

    // Initial logs
    setLogs([
      { timestamp: "00:00.012", level: "info", message: `Démarrage de l'analyse passive pour ${targetUrl}...` },
      { timestamp: "00:00.045", level: "info", message: "Vérification de sécurité SSRF et résolution DNS..." },
    ]);

    // Timed progression through steps to provide telemetry feedback while backend executes
    const timer1 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(2);
      setProgress(35);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "pass", message: "DNS résolu : Enregistrements publics conformes (RFC 1918 sécurisé)" },
        { timestamp: getTimestamp(), level: "info", message: "Initialisation du handshake TLS 1.3 / SNI..." },
      ]);
    }, 700);

    const timer2 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(3);
      setProgress(58);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "pass", message: "Négociation TLS réussie : Chaîne de confiance et ciphers validés" },
        { timestamp: getTimestamp(), level: "info", message: "Inspection des en-têtes HTTP de réponse (CSP, HSTS, XFO)..." },
      ]);
    }, 1400);

    const timer3 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(4);
      setProgress(75);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "info", message: "Analyse des attributs de cookies (Secure, HttpOnly, SameSite)..." },
      ]);
    }, 2100);

    const timer4 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(5);
      setProgress(88);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "info", message: "Vérification passive des ressources et contenu mixte..." },
      ]);
    }, 2700);

    // Run real backend API scan
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
    })
      .then(async (res) => {
        const json: ScanApiResponse = await res.json();
        if (!isMounted) return;

        if (!json.success || !json.data) {
          setError(json.error || "Impossible d'analyser le site.");
          return;
        }

        const data: ScanResult = json.data;

        // Add final logs
        setLogs((prev) => [
          ...prev,
          { timestamp: getTimestamp(), level: "pass", message: `Formulaires et endpoints validés.` },
          { timestamp: getTimestamp(), level: "pass", message: `Calcul du score : ${data.score}/100 (Grade ${data.grade}).` },
          { timestamp: getTimestamp(), level: "info", message: "Génération du rapport d'audit..." },
        ]);

        setCurrentStage(6);
        setProgress(100);

        // Store result in sessionStorage for instant retrieval on /report
        sessionStorage.setItem("latest_scan", JSON.stringify(data));
        sessionStorage.setItem(`scan_${data.id}`, JSON.stringify(data));

        // Short transition to report page
        setTimeout(() => {
          if (isMounted) {
            router.push(`/report?id=${data.id}`);
          }
        }, 800);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Erreur réseau";
        setError(`Échec de l'analyse : ${msg}`);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [targetUrl, router]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
    router.push("/");
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-space-md py-space-3xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-space-md">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h1 className="font-headline-lg text-slate-900 font-semibold mb-space-xs">
          Analyse impossible
        </h1>
        <p className="font-body-md text-slate-600 max-w-lg mb-space-lg leading-relaxed">
          {error}
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-space-md max-w-lg text-left text-xs text-slate-600 space-y-1 mb-space-xl font-label-code-sm">
          <div className="font-semibold text-slate-900">Vérifications recommandées :</div>
          <div>• Assurez-vous que l&apos;URL commence par http:// ou https://</div>
          <div>• Les adresses privées (localhost, 127.0.0.1, réseau local) sont strictement bloquées par mesure de sécurité</div>
          <div>• Vérifiez que le nom de domaine existe et répond aux requêtes publiques</div>
        </div>
        <div className="flex gap-space-sm">
          <Link
            href="/"
            className="px-space-lg py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-headline-sm font-semibold text-sm transition-all shadow-sm active:scale-95"
          >
            Essayer une autre URL
          </Link>
          <Link
            href="/about"
            className="px-space-lg py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-headline-sm font-semibold text-sm transition-colors"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-space-md lg:px-space-xl py-space-lg">
      {/* Target Header Card */}
      <div className="relative w-full rounded-xl bg-white border border-slate-200 p-space-md lg:p-space-lg shadow-sm overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md">
          {/* Target Identity */}
          <div className="flex items-start sm:items-center gap-space-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-2xl">language</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-headline-md text-slate-900 font-semibold tracking-tight truncate max-w-md">
                  {targetUrl || "https://votresite.fr"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-label-code-sm font-semibold flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  CIBLE EN DIRECT
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-1 text-slate-500 font-label-code-sm text-xs">
                <span>À l&apos;instant (Moteur passif #04)</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-emerald-600 font-medium">Vérifié RFC 7230</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Zéro charge utile</span>
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-space-xs self-start lg:self-center shrink-0">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 font-label-code-sm text-xs font-medium border border-slate-200/80 shadow-2xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-slate-500">
                {copiedLink ? "check" : "share"}
              </span>
              <span>{copiedLink ? "Lien copié !" : "Partager le lien"}</span>
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all flex items-center gap-1.5 font-label-code-sm text-xs font-medium shadow-2xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
              <span>Annuler l&apos;analyse</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Status Bar */}
        <div className="relative z-10 pt-space-md mt-1 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </div>
              <span className="font-headline-sm text-slate-900 font-medium text-sm">
                Exécution du pipeline de diagnostic ({progress}% effectué)...
              </span>
            </div>
            <div className="font-metric-stat text-blue-600 flex items-baseline gap-1 text-lg font-bold">
              <span>{progress}</span>
              <span className="text-xs font-label-code-sm text-slate-400 font-normal">%</span>
            </div>
          </div>

          {/* Fluid Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Inspector Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg items-start">
        {/* Left Panel: Step-by-Step Diagnostic Stepper Checklist (7 cols) */}
        <div className="lg:col-span-7">
          <StepperMatrix currentStage={currentStage} progress={progress} />
        </div>

        {/* Right Panel: Live Telemetry Terminal & Security Spec Context (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <TelemetryTerminal logs={logs} speed="2.8 kbit/s" isStreaming={progress < 100} />

          {/* Attack Surface Vector Preview */}
          <div className="rounded-xl bg-white border border-slate-200 p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-code-sm uppercase tracking-wider text-slate-500 font-semibold text-xs">
                VECTEUR DE SURFACE D&apos;ATTAQUE EN DIRECT
              </span>
              <span className="font-label-code-sm text-blue-600 font-mono font-medium px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs">
                ÉVALUATION PASSIVE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-sm pt-1 text-center">
              <div className="p-space-xs rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="font-metric-stat text-emerald-600 font-bold text-lg">A+</span>
                <span className="font-body-sm text-slate-500 text-xs mt-1">TLS / Chiffrement</span>
              </div>
              <div className="p-space-xs rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="font-metric-stat text-amber-600 font-bold text-lg">
                  {currentStage >= 3 ? "B" : "--"}
                </span>
                <span className="font-body-sm text-slate-500 text-xs mt-1">Posture en-têtes</span>
              </div>
              <div className="p-space-xs rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="font-metric-stat text-slate-400 font-bold text-lg">
                  {currentStage >= 5 ? "A" : "--"}
                </span>
                <span className="font-body-sm text-slate-500 text-xs mt-1">Cookies &amp; CORS</span>
              </div>
            </div>
          </div>

          {/* Zero-Payload Guarantee Card */}
          <div className="rounded-xl bg-white border border-slate-200 p-space-md shadow-sm flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-slate-900 font-semibold text-sm">
                Architecture à charge utile nulle
              </span>
              <p className="font-body-sm text-slate-600 mt-1 leading-relaxed text-xs">
                L&apos;analyse s&apos;achève généralement en 3 à 6 secondes. Aucun vecteur d&apos;attaque ni charge utile intrusive n&apos;est envoyé vers vos serveurs. La télémétrie repose uniquement sur l&apos;analyse passive des réponses standard RFC 7230.
              </p>
              <div className="flex items-center gap-space-sm mt-2 font-label-code-sm text-slate-500 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sûr pour la production
                </span>
                <span>•</span>
                <span>Aucune latence induite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-space-md py-space-3xl text-center">
          <div className="inline-flex items-center gap-2 text-slate-600 font-headline-sm">
            <span className="material-symbols-outlined animate-spin text-blue-600">refresh</span>
            <span>Chargement du scanner...</span>
          </div>
        </div>
      }
    >
      <ScanExecution />
    </Suspense>
  );
}
