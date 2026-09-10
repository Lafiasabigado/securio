# Securio 

> **L'app de scannage de site web & audit de sécurité passif instantané.**  
> Testez gratuitement la robustesse de votre site en 5 secondes, sans installation et sans risque d'intrusion.

[![Site web en production](https://img.shields.io/badge/Production-securioapp.vercel.app-2563eb?style=for-the-badge&logo=vercel)](https://securioapp.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Bilingue](https://img.shields.io/badge/Langues-FR%20%7C%20EN-emerald?style=for-the-badge)](https://securioapp.vercel.app/)

---

## 🌐 Démonstration en ligne
Accédez à l'application déployée sur Vercel :  
**[https://securioapp.vercel.app/](https://securioapp.vercel.app/)**

---

## À propos de Securio

La plupart des piratages et fuites de données exploitent de simples défauts de configuration réseau ou d'en-têtes HTTP manquants. **Securio** est une application web conçue pour les créateurs, e-commerçants, startups et développeurs, permettant d'évaluer instantanément la sécurité de leur site sans compétences préalables en cybersécurité.

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

## 🌍 Fonctionnalités

- **Sélecteur Bilingue (FR / EN)** :
  - Toggle instantané dans la barre de navigation (desktop et mobile).
  - Détection automatique de la langue du navigateur.
  - Persistance du choix dans le `localStorage`.
- **Référencement & SEO Avancé** :
  - Métadonnées riches ciblées sur les requêtes à forte intention (*"app de scannage de site"*, *"scanner site web"*, etc.).
  - Données structurées **JSON-LD** (`Schema.org/WebApplication`).
  - Balises OpenGraph et Twitter Cards avec visuels de marque.
  - Génération dynamique de `sitemap.xml` (`app/sitemap.ts`) et `robots.txt` (`app/robots.ts`).
- **Mode CLI pour Développeurs** :
  - Commande prête à l'emploi : `npx securio scan <url> --json`.
- **Rapports Interactifs** :
  - Graphique de score en radar SVG animé.
  - Filtres de vulnérabilités par sévérité (Critique, Avertissement, Conforme).
  - Export et partage du rapport.

---

## Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Rendu** : [React 19](https://react.dev/)
- **Typage** : [TypeScript 5](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation** : [Zod](https://zod.dev/)
- **Déploiement** : [Vercel](https://vercel.com/)

---

## Démarrage Rapide en Local

### Prérequis
- Node.js 20+ ou supérieur
- npm, yarn ou pnpm

### 1. Cloner le dépôt
```bash
git clone https://github.com/Lafiasabigado/securio.git securio
cd securio
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 4. Compiler pour la production
```bash
npm run build
npm run start
```

---

## 📁 Architecture du Projet

```text
securio/
├── app/
│   ├── about/            # Page Méthodologie & Transparence
│   ├── api/scan/         # Moteur API de scannage passif
│   ├── report/           # Page de consultation du rapport
│   ├── scan/             # Page de progression télémétrique
│   ├── layout.tsx        # Layout racine + SEO + JSON-LD + i18n
│   ├── page.tsx          # Page d'accueil & formulaire de scan
│   ├── robots.ts         # Générateur robots.txt
│   ├── sitemap.ts        # Générateur sitemap.xml
│   └── globals.css       # Styles globaux & Tailwind
├── components/
│   ├── report/           # Composants du rapport (Radar, Findings, Overview)
│   ├── scan/             # Télémétrie et étapes de scan
│   └── ui/               # Header bilingue, Footer, Badges, Radar
├── lib/
│   ├── i18n/             # Dictionnaire et Context FR/EN
│   ├── scanner/          # Modules d'analyse passive HTTP, HTTPS, Cookies, Headers
│   └── validation/       # Validation Zod des URLs
└── public/
    └── images/
        ├── securio.png   # Logo officiel Securio
        └── sucurio.png   # Source originale du logo
```

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
