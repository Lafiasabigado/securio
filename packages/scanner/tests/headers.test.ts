import { describe, expect, it } from "vitest";
import { inspectCspScriptSrc, summarizeCspIssues } from "../src/csp.js";
import { analyzeSecurityHeaders } from "../src/headers.js";

function cspFinding(headers: Record<string, string>) {
  return analyzeSecurityHeaders(headers).find((finding) => finding.id.startsWith("header-csp-"));
}

describe("analyzeSecurityHeaders", () => {
  it("fails when every security header is missing", () => {
    const ids = analyzeSecurityHeaders({}).map((finding) => finding.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "header-csp-missing",
        "header-hsts-missing",
        "header-xcto-missing",
        "header-xfo-missing",
        "header-referrer-missing",
        "header-permissions-missing",
      ])
    );
  });

  it("passes a strict baseline", () => {
    const findings = analyzeSecurityHeaders({
      "content-security-policy": "default-src 'self'; script-src 'self'",
      "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=()",
    });
    expect(findings.filter((finding) => finding.status !== "pass").map((finding) => finding.id)).toEqual(
      []
    );
  });

  it("warns on wildcard script-src", () => {
    const finding = cspFinding({
      "content-security-policy": "default-src 'self'; script-src *",
    });
    expect(finding?.id).toBe("header-csp-permissive");
    expect(finding?.status).toBe("warning");
  });

  it("fails on unsafe-eval", () => {
    const finding = cspFinding({
      "content-security-policy": "script-src 'self' 'unsafe-eval'",
    });
    expect(finding?.id).toBe("header-csp-unsafe");
    expect(finding?.status).toBe("fail");
    expect(finding?.severity).toBe("high");
  });

  it("warns on unsafe-inline unless strict-dynamic is present", () => {
    const weak = cspFinding({
      "content-security-policy": "script-src 'self' 'unsafe-inline'",
    });
    expect(weak?.id).toBe("header-csp-permissive");
    expect(weak?.status).toBe("warning");

    const withStrictDynamic = cspFinding({
      "content-security-policy": "script-src 'nonce-abc' 'strict-dynamic' 'unsafe-inline'",
    });
    expect(withStrictDynamic?.id).toBe("header-csp-pass");
  });

  it("fails when CSP does not constrain scripts", () => {
    const finding = cspFinding({
      "content-security-policy": "frame-ancestors 'self'",
    });
    expect(finding?.id).toBe("header-csp-unsafe");
    expect(finding?.status).toBe("fail");
  });

  it("does not treat a host allowlist as a scheme wildcard", () => {
    const finding = cspFinding({
      "content-security-policy": "script-src 'self' https://cdn.example.com",
    });
    expect(finding?.id).toBe("header-csp-pass");
  });
});

describe("inspectCspScriptSrc", () => {
  it("flags https: scheme sources and data: URIs", () => {
    const issues = inspectCspScriptSrc("script-src 'self' https: data:");
    const kinds = issues.map((issue) => issue.kind);
    expect(kinds).toEqual(expect.arrayContaining(["https-scheme", "data"]));
    expect(summarizeCspIssues(issues).status).toBe("fail");
  });
});
