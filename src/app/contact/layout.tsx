import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Întrebări și Suport",
  description:
    "Contactează-ne pentru orice întrebare despre numere stradale, livrare sau comenzi. SC GUNDAHAR SRL, Str. Feleacului 14, Oradea. Telefon: 0756 210 895.",
  alternates: {
    canonical: "https://numarul.ro/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
