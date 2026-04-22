import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finalizare Comandă",
  description: "Finalizează comanda ta de numere stradale personalizate. Plată securizată prin Netopia, livrare rapidă.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
