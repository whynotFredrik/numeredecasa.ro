import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { CookieBanner } from "@/components/layout/CookieBanner";
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/JsonLd";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <WebSiteJsonLd />
      <Navbar />
      <CartSidebar />
      {children}
      <Footer />
      <CookieBanner />
    </>
  );
}
