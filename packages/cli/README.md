# Securio CLI

> Analyseur de sécurité web passive pour développeurs.
> Identifiez en quelques secondes les faiblesses de configuration HTTPS, en-têtes de sécurité, cookies et exposition technique de vos applications web.

[![npm version](https://img.shields.io/npm/v/securio-cli.svg?style=flat-square)](https://www.npmjs.com/package/securio-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Fonctionnalités

- **Analyse passive & non intrusive** : Aucun payload d'attaque, aucun test invasif, aucun risque pour votre production.
- **HTTPS & Transport** : Validation de la chaîne de certification TLS, validité du certificat, chiffrement, redirection HTTP → HTTPS.
- **En-têtes de sécurité** : Audit CSP (*Content-Security-Policy*), HSTS (*Strict-Transport-Security*), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Sécurité des cookies** : Vérification des attributs critiques `Secure`, `HttpOnly`, `SameSite`.
- **Formulaires & Contenu Mixte** : Détection des fuites de données vers des canaux non chiffrés.
- **Exposition technique** : Reconnaissance passive des technologies serveur et frameworks.
- **CI/CD Ready** : Codes de sortie standardisés et option `--json` pour intégration GitHub Actions / GitLab CI.

---

## Installation

### Exécution directe (recommandée)

Aucune installation préalable requise :

```bash
npx securio https://example.com
```

ou :

```bash
npx securio-cli https://example.com
```

### Installation dans un projet

```bash
npm install -D securio-cli
```

Puis dans vos scripts `package.json` :

```json
{
  "scripts": {
    "audit:security": "securio https://votresite.fr"
  }
}
```

### Installation globale

```bash
npm install -g securio-cli
```

---

## Utilisation

### Mode interactif

Lancez simplement la commande sans argument pour être guidé :

```bash
securio
```

```text
 ███████╗███████╗ ██████╗██╗   ██╗██████╗ ██╗ ██████╗ 
 ...
 Securio CLI v0.1.0
 Security made visible.

 ? Quelle URL souhaitez-vous analyser :
 › https://example.com
```

### Mode direct avec URL

```bash
securio https://example.com
```

### Mode JSON (pour pipelines et scripts)

```bash
securio https://example.com --json > report.json
```

---

## Options

| Option | Alias | Description |
|---|---|---|
| `--json` | | Sortie au format JSON machine-readable pour CI/CD |
| `--no-banner` | | Masquer l'affichage du logo de démarrage |
| `--help` | `-h` | Afficher l'aide et les options |
| `--version` | `-v` | Afficher la version installée |

---

## Intégration CI / CD

Securio CLI utilise des codes de retour (exit codes) normalisés :

| Exit Code | Signification |
|---|---|
| `0` | **Succès** : analyse terminée sans problème de sécurité majeur |
| `1` | **Alerte sécurité** : au moins un problème critique/fail a été détecté |
| `2` | **Erreur** : cible injoignable, URL invalide, ou erreur réseau |

### Exemple GitHub Actions

```yaml
name: Security Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Audit de sécurité web
        run: npx securio-cli https://votresite.fr --json
```

---

## Démarche éthique & passive

Securio est un outil strictement défensif. Il n'effectue **aucune** action agressive :
- Pas d'injection SQL ou XSS
- Pas d'attaque brute-force
- Pas de scan de ports réseau
- Pas de contournement d'authentification
- Pas d'envoi automatisé de formulaires

Il se contente de lire et d'analyser les réponses publiques fournies par le serveur HTTP cible.

---

## Licence

MIT © [Securio](https://github.com/Lafiasabigado/securityhealth)
