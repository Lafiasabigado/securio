"use client";

import { useMemo, useState } from "react";
import type { Finding } from "@/lib/scanner/types";
import { FindingItem } from "./FindingItem";

interface FindingsListProps {
  findings: Finding[];
}

type FilterTab = "all" | "fail" | "warning" | "pass";

export function FindingsList({ findings }: FindingsListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const failCount = useMemo(() => findings.filter((f) => f.status === "fail").length, [findings]);
  const warnCount = useMemo(() => findings.filter((f) => f.status === "warning").length, [findings]);
  const passCount = useMemo(() => findings.filter((f) => f.status === "pass").length, [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // 1. Tab filter
      if (activeTab === "fail" && f.status !== "fail") return false;
      if (activeTab === "warning" && f.status !== "warning") return false;
      if (activeTab === "pass" && f.status !== "pass") return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = f.title.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        const matchesCat = f.categoryTitle.toLowerCase().includes(q);
        const matchesCwe = f.cwe?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCat || matchesCwe;
      }

      return true;
    });
  }, [findings, activeTab, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter & Search Bar - Fully responsive */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
        {/* Scrollable Filter Chips on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Tous ({findings.length})
          </button>

          <button
            onClick={() => setActiveTab("fail")}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "fail"
                ? "bg-red-600 text-white shadow-xs"
                : "text-red-700 bg-red-50/70 hover:bg-red-100"
            }`}
          >
            À corriger ({failCount})
          </button>

          <button
            onClick={() => setActiveTab("warning")}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "warning"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-700 bg-amber-50/70 hover:bg-amber-100"
            }`}
          >
            À améliorer ({warnCount})
          </button>

          <button
            onClick={() => setActiveTab("pass")}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "pass"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100"
            }`}
          >
            Conformes ({passCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[220px]">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un point d'audit..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-9 pr-8 py-1.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-colors placeholder:text-slate-400"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Findings Articles */}
      {filteredFindings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-base font-bold text-slate-900">Aucun résultat trouvé</div>
          <p className="text-xs text-slate-500 max-w-sm">
            Modifiez votre recherche ou sélectionnez un autre onglet pour afficher les autres points de diagnostic.
          </p>
          <button
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors mt-2 cursor-pointer"
          >
            Afficher tous les constats
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredFindings.map((finding) => (
            <FindingItem key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}
