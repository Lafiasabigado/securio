import unittest
from securio.checks.technology import detect_technologies


class TestTechnologyExposureChecks(unittest.TestCase):
    def test_clean_response_minimal_footprint(self):
        headers = {
            "content-type": "text/html; charset=utf-8",
        }
        html = "<html><body><h1>Hello World</h1></body></html>"
        technologies, findings = detect_technologies(headers, html)
        self.assertEqual(len(technologies), 0)
        self.assertEqual(findings[0].id, "tech-none-exposed")
        self.assertEqual(findings[0].status, "pass")

    def test_server_header_and_cdn_detected(self):
        headers = {
            "server": "nginx/1.24.0",
            "cf-ray": "89374020942-CDG",
        }
        html = "<html><body>Welcome</body></html>"
        technologies, findings = detect_technologies(headers, html)
        self.assertIn("nginx", technologies)
        self.assertIn("Cloudflare", technologies)

        info_finding = next(f for f in findings if f.id == "tech-detected-info")
        self.assertEqual(info_finding.status, "pass")
        self.assertEqual(info_finding.severity, "info")

    def test_x_powered_by_warning(self):
        headers = {
            "x-powered-by": "Express",
        }
        technologies, findings = detect_technologies(headers, "")
        self.assertIn("Express", technologies)
        ids = [f.id for f in findings]
        self.assertIn("tech-xpoweredby-exposed", ids)
        f = next(item for item in findings if item.id == "tech-xpoweredby-exposed")
        self.assertEqual(f.status, "warning")
        self.assertEqual(f.severity, "low")

    def test_framework_footprints_in_dom(self):
        headers = {}
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="generator" content="WordPress 6.5">
        </head>
        <body>
            <script src="/_next/static/chunks/main.js"></script>
            <div id="__NEXT_DATA__">{}</div>
        </body>
        </html>
        """
        technologies, findings = detect_technologies(headers, html)
        self.assertIn("WordPress 6.5", technologies)
        self.assertIn("Next.js", technologies)


if __name__ == "__main__":
    unittest.main()
