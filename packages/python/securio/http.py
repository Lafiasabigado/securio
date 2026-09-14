from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict, List
from urllib.parse import urljoin, urlparse

import requests
import urllib3
from .ssrf import validate_public_host

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Securio-PassiveAudit/1.0)"
)


@dataclass
class HttpResponse:
    url: str
    status_code: int
    status_text: str
    headers: Dict[str, str]
    set_cookie_headers: List[str]
    body: str
    latency_ms: int
    redirect_count: int
    redirect_chain: List[str]


def fetch_with_security_limits(
    initial_url: str,
    max_redirects: int = 5,
    timeout_seconds: float = 8.0,
    max_bytes: int = 2 * 1024 * 1024,  # 2MB max
) -> HttpResponse:
    current_url = initial_url
    redirect_count = 0
    redirect_chain: List[str] = [initial_url]
    start_time = time.time()

    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
    }

    session = requests.Session()

    try:
        while redirect_count <= max_redirects:
            parsed = urlparse(current_url)
            hostname = parsed.hostname or ""

            # Verify SSRF on every hop
            is_allowed, _, err = validate_public_host(hostname)
            if not is_allowed:
                raise ValueError(
                    f"Redirection non autorisée vers un hôte privé ou interdit : {hostname} ({err})"
                )

            try:
                res = session.get(
                    current_url,
                    headers=headers,
                    allow_redirects=False,
                    timeout=timeout_seconds,
                    stream=True,
                    verify=False,  # We inspect TLS separately; allow response inspection even if cert untrusted
                )
            except requests.exceptions.Timeout:
                raise TimeoutError(
                    f"Délai d'attente dépassé ({int(timeout_seconds * 1000)}ms) "
                    f"lors de la requête vers {current_url}."
                )
            except requests.exceptions.RequestException as e:
                raise ConnectionError(f"Erreur de connexion vers {current_url} : {e}")

            # Check for redirect
            if res.status_code in (301, 302, 303, 307, 308):
                location = res.headers.get("Location")
                if location:
                    redirect_count += 1
                    if redirect_count > max_redirects:
                        raise ValueError(
                            f"Trop de redirections détectées (limite fixée à {max_redirects})."
                        )
                    next_url = urljoin(current_url, location)
                    redirect_chain.append(next_url)
                    current_url = next_url
                    res.close()
                    continue

            # Non-redirect response reached: read body safely
            content_chunks = []
            bytes_read = 0
            for chunk in res.iter_content(chunk_size=8192):
                if chunk:
                    bytes_read += len(chunk)
                    if bytes_read > max_bytes:
                        excess = bytes_read - max_bytes
                        content_chunks.append(chunk[:-excess])
                        break
                    content_chunks.append(chunk)

            raw_bytes = b"".join(content_chunks)
            encoding = res.encoding or "utf-8"
            try:
                body = raw_bytes.decode(encoding, errors="replace")
            except Exception:
                body = raw_bytes.decode("utf-8", errors="replace")

            latency_ms = int((time.time() - start_time) * 1000)

            # Normalise headers to lower-case
            raw_headers: Dict[str, str] = {
                k.lower(): v for k, v in res.headers.items()
            }

            # Extract Set-Cookie headers
            set_cookie_headers: List[str] = []
            raw_response_headers = getattr(res.raw, "headers", None)
            if raw_response_headers is not None:
                if hasattr(raw_response_headers, "getlist"):
                    set_cookie_headers = list(raw_response_headers.getlist("set-cookie"))
                elif hasattr(raw_response_headers, "get_all"):
                    set_cookie_headers = list(raw_response_headers.get_all("set-cookie") or [])

            if not set_cookie_headers and "set-cookie" in raw_headers:
                set_cookie_headers = [raw_headers["set-cookie"]]

            return HttpResponse(
                url=current_url,
                status_code=res.status_code,
                status_text=res.reason or "",
                headers=raw_headers,
                set_cookie_headers=set_cookie_headers,
                body=body,
                latency_ms=latency_ms,
                redirect_count=redirect_count,
                redirect_chain=redirect_chain,
            )

        raise ValueError("Impossible de compléter la requête HTTP dans la limite des redirections.")
    finally:
        session.close()
