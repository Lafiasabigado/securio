import type { Finding } from "./types.js";
export interface TechDetection {
    name: string;
    category: "serveur" | "framework" | "cms" | "cdn" | "bibliothèque";
    version?: string;
    source: string;
}
export declare function detectTechnologies(headers: Record<string, string>, htmlBody: string): {
    technologies: string[];
    findings: Finding[];
};
//# sourceMappingURL=technology.d.ts.map