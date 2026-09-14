from __future__ import annotations

from typing import Dict, List, Tuple
from .models import CategorySummary, Finding, FindingStatus, ScanStatus, Severity

SEVERITY_WEIGHTS: Dict[Severity, int] = {
    "critical": 25,
    "high": 15,
    "medium": 8,
    "low": 3,
    "info": 0,
}

SEVERITY_ORDER: Dict[Severity, int] = {
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 4,
    "info": 5,
}

STATUS_ORDER: Dict[FindingStatus, int] = {
    "fail": 1,
    "warning": 2,
    "pass": 3,
}

CATEGORIES_CONFIG: Dict[str, str] = {
    "https": "HTTPS & Transport",
    "headers": "En-têtes de sécurité",
    "cookies": "Cookies",
    "mixed_content": "Contenu mixte",
    "forms": "Formulaires",
    "technology": "Technologies exposées",
}


def sort_findings(findings: List[Finding]) -> List[Finding]:
    return sorted(
        findings,
        key=lambda f: (
            STATUS_ORDER.get(f.status, 99),
            SEVERITY_ORDER.get(f.severity, 99),
            f.title.lower(),
        ),
    )


def compute_scan_score(findings: List[Finding]) -> Tuple[int, ScanStatus, str, str]:
    penalty = 0
    for finding in findings:
        weight = SEVERITY_WEIGHTS.get(finding.severity, 0)
        if finding.status == "fail":
            penalty += weight
        elif finding.status == "warning":
            penalty += round(weight * 0.4)

    score = max(0, min(100, 100 - penalty))

    if score >= 90:
        status: ScanStatus = "excellent"
        grade = "A+" if score >= 95 else "A"
        summary = (
            "Excellente posture de sécurité périmétrique. Vos en-têtes et "
            "protocoles respectent rigoureusement les recommandations de l'OWASP."
        )
    elif score >= 75:
        status = "good"
        grade = "B+" if score >= 82 else "B"
        summary = (
            "Bonne posture de sécurité globale avec quelques écarts de "
            "configuration ou en-têtes défensifs recommandés à consolider."
        )
    elif score >= 50:
        status = "warning"
        grade = "C"
        summary = (
            "Posture de sécurité intermédiaire avec des vulnérabilités de "
            "configuration exposées (CSP ou protections cross-origin absentes)."
        )
    else:
        status = "critical"
        grade = "F"
        summary = (
            "Risque critique identifié : absence de HTTPS valide ou manque "
            "flagrant des principaux mécanismes défensifs contre les injections."
        )

    return score, status, grade, summary


def build_category_summaries(findings: List[Finding]) -> Dict[str, CategorySummary]:
    summaries: Dict[str, CategorySummary] = {}

    for cat_key, cat_title in CATEGORIES_CONFIG.items():
        cat_findings = [f for f in findings if f.category == cat_key]
        total = len(cat_findings)
        passed = len([f for f in cat_findings if f.status == "pass"])

        cat_score = 100
        if total > 0:
            penalty = 0
            for f in cat_findings:
                if f.status == "fail":
                    penalty += 40 if f.severity == "critical" else (25 if f.severity == "high" else 15)
                elif f.status == "warning":
                    penalty += 10
            cat_score = max(0, 100 - penalty)

        has_fail = any(f.status == "fail" for f in cat_findings)
        has_warning = any(f.status == "warning" for f in cat_findings)
        worst_status: FindingStatus = "fail" if has_fail else ("warning" if has_warning else "pass")

        summaries[cat_key] = CategorySummary(
            category=cat_key,
            title=cat_title,
            score=cat_score,
            status=worst_status,
            passed_count=passed,
            total_count=total,
        )

    return summaries
