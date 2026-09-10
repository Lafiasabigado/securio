import type { ScanResult } from "@securio/scanner";

export function formatJsonReport(result: ScanResult): string {
  return JSON.stringify(
    {
      id: result.id,
      url: result.url,
      domain: result.domain,
      protocol: result.protocol,
      timestamp: result.timestamp,
      score: result.score,
      status: result.status,
      grade: result.grade,
      summary: result.summary,
      stats: result.stats,
      telemetry: result.telemetry,
      categories: result.categories,
      findings: result.findings.map((f) => ({
        id: f.id,
        category: f.category,
        title: f.title,
        severity: f.severity,
        status: f.status,
        description: f.description,
        importance: f.importance,
        recommendation: f.recommendation,
        detectedValue: f.detectedValue,
        cwe: f.cwe,
      })),
    },
    null,
    2
  );
}
