from __future__ import annotations

import datetime
import socket
import ssl
from dataclasses import dataclass
from typing import List, Optional, Tuple
from urllib.parse import urlparse

import requests
from ..models import Finding

CATEGORY_KEY = "https"
CATEGORY_TITLE = "HTTPS & Transport"


@dataclass
class TlsAuditResult:
    valid: bool
    version: Optional[str] = None
    cipher: Optional[str] = None
    issuer: Optional[str] = None
    valid_to: Optional[str] = None
    days_remaining: Optional[int] = None
    alpn: Optional[str] = None
    error: Optional[str] = None


def _format_issuer(issuer_data) -> str:
    if not issuer_data:
        return "Inconnu"
    org_parts = []
    common_name = ""
    for rdn in issuer_data:
        for key, val in rdn:
            if key == "organizationName":
                org_parts.append(val)
            elif key == "commonName" and not common_name:
                common_name = val
    if org_parts:
        return ", ".join(org_parts)
    return common_name or "Inconnu"


def _parse_cert_date(date_str: str) -> Optional[datetime.datetime]:
    # Standard format: 'May 14 12:00:00 2025 GMT'
    try:
        return datetime.datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z").replace(
            tzinfo=datetime.timezone.utc
        )
    except Exception:
        return None


def inspect_tls_certificate(
    hostname: str, port: int = 443, timeout_seconds: float = 5.0
) -> TlsAuditResult:
    # 1. Try with verified context
    context = ssl.create_default_context()
    context.set_alpn_protocols(["h2", "http/1.1"])

    try:
        with socket.create_connection((hostname, port), timeout=timeout_seconds) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssl_sock:
                cert = ssl_sock.getpeercert()
                cipher = ssl_sock.cipher()
                version = ssl_sock.version()
                alpn = ssl_sock.selected_alpn_protocol()

                cipher_name = (
                    f"{cipher[0]} ({cipher[1]})" if cipher else "Chiffrement fort"
                )
                issuer = _format_issuer(cert.get("issuer", ())) if cert else "Inconnu"
                valid_to_str = cert.get("notAfter") if cert else None

                days_remaining: Optional[int] = None
                if valid_to_str:
                    expiry_dt = _parse_cert_date(valid_to_str)
                    if expiry_dt:
                        now = datetime.datetime.now(datetime.timezone.utc)
                        days_remaining = max(0, (expiry_dt - now).days)

                return TlsAuditResult(
                    valid=True,
                    version=version or "TLS 1.2+",
                    cipher=cipher_name,
                    issuer=issuer,
                    valid_to=valid_to_str,
                    days_remaining=days_remaining,
                    alpn=alpn,
                    error=None,
                )
    except ssl.SSLCertVerificationError as e:
        # Certificate validation failed (e.g. expired, self-signed, hostname mismatch)
        return TlsAuditResult(
            valid=False,
            version="TLS",
            error=f"Certificat non vérifié : {e.verify_message or e}",
        )
    except (ssl.SSLError, socket.timeout, OSError) as e:
        return TlsAuditResult(
            valid=False,
            error=f"Erreur de négociation TLS : {e}",
        )


def check_http_to_https_redirect(
    hostname: str, timeout_seconds: float = 4.0
) -> Tuple[bool, Optional[int]]:
    try:
        url = f"http://{hostname}/"
        res = requests.get(
            url,
            allow_redirects=False,
            timeout=timeout_seconds,
            headers={"User-Agent": "Securio-PassiveAudit/1.0"},
        )
        if res.status_code in (301, 302, 307, 308):
            loc = res.headers.get("Location", "")
            if loc.startswith("https://"):
                return True, res.status_code
        return False, res.status_code
    except Exception:
        return False, None


def analyze_https(
    scheme: str,
    tls_info: TlsAuditResult,
    http_redirect: Tuple[bool, Optional[int]],
) -> List[Finding]:
    findings: List[Finding] = []
    is_https = scheme == "https"

    # 1. HTTPS Enforcement
    if not is_https:
        findings.append(
            Finding(
                id="https-missing",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Connexion non chiffrée (Protocole HTTP en clair)",
                severity="critical",
                status="fail",
                description="Le site web est accessible via HTTP en clair sans chiffrement TLS.",
                importance=(
                    "Toutes les données en transit (mots de passe, cookies, requêtes) "
                    "peuvent être interceptées ou modifiées par un tiers (attaque Man-in-the-Middle)."
                ),
                recommendation="Installez un certificat TLS/SSL et configurez votre serveur pour rediriger tout le trafic vers HTTPS.",
                remediation_snippet=(
                    "server {\n  listen 80;\n  server_name votresite.fr;\n  "
                    "return 301 https://$host$request_uri;\n}"
                ),
                cwe="CWE-319",
            )
        )
    else:
        findings.append(
            Finding(
                id="https-enabled",
                category=CATEGORY_KEY,
                category_title=CATEGORY_TITLE,
                title="Chiffrement HTTPS activé",
                severity="low",
                status="pass",
                description="Les communications avec le serveur sont chiffrées via le protocole HTTPS.",
                importance="Garantit la confidentialité et l'intégrité des échanges entre le navigateur du visiteur et le serveur.",
                recommendation="Conservez le chiffrement HTTPS et surveillez la date d'expiration de votre certificat.",
                detected_value=scheme,
            )
        )

    # 2. TLS Certificate Validity (if HTTPS)
    if is_https:
        if tls_info.valid:
            days_txt = (
                f" (expire dans {tls_info.days_remaining} jours)"
                if tls_info.days_remaining is not None
                else ""
            )
            findings.append(
                Finding(
                    id="tls-cert-valid",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Certificat SSL/TLS valide et approuvé",
                    severity="low",
                    status="pass",
                    description=f"Le certificat émis par {tls_info.issuer or 'une autorité reconnue'} est valide{days_txt}.",
                    importance="Évite les alertes de sécurité dissuasives pour les internautes et valide l'identité de l'hôte.",
                    recommendation="Automatisez le renouvellement (ex. ACME / Let's Encrypt / Cloudflare) avant 30 jours restants.",
                    detected_value=f"{tls_info.version or 'TLS'} • {tls_info.cipher or 'Chiffrement fort'}",
                )
            )
        else:
            findings.append(
                Finding(
                    id="tls-cert-invalid",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Anomalie ou certificat TLS non approuvé",
                    severity="critical",
                    status="fail",
                    description=(
                        f"Le certificat SSL/TLS présente une anomalie : "
                        f"{tls_info.error or 'Chaîne de confiance invalide ou certificat auto-signé'}."
                    ),
                    importance="Les navigateurs modernes bloquent l'accès au site avec un écran rouge d'avertissement de sécurité critique.",
                    recommendation="Remplacez le certificat par un certificat valide émis par une autorité de certification (CA) reconnue.",
                    remediation_snippet="certbot --nginx -d votresite.fr",
                    cwe="CWE-295",
                )
            )

    # 3. HTTP to HTTPS Redirection (if HTTPS)
    if is_https:
        redirects, status_code = http_redirect
        if redirects:
            findings.append(
                Finding(
                    id="http-redirect-pass",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Redirection automatique HTTP vers HTTPS active",
                    severity="low",
                    status="pass",
                    description=(
                        f"Les requêtes non chiffrées HTTP port 80 sont redirigées "
                        f"avec un code de statut {status_code or 301} vers HTTPS."
                    ),
                    importance="Empêche les visiteurs d'accéder par inadvertance à une version non sécurisée du site.",
                    recommendation="Maintenez une redirection permanente 301 vers la version HTTPS canonique.",
                    detected_value=f"HTTP {status_code or 301} -> HTTPS",
                )
            )
        else:
            findings.append(
                Finding(
                    id="http-redirect-fail",
                    category=CATEGORY_KEY,
                    category_title=CATEGORY_TITLE,
                    title="Absence de redirection automatique HTTP vers HTTPS",
                    severity="medium",
                    status="warning",
                    description="Une requête HTTP vers le port 80 ne redirige pas automatiquement vers la version sécurisée HTTPS.",
                    importance="Les utilisateurs accédant au domaine sans préciser 'https://' risquent de naviguer sans chiffrement.",
                    recommendation="Configurez une redirection permanente (HTTP 301) depuis le port 80 vers le port 443 HTTPS.",
                    remediation_snippet="server {\n  listen 80 default_server;\n  return 301 https://$host$request_uri;\n}",
                    cwe="CWE-311",
                )
            )

    return findings
