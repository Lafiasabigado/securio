"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const isNavActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/80 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Image
                src="/images/securio.png"
                alt="Securio Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg text-slate-900 tracking-tight font-bold leading-tight">
                Securio
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                {t.brandTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isNavActive("/") && pathname === "/"
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t.navTestSite}
            </Link>
            <Link
              href="/report"
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isNavActive("/report")
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t.navLastReport}
            </Link>
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isNavActive("/about")
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t.navGuide}
            </Link>
          </nav>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Language Switcher Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            id="lang-toggle-btn"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            title={language === "fr" ? "Switch to English" : "Passer en Français"}
            aria-label="Changer de langue / Change language"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="flex items-center text-[11px] font-bold tracking-wider">
              <span className={language === "fr" ? "text-blue-600 font-black" : "text-slate-400 font-medium"}>
                FR
              </span>
              <span className="text-slate-300 mx-0.5">/</span>
              <span className={language === "en" ? "text-blue-600 font-black" : "text-slate-400 font-medium"}>
                EN
              </span>
            </span>
          </button>

          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>{t.systemReady}</span>
          </div>

          {/* Nouveau scan button */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 text-center"
          >
            {t.newScan}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium mb-3">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Langue / Language:
            </span>
            <div className="inline-flex rounded-md shadow-xs p-0.5 bg-white border border-slate-200">
              <button
                type="button"
                onClick={() => toggleLanguage()}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  language === "fr" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage()}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  language === "en" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>{t.onlineReady}</span>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              isNavActive("/") && pathname === "/"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t.navTestSite}
          </Link>

          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              isNavActive("/report")
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t.navLastReport}
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              isNavActive("/about")
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t.navGuide}
          </Link>
        </div>
      )}
    </header>
  );
}
