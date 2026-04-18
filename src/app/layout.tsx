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
  title: "RIFELO - Fluidly Connected",
  description: "The silent anchor of your professional identity. A matte silicone masterpiece for the modern era.",
  keywords: ["NFC", "Digital Business Card", "Smart Tag", "Landing Page", "RIFELO", "Identity Management"],
  authors: [{ name: "RIFELO Team" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/brand/logos/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/logos/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/logos/favicon/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/logos/favicon/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/logos/favicon/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "RIFELO - Fluidly Connected",
    description: "Connect physical tags to digital experiences instantly.",
    type: "website",
    locale: "id_ID",
    siteName: "RIFELO",
  },
  twitter: {
    card: "summary_large_image",
    title: "RIFELO - Fluidly Connected",
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
