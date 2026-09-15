export type CspIssueLevel = "fail" | "warning";
export interface CspScriptIssue {
    kind: "unconstrained" | "unsafe-eval" | "unsafe-inline" | "data" | "blob" | "http" | "https-scheme" | "wildcard";
    label: string;
    level: CspIssueLevel;
}
export declare const CSP_REMEDIATION_SNIPPET = "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
/**
 * Inspects script execution policy (script-src, else default-src).
 * 'unsafe-inline' is ignored when 'strict-dynamic' is present (CSP3).
 */
export declare function inspectCspScriptSrc(csp: string): CspScriptIssue[];
export declare function summarizeCspIssues(issues: CspScriptIssue[]): {
    status: "pass" | "warning" | "fail";
    severity: "high" | "medium" | "low";
    labels: string[];
};
//# sourceMappingURL=csp.d.ts.map