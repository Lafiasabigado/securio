import type { ValidatedTarget } from "./types.js";
/**
 * Validates and resolves a URL target for scanning.
 * Replaces the previous zod-based validation with native URL API + regex.
 * Same security guarantees, zero external dependencies.
 */
export declare function validateAndResolveTarget(input: string): Promise<{
    success: true;
    target: ValidatedTarget;
} | {
    success: false;
    error: string;
}>;
//# sourceMappingURL=validation.d.ts.map