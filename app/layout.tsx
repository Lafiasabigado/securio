import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Security Health — Audit Passif & Posture de Sécurité Web",
  description:
    "Évaluez la configuration de sécurité de votre site web : HTTPS, en-têtes défensifs CSP/HSTS, cookies, contenu mixte et formulaires. Rapport instantané et recommandations exploitables sans intrusion.",
  keywords: [
    "sécurité web",
    "audit passif",
    "en-têtes HTTP",
    "Content-Security-Policy",
    "HSTS",
    "OWASP",
    "analyse sécurité site internet",
  ],
  authors: [{ name: "Security Health" }],
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1 w-full pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
