from __future__ import annotations

import ipaddress
import re
import socket
from urllib.parse import urlparse
from typing import Optional, Tuple
from .models import ValidatedTarget

ALLOWED_PORTS = {80, 443, 8080, 8443}

FORBIDDEN_DOMAIN_SUFFIXES = (
    ".localhost",
    ".local",
    ".internal",
    ".lan",
    ".home",
)


def is_private_or_reserved_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True

    # Handle IPv4-mapped IPv6 (::ffff:127.0.0.1)
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
        ip = ip.ipv4_mapped

    if ip.is_loopback:
        return True
    if ip.is_private:
        return True
    if ip.is_reserved:
        return True
    if ip.is_link_local:
        return True
    if ip.is_multicast:
        return True
    if ip.is_unspecified:
        return True

    # Check 100.64.0.0/10 (Carrier-Grade NAT)
    if isinstance(ip, ipaddress.IPv4Address):
        cgnat_network = ipaddress.ip_network("100.64.0.0/10")
        if ip in cgnat_network:
            return True

    return False


def validate_public_host(hostname: str) -> Tuple[bool, Optional[str], Optional[str]]:
    host = hostname.lower().strip()

    if not host or ".." in host:
        return False, None, "Nom d'hôte invalide."

    if host == "localhost" or host.endswith(FORBIDDEN_DOMAIN_SUFFIXES):
        return (
            False,
            None,
            "L'accès à localhost et aux domaines de réseau local est interdit.",
        )

    # Check if host is already an IP address
    try:
        ipaddress.ip_address(host)
        is_direct_ip = True
    except ValueError:
        is_direct_ip = False

    if is_direct_ip:
        if is_private_or_reserved_ip(host):
            return (
                False,
                host,
                f"L'adresse IP {host} est une adresse privée ou réservée non autorisée.",
            )
        return True, host, None

    # Resolve hostname via DNS
    try:
        addr_info = socket.getaddrinfo(
            host, None, socket.AF_UNSPEC, socket.SOCK_STREAM
        )
    except socket.gaierror as e:
        return False, None, f"Échec de résolution DNS pour {host} : {e}"

    if not addr_info:
        return False, None, f"Impossible de résoudre l'hôte DNS : {host}"

    resolved_ips = list({item[4][0] for item in addr_info})
    for ip in resolved_ips:
        if is_private_or_reserved_ip(ip):
            return (
                False,
                ip,
                f"Le domaine résout vers une adresse privée ou réservée interdite ({ip}).",
            )

    return True, resolved_ips[0], None


def validate_and_resolve_target(raw_input: str) -> ValidatedTarget:
    if not raw_input or not isinstance(raw_input, str):
        raise ValueError("L'URL est requise.")

    trimmed = raw_input.strip()
    if len(trimmed) < 3:
        raise ValueError("L'URL est requise.")
    if len(trimmed) > 2048:
        raise ValueError("L'URL est trop longue.")

    # Prepend https:// if no scheme, or reject disallowed explicit schemes
    scheme_match = re.match(r"^([a-zA-Z][a-zA-Z0-9+.-]*):(?://|/)", trimmed)
    if scheme_match:
        scheme_prefix = scheme_match.group(1).lower()
        if scheme_prefix not in ("http", "https"):
            raise ValueError("Seuls les protocoles http:// et https:// sont autorisés.")
        formatted = trimmed
    else:
        formatted = f"https://{trimmed}"

    try:
        parsed = urlparse(formatted)
    except Exception:
        raise ValueError("Format d'URL invalide.")

    scheme = parsed.scheme.lower()
    if scheme not in ("http", "https"):
        raise ValueError("Seuls les protocoles http:// et https:// sont autorisés.")

    port = parsed.port
    default_port = 443 if scheme == "https" else 80
    effective_port = port if port is not None else default_port

    if effective_port not in ALLOWED_PORTS:
        raise ValueError(
            f"Le port {effective_port} n'est pas autorisé pour l'analyse passive "
            f"(ports autorisés : 80, 443, 8080, 8443)."
        )

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Nom d'hôte invalide.")

    is_allowed, ip, err = validate_public_host(hostname)
    if not is_allowed:
        raise ValueError(err or "Adresse de destination non autorisée ou privée.")

    normalized_url = parsed.geturl()

    return ValidatedTarget(
        raw_url=raw_input,
        normalized_url=normalized_url,
        scheme=scheme,
        hostname=hostname,
        port=effective_port,
        ip=ip or "Inconnue",
    )
