"use client";

import type { AuditCategory, CategorySummary } from "@/lib/scanner/types";

interface CategoryGridProps {
  categories: Record<AuditCategory, CategorySummary>;
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const categoryMeta: Record<
    AuditCategory,
    { title: string; subtitle: string }
  > = {
    https: {
      title: "Cadenas HTTPS",
      subtitle: "Chiffrement et certificat SSL",
    },
    headers: {
      title: "Défenses navigateur",
      subtitle: "Protection contre les attaques XSS",
    },
    cookies: {
      title: "Cookies & Sessions",
      subtitle: "Confidentialité des données privées",
    },
    technology: {
      title: "Données du serveur",
      subtitle: "Informations visibles publiquement",
    },
    mixed_content: {
      title: "Contenu mixte",
      subtitle: "Détection des ressources non sécurisées",
    },
    forms: {
      title: "Formulaires web",
      subtitle: "Protection des saisies utilisateurs",
    },
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-base sm:text-lg text-slate-900 font-bold tracking-tight">
            Résultats par catégorie de protection
          </h2>
          <p className="text-xs text-slate-500">
            6 points clés vérifiés automatiquement sur votre site
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
          6 catégories examinées
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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

          let scoreBadge = "text-emerald-700 bg-emerald-50 border-emerald-200";
          let statusLabel = "Bien protégé";
          let statusTextClass = "text-emerald-700";
          let dotColor = "bg-emerald-600";
          let barColor = "bg-emerald-500";

          if (item.status === "fail") {
            scoreBadge = "text-red-700 bg-red-50 border-red-200";
            statusLabel = "À corriger";
            statusTextClass = "text-red-700";
            dotColor = "bg-red-600";
            barColor = "bg-red-500";
          } else if (item.status === "warning") {
            scoreBadge = "text-amber-700 bg-amber-50 border-amber-200";
            statusLabel = "À surveiller";
            statusTextClass = "text-amber-700";
            dotColor = "bg-amber-600";
            barColor = "bg-amber-500";
          }

          return (
            <div
              key={catKey}
              className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${scoreBadge}`}>
                  {item.score}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {meta.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {meta.subtitle}
                </p>
                <div className={`text-xs ${statusTextClass} font-semibold flex items-center gap-1.5 mt-2`}>
                  <span>{statusLabel}</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`${barColor} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
