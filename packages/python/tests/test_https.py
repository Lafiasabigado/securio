import unittest
from securio.checks.https import TlsAuditResult, analyze_https


class TestHttpsChecks(unittest.TestCase):
    def test_https_missing(self):
        tls_info = TlsAuditResult(valid=False, error="Non HTTPS")
        findings = analyze_https("http", tls_info, (False, None))

        ids = [f.id for f in findings]
        self.assertIn("https-missing", ids)
        missing_finding = next(f for f in findings if f.id == "https-missing")
        self.assertEqual(missing_finding.severity, "critical")
        self.assertEqual(missing_finding.status, "fail")

    def test_https_valid(self):
        tls_info = TlsAuditResult(
            valid=True,
            version="TLSv1.3",
            cipher="TLS_AES_256_GCM_SHA384",
            issuer="Let's Encrypt",
            days_remaining=75,
        )
        findings = analyze_https("https", tls_info, (True, 301))

        ids = [f.id for f in findings]
        self.assertIn("https-enabled", ids)
        self.assertIn("tls-cert-valid", ids)
        self.assertIn("http-redirect-pass", ids)

        for f in findings:
            self.assertEqual(f.status, "pass")

    def test_tls_invalid_cert(self):
        tls_info = TlsAuditResult(valid=False, error="Certificate expired")
        findings = analyze_https("https", tls_info, (True, 301))

        ids = [f.id for f in findings]
        self.assertIn("tls-cert-invalid", ids)
        invalid_finding = next(f for f in findings if f.id == "tls-cert-invalid")
        self.assertEqual(invalid_finding.severity, "critical")
        self.assertEqual(invalid_finding.status, "fail")

    def test_missing_http_to_https_redirect(self):
        tls_info = TlsAuditResult(valid=True, days_remaining=60)
        findings = analyze_https("https", tls_info, (False, 200))

        ids = [f.id for f in findings]
        self.assertIn("http-redirect-fail", ids)
        redirect_finding = next(f for f in findings if f.id == "http-redirect-fail")
        self.assertEqual(redirect_finding.status, "warning")


if __name__ == "__main__":
    unittest.main()
