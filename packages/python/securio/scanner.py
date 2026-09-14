from __future__ import annotations

import datetime
import secrets
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, List, Optional

from .checks.cookies import analyze_cookies
from .checks.forms import analyze_forms
from .checks.headers import analyze_security_headers
from .checks.https import (
    TlsAuditResult,
    analyze_https,
    check_http_to_https_redirect,
    inspect_tls_certificate,
)
from .checks.mixed_content import detect_mixed_content
from .checks.technology import detect_technologies
from .http import fetch_with_security_limits
from .models import Finding, OriginTelemetry, ScanResult, ScanStats, ValidatedTarget
from .rules import build_category_summaries, compute_scan_score, sort_findings
from .ssrf import validate_and_resolve_target

ProgressCallback = Callable[[str], None]


def run_security_scan(
    target: ValidatedTarget,
    on_progress: Optional[ProgressCallback] = None,
) -> ScanResult:
    scan_id = f"scn_{secrets.token_hex(6)}"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    is_https = target.scheme == "https"
    hostname = target.hostname

    fallback_tls = TlsAuditResult(
        valid=False, error="Protocole non HTTPS"
    )

    # 1. Telemetry collection
    with ThreadPoolExecutor(max_workers=3) as executor:
        tls_future = (
            executor.submit(inspect_tls_certificate, hostname, target.port)
            if is_https
            else None
        )
        redirect_future = executor.submit(check_http_to_https_redirect, hostname)
        http_future = executor.submit(fetch_with_security_limits, target.normalized_url)

        tls_audit = tls_future.result() if tls_future else fallback_tls
        http_redirect = redirect_future.result()
        http_response = http_future.result()

    all_findings: List[Finding] = []

    # 2. HTTPS & TLS Checks
    if on_progress:
        on_progress("HTTPS")
    https_findings = analyze_https(target.scheme, tls_audit, http_redirect)
    all_findings.extend(https_findings)

    # 3. Security Headers Checks
    if on_progress:
        on_progress("Security Headers")
    header_findings = analyze_security_headers(http_response.headers)
    all_findings.extend(header_findings)

    # 4. Cookies Checks
    if on_progress:
        on_progress("Cookies")
    cookie_findings = analyze_cookies(http_response.set_cookie_headers, is_https)
    all_findings.extend(cookie_findings)

    # 5. Mixed Content Checks
    if on_progress:
        on_progress("Mixed Content")
    mixed_findings = detect_mixed_content(http_response.body, is_https)
    all_findings.extend(mixed_findings)

    # 6. Forms Checks
    if on_progress:
        on_progress("Forms")
    form_findings = analyze_forms(http_response.body, is_https)
    all_findings.extend(form_findings)

    # 7. Technology Exposure Checks
    if on_progress:
        on_progress("Technology Exposure")
    technologies, tech_findings = detect_technologies(
        http_response.headers, http_response.body
    )
    all_findings.extend(tech_findings)

    # 8. Sorting & Score Computation
    sorted_findings = sort_findings(all_findings)
    score, status, grade, summary = compute_scan_score(sorted_findings)
    category_summaries = build_category_summaries(sorted_findings)

    # 9. Statistics
    passed = sum(1 for f in sorted_findings if f.status == "pass")
    warning = sum(1 for f in sorted_findings if f.status == "warning")
    critical = sum(1 for f in sorted_findings if f.status == "fail")

    stats = ScanStats(
        passed=passed,
        warning=warning,
        critical=critical,
        total=len(sorted_findings),
    )

    telemetry = OriginTelemetry(
        ip=target.ip,
        server_header=http_response.headers.get("server", "Masqué / Non déclaré"),
        tls_version=tls_audit.version or ("TLS 1.2+" if is_https else "Non chiffré"),
        tls_cipher=tls_audit.cipher,
        cert_valid_until=tls_audit.valid_to,
        cert_days_remaining=tls_audit.days_remaining,
        cert_issuer=tls_audit.issuer,
        alpn=tls_audit.alpn,
        dnssec=False,
        resolved_at=timestamp,
        latency_ms=http_response.latency_ms,
        technologies=technologies,
    )

    return ScanResult(
        id=scan_id,
        url=target.normalized_url,
        domain=hostname,
        protocol=f"{target.scheme}:",
        timestamp=timestamp,
        score=score,
        status=status,
        grade=grade,
        summary=summary,
        stats=stats,
        telemetry=telemetry,
        categories=category_summaries,
        findings=sorted_findings,
    )


def scan_url(
    raw_url: str,
    on_progress: Optional[ProgressCallback] = None,
) -> ScanResult:
    target = validate_and_resolve_target(raw_url)
    return run_security_scan(target, on_progress)
