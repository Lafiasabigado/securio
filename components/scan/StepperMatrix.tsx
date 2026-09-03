"use client";

export interface ScanStage {
  step: number;
  title: string;
  description: string;
  status: "done" | "active" | "queued";
  timeLabel?: string;
  tags?: string[];
  subGrid?: Array<{ label: string; value: string; status: "pass" | "warn" | "fail" | "eval" }>;
}

interface StepperMatrixProps {
  currentStage: number; // 1 to 6
  progress: number;
}

export function StepperMatrix({ currentStage }: StepperMatrixProps) {
  const stages: ScanStage[] = [
    {
      step: 1,
      title: "1. Résolution DNS & Réseau",
      description: "Vérification des enregistrements A/AAAA/CAA, routage BGP et détection des proxy Anycast.",
      status: currentStage > 1 ? "done" : currentStage === 1 ? "active" : "queued",
      timeLabel: currentStage > 1 ? "Terminé • 12ms" : currentStage === 1 ? "En cours • Résolution" : "En attente",
      tags: ["A / AAAA", "CAA cert", "Anycast Edge"],
    },
    {
      step: 2,
      title: "2. Handshake du certificat TLS / SSL",
      description: "Négociation TLS 1.3, validation de la chaîne de certification, algorithmes de signature et chiffrement.",
      status: currentStage > 2 ? "done" : currentStage === 2 ? "active" : "queued",
      timeLabel: currentStage > 2 ? "Terminé • 44ms" : currentStage === 2 ? "En cours • Négociation" : "En attente",
      tags: ["TLS 1.3 / 1.2", "ECDSA / RSA", "ALPN h2"],
    },
    {
      step: 3,
      title: "3. En-têtes de réponse de sécurité",
      description: "Évaluation approfondie de Content-Security-Policy, HSTS, X-Frame-Options, Referrer-Policy et Permissions-Policy.",
      status: currentStage > 3 ? "done" : currentStage === 3 ? "active" : "queued",
      timeLabel: currentStage > 3 ? "Terminé • 110ms" : currentStage === 3 ? "En cours • Analyse CSP" : "En attente",
      subGrid: [
        { label: "HSTS", value: currentStage > 3 ? "Conforme" : "Audit...", status: currentStage > 3 ? "pass" : "eval" },
        { label: "CSP", value: currentStage > 3 ? "Évalué" : "Vérification...", status: currentStage > 3 ? "warn" : "eval" },
        { label: "X-Frame", value: currentStage > 3 ? "Conforme" : "Analyse...", status: currentStage > 3 ? "pass" : "eval" },
        { label: "Referrer", value: currentStage > 3 ? "Configuré" : "Vérification...", status: currentStage > 3 ? "pass" : "eval" },
      ],
    },
    {
      step: 4,
      title: "4. Attributs de cookies & Drapeaux de session",
      description: "Contrôle des attributs Secure, HttpOnly, SameSite et Partitioned selon les spécifications RFC 6265bis.",
      status: currentStage > 4 ? "done" : currentStage === 4 ? "active" : "queued",
      timeLabel: currentStage > 4 ? "Terminé • 18ms" : currentStage === 4 ? "En cours • Décodage" : "En attente",
    },
    {
      step: 5,
      title: "5. Audit du contenu mixte & des ressources",
      description: "Vérification passive de l'intégrité des scripts, iframes, feuilles de style et images contre les fuites HTTP.",
      status: currentStage > 5 ? "done" : currentStage === 5 ? "active" : "queued",
      timeLabel: currentStage > 5 ? "Terminé • 65ms" : currentStage === 5 ? "En cours • Parsing HTML" : "En attente",
    },
    {
      step: 6,
      title: "6. Actions de formulaires & Points de terminaison cross-origin",
      description: "Analyse des balises <form>, cibles HTTP non sécurisées et protection contre les transmissions en clair.",
      status: currentStage > 6 ? "done" : currentStage === 6 ? "active" : "queued",
      timeLabel: currentStage > 6 ? "Terminé • 22ms" : currentStage === 6 ? "En cours • Analyse" : "En attente",
    },
  ];

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between px-space-2xs">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-blue-600 text-lg">schema</span>
          <span className="font-label-code-sm uppercase tracking-wider text-slate-900 font-semibold">
            Matrice du protocole d&apos;inspection
          </span>
        </div>
        <span className="font-label-code-sm text-slate-500 font-medium">
          Étape {Math.min(6, currentStage)} sur 6 active
        </span>
      </div>

      {stages.map((stage) => {
        if (stage.status === "done") {
          return (
            <div
              key={stage.step}
              className="rounded-xl bg-white border border-slate-200 p-space-md shadow-2xs flex items-start gap-space-md transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs mt-0.5">
                <span className="material-symbols-outlined text-base font-semibold">check</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-xs">
                  <span className="font-headline-sm text-slate-900 font-medium">{stage.title}</span>
                  <span className="px-space-xs py-space-3xs rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-label-code-sm font-semibold whitespace-nowrap">
                    {stage.timeLabel}
                  </span>
                </div>
                <p className="font-body-sm text-slate-600 mt-space-3xs">{stage.description}</p>
                {stage.tags && (
                  <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
                    {stage.tags.map((t) => (
                      <span
                        key={t}
                        className="font-label-code-sm px-space-xs py-space-3xs rounded bg-slate-100 border border-slate-200 text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (stage.status === "active") {
          return (
            <div
              key={stage.step}
              className="rounded-xl bg-white border-2 border-blue-500/80 p-space-md shadow-md relative overflow-hidden flex items-start gap-space-md ring-4 ring-blue-50"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 animate-pulse"></div>
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs mt-0.5 relative">
                <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-headline-sm text-slate-900 font-semibold flex items-center gap-1.5">
                    {stage.title}
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  </span>
                  <span className="px-space-xs py-space-3xs rounded bg-blue-100 text-blue-700 border border-blue-200 font-label-code-sm font-semibold self-start sm:self-auto">
                    {stage.timeLabel}
                  </span>
                </div>
                <p className="font-body-sm text-slate-600 mt-space-3xs">{stage.description}</p>
                {stage.subGrid && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs mt-space-sm pt-space-xs">
                    {stage.subGrid.map((item) => (
                      <div key={item.label} className="p-space-2xs rounded bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
                        <span className="font-label-code-sm text-slate-500">{item.label}</span>
                        <span className="font-label-code-sm text-blue-600 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs animate-spin">sync</span> {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Queued
        return (
          <div
            key={stage.step}
            className="rounded-xl bg-slate-50/70 border border-slate-200/80 p-space-md opacity-75 flex items-start gap-space-md transition-opacity hover:opacity-100"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200/80 border border-slate-300 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 font-label-code-sm font-semibold">
              {stage.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-headline-sm text-slate-700 font-medium">{stage.title}</span>
                <span className="px-space-xs py-space-3xs rounded bg-slate-200/60 text-slate-600 border border-slate-200 font-label-code-sm">
                  En attente
                </span>
              </div>
              <p className="font-body-sm text-slate-500 mt-space-3xs">{stage.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
