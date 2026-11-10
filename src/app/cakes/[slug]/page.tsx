import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCakeBySlug, getAllCakes, getSiteSettings } from "@/lib/data-service";
import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  getFullUrl,
} from "@/lib/seo-utils";
import CakeDetailClient from "@/components/CakeDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cake, settings] = await Promise.all([
    getCakeBySlug(slug),
    getSiteSettings(),
  ]);

  if (!cake) {
    return {
      title: "Cake Not Found | AURA Patisserie",
      description: "The requested architectural cake could not be found.",
    };
  }

  const title = cake.metaTitle || `${cake.name} | Architectural Luxury Cake | AURA`;
  const description =
    cake.metaDescription || cake.tagline || cake.description.slice(0, 160);
  const canonicalUrl =
    cake.canonicalUrl || `${settings.siteUrl}/cakes/${cake.slug}`;
  const ogImageUrl = getFullUrl(cake.ogImage || cake.image, settings.siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: settings.siteName,
      images: [
        {
          url: ogImageUrl,
          alt: cake.imageAlt || cake.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CakeDetailPage({ params }: Props) {
  const { slug } = await params;
  const [cake, allCakes, settings] = await Promise.all([
    getCakeBySlug(slug),
    getAllCakes(),
    getSiteSettings(),
  ]);

  if (!cake) {
    notFound();
  }

  // Related cakes in same occasion
  const relatedCakes = allCakes.filter(
    (c) => c.slug !== cake.slug && c.occasion === cake.occasion
  );

  // Auto-generate or raw JSON-LD
  let jsonLdScripts: object[] = [];

  if (cake.rawJsonLd && cake.rawJsonLd.trim()) {
    try {
      const parsed = JSON.parse(cake.rawJsonLd);
      jsonLdScripts = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      console.warn("Invalid rawJsonLd override on cake:", cake.slug);
    }
  }

  if (jsonLdScripts.length === 0) {
    const productJson = generateProductJsonLd(cake, settings.siteUrl);
    const breadcrumbJson = generateBreadcrumbJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Catalog", url: "/cakes" },
        {
          name: cake.occasion,
          url: `/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`,
        },
        { name: cake.name, url: `/cakes/${cake.slug}` },
      ],
      settings.siteUrl
    );

    jsonLdScripts.push(productJson, breadcrumbJson);

    if (cake.faqs && cake.faqs.length > 0) {
      const faqJson = generateFaqJsonLd(cake.faqs);
      if (faqJson) jsonLdScripts.push(faqJson);
    }
  }

  return (
    <>
      {/* Injected Structured Data (JSON-LD) for Search Engines & AI Crawlers */}
      {jsonLdScripts.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <CakeDetailClient cake={cake} relatedCakes={relatedCakes} />
    </>
  );
}
