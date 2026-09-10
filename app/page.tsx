"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScoreRadar } from "@/components/ui/ScoreRadar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HomePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  const isEn = language === "en";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError(t.errorEmptyUrl);
      return;
    }

    router.push(`/scan?url=${encodeURIComponent(trimmed)}`);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npx securio scan https://acme-cloud.io --json");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-50 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 shadow-2xs mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">
              {t.heroBadge}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-5 max-w-3xl leading-[1.15]">
            {t.heroTitle1} <br />
            <span className="text-blue-600">{t.heroTitle2}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Target URL Form - Fully Responsive */}
          <div className="w-full max-w-2xl mb-6">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex-1 flex items-center w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-xs font-bold text-slate-400 select-none mr-2">https://</span>
                <input
                  aria-label={isEn ? "Your website address" : "Adresse de votre site web"}
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
                  id="target-url-input"
                  placeholder={t.urlPlaceholder}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer font-bold text-sm active:scale-98"
              >
                <span>{t.scanButton}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {error && (
              <div className="mt-3 text-xs sm:text-sm text-red-600 font-semibold flex items-center justify-center gap-1.5 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 max-w-md mx-auto">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-slate-600 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.badgeSafe}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.badgeNoIntrusion}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.badgeInstant}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Preview Panel */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" id="audit-preview-panel">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* Target Title Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    boutique-exemple.fr
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {t.demoBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.demoSubtitle}
                </p>
              </div>
            </div>

            <Link
              href={`/scan?url=${encodeURIComponent("https://acme-cloud.io")}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto text-center"
            >
              {isEn ? "Test this example" : "Tester cet exemple"}
            </Link>
          </div>

          {/* Grid Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Score Card */}
            <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-6 flex flex-col justify-between border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isEn ? "Overall Security Score" : "Note globale de sécurité"}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-bold rounded-full text-xs">
                  Grade B+
                </span>
              </div>

              {/* Score Radar */}
              <div className="my-3 flex flex-col items-center justify-center">
                <ScoreRadar score={78} grade="B+" size="md" showGradeBadge={false} />

                <div className="text-center mt-3">
                  <span className="text-base font-bold text-slate-900">
                    {isEn ? "Good security health" : "Bon niveau de protection"}
                  </span>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                    {isEn
                      ? "HTTPS and cookies are well configured. 1 simple setting is missing to prevent script injections."
                      : "Le cadenas et les cookies sont sécurisés. 1 réglage simple manque pour bloquer les scripts pirates."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-slate-200/80 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="block text-lg font-extrabold text-emerald-700">14</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isEn ? "Passed" : "Conformes"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="block text-lg font-extrabold text-amber-600">2</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isEn ? "Warnings" : "À surveiller"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="block text-lg font-extrabold text-red-600">1</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isEn ? "Critical" : "Priorité"}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro 6 Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "HTTPS Certificate" : "Cadenas HTTPS"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "Modern SSL encryption active" : "Chiffrement SSL moderne actif"}
                  </p>
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-center text-emerald-800 font-bold text-[11px]">
                    {isEn ? "Secure" : "Sécurisé"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "Browser Shield" : "Bouclier navigateur"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "CSP protection missing" : "Protection CSP manquante"}
                  </p>
                  <div className="mt-3 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-center text-red-700 font-bold text-[11px]">
                    {isEn ? "Fix needed" : "À corriger"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "Session Cookies" : "Cookies de session"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "Safeguarded against theft" : "Protégés contre le vol"}
                  </p>
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-center text-emerald-800 font-bold text-[11px]">
                    {isEn ? "Secure" : "Sécurisé"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "Mixed Content" : "Contenu mixte"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "Zero unencrypted assets" : "Zéro ressource non chiffrée"}
                  </p>
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-center text-emerald-800 font-bold text-[11px]">
                    {isEn ? "Secure" : "Sécurisé"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "Web Forms" : "Formulaires"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "Submissions secured via HTTPS" : "Envois protégés par HTTPS"}
                  </p>
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-center text-emerald-800 font-bold text-[11px]">
                    {isEn ? "Secure" : "Sécurisé"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {isEn ? "Web Server" : "Serveur web"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isEn ? "Version publicly exposed" : "Version visible publiquement"}
                  </p>
                  <div className="mt-3 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-center text-amber-700 font-bold text-[11px]">
                    {isEn ? "Warning" : "À surveiller"}
                  </div>
                </div>
              </div>

              {/* Sample Remediation Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {isEn
                      ? "Recommendation #1: Enable Content-Security-Policy header"
                      : "Recommandation n°1 : Activer la protection Content-Security-Policy"}
                  </span>
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    {isEn ? "High priority" : "Priorité haute"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isEn
                    ? "Your server does not tell browsers which scripts are trusted. Adding this single configuration line prevents malicious XSS injections."
                    : "Votre serveur n'indique pas au navigateur quels scripts sont autorisés. Une simple ligne de configuration dans votre hébergeur suffit pour bloquer les injections XSS."}
                </p>
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-mono text-blue-700 overflow-x-auto">
                  Content-Security-Policy: default-src &apos;self&apos;; script-src &apos;self&apos;;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use This Tool Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            {isEn ? "Why scan your website?" : "Pourquoi tester votre site ?"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.whySecurioTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t.whySecurioDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t.feat1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.feat1Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
              {t.feat1Badge}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 015 11.9V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.1A7 7 0 0112 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t.feat2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.feat2Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700">
              {t.feat2Badge}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t.feat3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.feat3Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700">
              {t.feat3Badge}
            </div>
          </div>
        </div>

        {/* Developer Terminal Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="text-xs font-semibold text-slate-600 ml-2">
                {t.cliTitle}
              </span>
            </div>
            <button
              onClick={copyCliCommand}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-medium transition-colors cursor-pointer"
            >
              {copiedCli ? t.cliCopied : t.cliCopy}
            </button>
          </div>

          <div className="text-xs text-slate-800 space-y-1 overflow-x-auto bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
            <div className="text-slate-900 font-bold">$ npx securio scan https://acme-cloud.io --json</div>
            <div className="text-emerald-700">[OK] {isEn ? "HTTPS Certificate valid (verified)" : "Cadenas HTTPS valide (certificat vérifié)"}</div>
            <div className="text-emerald-700">[OK] {isEn ? "Session cookies security active" : "Protection des cookies de session active"}</div>
            <div className="text-red-600 font-semibold">[WARNING] {isEn ? "Content-Security-Policy header missing" : "En-tête Content-Security-Policy manquant"}</div>
            <div className="text-slate-500 pt-1">{isEn ? "Scan completed in 412ms • Overall Score: 78/100 (B+)" : "Diagnostic terminé en 412ms • Note globale : 78/100 (B+)"}</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full bg-white border-y border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            {t.ctaTitle}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mb-6 leading-relaxed">
            {t.ctaDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.getElementById("target-url-input")?.focus();
              }}
              type="button"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 transition-all font-bold text-sm active:scale-95 cursor-pointer"
            >
              {t.ctaButton}
            </button>
            <Link
              href="/about"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-sm transition-colors"
            >
              {t.ctaLearnMore}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
