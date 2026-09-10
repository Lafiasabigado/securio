import type { Finding } from "./types.js";
export interface MixedContentAsset {
    tag: string;
    attr: string;
    url: string;
}
export declare function detectMixedContent(htmlBody: string, isHttps: boolean): Finding[];
//# sourceMappingURL=mixed-content.d.ts.map