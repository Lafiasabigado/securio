from __future__ import annotations

from dataclasses import dataclass
from typing import List, Literal
from ..models import Finding

CATEGORY_KEY = "cookies"
CATEGORY_TITLE = "Cookies"

SameSiteValue = Literal["strict", "lax", "none", "missing"]


@dataclass
class CookieFlags:
    name: str
    has_secure: bool
    has_httponly: bool
    same_site: SameSiteValue


def parse_cookie_flags(cookie_headers: List[str]) -> List[CookieFlags]:
    result: List[CookieFlags] = []

    for header in cookie_headers:
        if not header or not isinstance(header, str):
            continue

        parts = [p.strip() for p in header.split(";")]
        if not parts:
            continue

        # Extract only the cookie name, discard sensitive values
        first_part = parts[0]
        if "=" in first_part:
            name = first_part.split("=", 1)[0].strip()
        else:
            name = first_part.strip()

        has_secure = False
        has_httponly = False
        same_site: SameSiteValue = "missing"

        for part in parts[1:]:
            lower = part.lower()
            if lower == "secure":
                has_secure = True
            elif lower == "httponly":
                has_httponly = True
            elif lower.startswith("samesite="):
                val = lower.split("=", 1)[1].strip()
                if val == "strict":
                    same_site = "strict"
                elif val == "lax":
                    same_site = "lax"
                elif val == "none":
                    same_site = "none"

        result.append(
            CookieFlags(
                name=name or "cookie_session",
                has_secure=has_secure,
                has_httponly=has_httponly,
                same_site=same_site,
            )
        )

    return result


def analyze_cookies(cookie_headers: List[str], is_https: bool) -> List[Finding]:
    findings: List[Finding] = []
    cookies = parse_cookie_flags(cookie_headers)

    if not cookies:
        findings.append(
            Finding(
                id="cookie-none-exposed",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Aucun cookie d'état exposé dans la réponse initiale",
                severity="low",
                status="pass",
                description="Aucun en-tête 'Set-Cookie' n'a été renvoyé lors de la requête initiale non authentifiée.",
                importance="L'absence d'émission prématurée de cookies réduit la surface d'attaque et favorise la conformité vie privée (RGPD).",
                recommendation="Lors de la création de cookies de session futurs, veillez à toujours spécifier Secure, HttpOnly et SameSite.",
                detected_value="0 cookie renvoyé",
            )
        )
        return findings

    # 1. Secure Flag
    insecure_cookies = [c for c in cookies if not c.has_secure]
    if insecure_cookies and is_https:
        names = ", ".join(c.name for c in insecure_cookies)
        findings.append(
            Finding(
                id="cookie-secure-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"Drapeau 'Secure' manquant sur {len(insecure_cookies)} cookie(s)",
                severity="high",
                status="fail",
                description=f"Le(s) cookie(s) [{names}] ne comportent pas le drapeau 'Secure'.",
                importance="Sans 'Secure', le navigateur transmettra ces cookies en clair si l'internaute effectue une requête HTTP vers le même domaine, risquant leur interception.",
                recommendation="Ajoutez impérativement le drapeau '; Secure' à tous vos cookies de session et d'authentification.",
                remediation_snippet="Set-Cookie: session_id=...; Secure; HttpOnly; SameSite=Lax",
                cwe="CWE-614",
            )
        )
    else:
        findings.append(
            Finding(
                id="cookie-secure-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Drapeau 'Secure' configuré sur tous les cookies",
                severity="low",
                status="pass",
                description="Tous les cookies renvoyés exigent une transmission chiffrée HTTPS.",
                importance="Empêche la fuite de cookies d'authentification sur des canaux réseau non sécurisés.",
                recommendation="Conservez cette configuration pour tout nouveau cookie.",
                detected_value=f"{len(cookies)} cookie(s) avec Secure",
            )
        )

    # 2. HttpOnly Flag
    non_httponly_cookies = [c for c in cookies if not c.has_httponly]
    if non_httponly_cookies:
        names = ", ".join(c.name for c in non_httponly_cookies)
        findings.append(
            Finding(
                id="cookie-httponly-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"Attribut 'HttpOnly' absent sur {len(non_httponly_cookies)} cookie(s)",
                severity="medium",
                status="warning",
                description=f"Le(s) cookie(s) [{names}] ne disposent pas de l'attribut 'HttpOnly'.",
                importance="Permet aux scripts JavaScript côté client d'accéder au cookie via 'document.cookie', rendant le vol de session possible en cas de faille XSS.",
                recommendation="Marquez tous les cookies d'authentification ou sensibles avec '; HttpOnly' pour interdire leur lecture par JavaScript.",
                remediation_snippet="Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict",
                cwe="CWE-1004",
            )
        )
    else:
        findings.append(
            Finding(
                id="cookie-httponly-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Attribut 'HttpOnly' actif sur tous les cookies",
                severity="low",
                status="pass",
                description="Les cookies sont inaccessibles aux scripts JavaScript exécutés dans le document.",
                importance="Immunise les identifiants de session contre le vol direct par injection XSS.",
                recommendation="Maintenez 'HttpOnly' sur l'ensemble des cookies contenant des jetons d'état.",
                detected_value=f"{len(cookies)} cookie(s) avec HttpOnly",
            )
        )

    # 3. SameSite Flag
    missing_samesite = [
        c for c in cookies if c.same_site in ("missing", "none")
    ]
    if missing_samesite:
        names = ", ".join(c.name for c in missing_samesite)
        findings.append(
            Finding(
                id="cookie-samesite-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"Protection 'SameSite' absente ou permissive sur {len(missing_samesite)} cookie(s)",
                severity="medium",
                status="warning",
                description=f"Le(s) cookie(s) [{names}] ne définissent pas 'SameSite=Lax' ou 'SameSite=Strict'.",
                importance="Sans SameSite restrictif, le navigateur joint ces cookies aux requêtes provenant de sites tiers, facilitant les attaques CSRF (Cross-Site Request Forgery).",
                recommendation="Définissez '; SameSite=Lax' pour les cookies de navigation standard ou '; SameSite=Strict' pour les opérations critiques.",
                remediation_snippet="Set-Cookie: session=...; SameSite=Lax; Secure; HttpOnly",
                cwe="CWE-1275",
            )
        )
    else:
        findings.append(
            Finding(
                id="cookie-samesite-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Attribut 'SameSite' protecteur configuré",
                severity="low",
                status="pass",
                description="Tous les cookies restreignent leur envoi lors des requêtes inter-sites (Lax ou Strict).",
                importance="Fournit une protection de premier ordre contre les falsifications de requêtes intersites (CSRF).",
                recommendation="Maintenez la politique SameSite adéquate pour vos flux d'authentification.",
                detected_value=f"{len(cookies)} cookie(s) avec SameSite protégé",
            )
        )

    return findings
