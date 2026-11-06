import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { getAllCakes, getPageSeo, getSiteSettings } from "@/lib/data-service";
import {
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generateFaqJsonLd,
  getFullUrl,
} from "@/lib/seo-utils";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo("/cakes"),
    getSiteSettings(),
  ]);

  const title =
    pageSeo?.title ||
    "The Haute Cake Catalog — Handcrafted Architectural Masterpieces | AURA";
  const description =
    pageSeo?.metaDescription ||
    "Explore our complete portfolio of luxury architectural cakes. Filter by occasion, flavor profile, and guest servings with white-glove delivery.";
  const canonicalUrl = pageSeo?.canonicalUrl || `${settings.siteUrl}/cakes`;
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
      images: [{ url: ogImageUrl, alt: "AURA Patisserie Cake Catalog" }],
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

export default async function CakesIndexPage() {
  const [cakes, pageSeo, settings] = await Promise.all([
    getAllCakes(),
    getPageSeo("/cakes"),
    getSiteSettings(),
  ]);

  const occasions = [
    { name: "All Cakes", href: "/cakes" },
    { name: "Weddings", href: "/occasions/weddings" },
    { name: "Birthdays", href: "/occasions/birthdays" },
    { name: "Anniversaries", href: "/occasions/anniversaries" },
    { name: "Baby Showers", href: "/occasions/baby-showers" },
    { name: "Galas", href: "/occasions/galas" },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Haute Cake Catalog", url: "/cakes" },
  ];

  const jsonLdScripts: object[] = [];

  if (pageSeo?.rawJsonLd && pageSeo.rawJsonLd.trim()) {
    try {
      const parsed = JSON.parse(pageSeo.rawJsonLd);
      jsonLdScripts.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      console.warn("Invalid rawJsonLd for /cakes page");
    }
  }

  if (jsonLdScripts.length === 0) {
    jsonLdScripts.push(
      generateBreadcrumbJsonLd(breadcrumbs, settings.siteUrl),
      generateItemListJsonLd(
        cakes.map((c) => ({
          name: c.name,
          slug: c.slug,
          image: c.image,
          price: c.price,
        })),
        settings.siteUrl,
        "AURA Haute Cake Catalog"
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
            <span className="text-[#1d1d1f] font-medium">Haute Cake Catalog</span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="bg-gradient-to-b from-[#fafafc] to-white py-16 sm:py-24 border-b border-[#f0f0f4]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="inline-flex items-center gap-2 bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Full Patisserie Portfolio
            </div>
            <h1 className="text-[36px] sm:text-[52px] font-bold text-[#1d1d1f] tracking-tight mb-4">
              The Haute Cake Catalog
            </h1>
            <p className="text-[19px] text-[#474747] max-w-[760px] leading-relaxed">
              Explore our complete repertoire of bespoke architectural cakes. Hand-sculpted for bridal vows, milestone birthdays, romantic galas, and intimate celebrations.
            </p>

            {/* Occasion Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-8">
              {occasions.map((occ) => (
                <Link
                  key={occ.name}
                  href={occ.href}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                    occ.name === "All Cakes"
                      ? "bg-[#1d1d1f] text-white"
                      : "bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f]"
                  }`}
                >
                  {occ.name}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Catalog Grid */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
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
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-medium text-[#1d1d1f]">
                    {cake.occasion}
                  </div>
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
                      <h2 className="text-[20px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                        <Link href={`/cakes/${cake.slug}`}>{cake.name}</Link>
                      </h2>
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
                    <Link
                      href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-[12px] text-[#707070] hover:text-[#1d1d1f]"
                    >
                      More in {cake.occasion}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Catalog FAQs */}
          {pageSeo?.faqs && pageSeo.faqs.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[#e5e5ea] max-w-[800px]">
              <h2 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight mb-6">
                Cake Catalog Inquiries & Ordering Guide
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
        </main>
      </div>
    </>
  );
}
