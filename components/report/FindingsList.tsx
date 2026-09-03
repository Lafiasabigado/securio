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
    <div className="flex flex-col gap-space-md">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-label-code-sm text-xs transition-colors ${
              activeTab === "all"
                ? "bg-slate-100 text-slate-900 font-semibold border border-slate-300/80 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Tous les constats ({findings.length})
          </button>

          <button
            onClick={() => setActiveTab("fail")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-label-code-sm text-xs transition-colors ${
              activeTab === "fail"
                ? "bg-red-50 text-red-700 font-semibold border border-red-200 shadow-2xs"
                : "text-slate-600 hover:text-red-700 hover:bg-slate-50"
            }`}
          >
            Critiques ({failCount})
          </button>

          <button
            onClick={() => setActiveTab("warning")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-label-code-sm text-xs transition-colors ${
              activeTab === "warning"
                ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200 shadow-2xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-slate-50"
            }`}
          >
            À surveiller ({warnCount})
          </button>

          <button
            onClick={() => setActiveTab("pass")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-label-code-sm text-xs transition-colors ${
              activeTab === "pass"
                ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-2xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50"
            }`}
          >
            Conformes ({passCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les résultats..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-body-sm pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors placeholder:text-slate-400 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Findings Articles */}
      {filteredFindings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-space-2xl text-center flex flex-col items-center justify-center gap-space-sm">
          <span className="material-symbols-outlined text-4xl text-slate-400">filter_list_off</span>
          <div className="font-headline-sm text-slate-900 font-semibold">Aucun constat ne correspond à vos filtres</div>
          <p className="font-body-sm text-slate-500 max-w-sm">
            Essayez de modifier votre recherche ou sélectionnez un autre onglet pour afficher les autres points d&apos;audit.
          </p>
          <button
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium font-label-code-sm transition-colors mt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {filteredFindings.map((finding) => (
            <FindingItem key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}
