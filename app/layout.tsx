import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://securioapp.vercel.app"),
  title: {
    default: "Securio — App de scannage de site & Audit de sécurité web gratuit",
    template: "%s | Securio",
  },
  description:
    "Securio est l'application de scannage de site web de référence. Testez la sécurité de votre site internet en 5 secondes : cadenas HTTPS/SSL, en-têtes de sécurité HTTP, cookies, détection de failles et recommandations prêtes à copier.",
  keywords: [
    "app de scannage de site",
    "scannage de site",
    "scanner de site web",
    "app pour scanner un site",
    "tester la sécurité d'un site",
    "audit sécurité site web gratuit",
    "vérifier sécurité site internet",
    "scanner de vulnérabilités web",
    "analyseur headers sécurité http",
    "test https ssl gratuit",
    "diagnostic sécurité site web",
    "sécurité site web",
    "outil audit cybersécurité en ligne",
    "website security scanner",
    "web vulnerability scanner",
    "online security health check",
    "website vulnerability test",
    "security headers checker",
    "OWASP scanner gratuit",
  ],
  authors: [{ name: "Securio", url: "https://securioapp.vercel.app" }],
  creator: "Securio",
  publisher: "Securio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://securioapp.vercel.app",
    languages: {
      "fr-FR": "https://securioapp.vercel.app",
      "en-US": "https://securioapp.vercel.app",
    },
  },
  openGraph: {
    title: "Securio — App de scannage de site & Audit de sécurité web gratuit",
    description:
      "Vérifiez gratuitement la santé et la sécurité de votre site web en 5 secondes. Diagnostic passif, non intrusif et sans risque.",
    url: "https://securioapp.vercel.app",
    siteName: "Securio",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/images/securio.png",
        width: 1024,
        height: 1024,
        alt: "Securio — App de scannage de site web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Securio — App de scannage de site & Audit de sécurité web",
    description:
      "L'application de scannage de référence pour vérifier la sécurité de votre site web en 5 secondes. Gratuit & immédiat.",
    images: ["/images/securio.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Securio",
  alternateName: [
    "Securio App",
    "App de scannage de site Securio",
    "Securio Website Security Scanner",
  ],
  applicationCategory: "SecurityApplication",
  operatingSystem: "All",
  url: "https://securioapp.vercel.app",
  image: "https://securioapp.vercel.app/images/securio.png",
  description:
    "Securio est l'application de scannage de site web et d'audit passif de sécurité pour tester instantanément le cadenas HTTPS, les en-têtes HTTP, les cookies et les protections contre les attaques.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  featureList: [
    "Scannage de site web instantané et passif",
    "Vérification du cadenas et certificat HTTPS/SSL",
    "Audit des en-têtes de sécurité HTTP (HSTS, CSP, X-Frame-Options, etc.)",
    "Analyse des cookies de session (Secure, HttpOnly, SameSite)",
    "Détection des fuites de version serveur et technologies",
    "Score de sécurité global de A+ à F avec explications en français et anglais",
    "100% sans intrusion et inoffensif pour le serveur cible",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <LanguageProvider>
          <Header />
          <main className="flex-1 w-full pt-16">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
