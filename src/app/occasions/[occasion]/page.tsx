import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import {
  getAllCakes,
  getPageSeo,
  getSiteSettings,
} from "@/lib/data-service";
import {
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generateFaqJsonLd,
  getFullUrl,
} from "@/lib/seo-utils";

interface Props {
  params: Promise<{ occasion: string }>;
}

const OCCASION_MAP: Record<string, { name: string; subtitle: string; tagline: string }> = {
  weddings: {
    name: "Weddings",
    subtitle: "Architectural Bridal Centerpieces & Eternal Tiers",
    tagline: "Immaculate architectural tiers adorned with 24k gold leaf and hand-sculpted sugar florals for high-end ceremonies.",
  },
  birthdays: {
    name: "Birthdays",
    subtitle: "Modern Luxury Birthday Masterpieces",
    tagline: "Bold textures, velvety cocoa butter finishes, and personalized calligraphy to celebrate another year around the sun.",
  },
  anniversaries: {
    name: "Anniversaries",
    subtitle: "Sensual Haute Creations for Timeless Love",
    tagline: "Grand Cru Araguani chocolates, high-gloss mirror glazes, and sculptured edible gold lace for intimate milestones.",
  },
  "baby-showers": {
    name: "Baby Showers",
    subtitle: "Ethereal Pastel Velvet Creations",
    tagline: "Cloud-soft Earl Grey mascarpone and subtle fruit infusions designed to welcome life’s greatest miracles.",
  },
  galas: {
    name: "Galas",
    subtitle: "Avant-Garde Architectural Banqueting Centerpieces",
    tagline: "Cantilevered stepped cubes, geometric origami, and large-capacity centerpieces for black-tie galas and corporate banquets.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { occasion } = await params;
  const key = occasion.toLowerCase();
  const occInfo = OCCASION_MAP[key];

  if (!occInfo) {
    return {
      title: "Occasion Not Found | AURA Patisserie",
      description: "The requested cake occasion category could not be found.",
    };
  }

  const [pageSeo, settings] = await Promise.all([
    getPageSeo(`/occasions/${key}`),
    getSiteSettings(),
  ]);

  const title =
    pageSeo?.title ||
    `${occInfo.name} Cakes — Architectural Luxury Collection | AURA`;
  const description =
    pageSeo?.metaDescription ||
    `${occInfo.tagline} Discover handcrafted ${occInfo.name.toLowerCase()} cakes delivered white-glove across New York.`;
  const canonicalUrl =
    pageSeo?.canonicalUrl || `${settings.siteUrl}/occasions/${key}`;
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
      images: [{ url: ogImageUrl, alt: occInfo.name }],
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

export default async function OccasionPage({ params }: Props) {
  const { occasion } = await params;
  const key = occasion.toLowerCase();
  const occInfo = OCCASION_MAP[key];

  if (!occInfo) {
    notFound();
  }

  const [allCakes, pageSeo, settings] = await Promise.all([
    getAllCakes(),
    getPageSeo(`/occasions/${key}`),
    getSiteSettings(),
  ]);

  const matchingCakes = allCakes.filter(
    (c) => c.occasion.toLowerCase().replace(/[\s_-]+/g, "") === key.replace(/[\s_-]+/g, "")
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Occasions", url: "/cakes" },
    { name: occInfo.name, url: `/occasions/${key}` },
  ];

  const jsonLdScripts: object[] = [];

  if (pageSeo?.rawJsonLd && pageSeo.rawJsonLd.trim()) {
    try {
      const parsed = JSON.parse(pageSeo.rawJsonLd);
      jsonLdScripts.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      console.warn(`Invalid rawJsonLd for /occasions/${key} page`);
    }
  }

  if (jsonLdScripts.length === 0) {
    jsonLdScripts.push(
      generateBreadcrumbJsonLd(breadcrumbs, settings.siteUrl),
      generateItemListJsonLd(
        matchingCakes.map((c) => ({
          name: c.name,
          slug: c.slug,
          image: c.image,
          price: c.price,
        })),
        settings.siteUrl,
        `${occInfo.name} Cake Collection`
      )
    );

    if (pageSeo?.faqs && pageSeo.faqs.length > 0) {
      const faqJson = generateFaqJsonLd(pageSeo.faqs);
      if (faqJson) jsonLdScripts.push(faqJson);
    }
  }

  const otherOccasions = Object.entries(OCCASION_MAP).filter(([k]) => k !== key);

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

      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="bg-[#fafafc] border-b border-[#e5e5ea] py-3 px-4 sm:px-8"
        >
          <div className="max-w-[1200px] mx-auto flex items-center flex-wrap gap-2 text-[13px] text-[#707070]">
            <Link href="/" className="hover:text-[#1d1d1f] hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cakes" className="hover:text-[#1d1d1f] hover:underline">
              Occasions
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1d1d1f] font-medium">{occInfo.name}</span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="bg-gradient-to-b from-[#fafafc] to-white py-16 sm:py-24 border-b border-[#f0f0f4]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="inline-flex items-center gap-2 bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Haute Occasion Collection
            </div>
            <h1 className="text-[36px] sm:text-[52px] font-bold text-[#1d1d1f] tracking-tight mb-4">
              {occInfo.name} Architectural Cakes
            </h1>
            <p className="text-[19px] text-[#474747] max-w-[760px] leading-relaxed">
              {pageSeo?.metaDescription || occInfo.tagline}
            </p>
          </div>
        </header>

        {/* Cake Listing Grid */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
              Available Designs ({matchingCakes.length})
            </h2>
            <Link
              href="/cakes"
              className="text-[14px] text-[#0071e3] hover:underline font-medium"
            >
              View All Occasions &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchingCakes.map((cake) => (
              <article
                key={cake.id}
                className="bg-white rounded-[24px] overflow-hidden border border-[#e5e5ea] hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <Link
                  href={`/cakes/${cake.slug}`}
                  className="relative aspect-[4/3] w-full bg-[#f5f5f7] overflow-hidden block"
                >
                  <Image
                    src={cake.image}
                    alt={cake.imageAlt || `${cake.name} architectural cake`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {cake.isNew && (
                    <span className="absolute top-4 left-4 bg-[#b64400] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-medium text-[#474747]">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: cake.finishColor }}
                    />
                    {cake.swatchName}
                  </div>
                </Link>

                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-[20px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                        <Link href={`/cakes/${cake.slug}`}>{cake.name}</Link>
                      </h3>
                      <span className="text-[22px] font-bold text-[#1d1d1f]">
                        ${cake.price}
                      </span>
                    </div>

                    <p className="text-[14px] text-[#707070] line-clamp-2 leading-relaxed mb-4">
                      {cake.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[12px] text-[#474747] mb-6">
                      <span className="bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                        {cake.servings}
                      </span>
                      <span className="bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                        {cake.tiers} {cake.tiers === 1 ? "Tier" : "Tiers"}
                      </span>
                      <span className="bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                        Lead: {cake.leadTime}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#f5f5f7] flex items-center justify-between">
                    <Link
                      href={`/cakes/${cake.slug}`}
                      className="text-[14px] text-[#0071e3] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Specifications & Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Occasion FAQs */}
          {pageSeo?.faqs && pageSeo.faqs.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[#e5e5ea] max-w-[800px]">
              <h2 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight mb-6">
                Frequently Asked Questions about {occInfo.name} Cakes
              </h2>
              <div className="space-y-4">
                {pageSeo.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-[16px] border border-[#e5e5ea] bg-[#fafafc]"
                  >
                    <h3 className="font-semibold text-[16px] text-[#1d1d1f] mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-[14px] text-[#707070] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deep Internal Linking: Cross-links to other Occasions */}
          <section className="mt-20 pt-12 border-t border-[#e5e5ea]">
            <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight mb-6">
              Explore Other Cake Occasions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {otherOccasions.map(([k, info]) => (
                <Link
                  key={k}
                  href={`/occasions/${k}`}
                  className="p-5 rounded-[18px] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-all group block"
                >
                  <div className="text-[11px] uppercase tracking-wider text-[#707070] font-semibold mb-1">
                    Occasion
                  </div>
                  <div className="font-semibold text-[16px] text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors flex items-center justify-between">
                    <span>{info.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
