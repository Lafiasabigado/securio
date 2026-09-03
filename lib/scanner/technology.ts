import type { Finding } from "./types";

export interface TechDetection {
  name: string;
  category: "serveur" | "framework" | "cms" | "cdn" | "bibliothèque";
  version?: string;
  source: string;
}

export function detectTechnologies(headers: Record<string, string>, htmlBody: string): {
  technologies: string[];
  findings: Finding[];
} {
  const detections: TechDetection[] = [];

  // 1. Server Header
  const server = headers["server"];
  if (server) {
    detections.push({
      name: server.split("/")[0] || server,
      category: "serveur",
      version: server.includes("/") ? server.split("/")[1] : undefined,
      source: `En-tête HTTP Server: ${server}`,
    });
  }

  // 2. X-Powered-By
  const poweredBy = headers["x-powered-by"];
  if (poweredBy) {
    detections.push({
      name: poweredBy,
      category: "framework",
      source: `En-tête X-Powered-By: ${poweredBy}`,
    });
  }

  // 3. Cloudflare / Fastly / Vercel / AWS headers
  if (headers["cf-ray"]) {
    detections.push({ name: "Cloudflare", category: "cdn", source: "En-tête CF-Ray" });
  }
  if (headers["x-vercel-id"]) {
    detections.push({ name: "Vercel", category: "cdn", source: "En-tête X-Vercel-Id" });
  }
  if (headers["x-amz-cf-id"] || headers["x-cache"]?.includes("CloudFront")) {
    detections.push({ name: "Amazon CloudFront", category: "cdn", source: "En-tête AWS CloudFront" });
  }

  // 4. HTML Meta Generator & Scripts
  if (htmlBody) {
    const metaGenMatch = htmlBody.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
    if (metaGenMatch && metaGenMatch[1]) {
      detections.push({
        name: metaGenMatch[1],
        category: "cms",
        source: `Balise meta generator: ${metaGenMatch[1]}`,
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

  // Deduplicate by name
  const uniqueNames = Array.from(new Set(detections.map((d) => d.name)));

  const findings: Finding[] = [];

  // Summary finding (strictly informational)
  if (uniqueNames.length > 0) {
    findings.push({
      id: "tech-detected-info",
      category: "technology",
      categoryTitle: "Technologies exposées",
      title: `Technologies détectées : ${uniqueNames.join(", ")}`,
      severity: "info",
      status: "pass",
      description: `L'analyse passive a identifié les composants suivants via les en-têtes ou balises publiques : ${detections.map((d) => `${d.name} (${d.source})`).join(", ")}.`,
      importance: "Information d'exposition technique (fingerprinting). La détection d'une technologie ou d'un framework n'est en aucun cas une vulnérabilité en soi.",
      recommendation: "Il est néanmoins recommandé de masquer les versions détaillées dans les en-têtes (ex: 'ServerTokens Prod' sur Apache ou 'server_tokens off;' sur Nginx) afin de ne pas faciliter la reconnaissance automatisée par des attaquants.",
      remediationSnippet: "# Nginx\nserver_tokens off;\n\n# Apache\nServerTokens Prod\nServerSignature Off",
      detectedValue: uniqueNames.join(" • "),
    });
  } else {
    findings.push({
      id: "tech-none-exposed",
      category: "technology",
      categoryTitle: "Technologies exposées",
      title: "Empreinte technologique minimale (Bannière masquée)",
      severity: "info",
      status: "pass",
      description: "Aucun en-tête révélateur (Server, X-Powered-By) ou méta de générateur n'a divulgué de détails sur l'infrastructure sous-jacente.",
      importance: "Réduit les informations utiles aux robots de reconnaissance.",
      recommendation: "Conservez cette politique de discrétion sur l'ensemble de votre infrastructure.",
      detectedValue: "Aucune signature évidente",
    });
  }

  // If X-Powered-By is explicitly leaking, add a low recommendation
  if (poweredBy) {
    findings.push({
      id: "tech-xpoweredby-exposed",
      category: "technology",
      categoryTitle: "Technologies exposées",
      title: "En-tête 'X-Powered-By' divulgué",
      severity: "low",
      status: "warning",
      description: `L'en-tête 'X-Powered-By: ${poweredBy}' est renvoyé dans la réponse HTTP.`,
      importance: "Divulgue inutilement la technologie backend aux tiers. Bien que non vulnérable directement, cela facilite le ciblage.",
      recommendation: "Désactivez l'en-tête 'X-Powered-By' dans votre configuration de serveur ou middleware.",
      remediationSnippet: "// Express.js\napp.disable('x-powered-by');\n\n// next.config.ts\nmodule.exports = { poweredByHeader: false };",
      detectedValue: poweredBy,
    });
  }

  return {
    technologies: uniqueNames,
    findings,
  };
}
