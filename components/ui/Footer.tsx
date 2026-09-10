"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          <div className="sm:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <Image
                  src="/images/securio.png"
                  alt="Securio Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Securio
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              {t.footerDesc}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {t.footerNonDestructive}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {t.footerZeroIntrusion}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {t.footerStandardCompliant}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-xs">
              {t.footerNavTitle}
            </span>
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              {t.navTestSite}
            </Link>
            <Link href="/report" className="text-slate-600 hover:text-slate-900 transition-colors">
              {t.navLastReport}
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              {t.navGuide}
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-xs">
              {t.footerCommitmentTitle}
            </span>
            <Link href="/about#passive-guarantee" className="text-slate-600 hover:text-slate-900 transition-colors">
              {t.footerSafeGuarantee}
            </Link>
            <Link href="/about#methodologie" className="text-slate-600 hover:text-slate-900 transition-colors">
              {t.footerCheckpoints}
            </Link>
            <span className="text-slate-400 text-xs mt-2 leading-relaxed">
              {t.footerEducationalNotice}
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t.footerCopyright}</p>
          <div className="flex items-center gap-2">
            <span>{t.footerInstantDiag}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{t.footerEngineActive}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
