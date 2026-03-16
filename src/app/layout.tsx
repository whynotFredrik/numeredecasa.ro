import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { CookieBanner } from "@/components/layout/CookieBanner";

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
  title: {
    default: "numeredecasa.ro | Numere stradale premium, configurabile online",
    template: "%s — numeredecasa.ro",
  },
  description: "Configurează live și comandă numere stradale, numere de apartament sau plăcuțe birou personalizate. Design premium, fabricat la comandă, livrare Sameday în toată România.",
  keywords: ["numere casa", "numere stradale", "numar casa", "numar stradal", "placuta birou", "numar apartament", "semnalistica", "numere de casa", "numeredecasa"],
  authors: [{ name: "SC GUNDAHAR SRL" }],
  openGraph: {
    title: "numeredecasa.ro — Numere Stradale Premium",
    description: "Configurează-ți propriul număr stradal, de apartament sau plăcuță de birou. Fabricat la comandă, design premium, livrare Sameday.",
    url: "https://numeredecasa.ro",
    siteName: "numeredecasa.ro",
    locale: "ro_RO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        <Navbar />
        <CartSidebar />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
