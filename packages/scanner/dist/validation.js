import { validatePublicHost } from "./ssrf.js";
/**
 * Validates and resolves a URL target for scanning.
 * Replaces the previous zod-based validation with native URL API + regex.
 * Same security guarantees, zero external dependencies.
 */
export async function validateAndResolveTarget(input) {
    // Basic input validation
    if (!input || typeof input !== "string") {
        return { success: false, error: "L'URL est requise." };
    }
    const trimmed = input.trim();
    if (trimmed.length < 3) {
        return { success: false, error: "L'URL est requise." };
    }
    if (trimmed.length > 2048) {
        return { success: false, error: "L'URL est trop longue." };
    }
    // Add https protocol if missing
    let formatted = trimmed;
    if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
    }
    let parsed;
    try {
        parsed = new URL(formatted);
    }
    catch {
        return { success: false, error: "Format d'URL invalide." };
    }
    // Check allowed protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { success: false, error: "Seuls les protocoles http:// et https:// sont autorisés." };
    }
    // Reject ports other than standard web ports (80, 443, 8080, 8443) to avoid port scanning
    if (parsed.port && !["80", "443", "8080", "8443"].includes(parsed.port)) {
        return {
            success: false,
            error: `Le port ${parsed.port} n'est pas autorisé pour l'analyse passive (ports autorisés : 80, 443, 8080, 8443).`,
        };
    }
    const hostname = parsed.hostname;
    if (!hostname || hostname.includes("..")) {
        return { success: false, error: "Nom d'hôte invalide." };
    }
    // SSRF DNS check
    const dnsCheck = await validatePublicHost(hostname);
    if (!dnsCheck.allowed) {
        return {
            success: false,
            error: dnsCheck.error || "Adresse de destination non autorisée ou privée.",
        };
    }
    return {
        success: true,
        target: {
            rawUrl: input,
            normalizedUrl: parsed.toString(),
            parsedUrl: parsed,
            hostname,
            ip: dnsCheck.ip || "Inconnue",
        },
    };
}
//# sourceMappingURL=validation.js.map