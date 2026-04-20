import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rifelo.id'),
  title: "Rifelo — Platform Profil Interaktif Real-Time",
  description: "The silent anchor of your professional identity. A matte silicone masterpiece for the modern era.",
  keywords: ["NFC", "Digital Business Card", "Smart Tag", "Landing Page", "Rifelo", "Identity Management", "Interactive Profile"],
  authors: [{ name: "Rifelo Team" }],
  robots: "index, follow",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: 'https://i.ibb.co.com/20WNbGMp/favicon-192x192.png', type: 'image/png' },
    ],
    apple: [
      { url: 'https://i.ibb.co.com/20WNbGMp/favicon-192x192.png', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Rifelo — Platform Profil Interaktif Real-Time",
    description: "Connect physical tags to digital experiences instantly.",
    url: 'https://rifelo.id',
    type: "website",
    locale: "id_ID",
    siteName: "Rifelo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifelo — Platform Profil Interaktif Real-Time",
    description: "Connect physical tags to digital experiences instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
