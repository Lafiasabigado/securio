import io
import unittest
from unittest.mock import MagicMock, patch

import requests
from securio.http import fetch_with_security_limits


class TestNetworkHandling(unittest.TestCase):
    @patch("requests.Session.get")
    @patch("securio.http.validate_public_host", return_value=(True, "93.184.216.34", None))
    def test_timeout_error(self, mock_validate, mock_get):
        mock_get.side_effect = requests.exceptions.Timeout("Read timed out")

        with self.assertRaises(TimeoutError) as ctx:
            fetch_with_security_limits("https://example.com", timeout_seconds=1.0)
        self.assertIn("Délai d'attente dépassé", str(ctx.exception))

    @patch("requests.Session.get")
    @patch("securio.http.validate_public_host", return_value=(True, "93.184.216.34", None))
    def test_connection_error(self, mock_validate, mock_get):
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")

        with self.assertRaises(ConnectionError) as ctx:
            fetch_with_security_limits("https://example.com")
        self.assertIn("Erreur de connexion", str(ctx.exception))

    @patch("requests.Session.get")
    @patch("securio.http.validate_public_host", return_value=(True, "93.184.216.34", None))
    def test_max_redirects_exceeded(self, mock_validate, mock_get):
        # Create endless redirect response
        mock_res = MagicMock()
        mock_res.status_code = 302
        mock_res.headers = {"Location": "/redirect-loop"}
        mock_get.return_value = mock_res

        with self.assertRaises(ValueError) as ctx:
            fetch_with_security_limits("https://example.com", max_redirects=3)
        self.assertIn("Trop de redirections", str(ctx.exception))

    @patch("requests.Session.get")
    @patch("securio.http.validate_public_host")
    def test_redirect_to_private_ip_blocked(self, mock_validate, mock_get):
        # First hop allowed, second hop redirects to internal host and is blocked
        mock_validate.side_effect = [
            (True, "93.184.216.34", None),
            (False, None, "Domaine privé interdit"),
        ]
        mock_res = MagicMock()
        mock_res.status_code = 302
        mock_res.headers = {"Location": "http://192.168.1.1/admin"}
        mock_get.return_value = mock_res

        with self.assertRaises(ValueError) as ctx:
            fetch_with_security_limits("https://example.com")
        self.assertIn("Redirection non autorisée", str(ctx.exception))

    @patch("requests.Session.get")
    @patch("securio.http.validate_public_host", return_value=(True, "93.184.216.34", None))
    def test_max_bytes_truncation(self, mock_validate, mock_get):
        mock_res = MagicMock()
        mock_res.status_code = 200
        mock_res.reason = "OK"
        mock_res.headers = {"content-type": "text/html"}
        mock_res.encoding = "utf-8"
        mock_res.raw = None
        # Return 10 chunks of 100 bytes (1000 bytes)
        mock_res.iter_content.return_value = [b"x" * 100 for _ in range(10)]
        mock_get.return_value = mock_res

        # Limit to 350 bytes
        resp = fetch_with_security_limits("https://example.com", max_bytes=350)
        self.assertEqual(len(resp.body), 350)


if __name__ == "__main__":
    unittest.main()
