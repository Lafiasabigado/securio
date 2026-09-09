import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          <div className="sm:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="text-base font-bold text-slate-900">
                Security Health
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              Diagnostic passif et bienveillant de la sécurité des sites internet. Nous aidons les créateurs, e-commerçants et développeurs à identifier leurs failles et à protéger leurs visiteurs sans risque.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Non destructif
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Zéro intrusion
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Conforme aux standards
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-xs">
              Navigation
            </span>
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              Tester un site
            </Link>
            <Link href="/report" className="text-slate-600 hover:text-slate-900 transition-colors">
              Consulter le dernier rapport
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              Guide &amp; Méthodologie
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-xs">
              Engagements
            </span>
            <Link href="/about#passive-guarantee" className="text-slate-600 hover:text-slate-900 transition-colors">
              Garantie d&apos;analyse sans risque
            </Link>
            <Link href="/about#methodologie" className="text-slate-600 hover:text-slate-900 transition-colors">
              Points de contrôle
            </Link>
            <span className="text-slate-400 text-xs mt-2 leading-relaxed">
              Outil d&apos;aide à la décision défensif et éducatif.
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Security Health. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <span>Diagnostic web instantané</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Moteur actif</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
