import unittest
from securio.checks.cookies import analyze_cookies, parse_cookie_flags


class TestCookieChecks(unittest.TestCase):
    def test_parse_cookie_flags(self):
        cookie_headers = [
            "sessionid=xyz123; Secure; HttpOnly; SameSite=Strict; Path=/",
            "tracker_id=abc; SameSite=Lax",
            "plain=val",
        ]
        flags = parse_cookie_flags(cookie_headers)
        self.assertEqual(len(flags), 3)

        # First cookie
        self.assertEqual(flags[0].name, "sessionid")
        self.assertTrue(flags[0].has_secure)
        self.assertTrue(flags[0].has_httponly)
        self.assertEqual(flags[0].same_site, "strict")

        # Second cookie
        self.assertEqual(flags[1].name, "tracker_id")
        self.assertFalse(flags[1].has_secure)
        self.assertFalse(flags[1].has_httponly)
        self.assertEqual(flags[1].same_site, "lax")

        # Third cookie
        self.assertEqual(flags[2].name, "plain")
        self.assertFalse(flags[2].has_secure)
        self.assertFalse(flags[2].has_httponly)
        self.assertEqual(flags[2].same_site, "missing")

    def test_no_cookies_exposed(self):
        findings = analyze_cookies([], is_https=True)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].id, "cookie-none-exposed")
        self.assertEqual(findings[0].status, "pass")

    def test_all_cookies_secure(self):
        cookies = [
            "session=abc; Secure; HttpOnly; SameSite=Strict",
            "token=123; Secure; HttpOnly; SameSite=Lax",
        ]
        findings = analyze_cookies(cookies, is_https=True)
        for f in findings:
            self.assertEqual(f.status, "pass")

    def test_insecure_cookies_on_https(self):
        cookies = [
            "session=abc; HttpOnly",  # Missing Secure and SameSite
        ]
        findings = analyze_cookies(cookies, is_https=True)
        ids = [f.id for f in findings]
        self.assertIn("cookie-secure-missing", ids)
        self.assertIn("cookie-samesite-missing", ids)
        self.assertIn("cookie-httponly-pass", ids)


if __name__ == "__main__":
    unittest.main()
