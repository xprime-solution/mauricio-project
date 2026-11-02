import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-mono-jb", display: "swap" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3930");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DTF4U · Impressão DTF e camisetas lisas", template: "%s · DTF4U" },
  description: "Impressão DTF Têxtil por metro, adesivos DTF UV e camisetas lisas no mesmo pedido. Envio para todo o Brasil a partir de Itajaí/SC.",
  icons: { icon: "/brand/dtf4u-icone.png", apple: "/brand/dtf4u-icone.png" },
  openGraph: {
    title: "DTF4U · Impressão DTF e camisetas lisas",
    description: "Impressão DTF Têxtil por metro, adesivos DTF UV e camisetas lisas no mesmo pedido.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "DTF4U" }],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0e0c12" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${mono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
