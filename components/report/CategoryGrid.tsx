"use client";

import type { AuditCategory, CategorySummary } from "@/lib/scanner/types";

interface CategoryGridProps {
  categories: Record<AuditCategory, CategorySummary>;
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const categoryMeta: Record<
    AuditCategory,
    { title: string; icon: string }
  > = {
    https: { title: "HTTPS", icon: "lock" },
    headers: { title: "En-têtes de sécurité", icon: "view_compact_alt" },
    cookies: { title: "Cookies", icon: "cookie" },
    technology: { title: "Technologies", icon: "tune" },
    mixed_content: { title: "Contenu mixte", icon: "layers" },
    forms: { title: "Formulaires", icon: "password" },
  };

  const keys: AuditCategory[] = [
    "https",
    "headers",
    "cookies",
    "technology",
    "mixed_content",
    "forms",
  ];

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-slate-900 font-semibold tracking-tight">
          Catégories principales d&apos;audit
        </h2>
        <span className="font-label-code-sm text-slate-500 font-medium">6 vecteurs examinés</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {keys.map((catKey) => {
          const item = categories[catKey] || {
            category: catKey,
            title: categoryMeta[catKey].title,
            score: 100,
            status: "pass",
            passedCount: 0,
            totalCount: 0,
          };
          const meta = categoryMeta[catKey];

          let scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
          let statusText = "Conforme";
          let statusColor = "text-emerald-700";
          let dotColor = "bg-emerald-600";
          let barColor = "bg-emerald-500";
          let iconColor = "text-emerald-600";

          if (item.status === "fail") {
            scoreColor = "text-red-700 bg-red-50 border-red-200";
            statusText = "Important";
            statusColor = "text-red-700";
            dotColor = "bg-red-600";
            barColor = "bg-red-500";
            iconColor = "text-red-600";
          } else if (item.status === "warning") {
            scoreColor = "text-amber-700 bg-amber-50 border-amber-200";
            statusText = "Attention";
            statusColor = "text-amber-700";
            dotColor = "bg-amber-600";
            barColor = "bg-amber-500";
            iconColor = "text-amber-600";
          }

          return (
            <div
              key={catKey}
              className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all p-4 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined ${iconColor} text-lg`}>
                  {meta.icon}
                </span>
                <span className={`font-label-code-sm px-1.5 py-0.5 rounded font-semibold border ${scoreColor}`}>
                  {item.score}%
                </span>
              </div>

              <div>
                <div className="font-headline-sm text-slate-900 font-semibold text-sm truncate">
                  {meta.title}
                </div>
                <div className={`font-label-code-sm ${statusColor} flex items-center gap-1.5 mt-1 font-medium`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                  <span>{statusText}</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
