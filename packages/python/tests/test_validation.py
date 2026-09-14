import unittest
from securio.ssrf import (
    is_private_or_reserved_ip,
    validate_and_resolve_target,
    validate_public_host,
)


class TestValidationAndSSRF(unittest.TestCase):
    def test_private_ips_blocked(self):
        # Loopback
        self.assertTrue(is_private_or_reserved_ip("127.0.0.1"))
        self.assertTrue(is_private_or_reserved_ip("127.0.0.2"))
        self.assertTrue(is_private_or_reserved_ip("::1"))

        # Private RFC 1918
        self.assertTrue(is_private_or_reserved_ip("10.0.0.1"))
        self.assertTrue(is_private_or_reserved_ip("172.16.0.1"))
        self.assertTrue(is_private_or_reserved_ip("172.31.255.255"))
        self.assertTrue(is_private_or_reserved_ip("192.168.1.1"))

        # Link-local / Cloud metadata
        self.assertTrue(is_private_or_reserved_ip("169.254.169.254"))

        # Carrier Grade NAT
        self.assertTrue(is_private_or_reserved_ip("100.64.0.1"))

        # Unspecified & Broadcast
        self.assertTrue(is_private_or_reserved_ip("0.0.0.0"))
        self.assertTrue(is_private_or_reserved_ip("255.255.255.255"))
        self.assertTrue(is_private_or_reserved_ip("::"))

        # IPv6 Unique Local
        self.assertTrue(is_private_or_reserved_ip("fc00::1"))
        self.assertTrue(is_private_or_reserved_ip("fd12:3456:789a::1"))

        # IPv4-mapped IPv6
        self.assertTrue(is_private_or_reserved_ip("::ffff:127.0.0.1"))
        self.assertTrue(is_private_or_reserved_ip("::ffff:192.168.1.1"))

    def test_public_ips_allowed(self):
        self.assertFalse(is_private_or_reserved_ip("1.1.1.1"))
        self.assertFalse(is_private_or_reserved_ip("8.8.8.8"))
        self.assertFalse(is_private_or_reserved_ip("93.184.216.34"))
        self.assertFalse(is_private_or_reserved_ip("2606:4700:4700::1111"))

    def test_forbidden_hostnames(self):
        for host in ["localhost", "app.localhost", "server.local", "db.internal", "box.lan", "nas.home"]:
            allowed, _, err = validate_public_host(host)
            self.assertFalse(allowed)
            self.assertIn("interdit", err or "")

    def test_disallowed_protocols(self):
        with self.assertRaises(ValueError) as ctx:
            validate_and_resolve_target("ftp://example.com")
        self.assertIn("Seuls les protocoles http:// et https://", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_and_resolve_target("file:///etc/passwd")
        self.assertIn("Seuls les protocoles http:// et https://", str(ctx.exception))

    def test_disallowed_ports(self):
        with self.assertRaises(ValueError) as ctx:
            validate_and_resolve_target("https://example.com:22")
        self.assertIn("port 22 n'est pas autorisé", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_and_resolve_target("https://example.com:3306")
        self.assertIn("port 3306 n'est pas autorisé", str(ctx.exception))

    def test_empty_or_invalid_url(self):
        with self.assertRaises(ValueError):
            validate_and_resolve_target("")
        with self.assertRaises(ValueError):
            validate_and_resolve_target("  ")


if __name__ == "__main__":
    unittest.main()
