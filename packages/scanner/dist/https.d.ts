import type { Finding } from "./types.js";
export interface TlsAuditResult {
    valid: boolean;
    version?: string;
    cipher?: string;
    issuer?: string;
    validTo?: string;
    daysRemaining?: number;
    alpn?: string;
    error?: string;
}
/**
 * Passively inspects TLS certificate and cipher parameters via TLS SNI handshake.
 */
export declare function inspectTlsCertificate(hostname: string, port?: number, timeoutMs?: number): Promise<TlsAuditResult>;
/**
 * Verifies if plain HTTP redirects to HTTPS.
 */
export declare function checkHttpToHttpsRedirect(hostname: string): Promise<{
    redirectsToHttps: boolean;
    statusCode?: number;
}>;
/**
 * Builds findings for HTTPS and TLS checks.
 */
export declare function analyzeHttps(targetUrl: URL, tlsInfo: TlsAuditResult, httpRedirect: {
    redirectsToHttps: boolean;
    statusCode?: number;
}): Finding[];
//# sourceMappingURL=https.d.ts.map