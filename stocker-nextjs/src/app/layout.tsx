import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stocker - Akıllı Stok Yönetim ve Envanter Takip Sistemi",
  description: "Stocker ile işletmenizin stok yönetimini kolaylaştırın. Gerçek zamanlı envanter takibi, otomatik sipariş yönetimi, detaylı raporlama ve analiz araçlarıyla verimliliğinizi artırın. 14 gün ücretsiz deneyin.",
  keywords: ["stok yönetimi", "envanter takibi", "stok kontrol sistemi", "depo yönetimi", "sipariş yönetimi", "SaaS stok yazılımı", "işletme yönetimi"],
  authors: [{ name: "Stocker" }],
  creator: "Stocker",
  publisher: "Stocker",
  metadataBase: new URL('https://stocker.app'),
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Stocker - Akıllı Stok Yönetim Sistemi",
    description: "İşletmenizin stok yönetimini kolaylaştıran modern, güçlü ve kullanıcı dostu platform. Gerçek zamanlı takip, otomatik raporlama ve kapsamlı analiz araçları.",
    url: 'https://stocker.app',
    siteName: 'Stocker',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stocker - Stok Yönetim Sistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Stocker - Akıllı Stok Yönetim Sistemi",
    description: "Modern stok yönetim platformu ile işletmenizin verimliliğini artırın. 14 gün ücretsiz deneyin.",
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
