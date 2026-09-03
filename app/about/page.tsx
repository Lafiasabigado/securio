import Link from "next/link";

export const metadata = {
  title: "Méthodologie & Analyse Passive — Security Health",
  description:
    "Comprendre le fonctionnement du moteur Security Health, les éléments de configuration analysés, le calcul du score et les limites de l'audit passif.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-space-md sm:px-space-xl py-space-2xl">
      {/* Top Breadcrumb & Heading */}
      <div className="mb-space-xl text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-label-code-sm text-xs font-semibold uppercase tracking-wider mb-space-sm">
          <span className="material-symbols-outlined text-sm">shield</span>
          Transparence &amp; Éthique
        </div>
        <h1 className="font-headline-xl text-slate-900 font-semibold tracking-tight max-w-2xl mb-space-xs">
          Méthodologie d&apos;analyse passive &amp; Limites de l&apos;outil
        </h1>
        <p className="font-body-lg text-slate-600 max-w-xl">
          Découvrez comment Security Health évalue votre configuration publique de façon strictement défensive, conforme et sans impact.
        </p>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-2xl">
        <div className="bg-white border border-slate-200 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
          <h2 className="font-headline-sm text-slate-900 font-semibold">
            Garantie d&apos;analyse 100% passive
          </h2>
          <p className="font-body-md text-slate-600 leading-relaxed text-sm">
            Security Health effectue uniquement des requêtes HTTP standard (identiques à celles d&apos;un internaute ouvrant une page dans son navigateur). Aucune tentative d&apos;intrusion, aucune charge utile malveillante ni fuzzing n&apos;est jamais exécuté.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <h2 className="font-headline-sm text-slate-900 font-semibold">
            Aucun stockage de secrets ni base de données
          </h2>
          <p className="font-body-md text-slate-600 leading-relaxed text-sm">
            En version V1, les analyses sont traitées à la volée. Nous ne conservons aucune information sensible. Les valeurs des cookies sont masquées et les résultats sont uniquement temporaires dans votre navigateur.
          </p>
        </div>
      </div>

      {/* What is Inspected */}
      <section className="bg-white border border-slate-200 rounded-xl p-space-lg sm:p-space-xl shadow-sm mb-space-2xl" id="methodologie">
        <h2 className="font-headline-md text-slate-900 font-semibold mb-space-md flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-2xl">checklist</span>
          Ce qui est inspecté en V1
        </h2>

        <div className="space-y-space-md text-sm text-slate-600">
          <div className="border-b border-slate-100 pb-space-sm">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              1. Chiffrement HTTPS &amp; Négociation TLS
            </h3>
            <p className="font-body-sm text-slate-600 pl-4">
              Vérification de la redirection permanente de HTTP vers HTTPS, version du protocole (TLS 1.2, 1.3), validité du certificat X.509, date d&apos;expiration et algorithme de chiffrement.
            </p>
          </div>

          <div className="border-b border-slate-100 pb-space-sm">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              2. En-têtes de sécurité HTTP défensifs
            </h3>
            <p className="font-body-sm text-slate-600 pl-4">
              Analyse de la syntaxe et de la robustesse des en-têtes recommandés par l&apos;OWASP : <code>Content-Security-Policy</code>, <code>Strict-Transport-Security</code> (HSTS), <code>X-Content-Type-Options</code>, <code>X-Frame-Options</code>, <code>Referrer-Policy</code> et <code>Permissions-Policy</code>.
            </p>
          </div>

          <div className="border-b border-slate-100 pb-space-sm">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              3. Protection des cookies de session
            </h3>
            <p className="font-body-sm text-slate-600 pl-4">
              Contrôle des attributs <code>Secure</code> (transmission HTTPS exclusive), <code>HttpOnly</code> (inaccessibilité depuis JavaScript) et <code>SameSite</code> (atténuation CSRF).
            </p>
          </div>

          <div className="border-b border-slate-100 pb-space-sm">
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              4. Détection du contenu mixte (Mixed Content)
            </h3>
            <p className="font-body-sm text-slate-600 pl-4">
              Recherche des inclusions non chiffrées (scripts, styles, images) chargées via le protocole http:// au sein d&apos;une page servie en https://.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              5. Actions de formulaires &amp; Empreinte technique
            </h3>
            <p className="font-body-sm text-slate-600 pl-4">
              Vérification des balises <code>&lt;form&gt;</code> pour s&apos;assurer qu&apos;aucune donnée n&apos;est soumise vers un endpoint non chiffré. Détection passive des signatures de serveurs et frameworks (présentée strictly à titre informatif).
            </p>
          </div>
        </div>
      </section>

      {/* What We Never Do */}
      <section className="bg-red-50/50 border border-red-200 rounded-xl p-space-lg sm:p-space-xl shadow-sm mb-space-2xl" id="passive-guarantee">
        <div className="flex items-center gap-2 text-red-700 font-semibold mb-space-xs font-headline-sm">
          <span className="material-symbols-outlined text-2xl text-red-600">block</span>
          Ce que Security Health ne fait JAMAIS
        </div>
        <p className="font-body-sm text-slate-700 mb-space-md leading-relaxed">
          Pour garantir une totale innocuité sur votre infrastructure de production, notre moteur s&apos;interdit formellement les opérations suivantes :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-label-code-sm">
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucune tentative d&apos;injection SQL ou XSS</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucune attaque par force brute</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucun scan de ports exhaustif</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucune soumission automatique de formulaires</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucune tentative d&apos;accès à des réseaux privés (anti-SSRF)</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 text-red-800">
            <span className="material-symbols-outlined text-sm text-red-600">close</span>
            <span>Aucune récupération de données privées</span>
          </div>
        </div>
      </section>

      {/* Deterministic Scoring System */}
      <section className="bg-white border border-slate-200 rounded-xl p-space-lg sm:p-space-xl shadow-sm mb-space-2xl">
        <h2 className="font-headline-md text-slate-900 font-semibold mb-space-md flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-2xl">calculate</span>
          Calcul déterministe du score de santé
        </h2>

        <p className="font-body-md text-slate-600 mb-space-md text-sm leading-relaxed">
          Le score global est compris entre <strong>0 et 100</strong>. Il est calculé de manière mathématique et déterministe selon les pénalités associées à chaque anomalie observée :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center mb-space-md">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col">
            <span className="font-metric-stat text-xl text-emerald-700 font-bold">90 – 100</span>
            <span className="font-headline-sm text-emerald-800 text-xs font-semibold mt-1">Excellent</span>
            <span className="text-[11px] text-emerald-700/80 mt-1">Grade A+ / A</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex flex-col">
            <span className="font-metric-stat text-xl text-blue-700 font-bold">75 – 89</span>
            <span className="font-headline-sm text-blue-800 text-xs font-semibold mt-1">Bon</span>
            <span className="text-[11px] text-blue-700/80 mt-1">Grade B+ / B</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col">
            <span className="font-metric-stat text-xl text-amber-700 font-bold">50 – 74</span>
            <span className="font-headline-sm text-amber-800 text-xs font-semibold mt-1">À améliorer</span>
            <span className="text-[11px] text-amber-700/80 mt-1">Grade C</span>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex flex-col">
            <span className="font-metric-stat text-xl text-red-600 font-bold">0 – 49</span>
            <span className="font-headline-sm text-red-700 text-xs font-semibold mt-1">Critique</span>
            <span className="text-[11px] text-red-600/80 mt-1">Grade F</span>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <div className="text-center py-space-lg flex flex-col items-center">
        <h3 className="font-headline-sm text-slate-900 font-semibold mb-2">
          Prêt à évaluer votre posture de sécurité ?
        </h3>
        <Link
          href="/"
          className="px-space-xl py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-headline-sm font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Retourner à l&apos;analyseur</span>
        </Link>
      </div>
    </div>
  );
}
