import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  SEED_CAKES,
  SEED_PAGES,
  SEED_ROBOTS,
  SEED_SETTINGS,
  SEED_USERS,
} from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed Users (Admin & SEO Specialist)
  console.log("👤 Seeding admin and SEO users...");
  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.plainPassword, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    });
    console.log(`   ✓ User ${user.email} (${user.role}) seeded.`);
  }

  // 2. Seed Cakes & Cake FAQs
  console.log("🎂 Seeding cakes with rich SEO data...");
  for (const cake of SEED_CAKES) {
    const createdCake = await prisma.cake.upsert({
      where: { slug: cake.slug },
      update: {
        name: cake.name,
        tagline: cake.tagline,
        occasion: cake.occasion,
        price: cake.price,
        image: cake.image,
        imageAlt: cake.imageAlt,
        imageCaption: cake.imageCaption,
        finishColor: cake.finishColor,
        swatchName: cake.swatchName,
        servings: cake.servings,
        tiers: cake.tiers,
        isNew: cake.isNew,
        flavors: cake.flavors,
        description: cake.description,
        tastingNotes: cake.tastingNotes,
        dimensions: cake.dimensions,
        leadTime: cake.leadTime,
        metaTitle: cake.metaTitle,
        metaDescription: cake.metaDescription,
        canonicalUrl: cake.canonicalUrl,
        ogImage: cake.ogImage,
        rawJsonLd: cake.rawJsonLd,
      },
      create: {
        id: cake.id,
        slug: cake.slug,
        name: cake.name,
        tagline: cake.tagline,
        occasion: cake.occasion,
        price: cake.price,
        image: cake.image,
        imageAlt: cake.imageAlt,
        imageCaption: cake.imageCaption,
        finishColor: cake.finishColor,
        swatchName: cake.swatchName,
        servings: cake.servings,
        tiers: cake.tiers,
        isNew: cake.isNew,
        flavors: cake.flavors,
        description: cake.description,
        tastingNotes: cake.tastingNotes,
        dimensions: cake.dimensions,
        leadTime: cake.leadTime,
        metaTitle: cake.metaTitle,
        metaDescription: cake.metaDescription,
        canonicalUrl: cake.canonicalUrl,
        ogImage: cake.ogImage,
        rawJsonLd: cake.rawJsonLd,
      },
    });

    // Replace FAQs
    await prisma.cakeFaq.deleteMany({
      where: { cakeId: createdCake.id },
    });

    for (const faq of cake.faqs) {
      await prisma.cakeFaq.create({
        data: {
          cakeId: createdCake.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
        },
      });
    }
    console.log(`   ✓ Cake "${cake.name}" with ${cake.faqs.length} FAQs seeded.`);
  }

  // 3. Seed Page SEO & Page FAQs
  console.log("📄 Seeding Page SEO records...");
  for (const page of SEED_PAGES) {
    const createdPage = await prisma.pageSeo.upsert({
      where: { path: page.path },
      update: {
        title: page.title,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        ogImage: page.ogImage,
        rawJsonLd: page.rawJsonLd,
        noIndex: page.noIndex ?? false,
      },
      create: {
        path: page.path,
        title: page.title,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        ogImage: page.ogImage,
        rawJsonLd: page.rawJsonLd,
        noIndex: page.noIndex ?? false,
      },
    });

    await prisma.pageFaq.deleteMany({
      where: { pageSeoId: createdPage.id },
    });

    for (const faq of page.faqs) {
      await prisma.pageFaq.create({
        data: {
          pageSeoId: createdPage.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
        },
      });
    }
    console.log(`   ✓ Page "${page.path}" with ${page.faqs.length} FAQs seeded.`);
  }

  // 4. Seed Dynamic Robots Config
  console.log("🤖 Seeding Robots Config with AI crawlers...");
  await prisma.robotsConfig.upsert({
    where: { id: "default" },
    update: {
      gptBotAllowed: SEED_ROBOTS.gptBotAllowed,
      perplexityBotAllowed: SEED_ROBOTS.perplexityBotAllowed,
      claudeBotAllowed: SEED_ROBOTS.claudeBotAllowed,
      googleExtendedAllowed: SEED_ROBOTS.googleExtendedAllowed,
      ccBotAllowed: SEED_ROBOTS.ccBotAllowed,
      customRules: SEED_ROBOTS.customRules,
      sitemapUrl: SEED_ROBOTS.sitemapUrl,
    },
    create: {
      id: "default",
      gptBotAllowed: SEED_ROBOTS.gptBotAllowed,
      perplexityBotAllowed: SEED_ROBOTS.perplexityBotAllowed,
      claudeBotAllowed: SEED_ROBOTS.claudeBotAllowed,
      googleExtendedAllowed: SEED_ROBOTS.googleExtendedAllowed,
      ccBotAllowed: SEED_ROBOTS.ccBotAllowed,
      customRules: SEED_ROBOTS.customRules,
      sitemapUrl: SEED_ROBOTS.sitemapUrl,
    },
  });
  console.log("   ✓ Robots config seeded.");

  // 5. Seed Site Settings
  console.log("⚙️ Seeding Site Settings...");
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: SEED_SETTINGS.siteName,
      siteUrl: SEED_SETTINGS.siteUrl,
      siteDescription: SEED_SETTINGS.siteDescription,
      logoUrl: SEED_SETTINGS.logoUrl,
      contactEmail: SEED_SETTINGS.contactEmail,
      contactPhone: SEED_SETTINGS.contactPhone,
      currency: SEED_SETTINGS.currency,
    },
    create: {
      id: "default",
      siteName: SEED_SETTINGS.siteName,
      siteUrl: SEED_SETTINGS.siteUrl,
      siteDescription: SEED_SETTINGS.siteDescription,
      logoUrl: SEED_SETTINGS.logoUrl,
      contactEmail: SEED_SETTINGS.contactEmail,
      contactPhone: SEED_SETTINGS.contactPhone,
      currency: SEED_SETTINGS.currency,
    },
  });
  console.log("   ✓ Site settings seeded.");

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
