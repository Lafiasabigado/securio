import type { Finding } from "./types.js";
export interface FormInfo {
    action: string;
    method: string;
    hasPasswordInput: boolean;
    isInsecureTarget: boolean;
}
export declare function analyzeForms(htmlBody: string, currentUrl: URL): Finding[];
//# sourceMappingURL=forms.d.ts.map