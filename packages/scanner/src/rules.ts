import type { AuditCategory, CategorySummary, Finding, ScanResult, ScanStatus, Severity } from "./types.js";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
  info: 5,
};

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    // 1. First by status: fail, warning, pass
    const statusScore = (s: string) => (s === "fail" ? 1 : s === "warning" ? 2 : 3);
    const diffStatus = statusScore(a.status) - statusScore(b.status);
    if (diffStatus !== 0) return diffStatus;

    // 2. Then by severity
    const diffSev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (diffSev !== 0) return diffSev;

    return a.title.localeCompare(b.title);
  });
}

export function computeScanScore(findings: Finding[]): {
  score: number;
  status: ScanStatus;
  grade: "A+" | "A" | "B+" | "B" | "C" | "F";
  summary: string;
} {
  let penalty = 0;

  for (const finding of findings) {
    if (finding.status === "fail") {
      penalty += SEVERITY_WEIGHTS[finding.severity];
    } else if (finding.status === "warning") {
      penalty += Math.round(SEVERITY_WEIGHTS[finding.severity] * 0.4);
    }
  }

  // Calculate score bounded between 0 and 100
  const score = Math.max(0, Math.min(100, 100 - penalty));

  let status: ScanStatus;
  let grade: "A+" | "A" | "B+" | "B" | "C" | "F";
  let summary: string;

  if (score >= 90) {
    status = "excellent";
    grade = score >= 95 ? "A+" : "A";
    summary = "Excellente posture de sécurité périmétrique. Vos en-têtes et protocoles respectent rigoureusement les recommandations de l'OWASP.";
  } else if (score >= 75) {
    status = "good";
    grade = score >= 82 ? "B+" : "B";
    summary = "Bonne posture de sécurité globale avec quelques écarts de configuration ou en-têtes défensifs recommandés à consolider.";
  } else if (score >= 50) {
    status = "warning";
    grade = "C";
    summary = "Posture de sécurité intermédiaire avec des vulnérabilités de configuration exposées (CSP ou protections cross-origin absentes).";
  } else {
    status = "critical";
    grade = "F";
    summary = "Risque critique identifié : absence de HTTPS valide ou manque flagrant des principaux mécanismes défensifs contre les injections.";
  }

  return { score, status, grade, summary };
}

export function buildCategorySummaries(
  findings: Finding[]
): Record<AuditCategory, CategorySummary> {
  const categoriesConfig: Record<AuditCategory, { title: string }> = {
    https: { title: "HTTPS & Transport" },
    headers: { title: "En-têtes de sécurité" },
    cookies: { title: "Cookies" },
    mixed_content: { title: "Contenu mixte" },
    forms: { title: "Formulaires" },
    technology: { title: "Technologies exposées" },
  };

  const summaries: Record<string, CategorySummary> = {};

  for (const [catKey, meta] of Object.entries(categoriesConfig)) {
    const cat = catKey as AuditCategory;
    const catFindings = findings.filter((f) => f.category === cat);
    const total = catFindings.length;
    const passed = catFindings.filter((f) => f.status === "pass").length;

    let catScore = 100;
    if (total > 0) {
      let penalty = 0;
      for (const f of catFindings) {
        if (f.status === "fail") {
          penalty += f.severity === "critical" ? 40 : f.severity === "high" ? 25 : 15;
        } else if (f.status === "warning") {
          penalty += 10;
        }
      }
      catScore = Math.max(0, 100 - penalty);
    }

    const worstStatus = catFindings.some((f) => f.status === "fail")
      ? "fail"
      : catFindings.some((f) => f.status === "warning")
      ? "warning"
      : "pass";

    summaries[cat] = {
      category: cat,
      title: meta.title,
      score: catScore,
      status: worstStatus,
      passedCount: passed,
      totalCount: total,
    };
  }

  return summaries as Record<AuditCategory, CategorySummary>;
}
