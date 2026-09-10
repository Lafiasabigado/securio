import type { Finding } from "./types.js";

export interface MixedContentAsset {
  tag: string;
  attr: string;
  url: string;
}

export function detectMixedContent(htmlBody: string, isHttps: boolean): Finding[] {
  const findings: Finding[] = [];

  if (!isHttps || !htmlBody) {
    findings.push({
      id: "mixed-content-skipped",
      category: "mixed_content",
      categoryTitle: "Contenu mixte",
      title: "Contrôle de contenu mixte non applicable",
      severity: "info",
      status: "pass",
      description: "Le site n'est pas desservi en HTTPS ou le contenu HTML est indisponible.",
      importance: "Le contenu mixte ne concerne que les pages sécurisées chargeant des sous-ressources non chiffrées.",
      recommendation: "Activez HTTPS avant d'évaluer le contenu mixte.",
    });
    return findings;
  }

  const insecureAssets: MixedContentAsset[] = [];

  // Regex patterns for common tags loading subresources with http://
  const tagPatterns: Array<{ tag: string; attr: string; regex: RegExp }> = [
    { tag: "script", attr: "src", regex: /<script[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "link", attr: "href", regex: /<link[^>]+href=["'](http:\/\/[^"']+)["']/gi },
    { tag: "img", attr: "src", regex: /<img[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "iframe", attr: "src", regex: /<iframe[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "audio", attr: "src", regex: /<audio[^>]+src=["'](http:\/\/[^"']+)["']/gi },
    { tag: "video", attr: "src", regex: /<video[^>]+src=["'](http:\/\/[^"']+)["']/gi },
  ];

  for (const { tag, attr, regex } of tagPatterns) {
    let match: RegExpExecArray | null;
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
      title: `${insecureAssets.length} ressource(s) HTTP non chiffrée(s) détectée(s) sur page HTTPS`,
      severity: hasActiveMixed ? "high" : "medium",
      status: "fail",
      description: `La page HTTPS charge ${insecureAssets.length} ressource(s) non sécurisée(s) via le protocole http://.`,
      importance: "Les navigateurs bloquent souvent le contenu mixte actif (scripts, iframes) ou dégradent l'indicateur de cadenas pour le contenu passif (images), avertissant les internautes d'une insécurité.",
      recommendation: "Remplacez toutes les URL 'http://' par des URL relatives ou 'https://', ou configurez la directive CSP 'upgrade-insecure-requests'.",
      remediationSnippet: "Content-Security-Policy: upgrade-insecure-requests;",
      detectedValue: sampleUrls,
      cwe: "CWE-311",
    });
  } else {
    findings.push({
      id: "mixed-content-pass",
      category: "mixed_content",
      categoryTitle: "Contenu mixte",
      title: "Aucun contenu mixte détecté",
      severity: "low",
      status: "pass",
      description: "Toutes les ressources observables (scripts, feuilles de styles, images, iframes) utilisent des liaisons chiffrées ou relatives.",
      importance: "Préserve l'intégrité de l'expérience HTTPS sans avertissement de cadenas cassé.",
      recommendation: "Continuez d'imposer des liens HTTPS pour toutes les futures ressources tierces.",
      detectedValue: "0 ressource non chiffrée",
    });
  }

  return findings;
}
