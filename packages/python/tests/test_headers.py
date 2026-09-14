import unittest
from securio.checks.headers import analyze_security_headers


class TestHeaderChecks(unittest.TestCase):
    def test_missing_all_headers(self):
        findings = analyze_security_headers({})
        ids = [f.id for f in findings]

        self.assertIn("header-csp-missing", ids)
        self.assertIn("header-hsts-missing", ids)
        self.assertIn("header-xcto-missing", ids)
        self.assertIn("header-xfo-missing", ids)
        self.assertIn("header-referrer-missing", ids)
        self.assertIn("header-permissions-missing", ids)

    def test_all_headers_secure(self):
        headers = {
            "content-security-policy": "default-src 'self'; script-src 'self'",
            "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
            "x-content-type-options": "nosniff",
            "x-frame-options": "DENY",
            "referrer-policy": "strict-origin-when-cross-origin",
            "permissions-policy": "camera=(), microphone=()",
        }
        findings = analyze_security_headers(headers)
        for f in findings:
            self.assertEqual(f.status, "pass", f"Finding {f.id} should pass")

    def test_permissive_csp(self):
        headers = {
            "content-security-policy": "default-src 'self'; script-src *",
        }
        findings = analyze_security_headers(headers)
        f = next(item for item in findings if item.id == "header-csp-permissive")
        self.assertEqual(f.status, "warning")
        self.assertEqual(f.severity, "medium")

    def test_short_hsts(self):
        headers = {
            "strict-transport-security": "max-age=3600",
        }
        findings = analyze_security_headers(headers)
        f = next(item for item in findings if item.id == "header-hsts-short-maxage")
        self.assertEqual(f.status, "warning")

    def test_unsafe_referrer_policy(self):
        headers = {
            "referrer-policy": "unsafe-url",
        }
        findings = analyze_security_headers(headers)
        f = next(item for item in findings if item.id == "header-referrer-unsafe")
        self.assertEqual(f.status, "warning")

    def test_frame_ancestors_in_csp_covers_clickjacking(self):
        headers = {
            "content-security-policy": "frame-ancestors 'self'",
        }
        findings = analyze_security_headers(headers)
        f = next(item for item in findings if item.id == "header-xfo-pass")
        self.assertEqual(f.status, "pass")


if __name__ == "__main__":
    unittest.main()
