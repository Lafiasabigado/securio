import unittest
from securio.models import Finding
from securio.rules import (
    build_category_summaries,
    compute_scan_score,
    sort_findings,
)


class TestScoreAndRules(unittest.TestCase):
    def test_perfect_score(self):
        findings = [
            Finding(
                id="https-enabled",
                category="https",
                category_title="HTTPS & Transport",
                title="HTTPS activé",
                severity="low",
                status="pass",
                description="",
                recommendation="",
            )
        ]
        score, status, grade, summary = compute_scan_score(findings)
        self.assertEqual(score, 100)
        self.assertEqual(status, "excellent")
        self.assertEqual(grade, "A+")

    def test_penalty_critical_fail(self):
        findings = [
            Finding(
                id="https-missing",
                category="https",
                category_title="HTTPS & Transport",
                title="Connexion non chiffrée",
                severity="critical",
                status="fail",
                description="",
                recommendation="",
            )
        ]
        score, status, grade, summary = compute_scan_score(findings)
        # 100 - 25 = 75
        self.assertEqual(score, 75)
        self.assertEqual(status, "good")
        self.assertEqual(grade, "B")

    def test_penalty_warning(self):
        findings = [
            Finding(
                id="header-xcto-missing",
                category="headers",
                category_title="En-têtes de sécurité",
                title="X-Content-Type-Options manquant",
                severity="medium",
                status="warning",
                description="",
                recommendation="",
            )
        ]
        # medium weight = 8, 8 * 0.4 = 3.2 -> round is 3
        # 100 - 3 = 97
        score, status, grade, summary = compute_scan_score(findings)
        self.assertEqual(score, 97)
        self.assertEqual(status, "excellent")
        self.assertEqual(grade, "A+")

    def test_score_floor_at_zero(self):
        findings = [
            Finding(
                id=f"crit-{i}",
                category="https",
                category_title="HTTPS",
                title=f"Critical {i}",
                severity="critical",
                status="fail",
                description="",
                recommendation="",
            )
            for i in range(10)  # 10 * 25 = 250 penalty
        ]
        score, status, grade, summary = compute_scan_score(findings)
        self.assertEqual(score, 0)
        self.assertEqual(status, "critical")
        self.assertEqual(grade, "F")

    def test_sorting_order(self):
        f_pass = Finding("1", "https", "HTTPS", "Z Pass", "low", "pass", "", "")
        f_warn = Finding("2", "headers", "Headers", "B Warn", "medium", "warning", "", "")
        f_fail_high = Finding("3", "headers", "Headers", "C Fail High", "high", "fail", "", "")
        f_fail_crit = Finding("4", "https", "HTTPS", "A Fail Crit", "critical", "fail", "", "")

        sorted_res = sort_findings([f_pass, f_warn, f_fail_high, f_fail_crit])
        self.assertEqual(sorted_res[0].id, "4")  # critical fail
        self.assertEqual(sorted_res[1].id, "3")  # high fail
        self.assertEqual(sorted_res[2].id, "2")  # warning
        self.assertEqual(sorted_res[3].id, "1")  # pass

    def test_category_summaries(self):
        findings = [
            Finding("1", "https", "HTTPS & Transport", "HTTPS OK", "low", "pass", "", ""),
            Finding("2", "headers", "En-têtes", "CSP Absent", "high", "fail", "", ""),
        ]
        summaries = build_category_summaries(findings)
        self.assertIn("https", summaries)
        self.assertIn("headers", summaries)

        self.assertEqual(summaries["https"].status, "pass")
        self.assertEqual(summaries["https"].score, 100)

        self.assertEqual(summaries["headers"].status, "fail")
        self.assertLess(summaries["headers"].score, 100)


if __name__ == "__main__":
    unittest.main()
