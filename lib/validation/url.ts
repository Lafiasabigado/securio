import { z } from "zod";
import { validatePublicHost } from "../scanner/ssrf";

export const urlInputSchema = z.string()
  .trim()
  .min(3, "L'URL est requise")
  .max(2048, "L'URL est trop longue");

export interface ValidatedTarget {
  rawUrl: string;
  normalizedUrl: string;
  parsedUrl: URL;
  hostname: string;
  ip: string;
}

export async function validateAndResolveTarget(
  input: string
): Promise<{ success: true; target: ValidatedTarget } | { success: false; error: string }> {
  const parseResult = urlInputSchema.safeParse(input);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "URL invalide" };
  }

  let formatted = parseResult.data;

  // Add https protocol if missing
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
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
