import unittest
from securio.checks.mixed_content import detect_mixed_content


class TestMixedContentChecks(unittest.TestCase):
    def test_clean_https_page(self):
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.example.com/app.js"></script>
            <link rel="stylesheet" href="/assets/style.css">
        </head>
        <body>
            <img src="https://images.example.com/logo.png" alt="Logo">
            <iframe src="https://secure.example.com/frame"></iframe>
        </body>
        </html>
        """
        findings = detect_mixed_content(html, is_https=True)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].id, "mixed-content-pass")
        self.assertEqual(findings[0].status, "pass")

    def test_active_mixed_content_script_and_iframe(self):
        html = """
        <html>
        <head>
            <script src="http://insecure.example.com/evil.js"></script>
        </head>
        <body>
            <iframe src="http://insecure.example.com/widget"></iframe>
        </body>
        </html>
        """
        findings = detect_mixed_content(html, is_https=True)
        self.assertEqual(len(findings), 1)
        f = findings[0]
        self.assertEqual(f.id, "mixed-content-detected")
        self.assertEqual(f.status, "fail")
        self.assertEqual(f.severity, "high")
        self.assertIn("insecure.example.com/evil.js", f.detected_value or "")

    def test_passive_mixed_content_image(self):
        html = """
        <html>
        <body>
            <img src="http://insecure.example.com/banner.jpg" alt="Banner">
        </body>
        </html>
        """
        findings = detect_mixed_content(html, is_https=True)
        self.assertEqual(len(findings), 1)
        f = findings[0]
        self.assertEqual(f.id, "mixed-content-detected")
        self.assertEqual(f.status, "fail")
        self.assertEqual(f.severity, "medium")

    def test_skipped_on_http_or_empty(self):
        findings_http = detect_mixed_content("<html><img src='http://test.com/a.png'></html>", is_https=False)
        self.assertEqual(findings_http[0].id, "mixed-content-skipped")
        self.assertEqual(findings_http[0].status, "pass")

        findings_empty = detect_mixed_content("", is_https=True)
        self.assertEqual(findings_empty[0].id, "mixed-content-skipped")


if __name__ == "__main__":
    unittest.main()
