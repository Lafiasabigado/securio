export interface HttpResponse {
    url: string;
    statusCode: number;
    statusText: string;
    headers: Headers;
    rawHeaders: Record<string, string>;
    setCookieHeaders: string[];
    body: string;
    latencyMs: number;
    redirectCount: number;
    redirectChain: string[];
}
export declare function fetchWithSecurityLimits(initialUrl: string, options?: {
    maxRedirects?: number;
    timeoutMs?: number;
    maxBytes?: number;
}): Promise<HttpResponse>;
//# sourceMappingURL=http.d.ts.map