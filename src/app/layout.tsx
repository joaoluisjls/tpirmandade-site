import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GUILD } from "@/data/guild";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tpirmandade.com.br"),
  title: {
    default: `${GUILD.name} — Guilda Oficial de Free Fire`,
    template: `%s | ${GUILD.name}`,
  },
  description: GUILD.description,
  keywords: "free fire, guilda, esports, competitivo, ranking, gaming, tp irmandade",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://tpirmandade.com.br",
    siteName: GUILD.name,
    title: `${GUILD.name} — Guilda Oficial de Free Fire`,
    description: GUILD.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${GUILD.name} — Guilda Oficial de Free Fire`,
    description: GUILD.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
      </head>
      <body className="min-h-full antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
