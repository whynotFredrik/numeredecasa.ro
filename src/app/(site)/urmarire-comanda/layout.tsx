import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Urmărire Comandă — Verifică statusul comenzii tale",
  description:
    "Urmărește statusul comenzii tale de plăcuțe stradale. Introdu ID-ul comenzii și email-ul pentru a vedea detalii despre livrare, plată și produsele comandate.",
  alternates: {
    canonical: "https://numarul.ro/urmarire-comanda",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function UrmarireComandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
