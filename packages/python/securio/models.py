from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Literal, Optional

Severity = Literal["critical", "high", "medium", "low", "info"]
FindingStatus = Literal["pass", "warning", "fail"]
ScanStatus = Literal["excellent", "good", "warning", "critical"]
AuditCategory = Literal[
    "https",
    "headers",
    "cookies",
    "mixed_content",
    "forms",
    "technology",
]


@dataclass
class Finding:
    id: str
    category: str
    category_title: str
    title: str
    severity: Severity
    status: FindingStatus
    description: str
    recommendation: str
    importance: str = ""
    remediation_snippet: Optional[str] = None
    detected_value: Optional[str] = None
    cwe: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "category": self.category,
            "categoryTitle": self.category_title,
            "title": self.title,
            "severity": self.severity,
            "status": self.status,
            "description": self.description,
            "importance": self.importance,
            "recommendation": self.recommendation,
        }
        if self.remediation_snippet is not None:
            data["remediationSnippet"] = self.remediation_snippet
        if self.detected_value is not None:
            data["detectedValue"] = self.detected_value
        if self.cwe is not None:
            data["cwe"] = self.cwe
        return data


@dataclass
class CategorySummary:
    category: str
    title: str
    score: int  # 0 to 100
    status: FindingStatus
    passed_count: int
    total_count: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "title": self.title,
            "score": self.score,
            "status": self.status,
            "passedCount": self.passed_count,
            "totalCount": self.total_count,
        }


@dataclass
class OriginTelemetry:
    ip: Optional[str] = None
    server_header: Optional[str] = None
    tls_version: Optional[str] = None
    tls_cipher: Optional[str] = None
    cert_valid_until: Optional[str] = None
    cert_days_remaining: Optional[int] = None
    cert_issuer: Optional[str] = None
    alpn: Optional[str] = None
    dnssec: bool = False
    resolved_at: Optional[str] = None
    latency_ms: int = 0
    technologies: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ip": self.ip,
            "serverHeader": self.server_header,
            "tlsVersion": self.tls_version,
            "tlsCipher": self.tls_cipher,
            "certValidUntil": self.cert_valid_until,
            "certDaysRemaining": self.cert_days_remaining,
            "certIssuer": self.cert_issuer,
            "alpn": self.alpn,
            "dnssec": self.dnssec,
            "resolvedAt": self.resolved_at,
            "latencyMs": self.latency_ms,
            "technologies": self.technologies,
        }


@dataclass
class ScanStats:
    passed: int
    warning: int
    critical: int
    total: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "warning": self.warning,
            "critical": self.critical,
            "total": self.total,
        }


@dataclass
class ScanResult:
    id: str
    url: str
    domain: str
    protocol: str
    timestamp: str
    score: int
    status: ScanStatus
    grade: str
    summary: str
    stats: ScanStats
    telemetry: OriginTelemetry
    categories: Dict[str, CategorySummary]
    findings: List[Finding]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "url": self.url,
            "domain": self.domain,
            "protocol": self.protocol,
            "timestamp": self.timestamp,
            "score": self.score,
            "status": self.status,
            "grade": self.grade,
            "summary": self.summary,
            "stats": self.stats.to_dict(),
            "telemetry": self.telemetry.to_dict(),
            "categories": {k: v.to_dict() for k, v in self.categories.items()},
            "findings": [f.to_dict() for f in self.findings],
        }


@dataclass
class ValidatedTarget:
    raw_url: str
    normalized_url: str
    scheme: str
    hostname: str
    port: int
    ip: str
