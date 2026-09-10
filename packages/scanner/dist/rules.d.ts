import type { AuditCategory, CategorySummary, Finding, ScanStatus } from "./types.js";
export declare function sortFindings(findings: Finding[]): Finding[];
export declare function computeScanScore(findings: Finding[]): {
    score: number;
    status: ScanStatus;
    grade: "A+" | "A" | "B+" | "B" | "C" | "F";
    summary: string;
};
export declare function buildCategorySummaries(findings: Finding[]): Record<AuditCategory, CategorySummary>;
//# sourceMappingURL=rules.d.ts.map