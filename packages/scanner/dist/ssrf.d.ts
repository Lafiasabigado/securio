/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, or reserved.
 */
export declare function isPrivateOrReservedIp(ip: string): boolean;
export interface DnsCheckResult {
    allowed: boolean;
    ip?: string;
    error?: string;
}
/**
 * Resolves the hostname and ensures it resolves to a publicly routable IP.
 */
export declare function validatePublicHost(hostname: string): Promise<DnsCheckResult>;
//# sourceMappingURL=ssrf.d.ts.map