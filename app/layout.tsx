import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje AI Aplikace",
  description: "Vlastní chat s Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        {children}
      </body>
    </html>
  );
}
