import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { CookieBanner } from "@/components/layout/CookieBanner";
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://numarul.ro"),
  title: {
    default: "numarul.ro | Numere stradale premium, configurabile online",
    template: "%s — numarul.ro",
  },
  description:
    "Configurează live și comandă numere stradale, numere de apartament sau plăcuțe birou personalizate. Design premium, fabricat la comandă, livrare Sameday în toată România.",
  keywords: [
    "numere casa",
    "numere stradale",
    "numar casa",
    "numar stradal",
    "numarul",
    "placuta birou",
    "numar apartament",
    "semnalistica",
    "numere de casa",
    "numarul.ro",
    "numar adresa",
    "placa adresa",
    "numar vila",
  ],
  authors: [{ name: "SC GUNDAHAR SRL" }],
  alternates: {
    canonical: "https://numarul.ro",
  },
  openGraph: {
    title: "numarul.ro — Numere Stradale Premium",
    description:
      "Configurează-ți propriul număr stradal, de apartament sau plăcuță de birou. Fabricat la comandă, design premium, livrare Sameday.",
    url: "https://numarul.ro",
    siteName: "numarul.ro",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "numarul.ro — Numere Stradale Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "numarul.ro — Numere Stradale Premium",
    description:
      "Configurează-ți propriul număr stradal, de apartament sau plăcuță de birou. Fabricat la comandă, design premium, livrare Sameday.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} font-sans antialiased`}
      >
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
        <Navbar />
        <CartSidebar />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
