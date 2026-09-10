import nodeDns from "node:dns";
import dns from "node:dns/promises";
import net from "node:net";
// Prefer IPv4 first to avoid unreachable IPv6 timeouts on dual-stack environments
try {
    nodeDns.setDefaultResultOrder("ipv4first");
}
catch {
    // Ignore if not supported
}
/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, or reserved.
 */
export function isPrivateOrReservedIp(ip) {
    if (!net.isIP(ip)) {
        return true;
    }
    // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
    if (ip.startsWith("::ffff:")) {
        const ipv4 = ip.substring(7);
        if (net.isIPv4(ipv4)) {
            return isPrivateOrReservedIp(ipv4);
        }
    }
    if (net.isIPv4(ip)) {
        const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
        if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
            return true;
        }
        const [first, second] = parts;
        // 0.0.0.0/8 (Current network)
        if (first === 0)
            return true;
        // 127.0.0.0/8 (Loopback)
        if (first === 127)
            return true;
        // 10.0.0.0/8 (Private)
        if (first === 10)
            return true;
        // 172.16.0.0/12 (Private)
        if (first === 172 && second >= 16 && second <= 31)
            return true;
        // 192.168.0.0/16 (Private)
        if (first === 192 && second === 168)
            return true;
        // 169.254.0.0/16 (Link-local & AWS/GCP metadata)
        if (first === 169 && second === 254)
            return true;
        // 100.64.0.0/10 (Carrier-grade NAT)
        if (first === 100 && second >= 64 && second <= 127)
            return true;
        // Broadcast & multicast
        if (first >= 224)
            return true;
        return false;
    }
    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();
        // Loopback ::1
        if (lower === "::1" || lower === "0:0:0:0:0:0:0:1")
            return true;
        // Unspecified ::
        if (lower === "::" || lower === "0:0:0:0:0:0:0:0")
            return true;
        // Unique local addresses fc00::/7
        if (lower.startsWith("fc") || lower.startsWith("fd"))
            return true;
        // Link-local addresses fe80::/10
        if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb"))
            return true;
        return false;
    }
    return true;
}
/**
 * Resolves the hostname and ensures it resolves to a publicly routable IP.
 */
export async function validatePublicHost(hostname) {
    const host = hostname.toLowerCase().trim();
    // Deny explicit localhost or internal domains
    if (host === "localhost" ||
        host.endsWith(".localhost") ||
        host.endsWith(".local") ||
        host.endsWith(".internal") ||
        host.endsWith(".lan") ||
        host.endsWith(".home")) {
        return {
            allowed: false,
            error: "L'accès à localhost et aux domaines de réseau local est interdit.",
        };
    }
    // If host is already an IP, directly test it
    if (net.isIP(host)) {
        if (isPrivateOrReservedIp(host)) {
            return {
                allowed: false,
                ip: host,
                error: `L'adresse IP ${host} est une adresse privée ou réservée non autorisée.`,
            };
        }
        return { allowed: true, ip: host };
    }
    try {
        const records = await dns.lookup(host, { all: true });
        if (!records || records.length === 0) {
            return {
                allowed: false,
                error: `Impossible de résoudre l'hôte DNS : ${host}`,
            };
        }
        // Verify all resolved addresses
        for (const record of records) {
            if (isPrivateOrReservedIp(record.address)) {
                return {
                    allowed: false,
                    ip: record.address,
                    error: `Le domaine résout vers une adresse privée ou réservée interdite (${record.address}).`,
                };
            }
        }
        return { allowed: true, ip: records[0].address };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Erreur DNS";
        return {
            allowed: false,
            error: `Échec de résolution DNS pour ${host} : ${message}`,
        };
    }
}
//# sourceMappingURL=ssrf.js.map