export interface SeoScore {
  titleLength: number;
  titleStatus: "good" | "short" | "long" | "empty";
  titleMessage: string;
  descriptionLength: number;
  descriptionStatus: "good" | "short" | "long" | "empty";
  descriptionMessage: string;
  hasAltText: boolean;
  overallScore: number; // 0-100
}

export function analyzeSeo(
  title: string = "",
  description: string = "",
  altText: string = ""
): SeoScore {
  const tLen = title.trim().length;
  const dLen = description.trim().length;

  let titleStatus: SeoScore["titleStatus"] = "good";
  let titleMessage = "Optimal title length (50–60 characters).";
  if (tLen === 0) {
    titleStatus = "empty";
    titleMessage = "Title is missing.";
  } else if (tLen < 30) {
    titleStatus = "short";
    titleMessage = "Title is too short (aim for 50–60 characters).";
  } else if (tLen > 65) {
    titleStatus = "long";
    titleMessage = "Title may be truncated in Google search results (> 60 characters).";
  }

  let descriptionStatus: SeoScore["descriptionStatus"] = "good";
  let descriptionMessage = "Optimal description length (120–160 characters).";
  if (dLen === 0) {
    descriptionStatus = "empty";
    descriptionMessage = "Meta description is missing.";
  } else if (dLen < 80) {
    descriptionStatus = "short";
    descriptionMessage = "Description is short (aim for 120–160 characters for maximum CTR).";
  } else if (dLen > 165) {
    descriptionStatus = "long";
    descriptionMessage = "Description exceeds 160 characters and will likely be truncated.";
  }

  const hasAltText = altText.trim().length > 5;

  let score = 0;
  if (titleStatus === "good") score += 40;
  else if (titleStatus === "short" || titleStatus === "long") score += 20;

  if (descriptionStatus === "good") score += 40;
  else if (descriptionStatus === "short" || descriptionStatus === "long") score += 20;

  if (hasAltText) score += 20;

  return {
    titleLength: tLen,
    titleStatus,
    titleMessage,
    descriptionLength: dLen,
    descriptionStatus,
    descriptionMessage,
    hasAltText,
    overallScore: score,
  };
}

export function validateJsonString(raw: string): { valid: boolean; error?: string } {
  if (!raw || !raw.trim()) return { valid: true };
  try {
    JSON.parse(raw);
    return { valid: true };
  } catch (err: unknown) {
    return { valid: false, error: (err as Error).message };
  }
}

export function getFullUrl(pathOrUrl: string, siteUrl: string = "https://aurapatisserie.com"): string {
  if (!pathOrUrl) return siteUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl.replace(/\/$/, "")}${cleanPath}`;
}

export function generateProductJsonLd(
  cake: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    occasion: string;
    price: number;
    image: string;
    imageAlt?: string;
    servings: string;
    tiers: number;
    flavors: string[];
    description: string;
    dimensions?: string;
    leadTime?: string;
  },
  siteUrl: string = "https://aurapatisserie.com"
) {
  const productUrl = `${siteUrl}/cakes/${cake.slug}`;
  const imageUrl = getFullUrl(cake.image, siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: cake.name,
    image: [imageUrl],
    description: cake.description || cake.tagline,
    sku: cake.slug,
    category: cake.occasion,
    brand: {
      "@type": "Brand",
      name: "AURA Patisserie",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: cake.price.toFixed(2),
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 7,
            unitCode: "d",
          },
        },
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Occasion",
        value: cake.occasion,
      },
      {
        "@type": "PropertyValue",
        name: "Tiers",
        value: String(cake.tiers),
      },
      {
        "@type": "PropertyValue",
        name: "Servings",
        value: cake.servings,
      },
      {
        "@type": "PropertyValue",
        name: "Flavors",
        value: cake.flavors.join(", "),
      },
      ...(cake.leadTime
        ? [
            {
              "@type": "PropertyValue",
              name: "Lead Time",
              value: cake.leadTime,
            },
          ]
        : []),
    ],
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
  siteUrl: string = "https://aurapatisserie.com"
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getFullUrl(item.url, siteUrl),
    })),
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationJsonLd(
  settings = {
    siteName: "AURA Patisserie",
    siteUrl: "https://aurapatisserie.com",
    siteDescription: "Architectural Haute Patisserie & Bespoke Luxury Cakes",
    logoUrl: "/images/wedding_cake.jpg",
    contactEmail: "concierge@aurapatisserie.com",
    contactPhone: "+1 (800) 555-AURA",
  },
  siteUrl: string = "https://aurapatisserie.com"
) {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${siteUrl}#bakery`,
    name: settings.siteName,
    url: siteUrl,
    logo: getFullUrl(settings.logoUrl, siteUrl),
    image: getFullUrl(settings.logoUrl, siteUrl),
    description: settings.siteDescription,
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "740 Madison Avenue",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10065",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.7672",
      longitude: "-73.9683",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };
}

export function generateItemListJsonLd(
  cakes: { name: string; slug: string; image: string; price: number }[],
  siteUrl: string = "https://aurapatisserie.com",
  listName: string = "Haute Cake Catalog"
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: cakes.length,
    itemListElement: cakes.map((cake, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cake.name,
      url: `${siteUrl}/cakes/${cake.slug}`,
      image: getFullUrl(cake.image, siteUrl),
    })),
  };
}
