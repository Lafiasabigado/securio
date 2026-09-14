from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from ..models import Finding

CATEGORY_KEY = "technology"
CATEGORY_TITLE = "Technologies exposées"


@dataclass
class TechDetection:
    name: str
    category: str
    source: str
    version: Optional[str] = None


def detect_technologies(
    headers: Dict[str, str], html_body: str
) -> Tuple[List[str], List[Finding]]:
    detections: List[TechDetection] = []

    # 1. Server Header
    server = headers.get("server")
    if server:
        parts = server.split("/", 1)
        name = parts[0].strip() or server
        version = parts[1].strip() if len(parts) > 1 else None
        detections.append(
            TechDetection(
                name=name,
                category="serveur",
                source=f"En-tête HTTP Server: {server}",
                version=version,
            )
        )

    # 2. X-Powered-By Header
    powered_by = headers.get("x-powered-by")
    if powered_by:
        detections.append(
            TechDetection(
                name=powered_by,
                category="framework",
                source=f"En-tête X-Powered-By: {powered_by}",
            )
        )

    # 3. CDN Headers (Cloudflare, Vercel, AWS CloudFront)
    if "cf-ray" in headers:
        detections.append(
            TechDetection(name="Cloudflare", category="cdn", source="En-tête CF-Ray")
        )
    if "x-vercel-id" in headers:
        detections.append(
            TechDetection(name="Vercel", category="cdn", source="En-tête X-Vercel-Id")
        )
    if "x-amz-cf-id" in headers or "cloudfront" in headers.get("x-cache", "").lower():
        detections.append(
            TechDetection(
                name="Amazon CloudFront",
                category="cdn",
                source="En-tête AWS CloudFront",
            )
        )

    # 4. HTML Meta Generator & Framework Footprints
    if html_body:
        meta_gen = re.search(
            r"""<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']""",
            html_body,
            re.IGNORECASE,
        )
        if meta_gen:
            gen_name = meta_gen.group(1).strip()
            detections.append(
                TechDetection(
                    name=gen_name,
                    category="cms",
                    source=f"Balise meta generator: {gen_name}",
                )
            )

        if "/_next/" in html_body or "__NEXT_DATA__" in html_body:
            detections.append(
                TechDetection(
                    name="Next.js",
                    category="framework",
                    source="Ressources /_next/ et structure DOM",
                )
            )
        if "wp-content" in html_body or "wp-includes" in html_body:
            detections.append(
                TechDetection(
                    name="WordPress",
                    category="cms",
                    source="Chemins wp-content / wp-includes",
                )
            )
        if "Shopify.theme" in html_body:
            detections.append(
                TechDetection(
                    name="Shopify", category="cms", source="Objets Shopify"
                )
            )
        if "drupal.js" in html_body or "Drupal.settings" in html_body:
            detections.append(
                TechDetection(name="Drupal", category="cms", source="Scripts Drupal")
            )
        if "gatsby" in html_body:
            detections.append(
                TechDetection(
                    name="Gatsby",
                    category="framework",
                    source="Identifiants Gatsby",
                )
            )
        if "nuxt" in html_body.lower() or "__NUXT__" in html_body:
            detections.append(
                TechDetection(
                    name="Nuxt", category="framework", source="Structure Nuxt"
                )
            )

    # Deduplicate technologies case-insensitively preserving order
    unique_names: List[str] = []
    seen = set()
    for d in detections:
        key = d.name.strip().lower()
        if key not in seen:
            seen.add(key)
            # Prefer capitalized or formatted name
            unique_names.append(d.name)

    findings: List[Finding] = []

    # Summary finding (strictly informational - pass)
    if unique_names:
        detection_details = ", ".join(f"{d.name} ({d.source})" for d in detections)
        findings.append(
            Finding(
                id="tech-detected-info",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"Technologies détectées : {', '.join(unique_names)}",
                severity="info",
                status="pass",
                description=f"L'analyse passive a identifié les composants suivants via les en-têtes ou balises publiques : {detection_details}.",
                importance=(
                    "Information d'exposition technique (fingerprinting). "
                    "La détection d'une technologie ou d'un framework n'est en aucun cas une vulnérabilité en soi."
                ),
                recommendation=(
                    "Il est néanmoins recommandé de masquer les versions détaillées dans les en-têtes "
                    "(ex: 'ServerTokens Prod' sur Apache ou 'server_tokens off;' sur Nginx) "
                    "afin de ne pas faciliter la reconnaissance automatisée par des attaquants."
                ),
                remediation_snippet="# Nginx\nserver_tokens off;\n\n# Apache\nServerTokens Prod\nServerSignature Off",
                detected_value=" • ".join(unique_names),
            )
        )
    else:
        findings.append(
            Finding(
                id="tech-none-exposed",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Empreinte technologique minimale (Bannière masquée)",
                severity="info",
                status="pass",
                description="Aucun en-tête révélateur (Server, X-Powered-By) ou méta de générateur n'a divulgué de détails sur l'infrastructure sous-jacente.",
                importance="Réduit les informations utiles aux robots de reconnaissance.",
                recommendation="Conservez cette politique de discrétion sur l'ensemble de votre infrastructure.",
                detected_value="Aucune signature évidente",
            )
        )

    # If X-Powered-By is explicitly leaking backend, add a low warning
    if powered_by:
        findings.append(
            Finding(
                id="tech-xpoweredby-exposed",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="En-tête 'X-Powered-By' divulgué",
                severity="low",
                status="warning",
                description=f"L'en-tête 'X-Powered-By: {powered_by}' est renvoyé dans la réponse HTTP.",
                importance="Divulgue inutilement la technologie backend aux tiers. Bien que non vulnérable directement, cela facilite le ciblage.",
                recommendation="Désactivez l'en-tête 'X-Powered-By' dans votre configuration de serveur ou middleware.",
                remediation_snippet="// Express.js\napp.disable('x-powered-by');\n\n// next.config.ts\nmodule.exports = { poweredByHeader: false };",
                detected_value=powered_by,
            )
        )

    return unique_names, findings
