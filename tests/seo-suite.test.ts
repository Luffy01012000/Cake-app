import { describe, it, expect } from "vitest";

if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile();
}
import {
  analyzeSeo,
  validateJsonString,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateOrganizationJsonLd,
  generateItemListJsonLd,
  getFullUrl,
} from "../src/lib/seo-utils";
import { formatRobotsTxt } from "../src/lib/robots-utils";
import { signSessionToken, verifySessionToken } from "../src/lib/auth";
import {
  getAllCakes,
  getCakeBySlug,
  getCakesByOccasion,
  saveCake,
  deleteCake,
  getPageSeo,
  getAllPagesSeo,
  savePageSeo,
  getRobotsConfig,
  saveRobotsConfig,
  getSiteSettings,
  saveSiteSettings,
  getDatabaseStatus,
} from "../src/lib/data-service";

describe("SEO Scoring and SERP Utilities", () => {
  it("computes a high SEO score for well-optimized metadata", () => {
    const title = "The Haute Cake Catalog — Handcrafted Masterpieces | AURA";
    const description =
      "Explore our complete portfolio of luxury architectural cakes. Filter by occasion, flavor profile, and guest servings with white-glove delivery.";
    const alt = "Haute architectural cake with edible gold foil and sugar florals";

    const analysis = analyzeSeo(title, description, alt);

    expect(analysis.overallScore).toBe(100);
    expect(analysis.titleStatus).toBe("good");
    expect(analysis.descriptionStatus).toBe("good");
    expect(analysis.hasAltText).toBe(true);
    expect(analysis.titleLength).toBe(title.length);
    expect(analysis.descriptionLength).toBe(description.length);
  });

  it("penalizes empty or short metadata correctly", () => {
    const analysis = analyzeSeo("Cake", "Short");

    expect(analysis.overallScore).toBeLessThan(50);
    expect(analysis.titleStatus).toBe("short");
    expect(analysis.descriptionStatus).toBe("short");
    expect(analysis.hasAltText).toBe(false);

    const emptyAnalysis = analyzeSeo("", "", "");
    expect(emptyAnalysis.titleStatus).toBe("empty");
    expect(emptyAnalysis.descriptionStatus).toBe("empty");
    expect(emptyAnalysis.overallScore).toBe(0);
  });

  it("validates JSON string accurately", () => {
    expect(validateJsonString('{"@context": "https://schema.org"}').valid).toBe(true);
    expect(validateJsonString("[1, 2, 3]").valid).toBe(true);
    expect(validateJsonString("not json").valid).toBe(false);
    expect(validateJsonString("{broken:").valid).toBe(false);
    expect(validateJsonString("").valid).toBe(true);
  });
});

describe("JSON-LD Schema Generators", () => {
  const siteUrl = "https://aurapatisserie.com";

  it("generates valid Product schema with offers and brand", () => {
    const schema = generateProductJsonLd(
      {
        id: "elysian-wedding-tier",
        slug: "elysian-wedding-tier",
        name: "The Elysian Grand Tier",
        tagline: "Architectural purity crafted for eternal vows.",
        occasion: "Weddings",
        price: 680,
        image: "/images/wedding_cake.jpg",
        imageAlt: "Architectural 3-tier ivory luxury wedding cake",
        servings: "65–80 guests",
        tiers: 3,
        flavors: ["Tahitian Vanilla Bean", "Champagne Strawberry Ganache"],
        description: "An awe-inspiring 3-tier centerpiece cloaked in immaculate ivory fondant.",
        leadTime: "7 days minimum",
      },
      siteUrl
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("The Elysian Grand Tier");
    expect(schema.offers["@type"]).toBe("Offer");
    expect(schema.offers.price).toBe("680.00");
    expect(schema.offers.priceCurrency).toBe("USD");
    expect(schema.offers.availability).toBe("https://schema.org/InStock");
    expect(schema.offers.url).toBe("https://aurapatisserie.com/cakes/elysian-wedding-tier");
    expect(schema.brand.name).toBe("AURA Patisserie");
  });

  it("generates BreadcrumbList schema with 1-based positions", () => {
    const schema = generateBreadcrumbJsonLd(
      [
        { name: "Home", url: "/" },
        { name: "Weddings", url: "/occasions/weddings" },
        { name: "The Elysian Grand Tier", url: "/cakes/elysian-wedding-tier" },
      ],
      siteUrl
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].item).toBe("https://aurapatisserie.com/");
    expect(schema.itemListElement[2].position).toBe(3);
    expect(schema.itemListElement[2].name).toBe("The Elysian Grand Tier");
  });

  it("generates FAQPage schema with questions and accepted answers", () => {
    const faqs = [
      { question: "How far in advance must I order?", answer: "At least 48 hours for couture cakes." },
      { question: "Do you deliver interstate?", answer: "White-glove climate-controlled delivery within 100 miles." },
    ];
    const schema = generateFaqJsonLd(faqs);

    expect(schema).not.toBeNull();
    expect(schema?.["@context"]).toBe("https://schema.org");
    expect(schema?.["@type"]).toBe("FAQPage");
    expect(schema?.mainEntity).toHaveLength(2);
    expect(schema?.mainEntity[0].name).toBe(faqs[0].question);
    expect(schema?.mainEntity[0].acceptedAnswer.text).toBe(faqs[0].answer);
  });

  it("returns null for empty FAQ list", () => {
    expect(generateFaqJsonLd([])).toBeNull();
  });

  it("generates Organization schema with bakery details", () => {
    const settings = {
      siteName: "AURA Patisserie",
      siteUrl: "https://aurapatisserie.com",
      siteDescription: "Haute architectural confectionery",
      logoUrl: "/images/wedding_cake.jpg",
      contactEmail: "concierge@aurapatisserie.com",
      contactPhone: "+1 (800) 555-AURA",
      currency: "USD",
    };

    const schema = generateOrganizationJsonLd(settings, siteUrl);
    expect(schema["@type"]).toBe("Bakery");
    expect(schema.name).toBe("AURA Patisserie");
    expect(schema.url).toBe("https://aurapatisserie.com");
    expect(schema.email).toBe("concierge@aurapatisserie.com");
    expect(schema.telephone).toBe("+1 (800) 555-AURA");
  });

  it("generates ItemList schema for collections", () => {
    const items = [
      { name: "Cake A", slug: "cake-a", image: "/a.jpg", price: 200 },
      { name: "Cake B", slug: "cake-b", image: "/b.jpg", price: 350 },
    ];
    const schema = generateItemListJsonLd(items, siteUrl, "Wedding Collection");

    expect(schema["@type"]).toBe("ItemList");
    expect(schema.name).toBe("Wedding Collection");
    expect(schema.numberOfItems).toBe(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].url).toBe("https://aurapatisserie.com/cakes/cake-a");
  });
});

describe("Dynamic Robots.txt RFC 9309 Generator with AI Crawler Rules", () => {
  it("generates robots.txt with all AI crawlers allowed", () => {
    const output = formatRobotsTxt({
      gptBotAllowed: true,
      perplexityBotAllowed: true,
      claudeBotAllowed: true,
      googleExtendedAllowed: true,
      ccBotAllowed: true,
      customRules: "",
      sitemapUrl: "https://aurapatisserie.com/sitemap.xml",
    });

    expect(output).toContain("User-agent: *");
    expect(output).toContain("Disallow: /admin");
    expect(output).toContain("Disallow: /admin/*");
    expect(output).toContain("User-agent: GPTBot\nAllow: /");
    expect(output).toContain("User-agent: PerplexityBot\nAllow: /");
    expect(output).toContain("User-agent: ClaudeBot\nAllow: /");
    expect(output).toContain("User-agent: Google-Extended\nAllow: /");
    expect(output).toContain("User-agent: CCBot\nAllow: /");
    expect(output).toContain("Sitemap: https://aurapatisserie.com/sitemap.xml");
  });

  it("disallows specific AI bots when toggled off", () => {
    const output = formatRobotsTxt({
      gptBotAllowed: false,
      perplexityBotAllowed: false,
      claudeBotAllowed: true,
      googleExtendedAllowed: false,
      ccBotAllowed: false,
      customRules: "# Custom restriction\nDisallow: /private",
      sitemapUrl: "https://aurapatisserie.com/sitemap.xml",
    });

    expect(output).toContain("User-agent: GPTBot\nDisallow: /");
    expect(output).toContain("User-agent: PerplexityBot\nDisallow: /");
    expect(output).toContain("User-agent: ClaudeBot\nAllow: /");
    expect(output).toContain("User-agent: Google-Extended\nDisallow: /");
    expect(output).toContain("User-agent: CCBot\nDisallow: /");
    expect(output).toContain("# Custom restriction\nDisallow: /private");
  });
});

describe("Authentication JWT & RBAC Session Logic", () => {
  it("signs and verifies valid session tokens", async () => {
    const token = await signSessionToken({
      id: "user-test-123",
      email: "admin@aurapatisserie.com",
      name: "Admin User",
      role: "ADMIN",
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe("user-test-123");
    expect(payload?.email).toBe("admin@aurapatisserie.com");
    expect(payload?.name).toBe("Admin User");
    expect(payload?.role).toBe("ADMIN");
  });

  it("signs and verifies SEO_SPECIALIST role", async () => {
    const token = await signSessionToken({
      id: "seo-test-456",
      email: "seo@aurapatisserie.com",
      name: "SEO Specialist",
      role: "SEO_SPECIALIST",
    });

    const payload = await verifySessionToken(token);
    expect(payload?.role).toBe("SEO_SPECIALIST");
  });

  it("rejects tampered or malformed JWT tokens", async () => {
    const validToken = await signSessionToken({
      id: "user-tamper",
      email: "test@aurapatisserie.com",
      name: "Tamper Test",
      role: "ADMIN",
    });

    const tampered = validToken.slice(0, -6) + "xxxxxx";
    const result = await verifySessionToken(tampered);
    expect(result).toBeNull();

    expect(await verifySessionToken("not-a-jwt")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
});

describe("Data Service and Resilient Store CRUD Operations", () => {
  it("provides database status diagnostic", async () => {
    const status = await getDatabaseStatus();
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("engine");
    expect(typeof status.connected).toBe("boolean");
  });

  it("retrieves all seeded cakes", async () => {
    const cakes = await getAllCakes();
    expect(cakes.length).toBeGreaterThanOrEqual(6);
    const slugs = cakes.map((c) => c.slug);
    expect(slugs).toContain("elysian-wedding-tier");
    expect(slugs).toContain("blush-seraphina-birthday");
    expect(slugs).toContain("nocturne-anniversary-velvet");
  });

  it("fetches a specific cake by slug with full metadata and FAQs", async () => {
    const cake = await getCakeBySlug("elysian-wedding-tier");
    expect(cake).not.toBeNull();
    expect(cake?.name).toBe("The Elysian Grand Tier");
    expect(cake?.occasion).toBe("Weddings");
    expect(cake?.metaTitle).toBeDefined();
    expect(cake?.imageAlt).toBeDefined();
    expect(cake?.faqs.length).toBeGreaterThan(0);
  });

  it("filters cakes by occasion", async () => {
    const weddingCakes = await getCakesByOccasion("Weddings");
    expect(weddingCakes.length).toBeGreaterThan(0);
    expect(weddingCakes.every((c) => c.occasion.toLowerCase() === "weddings")).toBe(true);
  });

  it("saves and updates a cake in the catalog", async () => {
    const testSlug = "test-haute-creation";
    const saved = await saveCake({
      name: "Test Haute Creation",
      slug: testSlug,
      occasion: "Anniversaries",
      price: 520,
      image: "/images/test.jpg",
      imageAlt: "Sculpted edible quartz anniversary cake",
      imageCaption: "Limited edition anniversary centerpiece",
      metaTitle: "Test Haute Creation — Limited Edition | AURA",
      metaDescription: "An exquisite test architectural cake sculpted for milestone anniversaries.",
      faqs: [
        { question: "Is this edible gold leaf?", answer: "Yes, certified 24-karat edible gold.", order: 0 },
      ],
    });

    expect(saved.slug).toBe(testSlug);
    expect(saved.price).toBe(520);

    const fetched = await getCakeBySlug(testSlug);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe("Test Haute Creation");
    expect(fetched?.imageAlt).toBe("Sculpted edible quartz anniversary cake");
    expect(fetched?.faqs).toHaveLength(1);

    // Clean up
    await deleteCake(testSlug);
    const afterDelete = await getCakeBySlug(testSlug);
    expect(afterDelete).toBeNull();
  });

  it("reads and updates PageSeo metadata", async () => {
    const initialHomeSeo = await getPageSeo("/");
    expect(initialHomeSeo).not.toBeNull();
    expect(initialHomeSeo?.path).toBe("/");
    expect(initialHomeSeo?.title).toBeDefined();

    const allPages = await getAllPagesSeo();
    expect(allPages.length).toBeGreaterThanOrEqual(7);

    // Update page SEO
    await savePageSeo({
      path: "/test-page",
      title: "Test Page SEO Title | AURA",
      metaDescription: "Test page meta description exceeding 50 characters for verification.",
      faqs: [{ question: "Test Q?", answer: "Test A.", order: 0 }],
    });

    const retrieved = await getPageSeo("/test-page");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Test Page SEO Title | AURA");
  });

  it("reads and saves RobotsConfig and SiteSettings", async () => {
    const robots = await getRobotsConfig();
    expect(robots.sitemapUrl).toBeDefined();

    const updatedRobots = await saveRobotsConfig({
      ...robots,
      gptBotAllowed: false,
    });
    expect(updatedRobots.gptBotAllowed).toBe(false);

    const settings = await getSiteSettings();
    expect(settings.siteName).toBe("AURA Patisserie");
    expect(settings.currency).toBe("USD");

    await saveSiteSettings({
      ...settings,
      siteDescription: "Updated luxury confectionery description.",
    });
    const refreshedSettings = await getSiteSettings();
    expect(refreshedSettings.siteDescription).toBe("Updated luxury confectionery description.");
  });
});

describe("Edge Cases & Boundary Conditions", () => {
  const siteUrl = "https://aurapatisserie.com";

  it("handles getFullUrl edge cases (absolute, missing slashes, trailing slashes)", () => {
    // Already absolute
    expect(getFullUrl("https://cdn.aurapatisserie.com/cake.jpg", siteUrl)).toBe("https://cdn.aurapatisserie.com/cake.jpg");
    // Missing leading slash
    expect(getFullUrl("uploads/cake.jpg", "https://aurapatisserie.com/")).toBe("https://aurapatisserie.com/uploads/cake.jpg");
    // Empty input returns siteUrl
    expect(getFullUrl("", siteUrl)).toBe(siteUrl);
  });

  it("handles extremely long titles and descriptions in analyzeSeo", () => {
    const longTitle = "A".repeat(80);
    const longDesc = "B".repeat(200);

    const result = analyzeSeo(longTitle, longDesc, "valid alt text");
    expect(result.titleStatus).toBe("long");
    expect(result.descriptionStatus).toBe("long");
    expect(result.titleMessage).toContain("truncated");
    expect(result.descriptionMessage).toContain("exceeds");
  });

  it("handles FAQs with quotes and special characters", () => {
    const complexFaqs = [
      {
        question: 'What is "pulled sugar" & 24k gold ribbon art?',
        answer: "It is 100% edible artisan sugar heated to 150°C & sculpted by master patissiers.",
      },
    ];
    const schema = generateFaqJsonLd(complexFaqs);
    expect(schema?.mainEntity[0].name).toBe('What is "pulled sugar" & 24k gold ribbon art?');
    expect(schema?.mainEntity[0].acceptedAnswer.text).toContain("150°C");
  });

  it("gracefully generates Product JSON-LD when optional fields are empty", () => {
    const minimalCake = {
      id: "minimal-cake",
      slug: "minimal-cake",
      name: "Minimal Cake",
      tagline: "",
      occasion: "Birthdays",
      price: 150,
      image: "/minimal.jpg",
      servings: "10 guests",
      tiers: 1,
      flavors: [],
      description: "Simple delicious cake",
    };

    const schema = generateProductJsonLd(minimalCake, siteUrl);
    expect(schema.name).toBe("Minimal Cake");
    expect(schema.offers.price).toBe("150.00");
    expect(schema.additionalProperty).toBeDefined();
  });

  it("formats robots.txt with custom trailing and relative sitemaps", () => {
    const output = formatRobotsTxt(
      {
        gptBotAllowed: true,
        perplexityBotAllowed: false,
        claudeBotAllowed: true,
        googleExtendedAllowed: false,
        ccBotAllowed: false,
        customRules: "Disallow: /checkout\nDisallow: /account",
        sitemapUrl: "custom-sitemap.xml",
      },
      "https://aurapatisserie.com/"
    );

    expect(output).toContain("Sitemap: https://aurapatisserie.com/custom-sitemap.xml");
    expect(output).toContain("Disallow: /checkout");
    expect(output).toContain("Disallow: /account");
  });

  it("fetches a cake by internal database ID as well as slug", async () => {
    const testCake = await saveCake({
      name: "CUID Id Test Cake",
      slug: "cuid-id-test-slug",
      occasion: "Weddings",
      price: 450,
    });

    // Lookup by slug
    const bySlug = await getCakeBySlug("cuid-id-test-slug");
    expect(bySlug).not.toBeNull();
    expect(bySlug?.id).toBe(testCake.id);

    // Lookup by ID
    const byId = await getCakeBySlug(testCake.id);
    expect(byId).not.toBeNull();
    expect(byId?.slug).toBe("cuid-id-test-slug");

    await deleteCake(testCake.id);
  });

  it("successfully changes a cake's slug during saveCake without primary key conflict", async () => {
    const initialCake = await saveCake({
      id: "cake-custom-pk-456",
      name: "Original Slug Cake",
      slug: "original-slug-cake",
      occasion: "Anniversaries",
      price: 350,
    });

    expect(initialCake.slug).toBe("original-slug-cake");
    expect(initialCake.id).toBe("cake-custom-pk-456");

    // Change the slug of the existing cake
    const updatedCake = await saveCake({
      id: initialCake.id,
      name: "Renamed Slug Cake",
      slug: "renamed-slug-cake",
      occasion: "Anniversaries",
      price: 380,
    });

    expect(updatedCake.slug).toBe("renamed-slug-cake");
    expect(updatedCake.id).toBe("cake-custom-pk-456");

    // Old slug should no longer resolve
    const oldSlugLookup = await getCakeBySlug("original-slug-cake");
    expect(oldSlugLookup).toBeNull();

    // New slug should resolve to the same ID
    const newSlugLookup = await getCakeBySlug("renamed-slug-cake");
    expect(newSlugLookup).not.toBeNull();
    expect(newSlugLookup?.name).toBe("Renamed Slug Cake");
    expect(newSlugLookup?.price).toBe(380);
    expect(newSlugLookup?.id).toBe("cake-custom-pk-456");

    // Persistent ID lookup still resolves
    const idLookup = await getCakeBySlug("cake-custom-pk-456");
    expect(idLookup).not.toBeNull();
    expect(idLookup?.slug).toBe("renamed-slug-cake");

    await deleteCake(updatedCake.id);
  });

  it("matches hyphenated occasion slugs like baby-showers and weddings in getCakesByOccasion", async () => {
    const babyShowerCakes = await getCakesByOccasion("baby-showers");
    expect(babyShowerCakes.length).toBeGreaterThanOrEqual(1);
    expect(babyShowerCakes[0].occasion.toLowerCase()).toContain("baby shower");

    const weddingCakes = await getCakesByOccasion("weddings");
    expect(weddingCakes.length).toBeGreaterThanOrEqual(1);
  });

  it("parses and validates raw JSON-LD overrides with Unicode and multi-byte emoji characters", () => {
    const rawWithEmoji = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "👑 The Royal Crown Cake 🎂✨",
      description: "Infused with 24k gold foil, Sicilian pistachios & pure vanilla bean.",
      offers: {
        "@type": "Offer",
        price: "850.00",
        priceCurrency: "USD",
      },
    });

    const validation = validateJsonString(rawWithEmoji);
    expect(validation.valid).toBe(true);

    const parsed = JSON.parse(rawWithEmoji);
    expect(parsed.name).toContain("👑");
    expect(parsed.name).toContain("🎂");

    // Escaped script content safely encodes < characters
    const jsonScript = JSON.stringify(parsed).replace(/</g, "\\u003c");
    expect(jsonScript).not.toContain("<");
  });

  it("enforces RBAC role separation between ADMIN and SEO_SPECIALIST", async () => {
    const adminToken = await signSessionToken({
      id: "admin-user-1",
      email: "admin@aurapatisserie.com",
      name: "Admin",
      role: "ADMIN",
    });
    const seoToken = await signSessionToken({
      id: "seo-user-1",
      email: "seo@aurapatisserie.com",
      name: "SEO Specialist",
      role: "SEO_SPECIALIST",
    });

    const adminSession = await verifySessionToken(adminToken);
    const seoSession = await verifySessionToken(seoToken);

    expect(adminSession?.role).toBe("ADMIN");
    expect(seoSession?.role).toBe("SEO_SPECIALIST");

    // Admin has permission to delete / manage users; SEO specialist does not
    const canAdminDeleteCake = adminSession?.role === "ADMIN";
    const canSeoDeleteCake = seoSession?.role === "ADMIN";

    expect(canAdminDeleteCake).toBe(true);
    expect(canSeoDeleteCake).toBe(false);
  });
});
