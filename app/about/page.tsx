"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Top Breadcrumb & Heading */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          {isEn ? "Transparency & Education" : "Transparence & Pédagogie"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-2xl mb-3">
          {isEn ? "Understanding your diagnostics & methodology" : "Comprendre votre diagnostic et notre méthode"}
        </h1>
        <p className="text-base text-slate-600 max-w-xl leading-relaxed">
          {isEn
            ? "Discover how Securio scans and evaluates your website safely, with zero jargon and zero risk."
            : "Découvrez simplement comment Securio évalue votre site web, sans jargon obscur, et pourquoi notre outil est 100% sans danger."}
        </p>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {isEn ? "100% Non-Intrusive Guarantee" : "Garantie 100% sans intrusion"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isEn
              ? "Securio visits your website exactly like an everyday visitor with a browser (Safari, Chrome or Firefox). No exploit attempts, no attacks, and zero server slowdown."
              : "Securio visite votre site exactement comme le ferait un internaute normal avec son navigateur (Safari, Chrome ou Firefox). Aucune tentative de piratage, aucune faille n'est exploitée et votre serveur ne subit aucun ralentissement."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {isEn ? "Zero Sensitive Data Stored" : "Aucune donnée sensible conservée"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isEn
              ? "The audit is computed on the fly. We do not store passwords or user credentials. Cookie values are sanitized and results remain transient in your browser session."
              : "Le diagnostic est calculé à la volée. Nous ne stockons aucun mot de passe ni identifiant. Les valeurs des cookies sont masquées et les résultats restent temporaires dans votre navigateur."}
          </p>
        </div>
      </div>

      {/* What is Inspected */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10" id="methodologie">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>{isEn ? "What Securio verifies on your site" : "Ce que Securio vérifie concrètement"}</span>
        </h2>

        <div className="space-y-6 text-sm text-slate-600">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {isEn ? "1. HTTPS Certificate & Encryption" : "1. Le cadenas de sécurité HTTPS"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              {isEn
                ? "We check that your website automatically redirects visitors to secure https:// and that your SSL certificate is valid and unexpired."
                : "Nous vérifions que votre site redirige bien automatiquement les visiteurs vers une adresse sécurisée (https://) et que votre certificat SSL est valide et récent."}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {isEn ? "2. Browser Defense Shields (HTTP Headers)" : "2. Les boucliers de protection du navigateur (En-têtes HTTP)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              {isEn
                ? "Your server can send directives to prevent cross-site scripting (XSS), clickjacking frames, and MIME sniffing attacks."
                : "Votre serveur peut donner des consignes strictes au navigateur de vos visiteurs pour empêcher les pirates d'injecter du code malveillant (attaques XSS) ou de piéger votre site dans un faux cadre (clickjacking)."}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {isEn ? "3. Cookie & Session Security Flags" : "3. La protection des cookies et des sessions"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              {isEn
                ? "Cookies manage user authentication. We inspect that crucial security attributes (Secure, HttpOnly, SameSite) are enabled to prevent session hijacking."
                : "Les cookies permettent de reconnaître les utilisateurs connectés. Nous vérifions que les options de sécurité indispensables (Secure, HttpOnly, SameSite) sont bien activées pour que personne ne puisse voler une session utilisateur."}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {isEn ? "4. Mixed Content Elimination" : "4. L'absence de contenu non chiffré (Contenu mixte)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              {isEn
                ? "Loading scripts, stylesheets, or images over unencrypted HTTP breaks your HTTPS padlock and triggers browser warnings."
                : "Même si votre site affiche un cadenas HTTPS, charger une simple image ou un script via http:// en clair peut faire disparaître le cadenas de sécurité et alerter vos visiteurs."}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {isEn ? "5. Web Form Transmission Security" : "5. La protection des formulaires de saisie"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              {isEn
                ? "We inspect that contact, login, and payment forms transmit sensitive input exclusively over encrypted endpoints."
                : "Nous vérifions que les formulaires (contact, connexion, paiement) envoient bien leurs informations vers une destination chiffrée, pour que les données de vos clients ne voyagent jamais en clair sur internet."}
            </p>
          </div>
        </div>
      </section>

      {/* What We Never Do */}
      <section className="bg-red-50/50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10" id="passive-guarantee">
        <h2 className="text-base sm:text-lg font-bold text-red-800 mb-2">
          {isEn ? "What Securio NEVER does" : "Ce que Securio ne fait JAMAIS"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 mb-5 leading-relaxed">
          {isEn
            ? "To guarantee total safety and peace of mind, our tool strictly prohibits:"
            : "Pour garantir la sécurité et la stabilité totale de votre site, notre outil s'interdit formellement :"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>{isEn ? "Zero intrusion or exploit attempts" : "Aucune tentative d'intrusion ou de piratage"}</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>{isEn ? "Zero brute force or password attacks" : "Aucune attaque par force brute (mots de passe)"}</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>{isEn ? "Zero automated form submissions" : "Aucune soumission automatique de formulaires"}</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>{isEn ? "Zero private data scraping" : "Aucune récupération de données privées"}</span>
          </div>
        </div>
      </section>

      {/* Score Explanation */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {isEn ? "How to interpret your score (0 - 100)" : "Comment lire votre note de 0 à 100 ?"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          {isEn
            ? "Each passed checkpoint protects your site. Points are deducted based on severity when issues are detected:"
            : "Chaque point de sécurité validé protège votre site. Si une faiblesse est détectée, des points sont déduits selon la gravité :"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-emerald-700 font-extrabold">90 – 100</span>
            <span className="text-xs font-bold text-emerald-800 mt-1">{isEn ? "Excellent (A)" : "Excellent (A)"}</span>
            <span className="text-[11px] text-emerald-700 mt-1">{isEn ? "Best practices active" : "Bonnes pratiques actives"}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-blue-700 font-extrabold">75 – 89</span>
            <span className="text-xs font-bold text-blue-800 mt-1">{isEn ? "Good health (B)" : "Bon niveau (B)"}</span>
            <span className="text-[11px] text-blue-700 mt-1">{isEn ? "Minor tuning needed" : "Quelques réglages utiles"}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-amber-700 font-extrabold">50 – 74</span>
            <span className="text-xs font-bold text-amber-800 mt-1">{isEn ? "Needs work (C)" : "À améliorer (C)"}</span>
            <span className="text-[11px] text-amber-700 mt-1">{isEn ? "Vulnerabilities present" : "Des faiblesses visibles"}</span>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-red-600 font-extrabold">0 – 49</span>
            <span className="text-xs font-bold text-red-700 mt-1">{isEn ? "Urgent (F)" : "Urgent (F)"}</span>
            <span className="text-[11px] text-red-600 mt-1">{isEn ? "Critical flaws detected" : "Protections de base absentes"}</span>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <div className="text-center py-6 flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
          {isEn ? "Ready to test your website security?" : "Prêt à tester la sécurité de votre site ?"}
        </h3>
        <Link
          href="/"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs active:scale-95 text-center"
        >
          {isEn ? "Return to scanner form" : "Retourner au formulaire de test"}
        </Link>
      </div>
    </div>
  );
}
