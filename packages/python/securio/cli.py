from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import List, Optional

from .models import Finding, ScanResult
from .scanner import run_security_scan
from .ssrf import validate_and_resolve_target

__version__ = "0.1.3"

# ANSI terminal colors (gracefully disabled when not in TTY or NO_COLOR is set)
_IS_TTY = sys.stdout.isatty() and "NO_COLOR" not in os.environ


def _c(code: str, text: str) -> str:
    if not _IS_TTY:
        return text
    return f"\033[{code}m{text}\033[0m"


def bold(text: str) -> str:
    return _c("1", text)


def dim(text: str) -> str:
    return _c("2", text)


def green(text: str) -> str:
    return _c("32", text)


def yellow(text: str) -> str:
    return _c("33", text)


def red(text: str) -> str:
    return _c("31", text)


def blue(text: str) -> str:
    return _c("94", text)


def cyan(text: str) -> str:
    return _c("36", text)


def gray(text: str) -> str:
    return _c("90", text)


BANNER_ASCII = [
    " ███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗ ██████╗ ",
    " ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██║██╔═══██╗",
    " ███████╗█████╗  ██║     ██║   ██║██████╔╝██║██║   ██║",
    " ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██║██║   ██║",
    " ███████║███████╗╚██████╗╚██████╔╝██║  ██║██║╚██████╔╝",
    " ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ",
]


def print_banner(animated: bool = False) -> None:
    print()
    for line in BANNER_ASCII:
        print(blue(line))
        if animated and _IS_TTY:
            time.sleep(0.015)
    print()
    print(f" {bold('Securio CLI')} {gray(f'v{__version__}')}  {yellow(bold('[Python Edition]'))}")
    print(f" {gray('Security made visible.')}")
    print()


def print_progress_step(name: str) -> None:
    print(f"   {green('✓')} {name}")


def print_report(result: ScanResult) -> None:
    hr = gray("─" * 50)
    print()
    print(f" {bold('Securio Report')}")
    print(f" Cible   : {cyan(result.url)}")
    if result.telemetry.ip:
        srv = result.telemetry.server_header or "Inconnu"
        print(f" {gray(f'IP      : {result.telemetry.ip} • Latence : {result.telemetry.latency_ms}ms • Serveur : {srv}')}")
    print()

    # Category breakdown overview (structured tree)
    category_order = [
        ("https", "HTTPS & Transport"),
        ("headers", "En-têtes de sécurité"),
        ("cookies", "Cookies"),
        ("mixed_content", "Contenu mixte"),
        ("forms", "Formulaires"),
        ("technology", "Technologies exposées"),
    ]

    for cat_key, cat_title in category_order:
        cat_findings = [f for f in result.findings if f.category == cat_key]
        if not cat_findings:
            continue
        print(f" {cyan('●')} {bold(cat_title)}")
        for f in cat_findings:
            if f.status == "pass":
                icon = green("✓")
                print(f"   {icon} {f.title}")
            elif f.status == "warning":
                icon = yellow("⚠")
                print(f"   {icon} {bold(f.title)}")
            else:
                icon = red("✗")
                print(f"   {icon} {bold(f.title)}")
        print()

    print(f" {hr}")

    # Score & Status
    status_label = {
        "excellent": "EXCELLENT",
        "good": "BON",
        "warning": "À AMÉLIORER",
        "critical": "CRITIQUE",
    }.get(result.status, result.status.upper())

    score_color = (
        green if result.score >= 75 else (yellow if result.score >= 50 else red)
    )

    print()
    print(f" Score : {score_color(bold(f'{result.score}/100'))} {gray(f'(Note : {result.grade})')}")
    print(f" Statut : {score_color(bold(status_label))}")

    issue_count = result.stats.warning + result.stats.critical
    if issue_count == 0:
        print()
        print(f" {green('✓')} {bold('Félicitations ! Aucun problème de sécurité passif détecté.')}")
    else:
        issue_text = (
            "1 problème nécessite"
            if issue_count == 1
            else f"{issue_count} problèmes nécessitent"
        )
        print()
        print(f" {yellow('⚠')} {bold(f'{issue_text} votre attention.')}")

    print()
    print(f" {hr}")

    # Detailed actionable issues
    issues = [f for f in result.findings if f.status in ("fail", "warning")]

    if issues:
        print()
        print(bold(" Points d'attention et recommandations :"))
        print()

        for issue in issues:
            severity_badge = {
                "critical": red("[CRITICAL]"),
                "high": red("[HIGH]"),
                "medium": yellow("[MEDIUM]"),
                "low": cyan("[LOW]"),
                "info": gray("[INFO]"),
            }.get(issue.severity, f"[{issue.severity.upper()}]")

            status_icon = red("✗") if issue.status == "fail" else yellow("⚠")

            print(f" {status_icon} {severity_badge} {bold(issue.title)}")
            print(f"   {issue.description}")

            if issue.detected_value:
                print(f"\n   {gray('Valeur détectée :')} {cyan(issue.detected_value)}")

            if issue.importance:
                print(f"\n   {bold('Pourquoi ?')}")
                print(f"   {gray(issue.importance)}")

            if issue.recommendation:
                print(f"\n   {bold('Comment corriger ?')}")
                print(f"   {issue.recommendation}")

            if issue.remediation_snippet:
                print(f"\n   {gray('Exemple de configuration :')}")
                for line in issue.remediation_snippet.splitlines():
                    print(f"     {cyan(line)}")

            if issue.cwe:
                print(f"\n   {gray(f'Référence : {issue.cwe}')}")

            print()
            print(f" {gray('·' * 50)}")
            print()

    # Summary count
    print(
        f" Contrôles réussis : {green(str(result.stats.passed))} • "
        f"Avertissements : {yellow(str(result.stats.warning))} • "
        f"Critiques : {red(str(result.stats.critical))}"
    )
    print(f" {hr}")
    print(f" {dim('Analyse passive Securio (Python Engine) • Aucun test intrusif effectué.')}")
    print()


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="securio",
        description="Securio - Fast, passive security health scanner for public websites.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  securio https://example.com
  securio https://example.com --json
  securio
        """,
    )
    parser.add_argument(
        "url",
        nargs="?",
        help="L'URL du site web à analyser (ex: https://example.com).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Sortie au format JSON pour l'intégration CI/CD.",
    )
    parser.add_argument(
        "--no-banner",
        action="store_true",
        dest="no_banner",
        help="Masquer la bannière ASCII au démarrage.",
    )
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}"
    parser.add_argument(
        "-v",
        "--version",
        action="version",
        version=f"%(prog)s {__version__} (Python {py_ver})",
        help="Afficher la version du scanner.",
    )
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = create_parser()
    args = parser.parse_args(argv)

    target_url = args.url
    is_json = args.json_output

    # Step 0: Display banner upfront if human terminal output
    if not is_json and not args.no_banner:
        print_banner(animated=True)

    # Interactive mode if no target URL is provided
    if not target_url:
        if is_json:
            print(
                json.dumps(
                    {"error": "Une URL cible est obligatoire lorsque l'option --json est utilisée."},
                    ensure_ascii=False,
                ),
                file=sys.stderr,
            )
            return 2

        try:
            target_url = input(f" {bold('URL à analyser :')}\n > ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAbandon.")
            return 2

        if not target_url:
            print(f" {red('✗ Aucune URL spécifiée. Abandon.')}")
            return 2
        print()

    # Step 1: Validate URL & anti-SSRF protections
    try:
        validated_target = validate_and_resolve_target(target_url)
    except ValueError as e:
        if is_json:
            print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        else:
            print(f" {red('✗')} Erreur de validation : {e}", file=sys.stderr)
        return 2

    # Step 2: Run scan
    if not is_json:
        print(f" {bold('Analyse de')} {cyan(validated_target.normalized_url)}")
        print()

    try:
        progress_cb = None if is_json else print_progress_step
        result = run_security_scan(validated_target, on_progress=progress_cb)
    except Exception as e:
        if is_json:
            print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        else:
            print(f"\n {red('✗')} Échec de l'analyse : {e}", file=sys.stderr)
        return 2

    # Step 3: Render report
    if is_json:
        data = result.to_dict()
        data["engine"] = f"python/{sys.version_info.major}.{sys.version_info.minor}"
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print()
        print(f" {green('✓')} {bold('Analyse terminée.')}")
        print_report(result)

    # Exit code: 1 if any critical/fail finding exists, 0 otherwise
    if result.stats.critical > 0:
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
