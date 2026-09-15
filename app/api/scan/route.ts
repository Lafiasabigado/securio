import { NextResponse } from "next/server";
import { clientIpFromRequest, consumeRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { runSecurityScan } from "@/lib/scanner/scanner";
import type { ScanApiResponse } from "@/lib/scanner/types";
import { validateAndResolveTarget } from "@/lib/validation/url";

export const maxDuration = 30; // Max execution timeout for Next.js runtime
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse<ScanApiResponse>> {
  try {
    const quota = consumeRateLimit(clientIpFromRequest(request));
    const quotaHeaders = rateLimitHeaders(quota);
    if (!quota.allowed) {
      return NextResponse.json(
        { success: false, error: "Trop de scans depuis cette adresse. Réessayez dans une minute." },
        { status: 429, headers: quotaHeaders }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON invalide." },
        { status: 400, headers: quotaHeaders }
      );
    }

    if (!body || typeof body !== "object" || !("url" in body) || typeof (body as { url: unknown }).url !== "string") {
      return NextResponse.json(
        { success: false, error: "Le champ 'url' est obligatoire et doit être une chaîne de caractères." },
        { status: 400, headers: quotaHeaders }
      );
    }

    const rawUrl = (body as { url: string }).url;

    // 1. Validation & SSRF defense
    const validation = await validateAndResolveTarget(rawUrl);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422, headers: quotaHeaders }
      );
    }

    // 2. Execute passive security scanner
    const scanResult = await runSecurityScan(validation.target);

    // 3. Return structured scan result
    return NextResponse.json(
      {
        success: true,
        data: scanResult,
      },
      { status: 200, headers: quotaHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inattendue lors de l'analyse du site.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
