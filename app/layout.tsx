import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Security Health — Votre site web est-il bien protégé ?",
  description:
    "Testez gratuitement la sécurité de votre site web en 5 secondes. Vérification du cadenas HTTPS, des protections navigateur, des cookies et des formulaires. Rapport clair avec solutions prêtes à appliquer.",
  keywords: [
    "sécurité site web",
    "test sécurité site internet",
    "vérifier sécurité site",
    "audit sécurité gratuit",
    "HTTPS",
    "protection site web",
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
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1 w-full pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
