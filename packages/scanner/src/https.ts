import tls from "node:tls";
import type { Finding } from "./types.js";

export interface TlsAuditResult {
  valid: boolean;
  version?: string;
  cipher?: string;
  issuer?: string;
  validTo?: string;
  daysRemaining?: number;
  alpn?: string;
  error?: string;
}

/**
 * Passively inspects TLS certificate and cipher parameters via TLS SNI handshake.
 */
export async function inspectTlsCertificate(hostname: string, port = 443, timeoutMs = 5000): Promise<TlsAuditResult> {
  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ valid: false, error: "Délai d'attente dépassé lors de la négociation TLS." });
      }
    }, timeoutMs);

    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false, // We inspect cert details even if untrusted/expired to report precisely
          ALPNProtocols: ["h2", "http/1.1"],
        },
        () => {
          if (settled) {
            socket.destroy();
            return;
          }
          settled = true;
          clearTimeout(timer);

          const cert = socket.getPeerCertificate();
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();
          const alpn = socket.alpnProtocol || undefined;

          socket.destroy();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({
              valid: false,
              error: "Aucun certificat SSL/TLS renvoyé par le serveur.",
            });
            return;
          }

          let daysRemaining: number | undefined;
          if (cert.valid_to) {
            const expiry = new Date(cert.valid_to).getTime();
            daysRemaining = Math.max(0, Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24)));
          }

          let issuer = "Inconnu";
          if (cert.issuer) {
            const org = cert.issuer.O || cert.issuer.CN;
            issuer = Array.isArray(org) ? org.join(", ") : org || "Inconnu";
          }

          resolve({
            valid: authorized,
            version: protocol || "TLS 1.2+",
            cipher: cipher ? `${cipher.name} (${cipher.standardName || cipher.version})` : undefined,
            issuer,
            validTo: cert.valid_to,
            daysRemaining,
            alpn: typeof alpn === "string" ? alpn : undefined,
            error: authorized ? undefined : authError ? String(authError) : "Certificat non validé",
          });
        }
      );

      socket.on("error", (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve({ valid: false, error: err.message });
        }
      });
    } catch (err: unknown) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ valid: false, error: err instanceof Error ? err.message : "Erreur TLS" });
      }
    }
  });
}

/**
 * Verifies if plain HTTP redirects to HTTPS.
 */
export async function checkHttpToHttpsRedirect(hostname: string): Promise<{ redirectsToHttps: boolean; statusCode?: number }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`http://${hostname}/`, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Securio-PassiveAudit/1.0",
      },
    });

    clearTimeout(timer);

    if ([301, 302, 307, 308].includes(res.status)) {
      const location = res.headers.get("location") || "";
      if (location.startsWith("https://")) {
        return { redirectsToHttps: true, statusCode: res.status };
      }
    }

    return { redirectsToHttps: false, statusCode: res.status };
  } catch {
    // If plain HTTP fails to connect or is closed, assume HTTPS only or unreachable plain HTTP
    return { redirectsToHttps: false };
  }
}

/**
 * Builds findings for HTTPS and TLS checks.
 */
export function analyzeHttps(
  targetUrl: URL,
  tlsInfo: TlsAuditResult,
  httpRedirect: { redirectsToHttps: boolean; statusCode?: number }
): Finding[] {
  const findings: Finding[] = [];
  const isHttps = targetUrl.protocol === "https:";

  // 1. HTTPS Enforcement
  if (!isHttps) {
    findings.push({
      id: "https-missing",
      category: "https",
      categoryTitle: "HTTPS & Transport",
      title: "Connexion non chiffrée (Protocole HTTP en clair)",
      severity: "critical",
      status: "fail",
      description: "Le site web est accessible via HTTP en clair sans chiffrement TLS.",
      importance: "Toutes les données en transit (mots de passe, cookies, requêtes) peuvent être interceptées ou modifiées par un tiers (attaque Man-in-the-Middle).",
      recommendation: "Installez un certificat TLS/SSL et configurez votre serveur pour rediriger tout le trafic vers HTTPS.",
      remediationSnippet: "server {\n  listen 80;\n  server_name votresite.fr;\n  return 301 https://$host$request_uri;\n}",
      cwe: "CWE-319",
    });
  } else {
    findings.push({
      id: "https-enabled",
      category: "https",
      categoryTitle: "HTTPS & Transport",
      title: "Chiffrement HTTPS activé",
      severity: "low",
      status: "pass",
      description: "Les communications avec le serveur sont chiffrées via le protocole HTTPS.",
      importance: "Garantit la confidentialité et l'intégrité des échanges entre le navigateur du visiteur et le serveur.",
      recommendation: "Conservez le chiffrement HTTPS et surveillez la date d'expiration de votre certificat.",
      detectedValue: targetUrl.protocol,
    });
  }

  // 2. TLS Certificate Validity
  if (isHttps) {
    if (tlsInfo.valid) {
      const daysText = tlsInfo.daysRemaining !== undefined ? ` (expire dans ${tlsInfo.daysRemaining} jours)` : "";
      findings.push({
        id: "tls-cert-valid",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Certificat SSL/TLS valide et approuvé",
        severity: "low",
        status: "pass",
        description: `Le certificat émis par ${tlsInfo.issuer || "une autorité reconnue"} est valide${daysText}.`,
        importance: "Évite les alertes de sécurité dissuasives pour les internautes et valide l'identité de l'hôte.",
        recommendation: "Automatisez le renouvellement (ex. ACME / Let's Encrypt / Cloudflare) avant 30 jours restants.",
        detectedValue: `${tlsInfo.version || "TLS"} • ${tlsInfo.cipher || "Chiffrement fort"}`,
      });
    } else {
      findings.push({
        id: "tls-cert-invalid",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Anomalie ou certificat TLS non approuvé",
        severity: "critical",
        status: "fail",
        description: `Le certificat SSL/TLS présente une anomalie : ${tlsInfo.error || "Chaîne de confiance invalide ou certificat auto-signé"}.`,
        importance: "Les navigateurs modernes bloquent l'accès au site avec un écran rouge d'avertissement de sécurité critique.",
        recommendation: "Remplacez le certificat par un certificat valide émis par une autorité de certification (CA) reconnue.",
        remediationSnippet: "certbot --nginx -d votresite.fr",
        cwe: "CWE-295",
      });
    }
  }

  // 3. HTTP to HTTPS Redirection
  if (isHttps) {
    if (httpRedirect.redirectsToHttps) {
      findings.push({
        id: "http-redirect-pass",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Redirection automatique HTTP vers HTTPS active",
        severity: "low",
        status: "pass",
        description: `Les requêtes non chiffrées HTTP port 80 sont redirigées avec un code de statut ${httpRedirect.statusCode || 301} vers HTTPS.`,
        importance: "Empêche les visiteurs d'accéder par inadvertance à une version non sécurisée du site.",
        recommendation: "Maintenez une redirection permanente 301 vers la version HTTPS canonique.",
        detectedValue: `HTTP ${httpRedirect.statusCode || 301} -> HTTPS`,
      });
    } else {
      findings.push({
        id: "http-redirect-fail",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Absence de redirection automatique HTTP vers HTTPS",
        severity: "medium",
        status: "warning",
        description: "Une requête HTTP vers le port 80 ne redirige pas automatiquement vers la version sécurisée HTTPS.",
        importance: "Les utilisateurs accédant au domaine sans préciser 'https://' risquent de naviguer sans chiffrement.",
        recommendation: "Configurez une redirection permanente (HTTP 301) depuis le port 80 vers le port 443 HTTPS.",
        remediationSnippet: "server {\n  listen 80 default_server;\n  return 301 https://$host$request_uri;\n}",
        cwe: "CWE-311",
      });
    }
  }

  return findings;
}
