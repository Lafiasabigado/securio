"""Securio - Fast, passive security health scanner for public websites."""

from .models import (
    CategorySummary,
    Finding,
    OriginTelemetry,
    ScanResult,
    ScanStats,
    ValidatedTarget,
)
from .scanner import run_security_scan, scan_url
from .ssrf import is_private_or_reserved_ip, validate_and_resolve_target, validate_public_host

__version__ = "0.1.2"

__all__ = [
    "run_security_scan",
    "scan_url",
    "validate_and_resolve_target",
    "validate_public_host",
    "is_private_or_reserved_ip",
    "Finding",
    "ScanResult",
    "ScanStats",
    "OriginTelemetry",
    "CategorySummary",
    "ValidatedTarget",
]
