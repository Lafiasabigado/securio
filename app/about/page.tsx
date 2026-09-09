import Link from "next/link";

export const metadata = {
  title: "Méthodologie & Sécurité — Security Health",
  description:
    "Comprendre le fonctionnement de Security Health, les vérifications effectuées, le calcul du score et la garantie d'innocuité pour votre site.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Top Breadcrumb & Heading */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          Transparence &amp; Pédagogie
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-2xl mb-3">
          Comprendre votre diagnostic et notre méthode
        </h1>
        <p className="text-base text-slate-600 max-w-xl leading-relaxed">
          Découvrez simplement comment Security Health évalue votre site web, sans jargon obscur, et pourquoi notre outil est 100% sans danger.
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
            Garantie 100% sans intrusion
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Security Health visite votre site exactement comme le ferait un internaute normal avec son navigateur (Safari, Chrome ou Firefox). Aucune tentative de piratage, aucune faille n&apos;est exploitée et votre serveur ne subit aucun ralentissement.
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
            Aucune donnée sensible conservée
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Le diagnostic est calculé à la volée. Nous ne stockons aucun mot de passe ni identifiant. Les valeurs des cookies sont masquées et les résultats restent temporaires dans votre navigateur.
          </p>
        </div>
      </div>

      {/* What is Inspected */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10" id="methodologie">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>Ce que nous vérifions concrètement</span>
        </h2>

        <div className="space-y-6 text-sm text-slate-600">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              1. Le cadenas de sécurité HTTPS
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              Nous vérifions que votre site redirige bien automatiquement les visiteurs vers une adresse sécurisée (https://) et que votre certificat SSL est valide et récent. C&apos;est la base indispensable pour protéger les données échangées.
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              2. Les boucliers de protection du navigateur (En-têtes HTTP)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              Votre serveur peut donner des consignes strictes au navigateur de vos visiteurs pour empêcher les pirates d&apos;injecter du code malveillant (attaques XSS) ou de pièger votre site dans un faux cadre (clickjacking).
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              3. La protection des cookies et des sessions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              Les cookies permettent de reconnaître les utilisateurs connectés. Nous vérifions que les options de sécurité indispensables (Secure, HttpOnly, SameSite) sont bien activées pour que personne ne puisse voler une session utilisateur.
            </p>
          </div>

          <div className="border-b border-slate-100 pb-5">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              4. L&apos;absence de contenu non chiffré (Contenu mixte)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              Même si votre site affiche un cadenas HTTPS, charger une simple image ou un script via http:// en clair peut faire disparaître le cadenas de sécurité et alerter vos visiteurs.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              5. La protection des formulaires de saisie
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-4 leading-relaxed">
              Nous vérifions que les formulaires (contact, connexion, paiement) envoient bien leurs informations vers une destination chiffrée, pour que les données de vos clients ne voyagent jamais en clair sur internet.
            </p>
          </div>
        </div>
      </section>

      {/* What We Never Do */}
      <section className="bg-red-50/50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10" id="passive-guarantee">
        <h2 className="text-base sm:text-lg font-bold text-red-800 mb-2">
          Ce que Security Health ne fait JAMAIS
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 mb-5 leading-relaxed">
          Pour garantir la sécurité et la stabilité totale de votre site, notre outil s&apos;interdit formellement :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>Aucune tentative d&apos;intrusion ou de piratage</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>Aucune attaque par force brute (mots de passe)</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>Aucune soumission automatique de formulaires</span>
          </div>
          <div className="bg-white/80 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-900">
            <span className="text-red-600 font-bold">
              <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            <span>Aucune récupération de données privées</span>
          </div>
        </div>
      </section>

      {/* Score Explanation */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          Comment lire votre note de 0 à 100 ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          Chaque point de sécurité validé protège votre site. Si une faiblesse est détectée, des points sont déduits selon la gravité :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-emerald-700 font-extrabold">90 – 100</span>
            <span className="text-xs font-bold text-emerald-800 mt-1">Excellent (A)</span>
            <span className="text-[11px] text-emerald-700 mt-1">Bonnes pratiques actives</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-blue-700 font-extrabold">75 – 89</span>
            <span className="text-xs font-bold text-blue-800 mt-1">Bon niveau (B)</span>
            <span className="text-[11px] text-blue-700 mt-1">Quelques réglages utiles</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-amber-700 font-extrabold">50 – 74</span>
            <span className="text-xs font-bold text-amber-800 mt-1">À améliorer (C)</span>
            <span className="text-[11px] text-amber-700 mt-1">Des faiblesses visibles</span>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col">
            <span className="text-2xl text-red-600 font-extrabold">0 – 49</span>
            <span className="text-xs font-bold text-red-700 mt-1">Urgent (F)</span>
            <span className="text-[11px] text-red-600 mt-1">Protections de base absentes</span>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <div className="text-center py-6 flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
          Prêt à tester la sécurité de votre site ?
        </h3>
        <Link
          href="/"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-xs active:scale-95 text-center"
        >
          Retourner au formulaire de test
        </Link>
      </div>
    </div>
  );
}
