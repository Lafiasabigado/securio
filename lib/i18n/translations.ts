export type Language = "fr" | "en";

export interface Translations {
  // Brand & Header
  brandTagline: string;
  navTestSite: string;
  navLastReport: string;
  navGuide: string;
  systemReady: string;
  onlineReady: string;
  newScan: string;

  // Hero Section
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  urlPlaceholder: string;
  scanButton: string;
  errorEmptyUrl: string;
  badgeSafe: string;
  badgeNoIntrusion: string;
  badgeInstant: string;

  // Preview Demo
  demoBadge: string;
  demoSubtitle: string;
  demoButton: string;

  // Why Securio / Features
  whySecurioTitle: string;
  whySecurioDesc: string;
  feat1Title: string;
  feat1Desc: string;
  feat1Badge: string;
  feat2Title: string;
  feat2Desc: string;
  feat2Badge: string;
  feat3Title: string;
  feat3Desc: string;
  feat3Badge: string;

  // Developer CLI
  cliTitle: string;
  cliCopy: string;
  cliCopied: string;

  // Bottom CTA
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  ctaLearnMore: string;

  // Footer
  footerDesc: string;
  footerNonDestructive: string;
  footerZeroIntrusion: string;
  footerStandardCompliant: string;
  footerNavTitle: string;
  footerCommitmentTitle: string;
  footerSafeGuarantee: string;
  footerCheckpoints: string;
  footerEducationalNotice: string;
  footerCopyright: string;
  footerInstantDiag: string;
  footerEngineActive: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    brandTagline: "Diagnostic web simple & sans risque",
    navTestSite: "Tester un site",
    navLastReport: "Dernier rapport",
    navGuide: "Guide & Méthodologie",
    systemReady: "Système prêt",
    onlineReady: "Diagnostic en ligne opérationnel",
    newScan: "Nouveau scan",

    heroBadge: "Diagnostic de sécurité web",
    heroTitle1: "Votre site web est-il",
    heroTitle2: "bien protégé ?",
    heroSubtitle:
      "Testez la sécurité de votre site en 5 secondes, sans rien installer. Nous vérifions le cadenas HTTPS, les protections contre les attaques et la confidentialité de vos visiteurs avec des explications claires et sans jargon.",
    urlPlaceholder: "votresite.fr",
    scanButton: "Vérifier mon site",
    errorEmptyUrl: "Veuillez saisir l'adresse URL de votre site (ex: https://monsite.fr).",
    badgeSafe: "100% sans danger pour votre site",
    badgeNoIntrusion: "Aucune tentative d'intrusion",
    badgeInstant: "Résultats instantanés",

    demoBadge: "Exemple de rapport",
    demoSubtitle: "Aperçu du diagnostic généré en quelques secondes",
    demoButton: "Voir ce rapport interactif complet",

    whySecurioTitle: "Un bilan de santé complet, simple et sans risque",
    whySecurioDesc:
      "La plupart des piratages exploitent de simples oublis de configuration. Voici pourquoi Securio est l'outil idéal pour votre site.",
    feat1Title: "100% inoffensif pour votre site",
    feat1Desc:
      "Nous analysons votre site exactement comme un visiteur ordinaire ouvrant une page web. Aucun piratage, aucun ralentissement et aucun risque de panne pour vos clients.",
    feat1Badge: "Garanti sans impact",
    feat2Title: "Des conseils faciles à appliquer",
    feat2Desc:
      "Pas besoin d'être un génie en informatique. Nous traduisons les failles en explications simples, avec les solutions prêtes à copier pour vous ou votre prestataire.",
    feat2Badge: "Solutions prêtes à copier",
    feat3Title: "Conforme aux meilleures pratiques",
    feat3Desc:
      "Nos vérifications s'appuient sur les recommandations officielles de l'OWASP et de l'ANSSI pour garantir la confiance de vos visiteurs et le respect de la vie privée.",
    feat3Badge: "Normes de sécurité reconnues",

    cliTitle: "Pour les développeurs — Outil en ligne de commande",
    cliCopy: "Copier la commande",
    cliCopied: "Copié !",

    ctaTitle: "Prêt à vérifier la sécurité de votre site ?",
    ctaDesc:
      "Prenez 5 secondes pour identifier vos faiblesses et rassurer vos visiteurs. C'est gratuit et sans inscription.",
    ctaButton: "Lancer mon audit gratuit",
    ctaLearnMore: "En savoir plus sur la méthode",

    footerDesc:
      "Diagnostic passif et bienveillant de la sécurité des sites internet. Nous aidons les créateurs, e-commerçants et développeurs à identifier leurs failles et à protéger leurs visiteurs sans risque.",
    footerNonDestructive: "Non destructif",
    footerZeroIntrusion: "Zéro intrusion",
    footerStandardCompliant: "Conforme aux standards",
    footerNavTitle: "Navigation",
    footerCommitmentTitle: "Engagements",
    footerSafeGuarantee: "Garantie d'analyse sans risque",
    footerCheckpoints: "Points de contrôle",
    footerEducationalNotice: "Outil d'aide à la décision défensif et éducatif.",
    footerCopyright: "Securio. Tous droits réservés.",
    footerInstantDiag: "Diagnostic web instantané",
    footerEngineActive: "Moteur actif",
  },
  en: {
    brandTagline: "Simple & safe website security check",
    navTestSite: "Scan a website",
    navLastReport: "Last report",
    navGuide: "Guide & Methodology",
    systemReady: "System ready",
    onlineReady: "Online scanner ready",
    newScan: "New scan",

    heroBadge: "Web Security Diagnostics",
    heroTitle1: "Is your website",
    heroTitle2: "properly secured?",
    heroSubtitle:
      "Test your website security in 5 seconds with zero installation. We inspect HTTPS certificates, attack protections, and visitor privacy with clear, jargon-free explanations.",
    urlPlaceholder: "yoursite.com",
    scanButton: "Scan my website",
    errorEmptyUrl: "Please enter your website URL (e.g. https://example.com).",
    badgeSafe: "100% safe for your site",
    badgeNoIntrusion: "Zero intrusion or exploit",
    badgeInstant: "Instant results",

    demoBadge: "Sample report",
    demoSubtitle: "Preview of the security check generated in seconds",
    demoButton: "View this interactive report",

    whySecurioTitle: "Complete, simple and risk-free security health check",
    whySecurioDesc:
      "Most security breaches exploit basic configuration oversights. Here is why Securio is the ideal scanning app for your site.",
    feat1Title: "100% harmless for your site",
    feat1Desc:
      "We inspect your site just like a standard web browser opening a page. No penetration tests, no slowdowns, and zero risk of downtime for your users.",
    feat1Badge: "Zero impact guaranteed",
    feat2Title: "Easy-to-apply recommendations",
    feat2Desc:
      "No cybersecurity degree needed. We translate technical issues into plain English with ready-to-copy solutions for you or your developer.",
    feat2Badge: "Ready-to-copy code fixes",
    feat3Title: "Aligned with best practices",
    feat3Desc:
      "Our checks are grounded in official OWASP and security agency guidelines to protect customer privacy and maintain trust.",
    feat3Badge: "Industry standards",

    cliTitle: "For Developers — Command Line Interface",
    cliCopy: "Copy command",
    cliCopied: "Copied!",

    ctaTitle: "Ready to inspect your website security?",
    ctaDesc:
      "Take 5 seconds to uncover security gaps and reassure your visitors. Free and no account required.",
    ctaButton: "Start my free audit",
    ctaLearnMore: "Learn more about the method",

    footerDesc:
      "Passive and ethical security diagnostics for websites. Helping creators, e-commerce owners, and developers detect vulnerabilities and protect visitors safely.",
    footerNonDestructive: "Non-destructive",
    footerZeroIntrusion: "Zero intrusion",
    footerStandardCompliant: "Standards compliant",
    footerNavTitle: "Navigation",
    footerCommitmentTitle: "Commitments",
    footerSafeGuarantee: "Safe audit guarantee",
    footerCheckpoints: "Checkpoints",
    footerEducationalNotice: "Defensive and educational decision-support tool.",
    footerCopyright: "Securio. All rights reserved.",
    footerInstantDiag: "Instant web scanner",
    footerEngineActive: "Engine active",
  },
};
