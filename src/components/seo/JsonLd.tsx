// JSON-LD Structured Data components for SEO

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "numarul.ro",
    legalName: "SC GUNDAHAR SRL",
    url: "https://numarul.ro",
    logo: "https://numarul.ro/logo.svg",
    description:
      "Numere stradale premium, numere de apartament și plăcuțe birou personalizate. Configurează-ți produsul live și comandă online.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Feleacului 14",
      addressLocality: "Oradea",
      addressCountry: "RO",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+40756210895",
      contactType: "customer service",
      availableLanguage: "Romanian",
      areaServed: "RO",
    },
    email: "ciobotaru.serban@gmail.com",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "numarul.ro",
    legalName: "SC GUNDAHAR SRL",
    url: "https://numarul.ro",
    logo: "https://numarul.ro/logo.svg",
    image: "https://numarul.ro/hero-ro.png",
    description:
      "Numere stradale premium, configurabile online. Design premium, fabricat la comandă, livrare Sameday în toată România.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Feleacului 14",
      addressLocality: "Oradea",
      addressCountry: "RO",
    },
    telephone: "+40756210895",
    email: "ciobotaru.serban@gmail.com",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "99 RON - 149 RON",
    currenciesAccepted: "RON",
    paymentAccepted: "Credit Card, Debit Card",
    areaServed: {
      "@type": "Country",
      name: "Romania",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "numarul.ro",
    url: "https://numarul.ro",
    description:
      "Configurează live și comandă numere stradale, numere de apartament sau plăcuțe birou personalizate.",
    publisher: {
      "@type": "Organization",
      name: "numarul.ro",
      legalName: "SC GUNDAHAR SRL",
    },
    inLanguage: "ro",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  price,
  image,
  sku,
}: ProductJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || "https://numarul.ro/hero-ro.png",
    sku: sku || name.toLowerCase().replace(/\s+/g, "-"),
    brand: {
      "@type": "Brand",
      name: "numarul.ro",
    },
    offers: {
      "@type": "Offer",
      url: "https://numarul.ro/configurator",
      priceCurrency: "RON",
      price: price.toString(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "numarul.ro",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "RO",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: {
            "@type": "QuantitativeValue",
            minValue: 4,
            maxValue: 6,
          },
        },
      },
    },
    manufacturer: {
      "@type": "Organization",
      name: "SC GUNDAHAR SRL",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
