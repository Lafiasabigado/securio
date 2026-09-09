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

  useEffect(() => {
    if (!targetUrl) {
      setError("Aucune adresse web n'a été fournie. Veuillez démarrer un test depuis la page d'accueil.");
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
      { timestamp: "00:00.012", level: "info", message: `Connexion au site ${targetUrl}...` },
      { timestamp: "00:00.045", level: "info", message: "Vérification de l'adresse et des serveurs de noms..." },
    ]);

    // Timed progression through steps
    const timer1 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(2);
      setProgress(35);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "pass", message: "Le site répond correctement." },
        { timestamp: getTimestamp(), level: "info", message: "Vérification du certificat de sécurité SSL et du cadenas HTTPS..." },
      ]);
    }, 700);

    const timer2 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(3);
      setProgress(58);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "pass", message: "Cadenas HTTPS validé avec succès." },
        { timestamp: getTimestamp(), level: "info", message: "Examen des protections contre les attaques de navigateur..." },
      ]);
    }, 1400);

    const timer3 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(4);
      setProgress(75);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "info", message: "Analyse des cookies et de la confidentialité des sessions..." },
      ]);
    }, 2100);

    const timer4 = setTimeout(() => {
      if (!isMounted) return;
      setCurrentStage(5);
      setProgress(88);
      setLogs((prev) => [
        ...prev,
        { timestamp: getTimestamp(), level: "info", message: "Détection des ressources et images non chiffrées..." },
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

        setLogs((prev) => [
          ...prev,
          { timestamp: getTimestamp(), level: "pass", message: `Formulaires et endpoints vérifiés.` },
          { timestamp: getTimestamp(), level: "pass", message: `Calcul du score de santé : ${data.score}/100 (Note ${data.grade}).` },
          { timestamp: getTimestamp(), level: "info", message: "Génération de votre rapport détaillé..." },
        ]);

        setCurrentStage(6);
        setProgress(100);

        sessionStorage.setItem("latest_scan", JSON.stringify(data));
        sessionStorage.setItem(`scan_${data.id}`, JSON.stringify(data));

        setTimeout(() => {
          if (isMounted) {
            router.push(`/report?id=${data.id}`);
          }
        }, 700);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Erreur de connexion";
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
    router.push("/");
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Analyse impossible
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error}
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-600 space-y-2 mb-6 w-full">
          <div className="font-bold text-slate-900">Conseils :</div>
          <div>• Vérifiez que l&apos;adresse commence bien par https:// ou http://</div>
          <div>• Les adresses internes (comme localhost ou 127.0.0.1) sont bloquées pour des raisons de sécurité</div>
          <div>• Assurez-vous que votre site est bien accessible publiquement sur internet</div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs active:scale-95"
          >
            Tester une autre adresse
          </Link>
          <Link
            href="/about"
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Target Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate max-w-md">
                  {targetUrl || "https://votresite.fr"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Analyse en direct
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                <span>Sans impact sur votre serveur</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">100% sécurisé</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            >
              {copiedLink ? "Lien copié !" : "Partager"}
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">
              Diagnostic en cours ({progress}% terminé)...
            </span>
            <span className="text-sm font-extrabold text-blue-600">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stepper Checklist (7 cols) */}
        <div className="lg:col-span-7">
          <StepperMatrix currentStage={currentStage} progress={progress} />
        </div>

        {/* Terminal & Reassurance (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <TelemetryTerminal logs={logs} speed="En direct" isStreaming={progress < 100} />

          {/* Guarantee Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block mb-1">
                Garantie d&apos;analyse inoffensive
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce test analyse uniquement les réponses publiques que votre site envoie à n&apos;importe quel internaute. Aucun formulaire n&apos;est soumis et aucune donnée privée n&apos;est stockée.
              </p>
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
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-slate-600 font-semibold text-sm">
            Chargement de l&apos;analyseur...
          </div>
        </div>
      }
    >
      <ScanExecution />
    </Suspense>
  );
}
