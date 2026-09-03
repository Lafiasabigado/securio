import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 py-space-2xl mt-auto">
      <div className="w-full max-w-7xl mx-auto px-space-md sm:px-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl pb-space-xl border-b border-slate-200">
          <div className="md:col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-blue-600 text-base">verified_user</span>
              <span className="font-headline-sm text-slate-900 font-semibold">
                Architecture système de Security Health
              </span>
            </div>
            <p className="font-body-sm text-slate-600 max-w-md leading-relaxed">
              Moteur passif de diagnostic et d&apos;évaluation de posture de sécurité à impact nul. Conçu pour les exigences d&apos;intégrité élevées, l&apos;audit de périmètre et la prévention des dérives de configuration.
            </p>
            <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md font-label-code-sm text-slate-700 shadow-2xs">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                SOC 2 Type II
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md font-label-code-sm text-slate-700 shadow-2xs">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                ISO/IEC 27001
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md font-label-code-sm text-slate-700 shadow-2xs">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                Conforme RFC 7230
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs text-sm">
            <span className="font-label-code-sm uppercase tracking-wider text-slate-900 font-semibold mb-1">
              Plateforme
            </span>
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              Analyseur de sécurité
            </Link>
            <Link href="/report" className="text-slate-600 hover:text-slate-900 transition-colors">
              Rapports d&apos;évaluation
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              Méthodologie &amp; Limites
            </Link>
            <Link href="/about#faq" className="text-slate-600 hover:text-slate-900 transition-colors">
              Foire Aux Questions
            </Link>
          </div>

          <div className="flex flex-col gap-space-xs text-sm">
            <span className="font-label-code-sm uppercase tracking-wider text-slate-900 font-semibold mb-1">
              Sécurité &amp; Éthique
            </span>
            <Link href="/about#passive-guarantee" className="text-slate-600 hover:text-slate-900 transition-colors">
              Garantie d&apos;analyse passive
            </Link>
            <Link href="/about#ssrf-protection" className="text-slate-600 hover:text-slate-900 transition-colors">
              Protection anti-SSRF
            </Link>
            <Link href="/about#responsible-disclosure" className="text-slate-600 hover:text-slate-900 transition-colors">
              Divulgation responsable
            </Link>
            <span className="text-slate-400 text-xs mt-2">
              Aucune intrusion • Pas de payloads • Non destructif
            </span>
          </div>
        </div>

        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-xs text-slate-500">
          <p>© 2025 Security Health. Tous droits réservés. Diagnostic passif conforme aux normes RFC 7230 et OWASP.</p>
          <div className="flex items-center gap-space-md font-label-code-sm">
            <span>Audit passif certifié</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Version v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
