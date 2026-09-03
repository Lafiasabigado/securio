import type { FindingStatus, Severity } from "@/lib/scanner/types";

interface StatusBadgeProps {
  status: FindingStatus;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const isSm = size === "sm";

  if (status === "pass") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-label-code-sm font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
          isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        <span>{label || "Conforme"}</span>
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-label-code-sm font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
          isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>{label || "Attention requise"}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-label-code-sm font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 ${
        isSm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
      <span>{label || "Anomalie importante"}</span>
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  switch (severity) {
    case "critical":
      return (
        <span className="font-label-code-sm text-red-700 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
          Critique
        </span>
      );
    case "high":
      return (
        <span className="font-label-code-sm text-red-700 font-semibold bg-red-50/80 border border-red-200 px-2 py-0.5 rounded text-xs">
          Élevé
        </span>
      );
    case "medium":
      return (
        <span className="font-label-code-sm text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs">
          Modéré
        </span>
      );
    case "low":
      return (
        <span className="font-label-code-sm text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
          Faible
        </span>
      );
    case "info":
    default:
      return (
        <span className="font-label-code-sm text-slate-700 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
          Info
        </span>
      );
  }
}
