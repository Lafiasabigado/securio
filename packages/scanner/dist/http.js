import nodeDns from "node:dns";
import { validatePublicHost } from "./ssrf.js";
try {
    nodeDns.setDefaultResultOrder("ipv4first");
}
catch {
    // Ignore
}
export async function fetchWithSecurityLimits(initialUrl, options = {}) {
    const maxRedirects = options.maxRedirects ?? 5;
    const timeoutMs = options.timeoutMs ?? 8000;
    const maxBytes = options.maxBytes ?? 2 * 1024 * 1024; // 2MB max
    let currentUrl = initialUrl;
    let redirectCount = 0;
    const redirectChain = [initialUrl];
    const startTime = Date.now();
    while (redirectCount <= maxRedirects) {
        const parsed = new URL(currentUrl);
        // Verify SSRF on each hop
        const dnsCheck = await validatePublicHost(parsed.hostname);
        if (!dnsCheck.allowed) {
            throw new Error(`Redirection non autorisée vers un hôte privé ou interdit : ${parsed.hostname}`);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        let res;
        try {
            res = await fetch(currentUrl, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Securio-PassiveAudit/1.0)",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                },
                redirect: "manual",
                signal: controller.signal,
            });
        }
        catch (err) {
            clearTimeout(timeout);
            if (err instanceof Error && err.name === "AbortError") {
                throw new Error(`Délai d'attente dépassé (${timeoutMs}ms) lors de la requête vers ${currentUrl}.`);
            }
            throw err;
        }
        finally {
            clearTimeout(timeout);
        }
        // Check redirection
        if ([301, 302, 303, 307, 308].includes(res.status)) {
            const location = res.headers.get("location");
            if (!location) {
                break; // No location header, continue with this response
            }
            redirectCount++;
            if (redirectCount > maxRedirects) {
                throw new Error(`Trop de redirections détectées (limite fixée à ${maxRedirects}).`);
            }
            const nextUrl = new URL(location, currentUrl).toString();
            redirectChain.push(nextUrl);
            currentUrl = nextUrl;
            continue;
        }
        // Normal response reached
        const rawHeaders = {};
        res.headers.forEach((val, key) => {
            rawHeaders[key.toLowerCase()] = val;
        });
        // Extract Set-Cookie headers
        // Node.js Headers provides getSetCookie if available
        let setCookieHeaders = [];
        if (typeof res.headers.getSetCookie === "function") {
            setCookieHeaders = res.headers.getSetCookie();
        }
        else {
            const single = res.headers.get("set-cookie");
            if (single) {
                setCookieHeaders = [single];
            }
        }
        // Read body safely with maxBytes cap
        let body = "";
        if (res.body) {
            const reader = res.body.getReader();
            const chunks = [];
            let bytesRead = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value) {
                    bytesRead += value.length;
                    if (bytesRead > maxBytes) {
                        chunks.push(value.subarray(0, maxBytes - (bytesRead - value.length)));
                        break;
                    }
                    chunks.push(value);
                }
            }
            const totalBuffer = new Uint8Array(Math.min(bytesRead, maxBytes));
            let offset = 0;
            for (const chunk of chunks) {
                totalBuffer.set(chunk, offset);
                offset += chunk.length;
            }
            body = new TextDecoder("utf-8", { fatal: false }).decode(totalBuffer);
        }
        const latencyMs = Date.now() - startTime;
        return {
            url: currentUrl,
            statusCode: res.status,
            statusText: res.statusText,
            headers: res.headers,
            rawHeaders,
            setCookieHeaders,
            body,
            latencyMs,
            redirectCount,
            redirectChain,
        };
    }
    throw new Error("Impossible de compléter la requête HTTP dans la limite des redirections.");
}
//# sourceMappingURL=http.js.map