# Securio 

> **L'application et CLI d'audit de sécurité web passif instantané.**  
> Testez gratuitement la robustesse de votre site en 5 secondes, sans installation et sans risque d'intrusion, directement sur le web ou depuis votre terminal.

[![Site web en production](https://img.shields.io/badge/Production-securioapp.vercel.app-2563eb?style=for-the-badge&logo=vercel)](https://securioapp.vercel.app/)
[![npm version](https://img.shields.io/npm/v/securio-cli.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/securio-cli)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Démonstration en ligne
Accédez à l'application web déployée sur Vercel :  
👉 **[https://securioapp.vercel.app/](https://securioapp.vercel.app/)**

---

## 💻 Securio CLI — Disponible sur npm

**Securio CLI** est officiellement disponible sous forme de package npm : [**`securio-cli`**](https://www.npmjs.com/package/securio-cli).

Il permet aux développeurs d'auditer la sécurité passive de n'importe quel site web directement depuis le terminal ou au sein de leurs pipelines d'intégration continue (CI/CD).

### Exécution instantanée (sans installation préalable)

```bash
# Analyser un site web directement
npx securio https://example.com

# Ou avec le nom complet du package
npx securio-cli https://example.com
```

### Mode interactif

Lancez simplement la commande sans argument pour être guidé :

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

 ? Quelle URL souhaitez-vous analyser :
 › https://example.com
```

### Intégration dans vos projets

```bash
npm install -D securio-cli
```

Puis dans les scripts de votre `package.json` :

```json
{
  "scripts": {
    "audit:security": "securio https://votresite.fr",
    "audit:ci": "securio https://votresite.fr --json"
  }
}
```

### Installation globale

```bash
npm install -g securio-cli
securio https://example.com
```

### Options CLI

| Option | Alias | Description |
|---|---|---|
| `--json` | | Sortie au format JSON machine-readable pour CI/CD |
| `--no-banner` | | Masquer le logo ASCII d'en-tête |
| `-h, --help` | | Afficher l'aide et les options disponibles |
| `-v, --version` | | Afficher le numéro de version |

### Codes de retour CI/CD (Exit Codes)

Securio CLI utilise des codes de retour standardisés :

- **`0`** : Succès, aucun problème de sécurité critique.
- **`1`** : Alerte de sécurité (au moins un test 'fail' détecté).
- **`2`** : Erreur d'exécution, cible inaccessible ou adresse IP privée bloquée par la protection SSRF.

---

## À propos de Securio

La plupart des piratages et fuites de données exploitent de simples défauts de configuration réseau ou d'en-têtes HTTP manquants. **Securio** est conçu pour les créateurs, e-commerçants, startups et développeurs, permettant d'évaluer instantanément la sécurité d'un site sans compétences préalables en cybersécurité.

### 🛡️ Les 3 Piliers de Securio
1. **100% Inoffensif & Zéro intrusion** : Visite votre site exactement comme un internaute ordinaire avec un navigateur (requêtes HTTP conformes aux RFC). Aucune tentative de brute-force, d'attaque par déni de service ou d'exploitation de vulnérabilité.
2. **Vulgarisation & Pédagogie** : Aucun jargon incompréhensible. Chaque problème détecté est traduit en langage clair avec un extrait de configuration prêt à copier-coller (Apache, Nginx, Cloudflare, Next.js...).
3. **Notation Globale Objective (0 - 100)** : Calcul automatique d'un score de santé avec attribution d'un grade (de **A+** à **F**) et radar interactif de compétences.

---

## 🔍 Points de Contrôle Inspectés

| Catégorie | Point de contrôle | Description |
|---|---|---|
| **HTTPS & Chiffrement** | Cadenas SSL/TLS | Vérification de la redirection HTTPS forcée et de la validité du certificat SSL. |
| **En-têtes HTTP** | Content-Security-Policy (CSP) | Prévention des attaques par injection de scripts malveillants (XSS). |
| **En-têtes HTTP** | Strict-Transport-Security (HSTS) | Forçage de la communication chiffrée permanente avec le domaine. |
| **En-têtes HTTP** | X-Frame-Options | Protection contre le détournement de clic (Clickjacking). |
| **En-têtes HTTP** | X-Content-Type-Options | Blocage du reniflement de type MIME non sécurisé. |
| **En-têtes HTTP** | Referrer-Policy | Protection contre la fuite d'URLs privées vers des tiers. |
| **En-têtes HTTP** | Permissions-Policy | Contrôle des APIs sensibles (caméra, microphone, géolocalisation). |
| **Cookies de Session** | Attributs `Secure`, `HttpOnly`, `SameSite` | Protection contre le vol de session et les attaques CSRF. |
| **Contenu Mixte** | Détection HTTP/HTTPS | Contrôle de l'absence de ressources non chiffrées sur page sécurisée. |
| **Formulaires Web** | Destinations d'action | Vérification que les formulaires transmettent les données uniquement en HTTPS. |
| **Fuite Serveur** | En-têtes `Server` & `X-Powered-By` | Détection des versions logicielles exposées publiquement aux scanners d'attaquants. |

---

## 📁 Architecture Monorepo

Le projet est organisé en un monorepo léger partageant le même moteur d'analyse :

```text
securityhealth/
├── app/                  # Application web Next.js 16 (App Router)
├── components/           # Composants UI React 19 (Radar, Findings, Terminal)
├── lib/
│   ├── i18n/             # Support bilingue FR / EN
│   ├── scanner/          # Ponts de réexportation vers @securio/scanner
│   └── validation/       # Validation Zod des requêtes
├── packages/
│   ├── scanner/          # Moteur d'analyse passif partagé (@securio/scanner)
│   │   ├── src/          # Types, modules HTTP, TLS, Headers, Cookies, SSRF
│   │   └── package.json
│   └── cli/              # Package npm Securio CLI (securio-cli)
│       ├── src/          # CLI interactif, formatters, spinner, bannières
│       ├── package.json  # Déclaration des binaires `securio` et `securio-cli`
│       └── README.md
├── package.json          # Configuration Workspaces npm
└── tsconfig.json         # Configuration TypeScript
```

---

## 🚀 Démarrage Rapide en Local

### 1. Cloner le dépôt
```bash
git clone https://github.com/Lafiasabigado/securio.git securio
cd securio
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Compiler les packages partagés
```bash
npm run build:all
```

### 4. Lancer l'application web en développement
```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ⚖️ Éthique et Conformité

Securio respecte scrupuleusement les principes du diagnostic passif bienveillant :
- Aucun exploit n'est tenté.
- Aucune donnée personnelle n'est stockée ni partagée.
- Les cookies de session et valeurs sensibles sont systématiquement masqués dans les rapports.
- L'audit respecte les spécifications RFC 7230 relatives aux requêtes HTTP d'exploration standard.

---

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation pour tout usage personnel ou commercial dans le cadre d'audits de sécurité défensifs.
