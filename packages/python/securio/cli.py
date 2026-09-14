from __future__ import annotations

import argparse
import json
import os
import sys
from typing import List, Optional

from .models import Finding, ScanResult
from .scanner import run_security_scan
from .ssrf import validate_and_resolve_target

__version__ = "0.1.0"

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


def cyan(text: str) -> str:
    return _c("36", text)


def gray(text: str) -> str:
    return _c("90", text)


def print_banner() -> None:
    print(bold("Securio CLI"))
    print(gray("Security Health Scanner"))
    print()


def print_progress_step(name: str) -> None:
    print(f"  {green('✓')} {name}")


def print_report(result: ScanResult) -> None:
    hr = gray("─" * 50)
    print()
    print(bold("Securio Report"))
    print(f"Cible : {cyan(result.url)}")
    if result.telemetry.ip:
        print(
            gray(
                f"IP : {result.telemetry.ip} • Latence : {result.telemetry.latency_ms}ms • "
                f"Serveur : {result.telemetry.server_header or 'Inconnu'}"
            )
        )
    print()

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

    print(f"Score : {score_color(bold(f'{result.score}/100'))}")
    print(f"Statut : {score_color(bold(status_label))}")
    print()
    print(hr)

    # Detailed issues
    issues = [f for f in result.findings if f.status in ("fail", "warning")]
    passed = [f for f in result.findings if f.status == "pass"]

    if issues:
        print()
        print(bold("Points d'attention et recommandations :"))
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

            print(f"{status_icon} {severity_badge} {bold(issue.title)}")
            print()
            print(f"  Description:\n  {issue.description}")
            print()

            if issue.detected_value:
                print(f"  Valeur détectée:\n  {cyan(issue.detected_value)}")
                print()

            if issue.importance:
                print(f"  Importance:\n  {issue.importance}")
                print()

            if issue.recommendation:
                print(f"  Recommendation:\n  {issue.recommendation}")
                print()

            if issue.remediation_snippet:
                print("  Configuration suggérée:")
                for line in issue.remediation_snippet.splitlines():
                    print(f"    {cyan(line)}")
                print()

            if issue.cwe:
                print(f"  Référence: {gray(issue.cwe)}")
                print()

            print(gray("·" * 50))
            print()
    else:
        print()
        print(f"  {green('✓')} {bold('Félicitations ! Aucun problème de sécurité passif détecté.')}")
        print()

    # Summary count
    print(
        f"Contrôles réussis : {green(str(result.stats.passed))} • "
        f"Avertissements : {yellow(str(result.stats.warning))} • "
        f"Critiques : {red(str(result.stats.critical))}"
    )
    print(hr)
    print(dim("Analyse passive Securio • Aucun test intrusif effectué."))
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
        "-v",
        "--version",
        action="version",
        version=f"%(prog)s {__version__}",
        help="Afficher la version du scanner.",
    )
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = create_parser()
    args = parser.parse_args(argv)

    target_url = args.url
    is_json = args.json_output

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

        print(bold("Securio"))
        print()
        try:
            target_url = input("URL à analyser :\n> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAbandon.")
            return 2

        if not target_url:
            print(red("✗ Aucune URL spécifiée. Abandon."))
            return 2
        print()

    # Step 1: Validate URL & anti-SSRF protections
    try:
        validated_target = validate_and_resolve_target(target_url)
    except ValueError as e:
        if is_json:
            print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        else:
            print(f"{red('✗')} Erreur de validation : {e}", file=sys.stderr)
        return 2

    # Step 2: Run scan
    if not is_json:
        print_banner()
        print(f"Analyse de {cyan(validated_target.normalized_url)}")
        print()

    try:
        progress_cb = None if is_json else print_progress_step
        result = run_security_scan(validated_target, on_progress=progress_cb)
    except Exception as e:
        if is_json:
            print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        else:
            print(f"\n{red('✗')} Échec de l'analyse : {e}", file=sys.stderr)
        return 2

    # Step 3: Render report
    if is_json:
        print(json.dumps(result.to_dict(), indent=2, ensure_ascii=False))
    else:
        print()
        print("Analyse terminée.")
        print_report(result)

    # Exit code: 1 if any critical/fail finding exists, 0 otherwise
    if result.stats.critical > 0:
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
