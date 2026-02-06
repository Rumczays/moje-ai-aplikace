import './globals.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SocialPost AI Master - Generátor obsahu pro sociální sítě",
  description: "Profesionální nástroj pro vytváření příspěvků na Instagram a Facebook s podporou AI optimalizace. Vygeneruj perfektní obsah s hashtagy a doporučeními.",
  keywords: "Instagram, Facebook, AI, obsah, sociální sítě, generátor",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
