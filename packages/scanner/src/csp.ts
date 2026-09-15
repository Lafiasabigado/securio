export type CspIssueLevel = "fail" | "warning";

export interface CspScriptIssue {
  kind:
    | "unconstrained"
    | "unsafe-eval"
    | "unsafe-inline"
    | "data"
    | "blob"
    | "http"
    | "https-scheme"
    | "wildcard";
  label: string;
  level: CspIssueLevel;
}

export const CSP_REMEDIATION_SNIPPET =
  "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";

function tokenizeDirective(directive: string): string[] {
  return directive
    .trim()
    .split(/\s+/)
    .map((token) => token.toLowerCase())
    .filter(Boolean);
}

/**
 * Inspects script execution policy (script-src, else default-src).
 * 'unsafe-inline' is ignored when 'strict-dynamic' is present (CSP3).
 */
export function inspectCspScriptSrc(csp: string): CspScriptIssue[] {
  const issues: CspScriptIssue[] = [];
  const scriptMatch = csp.match(/script-src([^;]*)/i);
  const defaultMatch = csp.match(/default-src([^;]*)/i);

  let tokens: string[];
  if (scriptMatch) {
    tokens = tokenizeDirective(scriptMatch[1] ?? "");
  } else if (defaultMatch) {
    tokens = tokenizeDirective(defaultMatch[1] ?? "");
  } else {
    return [
      {
        kind: "unconstrained",
        label: "aucune directive script-src ni default-src",
        level: "fail",
      },
    ];
  }

  const hasStrictDynamic = tokens.includes("'strict-dynamic'");

  if (tokens.includes("'unsafe-eval'")) {
    issues.push({ kind: "unsafe-eval", label: "'unsafe-eval'", level: "fail" });
  }

  if (tokens.includes("'unsafe-inline'") && !hasStrictDynamic) {
    issues.push({ kind: "unsafe-inline", label: "'unsafe-inline'", level: "warning" });
  }

  if (tokens.some((token) => token === "data:" || token.startsWith("data:"))) {
    issues.push({ kind: "data", label: "source data:", level: "fail" });
  }

  if (tokens.some((token) => token === "blob:" || token.startsWith("blob:"))) {
    issues.push({ kind: "blob", label: "source blob:", level: "fail" });
  }

  if (tokens.some((token) => token === "http:" || token.startsWith("http://"))) {
    issues.push({ kind: "http", label: "source HTTP non chiffré", level: "fail" });
  }

  if (tokens.includes("https:")) {
    issues.push({
      kind: "https-scheme",
      label: "schéma https: (tous les hôtes HTTPS)",
      level: "warning",
    });
  }

  if (tokens.some((token) => token === "*" || token.startsWith("*."))) {
    issues.push({ kind: "wildcard", label: "wildcard *", level: "warning" });
  }

  return issues;
}

export function summarizeCspIssues(issues: CspScriptIssue[]): {
  status: "pass" | "warning" | "fail";
  severity: "high" | "medium" | "low";
  labels: string[];
} {
  if (issues.length === 0) {
    return { status: "pass", severity: "low", labels: [] };
  }

  const hasFail = issues.some((issue) => issue.level === "fail");
  const hasUnsafeInline = issues.some((issue) => issue.kind === "unsafe-inline");

  return {
    status: hasFail ? "fail" : "warning",
    severity: hasFail || hasUnsafeInline ? "high" : "medium",
    labels: issues.map((issue) => issue.label),
  };
}
