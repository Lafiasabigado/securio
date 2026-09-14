import unittest
from securio.checks.forms import analyze_forms


class TestFormsChecks(unittest.TestCase):
    def test_no_forms(self):
        html = "<html><body><h1>Hello World</h1><p>No forms here</p></body></html>"
        findings = analyze_forms(html, is_https=True)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].id, "forms-none")
        self.assertEqual(findings[0].status, "pass")

    def test_secure_forms_https_and_relative(self):
        html = """
        <html>
        <body>
            <form action="/login" method="POST">
                <input type="text" name="user">
            </form>
            <form action="https://api.example.com/checkout" method="POST">
                <input type="text" name="cart">
            </form>
        </body>
        </html>
        """
        findings = analyze_forms(html, is_https=True)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].id, "forms-secure-action")
        self.assertEqual(findings[0].status, "pass")

    def test_insecure_form_action_http(self):
        html = """
        <html>
        <body>
            <form action="http://insecure.example.com/api/submit" method="POST">
                <input type="text" name="email">
            </form>
        </body>
        </html>
        """
        findings = analyze_forms(html, is_https=True)
        self.assertEqual(len(findings), 1)
        f = findings[0]
        self.assertEqual(f.id, "forms-insecure-action")
        self.assertEqual(f.status, "fail")
        self.assertEqual(f.severity, "critical")

    def test_password_field_on_plain_http_page(self):
        html = """
        <html>
        <body>
            <form action="/auth" method="POST">
                <input type="text" name="username">
                <input type="password" name="password">
            </form>
        </body>
        </html>
        """
        findings = analyze_forms(html, is_https=False)
        ids = [f.id for f in findings]
        self.assertIn("forms-password-http", ids)
        f = next(item for item in findings if item.id == "forms-password-http")
        self.assertEqual(f.status, "fail")
        self.assertEqual(f.severity, "critical")


if __name__ == "__main__":
    unittest.main()
