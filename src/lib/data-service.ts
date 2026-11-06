import { prisma } from "./prisma";
import {
  SEED_CAKES,
  SEED_PAGES,
  SEED_ROBOTS,
  SEED_SETTINGS,
  SEED_VISITS,
  SEED_ORDERS,
  SeedCake,
  SeedPageSeo,
} from "./seed-data";
import { classifyUserAgent } from "./visit-utils";

export type CakeWithFaqs = SeedCake;

export interface VisitRecord {
  id: string;
  path: string;
  userAgent: string;
  isBot: boolean;
  botName?: string;
  ip?: string;
  createdAt: string;
}

export interface DailyVisitTrend {
  date: string;
  normalVisits: number;
  botVisits: number;
  totalVisits: number;
}

export interface VisitAnalyticsSummary {
  totalVisits: number;
  normalUserVisits: number;
  botVisits: number;
  botBreakdown: Record<string, number>;
  recentVisits: VisitRecord[];
  dailyTrends?: DailyVisitTrend[];
}

export type OrderStatus = "ACTIVE" | "CANCELLED";

export interface OrderRecord {
  id: string;
  cakeId: string;
  cakeName: string;
  customerName: string;
  customerEmail: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CakeSalesMetrics {
  totalBoughtCount: number;
  totalCancelledCount: number;
  grossRevenue: number;
  cancelledRevenue: number;
  netRevenue: number;
  perCake: Array<{
    cakeId: string;
    cakeName: string;
    boughtCount: number;
    cancelledCount: number;
    netRevenue: number;
  }>;
}

export interface CreateOrderInput {
  cakeId: string;
  cakeName?: string;
  customerName: string;
  customerEmail: string;
  price?: number;
  quantity?: number;
  deliveryDate?: string;
  notes?: string;
}

// In-memory runtime fallback cache if PostgreSQL is offline or during pre-render
class FallbackStore {
  cakes: SeedCake[] = JSON.parse(JSON.stringify(SEED_CAKES));
  pages: SeedPageSeo[] = JSON.parse(JSON.stringify(SEED_PAGES));
  robots = { ...SEED_ROBOTS };
  settings = { ...SEED_SETTINGS };
  visits: VisitRecord[] = JSON.parse(JSON.stringify(SEED_VISITS));
  orders: OrderRecord[] = JSON.parse(JSON.stringify(SEED_ORDERS));
}

const globalStore = globalThis as unknown as { __auraStore?: FallbackStore };
if (!globalStore.__auraStore) {
  globalStore.__auraStore = new FallbackStore();
}
if (!globalStore.__auraStore.visits) {
  globalStore.__auraStore.visits = JSON.parse(JSON.stringify(SEED_VISITS));
}
if (!globalStore.__auraStore.orders) {
  globalStore.__auraStore.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
}
const store = globalStore.__auraStore;

let dbHealthy: boolean | null = null;
let lastCheckTime = 0;
const HEALTHY_CACHE_MS = 30_000;
const UNHEALTHY_CACHE_MS = 5_000;

export async function isDbAvailable(force = false): Promise<boolean> {
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const cacheDuration = dbHealthy ? HEALTHY_CACHE_MS : UNHEALTHY_CACHE_MS;

  if (!force && dbHealthy !== null && lastCheckTime > 0 && now - lastCheckTime < cacheDuration) {
    return dbHealthy;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }
  lastCheckTime = now;
  return dbHealthy;
}

// Helper to test if Prisma is connected to PostgreSQL
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  engine: string;
  error?: string;
}> {
  try {
    const connected = await isDbAvailable(true);
    if (connected) {
      return {
        connected: true,
        engine: "PostgreSQL via Prisma ORM",
      };
    }
    return {
      connected: false,
      engine: "Standby Store (Seeded In-Memory Fallback)",
      error: "PostgreSQL database offline or unauthenticated. Running with resilient seed store.",
    };
  } catch (err: unknown) {
    return {
      connected: false,
      engine: "Standby Store (Seeded In-Memory Fallback)",
      error: (err as Error).message,
    };
  }
}

// ----------------- CAKES -----------------
export async function getAllCakes(): Promise<CakeWithFaqs[]> {
  if (await isDbAvailable()) {
    try {
      const dbCakes = await prisma.cake.findMany({
        include: {
          faqs: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return dbCakes.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        occasion: c.occasion,
        price: c.price,
        image: c.image,
        imageAlt: c.imageAlt,
        imageCaption: c.imageCaption || "",
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
        metaTitle: c.metaTitle || c.name,
        metaDescription: c.metaDescription || c.tagline,
        canonicalUrl: c.canonicalUrl || undefined,
        ogImage: c.ogImage || undefined,
        rawJsonLd: c.rawJsonLd || undefined,
        faqs: c.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
          order: f.order,
        })),
      }));
    } catch (err) {
      console.error("Error retrieving cakes from DB:", err);
    }
  }
  return store.cakes;
}

export async function getCakeBySlug(slugOrId: string): Promise<CakeWithFaqs | null> {
  if (await isDbAvailable()) {
    try {
      const dbCake = await prisma.cake.findFirst({
        where: {
          OR: [{ slug: slugOrId }, { id: slugOrId }],
        },
        include: {
          faqs: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (dbCake) {
        return {
          id: dbCake.id,
          slug: dbCake.slug,
          name: dbCake.name,
          tagline: dbCake.tagline,
          occasion: dbCake.occasion,
          price: dbCake.price,
          image: dbCake.image,
          imageAlt: dbCake.imageAlt,
          imageCaption: dbCake.imageCaption || "",
          finishColor: dbCake.finishColor,
          swatchName: dbCake.swatchName,
          servings: dbCake.servings,
          tiers: dbCake.tiers,
          isNew: dbCake.isNew,
          flavors: dbCake.flavors,
          description: dbCake.description,
          tastingNotes: dbCake.tastingNotes,
          dimensions: dbCake.dimensions,
          leadTime: dbCake.leadTime,
          metaTitle: dbCake.metaTitle || dbCake.name,
          metaDescription: dbCake.metaDescription || dbCake.tagline,
          canonicalUrl: dbCake.canonicalUrl || undefined,
          ogImage: dbCake.ogImage || undefined,
          rawJsonLd: dbCake.rawJsonLd || undefined,
          faqs: dbCake.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
            order: f.order,
          })),
        };
      }
    } catch (err) {
      console.error("Error fetching cake from DB:", err);
    }
  }

  const fallback = store.cakes.find((c) => c.slug === slugOrId || c.id === slugOrId);
  return fallback || null;
}

export async function getCakesByOccasion(occasion: string): Promise<CakeWithFaqs[]> {
  const all = await getAllCakes();
  const normalized = occasion.toLowerCase().replace(/[\s_-]+/g, "");
  return all.filter((c) => c.occasion.toLowerCase().replace(/[\s_-]+/g, "") === normalized);
}

export async function saveCake(cakeData: Partial<CakeWithFaqs> & { name: string; slug: string }): Promise<CakeWithFaqs> {
  const fullCake: CakeWithFaqs = {
    id: cakeData.id || cakeData.slug,
    slug: cakeData.slug,
    name: cakeData.name,
    tagline: cakeData.tagline || "",
    occasion: cakeData.occasion || "Weddings",
    price: Number(cakeData.price) || 0,
    image: cakeData.image || "/images/wedding_cake.jpg",
    imageAlt: cakeData.imageAlt || `${cakeData.name} luxury architectural cake`,
    imageCaption: cakeData.imageCaption || "",
    finishColor: cakeData.finishColor || "#f0e4d3",
    swatchName: cakeData.swatchName || "Signature",
    servings: cakeData.servings || "20-25 guests",
    tiers: Number(cakeData.tiers) || 1,
    isNew: Boolean(cakeData.isNew),
    flavors: cakeData.flavors || ["Vanilla"],
    description: cakeData.description || "",
    tastingNotes: cakeData.tastingNotes || [],
    dimensions: cakeData.dimensions || "8\" diameter",
    leadTime: cakeData.leadTime || "48 hours",
    metaTitle: cakeData.metaTitle || cakeData.name,
    metaDescription: cakeData.metaDescription || cakeData.tagline || cakeData.description?.slice(0, 150) || "",
    canonicalUrl: cakeData.canonicalUrl || undefined,
    ogImage: cakeData.ogImage || cakeData.image,
    rawJsonLd: cakeData.rawJsonLd || undefined,
    faqs: cakeData.faqs || [],
  };

  if (await isDbAvailable()) {
    try {
      let existing = null;
      if (cakeData.id) {
        existing = await prisma.cake.findUnique({
          where: { id: cakeData.id },
        });
      }
      if (!existing) {
        existing = await prisma.cake.findUnique({
          where: { slug: fullCake.slug },
        });
      }

      let savedId = fullCake.id;

      if (existing) {
        savedId = existing.id;
        await prisma.cake.update({
          where: { id: existing.id },
          data: {
            slug: fullCake.slug,
            name: fullCake.name,
            tagline: fullCake.tagline,
            occasion: fullCake.occasion,
            price: fullCake.price,
            image: fullCake.image,
            imageAlt: fullCake.imageAlt,
            imageCaption: fullCake.imageCaption,
            finishColor: fullCake.finishColor,
            swatchName: fullCake.swatchName,
            servings: fullCake.servings,
            tiers: fullCake.tiers,
            isNew: fullCake.isNew,
            flavors: fullCake.flavors,
            description: fullCake.description,
            tastingNotes: fullCake.tastingNotes,
            dimensions: fullCake.dimensions,
            leadTime: fullCake.leadTime,
            metaTitle: fullCake.metaTitle,
            metaDescription: fullCake.metaDescription,
            canonicalUrl: fullCake.canonicalUrl,
            ogImage: fullCake.ogImage,
            rawJsonLd: fullCake.rawJsonLd,
          },
        });
      } else {
        const created = await prisma.cake.create({
          data: {
            id: fullCake.id,
            slug: fullCake.slug,
            name: fullCake.name,
            tagline: fullCake.tagline,
            occasion: fullCake.occasion,
            price: fullCake.price,
            image: fullCake.image,
            imageAlt: fullCake.imageAlt,
            imageCaption: fullCake.imageCaption,
            finishColor: fullCake.finishColor,
            swatchName: fullCake.swatchName,
            servings: fullCake.servings,
            tiers: fullCake.tiers,
            isNew: fullCake.isNew,
            flavors: fullCake.flavors,
            description: fullCake.description,
            tastingNotes: fullCake.tastingNotes,
            dimensions: fullCake.dimensions,
            leadTime: fullCake.leadTime,
            metaTitle: fullCake.metaTitle,
            metaDescription: fullCake.metaDescription,
            canonicalUrl: fullCake.canonicalUrl,
            ogImage: fullCake.ogImage,
            rawJsonLd: fullCake.rawJsonLd,
          },
        });
        savedId = created.id;
      }

      fullCake.id = savedId;

      if (fullCake.faqs) {
        await prisma.cakeFaq.deleteMany({ where: { cakeId: savedId } });
        for (const faq of fullCake.faqs) {
          await prisma.cakeFaq.create({
            data: {
              cakeId: savedId,
              question: faq.question,
              answer: faq.answer,
              order: faq.order,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error saving cake to DB:", err);
    }
  }

  // Update fallback store as well
  const idx = store.cakes.findIndex(
    (c) => c.slug === fullCake.slug || c.id === fullCake.id || (cakeData.id && c.id === cakeData.id)
  );
  if (idx >= 0) {
    store.cakes[idx] = fullCake;
  } else {
    store.cakes.unshift(fullCake);
  }

  return fullCake;
}

export async function deleteCake(idOrSlug: string): Promise<boolean> {
  if (await isDbAvailable()) {
    try {
      await prisma.cake.deleteMany({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });
    } catch (err) {
      console.error("Error deleting cake from DB:", err);
    }
  }

  store.cakes = store.cakes.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug);
  return true;
}

// ----------------- PAGE SEO -----------------
export async function getPageSeo(path: string): Promise<SeedPageSeo | null> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (await isDbAvailable()) {
    try {
      const page = await prisma.pageSeo.findUnique({
        where: { path: normalizedPath },
        include: {
          faqs: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (page) {
        return {
          path: page.path,
          title: page.title,
          metaDescription: page.metaDescription,
          canonicalUrl: page.canonicalUrl || undefined,
          ogImage: page.ogImage || undefined,
          rawJsonLd: page.rawJsonLd || undefined,
          noIndex: page.noIndex,
          faqs: page.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
            order: f.order,
          })),
        };
      }
    } catch (err) {
      console.error("Error fetching page SEO from DB:", err);
    }
  }

  return store.pages.find((p) => p.path === normalizedPath) || null;
}

export async function getAllPagesSeo(): Promise<SeedPageSeo[]> {
  if (await isDbAvailable()) {
    try {
      const dbPages = await prisma.pageSeo.findMany({
        include: {
          faqs: {
            orderBy: { order: "asc" },
          },
        },
      });
      return dbPages.map((page) => ({
        path: page.path,
        title: page.title,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl || undefined,
        ogImage: page.ogImage || undefined,
        rawJsonLd: page.rawJsonLd || undefined,
        noIndex: page.noIndex,
        faqs: page.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
          order: f.order,
        })),
      }));
    } catch (err) {
      console.error("Error getting all pages SEO from DB:", err);
    }
  }
  return store.pages;
}

export async function savePageSeo(pageData: SeedPageSeo): Promise<SeedPageSeo> {
  const normalizedPath = pageData.path.startsWith("/") ? pageData.path : `/${pageData.path}`;
  const dataToSave: SeedPageSeo = {
    ...pageData,
    path: normalizedPath,
    faqs: pageData.faqs || [],
  };

  if (await isDbAvailable()) {
    try {
      const saved = await prisma.pageSeo.upsert({
        where: { path: normalizedPath },
        update: {
          title: dataToSave.title,
          metaDescription: dataToSave.metaDescription,
          canonicalUrl: dataToSave.canonicalUrl,
          ogImage: dataToSave.ogImage,
          rawJsonLd: dataToSave.rawJsonLd,
          noIndex: dataToSave.noIndex ?? false,
        },
        create: {
          path: normalizedPath,
          title: dataToSave.title,
          metaDescription: dataToSave.metaDescription,
          canonicalUrl: dataToSave.canonicalUrl,
          ogImage: dataToSave.ogImage,
          rawJsonLd: dataToSave.rawJsonLd,
          noIndex: dataToSave.noIndex ?? false,
        },
      });

      if (dataToSave.faqs) {
        await prisma.pageFaq.deleteMany({ where: { pageSeoId: saved.id } });
        for (const faq of dataToSave.faqs) {
          await prisma.pageFaq.create({
            data: {
              pageSeoId: saved.id,
              question: faq.question,
              answer: faq.answer,
              order: faq.order,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error saving page SEO to DB:", err);
    }
  }

  const idx = store.pages.findIndex((p) => p.path === normalizedPath);
  if (idx >= 0) {
    store.pages[idx] = dataToSave;
  } else {
    store.pages.push(dataToSave);
  }

  return dataToSave;
}

// ----------------- ROBOTS CONFIG -----------------
export async function getRobotsConfig() {
  if (await isDbAvailable()) {
    try {
      const config = await prisma.robotsConfig.findUnique({
        where: { id: "default" },
      });
      if (config) {
        return {
          gptBotAllowed: config.gptBotAllowed,
          perplexityBotAllowed: config.perplexityBotAllowed,
          claudeBotAllowed: config.claudeBotAllowed,
          googleExtendedAllowed: config.googleExtendedAllowed,
          ccBotAllowed: config.ccBotAllowed,
          customRules: config.customRules || "",
          sitemapUrl: config.sitemapUrl || "/sitemap.xml",
        };
      }
    } catch (err) {
      console.error("Error fetching robots config from DB:", err);
    }
  }
  return store.robots;
}

export async function saveRobotsConfig(config: typeof SEED_ROBOTS) {
  if (await isDbAvailable()) {
    try {
      await prisma.robotsConfig.upsert({
        where: { id: "default" },
        update: config,
        create: { id: "default", ...config },
      });
    } catch (err) {
      console.error("Error saving robots config to DB:", err);
    }
  }
  store.robots = { ...config };
  return store.robots;
}

// ----------------- SITE SETTINGS -----------------
export async function getSiteSettings() {
  if (await isDbAvailable()) {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
      });
      if (settings) {
        return {
          siteName: settings.siteName,
          siteUrl: settings.siteUrl,
          siteDescription: settings.siteDescription,
          logoUrl: settings.logoUrl,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          currency: settings.currency,
        };
      }
    } catch (err) {
      console.error("Error fetching site settings from DB:", err);
    }
  }
  return store.settings;
}

export async function saveSiteSettings(settings: typeof SEED_SETTINGS) {
  if (await isDbAvailable()) {
    try {
      await prisma.siteSettings.upsert({
        where: { id: "default" },
        update: settings,
        create: { id: "default", ...settings },
      });
    } catch (err) {
      console.error("Error saving site settings to DB:", err);
    }
  }
  store.settings = { ...settings };
  return store.settings;
}

// ----------------- VISIT ANALYTICS -----------------

export function resetVisitsStore(): void {
  store.visits = JSON.parse(JSON.stringify(SEED_VISITS));
}

export async function recordVisit(data: {
  path: string;
  userAgent: string;
  ip?: string;
  isBot?: boolean;
  botName?: string;
}): Promise<VisitRecord> {
  const path = data.path || "/";
  const userAgent = data.userAgent || "";

  let isBot = data.isBot;
  let botName = data.botName;

  if (isBot === undefined) {
    try {
      const classification = classifyUserAgent(userAgent);
      isBot = classification.isBot;
      botName = classification.botName;
    } catch {
      isBot = false;
      botName = undefined;
    }
  }

  const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();

  const record: VisitRecord = {
    id,
    path,
    userAgent,
    isBot: Boolean(isBot),
    botName: botName || undefined,
    ip: data.ip || undefined,
    createdAt,
  };

  if (await isDbAvailable()) {
    try {
      const dbVisit = await prisma.visit.create({
        data: {
          path: record.path,
          userAgent: record.userAgent,
          isBot: record.isBot,
          botName: record.botName || null,
          ip: record.ip || null,
          createdAt: new Date(record.createdAt),
        },
      });

      store.visits.unshift(record);

      return {
        id: dbVisit.id,
        path: dbVisit.path,
        userAgent: dbVisit.userAgent,
        isBot: dbVisit.isBot,
        botName: dbVisit.botName || undefined,
        ip: dbVisit.ip || undefined,
        createdAt:
          dbVisit.createdAt instanceof Date
            ? dbVisit.createdAt.toISOString()
            : String(dbVisit.createdAt),
      };
    } catch (err) {
      console.error("Error persisting visit to PostgreSQL:", err);
    }
  }

  // Standby Store Fallback
  store.visits.unshift(record);
  return record;
}

export async function getVisitAnalytics(): Promise<VisitAnalyticsSummary> {
  if (await isDbAvailable()) {
    try {
      const countsPromise = prisma.visit.groupBy({
        by: ["isBot", "botName"],
        _count: { _all: true },
      });
      const recentPromise = prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      const trendsPromise = prisma.$queryRaw<DailyVisitTrend[]>`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
          COUNT(*) FILTER (WHERE "isBot" = false)::int AS "normalVisits",
          COUNT(*) FILTER (WHERE "isBot" = true)::int AS "botVisits",
          COUNT(*)::int AS "totalVisits"
        FROM "Visit"
        GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
        ORDER BY date ASC
      `;

      const [countsByBot, recentDb, dailyTrends] = await prisma.$transaction([
        countsPromise,
        recentPromise,
        trendsPromise,
      ]);

      let botVisits = 0;
      let normalUserVisits = 0;
      const botBreakdown: Record<string, number> = {};

      for (const b of countsByBot) {
        if (b.isBot) {
          const name = b.botName || "Unknown Bot";
          botBreakdown[name] = (botBreakdown[name] || 0) + b._count._all;
          botVisits += b._count._all;
        } else {
          normalUserVisits += b._count._all;
        }
      }

      const totalVisits = normalUserVisits + botVisits;

      const recentVisits: VisitRecord[] = recentDb.map((v) => ({
        id: v.id,
        path: v.path,
        userAgent: v.userAgent,
        isBot: v.isBot,
        botName: v.botName || undefined,
        ip: v.ip || undefined,
        createdAt:
          v.createdAt instanceof Date
            ? v.createdAt.toISOString()
            : String(v.createdAt),
      }));

      return {
        totalVisits,
        normalUserVisits,
        botVisits,
        botBreakdown,
        recentVisits,
        dailyTrends,
      };
    } catch (err) {
      console.error("Error computing visit analytics from DB:", err);
    }
  }

  // Standby In-Memory Fallback
  const visits = store.visits || [];
  const totalVisits = visits.length;
  let botVisits = 0;
  let normalUserVisits = 0;
  const botBreakdown: Record<string, number> = {};
  const trendsMap: Record<string, DailyVisitTrend> = {};

  for (const v of visits) {
    if (v.isBot) {
      botVisits++;
      const name = v.botName || "Unknown Bot";
      botBreakdown[name] = (botBreakdown[name] || 0) + 1;
    } else {
      normalUserVisits++;
    }

    const date = v.createdAt.slice(0, 10);
    if (!trendsMap[date]) {
      trendsMap[date] = { date, normalVisits: 0, botVisits: 0, totalVisits: 0 };
    }
    trendsMap[date].totalVisits++;
    if (v.isBot) {
      trendsMap[date].botVisits++;
    } else {
      trendsMap[date].normalVisits++;
    }
  }

  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const dailyTrends = Object.values(trendsMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    totalVisits,
    normalUserVisits,
    botVisits,
    botBreakdown,
    recentVisits: sortedVisits.slice(0, 50),
    dailyTrends,
  };
}

// ----------------- ORDERS & SALES METRICS -----------------

export function resetOrdersStore(): void {
  store.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
}

function formatDbOrder(dbOrder: {
  id: string;
  cakeId: string;
  cakeName: string;
  customerName: string;
  customerEmail: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  deliveryDate?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): OrderRecord {
  return {
    id: dbOrder.id,
    cakeId: dbOrder.cakeId,
    cakeName: dbOrder.cakeName,
    customerName: dbOrder.customerName,
    customerEmail: dbOrder.customerEmail,
    price: Number(dbOrder.price),
    quantity: Number(dbOrder.quantity),
    status: dbOrder.status as OrderStatus,
    deliveryDate: dbOrder.deliveryDate ? String(dbOrder.deliveryDate) : undefined,
    notes: dbOrder.notes || undefined,
    createdAt:
      dbOrder.createdAt instanceof Date
        ? dbOrder.createdAt.toISOString()
        : String(dbOrder.createdAt),
    updatedAt:
      dbOrder.updatedAt instanceof Date
        ? dbOrder.updatedAt.toISOString()
        : String(dbOrder.updatedAt),
  };
}

let seedingOrdersPromise: Promise<void> | null = null;
async function ensureSeedOrders(): Promise<void> {
  if (seedingOrdersPromise) return seedingOrdersPromise;
  seedingOrdersPromise = (async () => {
    if (await isDbAvailable()) {
      try {
        const count = await prisma.order.count();
        if (count === 0) {
          await prisma.order.createMany({
            data: SEED_ORDERS.map((o) => ({
              id: o.id,
              cakeId: o.cakeId,
              cakeName: o.cakeName,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              price: o.price,
              quantity: o.quantity,
              status: o.status,
              deliveryDate: o.deliveryDate || null,
              notes: o.notes || null,
              createdAt: new Date(o.createdAt),
              updatedAt: new Date(o.updatedAt),
            })),
          });
        }
      } catch (err) {
        console.error("Error ensuring seed orders in DB:", err);
      }
    }
  })();
  return seedingOrdersPromise;
}

export async function createOrder(data: CreateOrderInput): Promise<OrderRecord> {
  if (!data.cakeId || typeof data.cakeId !== "string" || !data.cakeId.trim()) {
    throw new Error("Missing required field: cakeId");
  }
  if (!data.customerName || typeof data.customerName !== "string" || !data.customerName.trim()) {
    throw new Error("Missing required field: customerName");
  }
  if (
    !data.customerEmail ||
    typeof data.customerEmail !== "string" ||
    !data.customerEmail.includes("@")
  ) {
    throw new Error("Valid customerEmail is required");
  }

  let cakeName = data.cakeName?.trim();
  let price = data.price !== undefined ? Number(data.price) : undefined;

  if (!cakeName || price === undefined) {
    const cake = await getCakeBySlug(data.cakeId);
    if (cake) {
      if (!cakeName) cakeName = cake.name;
      if (price === undefined) price = cake.price;
    } else {
      if (!cakeName) cakeName = data.cakeId;
      if (price === undefined) price = 0;
    }
  }

  const quantity =
    data.quantity !== undefined && data.quantity !== null && Number(data.quantity) > 0
      ? Number(data.quantity)
      : 1;

  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const record: OrderRecord = {
    id,
    cakeId: data.cakeId,
    cakeName,
    customerName: data.customerName.trim(),
    customerEmail: data.customerEmail.trim(),
    price,
    quantity,
    status: "ACTIVE",
    deliveryDate: data.deliveryDate ? String(data.deliveryDate).trim() : undefined,
    notes: data.notes ? String(data.notes).trim() : undefined,
    createdAt: now,
    updatedAt: now,
  };

  store.orders.unshift({ ...record });

  await ensureSeedOrders();
  if (await isDbAvailable()) {
    try {
      const dbOrder = await prisma.order.create({
        data: {
          id: record.id,
          cakeId: record.cakeId,
          cakeName: record.cakeName,
          customerName: record.customerName,
          customerEmail: record.customerEmail,
          price: record.price,
          quantity: record.quantity,
          status: record.status,
          deliveryDate: record.deliveryDate || null,
          notes: record.notes || null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        },
      });

      return formatDbOrder(dbOrder);
    } catch (err) {
      console.error("Error creating order in DB:", err);
    }
  }

  return { ...record };
}

export async function cancelOrder(orderId: string): Promise<OrderRecord> {
  if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
    throw new Error("Missing orderId for cancellation");
  }

  const cleanId = orderId.trim();
  await ensureSeedOrders();

  if (await isDbAvailable()) {
    try {
      const existing = await prisma.order.findUnique({
        where: { id: cleanId },
      });
      if (!existing) {
        throw new Error(`Order with ID ${cleanId} not found`);
      }

      let updated = existing;
      if (existing.status !== "CANCELLED") {
        updated = await prisma.order.update({
          where: { id: cleanId },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });
      }

      const inMemory = store.orders.find((o) => o.id === cleanId);
      if (inMemory) {
        inMemory.status = "CANCELLED";
        inMemory.updatedAt =
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : String(updated.updatedAt);
      }

      return formatDbOrder(updated);
    } catch (err) {
      if (err instanceof Error && err.message.includes("not found")) {
        throw err;
      }
      console.error("Error cancelling order in DB:", err);
    }
  }

  // Fallback Store
  const order = store.orders.find((o) => o.id === cleanId);
  if (!order) {
    throw new Error(`Order with ID ${cleanId} not found`);
  }

  if (order.status !== "CANCELLED") {
    order.status = "CANCELLED";
    order.updatedAt = new Date().toISOString();
  }
  return { ...order };
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  await ensureSeedOrders();
  if (await isDbAvailable()) {
    try {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });
      return dbOrders.map(formatDbOrder);
    } catch (err) {
      console.error("Error retrieving orders from DB:", err);
    }
  }

  const sorted = [...(store.orders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.map((o) => ({ ...o }));
}

export function computeSalesMetrics(
  orders: OrderRecord[],
  catalogCakes: Array<{ id: string; name: string }>
): CakeSalesMetrics {
  let totalBoughtCount = 0;
  let totalCancelledCount = 0;
  let grossRevenue = 0;
  let cancelledRevenue = 0;

  // Pre-seed perCake map with all catalog cakes
  const cakeMap = new Map<
    string,
    {
      cakeId: string;
      cakeName: string;
      boughtCount: number;
      cancelledCount: number;
      netRevenue: number;
    }
  >();

  for (const cake of catalogCakes) {
    cakeMap.set(cake.id, {
      cakeId: cake.id,
      cakeName: cake.name,
      boughtCount: 0,
      cancelledCount: 0,
      netRevenue: 0,
    });
  }

  for (const order of orders) {
    const qty = Number(order.quantity) || 1;
    const price = Number(order.price) || 0;
    const orderTotal = price * qty;

    totalBoughtCount += qty;
    grossRevenue += orderTotal;

    let entry = cakeMap.get(order.cakeId);
    if (!entry) {
      entry = {
        cakeId: order.cakeId,
        cakeName: order.cakeName || order.cakeId,
        boughtCount: 0,
        cancelledCount: 0,
        netRevenue: 0,
      };
      cakeMap.set(order.cakeId, entry);
    }

    entry.boughtCount += qty;

    if (order.status === "CANCELLED") {
      totalCancelledCount += qty;
      cancelledRevenue += orderTotal;
      entry.cancelledCount += qty;
    } else if (order.status === "ACTIVE") {
      entry.netRevenue += orderTotal;
    }
  }

  const netRevenue = grossRevenue - cancelledRevenue;

  return {
    totalBoughtCount,
    totalCancelledCount,
    grossRevenue,
    cancelledRevenue,
    netRevenue,
    perCake: Array.from(cakeMap.values()),
  };
}

export async function getCakeSalesMetrics(): Promise<CakeSalesMetrics> {
  const catalogCakes = await getAllCakes();
  await ensureSeedOrders();

  if (await isDbAvailable()) {
    try {
      const dbOrders = await prisma.order.findMany();
      return computeSalesMetrics(dbOrders.map(formatDbOrder), catalogCakes);
    } catch (err) {
      console.error("Error computing sales metrics from DB:", err);
    }
  }

  return computeSalesMetrics(store.orders || [], catalogCakes);
}

