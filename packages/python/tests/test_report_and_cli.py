import io
import json
import unittest
from unittest.mock import patch

from securio import cli
from securio.models import (
    CategorySummary,
    Finding,
    OriginTelemetry,
    ScanResult,
    ScanStats,
    ValidatedTarget,
)


def make_dummy_result(score=86, status="good", critical_count=0) -> ScanResult:
    return ScanResult(
        id="scn_dummy123",
        url="https://example.com",
        domain="example.com",
        protocol="https:",
        timestamp="2026-09-14T12:00:00Z",
        score=score,
        status=status,
        grade="B",
        summary="Bonne posture de sécurité globale",
        stats=ScanStats(
            passed=5,
            warning=1,
            critical=critical_count,
            total=6 + critical_count,
        ),
        telemetry=OriginTelemetry(
            ip="93.184.216.34",
            server_header="ECS (dcb/7ea3)",
            tls_version="TLSv1.3",
            latency_ms=45,
            technologies=["Nginx"],
        ),
        categories={
            "https": CategorySummary("https", "HTTPS & Transport", 100, "pass", 3, 3),
            "headers": CategorySummary("headers", "En-têtes", 70, "warning", 2, 3),
        },
        findings=[
            Finding(
                id="https-enabled",
                category="https",
                category_title="HTTPS & Transport",
                title="Chiffrement HTTPS activé",
                severity="low",
                status="pass",
                description="Le site utilise HTTPS.",
                recommendation="Conserver HTTPS.",
            ),
            Finding(
                id="header-csp-missing",
                category="headers",
                category_title="En-têtes de sécurité",
                title="Content-Security-Policy (CSP) est absent",
                severity="high",
                status="warning" if critical_count == 0 else "fail",
                description="CSP est absent.",
                recommendation="Définir CSP.",
                importance="Protège contre XSS.",
            ),
        ],
    )


class TestCliAndReport(unittest.TestCase):
    def test_parser_help_and_version(self):
        parser = cli.create_parser()
        with self.assertRaises(SystemExit) as ctx:
            with patch("sys.stdout", new=io.StringIO()):
                parser.parse_args(["--help"])
        self.assertEqual(ctx.exception.code, 0)

        with self.assertRaises(SystemExit) as ctx:
            with patch("sys.stdout", new=io.StringIO()):
                parser.parse_args(["--version"])
        self.assertEqual(ctx.exception.code, 0)

    @patch("securio.cli.run_security_scan")
    @patch("securio.cli.validate_and_resolve_target")
    def test_cli_json_output(self, mock_validate, mock_scan):
        mock_validate.return_value = ValidatedTarget(
            raw_url="https://example.com",
            normalized_url="https://example.com/",
            scheme="https",
            hostname="example.com",
            port=443,
            ip="93.184.216.34",
        )
        dummy = make_dummy_result(score=86, status="good", critical_count=0)
        mock_scan.return_value = dummy

        stdout_buf = io.StringIO()
        with patch("sys.stdout", stdout_buf):
            exit_code = cli.main(["https://example.com", "--json"])

        self.assertEqual(exit_code, 0)
        output_data = json.loads(stdout_buf.getvalue())
        self.assertEqual(output_data["url"], "https://example.com")
        self.assertEqual(output_data["score"], 86)
        self.assertEqual(output_data["status"], "good")
        self.assertEqual(len(output_data["findings"]), 2)

    @patch("securio.cli.run_security_scan")
    @patch("securio.cli.validate_and_resolve_target")
    def test_cli_human_report(self, mock_validate, mock_scan):
        mock_validate.return_value = ValidatedTarget(
            raw_url="https://example.com",
            normalized_url="https://example.com/",
            scheme="https",
            hostname="example.com",
            port=443,
            ip="93.184.216.34",
        )
        dummy = make_dummy_result(score=86, status="good", critical_count=0)
        mock_scan.return_value = dummy

        stdout_buf = io.StringIO()
        with patch("sys.stdout", stdout_buf):
            exit_code = cli.main(["https://example.com"])

        self.assertEqual(exit_code, 0)
        output = stdout_buf.getvalue()
        self.assertIn("Securio CLI", output)
        self.assertIn("Securio Report", output)
        self.assertIn("Score :", output)
        self.assertIn("Statut : BON", output)
        self.assertIn("Content-Security-Policy (CSP) est absent", output)

    @patch("securio.cli.run_security_scan")
    @patch("securio.cli.validate_and_resolve_target")
    def test_cli_critical_exit_code(self, mock_validate, mock_scan):
        mock_validate.return_value = ValidatedTarget(
            raw_url="http://insecure.test",
            normalized_url="http://insecure.test/",
            scheme="http",
            hostname="insecure.test",
            port=80,
            ip="93.184.216.34",
        )
        dummy = make_dummy_result(score=25, status="critical", critical_count=1)
        mock_scan.return_value = dummy

        stdout_buf = io.StringIO()
        with patch("sys.stdout", stdout_buf):
            exit_code = cli.main(["http://insecure.test"])

        self.assertEqual(exit_code, 1)

    @patch("builtins.input", return_value="https://example.com")
    @patch("securio.cli.run_security_scan")
    @patch("securio.cli.validate_and_resolve_target")
    def test_cli_interactive_prompt(self, mock_validate, mock_scan, mock_input):
        mock_validate.return_value = ValidatedTarget(
            raw_url="https://example.com",
            normalized_url="https://example.com/",
            scheme="https",
            hostname="example.com",
            port=443,
            ip="93.184.216.34",
        )
        mock_scan.return_value = make_dummy_result()

        stdout_buf = io.StringIO()
        with patch("sys.stdout", stdout_buf):
            exit_code = cli.main([])

        self.assertEqual(exit_code, 0)
        self.assertIn("Securio Report", stdout_buf.getvalue())

    def test_cli_ssrf_rejection(self):
        stderr_buf = io.StringIO()
        with patch("sys.stderr", stderr_buf):
            exit_code = cli.main(["http://127.0.0.1"])
        self.assertEqual(exit_code, 2)
        self.assertIn("privée ou réservée", stderr_buf.getvalue())


if __name__ == "__main__":
    unittest.main()
