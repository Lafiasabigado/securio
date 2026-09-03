"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Veuillez saisir l'adresse URL de votre site.");
      return;
    }

    // Redirect to scan page with encoded URL
    router.push(`/scan?url=${encodeURIComponent(trimmed)}`);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npx security-health scan https://acme-cloud.io --json --strict");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 border-b border-slate-200/80">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[300px] bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-50 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-space-md lg:px-space-xl pt-space-2xl pb-space-3xl flex flex-col items-center text-center">
          {/* Engine Tag */}
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-blue-50/80 border border-blue-200/70 shadow-2xs mb-space-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            <span className="font-label-code-sm text-blue-700 tracking-wider uppercase font-semibold text-xs">
              AUDIT DE CONFIGURATION PUBLIQUE • MOTEUR PASSIF V2.4
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display-hero text-slate-900 max-w-4xl tracking-tight mb-space-md">
            Identifiez les failles exposées.
            <br />
            <span className="text-blue-600">Protégez l&apos;essentiel.</span>
          </h1>

          <p className="font-body-lg text-slate-600 max-w-2xl mb-space-2xl leading-relaxed">
            Analysez votre site web pour détecter les faiblesses de configuration et obtenez des recommandations claires et concrètes.
          </p>

          {/* Target URL Form */}
          <div className="w-full max-w-3xl mb-space-lg">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white p-2 rounded-2xl shadow-lg border border-slate-200/90 flex flex-col sm:flex-row items-center gap-space-xs"
            >
              <div className="relative flex-1 flex items-center w-full px-space-sm py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <span className="material-symbols-outlined text-blue-600 text-xl mr-space-xs select-none">
                  lock
                </span>
                <span className="font-label-code-lg text-slate-400 select-none mr-1 text-sm">url:</span>
                <input
                  aria-label="URL du site à analyser"
                  className="w-full bg-transparent font-label-code-lg text-slate-900 focus:outline-none placeholder:text-slate-400 text-sm"
                  id="target-url-input"
                  placeholder="https://votresite.fr"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 bg-slate-200/70 rounded-md text-slate-600 font-label-code-sm text-[11px] select-none">
                  Entrée ↵
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-space-xl py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-headline-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-space-xs shrink-0 cursor-pointer font-semibold active:scale-98"
              >
                <span>Analyser mon site</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {error && (
              <div className="mt-2 text-xs text-red-600 font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-space-xs gap-x-space-md text-slate-600 font-body-sm text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
              <span>Analyse passive</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">shield_with_heart</span>
              <span>Aucune exploitation</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">bolt</span>
              <span>Rapport d&apos;audit instantané</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Preview Section (Interactive Demo Panel directly mirroring maquette) */}
      <section className="w-full max-w-7xl mx-auto px-space-md lg:px-space-xl pt-space-2xl pb-space-3xl" id="audit-preview-panel">
        <div className="bg-white rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Target Title Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg bg-slate-50/70 p-space-md rounded-xl border border-slate-200/80 mb-space-lg">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-symbols-outlined text-xl">language</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-headline-md text-slate-900 font-semibold truncate">acme-cloud.io</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200/80 font-label-code-sm text-slate-700 font-medium text-xs">
                    Production
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-label-code-sm text-emerald-700 flex items-center gap-1 font-medium text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 104.21.55.201
                  </span>
                </div>
                <p className="font-label-code-sm text-slate-500 mt-1 text-xs">
                  Audit exécuté avec succès • Engine v2.4-stable
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <Link
                href={`/scan?url=${encodeURIComponent("https://acme-cloud.io")}`}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-label-code-sm rounded-lg flex items-center gap-1 transition-all shadow-2xs font-medium text-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Tester cette cible</span>
              </Link>
            </div>
          </div>

          {/* Grid Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
            {/* Score Card */}
            <div className="lg:col-span-4 bg-white rounded-xl p-space-md sm:p-space-lg flex flex-col justify-between border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-label-code-sm uppercase tracking-wider text-slate-500 font-semibold text-xs">
                  SCORE DE SANTÉ SÉCURITÉ
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-label-code-sm font-semibold rounded-md text-xs">
                  Grade B+
                </span>
              </div>

              <div className="my-space-lg flex items-center justify-center gap-space-lg">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle className="text-slate-100" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeWidth="10" />
                    <circle
                      className="text-amber-500 transition-all duration-1000 ease-out"
                      cx="60"
                      cy="60"
                      fill="transparent"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.159"
                      strokeDashoffset="69.115"
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-metric-stat text-2xl text-slate-900 font-bold">78</span>
                    <span className="font-label-code-sm text-slate-500 font-medium text-xs">/ 100</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-headline-sm text-slate-900 font-semibold">Risque Modéré</span>
                  <p className="font-body-sm text-slate-600 text-xs">
                    Sécurité périmétrique opérationnelle, mais 1 configuration critique d&apos;en-tête est manquante.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-space-sm bg-slate-50 border border-slate-200/80 p-space-xs rounded-lg text-center">
                <div className="p-1">
                  <span className="font-metric-stat text-red-600 block font-bold text-lg">1</span>
                  <span className="font-label-code-sm text-slate-600 font-medium text-[11px]">Critique</span>
                </div>
                <div className="p-1">
                  <span className="font-metric-stat text-amber-600 block font-bold text-lg">2</span>
                  <span className="font-label-code-sm text-slate-600 font-medium text-[11px]">Avertissements</span>
                </div>
                <div className="p-1">
                  <span className="font-metric-stat text-emerald-600 block font-bold text-lg">14</span>
                  <span className="font-label-code-sm text-slate-600 font-medium text-[11px]">Conformes</span>
                </div>
              </div>
            </div>

            {/* Micro 6 Cards */}
            <div className="lg:col-span-8 flex flex-col gap-space-md">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">HTTPS</span>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">TLS 1.3, Valid HSTS with Preload</p>
                  <div className="mt-space-sm pt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-emerald-700 font-semibold text-xs">
                    Conforme
                  </div>
                </div>

                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">En-têtes</span>
                    <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">Missing Permissions-Policy and COOP</p>
                  <div className="mt-space-sm pt-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-amber-700 font-semibold text-xs">
                    Attention requise
                  </div>
                </div>

                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">Cookies</span>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">Secure, HttpOnly, SameSite configurés</p>
                  <div className="mt-space-sm pt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-emerald-700 font-semibold text-xs">
                    Conforme
                  </div>
                </div>

                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">Configuration</span>
                    <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">Content-Security-Policy manquant</p>
                  <div className="mt-space-sm pt-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-red-700 font-semibold text-xs">
                    Anomalie importante
                  </div>
                </div>

                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">Contenu mixte</span>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">Zéro ressource non chiffrée</p>
                  <div className="mt-space-sm pt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-emerald-700 font-semibold text-xs">
                    Conforme
                  </div>
                </div>

                <div className="bg-white p-space-md rounded-xl flex flex-col justify-between border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-slate-900 font-semibold text-sm">Formulaires</span>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  </div>
                  <p className="font-body-sm text-slate-600 text-xs">Destinations protégées par TLS</p>
                  <div className="mt-space-sm pt-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-center font-label-code-sm text-emerald-700 font-semibold text-xs">
                    Conforme
                  </div>
                </div>
              </div>

              {/* Sample Remediation Box */}
              <div className="bg-white rounded-xl p-space-md border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span className="font-label-code-lg text-slate-900 font-semibold text-xs">
                      Constat principal : Content-Security-Policy (CSP) manquant
                    </span>
                  </div>
                  <span className="font-label-code-sm text-red-700 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                    CWE-693
                  </span>
                </div>
                <p className="font-body-sm text-slate-600 mb-space-sm text-xs">
                  La réponse HTTP ne définit pas d&apos;en-tête Content-Security-Policy. Cela expose votre application aux attaques par injection XSS et au détournement de cadre (clickjacking).
                </p>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-label-code-sm text-blue-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <code className="text-slate-800 font-mono text-[11px] overflow-x-auto">
                    Content-Security-Policy: default-src &apos;self&apos;; script-src &apos;self&apos; &apos;nonce-rAnd0m&apos;; object-src &apos;none&apos;;
                  </code>
                  <span className="text-slate-500 text-[11px] shrink-0 font-medium">Recommandation prête à l&apos;emploi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="w-full max-w-7xl mx-auto px-space-md lg:px-space-xl pb-space-3xl">
        <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-code-sm uppercase tracking-wider text-blue-600 font-semibold block mb-1 text-xs">
              ARCHITECTURE DU SYSTÈME
            </span>
            <h2 className="font-headline-lg text-slate-900 font-semibold">
              Audité sans risque. Conçu pour les ingénieurs en production.
            </h2>
          </div>
          <p className="font-body-md text-slate-600 max-w-md">
            Contrairement aux suites d&apos;intrusion invasives, Security Health évalue la conformité RFC et les en-têtes de sécurité via des requêtes HTTP strictement non-destructives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-2xl">
          <div className="bg-white p-space-lg rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-space-md">
                <span className="material-symbols-outlined text-xl">radar</span>
              </div>
              <h3 className="font-headline-sm text-slate-900 font-semibold mb-1">
                Observabilité publique non-intrusive
              </h3>
              <p className="font-body-md text-slate-600 mb-space-md leading-relaxed text-sm">
                Inspecte les résolutions DNS, handshakes TLS, en-têtes HTTP/2 sans charge utile intrusive ni risque d&apos;exploitation. Sécurisé pour la production à grande échelle.
              </p>
            </div>
            <div className="pt-space-md bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-label-code-sm text-slate-700 flex items-center gap-2 font-medium text-xs">
              <span className="material-symbols-outlined text-sm text-emerald-600">check</span>
              <span>Aucun déclenchement de WAF</span>
            </div>
          </div>

          <div className="bg-white p-space-lg rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-space-md">
                <span className="material-symbols-outlined text-xl">code_blocks</span>
              </div>
              <h3 className="font-headline-sm text-slate-900 font-semibold mb-1">
                Remédiation prête pour les développeurs
              </h3>
              <p className="font-body-md text-slate-600 mb-space-md leading-relaxed text-sm">
                Extraits de configuration prêts à copier pour NGINX, Apache, Vercel et Cloudflare Workers pour corriger les faiblesses en quelques minutes.
              </p>
            </div>
            <div className="pt-space-md bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-label-code-sm text-slate-700 flex items-center gap-2 font-medium text-xs">
              <span className="material-symbols-outlined text-sm text-blue-600">terminal</span>
              <span>Préréglages de configuration instantanés</span>
            </div>
          </div>

          <div className="bg-white p-space-lg rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-space-md">
                <span className="material-symbols-outlined text-xl">sync_saved_locally</span>
              </div>
              <h3 className="font-headline-sm text-slate-900 font-semibold mb-1">
                Vérification continue &amp; standard RFC
              </h3>
              <p className="font-body-md text-slate-600 mb-space-md leading-relaxed text-sm">
                Évalue rigoureusement les normes RFC 7230, RFC 6797 (HSTS) et les recommandations de l&apos;OWASP pour garantir une hygiène cryptographique irréprochable.
              </p>
            </div>
            <div className="pt-space-md bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-label-code-sm text-slate-700 flex items-center gap-2 font-medium text-xs">
              <span className="material-symbols-outlined text-sm text-amber-600">schema</span>
              <span>Conformité aux meilleures pratiques</span>
            </div>
          </div>
        </div>

        {/* Light Developer Terminal Preview */}
        <div className="bg-white rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-space-sm mb-space-md bg-slate-100/70 border border-slate-200/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
              <span className="font-label-code-sm text-slate-600 ml-2 font-medium text-xs">
                Terminal — npx security-health scan
              </span>
            </div>
            <button
              onClick={copyCliCommand}
              className="flex items-center gap-1 font-label-code-sm text-slate-600 hover:text-slate-900 text-xs px-2 py-0.5 rounded hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">{copiedCli ? "check" : "content_copy"}</span>
              <span>{copiedCli ? "Copié !" : "Copier"}</span>
            </button>
          </div>

          <div className="font-label-code-sm text-slate-800 leading-relaxed space-y-1 overflow-x-auto bg-slate-50 p-space-md rounded-xl border border-slate-200 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">$</span>
              <span className="text-slate-900 font-semibold">
                npx security-health scan https://acme-cloud.io --json --strict
              </span>
            </div>
            <div className="text-slate-500">Initializing passive network telemetry pipeline for 104.21.55.201...</div>
            <div className="text-blue-700">[INFO] TLS Handshake: TLS 1.3 (ChaCha20-Poly1305) • Certificate valid</div>
            <div className="text-blue-700">[INFO] ALPN Protocols negotiated: h2, http/1.1</div>
            <div className="text-emerald-700 font-medium">[PASS] Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</div>
            <div className="text-emerald-700 font-medium">[PASS] X-Content-Type-Options: nosniff</div>
            <div className="text-emerald-700 font-medium">[PASS] X-Frame-Options: SAMEORIGIN</div>
            <div className="text-amber-700 font-medium">[WARN] Referrer-Policy: not explicitly defined (defaulting to strict-origin)</div>
            <div className="text-red-600 font-semibold">[FAIL] Content-Security-Policy: missing header (High severity: CWE-693)</div>
            <div className="text-slate-400 pt-1">------------------------------------------------------------------</div>
            <div className="text-slate-700 font-medium">
              Audit terminé en <span className="text-emerald-700 font-bold">412ms</span>. Code de sortie :{" "}
              <span className="text-red-600 font-bold">1</span> (Seuil : déclenchement du mode strict).
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full bg-white border-y border-slate-200 py-space-3xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-space-md lg:px-space-xl text-center flex flex-col items-center">
          <h2 className="font-headline-lg text-slate-900 font-semibold mb-2">
            Automatisez l&apos;évaluation de votre posture de sécurité en quelques secondes.
          </h2>
          <p className="font-body-md text-slate-600 max-w-xl mb-space-lg">
            Auditez vos domaines via la console web ou vérifiez vos en-têtes avant chaque mise en production.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.getElementById("target-url-input")?.focus();
              }}
              type="button"
              className="px-space-xl py-space-sm bg-blue-600 text-white font-headline-sm rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-space-xs font-semibold active:scale-95"
            >
              <span className="material-symbols-outlined text-base">search_check</span>
              <span>Lancer un audit instantané</span>
            </button>
            <Link
              href="/about"
              className="px-space-xl py-space-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-headline-sm rounded-xl shadow-sm transition-colors flex items-center gap-space-xs font-semibold"
            >
              <span className="material-symbols-outlined text-base">info</span>
              <span>Comprendre l&apos;analyse passive</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
