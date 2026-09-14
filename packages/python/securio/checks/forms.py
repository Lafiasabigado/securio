from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List
from ..models import Finding

CATEGORY_KEY = "forms"
CATEGORY_TITLE = "Formulaires"


@dataclass
class FormInfo:
    action: str
    method: str
    has_password_input: bool
    is_insecure_target: bool


def analyze_forms(html_body: str, is_https: bool) -> List[Finding]:
    findings: List[Finding] = []
    if not html_body:
        return findings

    form_regex = re.compile(r"<form\b([^>]*)>([\s\S]*?)</form>", re.IGNORECASE)
    forms: List[FormInfo] = []

    for match in form_regex.finditer(html_body):
        attrs = match.group(1)
        content = match.group(2)

        action_match = re.search(r"""action=["']([^"']*)["']""", attrs, re.IGNORECASE)
        action = action_match.group(1).strip() if action_match else ""

        method_match = re.search(r"""method=["']([^"']*)["']""", attrs, re.IGNORECASE)
        method = method_match.group(1).strip().upper() if method_match else "GET"

        has_password = bool(
            re.search(r"""<input[^>]+type=["']password["']""", content, re.IGNORECASE)
        )

        is_insecure = False
        if action.lower().startswith("http://"):
            is_insecure = True
        elif action.startswith("//") and not is_https:
            is_insecure = True

        forms.append(
            FormInfo(
                action=action,
                method=method,
                has_password_input=has_password,
                is_insecure_target=is_insecure,
            )
        )

    if not forms:
        findings.append(
            Finding(
                id="forms-none",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Aucun formulaire interactif détecté sur la page analysée",
                severity="info",
                status="pass",
                description="La page d'accueil ne comporte pas de balise <form> publique.",
                importance="Aucune surface de soumission de données observée sur cette page.",
                recommendation="Si vous ajoutez des formulaires futurs, veillez à soumettre exclusivement vers des points de terminaison HTTPS protégés par des jetons CSRF.",
                detected_value="0 formulaire",
            )
        )
        return findings

    # Check insecure actions
    insecure_forms = [f for f in forms if f.is_insecure_target]
    if insecure_forms:
        samples = "\n".join(
            f"<form action=\"{f.action}\" method=\"{f.method}\">"
            for f in insecure_forms[:3]
        )
        findings.append(
            Finding(
                id="forms-insecure-action",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title=f"{len(insecure_forms)} formulaire(s) transmettant vers une destination HTTP non chiffrée",
                severity="critical",
                status="fail",
                description=f"Un ou plusieurs formulaires transmettent des données saisies vers une URL HTTP en clair : {samples}",
                importance="Les identifiants, coordonnées ou données personnelles envoyées par les internautes transitent sans chiffrement et peuvent être interceptés.",
                recommendation="Modifiez l'attribut 'action' du formulaire pour cibler une URL HTTPS absolue ou un chemin relatif.",
                remediation_snippet="<form action=\"/api/submit\" method=\"POST\">",
                detected_value=samples,
                cwe="CWE-319",
            )
        )
    else:
        findings.append(
            Finding(
                id="forms-secure-action",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Actions de formulaires correctement sécurisées",
                severity="low",
                status="pass",
                description=f"Les {len(forms)} formulaire(s) détecté(s) transmettent leurs données via des URL relatives sécurisées ou HTTPS.",
                importance="Garantit la confidentialité des données saisies par les utilisateurs lors de leur envoi au serveur.",
                recommendation="Assurez-vous que tous les points de terminaison POST appliquent également une protection contre les attaques CSRF.",
                detected_value=f"{len(forms)} formulaire(s) conforme(s)",
            )
        )

    # Check password input over unencrypted HTTP
    has_password_over_http = any(f.has_password_input for f in forms) and not is_https
    if has_password_over_http:
        findings.append(
            Finding(
                id="forms-password-http",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Champ de mot de passe hébergé sur une page HTTP en clair",
                severity="critical",
                status="fail",
                description="Un champ de mot de passe est présent sur une page servie en HTTP sans chiffrement.",
                importance="Risque maximal d'interception d'identifiants de connexion en clair sur le réseau.",
                recommendation="Migrez immédiatement la page d'authentification vers HTTPS.",
                cwe="CWE-523",
            )
        )

    return findings
