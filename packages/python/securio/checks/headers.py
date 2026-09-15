from __future__ import annotations

import re
from typing import Dict, List
from ..models import Finding, FindingStatus, Severity

CATEGORY_KEY = "headers"
CATEGORY_TITLE = "En-têtes de sécurité"

SAFE_REFERRERS = (
    "no-referrer",
    "strict-origin",
    "strict-origin-when-cross-origin",
    "same-origin",
    "origin-when-cross-origin",
)

CSP_REMEDIATION_SNIPPET = (
    "Content-Security-Policy: default-src 'self'; script-src 'self'; "
    "object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
)


def inspect_csp_script_src(csp: str) -> List[Dict[str, str]]:
    """Inspect script-src (else default-src) for XSS-relevant weaknesses."""
    issues: List[Dict[str, str]] = []
    script_match = re.search(r"script-src([^;]*)", csp, re.IGNORECASE)
    default_match = re.search(r"default-src([^;]*)", csp, re.IGNORECASE)

    if script_match:
        tokens = [token.lower() for token in script_match.group(1).split() if token]
    elif default_match:
        tokens = [token.lower() for token in default_match.group(1).split() if token]
    else:
        return [
            {
                "kind": "unconstrained",
                "label": "aucune directive script-src ni default-src",
                "level": "fail",
            }
        ]

    has_strict_dynamic = "'strict-dynamic'" in tokens

    if "'unsafe-eval'" in tokens:
        issues.append({"kind": "unsafe-eval", "label": "'unsafe-eval'", "level": "fail"})
    if "'unsafe-inline'" in tokens and not has_strict_dynamic:
        issues.append(
            {"kind": "unsafe-inline", "label": "'unsafe-inline'", "level": "warning"}
        )
    if any(token == "data:" or token.startswith("data:") for token in tokens):
        issues.append({"kind": "data", "label": "source data:", "level": "fail"})
    if any(token == "blob:" or token.startswith("blob:") for token in tokens):
        issues.append({"kind": "blob", "label": "source blob:", "level": "fail"})
    if any(token == "http:" or token.startswith("http://") for token in tokens):
        issues.append(
            {"kind": "http", "label": "source HTTP non chiffré", "level": "fail"}
        )
    if "https:" in tokens:
        issues.append(
            {
                "kind": "https-scheme",
                "label": "schéma https: (tous les hôtes HTTPS)",
                "level": "warning",
            }
        )
    if any(token == "*" or token.startswith("*.") for token in tokens):
        issues.append({"kind": "wildcard", "label": "wildcard *", "level": "warning"})

    return issues


def summarize_csp_issues(issues: List[Dict[str, str]]) -> Dict[str, object]:
    if not issues:
        return {"status": "pass", "severity": "low", "labels": []}

    has_fail = any(issue["level"] == "fail" for issue in issues)
    has_unsafe_inline = any(issue["kind"] == "unsafe-inline" for issue in issues)
    return {
        "status": "fail" if has_fail else "warning",
        "severity": "high" if has_fail or has_unsafe_inline else "medium",
        "labels": [issue["label"] for issue in issues],
    }


def analyze_security_headers(headers: Dict[str, str]) -> List[Finding]:
    findings: List[Finding] = []

    # 1. Content-Security-Policy (CSP)
    csp = headers.get("content-security-policy")
    if not csp:
        findings.append(
            Finding(
                id="header-csp-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Content-Security-Policy (CSP) est absent",
                severity="high",
                status="fail",
                description="La réponse HTTP ne définit pas d'en-tête Content-Security-Policy.",
                importance=(
                    "Sans CSP, le navigateur exécute aveuglément tout script injecté, "
                    "exposant votre site aux attaques par Cross-Site Scripting (XSS) et vol de session."
                ),
                recommendation="Définissez un en-tête Content-Security-Policy strict limitant les sources de scripts, styles et objets autorisés.",
                remediation_snippet=CSP_REMEDIATION_SNIPPET,
                cwe="CWE-693",
            )
        )
    else:
        val_display = f"{csp[:80]}..." if len(csp) > 80 else csp
        summary = summarize_csp_issues(inspect_csp_script_src(csp))
        status = str(summary["status"])
        labels = summary["labels"]
        assert isinstance(labels, list)

        if status == "pass":
            findings.append(
                Finding(
                    id="header-csp-pass",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Content-Security-Policy configuré avec rigueur",
                    severity="low",
                    status="pass",
                    description="Une politique de sécurité de contenu restreignant l'exécution de ressources non autorisées est en place.",
                    importance="Bloque activement les attaques par injection de script XSS et les charges malveillantes non signées.",
                    recommendation="Poursuivez la surveillance de vos directives CSP et envisagez le reporting avec 'report-to'.",
                    detected_value=val_display,
                )
            )
        else:
            listed = ", ".join(str(label) for label in labels)
            finding_status: FindingStatus = "fail" if status == "fail" else "warning"
            finding_severity: Severity = "high" if summary["severity"] == "high" else "medium"
            findings.append(
                Finding(
                    id="header-csp-unsafe" if finding_status == "fail" else "header-csp-permissive",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title=(
                        "Content-Security-Policy trop permissif pour les scripts"
                        if finding_status == "fail"
                        else "Content-Security-Policy affaibli"
                    ),
                    severity=finding_severity,
                    status=finding_status,
                    description=(
                        "L'en-tête CSP est présent mais la politique d'exécution des scripts "
                        f"est trop ouverte ({listed})."
                    ),
                    importance=(
                        "Une CSP trop large n'empêche pas l'exécution de scripts injectés (XSS) : "
                        "'unsafe-inline', 'unsafe-eval', data: et les wildcards vident la protection."
                    ),
                    recommendation=(
                        "Restreignez script-src à 'self' et à des nonces ou hashes. "
                        "Évitez 'unsafe-inline', 'unsafe-eval', data: et le schéma https: sans hôte."
                    ),
                    remediation_snippet=CSP_REMEDIATION_SNIPPET,
                    detected_value=val_display,
                    cwe="CWE-1021",
                )
            )

    # 2. Strict-Transport-Security (HSTS)
    hsts = headers.get("strict-transport-security")
    if not hsts:
        findings.append(
            Finding(
                id="header-hsts-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Strict-Transport-Security (HSTS) est absent",
                severity="high",
                status="fail",
                description="L'en-tête Strict-Transport-Security n'est pas envoyé par le serveur.",
                importance=(
                    "Sans HSTS, un attaquant sur le même réseau (Wi-Fi public) peut "
                    "rétrograder la connexion en HTTP clair via une attaque SSL-Stripping."
                ),
                recommendation="Activez HSTS avec un max-age d'au moins 1 an (31536000 secondes), incluez les sous-domaines et envisagez le préchargement.",
                remediation_snippet="Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
                cwe="CWE-319",
            )
        )
    else:
        max_age_match = re.search(r"max-age=(\d+)", hsts, re.IGNORECASE)
        max_age = int(max_age_match.group(1)) if max_age_match else 0
        has_subdomains = "includesubdomains" in hsts.lower()
        has_preload = "preload" in hsts.lower()

        if max_age < 15552000:  # less than 180 days
            findings.append(
                Finding(
                    id="header-hsts-short-maxage",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Durée de validité HSTS insuffisante (max-age faible)",
                    severity="medium",
                    status="warning",
                    description=f"L'en-tête HSTS est présent mais avec une durée d'expiration de {max_age} secondes (inférieure aux 6 mois recommandés).",
                    importance="Une durée trop courte ne protège pas efficacement les utilisateurs réguliers contre les attaques de dégradation.",
                    recommendation="Augmentez le paramètre max-age à 31536000 (1 an) et activez includeSubDomains.",
                    remediation_snippet="Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
                    detected_value=hsts,
                )
            )
        else:
            findings.append(
                Finding(
                    id="header-hsts-pass",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Strict-Transport-Security (HSTS) est correctement configuré",
                    severity="low",
                    status="pass",
                    description=f"HSTS est actif avec max-age={max_age}{'; includeSubDomains' if has_subdomains else ''}{'; preload' if has_preload else ''}.",
                    importance="Force le navigateur à communiquer exclusivement par canal HTTPS sécurisé.",
                    recommendation="Maintenez la directive active et assurez-vous que tous vos sous-domaines supportent HTTPS.",
                    detected_value=hsts,
                )
            )

    # 3. X-Content-Type-Options
    xcto = headers.get("x-content-type-options")
    if not xcto or "nosniff" not in xcto.lower():
        findings.append(
            Finding(
                id="header-xcto-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="X-Content-Type-Options: nosniff est manquant",
                severity="medium",
                status="warning",
                description="L'en-tête X-Content-Type-Options n'est pas configuré sur 'nosniff'.",
                importance="Permet aux navigateurs d'effectuer du reniflage MIME ('MIME-sniffing') et d'interpréter des fichiers non exécutables comme du code malveillant.",
                recommendation="Ajoutez l'en-tête 'X-Content-Type-Options: nosniff' sur toutes les réponses.",
                remediation_snippet="X-Content-Type-Options: nosniff",
                cwe="CWE-79",
            )
        )
    else:
        findings.append(
            Finding(
                id="header-xcto-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="X-Content-Type-Options est configuré sur nosniff",
                severity="low",
                status="pass",
                description="Le reniflage de types MIME est explicitement désactivé pour tous les types de contenu.",
                importance="Empêche l'exécution de scripts dissimulés dans des images ou fichiers texte.",
                recommendation="Conservez cette configuration standard sur l'ensemble de vos serveurs web.",
                detected_value=xcto,
            )
        )

    # 4. X-Frame-Options (or CSP frame-ancestors)
    xfo = headers.get("x-frame-options")
    has_frame_ancestors = csp is not None and "frame-ancestors" in csp.lower()

    if not xfo and not has_frame_ancestors:
        findings.append(
            Finding(
                id="header-xfo-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Protection contre le clickjacking absente (X-Frame-Options / frame-ancestors)",
                severity="medium",
                status="warning",
                description="Aucun en-tête X-Frame-Options ni directive CSP frame-ancestors n'a été détecté.",
                importance="Le site peut être encapsulé dans une balise <iframe> tierce pour tromper les utilisateurs et voler des clics (clickjacking).",
                recommendation="Configurez 'X-Frame-Options: DENY' ou 'SAMEORIGIN', ou définissez la directive CSP 'frame-ancestors 'self''.",
                remediation_snippet="X-Frame-Options: SAMEORIGIN",
                cwe="CWE-1021",
            )
        )
    else:
        val = xfo.upper() if xfo else "Couvert par CSP frame-ancestors"
        findings.append(
            Finding(
                id="header-xfo-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Protection anti-clickjacking active",
                severity="low",
                status="pass",
                description=f"L'affichage au sein de cadres ou iframes tiers est restreint ({val}).",
                importance="Neutralise les attaques de détournement de clics et l'intégration non consentie sur des sites malveillants.",
                recommendation="Privilégiez la directive CSP frame-ancestors moderne en complément de X-Frame-Options.",
                detected_value=val,
            )
        )

    # 5. Referrer-Policy
    ref_policy = headers.get("referrer-policy")
    if not ref_policy:
        findings.append(
            Finding(
                id="header-referrer-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Referrer-Policy n'est pas explicitement défini",
                severity="low",
                status="warning",
                description="L'en-tête Referrer-Policy n'est pas renseigné (le navigateur appliquera son comportement par défaut).",
                importance="Des paramètres sensibles d'URL (jetons, identifiants) peuvent fuiter vers des domaines tiers lors d'un clic sur un lien externe.",
                recommendation="Définissez 'Referrer-Policy: strict-origin-when-cross-origin' pour protéger la confidentialité des URL internes.",
                remediation_snippet="Referrer-Policy: strict-origin-when-cross-origin",
                cwe="CWE-200",
            )
        )
    else:
        ref_lower = ref_policy.lower()
        is_safe = any(sr in ref_lower for sr in SAFE_REFERRERS)
        if is_safe:
            findings.append(
                Finding(
                    id="header-referrer-pass",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Politique de référent (Referrer-Policy) sécurisée",
                    severity="low",
                    status="pass",
                    description=f"L'en-tête Referrer-Policy est configuré ({ref_policy}).",
                    importance="Prévient la fuite d'informations de navigation sensibles vers les sites externes.",
                    recommendation="Conservez cette configuration stricte.",
                    detected_value=ref_policy,
                )
            )
        else:
            findings.append(
                Finding(
                    id="header-referrer-unsafe",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Referrer-Policy permissif ('unsafe-url')",
                    severity="medium",
                    status="warning",
                    description=f"L'en-tête Referrer-Policy est défini sur '{ref_policy}', transmettant l'intégralité du chemin et des paramètres aux tiers.",
                    importance="Risque de divulgation involontaire de paramètres d'URL confidentiels.",
                    recommendation="Remplacez la directive par 'strict-origin-when-cross-origin'.",
                    remediation_snippet="Referrer-Policy: strict-origin-when-cross-origin",
                    detected_value=ref_policy,
                )
            )

    # 6. Permissions-Policy
    perm_policy = headers.get("permissions-policy")
    if not perm_policy:
        findings.append(
            Finding(
                id="header-permissions-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Permissions-Policy n'est pas configuré",
                severity="low",
                status="warning",
                description="L'en-tête Permissions-Policy (anciennement Feature-Policy) n'est pas défini.",
                importance="Permet de désactiver proactivement les API du navigateur non utilisées (caméra, microphone, géolocalisation, accéléromètre) pour éviter leur exploitation.",
                recommendation="Ajoutez un en-tête Permissions-Policy restreignant l'accès aux capteurs et fonctionnalités matérielles.",
                remediation_snippet="Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
            )
        )
    else:
        val_display = (
            f"{perm_policy[:80]}..." if len(perm_policy) > 80 else perm_policy
        )
        findings.append(
            Finding(
                id="header-permissions-pass",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Permissions-Policy est en place",
                severity="low",
                status="pass",
                description="Les fonctionnalités matérielles et API sensibles du navigateur sont contrôlées par une politique stricte.",
                importance="Réduit la surface d'attaque en bloquant les capteurs matériels non requis par l'application.",
                recommendation="Vérifiez régulièrement que seules les API strictement indispensables sont autorisées.",
                detected_value=val_display,
            )
        )

    return findings
