# Securio

> **Instant passive web security health scanner and CLI.**  
> Test your website's resilience for free in under 5 seconds, zero installation required, 100% non-intrusive, directly on the web or from your command line.

<div align="center">

[🇫🇷 Français](README.md) • [🇬🇧 English](README.en.md)

</div>

[![Live Website](https://img.shields.io/badge/Production-securioapp.vercel.app-2563eb?style=for-the-badge&logo=vercel)](https://securioapp.vercel.app/)
[![PyPI version](https://img.shields.io/pypi/v/securio.svg?style=for-the-badge&logo=pypi&color=3776AB)](https://pypi.org/project/securio/)
[![npm version](https://img.shields.io/npm/v/securio-cli.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/securio-cli)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://pypi.org/project/securio/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Web Demonstration

Try the web application deployed on Vercel:  
👉 **[https://securioapp.vercel.app/](https://securioapp.vercel.app/)**

---

## 🐍 Securio Python CLI — Available on PyPI

The official Python CLI is published on PyPI: [**`https://pypi.org/project/securio/`**](https://pypi.org/project/securio/).

Designed for Python developers, DevSecOps teams, and system administrators who want to integrate passive security audits into scripts and automated CI/CD pipelines.

### Installation

```bash
pip install securio
```

To upgrade to the latest version:

```bash
pip install --upgrade securio
```

### Usage

```bash
# Scan a public website
securio https://example.com

# JSON output mode (machine-readable for CI/CD)
securio https://example.com --json

# Interactive mode
securio

# Display version or help
securio --version
securio --help
```

---

## 💻 Securio Node.js CLI — Available on npm

**Securio CLI** is also published as an npm package: [**`securio-cli`**](https://www.npmjs.com/package/securio-cli).

### Zero-install instant run (npx)

```bash
# Scan a website directly
npx securio https://example.com

# Or using the full package name
npx securio-cli https://example.com
```

### Interactive Mode

Simply run the command with no arguments:

```bash
npx securio
```

```text
 ███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗ ██████╗ 
 ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██║██╔═══██╗
 ███████╗█████╗  ██║     ██║   ██║██████╔╝██║██║   ██║
 ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██║██║   ██║
 ███████║███████╗╚██████╗╚██████╔╝██║  ██║██║╚██████╔╝
 ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ 

 Securio CLI v0.1.0
 Security made visible.

 ? Which URL would you like to scan:
 › https://example.com
```

### Add to project scripts

```bash
npm install -D securio-cli
```

In your `package.json`:

```json
{
  "scripts": {
    "audit:security": "securio https://yourwebsite.com",
    "audit:ci": "securio https://yourwebsite.com --json"
  }
}
```

### Global Installation

```bash
npm install -g securio-cli
securio https://example.com
```

### CLI Flags

| Flag | Alias | Description |
|---|---|---|
| `--json` | | Machine-readable JSON output for CI/CD pipelines |
| `--no-banner` | | Suppress ASCII logo header |
| `-h, --help` | | Show help and usage instructions |
| `-v, --version` | | Show current CLI version |

### CI/CD Exit Codes

Securio uses standardized exit codes:

- **`0`**: Scan passed cleanly without critical security failures.
- **`1`**: Security failure detected (at least one check failed).
- **`2`**: Execution error (invalid URL, private IP rejected by anti-SSRF protection, unreachable host).

---

## About Securio

Most security breaches and data leaks originate from basic misconfigurations or missing defensive HTTP headers. **Securio** was created for developers, startups, e-commerce managers, and creators to immediately assess web security hygiene without requiring cybersecurity expertise.

### 🛡️ Core Pillars

1. **100% Harmless & Passive**: Inspects endpoints just like a normal browser visit (standard RFC-compliant HTTP requests). No brute force, no fuzzing, no exploits, no port scanning.
2. **Clear & Actionable Guidance**: Zero obscure jargon. Every detected issue includes human-readable explanations and copy-paste configuration snippets (Nginx, Apache, Cloudflare, Next.js...).
3. **Objective Health Score (0 - 100)**: Transparent scoring formula with assigned grade (from **A+** down to **F**) and category radar breakdown.

---

## 🔍 Security Checks Performed

| Category | Check | Description |
|---|---|---|
| **HTTPS & Transport** | SSL/TLS Certificate | Verifies HTTPS enforcement, HTTP-to-HTTPS 301 redirection, and certificate validity. |
| **HTTP Headers** | Content-Security-Policy (CSP) | Protects against Cross-Site Scripting (XSS) and code injection. |
| **HTTP Headers** | Strict-Transport-Security (HSTS) | Prevents SSL stripping and downgrade attacks by enforcing HTTPS. |
| **HTTP Headers** | X-Frame-Options | Clickjacking mitigation via iframe restrictions (or CSP `frame-ancestors`). |
| **HTTP Headers** | X-Content-Type-Options | Enforces `nosniff` to avoid dangerous MIME-type sniffing. |
| **HTTP Headers** | Referrer-Policy | Prevents leaking sensitive URL paths and tokens to third parties. |
| **HTTP Headers** | Permissions-Policy | Restricts sensitive browser APIs (camera, microphone, geolocation). |
| **Session Cookies** | Attributes `Secure`, `HttpOnly`, `SameSite` | Protects session credentials against XSS theft and CSRF attacks. |
| **Mixed Content** | HTTP on HTTPS detection | Flags unencrypted HTTP sub-resources (scripts, images, frames) on secure pages. |
| **Web Forms** | Insecure Action targets | Ensures form submissions do not transmit sensitive data over unencrypted HTTP. |
| **Technology Footprint** | `Server` & `X-Powered-By` leaks | Identifies exposed backend technology signatures and versions. |

---

## 📁 Monorepo Architecture

```text
securityhealth/
├── app/                  # Next.js 16 web application (App Router)
├── components/           # React 19 UI components (Radar, Findings, Terminal)
├── lib/
│   ├── i18n/             # Bilingual FR / EN dictionaries
│   ├── scanner/          # Re-exports bridge to @securio/scanner
│   └── validation/       # Zod target validation
├── packages/
│   ├── scanner/          # Shared passive audit core engine (@securio/scanner)
│   │   ├── src/          # TLS, HTTP, Headers, Cookies, SSRF modules
│   │   └── package.json
│   ├── cli/              # Node.js npm package (securio-cli)
│   │   ├── src/          # Interactive terminal UI, spinners, banners
│   │   ├── package.json
│   │   └── README.md
│   └── python/           # Official PyPI package (securio)
│       ├── securio/      # Python audit engine and CLI
│       ├── tests/        # 49 pytest unit and integration tests
│       ├── pyproject.toml
│       └── README.md
├── package.json          # npm workspace configuration
└── tsconfig.json         # TypeScript configuration
```

---

## 🚀 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/Lafiasabigado/securio.git securio
cd securio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build shared packages
```bash
npm run build:all
```

### 4. Start web application in development mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Ethics & Compliance

Securio strictly follows ethical and defensive security guidelines:
- No exploit payloads are ever transmitted.
- No personal user data is stored or harvested.
- Cookies and sensitive tokens are redacted in all reports.
- Target inspection strictly respects RFC 7230 standard HTTP requests.

---

## 📄 License

Licensed under the [MIT License](LICENSE). Free for both personal and commercial use in defensive security auditing.
