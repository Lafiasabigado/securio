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

    def test_unsafe_eval_is_fail(self):
        findings = analyze_security_headers(
            {"content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-eval'"}
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-unsafe")
        self.assertEqual(f.status, "fail")
        self.assertEqual(f.severity, "high")

    def test_unsafe_inline_is_warning(self):
        findings = analyze_security_headers(
            {"content-security-policy": "script-src 'self' 'unsafe-inline'"}
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-permissive")
        self.assertEqual(f.status, "warning")
        self.assertEqual(f.severity, "high")

    def test_strict_dynamic_does_not_flag_unsafe_inline(self):
        findings = analyze_security_headers(
            {
                "content-security-policy": "script-src 'nonce-abc' 'strict-dynamic' 'unsafe-inline'"
            }
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-pass")
        self.assertEqual(f.status, "pass")

    def test_https_scheme_is_warning(self):
        findings = analyze_security_headers(
            {"content-security-policy": "script-src 'self' https:"}
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-permissive")
        self.assertEqual(f.status, "warning")

    def test_data_uri_is_fail(self):
        findings = analyze_security_headers(
            {"content-security-policy": "script-src 'self' data:"}
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-unsafe")
        self.assertEqual(f.status, "fail")

    def test_csp_without_script_src_is_fail(self):
        findings = analyze_security_headers(
            {"content-security-policy": "frame-ancestors 'self'"}
        )
        f = next(item for item in findings if item.id.startswith("header-csp-"))
        self.assertEqual(f.id, "header-csp-unsafe")
        self.assertEqual(f.status, "fail")


if __name__ == "__main__":
    unittest.main()
