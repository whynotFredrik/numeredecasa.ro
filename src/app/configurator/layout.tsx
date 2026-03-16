import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurator — Personalizează-ți Numărul Stradal",
  description:
    "Configurează live numărul tău stradal, de apartament sau plăcuța de birou. Previzualizare instant, culori și texte personalizabile. Comandă online cu livrare Sameday.",
  alternates: {
    canonical: "https://numarul.ro/configurator",
  },
};

export default function ConfiguratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
