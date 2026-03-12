import type { Metadata } from "next";
import { Antonio } from "next/font/google";
import "./globals.css";
import { getContentByLocale, siteConfig } from "@/content/site-content";

const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio",
  weight: "700",
  display: "swap"
});

const content = getContentByLocale();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nachomasdesign.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: content.metadata.title,
  description: content.metadata.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: content.metadata.title,
    description: content.metadata.description,
    url: siteUrl,
    siteName: siteConfig.brandName,
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-cover.svg",
        width: 1200,
        height: 630,
        alt: "Portfolio de Nacho Mas Design"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: content.metadata.title,
    description: content.metadata.description,
    images: ["/og-cover.svg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${antonio.variable} font-sans`}>{children}</body>
    </html>
  );
}
