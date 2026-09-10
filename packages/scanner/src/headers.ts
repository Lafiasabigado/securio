import type { Finding } from "./types.js";

export function analyzeSecurityHeaders(headers: Record<string, string>): Finding[] {
  const findings: Finding[] = [];

  // 1. Content-Security-Policy (CSP)
  const csp = headers["content-security-policy"];
  if (!csp) {
    findings.push({
      id: "header-csp-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Content-Security-Policy (CSP) est absent",
      severity: "high",
      status: "fail",
      description: "La réponse HTTP ne définit pas d'en-tête Content-Security-Policy.",
      importance: "Sans CSP, le navigateur exécute aveuglément tout script injecté, exposant votre site aux attaques par Cross-Site Scripting (XSS) et vol de session.",
      recommendation: "Définissez un en-tête Content-Security-Policy strict limitant les sources de scripts, styles et objets autorisés.",
      remediationSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none'; base-uri 'self';",
      referenceLinks: [
        { title: "Guide CSP MDN", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/CSP" },
        { title: "Aide-mémoire OWASP CSP", url: "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html" },
      ],
      cwe: "CWE-693",
    });
  } else {
    // Inspect CSP script directives for script execution weaknesses (XSS)
    const scriptDirectiveMatch = csp.match(/script-src([^;]+)/i);
    const defaultDirectiveMatch = csp.match(/default-src([^;]+)/i);
    const scriptDirectives = scriptDirectiveMatch
      ? scriptDirectiveMatch[1]
      : defaultDirectiveMatch
      ? defaultDirectiveMatch[1]
      : "";

    const hasWildcardScript = scriptDirectives.includes("*");
    const hasHttpScript = /http:\/\//i.test(scriptDirectives);

    if (hasWildcardScript || hasHttpScript) {
      findings.push({
        id: "header-csp-permissive",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Content-Security-Policy affaibli (wildcard '*' ou protocole HTTP détecté)",
        severity: "medium",
        status: "warning",
        description: "L'en-tête CSP est présent mais contient des directives très permissives (wildcard * ou protocoles HTTP non chiffrés).",
        importance: "L'utilisation de wildcards réduit considérablement la protection offerte par le CSP contre les attaques XSS.",
        recommendation: "Restreignez les sources de scripts aux domaines d'origine ('self') et aux services sécurisés HTTPS.",
        remediationSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' https:;",
        detectedValue: csp.length > 80 ? `${csp.substring(0, 80)}...` : csp,
        cwe: "CWE-1021",
      });
    } else {
      findings.push({
        id: "header-csp-pass",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Content-Security-Policy configuré avec rigueur",
        severity: "low",
        status: "pass",
        description: "Une politique de sécurité de contenu restreignant l'exécution de ressources non autorisées est en place.",
        importance: "Bloque activement les attaques par injection de script XSS et les charges malveillantes non signées.",
        recommendation: "Poursuivez la surveillance de vos directives CSP et envisagez le reporting avec 'report-to'.",
        detectedValue: csp.length > 80 ? `${csp.substring(0, 80)}...` : csp,
      });
    }
  }

  // 2. Strict-Transport-Security (HSTS)
  const hsts = headers["strict-transport-security"];
  if (!hsts) {
    findings.push({
      id: "header-hsts-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Strict-Transport-Security (HSTS) est absent",
      severity: "high",
      status: "fail",
      description: "L'en-tête Strict-Transport-Security n'est pas envoyé par le serveur.",
      importance: "Sans HSTS, un attaquant sur le même réseau (Wi-Fi public) peut rétrograder la connexion en HTTP clair via une attaque SSL-Stripping.",
      recommendation: "Activez HSTS avec un max-age d'au moins 1 an (31536000 secondes), incluez les sous-domaines et envisagez le préchargement.",
      remediationSnippet: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
      referenceLinks: [
        { title: "MDN HSTS", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Strict-Transport-Security" },
      ],
      cwe: "CWE-319",
    });
  } else {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 0;
    const hasSubDomains = /includesubdomains/i.test(hsts);
    const hasPreload = /preload/i.test(hsts);

    if (maxAge < 15552000) {
      // Less than 180 days
      findings.push({
        id: "header-hsts-short-maxage",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Durée de validité HSTS insuffisante (max-age faible)",
        severity: "medium",
        status: "warning",
        description: `L'en-tête HSTS est présent mais avec une durée d'expiration de ${maxAge} secondes (inférieure aux 6 mois recommandés).`,
        importance: "Une durée trop courte ne protège pas efficacement les utilisateurs réguliers contre les attaques de dégradation.",
        recommendation: "Augmentez le paramètre max-age à 31536000 (1 an) et activez includeSubDomains.",
        remediationSnippet: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        detectedValue: hsts,
      });
    } else {
      findings.push({
        id: "header-hsts-pass",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Strict-Transport-Security (HSTS) est correctement configuré",
        severity: "low",
        status: "pass",
        description: `HSTS est actif avec max-age=${maxAge}${hasSubDomains ? "; includeSubDomains" : ""}${hasPreload ? "; preload" : ""}.`,
        importance: "Force le navigateur à communiquer exclusivement par canal HTTPS sécurisé.",
        recommendation: "Maintenez la directive active et assurez-vous que tous vos sous-domaines supportent HTTPS.",
        detectedValue: hsts,
      });
    }
  }

  // 3. X-Content-Type-Options
  const xcto = headers["x-content-type-options"];
  if (!xcto || !xcto.toLowerCase().includes("nosniff")) {
    findings.push({
      id: "header-xcto-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "X-Content-Type-Options: nosniff est manquant",
      severity: "medium",
      status: "warning",
      description: "L'en-tête X-Content-Type-Options n'est pas configuré sur 'nosniff'.",
      importance: "Permet aux navigateurs d'effectuer du reniflage MIME ('MIME-sniffing') et d'interpréter des fichiers non exécutables comme du code malveillant.",
      recommendation: "Ajoutez l'en-tête 'X-Content-Type-Options: nosniff' sur toutes les réponses.",
      remediationSnippet: "X-Content-Type-Options: nosniff",
      referenceLinks: [
        { title: "MDN X-Content-Type-Options", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/X-Content-Type-Options" },
      ],
      cwe: "CWE-79",
    });
  } else {
    findings.push({
      id: "header-xcto-pass",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "X-Content-Type-Options est configuré sur nosniff",
      severity: "low",
      status: "pass",
      description: "Le reniflage de types MIME est explicitement désactivé pour tous les types de contenu.",
      importance: "Empêche l'exécution de scripts dissimulés dans des images ou fichiers texte.",
      recommendation: "Conservez cette configuration standard sur l'ensemble de vos serveurs web.",
      detectedValue: xcto,
    });
  }

  // 4. X-Frame-Options (or CSP frame-ancestors)
  const xfo = headers["x-frame-options"]?.toUpperCase();
  const hasCspFrameAncestors = csp && /frame-ancestors/i.test(csp);

  if (!xfo && !hasCspFrameAncestors) {
    findings.push({
      id: "header-xfo-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Protection contre le clickjacking absente (X-Frame-Options / frame-ancestors)",
      severity: "medium",
      status: "warning",
      description: "Aucun en-tête X-Frame-Options ni directive CSP frame-ancestors n'a été détecté.",
      importance: "Le site peut être encapsulé dans une balise <iframe> tierce pour tromper les utilisateurs et voler des clics (clickjacking).",
      recommendation: "Configurez 'X-Frame-Options: DENY' ou 'SAMEORIGIN', ou définissez la directive CSP 'frame-ancestors 'self''.",
      remediationSnippet: "X-Frame-Options: SAMEORIGIN",
      referenceLinks: [
        { title: "OWASP Clickjacking Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html" },
      ],
      cwe: "CWE-1021",
    });
  } else {
    const val = xfo || "Couvert par CSP frame-ancestors";
    findings.push({
      id: "header-xfo-pass",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Protection anti-clickjacking active",
      severity: "low",
      status: "pass",
      description: `L'affichage au sein de cadres ou iframes tiers est restreint (${val}).`,
      importance: "Neutralise les attaques de détournement de clics et l'intégration non consentie sur des sites malveillants.",
      recommendation: "Privilégiez la directive CSP frame-ancestors moderne en complément de X-Frame-Options.",
      detectedValue: val,
    });
  }

  // 5. Referrer-Policy
  const refPolicy = headers["referrer-policy"];
  const safeReferrers = [
    "no-referrer",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "same-origin",
    "origin-when-cross-origin",
  ];

  if (!refPolicy) {
    findings.push({
      id: "header-referrer-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Referrer-Policy n'est pas explicitement défini",
      severity: "low",
      status: "warning",
      description: "L'en-tête Referrer-Policy n'est pas renseigné (le navigateur appliquera son comportement par défaut).",
      importance: "Des paramètres sensibles d'URL (jetons, identifiants) peuvent fuiter vers des domaines tiers lors d'un clic sur un lien externe.",
      recommendation: "Définissez 'Referrer-Policy: strict-origin-when-cross-origin' pour protéger la confidentialité des URL internes.",
      remediationSnippet: "Referrer-Policy: strict-origin-when-cross-origin",
      referenceLinks: [
        { title: "MDN Referrer-Policy", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Referrer-Policy" },
      ],
      cwe: "CWE-200",
    });
  } else {
    const isSafe = safeReferrers.some((sr) => refPolicy.toLowerCase().includes(sr));
    if (isSafe) {
      findings.push({
        id: "header-referrer-pass",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Politique de référent (Referrer-Policy) sécurisée",
        severity: "low",
        status: "pass",
        description: `L'en-tête Referrer-Policy est configuré (${refPolicy}).`,
        importance: "Prévient la fuite d'informations de navigation sensibles vers les sites externes.",
        recommendation: "Conservez cette configuration stricte.",
        detectedValue: refPolicy,
      });
    } else {
      findings.push({
        id: "header-referrer-unsafe",
        category: "headers",
        categoryTitle: "En-têtes de sécurité",
        title: "Referrer-Policy permissif ('unsafe-url')",
        severity: "medium",
        status: "warning",
        description: `L'en-tête Referrer-Policy est défini sur '${refPolicy}', transmettant l'intégralité du chemin et des paramètres aux tiers.`,
        importance: "Risque de divulgation involontaire de paramètres d'URL confidentiels.",
        recommendation: "Remplacez la directive par 'strict-origin-when-cross-origin'.",
        remediationSnippet: "Referrer-Policy: strict-origin-when-cross-origin",
        detectedValue: refPolicy,
      });
    }
  }

  // 6. Permissions-Policy
  const permPolicy = headers["permissions-policy"];
  if (!permPolicy) {
    findings.push({
      id: "header-permissions-missing",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Permissions-Policy n'est pas configuré",
      severity: "low",
      status: "warning",
      description: "L'en-tête Permissions-Policy (anciennement Feature-Policy) n'est pas défini.",
      importance: "Permet de désactiver proactivement les API du navigateur non utilisées (caméra, microphone, géolocalisation, accéléromètre) pour éviter leur exploitation.",
      recommendation: "Ajoutez un en-tête Permissions-Policy restreignant l'accès aux capteurs et fonctionnalités matérielles.",
      remediationSnippet: "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
      referenceLinks: [
        { title: "MDN Permissions-Policy", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Permissions-Policy" },
      ],
    });
  } else {
    findings.push({
      id: "header-permissions-pass",
      category: "headers",
      categoryTitle: "En-têtes de sécurité",
      title: "Permissions-Policy est en place",
      severity: "low",
      status: "pass",
      description: "Les fonctionnalités matérielles et API sensibles du navigateur sont contrôlées par une politique stricte.",
      importance: "Réduit la surface d'attaque en bloquant les capteurs matériels non requis par l'application.",
      recommendation: "Vérifiez régulièrement que seules les API strictement indispensables sont autorisées.",
      detectedValue: permPolicy.length > 80 ? `${permPolicy.substring(0, 80)}...` : permPolicy,
    });
  }

  return findings;
}
