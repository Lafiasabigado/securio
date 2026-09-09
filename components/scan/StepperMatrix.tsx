"use client";

export interface ScanStage {
  step: number;
  title: string;
  description: string;
  status: "done" | "active" | "queued";
  timeLabel?: string;
}

interface StepperMatrixProps {
  currentStage: number; // 1 to 6
  progress: number;
}

export function StepperMatrix({ currentStage }: StepperMatrixProps) {
  const stages: ScanStage[] = [
    {
      step: 1,
      title: "1. Accès au site & Résolution",
      description: "Vérification que votre domaine répond normalement et que la connexion est sécurisée.",
      status: currentStage > 1 ? "done" : currentStage === 1 ? "active" : "queued",
      timeLabel: currentStage > 1 ? "Validé" : currentStage === 1 ? "En cours..." : "En attente",
    },
    {
      step: 2,
      title: "2. Cadenas de sécurité HTTPS",
      description: "Validation du certificat SSL, de sa date d'expiration et du chiffrement des données.",
      status: currentStage > 2 ? "done" : currentStage === 2 ? "active" : "queued",
      timeLabel: currentStage > 2 ? "Validé" : currentStage === 2 ? "En cours..." : "En attente",
    },
    {
      step: 3,
      title: "3. Boucliers de protection web",
      description: "Examen des protections actives pour empêcher l'injection de scripts malveillants.",
      status: currentStage > 3 ? "done" : currentStage === 3 ? "active" : "queued",
      timeLabel: currentStage > 3 ? "Validé" : currentStage === 3 ? "En cours..." : "En attente",
    },
    {
      step: 4,
      title: "4. Confidentialité des cookies",
      description: "Vérification que les identifiants et sessions ne peuvent pas être dérobés.",
      status: currentStage > 4 ? "done" : currentStage === 4 ? "active" : "queued",
      timeLabel: currentStage > 4 ? "Validé" : currentStage === 4 ? "En cours..." : "En attente",
    },
    {
      step: 5,
      title: "5. Détection de contenu non chiffré",
      description: "Contrôle qu'aucune image, police ou script n'est chargé de manière non sécurisée.",
      status: currentStage > 5 ? "done" : currentStage === 5 ? "active" : "queued",
      timeLabel: currentStage > 5 ? "Validé" : currentStage === 5 ? "En cours..." : "En attente",
    },
    {
      step: 6,
      title: "6. Sécurité des formulaires",
      description: "Vérification que les champs de saisie transmettent les données de façon protégée.",
      status: currentStage > 6 ? "done" : currentStage === 6 ? "active" : "queued",
      timeLabel: currentStage > 6 ? "Validé" : currentStage === 6 ? "En cours..." : "En attente",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
          Étapes de vérification
        </span>
        <span className="text-xs text-blue-600 font-semibold">
          Étape {Math.min(6, currentStage)} sur 6
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          if (stage.status === "done") {
            return (
              <div
                key={stage.step}
                className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex items-start gap-3.5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">{stage.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
                      {stage.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
                </div>
              </div>
            );
          }

          if (stage.status === "active") {
            return (
              <div
                key={stage.step}
                className="rounded-2xl bg-white border-2 border-blue-500 p-4 sm:p-5 shadow-sm relative overflow-hidden flex items-start gap-3.5 ring-4 ring-blue-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {stage.title}
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold self-start sm:self-auto">
                      {stage.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
                </div>
              </div>
            );
          }

          // Queued
          return (
            <div
              key={stage.step}
              className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4 sm:p-5 opacity-75 flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                {stage.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">{stage.title}</span>
                  <span className="text-[11px] text-slate-400 font-medium">En attente</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
