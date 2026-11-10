import { Suspense } from "react";
import { Metadata } from "next";
import { getAllCakes, getPageSeo, getSiteSettings } from "@/lib/data-service";
import {
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generateFaqJsonLd,
  getFullUrl,
} from "@/lib/seo-utils";
import HomeClient from "@/components/HomeClient";
import { CakeProduct } from "@/data/cakes";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo("/"),
    getSiteSettings(),
  ]);

  const title =
    pageSeo?.title ||
    "AURA Patisserie — Architectural Cakes for Every Occasion";
  const description =
    pageSeo?.metaDescription ||
    "Bespoke architectural cakes for weddings, milestone birthdays, anniversaries, baby showers, and grand galas. Handcrafted with pristine culinary artistry.";
  const canonicalUrl = pageSeo?.canonicalUrl || settings.siteUrl;
  const ogImageUrl = getFullUrl(pageSeo?.ogImage || settings.logoUrl, settings.siteUrl);

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
      images: [{ url: ogImageUrl, alt: settings.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: pageSeo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function HomePage() {
  const [dbCakes, pageSeo, settings] = await Promise.all([
    getAllCakes(),
    getPageSeo("/"),
    getSiteSettings(),
  ]);

  const cakes: CakeProduct[] = dbCakes.map((c) => ({
    id: c.slug || c.id,
    name: c.name,
    tagline: c.tagline,
    occasion: c.occasion as CakeProduct["occasion"],
    price: c.price,
    image: c.image,
    finishColor: c.finishColor,
    swatchName: c.swatchName,
    servings: c.servings,
    tiers: c.tiers,
    isNew: c.isNew,
    flavors: c.flavors,
    description: c.description,
    tastingNotes: c.tastingNotes,
    dimensions: c.dimensions,
    leadTime: c.leadTime,
  }));

  const jsonLdScripts: object[] = [];

  if (pageSeo?.rawJsonLd && pageSeo.rawJsonLd.trim()) {
    try {
      const parsed = JSON.parse(pageSeo.rawJsonLd);
      jsonLdScripts.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      console.warn("Invalid rawJsonLd for home page");
    }
  }

  if (jsonLdScripts.length === 0) {
    jsonLdScripts.push(
      generateOrganizationJsonLd(settings, settings.siteUrl),
      generateBreadcrumbJsonLd([{ name: "Home", url: "/" }], settings.siteUrl),
      generateItemListJsonLd(
        cakes.map((c) => ({
          name: c.name,
          slug: c.id,
          image: c.image,
          price: c.price,
        })),
        settings.siteUrl,
        "Featured Architectural Cakes"
      )
    );

    if (pageSeo?.faqs && pageSeo.faqs.length > 0) {
      const faqJson = generateFaqJsonLd(pageSeo.faqs);
      if (faqJson) jsonLdScripts.push(faqJson);
    }
  }

  return (
    <>
      {jsonLdScripts.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#000000]" />}>
        <HomeClient
          initialCakes={cakes}
          homeFaqs={pageSeo?.faqs || []}
        />
      </Suspense>
    </>
  );
}
