# Security Policy

Securio is a **passive** website hygiene scanner. It must never be used against systems you do not own or do not have permission to test.

## Reporting a vulnerability

Please use [GitHub Security Advisories](https://github.com/Lafiasabigado/securio/security/advisories/new) instead of a public issue.

Include:

- affected surface (web app, `securio-cli`, or the Python package)
- reproduction steps
- expected vs actual impact

## In-scope examples

- SSRF bypasses against `/api/scan` (private IPs, DNS rebinding, redirect chains)
- leakage of cookie values or other secrets in reports
- rate-limit bypasses that turn the hosted scanner into an open proxy

## Out of scope

- missing coverage versus a full vulnerability scanner (XSS payloads, SQLi, CVE matching, authenticated scans)
- findings that require executing third-party JavaScript in a browser
