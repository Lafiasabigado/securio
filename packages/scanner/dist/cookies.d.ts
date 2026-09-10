import type { Finding } from "./types.js";
export interface CookieFlags {
    name: string;
    hasSecure: boolean;
    hasHttpOnly: boolean;
    sameSite: "strict" | "lax" | "none" | "missing";
}
/**
 * Parses Set-Cookie header strings safely WITHOUT storing or leaking their values.
 */
export declare function parseCookieFlags(cookieHeaders: string[]): CookieFlags[];
export declare function analyzeCookies(cookieHeaders: string[], isHttps: boolean): Finding[];
//# sourceMappingURL=cookies.d.ts.map