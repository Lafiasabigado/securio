#!/usr/bin/env node

// ../scanner/dist/ssrf.js
import nodeDns from "node:dns";
import dns from "node:dns/promises";
import net from "node:net";
try {
  nodeDns.setDefaultResultOrder("ipv4first");
} catch {
}
function isPrivateOrReservedIp(ip) {
  if (!net.isIP(ip)) {
    return true;
  }
  if (ip.startsWith("::ffff:")) {
    const ipv4 = ip.substring(7);
    if (net.isIPv4(ipv4)) {
      return isPrivateOrReservedIp(ipv4);
    }
  }
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
      return true;
    }
    const [first, second] = parts;
    if (first === 0)
      return true;
    if (first === 127)
      return true;
    if (first === 10)
      return true;
    if (first === 172 && second >= 16 && second <= 31)
      return true;
    if (first === 192 && second === 168)
      return true;
    if (first === 169 && second === 254)
      return true;
    if (first === 100 && second >= 64 && second <= 127)
      return true;
    if (first >= 224)
      return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1")
      return true;
    if (lower === "::" || lower === "0:0:0:0:0:0:0:0")
      return true;
    if (lower.startsWith("fc") || lower.startsWith("fd"))
      return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb"))
      return true;
    return false;
  }
  return true;
}
async function validatePublicHost(hostname) {
  const host = hostname.toLowerCase().trim();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home")) {
    return {
      allowed: false,
      error: "L'acc\xE8s \xE0 localhost et aux domaines de r\xE9seau local est interdit."
    };
  }
  if (net.isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      return {
        allowed: false,
        ip: host,
        error: `L'adresse IP ${host} est une adresse priv\xE9e ou r\xE9serv\xE9e non autoris\xE9e.`
      };
    }
    return { allowed: true, ip: host };
  }
  try {
    const records = await dns.lookup(host, { all: true });
    if (!records || records.length === 0) {
      return {
        allowed: false,
        error: `Impossible de r\xE9soudre l'h\xF4te DNS : ${host}`
      };
    }
    for (const record of records) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          allowed: false,
          ip: record.address,
          error: `Le domaine r\xE9sout vers une adresse priv\xE9e ou r\xE9serv\xE9e interdite (${record.address}).`
        };
      }
    }
    return { allowed: true, ip: records[0].address };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur DNS";
    return {
      allowed: false,
      error: `\xC9chec de r\xE9solution DNS pour ${host} : ${message}`
    };
  }
}

// ../scanner/dist/validation.js
async function validateAndResolveTarget(input) {
  if (!input || typeof input !== "string") {
    return { success: false, error: "L'URL est requise." };
  }
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return { success: false, error: "L'URL est requise." };
  }
  if (trimmed.length > 2048) {
    return { success: false, error: "L'URL est trop longue." };
  }
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }
  let parsed;
  try {
    parsed = new URL(formatted);
  } catch {
    return { success: false, error: "Format d'URL invalide." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { success: false, error: "Seuls les protocoles http:// et https:// sont autoris\xE9s." };
  }
  if (parsed.port && !["80", "443", "8080", "8443"].includes(parsed.port)) {
    return {
      success: false,
      error: `Le port ${parsed.port} n'est pas autoris\xE9 pour l'analyse passive (ports autoris\xE9s : 80, 443, 8080, 8443).`
    };
  }
  const hostname = parsed.hostname;
  if (!hostname || hostname.includes("..")) {
    return { success: false, error: "Nom d'h\xF4te invalide." };
  }
  const dnsCheck = await validatePublicHost(hostname);
  if (!dnsCheck.allowed) {
    return {
      success: false,
      error: dnsCheck.error || "Adresse de destination non autoris\xE9e ou priv\xE9e."
    };
  }
  return {
    success: true,
    target: {
      rawUrl: input,
      normalizedUrl: parsed.toString(),
      parsedUrl: parsed,
      hostname,
      ip: dnsCheck.ip || "Inconnue"
    }
  };
}

// ../scanner/dist/http.js
import nodeDns2 from "node:dns";
try {
  nodeDns2.setDefaultResultOrder("ipv4first");
} catch {
}
async function fetchWithSecurityLimits(initialUrl, options = {}) {
  const maxRedirects = options.maxRedirects ?? 5;
  const timeoutMs = options.timeoutMs ?? 8e3;
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  let currentUrl = initialUrl;
  let redirectCount = 0;
  const redirectChain = [initialUrl];
  const startTime = Date.now();
  while (redirectCount <= maxRedirects) {
    const parsed = new URL(currentUrl);
    const dnsCheck = await validatePublicHost(parsed.hostname);
    if (!dnsCheck.allowed) {
      throw new Error(`Redirection non autoris\xE9e vers un h\xF4te priv\xE9 ou interdit : ${parsed.hostname}`);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Securio-PassiveAudit/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none"
        },
        redirect: "manual",
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`D\xE9lai d'attente d\xE9pass\xE9 (${timeoutMs}ms) lors de la requ\xEAte vers ${currentUrl}.`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) {
        break;
      }
      redirectCount++;
      if (redirectCount > maxRedirects) {
        throw new Error(`Trop de redirections d\xE9tect\xE9es (limite fix\xE9e \xE0 ${maxRedirects}).`);
      }
      const nextUrl = new URL(location, currentUrl).toString();
      redirectChain.push(nextUrl);
      currentUrl = nextUrl;
      continue;
    }
    const rawHeaders = {};
    res.headers.forEach((val, key) => {
      rawHeaders[key.toLowerCase()] = val;
    });
    let setCookieHeaders = [];
    if (typeof res.headers.getSetCookie === "function") {
      setCookieHeaders = res.headers.getSetCookie();
    } else {
      const single = res.headers.get("set-cookie");
      if (single) {
        setCookieHeaders = [single];
      }
    }
    let body = "";
    if (res.body) {
      const reader = res.body.getReader();
      const chunks = [];
      let bytesRead = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        if (value) {
          bytesRead += value.length;
          if (bytesRead > maxBytes) {
            chunks.push(value.subarray(0, maxBytes - (bytesRead - value.length)));
            break;
          }
          chunks.push(value);
        }
      }
      const totalBuffer = new Uint8Array(Math.min(bytesRead, maxBytes));
      let offset = 0;
      for (const chunk of chunks) {
        totalBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      body = new TextDecoder("utf-8", { fatal: false }).decode(totalBuffer);
    }
    const latencyMs = Date.now() - startTime;
    return {
      url: currentUrl,
      statusCode: res.status,
      statusText: res.statusText,
      headers: res.headers,
      rawHeaders,
      setCookieHeaders,
      body,
      latencyMs,
      redirectCount,
      redirectChain
    };
  }
  throw new Error("Impossible de compl\xE9ter la requ\xEAte HTTP dans la limite des redirections.");
}

// ../scanner/dist/https.js
import tls from "node:tls";
async function inspectTlsCertificate(hostname, port = 443, timeoutMs = 5e3) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ valid: false, error: "D\xE9lai d'attente d\xE9pass\xE9 lors de la n\xE9gociation TLS." });
      }
    }, timeoutMs);
    try {
      const socket = tls.connect({
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        // We inspect cert details even if untrusted/expired to report precisely
        ALPNProtocols: ["h2", "http/1.1"]
      }, () => {
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
        const alpn = socket.alpnProtocol || void 0;
        socket.destroy();
        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            error: "Aucun certificat SSL/TLS renvoy\xE9 par le serveur."
          });
          return;
        }
        let daysRemaining;
        if (cert.valid_to) {
          const expiry = new Date(cert.valid_to).getTime();
          daysRemaining = Math.max(0, Math.floor((expiry - Date.now()) / (1e3 * 60 * 60 * 24)));
        }
        let issuer = "Inconnu";
        if (cert.issuer) {
          const org = cert.issuer.O || cert.issuer.CN;
          issuer = Array.isArray(org) ? org.join(", ") : org || "Inconnu";
        }
        resolve({
          valid: authorized,
          version: protocol || "TLS 1.2+",
          cipher: cipher ? `${cipher.name} (${cipher.standardName || cipher.version})` : void 0,
          issuer,
          validTo: cert.valid_to,
          daysRemaining,
          alpn: typeof alpn === "string" ? alpn : void 0,
          error: authorized ? void 0 : authError ? String(authError) : "Certificat non valid\xE9"
        });
      });
      socket.on("error", (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve({ valid: false, error: err.message });
        }
      });
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ valid: false, error: err instanceof Error ? err.message : "Erreur TLS" });
      }
    }
  });
}
async function checkHttpToHttpsRedirect(hostname) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(`http://${hostname}/`, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Securio-PassiveAudit/1.0"
      }
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
    return { redirectsToHttps: false };
  }
}
function analyzeHttps(targetUrl, tlsInfo, httpRedirect) {
  const findings = [];
  const isHttps = targetUrl.protocol === "https:";
  if (!isHttps) {
    findings.push({
      id: "https-missing",
      category: "https",
      categoryTitle: "HTTPS & Transport",
      title: "Connexion non chiffr\xE9e (Protocole HTTP en clair)",
      severity: "critical",
      status: "fail",
      description: "Le site web est accessible via HTTP en clair sans chiffrement TLS.",
      importance: "Toutes les donn\xE9es en transit (mots de passe, cookies, requ\xEAtes) peuvent \xEAtre intercept\xE9es ou modifi\xE9es par un tiers (attaque Man-in-the-Middle).",
      recommendation: "Installez un certificat TLS/SSL et configurez votre serveur pour rediriger tout le trafic vers HTTPS.",
      remediationSnippet: "server {\n  listen 80;\n  server_name votresite.fr;\n  return 301 https://$host$request_uri;\n}",
      cwe: "CWE-319"
    });
  } else {
    findings.push({
      id: "https-enabled",
      category: "https",
      categoryTitle: "HTTPS & Transport",
      title: "Chiffrement HTTPS activ\xE9",
      severity: "low",
      status: "pass",
      description: "Les communications avec le serveur sont chiffr\xE9es via le protocole HTTPS.",
      importance: "Garantit la confidentialit\xE9 et l'int\xE9grit\xE9 des \xE9changes entre le navigateur du visiteur et le serveur.",
      recommendation: "Conservez le chiffrement HTTPS et surveillez la date d'expiration de votre certificat.",
      detectedValue: targetUrl.protocol
    });
  }
  if (isHttps) {
    if (tlsInfo.valid) {
      const daysText = tlsInfo.daysRemaining !== void 0 ? ` (expire dans ${tlsInfo.daysRemaining} jours)` : "";
      findings.push({
        id: "tls-cert-valid",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Certificat SSL/TLS valide et approuv\xE9",
        severity: "low",
        status: "pass",
        description: `Le certificat \xE9mis par ${tlsInfo.issuer || "une autorit\xE9 reconnue"} est valide${daysText}.`,
        importance: "\xC9vite les alertes de s\xE9curit\xE9 dissuasives pour les internautes et valide l'identit\xE9 de l'h\xF4te.",
        recommendation: "Automatisez le renouvellement (ex. ACME / Let's Encrypt / Cloudflare) avant 30 jours restants.",
        detectedValue: `${tlsInfo.version || "TLS"} \u2022 ${tlsInfo.cipher || "Chiffrement fort"}`
      });
    } else {
      findings.push({
        id: "tls-cert-invalid",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Anomalie ou certificat TLS non approuv\xE9",
        severity: "critical",
        status: "fail",
        description: `Le certificat SSL/TLS pr\xE9sente une anomalie : ${tlsInfo.error || "Cha\xEEne de confiance invalide ou certificat auto-sign\xE9"}.`,
        importance: "Les navigateurs modernes bloquent l'acc\xE8s au site avec un \xE9cran rouge d'avertissement de s\xE9curit\xE9 critique.",
        recommendation: "Remplacez le certificat par un certificat valide \xE9mis par une autorit\xE9 de certification (CA) reconnue.",
        remediationSnippet: "certbot --nginx -d votresite.fr",
        cwe: "CWE-295"
      });
    }
  }
  if (isHttps) {
    if (httpRedirect.redirectsToHttps) {
      findings.push({
        id: "http-redirect-pass",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Redirection automatique HTTP vers HTTPS active",
        severity: "low",
        status: "pass",
        description: `Les requ\xEAtes non chiffr\xE9es HTTP port 80 sont redirig\xE9es avec un code de statut ${httpRedirect.statusCode || 301} vers HTTPS.`,
        importance: "Emp\xEAche les visiteurs d'acc\xE9der par inadvertance \xE0 une version non s\xE9curis\xE9e du site.",
        recommendation: "Maintenez une redirection permanente 301 vers la version HTTPS canonique.",
        detectedValue: `HTTP ${httpRedirect.statusCode || 301} -> HTTPS`
      });
    } else {
      findings.push({
        id: "http-redirect-fail",
        category: "https",
        categoryTitle: "HTTPS & Transport",
        title: "Absence de redirection automatique HTTP vers HTTPS",
        severity: "medium",
        status: "warning",
        description: "Une requ\xEAte HTTP vers le port 80 ne redirige pas automatiquement vers la version s\xE9curis\xE9e HTTPS.",
        importance: "Les utilisateurs acc\xE9dant au domaine sans pr\xE9ciser 'https://' risquent de naviguer sans chiffrement.",
        recommendation: "Configurez une redirection permanente (HTTP 301) depuis le port 80 vers le port 443 HTTPS.",
        remediationSnippet: "server {\n  listen 80 default_server;\n  return 301 https://$host$request_uri;\n}",
        cwe: "CWE-311"
      });
    }
  }
  return findings;
}

// ../scanner/dist/headers.js
function analyzeSecurityHeaders(headers) {
  const findings = [];
  const csp = headers["content-security-policy"];
  if (!csp) {
    findings.push({
      id: "header-csp-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Content-Security-Policy (CSP) est absent",
      severity: "high",
      status: "fail",
      description: "La r\xE9ponse HTTP ne d\xE9finit pas d'en-t\xEAte Content-Security-Policy.",
      importance: "Sans CSP, le navigateur ex\xE9cute aveugl\xE9ment tout script inject\xE9, exposant votre site aux attaques par Cross-Site Scripting (XSS) et vol de session.",
      recommendation: "D\xE9finissez un en-t\xEAte Content-Security-Policy strict limitant les sources de scripts, styles et objets autoris\xE9s.",
      remediationSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none'; base-uri 'self';",
      referenceLinks: [
        { title: "Guide CSP MDN", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/CSP" },
        { title: "Aide-m\xE9moire OWASP CSP", url: "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html" }
      ],
      cwe: "CWE-693"
    });
  } else {
    const scriptDirectiveMatch = csp.match(/script-src([^;]+)/i);
    const defaultDirectiveMatch = csp.match(/default-src([^;]+)/i);
    const scriptDirectives = scriptDirectiveMatch ? scriptDirectiveMatch[1] : defaultDirectiveMatch ? defaultDirectiveMatch[1] : "";
    const hasWildcardScript = scriptDirectives.includes("*");
    const hasHttpScript = /http:\/\//i.test(scriptDirectives);
    if (hasWildcardScript || hasHttpScript) {
      findings.push({
        id: "header-csp-permissive",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Content-Security-Policy affaibli (wildcard '*' ou protocole HTTP d\xE9tect\xE9)",
        severity: "medium",
        status: "warning",
        description: "L'en-t\xEAte CSP est pr\xE9sent mais contient des directives tr\xE8s permissives (wildcard * ou protocoles HTTP non chiffr\xE9s).",
        importance: "L'utilisation de wildcards r\xE9duit consid\xE9rablement la protection offerte par le CSP contre les attaques XSS.",
        recommendation: "Restreignez les sources de scripts aux domaines d'origine ('self') et aux services s\xE9curis\xE9s HTTPS.",
        remediationSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' https:;",
        detectedValue: csp.length > 80 ? `${csp.substring(0, 80)}...` : csp,
        cwe: "CWE-1021"
      });
    } else {
      findings.push({
        id: "header-csp-pass",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Content-Security-Policy configur\xE9 avec rigueur",
        severity: "low",
        status: "pass",
        description: "Une politique de s\xE9curit\xE9 de contenu restreignant l'ex\xE9cution de ressources non autoris\xE9es est en place.",
        importance: "Bloque activement les attaques par injection de script XSS et les charges malveillantes non sign\xE9es.",
        recommendation: "Poursuivez la surveillance de vos directives CSP et envisagez le reporting avec 'report-to'.",
        detectedValue: csp.length > 80 ? `${csp.substring(0, 80)}...` : csp
      });
    }
  }
  const hsts = headers["strict-transport-security"];
  if (!hsts) {
    findings.push({
      id: "header-hsts-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Strict-Transport-Security (HSTS) est absent",
      severity: "high",
      status: "fail",
      description: "L'en-t\xEAte Strict-Transport-Security n'est pas envoy\xE9 par le serveur.",
      importance: "Sans HSTS, un attaquant sur le m\xEAme r\xE9seau (Wi-Fi public) peut r\xE9trograder la connexion en HTTP clair via une attaque SSL-Stripping.",
      recommendation: "Activez HSTS avec un max-age d'au moins 1 an (31536000 secondes), incluez les sous-domaines et envisagez le pr\xE9chargement.",
      remediationSnippet: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
      referenceLinks: [
        { title: "MDN HSTS", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Strict-Transport-Security" }
      ],
      cwe: "CWE-319"
    });
  } else {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 0;
    const hasSubDomains = /includesubdomains/i.test(hsts);
    const hasPreload = /preload/i.test(hsts);
    if (maxAge < 15552e3) {
      findings.push({
        id: "header-hsts-short-maxage",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Dur\xE9e de validit\xE9 HSTS insuffisante (max-age faible)",
        severity: "medium",
        status: "warning",
        description: `L'en-t\xEAte HSTS est pr\xE9sent mais avec une dur\xE9e d'expiration de ${maxAge} secondes (inf\xE9rieure aux 6 mois recommand\xE9s).`,
        importance: "Une dur\xE9e trop courte ne prot\xE8ge pas efficacement les utilisateurs r\xE9guliers contre les attaques de d\xE9gradation.",
        recommendation: "Augmentez le param\xE8tre max-age \xE0 31536000 (1 an) et activez includeSubDomains.",
        remediationSnippet: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        detectedValue: hsts
      });
    } else {
      findings.push({
        id: "header-hsts-pass",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Strict-Transport-Security (HSTS) est correctement configur\xE9",
        severity: "low",
        status: "pass",
        description: `HSTS est actif avec max-age=${maxAge}${hasSubDomains ? "; includeSubDomains" : ""}${hasPreload ? "; preload" : ""}.`,
        importance: "Force le navigateur \xE0 communiquer exclusivement par canal HTTPS s\xE9curis\xE9.",
        recommendation: "Maintenez la directive active et assurez-vous que tous vos sous-domaines supportent HTTPS.",
        detectedValue: hsts
      });
    }
  }
  const xcto = headers["x-content-type-options"];
  if (!xcto || !xcto.toLowerCase().includes("nosniff")) {
    findings.push({
      id: "header-xcto-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "X-Content-Type-Options: nosniff est manquant",
      severity: "medium",
      status: "warning",
      description: "L'en-t\xEAte X-Content-Type-Options n'est pas configur\xE9 sur 'nosniff'.",
      importance: "Permet aux navigateurs d'effectuer du reniflage MIME ('MIME-sniffing') et d'interpr\xE9ter des fichiers non ex\xE9cutables comme du code malveillant.",
      recommendation: "Ajoutez l'en-t\xEAte 'X-Content-Type-Options: nosniff' sur toutes les r\xE9ponses.",
      remediationSnippet: "X-Content-Type-Options: nosniff",
      referenceLinks: [
        { title: "MDN X-Content-Type-Options", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/X-Content-Type-Options" }
      ],
      cwe: "CWE-79"
    });
  } else {
    findings.push({
      id: "header-xcto-pass",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "X-Content-Type-Options est configur\xE9 sur nosniff",
      severity: "low",
      status: "pass",
      description: "Le reniflage de types MIME est explicitement d\xE9sactiv\xE9 pour tous les types de contenu.",
      importance: "Emp\xEAche l'ex\xE9cution de scripts dissimul\xE9s dans des images ou fichiers texte.",
      recommendation: "Conservez cette configuration standard sur l'ensemble de vos serveurs web.",
      detectedValue: xcto
    });
  }
  const xfo = headers["x-frame-options"]?.toUpperCase();
  const hasCspFrameAncestors = csp && /frame-ancestors/i.test(csp);
  if (!xfo && !hasCspFrameAncestors) {
    findings.push({
      id: "header-xfo-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Protection contre le clickjacking absente (X-Frame-Options / frame-ancestors)",
      severity: "medium",
      status: "warning",
      description: "Aucun en-t\xEAte X-Frame-Options ni directive CSP frame-ancestors n'a \xE9t\xE9 d\xE9tect\xE9.",
      importance: "Le site peut \xEAtre encapsul\xE9 dans une balise <iframe> tierce pour tromper les utilisateurs et voler des clics (clickjacking).",
      recommendation: "Configurez 'X-Frame-Options: DENY' ou 'SAMEORIGIN', ou d\xE9finissez la directive CSP 'frame-ancestors 'self''.",
      remediationSnippet: "X-Frame-Options: SAMEORIGIN",
      referenceLinks: [
        { title: "OWASP Clickjacking Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html" }
      ],
      cwe: "CWE-1021"
    });
  } else {
    const val = xfo || "Couvert par CSP frame-ancestors";
    findings.push({
      id: "header-xfo-pass",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Protection anti-clickjacking active",
      severity: "low",
      status: "pass",
      description: `L'affichage au sein de cadres ou iframes tiers est restreint (${val}).`,
      importance: "Neutralise les attaques de d\xE9tournement de clics et l'int\xE9gration non consentie sur des sites malveillants.",
      recommendation: "Privil\xE9giez la directive CSP frame-ancestors moderne en compl\xE9ment de X-Frame-Options.",
      detectedValue: val
    });
  }
  const refPolicy = headers["referrer-policy"];
  const safeReferrers = [
    "no-referrer",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "same-origin",
    "origin-when-cross-origin"
  ];
  if (!refPolicy) {
    findings.push({
      id: "header-referrer-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Referrer-Policy n'est pas explicitement d\xE9fini",
      severity: "low",
      status: "warning",
      description: "L'en-t\xEAte Referrer-Policy n'est pas renseign\xE9 (le navigateur appliquera son comportement par d\xE9faut).",
      importance: "Des param\xE8tres sensibles d'URL (jetons, identifiants) peuvent fuiter vers des domaines tiers lors d'un clic sur un lien externe.",
      recommendation: "D\xE9finissez 'Referrer-Policy: strict-origin-when-cross-origin' pour prot\xE9ger la confidentialit\xE9 des URL internes.",
      remediationSnippet: "Referrer-Policy: strict-origin-when-cross-origin",
      referenceLinks: [
        { title: "MDN Referrer-Policy", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Referrer-Policy" }
      ],
      cwe: "CWE-200"
    });
  } else {
    const isSafe = safeReferrers.some((sr) => refPolicy.toLowerCase().includes(sr));
    if (isSafe) {
      findings.push({
        id: "header-referrer-pass",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Politique de r\xE9f\xE9rent (Referrer-Policy) s\xE9curis\xE9e",
        severity: "low",
        status: "pass",
        description: `L'en-t\xEAte Referrer-Policy est configur\xE9 (${refPolicy}).`,
        importance: "Pr\xE9vient la fuite d'informations de navigation sensibles vers les sites externes.",
        recommendation: "Conservez cette configuration stricte.",
        detectedValue: refPolicy
      });
    } else {
      findings.push({
        id: "header-referrer-unsafe",
        category: "headers",
        categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
        title: "Referrer-Policy permissif ('unsafe-url')",
        severity: "medium",
        status: "warning",
        description: `L'en-t\xEAte Referrer-Policy est d\xE9fini sur '${refPolicy}', transmettant l'int\xE9gralit\xE9 du chemin et des param\xE8tres aux tiers.`,
        importance: "Risque de divulgation involontaire de param\xE8tres d'URL confidentiels.",
        recommendation: "Remplacez la directive par 'strict-origin-when-cross-origin'.",
        remediationSnippet: "Referrer-Policy: strict-origin-when-cross-origin",
        detectedValue: refPolicy
      });
    }
  }
  const permPolicy = headers["permissions-policy"];
  if (!permPolicy) {
    findings.push({
      id: "header-permissions-missing",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Permissions-Policy n'est pas configur\xE9",
      severity: "low",
      status: "warning",
      description: "L'en-t\xEAte Permissions-Policy (anciennement Feature-Policy) n'est pas d\xE9fini.",
      importance: "Permet de d\xE9sactiver proactivement les API du navigateur non utilis\xE9es (cam\xE9ra, microphone, g\xE9olocalisation, acc\xE9l\xE9rom\xE8tre) pour \xE9viter leur exploitation.",
      recommendation: "Ajoutez un en-t\xEAte Permissions-Policy restreignant l'acc\xE8s aux capteurs et fonctionnalit\xE9s mat\xE9rielles.",
      remediationSnippet: "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
      referenceLinks: [
        { title: "MDN Permissions-Policy", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Permissions-Policy" }
      ]
    });
  } else {
    findings.push({
      id: "header-permissions-pass",
      category: "headers",
      categoryTitle: "En-t\xEAtes de s\xE9curit\xE9",
      title: "Permissions-Policy est en place",
      severity: "low",
      status: "pass",
      description: "Les fonctionnalit\xE9s mat\xE9rielles et API sensibles du navigateur sont contr\xF4l\xE9es par une politique stricte.",
      importance: "R\xE9duit la surface d'attaque en bloquant les capteurs mat\xE9riels non requis par l'application.",
      recommendation: "V\xE9rifiez r\xE9guli\xE8rement que seules les API strictement indispensables sont autoris\xE9es.",
      detectedValue: permPolicy.length > 80 ? `${permPolicy.substring(0, 80)}...` : permPolicy
    });
  }
  return findings;
}

// ../scanner/dist/cookies.js
function parseCookieFlags(cookieHeaders) {
  const result = [];
  for (const header of cookieHeaders) {
    if (!header || typeof header !== "string")
      continue;
    const parts = header.split(";").map((p) => p.trim());
    if (parts.length === 0)
      continue;
    const firstPart = parts[0];
    const equalIdx = firstPart.indexOf("=");
    const name = equalIdx > 0 ? firstPart.substring(0, equalIdx).trim() : firstPart.trim();
    let hasSecure = false;
    let hasHttpOnly = false;
    let sameSite = "missing";
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lower = part.toLowerCase();
      if (lower === "secure") {
        hasSecure = true;
      } else if (lower === "httponly") {
        hasHttpOnly = true;
      } else if (lower.startsWith("samesite=")) {
        const val = lower.split("=")[1]?.trim();
        if (val === "strict")
          sameSite = "strict";
        else if (val === "lax")
          sameSite = "lax";
        else if (val === "none")
          sameSite = "none";
      }
    }
    result.push({
      name: name || "cookie_session",
      hasSecure,
      hasHttpOnly,
      sameSite
    });
  }
  return result;
}
function analyzeCookies(cookieHeaders, isHttps) {
  const findings = [];
  const cookies = parseCookieFlags(cookieHeaders);
  if (cookies.length === 0) {
    findings.push({
      id: "cookie-none-exposed",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Aucun cookie d'\xE9tat expos\xE9 dans la r\xE9ponse initiale",
      severity: "low",
      status: "pass",
      description: "Aucun en-t\xEAte 'Set-Cookie' n'a \xE9t\xE9 renvoy\xE9 lors de la requ\xEAte initiale non authentifi\xE9e.",
      importance: "L'absence d'\xE9mission pr\xE9matur\xE9e de cookies r\xE9duit la surface d'attaque et favorise la conformit\xE9 vie priv\xE9e (RGPD).",
      recommendation: "Lors de la cr\xE9ation de cookies de session futurs, veillez \xE0 toujours sp\xE9cifier Secure, HttpOnly et SameSite.",
      detectedValue: "0 cookie renvoy\xE9"
    });
    return findings;
  }
  const insecureCookies = cookies.filter((c2) => !c2.hasSecure);
  if (insecureCookies.length > 0 && isHttps) {
    const names = insecureCookies.map((c2) => c2.name).join(", ");
    findings.push({
      id: "cookie-secure-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Drapeau 'Secure' manquant sur ${insecureCookies.length} cookie(s)`,
      severity: "high",
      status: "fail",
      description: `Le(s) cookie(s) [${names}] ne comportent pas le drapeau 'Secure'.`,
      importance: "Sans 'Secure', le navigateur transmettra ces cookies en clair si l'internaute effectue une requ\xEAte HTTP vers le m\xEAme domaine, risquant leur interception.",
      recommendation: "Ajoutez imp\xE9rativement le drapeau '; Secure' \xE0 tous vos cookies de session et d'authentification.",
      remediationSnippet: "Set-Cookie: session_id=...; Secure; HttpOnly; SameSite=Lax",
      cwe: "CWE-614"
    });
  } else {
    findings.push({
      id: "cookie-secure-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Drapeau 'Secure' configur\xE9 sur tous les cookies",
      severity: "low",
      status: "pass",
      description: "Tous les cookies renvoy\xE9s exigent une transmission chiffr\xE9e HTTPS.",
      importance: "Emp\xEAche la fuite de cookies d'authentification sur des canaux r\xE9seau non s\xE9curis\xE9s.",
      recommendation: "Conservez cette configuration pour tout nouveau cookie.",
      detectedValue: `${cookies.length} cookie(s) avec Secure`
    });
  }
  const nonHttpOnlyCookies = cookies.filter((c2) => !c2.hasHttpOnly);
  if (nonHttpOnlyCookies.length > 0) {
    const names = nonHttpOnlyCookies.map((c2) => c2.name).join(", ");
    findings.push({
      id: "cookie-httponly-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Attribut 'HttpOnly' absent sur ${nonHttpOnlyCookies.length} cookie(s)`,
      severity: "medium",
      status: "warning",
      description: `Le(s) cookie(s) [${names}] ne disposent pas de l'attribut 'HttpOnly'.`,
      importance: "Permet aux scripts JavaScript c\xF4t\xE9 client d'acc\xE9der au cookie via 'document.cookie', rendant le vol de session possible en cas de faille XSS.",
      recommendation: "Marquez tous les cookies d'authentification ou sensibles avec '; HttpOnly' pour interdire leur lecture par JavaScript.",
      remediationSnippet: "Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict",
      cwe: "CWE-1004"
    });
  } else {
    findings.push({
      id: "cookie-httponly-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Attribut 'HttpOnly' actif sur tous les cookies",
      severity: "low",
      status: "pass",
      description: "Les cookies sont inaccessibles aux scripts JavaScript ex\xE9cut\xE9s dans le document.",
      importance: "Immunise les identifiants de session contre le vol direct par injection XSS.",
      recommendation: "Maintenez 'HttpOnly' sur l'ensemble des cookies contenant des jetons d'\xE9tat.",
      detectedValue: `${cookies.length} cookie(s) avec HttpOnly`
    });
  }
  const missingSameSite = cookies.filter((c2) => c2.sameSite === "missing" || c2.sameSite === "none");
  if (missingSameSite.length > 0) {
    const names = missingSameSite.map((c2) => c2.name).join(", ");
    findings.push({
      id: "cookie-samesite-missing",
      category: "cookies",
      categoryTitle: "Cookies",
      title: `Protection 'SameSite' absente ou permissive sur ${missingSameSite.length} cookie(s)`,
      severity: "medium",
      status: "warning",
      description: `Le(s) cookie(s) [${names}] ne d\xE9finissent pas 'SameSite=Lax' ou 'SameSite=Strict'.`,
      importance: "Sans SameSite restrictif, le navigateur joint ces cookies aux requ\xEAtes provenant de sites tiers, facilitant les attaques CSRF (Cross-Site Request Forgery).",
      recommendation: "D\xE9finissez '; SameSite=Lax' pour les cookies de navigation standard ou '; SameSite=Strict' pour les op\xE9rations critiques.",
      remediationSnippet: "Set-Cookie: session=...; SameSite=Lax; Secure; HttpOnly",
      cwe: "CWE-1275"
    });
  } else {
    findings.push({
      id: "cookie-samesite-pass",
      category: "cookies",
      categoryTitle: "Cookies",
      title: "Attribut 'SameSite' protecteur configur\xE9",
      severity: "low",
      status: "pass",
      description: "Tous les cookies restreignent leur envoi lors des requ\xEAtes inter-sites (Lax ou Strict).",
      importance: "Fournit une protection de premier ordre contre les falsifications de requ\xEAtes intersites (CSRF).",
      recommendation: "Maintenez la politique SameSite ad\xE9quate pour vos flux d'authentification.",
      detectedValue: `${cookies.length} cookie(s) avec SameSite prot\xE9g\xE9`
    });
  }
  return findings;
}

// ../scanner/dist/mixed-content.js
function detectMixedContent(htmlBody, isHttps) {
  const findings = [];
  if (!isHttps || !htmlBody) {
    findings.push({
      id: "mixed-content-skipped",
      category: "mixed_content",
      categoryTitle: "Contenu mixte",
      title: "Contr\xF4le de contenu mixte non applicable",
      severity: "info",
      status: "pass",
      description: "Le site n'est pas desservi en HTTPS ou le contenu HTML est indisponible.",
      importance: "Le contenu mixte ne concerne que les pages s\xE9curis\xE9es chargeant des sous-ressources non chiffr\xE9es.",
      recommendation: "Activez HTTPS avant d'\xE9valuer le contenu mixte."
    });
    return findings;
  }
  const insecureAssets = [];
  const tagPatterns = [
    { tag: "script", attr: "src", regex: /<script[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "link", attr: "href", regex: /<link[^>]+href=["'](http:\/\/[^"']+)["']/gi },
    { tag: "img", attr: "src", regex: /<img[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "iframe", attr: "src", regex: /<iframe[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "audio", attr: "src", regex: /<audio[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "video", attr: "src", regex: /<video[^>]+src=["'](http:\/\/[^"']+)["']/gi }
  ];
  for (const { tag, attr, regex } of tagPatterns) {
    let match;
    while ((match = regex.exec(htmlBody)) !== null) {
      if (match[1]) {
        insecureAssets.push({ tag, attr, url: match[1] });
      }
    }
  }
  if (insecureAssets.length > 0) {
    const sampleUrls = insecureAssets.slice(0, 3).map((a) => `<${a.tag} ${a.attr}="${a.url}">`).join("\n");
    const hasActiveMixed = insecureAssets.some((a) => a.tag === "script" || a.tag === "iframe");
    findings.push({
      id: "mixed-content-detected",
      category: "mixed_content",
      categoryTitle: "Contenu mixte",
      title: `${insecureAssets.length} ressource(s) HTTP non chiffr\xE9e(s) d\xE9tect\xE9e(s) sur page HTTPS`,
      severity: hasActiveMixed ? "high" : "medium",
      status: "fail",
      description: `La page HTTPS charge ${insecureAssets.length} ressource(s) non s\xE9curis\xE9e(s) via le protocole http://.`,
      importance: "Les navigateurs bloquent souvent le contenu mixte actif (scripts, iframes) ou d\xE9gradent l'indicateur de cadenas pour le contenu passif (images), avertissant les internautes d'une ins\xE9curit\xE9.",
      recommendation: "Remplacez toutes les URL 'http://' par des URL relatives ou 'https://', ou configurez la directive CSP 'upgrade-insecure-requests'.",
      remediationSnippet: "Content-Security-Policy: upgrade-insecure-requests;",
      detectedValue: sampleUrls,
      cwe: "CWE-311"
    });
  } else {
    findings.push({
      id: "mixed-content-pass",
      category: "mixed_content",
      categoryTitle: "Contenu mixte",
      title: "Aucun contenu mixte d\xE9tect\xE9",
      severity: "low",
      status: "pass",
      description: "Toutes les ressources observables (scripts, feuilles de styles, images, iframes) utilisent des liaisons chiffr\xE9es ou relatives.",
      importance: "Pr\xE9serve l'int\xE9grit\xE9 de l'exp\xE9rience HTTPS sans avertissement de cadenas cass\xE9.",
      recommendation: "Continuez d'imposer des liens HTTPS pour toutes les futures ressources tierces.",
      detectedValue: "0 ressource non chiffr\xE9e"
    });
  }
  return findings;
}

// ../scanner/dist/forms.js
function analyzeForms(htmlBody, currentUrl) {
  const findings = [];
  if (!htmlBody)
    return findings;
  const isCurrentHttps = currentUrl.protocol === "https:";
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  const forms = [];
  let match;
  while ((match = formRegex.exec(htmlBody)) !== null) {
    const formAttrs = match[1] || "";
    const formContent = match[2] || "";
    const actionMatch = formAttrs.match(/action=["']([^"']*)["']/i);
    const action = actionMatch ? actionMatch[1].trim() : "";
    const methodMatch = formAttrs.match(/method=["']([^"']*)["']/i);
    const method = (methodMatch ? methodMatch[1].trim() : "GET").toUpperCase();
    const hasPasswordInput = /<input[^>]+type=["']password["']/i.test(formContent);
    let targetIsHttp = false;
    if (action.startsWith("http://")) {
      targetIsHttp = true;
    } else if (action.startsWith("//")) {
      targetIsHttp = !isCurrentHttps;
    }
    forms.push({
      action,
      method,
      hasPasswordInput,
      isInsecureTarget: targetIsHttp
    });
  }
  if (forms.length === 0) {
    findings.push({
      id: "forms-none",
      category: "forms",
      categoryTitle: "Formulaires",
      title: "Aucun formulaire interactif d\xE9tect\xE9 sur la page analys\xE9e",
      severity: "info",
      status: "pass",
      description: "La page d'accueil ne comporte pas de balise <form> publique.",
      importance: "Aucune surface de soumission de donn\xE9es observ\xE9e sur cette page.",
      recommendation: "Si vous ajoutez des formulaires futurs, veillez \xE0 soumettre exclusivement vers des points de terminaison HTTPS prot\xE9g\xE9s par des jetons CSRF.",
      detectedValue: "0 formulaire"
    });
    return findings;
  }
  const insecureForms = forms.filter((f) => f.isInsecureTarget);
  if (insecureForms.length > 0) {
    const samples = insecureForms.map((f) => `<form action="${f.action}" method="${f.method}">`).join("\n");
    findings.push({
      id: "forms-insecure-action",
      category: "forms",
      categoryTitle: "Formulaires",
      title: `${insecureForms.length} formulaire(s) transmettant vers une destination HTTP non chiffr\xE9e`,
      severity: "critical",
      status: "fail",
      description: `Un ou plusieurs formulaires transmettent des donn\xE9es saisies vers une URL HTTP en clair : ${samples}`,
      importance: "Les identifiants, coordonn\xE9es ou donn\xE9es personnelles envoy\xE9es par les internautes transitent sans chiffrement et peuvent \xEAtre intercept\xE9s.",
      recommendation: "Modifiez l'attribut 'action' du formulaire pour cibler une URL HTTPS absolue ou un chemin relatif.",
      remediationSnippet: '<form action="/api/submit" method="POST">',
      detectedValue: samples,
      cwe: "CWE-319"
    });
  } else {
    findings.push({
      id: "forms-secure-action",
      category: "forms",
      categoryTitle: "Formulaires",
      title: "Actions de formulaires correctement s\xE9curis\xE9es",
      severity: "low",
      status: "pass",
      description: `Les ${forms.length} formulaire(s) d\xE9tect\xE9(s) transmettent leurs donn\xE9es via des URL relatives s\xE9curis\xE9es ou HTTPS.`,
      importance: "Garantit la confidentialit\xE9 des donn\xE9es saisies par les utilisateurs lors de leur envoi au serveur.",
      recommendation: "Assurez-vous que tous les points de terminaison POST appliquent \xE9galement une protection contre les attaques CSRF.",
      detectedValue: `${forms.length} formulaire(s) conforme(s)`
    });
  }
  const hasPasswordOverHttp = forms.some((f) => f.hasPasswordInput) && !isCurrentHttps;
  if (hasPasswordOverHttp) {
    findings.push({
      id: "forms-password-http",
      category: "forms",
      categoryTitle: "Formulaires",
      title: "Champ de mot de passe h\xE9berg\xE9 sur une page HTTP en clair",
      severity: "critical",
      status: "fail",
      description: "Un champ de mot de passe est pr\xE9sent sur une page servie en HTTP sans chiffrement.",
      importance: "Risque maximal d'interception d'identifiants de connexion en clair sur le r\xE9seau.",
      recommendation: "Migrez imm\xE9diatement la page d'authentification vers HTTPS.",
      cwe: "CWE-523"
    });
  }
  return findings;
}

// ../scanner/dist/technology.js
function detectTechnologies(headers, htmlBody) {
  const detections = [];
  const server = headers["server"];
  if (server) {
    detections.push({
      name: server.split("/")[0] || server,
      category: "serveur",
      version: server.includes("/") ? server.split("/")[1] : void 0,
      source: `En-t\xEAte HTTP Server: ${server}`
    });
  }
  const poweredBy = headers["x-powered-by"];
  if (poweredBy) {
    detections.push({
      name: poweredBy,
      category: "framework",
      source: `En-t\xEAte X-Powered-By: ${poweredBy}`
    });
  }
  if (headers["cf-ray"]) {
    detections.push({ name: "Cloudflare", category: "cdn", source: "En-t\xEAte CF-Ray" });
  }
  if (headers["x-vercel-id"]) {
    detections.push({ name: "Vercel", category: "cdn", source: "En-t\xEAte X-Vercel-Id" });
  }
  if (headers["x-amz-cf-id"] || headers["x-cache"]?.includes("CloudFront")) {
    detections.push({ name: "Amazon CloudFront", category: "cdn", source: "En-t\xEAte AWS CloudFront" });
  }
  if (htmlBody) {
    const metaGenMatch = htmlBody.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
    if (metaGenMatch && metaGenMatch[1]) {
      detections.push({
        name: metaGenMatch[1],
        category: "cms",
        source: `Balise meta generator: ${metaGenMatch[1]}`
      });
    }
    if (htmlBody.includes("/_next/") || htmlBody.includes("__NEXT_DATA__")) {
      detections.push({ name: "Next.js", category: "framework", source: "Ressources /_next/ et structure DOM" });
    }
    if (htmlBody.includes("wp-content") || htmlBody.includes("wp-includes")) {
      detections.push({ name: "WordPress", category: "cms", source: "Chemins wp-content / wp-includes" });
    }
    if (htmlBody.includes("Shopify.theme")) {
      detections.push({ name: "Shopify", category: "cms", source: "Objets Shopify" });
    }
    if (htmlBody.includes("drupal.js") || htmlBody.includes("Drupal.settings")) {
      detections.push({ name: "Drupal", category: "cms", source: "Scripts Drupal" });
    }
    if (htmlBody.includes("gatsby")) {
      detections.push({ name: "Gatsby", category: "framework", source: "Identifiants Gatsby" });
    }
    if (htmlBody.includes("nuxt") || htmlBody.includes("__NUXT__")) {
      detections.push({ name: "Nuxt", category: "framework", source: "Structure Nuxt" });
    }
  }
  const uniqueNames = Array.from(new Set(detections.map((d) => d.name)));
  const findings = [];
  if (uniqueNames.length > 0) {
    findings.push({
      id: "tech-detected-info",
      category: "technology",
      categoryTitle: "Technologies expos\xE9es",
      title: `Technologies d\xE9tect\xE9es : ${uniqueNames.join(", ")}`,
      severity: "info",
      status: "pass",
      description: `L'analyse passive a identifi\xE9 les composants suivants via les en-t\xEAtes ou balises publiques : ${detections.map((d) => `${d.name} (${d.source})`).join(", ")}.`,
      importance: "Information d'exposition technique (fingerprinting). La d\xE9tection d'une technologie ou d'un framework n'est en aucun cas une vuln\xE9rabilit\xE9 en soi.",
      recommendation: "Il est n\xE9anmoins recommand\xE9 de masquer les versions d\xE9taill\xE9es dans les en-t\xEAtes (ex: 'ServerTokens Prod' sur Apache ou 'server_tokens off;' sur Nginx) afin de ne pas faciliter la reconnaissance automatis\xE9e par des attaquants.",
      remediationSnippet: "# Nginx\nserver_tokens off;\n\n# Apache\nServerTokens Prod\nServerSignature Off",
      detectedValue: uniqueNames.join(" \u2022 ")
    });
  } else {
    findings.push({
      id: "tech-none-exposed",
      category: "technology",
      categoryTitle: "Technologies expos\xE9es",
      title: "Empreinte technologique minimale (Banni\xE8re masqu\xE9e)",
      severity: "info",
      status: "pass",
      description: "Aucun en-t\xEAte r\xE9v\xE9lateur (Server, X-Powered-By) ou m\xE9ta de g\xE9n\xE9rateur n'a divulgu\xE9 de d\xE9tails sur l'infrastructure sous-jacente.",
      importance: "R\xE9duit les informations utiles aux robots de reconnaissance.",
      recommendation: "Conservez cette politique de discr\xE9tion sur l'ensemble de votre infrastructure.",
      detectedValue: "Aucune signature \xE9vidente"
    });
  }
  if (poweredBy) {
    findings.push({
      id: "tech-xpoweredby-exposed",
      category: "technology",
      categoryTitle: "Technologies expos\xE9es",
      title: "En-t\xEAte 'X-Powered-By' divulgu\xE9",
      severity: "low",
      status: "warning",
      description: `L'en-t\xEAte 'X-Powered-By: ${poweredBy}' est renvoy\xE9 dans la r\xE9ponse HTTP.`,
      importance: "Divulgue inutilement la technologie backend aux tiers. Bien que non vuln\xE9rable directement, cela facilite le ciblage.",
      recommendation: "D\xE9sactivez l'en-t\xEAte 'X-Powered-By' dans votre configuration de serveur ou middleware.",
      remediationSnippet: "// Express.js\napp.disable('x-powered-by');\n\n// next.config.ts\nmodule.exports = { poweredByHeader: false };",
      detectedValue: poweredBy
    });
  }
  return {
    technologies: uniqueNames,
    findings
  };
}

// ../scanner/dist/rules.js
var SEVERITY_WEIGHTS = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0
};
var SEVERITY_ORDER = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
  info: 5
};
function sortFindings(findings) {
  return [...findings].sort((a, b) => {
    const statusScore = (s) => s === "fail" ? 1 : s === "warning" ? 2 : 3;
    const diffStatus = statusScore(a.status) - statusScore(b.status);
    if (diffStatus !== 0)
      return diffStatus;
    const diffSev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (diffSev !== 0)
      return diffSev;
    return a.title.localeCompare(b.title);
  });
}
function computeScanScore(findings) {
  let penalty = 0;
  for (const finding of findings) {
    if (finding.status === "fail") {
      penalty += SEVERITY_WEIGHTS[finding.severity];
    } else if (finding.status === "warning") {
      penalty += Math.round(SEVERITY_WEIGHTS[finding.severity] * 0.4);
    }
  }
  const score = Math.max(0, Math.min(100, 100 - penalty));
  let status;
  let grade;
  let summary;
  if (score >= 90) {
    status = "excellent";
    grade = score >= 95 ? "A+" : "A";
    summary = "Excellente posture de s\xE9curit\xE9 p\xE9rim\xE9trique. Vos en-t\xEAtes et protocoles respectent rigoureusement les recommandations de l'OWASP.";
  } else if (score >= 75) {
    status = "good";
    grade = score >= 82 ? "B+" : "B";
    summary = "Bonne posture de s\xE9curit\xE9 globale avec quelques \xE9carts de configuration ou en-t\xEAtes d\xE9fensifs recommand\xE9s \xE0 consolider.";
  } else if (score >= 50) {
    status = "warning";
    grade = "C";
    summary = "Posture de s\xE9curit\xE9 interm\xE9diaire avec des vuln\xE9rabilit\xE9s de configuration expos\xE9es (CSP ou protections cross-origin absentes).";
  } else {
    status = "critical";
    grade = "F";
    summary = "Risque critique identifi\xE9 : absence de HTTPS valide ou manque flagrant des principaux m\xE9canismes d\xE9fensifs contre les injections.";
  }
  return { score, status, grade, summary };
}
function buildCategorySummaries(findings) {
  const categoriesConfig = {
    https: { title: "HTTPS & Transport" },
    headers: { title: "En-t\xEAtes de s\xE9curit\xE9" },
    cookies: { title: "Cookies" },
    mixed_content: { title: "Contenu mixte" },
    forms: { title: "Formulaires" },
    technology: { title: "Technologies expos\xE9es" }
  };
  const summaries = {};
  for (const [catKey, meta] of Object.entries(categoriesConfig)) {
    const cat = catKey;
    const catFindings = findings.filter((f) => f.category === cat);
    const total = catFindings.length;
    const passed = catFindings.filter((f) => f.status === "pass").length;
    let catScore = 100;
    if (total > 0) {
      let penalty = 0;
      for (const f of catFindings) {
        if (f.status === "fail") {
          penalty += f.severity === "critical" ? 40 : f.severity === "high" ? 25 : 15;
        } else if (f.status === "warning") {
          penalty += 10;
        }
      }
      catScore = Math.max(0, 100 - penalty);
    }
    const worstStatus = catFindings.some((f) => f.status === "fail") ? "fail" : catFindings.some((f) => f.status === "warning") ? "warning" : "pass";
    summaries[cat] = {
      category: cat,
      title: meta.title,
      score: catScore,
      status: worstStatus,
      passedCount: passed,
      totalCount: total
    };
  }
  return summaries;
}

// ../scanner/dist/scanner.js
import crypto from "node:crypto";
async function runSecurityScan(target) {
  const scanId = `scn_${crypto.randomBytes(6).toString("hex")}`;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const isHttps = target.parsedUrl.protocol === "https:";
  const hostname = target.hostname;
  const fallbackTls = { valid: false, error: "Protocole non HTTPS" };
  const [tlsAudit, httpRedirect, httpResponse] = await Promise.all([
    isHttps ? inspectTlsCertificate(hostname) : Promise.resolve(fallbackTls),
    checkHttpToHttpsRedirect(hostname),
    fetchWithSecurityLimits(target.normalizedUrl)
  ]);
  const allFindings = [];
  const httpsFindings = analyzeHttps(target.parsedUrl, tlsAudit, httpRedirect);
  allFindings.push(...httpsFindings);
  const headerFindings = analyzeSecurityHeaders(httpResponse.rawHeaders);
  allFindings.push(...headerFindings);
  const cookieFindings = analyzeCookies(httpResponse.setCookieHeaders, isHttps);
  allFindings.push(...cookieFindings);
  const mixedContentFindings = detectMixedContent(httpResponse.body, isHttps);
  allFindings.push(...mixedContentFindings);
  const formFindings = analyzeForms(httpResponse.body, target.parsedUrl);
  allFindings.push(...formFindings);
  const { technologies, findings: techFindings } = detectTechnologies(httpResponse.rawHeaders, httpResponse.body);
  allFindings.push(...techFindings);
  const sortedFindings = sortFindings(allFindings);
  const { score, status, grade, summary } = computeScanScore(sortedFindings);
  const categorySummaries = buildCategorySummaries(sortedFindings);
  const passed = sortedFindings.filter((f) => f.status === "pass").length;
  const warning = sortedFindings.filter((f) => f.status === "warning").length;
  const critical = sortedFindings.filter((f) => f.status === "fail").length;
  const telemetry = {
    ip: target.ip,
    serverHeader: httpResponse.rawHeaders["server"] || "Masqu\xE9 / Non d\xE9clar\xE9",
    tlsVersion: tlsAudit.version || (isHttps ? "TLS 1.2+" : "Non chiffr\xE9"),
    tlsCipher: tlsAudit.cipher,
    certValidUntil: tlsAudit.validTo,
    certDaysRemaining: tlsAudit.daysRemaining,
    certIssuer: tlsAudit.issuer,
    alpn: tlsAudit.alpn,
    dnssec: false,
    // DNSSEC flag can be noted
    resolvedAt: timestamp,
    latencyMs: httpResponse.latencyMs,
    technologies
  };
  return {
    id: scanId,
    url: target.normalizedUrl,
    domain: hostname,
    protocol: isHttps ? "https:" : "http:",
    timestamp,
    score,
    status,
    grade,
    summary,
    stats: {
      passed,
      warning,
      critical,
      total: sortedFindings.length
    },
    telemetry,
    categories: categorySummaries,
    findings: sortedFindings
  };
}

// src/ui/json-report.ts
function formatJsonReport(result) {
  return JSON.stringify(
    {
      id: result.id,
      url: result.url,
      domain: result.domain,
      protocol: result.protocol,
      timestamp: result.timestamp,
      score: result.score,
      status: result.status,
      grade: result.grade,
      summary: result.summary,
      stats: result.stats,
      telemetry: result.telemetry,
      categories: result.categories,
      findings: result.findings.map((f) => ({
        id: f.id,
        category: f.category,
        title: f.title,
        severity: f.severity,
        status: f.status,
        description: f.description,
        importance: f.importance,
        recommendation: f.recommendation,
        detectedValue: f.detectedValue,
        cwe: f.cwe
      }))
    },
    null,
    2
  );
}

// src/ui/colors.ts
var supportsColor = () => {
  if (process.env.NO_COLOR !== void 0) return false;
  if (process.env.FORCE_COLOR !== void 0) return true;
  return Boolean(process.stdout.isTTY);
};
var enabled = supportsColor();
var wrap = (open, close) => (str) => {
  if (!enabled) return String(str);
  return `\x1B[${open}m${str}\x1B[${close}m`;
};
var c = {
  reset: wrap(0, 0),
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  italic: wrap(3, 23),
  underline: wrap(4, 24),
  // Colors
  black: wrap(30, 39),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  white: wrap(37, 39),
  gray: wrap(90, 39),
  // Custom styled accents
  brand: (str) => wrap(34, 39)(c.bold(str)),
  success: (str) => wrap(32, 39)(str),
  warning: (str) => wrap(33, 39)(str),
  error: (str) => wrap(31, 39)(str),
  muted: (str) => wrap(90, 39)(str),
  highlight: (str) => wrap(36, 39)(c.bold(str))
};

// src/ui/report.ts
var HR = c.gray("\u2500".repeat(50));
function printScanReport(result) {
  console.log();
  console.log(` ${c.bold("Analyse de")} ${c.highlight(result.url)}`);
  if (result.telemetry.ip) {
    console.log(` ${c.muted(`IP : ${result.telemetry.ip} \u2022 Latence : ${result.telemetry.latencyMs}ms \u2022 Serveur : ${result.telemetry.serverHeader || "Inconnu"}`)}`);
  }
  console.log();
  const categoryOrder = [
    { key: "https", title: "HTTPS & Transport" },
    { key: "headers", title: "En-t\xEAtes de s\xE9curit\xE9" },
    { key: "cookies", title: "Cookies" },
    { key: "mixed_content", title: "Contenu mixte" },
    { key: "forms", title: "Formulaires" },
    { key: "technology", title: "Technologies expos\xE9es" }
  ];
  for (const { key, title } of categoryOrder) {
    const categoryFindings = result.findings.filter((f) => f.category === key);
    if (categoryFindings.length === 0) continue;
    console.log(` ${c.dim("\u25CF")} ${c.bold(title)}`);
    for (const f of categoryFindings) {
      printFindingLine(f);
    }
    console.log();
  }
  console.log(` ${HR}`);
  const scoreColor = result.score >= 80 ? c.green : result.score >= 60 ? c.yellow : c.red;
  const statusLabel = result.status === "excellent" ? "Excellent" : result.status === "good" ? "Bon" : result.status === "warning" ? "Attention requise" : "Critique";
  console.log();
  console.log(` ${c.bold("Score de s\xE9curit\xE9 :")} ${scoreColor(c.bold(`${result.score}/100`))} ${c.muted(`(Note : ${result.grade})`)}`);
  console.log(` ${c.bold("Statut :")} ${scoreColor(statusLabel)}`);
  const issueCount = result.stats.warning + result.stats.critical;
  if (issueCount === 0) {
    console.log(`
 ${c.green("\u2713")} ${c.bold("F\xE9licitations ! Aucun probl\xE8me de s\xE9curit\xE9 passif d\xE9tect\xE9.")}`);
  } else {
    const issueText = issueCount === 1 ? "1 probl\xE8me n\xE9cessite" : `${issueCount} probl\xE8mes n\xE9cessitent`;
    console.log(`
 ${c.yellow("\u26A0")} ${c.bold(`${issueText} votre attention.`)}`);
  }
  console.log();
  console.log(` ${HR}`);
  const issues = result.findings.filter((f) => f.status === "fail" || f.status === "warning");
  if (issues.length > 0) {
    console.log();
    console.log(` ${c.bold("D\xE9tails et recommandations d'optimisation :")}`);
    console.log();
    for (const issue of issues) {
      const icon = issue.status === "fail" ? c.red("\u2717") : c.yellow("\u26A0");
      const badge = issue.status === "fail" ? c.red("[CRITIQUE]") : c.yellow("[AVERTISSEMENT]");
      console.log(` ${icon} ${c.bold(issue.title)} ${c.muted(badge)}`);
      console.log(`   ${issue.description}`);
      if (issue.detectedValue) {
        console.log(`   ${c.muted("Valeur d\xE9tect\xE9e :")} ${c.cyan(issue.detectedValue)}`);
      }
      if (issue.importance) {
        console.log(`
   ${c.bold("Pourquoi ?")}`);
        console.log(`   ${c.dim(issue.importance)}`);
      }
      if (issue.recommendation) {
        console.log(`
   ${c.bold("Comment corriger ?")}`);
        console.log(`   ${issue.recommendation}`);
      }
      if (issue.remediationSnippet) {
        console.log(`
   ${c.muted("Exemple de configuration :")}`);
        for (const line of issue.remediationSnippet.split("\n")) {
          console.log(`     ${c.cyan(line)}`);
        }
      }
      if (issue.cwe) {
        console.log(`
   ${c.muted(`R\xE9f\xE9rence : ${issue.cwe}`)}`);
      }
      console.log();
    }
    console.log(` ${HR}`);
  }
  console.log(`
 ${c.muted("Analyse passive Securio \u2022 Aucun test intrusif effectu\xE9.")}
`);
}
function printFindingLine(finding) {
  let icon;
  let text = finding.title;
  switch (finding.status) {
    case "pass":
      icon = c.green("\u2713");
      break;
    case "warning":
      icon = c.yellow("\u26A0");
      break;
    case "fail":
      icon = c.red("\u2717");
      break;
    default:
      icon = c.cyan("\u2139");
  }
  if (finding.status === "pass") {
    console.log(`   ${icon} ${text}`);
  } else {
    console.log(`   ${icon} ${c.bold(text)}`);
  }
}

// src/ui/spinner.ts
var Spinner = class {
  frames = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
  currentFrame = 0;
  timer = null;
  text = "";
  isTTY = Boolean(process.stdout.isTTY);
  constructor(initialText = "") {
    this.text = initialText;
  }
  start(message) {
    if (message) this.text = message;
    if (!this.isTTY) {
      if (this.text) console.log(` ${c.cyan("\u2022")} ${this.text}`);
      return this;
    }
    process.stdout.write("\x1B[?25l");
    this.render();
    this.timer = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.render();
    }, 80);
    return this;
  }
  update(message) {
    this.text = message;
    if (this.isTTY) {
      this.render();
    }
    return this;
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.isTTY) {
      process.stdout.write("\r\x1B[2K");
      process.stdout.write("\x1B[?25h");
    }
  }
  succeed(message) {
    this.stop();
    console.log(` ${c.green("\u2713")} ${message}`);
  }
  warn(message) {
    this.stop();
    console.log(` ${c.yellow("\u26A0")} ${message}`);
  }
  fail(message) {
    this.stop();
    console.log(` ${c.red("\u2717")} ${message}`);
  }
  render() {
    const frame = c.cyan(this.frames[this.currentFrame]);
    process.stdout.write(`\r ${frame} ${this.text}`);
  }
};

// src/utils/exit-codes.ts
var EXIT_SUCCESS = 0;
var EXIT_SECURITY_ISSUE = 1;
var EXIT_ERROR = 2;

// src/commands/scan.ts
async function runScanCommand(rawTarget, options = {}) {
  const isJson = Boolean(options.json);
  const spinner = new Spinner();
  if (!isJson) {
    spinner.start("Validation de l'URL et contr\xF4le de s\xE9curit\xE9 SSRF...");
  }
  const targetResult = await validateAndResolveTarget(rawTarget);
  if (!targetResult.success) {
    if (isJson) {
      console.error(JSON.stringify({ error: targetResult.error }));
    } else {
      spinner.fail(`Cible invalide : ${targetResult.error}`);
    }
    return EXIT_ERROR;
  }
  const { target } = targetResult;
  if (!isJson) {
    spinner.update(`Analyse des en-t\xEAtes, certificats et cookies de ${c.bold(target.hostname)}...`);
  }
  let scanResult;
  try {
    scanResult = await runSecurityScan(target);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Erreur inattendue durant l'audit.";
    if (isJson) {
      console.error(JSON.stringify({ error: errorMsg }));
    } else {
      spinner.fail(`\xC9chec de l'analyse : ${errorMsg}`);
    }
    return EXIT_ERROR;
  }
  if (isJson) {
    console.log(formatJsonReport(scanResult));
  } else {
    spinner.succeed(`Analyse passive termin\xE9e avec succ\xE8s pour ${c.bold(target.hostname)}`);
    printScanReport(scanResult);
  }
  if (scanResult.stats.critical > 0) {
    return EXIT_SECURITY_ISSUE;
  }
  return EXIT_SUCCESS;
}

// src/input/prompt.ts
import readline from "node:readline";
async function promptForUrl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    console.log(` ${c.cyan("?")} ${c.bold("Quelle URL souhaitez-vous analyser :")}`);
    rl.question(` ${c.cyan("\u203A")} `, (answer) => {
      rl.close();
      console.log();
      resolve(answer.trim());
    });
  });
}

// src/utils/version.ts
var CLI_VERSION = "0.1.0";

// src/ui/banner.ts
var BANNER_LINES = [
  " \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 ",
  " \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557",
  " \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551",
  " \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551",
  " \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D",
  " \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D "
];
async function displayBanner(animated = false) {
  const isInteractive = Boolean(process.stdout.isTTY) && animated;
  if (!isInteractive) {
    console.log();
    for (const line of BANNER_LINES) {
      console.log(c.cyan(line));
    }
    console.log(`
 ${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}`);
    console.log(` ${c.muted("Security made visible.")}
`);
    return;
  }
  console.log();
  for (const line of BANNER_LINES) {
    console.log(c.cyan(line));
    await new Promise((r) => setTimeout(r, 20));
  }
  await new Promise((r) => setTimeout(r, 40));
  console.log(`
 ${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}`);
  console.log(` ${c.muted("Security made visible.")}
`);
}

// src/cli.ts
function printHelp() {
  console.log(`
${c.bold("Securio CLI")} ${c.muted(`v${CLI_VERSION}`)}
${c.muted("Analyseur de s\xE9curit\xE9 web passive pour d\xE9veloppeurs")}

${c.bold("UTILISATION")}
  ${c.cyan("$")} npx securio [options] [url]
  ${c.cyan("$")} securio [options] [url]

${c.bold("ARGUMENTS")}
  ${c.highlight("url")}                 L'adresse du site web \xE0 analyser (ex: https://example.com)
                      Si omise, le mode interactif d\xE9marre automatiquement.

${c.bold("OPTIONS")}
  ${c.highlight("--json")}              Sortie au format JSON pour l'int\xE9gration CI/CD
  ${c.highlight("--no-banner")}         Masquer la banni\xE8re d'en-t\xEAte
  ${c.highlight("-h, --help")}          Afficher ce message d'aide
  ${c.highlight("-v, --version")}       Afficher le num\xE9ro de version

${c.bold("CODES DE SORTIE (CI/CD)")}
  ${c.green("0")}   Analyse r\xE9ussie, aucun probl\xE8me de s\xE9curit\xE9 critique
  ${c.yellow("1")}   Probl\xE8me de s\xE9curit\xE9 majeur d\xE9tect\xE9 (au moins un test 'fail')
  ${c.red("2")}   Erreur d'ex\xE9cution, cible inaccessible ou argument invalide

${c.bold("EXEMPLES")}
  ${c.cyan("$")} securio https://example.com
  ${c.cyan("$")} securio --json https://example.com > audit.json
  ${c.cyan("$")} npx securio-cli
`);
}
async function main() {
  const args = process.argv.slice(2);
  let targetUrl = null;
  let isJson = false;
  let showBanner = true;
  for (const arg of args) {
    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(EXIT_SUCCESS);
    }
    if (arg === "-v" || arg === "--version") {
      console.log(`securio-cli v${CLI_VERSION}`);
      process.exit(EXIT_SUCCESS);
    }
    if (arg === "--json") {
      isJson = true;
      showBanner = false;
      continue;
    }
    if (arg === "--no-banner") {
      showBanner = false;
      continue;
    }
    if (!arg.startsWith("-") && !targetUrl) {
      targetUrl = arg;
    }
  }
  if (!targetUrl) {
    if (isJson) {
      console.error(JSON.stringify({ error: "Une URL cible est obligatoire lorsque l'option --json est utilis\xE9e." }));
      process.exit(EXIT_ERROR);
    }
    if (showBanner) {
      await displayBanner(true);
    }
    const input = await promptForUrl();
    if (!input) {
      console.error(` ${c.red("\u2717")} Aucune URL sp\xE9cifi\xE9e. Abandon.`);
      process.exit(EXIT_ERROR);
    }
    targetUrl = input;
  } else if (showBanner) {
    await displayBanner(false);
  }
  const exitCode = await runScanCommand(targetUrl, { json: isJson });
  process.exit(exitCode);
}
main().catch((err) => {
  console.error(err);
  process.exit(EXIT_ERROR);
});
