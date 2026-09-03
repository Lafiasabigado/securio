"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="h-16 w-full px-space-md sm:px-space-xl flex items-center justify-between gap-space-md">
        {/* Logo & Brand */}
        <div className="flex items-center gap-space-lg">
          <Link href="/" className="flex items-center gap-space-xs group">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-xl">security</span>
            </div>
            <span className="font-headline-sm text-slate-900 tracking-tight font-semibold">
              Security Health
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-space-xs sm:gap-space-sm text-sm">
            <Link
              href="/"
              className={`transition-colors px-space-sm py-1.5 rounded-lg font-medium ${
                isNavActive("/") && pathname === "/"
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Analyseur
            </Link>
            <Link
              href="/report"
              className={`transition-colors px-space-sm py-1.5 rounded-lg font-medium ${
                isNavActive("/report")
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Dernier rapport
            </Link>
            <Link
              href="/about"
              className={`transition-colors px-space-sm py-1.5 rounded-lg font-medium ${
                isNavActive("/about")
                  ? "text-blue-700 font-semibold bg-blue-50 border border-blue-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Méthodologie &amp; Limites
            </Link>
          </nav>
        </div>

        {/* Engine Status & Badge */}
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-label-code-sm text-emerald-800 font-semibold tracking-tight">
              Moteur v2.4.0 Actif
            </span>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-label-code-sm font-semibold transition-all shadow-sm active:scale-95 text-xs"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>Nouveau scan</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
