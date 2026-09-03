import type { Finding } from "./types";

export interface CookieFlags {
  name: string;
  hasSecure: boolean;
  hasHttpOnly: boolean;
  sameSite: "strict" | "lax" | "none" | "missing";
}

/**
 * Parses Set-Cookie header strings safely WITHOUT storing or leaking their values.
 */
export function parseCookieFlags(cookieHeaders: string[]): CookieFlags[] {
  const result: CookieFlags[] = [];

  for (const header of cookieHeaders) {
    if (!header || typeof header !== "string") continue;

    const parts = header.split(";").map((p) => p.trim());
    if (parts.length === 0) continue;

    // The first part is Name=Value (we only keep Name!)
    const firstPart = parts[0];
    const equalIdx = firstPart.indexOf("=");
    const name = equalIdx > 0 ? firstPart.substring(0, equalIdx).trim() : firstPart.trim();

    let hasSecure = false;
    let hasHttpOnly = false;
    let sameSite: "strict" | "lax" | "none" | "missing" = "missing";

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lower = part.toLowerCase();

      if (lower === "secure") {
        hasSecure = true;
      } else if (lower === "httponly") {
        hasHttpOnly = true;
      } else if (lower.startsWith("samesite=")) {
        const val = lower.split("=")[1]?.trim();
        if (val === "strict") sameSite = "strict";
        else if (val === "lax") sameSite = "lax";
        else if (val === "none") sameSite = "none";
      }
    }

    result.push({
      name: name || "cookie_session",
      hasSecure,
      hasHttpOnly,
      sameSite,
    });
  }

  return result;
}

export function analyzeCookies(cookieHeaders: string[], isHttps: boolean): Finding[] {
  const findings: Finding[] = [];
  const cookies = parseCookieFlags(cookieHeaders);

  if (cookies.length === 0) {
    findings.push({
      id: "cookie-none-exposed",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Aucun cookie d'état exposé dans la réponse initiale",
      severity: "low",
      status: "pass",
      description: "Aucun en-tête 'Set-Cookie' n'a été renvoyé lors de la requête initiale non authentifiée.",
      importance: "L'absence d'émission prématurée de cookies réduit la surface d'attaque et favorise la conformité vie privée (RGPD).",
      recommendation: "Lors de la création de cookies de session futurs, veillez à toujours spécifier Secure, HttpOnly et SameSite.",
      detectedValue: "0 cookie renvoyé",
    });
    return findings;
  }

  // Check Secure flag
  const insecureCookies = cookies.filter((c) => !c.hasSecure);
  if (insecureCookies.length > 0 && isHttps) {
    const names = insecureCookies.map((c) => c.name).join(", ");
    findings.push({
      id: "cookie-secure-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Drapeau 'Secure' manquant sur ${insecureCookies.length} cookie(s)`,
      severity: "high",
      status: "fail",
      description: `Le(s) cookie(s) [${names}] ne comportent pas le drapeau 'Secure'.`,
      importance: "Sans 'Secure', le navigateur transmettra ces cookies en clair si l'internaute effectue une requête HTTP vers le même domaine, risquant leur interception.",
      recommendation: "Ajoutez impérativement le drapeau '; Secure' à tous vos cookies de session et d'authentification.",
      remediationSnippet: "Set-Cookie: session_id=...; Secure; HttpOnly; SameSite=Lax",
      cwe: "CWE-614",
    });
  } else {
    findings.push({
      id: "cookie-secure-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Drapeau 'Secure' configuré sur tous les cookies",
      severity: "low",
      status: "pass",
      description: "Tous les cookies renvoyés exigent une transmission chiffrée HTTPS.",
      importance: "Empêche la fuite de cookies d'authentification sur des canaux réseau non sécurisés.",
      recommendation: "Conservez cette configuration pour tout nouveau cookie.",
      detectedValue: `${cookies.length} cookie(s) avec Secure`,
    });
  }

  // Check HttpOnly flag
  const nonHttpOnlyCookies = cookies.filter((c) => !c.hasHttpOnly);
  if (nonHttpOnlyCookies.length > 0) {
    const names = nonHttpOnlyCookies.map((c) => c.name).join(", ");
    findings.push({
      id: "cookie-httponly-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Attribut 'HttpOnly' absent sur ${nonHttpOnlyCookies.length} cookie(s)`,
      severity: "medium",
      status: "warning",
      description: `Le(s) cookie(s) [${names}] ne disposent pas de l'attribut 'HttpOnly'.`,
      importance: "Permet aux scripts JavaScript côté client d'accéder au cookie via 'document.cookie', rendant le vol de session possible en cas de faille XSS.",
      recommendation: "Marquez tous les cookies d'authentification ou sensibles avec '; HttpOnly' pour interdire leur lecture par JavaScript.",
      remediationSnippet: "Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict",
      cwe: "CWE-1004",
    });
  } else {
    findings.push({
      id: "cookie-httponly-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Attribut 'HttpOnly' actif sur tous les cookies",
      severity: "low",
      status: "pass",
      description: "Les cookies sont inaccessibles aux scripts JavaScript exécutés dans le document.",
      importance: "Immunise les identifiants de session contre le vol direct par injection XSS.",
      recommendation: "Maintenez 'HttpOnly' sur l'ensemble des cookies contenant des jetons d'état.",
      detectedValue: `${cookies.length} cookie(s) avec HttpOnly`,
    });
  }

  // Check SameSite flag
  const missingSameSite = cookies.filter((c) => c.sameSite === "missing" || c.sameSite === "none");
  if (missingSameSite.length > 0) {
    const names = missingSameSite.map((c) => c.name).join(", ");
    findings.push({
      id: "cookie-samesite-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Protection 'SameSite' absente ou permissive sur ${missingSameSite.length} cookie(s)`,
      severity: "medium",
      status: "warning",
      description: `Le(s) cookie(s) [${names}] ne définissent pas 'SameSite=Lax' ou 'SameSite=Strict'.`,
      importance: "Sans SameSite restrictif, le navigateur joint ces cookies aux requêtes provenant de sites tiers, facilitant les attaques CSRF (Cross-Site Request Forgery).",
      recommendation: "Définissez '; SameSite=Lax' pour les cookies de navigation standard ou '; SameSite=Strict' pour les opérations critiques.",
      remediationSnippet: "Set-Cookie: session=...; SameSite=Lax; Secure; HttpOnly",
      cwe: "CWE-1275",
    });
  } else {
    findings.push({
      id: "cookie-samesite-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Attribut 'SameSite' protecteur configuré",
      severity: "low",
      status: "pass",
      description: "Tous les cookies restreignent leur envoi lors des requêtes inter-sites (Lax ou Strict).",
      importance: "Fournit une protection de premier ordre contre les falsifications de requêtes intersites (CSRF).",
      recommendation: "Maintenez la politique SameSite adéquate pour vos flux d'authentification.",
      detectedValue: `${cookies.length} cookie(s) avec SameSite protégé`,
    });
  }

  return findings;
}
