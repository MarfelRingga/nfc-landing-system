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
  title: "rifelo - Fluidly Connected",
  description: "The silent anchor of your professional identity. A matte silicone masterpiece for the modern era.",
  keywords: ["NFC", "Digital Business Card", "Smart Tag", "Landing Page", "rifelo", "Identity Management"],
  authors: [{ name: "rifelo Team" }],
  robots: "index, follow",
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
    title: "rifelo - Fluidly Connected",
    description: "Connect physical tags to digital experiences instantly.",
    type: "website",
    locale: "id_ID",
    siteName: "rifelo",
  },
  twitter: {
    card: "summary_large_image",
    title: "rifelo - Fluidly Connected",
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
