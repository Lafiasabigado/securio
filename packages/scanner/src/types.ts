export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type FindingStatus = "pass" | "warning" | "fail";

export type ScanStatus = "excellent" | "good" | "warning" | "critical";

export type AuditCategory =
  | "https"
  | "headers"
  | "cookies"
  | "mixed_content"
  | "forms"
  | "technology";

export interface Finding {
  id: string;
  category: AuditCategory;
  categoryTitle: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  description: string;
  importance: string;
  recommendation: string;
  remediationSnippet?: string;
  detectedValue?: string;
  referenceLinks?: Array<{ title: string; url: string }>;
  cwe?: string;
}

export interface CategorySummary {
  category: AuditCategory;
  title: string;
  score: number; // 0 to 100
  status: FindingStatus;
  passedCount: number;
  totalCount: number;
}

export interface OriginTelemetry {
  ip?: string;
  serverHeader?: string;
  tlsVersion?: string;
  tlsCipher?: string;
  certValidUntil?: string;
  certDaysRemaining?: number;
  certIssuer?: string;
  alpn?: string;
  dnssec?: boolean;
  resolvedAt: string;
  latencyMs: number;
  technologies: string[];
}

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  protocol: "https:" | "http:";
  timestamp: string;
  score: number; // 0 - 100
  status: ScanStatus;
  grade: "A+" | "A" | "B+" | "B" | "C" | "F";
  summary: string;
  stats: {
    passed: number;
    warning: number;
    critical: number;
    total: number;
  };
  telemetry: OriginTelemetry;
  categories: Record<AuditCategory, CategorySummary>;
  findings: Finding[];
}

export interface ValidatedTarget {
  rawUrl: string;
  normalizedUrl: string;
  parsedUrl: URL;
  hostname: string;
  ip: string;
}

export interface ScanApiRequest {
  url: string;
}

export interface ScanApiResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
}
