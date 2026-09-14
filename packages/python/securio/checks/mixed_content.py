from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List
from ..models import Finding

CATEGORY_KEY = "mixed_content"
CATEGORY_TITLE = "Contenu mixte"


@dataclass
class MixedContentAsset:
    tag: str
    attr: str
    url: str


TAG_PATTERNS = [
    ("script", "src", re.compile(r"""<script[^>]+src=["'](http://[^"']+)["']""", re.IGNORECASE)),
    ("link", "href", re.compile(r"""<link[^>]+href=["'](http://[^"']+)["']""", re.IGNORECASE)),
    ("img", "src", re.compile(r"""<img[^>]+src=["'](http://[^"']+)["']""", re.IGNORECASE)),
    ("iframe", "src", re.compile(r"""<iframe[^>]+src=["'](http://[^"']+)["']""", re.IGNORECASE)),
    ("audio", "src", re.compile(r"""<audio[^>]+src=["'](http://[^"']+)["']""", re.IGNORECASE)),
    ("video", "src", re.compile(r"""<video[^>]+src=["'](http://[^"']+)["']""", re.IGNORECASE)),
]


def detect_mixed_content(html_body: str, is_https: bool) -> List[Finding]:
    findings: List[Finding] = []

    if not is_https or not html_body:
        findings.append(
            Finding(
                id="mixed-content-skipped",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Contrôle de contenu mixte non applicable",
                severity="info",
                status="pass",
                description="Le site n'est pas desservi en HTTPS ou le contenu HTML est indisponible.",
                importance="Le contenu mixte ne concerne que les pages sécurisées chargeant des sous-ressources non chiffrées.",
                recommendation="Activez HTTPS avant d'évaluer le contenu mixte.",
            )
        )
        return findings

    insecure_assets: List[MixedContentAsset] = []
    for tag, attr, pattern in TAG_PATTERNS:
        for match in pattern.finditer(html_body):
            url = match.group(1)
            insecure_assets.append(MixedContentAsset(tag=tag, attr=attr, url=url))

    if insecure_assets:
        sample_urls = "\n".join(
            f"<{a.tag} {a.attr}=\"{a.url}\">" for a in insecure_assets[:3]
        )
        has_active_mixed = any(a.tag in ("script", "iframe") for a in insecure_assets)

        findings.append(
            Finding(
                id="mixed-content-detected",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"{len(insecure_assets)} ressource(s) HTTP non chiffrée(s) détectée(s) sur page HTTPS",
                severity="high" if has_active_mixed else "medium",
                status="fail",
                description=f"La page HTTPS charge {len(insecure_assets)} ressource(s) non sécurisée(s) via le protocole http://.",
                importance=(
                    "Les navigateurs bloquent souvent le contenu mixte actif (scripts, iframes) "
                    "ou dégradent l'indicateur de cadenas pour le contenu passif (images), avertissant les internautes d'une insécurité."
                ),
                recommendation=(
                    "Remplacez toutes les URL 'http://' par des URL relatives ou 'https://', "
                    "ou configurez la directive CSP 'upgrade-insecure-requests'."
                ),
                remediation_snippet="Content-Security-Policy: upgrade-insecure-requests;",
                detected_value=sample_urls,
                cwe="CWE-311",
            )
        )
    else:
        findings.append(
            Finding(
                id="mixed-content-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Aucun contenu mixte détecté",
                severity="low",
                status="pass",
                description="Toutes les ressources observables (scripts, feuilles de styles, images, iframes) utilisent des liaisons chiffrées ou relatives.",
                importance="Préserve l'intégrité de l'expérience HTTPS sans avertissement de cadenas cassé.",
                recommendation="Continuez d'imposer des liens HTTPS pour toutes les futures ressources tierces.",
                detected_value="0 ressource non chiffrée",
            )
        )

    return findings
