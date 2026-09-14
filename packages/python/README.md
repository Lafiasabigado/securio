# Securio Python CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Open Source](https://img.shields.io/badge/open%20source-%E2%99%A5-brightgreen.svg)](https://github.com/securio/securio)

**Securio** est un scanner de santé et d'hygiène de sécurité périmétrique moderne, rapide et purement passif pour sites web publics.

Ce package Python fournit l'interface en ligne de commande (CLI) officielle `securio`, conçue pour les développeurs, les équipes DevSecOps et les administrateurs système désireux de vérifier instantanément la posture de sécurité d'un site web, sans aucune action intrusive.

---

## Fonctionnalités V1

* **HTTPS & TLS** :
  * Détection du protocole HTTPS.
  * Vérification du certificat SSL/TLS (validité, autorité de certification, date d'expiration, chiffrement).
  * Détection de la redirection automatique HTTP &rarr; HTTPS (port 80 vers 443).
* **Security Headers** :
  * `Content-Security-Policy` (CSP) avec détection des configurations affaiblies (`*`, `http://`).
  * `Strict-Transport-Security` (HSTS) avec contrôle de durée `max-age` minimale (6 mois recommandé).
  * `X-Content-Type-Options: nosniff`.
  * `X-Frame-Options` ou CSP `frame-ancestors` (protection anti-clickjacking).
  * `Referrer-Policy` (protection contre les fuites d'URL privées).
  * `Permissions-Policy` (restriction des API de capteurs et périphériques).
* **Cookies** :
  * Drapeaux `Secure`, `HttpOnly` et politique `SameSite` (`Lax` / `Strict`).
* **Mixed Content** :
  * Détection passive de balises de sous-ressources HTTP (scripts, stylesheets, images, iframes, médias) sur pages HTTPS.
* **Formulaires** :
  * Détection des formulaires HTTPS transmettant des données vers des URL `http://` non chiffrées.
  * Alerte si un champ de mot de passe est hébergé sur une page HTTP en clair.
  * Aucun formulaire n'est jamais soumis automatiquement.
* **Exposition Technologique (Fingerprinting)** :
  * Identification passive des serveurs web (`Server`), frameworks (`X-Powered-By`, Next.js, Nuxt), CDN (Cloudflare, Vercel, CloudFront) et CMS (WordPress, Drupal, Shopify).
  * L'exposition d'une technologie n'est jamais considérée comme une vulnérabilité en soi.
* **Défense Anti-SSRF & Sécurité** :
  * Rejet strict de `localhost`, `127.0.0.1`, adresses IP privées (RFC 1918, CGNAT 100.64.0.0/10, lien local, broadcast).
  * Restriction aux ports web autorisés (80, 443, 8080, 8443).
  * Limitation des redirections, plafonnement de taille des réponses (2 Mo) et timeouts stricts.

---

## Installation

### Depuis PyPI (à venir)

```bash
pip install securio
```

### Depuis les sources locales

```bash
cd packages/python
pip install .
```

Ou en mode éditable pour le développement :

```bash
pip install -e ".[dev]"
```

---

## Utilisation

### Analyse standard

```bash
securio https://example.com
```

### Aide (`--help`)

```bash
securio --help
```

```text
usage: securio [-h] [--json] [-v] [url]

Securio - Fast, passive security health scanner for public websites.

positional arguments:
  url            L'URL du site web à analyser (ex: https://example.com).

options:
  -h, --help     show this help message and exit
  --json         Sortie au format JSON pour l'intégration CI/CD.
  -v, --version  Afficher la version du scanner.

Exemples:
  securio https://example.com
  securio https://example.com --json
  securio
```

### Version (`--version`)

```bash
securio --version
# securio 0.1.0
```

### Sortie JSON (`--json`) pour CI/CD

Pour automatiser les contrôles de sécurité dans un pipeline GitHub Actions ou GitLab CI :

```bash
securio https://example.com --json
```

Exemple de réponse JSON :

```json
{
  "id": "scn_a1b2c3d4e5f6",
  "url": "https://example.com",
  "domain": "example.com",
  "protocol": "https:",
  "timestamp": "2026-09-14T12:00:00.000000+00:00",
  "score": 86,
  "status": "good",
  "grade": "B+",
  "summary": "Bonne posture de sécurité globale avec quelques écarts de configuration ou en-têtes défensifs recommandés à consolider.",
  "stats": {
    "passed": 8,
    "warning": 2,
    "critical": 0,
    "total": 10
  },
  "telemetry": {
    "ip": "93.184.216.34",
    "serverHeader": "ECS (dcb/7ea3)",
    "tlsVersion": "TLSv1.3",
    "latencyMs": 42,
    "technologies": ["ECS"]
  },
  "findings": [...]
}
```

### Mode interactif

Si vous lancez la commande sans argument d'URL :

```bash
securio
```

L'invite interactive vous propose de saisir l'adresse à inspecter :

```text
Securio

URL à analyser :
> https://example.com
```

---

## Système de Score

Le calcul du score global (de 0 à 100) est centralisé selon le barème officiel Securio :

* **90 – 100** : **EXCELLENT** (Note `A` ou `A+`)
* **75 – 89**  : **BON** (Note `B` ou `B+`)
* **50 – 74**  : **À AMÉLIORER** (Note `C`)
* **0 – 49**   : **CRITIQUE** (Note `F`)

### Code de retour (Exit Codes)

* `0` : Analyse réussie (aucun résultat critique).
* `1` : Analyse terminée avec au moins une non-conformité critique (`severity: critical`, `status: fail`).
* `2` : Erreur de validation (URL invalide, destination privée bloquée par la protection anti-SSRF, erreur réseau).

---

## Philosophie : Passive & Non Intrusive

Securio est un outil strictement **défensif et bienveillant**. Il analyse uniquement des signaux publics retournés par le serveur :

* ❌ Aucun scan de ports (limité aux ports 80, 443, 8080, 8443) ;
* ❌ Aucune tentative d'injection (SQLi, XSS, SSRF) ;
* ❌ Aucun fuzzing ou brute force ;
* ❌ Aucune soumission de formulaires ;
* ❌ Aucun contournement d'authentification ni accès à des ressources privées.

---

## Limitations

* L'inspection porte sur la page d'accueil ou l'URL spécifique ciblée.
* Certaines applications monopages (SPA) générées lourdement via JavaScript côté client peuvent masquer une partie du DOM HTML initial lors d'une simple requête HTTP statique.
* Les audits TLS reposent sur les fonctionnalités de chiffrement fournies par la suite OpenSSL de la machine locale.

---

## Développement local & Tests

### Prérequis

* Python >= 3.10

### Installation en environnement de dev

```bash
cd packages/python
pip install -e ".[dev]"
```

### Exécution des tests

Les tests sont écrits avec `unittest` et s'exécutent avec `pytest` :

```bash
pytest
```

Avec rapport de verbosité :

```bash
pytest -v
```

### Build du package distribuable

Pour générer l'archive source (`.tar.gz`) et la roue binaire (`.whl`) dans `dist/` :

```bash
python -m build
```

---

## Licence

Ce projet est un logiciel libre et open source distribué sous licence [MIT](LICENSE).
