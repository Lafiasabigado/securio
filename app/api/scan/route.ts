import { NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/scanner/scanner";
import type { ScanApiResponse } from "@/lib/scanner/types";
import { validateAndResolveTarget } from "@/lib/validation/url";

export const maxDuration = 30; // Max execution timeout for Next.js runtime
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse<ScanApiResponse>> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Corps de requête JSON invalide." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !("url" in body) || typeof (body as { url: unknown }).url !== "string") {
      return NextResponse.json(
        { success: false, error: "Le champ 'url' est obligatoire et doit être une chaîne de caractères." },
        { status: 400 }
      );
    }

    const rawUrl = (body as { url: string }).url;

    // 1. Validation & SSRF defense
    const validation = await validateAndResolveTarget(rawUrl);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422 }
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
      { status: 200 }
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
