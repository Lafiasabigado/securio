import crypto from "node:crypto";
import type { ValidatedTarget } from "../validation/url";
import { analyzeCookies } from "./cookies";
import { analyzeForms } from "./forms";
import { analyzeSecurityHeaders } from "./headers";
import { fetchWithSecurityLimits } from "./http";
import { analyzeHttps, checkHttpToHttpsRedirect, inspectTlsCertificate, type TlsAuditResult } from "./https";
import { detectMixedContent } from "./mixed-content";
import { buildCategorySummaries, computeScanScore, sortFindings } from "./rules";
import { detectTechnologies } from "./technology";
import type { Finding, OriginTelemetry, ScanResult } from "./types";

export async function runSecurityScan(target: ValidatedTarget): Promise<ScanResult> {
  const scanId = `scn_${crypto.randomBytes(6).toString("hex")}`;
  const timestamp = new Date().toISOString();
  const isHttps = target.parsedUrl.protocol === "https:";
  const hostname = target.hostname;

  const fallbackTls: TlsAuditResult = { valid: false, error: "Protocole non HTTPS" };

  // 1. Concurrent network telemetry collection
  const [tlsAudit, httpRedirect, httpResponse] = await Promise.all([
    isHttps ? inspectTlsCertificate(hostname) : Promise.resolve(fallbackTls),
    checkHttpToHttpsRedirect(hostname),
    fetchWithSecurityLimits(target.normalizedUrl),
  ]);

  const allFindings: Finding[] = [];

  // 2. HTTPS & TLS Checks
  const httpsFindings = analyzeHttps(target.parsedUrl, tlsAudit, httpRedirect);
  allFindings.push(...httpsFindings);

  // 3. Security Headers Checks
  const headerFindings = analyzeSecurityHeaders(httpResponse.rawHeaders);
  allFindings.push(...headerFindings);

  // 4. Cookies Checks
  const cookieFindings = analyzeCookies(httpResponse.setCookieHeaders, isHttps);
  allFindings.push(...cookieFindings);

  // 5. Mixed Content Checks
  const mixedContentFindings = detectMixedContent(httpResponse.body, isHttps);
  allFindings.push(...mixedContentFindings);

  // 6. Form Target Checks
  const formFindings = analyzeForms(httpResponse.body, target.parsedUrl);
  allFindings.push(...formFindings);

  // 7. Technology Exposure Fingerprinting
  const { technologies, findings: techFindings } = detectTechnologies(httpResponse.rawHeaders, httpResponse.body);
  allFindings.push(...techFindings);

  // 8. Sorting & Score Computation
  const sortedFindings = sortFindings(allFindings);
  const { score, status, grade, summary } = computeScanScore(sortedFindings);
  const categorySummaries = buildCategorySummaries(sortedFindings);

  // Stats calculation
  const passed = sortedFindings.filter((f) => f.status === "pass").length;
  const warning = sortedFindings.filter((f) => f.status === "warning").length;
  const critical = sortedFindings.filter((f) => f.status === "fail").length;

  const telemetry: OriginTelemetry = {
    ip: target.ip,
    serverHeader: httpResponse.rawHeaders["server"] || "Masqué / Non déclaré",
    tlsVersion: tlsAudit.version || (isHttps ? "TLS 1.2+" : "Non chiffré"),
    tlsCipher: tlsAudit.cipher,
    certValidUntil: tlsAudit.validTo,
    certDaysRemaining: tlsAudit.daysRemaining,
    certIssuer: tlsAudit.issuer,
    alpn: tlsAudit.alpn,
    dnssec: false, // DNSSEC flag can be noted
    resolvedAt: timestamp,
    latencyMs: httpResponse.latencyMs,
    technologies,
  };

  return {
    id: scanId,
    url: target.normalizedUrl,
    domain: hostname,
    protocol: isHttps ? "https:" : "http:",
    timestamp,
    score,
    status,
    grade,
    summary,
    stats: {
      passed,
      warning,
      critical,
      total: sortedFindings.length,
    },
    telemetry,
    categories: categorySummaries,
    findings: sortedFindings,
  };
}
