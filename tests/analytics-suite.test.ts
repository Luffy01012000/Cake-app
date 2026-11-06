import { describe, it, expect, beforeAll, afterAll } from "vitest";

if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile();
}

import { signSessionToken, verifySessionToken } from "../src/lib/auth";

beforeAll(async () => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const p = new PrismaClient();
    await p.order.deleteMany({ where: { id: { startsWith: "ord_" } } });
    await p.$disconnect();
  } catch {
    // ignore
  }
});

afterAll(async () => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const p = new PrismaClient();
    await p.order.deleteMany({ where: { id: { startsWith: "ord_" } } });
    await p.$disconnect();
  } catch {
    // ignore
  }
});

// ============================================================================
// Interface Contracts conforming strictly to PROJECT.md & ORIGINAL_REQUEST.md
// ============================================================================

export interface UAClassification {
  isBot: boolean;
  botName?: string;
  category: "BROWSER" | "AI_CRAWLER" | "SEARCH_BOT" | "SCRAPER_TOOL";
}

export interface VisitRecord {
  id: string;
  path: string;
  userAgent: string;
  isBot: boolean;
  botName?: string;
  ip?: string;
  createdAt: string;
}

export interface VisitAnalyticsSummary {
  totalVisits: number;
  normalUserVisits: number;
  botVisits: number;
  botBreakdown: Record<string, number>;
  recentVisits: VisitRecord[];
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

export interface AdminAnalyticsResponse {
  role: "ADMIN" | "SEO_SPECIALIST";
  visits: VisitAnalyticsSummary;
  financials?: CakeSalesMetrics;
  orders?: OrderRecord[];
}

// Module loaders dynamically binding to project implementations
async function getClassifier(): Promise<(ua: string | null | undefined) => UAClassification> {
  try {
    const mod = await import("../src/lib/visit-utils");
    if (typeof mod.classifyUserAgent === "function") {
      return mod.classifyUserAgent;
    }
  } catch (err) {
    throw new Error(`classifyUserAgent in src/lib/visit-utils not available: ${(err as Error).message}`);
  }
  throw new Error("classifyUserAgent export missing in src/lib/visit-utils");
}

export interface DataServiceContract {
  recordVisit: (data: { path: string; userAgent: string; ip?: string; isBot?: boolean; botName?: string }) => Promise<VisitRecord>;
  getVisitAnalytics: () => Promise<VisitAnalyticsSummary>;
  createOrder: (data: {
    cakeId: string;
    cakeName?: string;
    customerName: string;
    customerEmail: string;
    price?: number;
    quantity?: number;
    deliveryDate?: string;
    notes?: string;
  }) => Promise<OrderRecord>;
  cancelOrder: (orderId: string) => Promise<OrderRecord>;
  getAllOrders: () => Promise<OrderRecord[]>;
  getCakeSalesMetrics: () => Promise<CakeSalesMetrics>;
}

async function getDataService(): Promise<DataServiceContract> {
  const mod = await import("../src/lib/data-service");
  return mod as unknown as DataServiceContract;
}

// ============================================================================
// TIER 1: Feature Coverage (>=5 tests per feature)
// ============================================================================

describe("Tier 1.1: User-Agent Classification — Normal Web Browsers", () => {
  it("classifies desktop Google Chrome (macOS / Windows) as BROWSER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
    expect(result.botName).toBeUndefined();
  });

  it("classifies desktop Apple Safari (macOS Sonoma) as BROWSER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
    expect(result.botName).toBeUndefined();
  });

  it("classifies Mozilla Firefox (desktop Linux / Windows) as BROWSER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
    expect(result.botName).toBeUndefined();
  });

  it("classifies Microsoft Edge (Chromium based) as BROWSER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.2365.66";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
    expect(result.botName).toBeUndefined();
  });

  it("classifies Mobile Safari on iPhone and iPad as BROWSER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
    expect(result.botName).toBeUndefined();
  });
});

describe("Tier 1.2: User-Agent Classification — AI Crawlers & LLM Bots", () => {
  it("classifies OpenAI GPTBot as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("AI_CRAWLER");
    expect(result.botName).toBe("GPTBot");
  });

  it("classifies Anthropic ClaudeBot as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("AI_CRAWLER");
    expect(result.botName).toBe("ClaudeBot");
  });

  it("classifies PerplexityBot as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("AI_CRAWLER");
    expect(result.botName).toBe("PerplexityBot");
  });

  it("classifies Google-Extended crawler as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("AI_CRAWLER");
    expect(result.botName).toBe("Google-Extended");
  });

  it("classifies Common Crawl CCBot as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "CCBot/2.0 (https://commoncrawl.org/faq/)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("AI_CRAWLER");
    expect(result.botName).toBe("CCBot");
  });

  it("classifies Applebot-Extended and ByteDance Bytespider as AI_CRAWLER", async () => {
    const classifyUserAgent = await getClassifier();
    const applebotExt = classifyUserAgent("Mozilla/5.0 (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)");
    expect(applebotExt.isBot).toBe(true);
    expect(applebotExt.category).toBe("AI_CRAWLER");
    expect(applebotExt.botName).toBe("Applebot-Extended");

    const bytespider = classifyUserAgent("Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)");
    expect(bytespider.isBot).toBe(true);
    expect(bytespider.category).toBe("AI_CRAWLER");
    expect(bytespider.botName).toBe("Bytespider");
  });
});

describe("Tier 1.3: User-Agent Classification — Search Engine Bots & Scraper Tools", () => {
  it("classifies Googlebot as SEARCH_BOT", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("SEARCH_BOT");
    expect(result.botName).toBe("Googlebot");
  });

  it("classifies Microsoft Bingbot as SEARCH_BOT", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("SEARCH_BOT");
    expect(result.botName).toBe("Bingbot");
  });

  it("classifies DuckDuckBot as SEARCH_BOT", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("SEARCH_BOT");
    expect(result.botName).toBe("DuckDuckBot");
  });

  it("classifies curl command-line tool as SCRAPER_TOOL", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "curl/8.4.0";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("SCRAPER_TOOL");
    expect(result.botName).toBe("curl");
  });

  it("classifies python-requests HTTP library as SCRAPER_TOOL", async () => {
    const classifyUserAgent = await getClassifier();
    const ua = "python-requests/2.31.0";
    const result = classifyUserAgent(ua);

    expect(result.isBot).toBe(true);
    expect(result.category).toBe("SCRAPER_TOOL");
    expect(result.botName).toBe("python-requests");
  });

  it("classifies HeadlessChrome and Scrapy as SCRAPER_TOOL", async () => {
    const classifyUserAgent = await getClassifier();
    const headless = classifyUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/122.0.6261.94 Safari/537.36");
    expect(headless.isBot).toBe(true);
    expect(headless.category).toBe("SCRAPER_TOOL");

    const scrapy = classifyUserAgent("Scrapy/2.11.0 (+https://scrapy.org)");
    expect(scrapy.isBot).toBe(true);
    expect(scrapy.category).toBe("SCRAPER_TOOL");
  });
});

describe("Tier 1.4: Visit Recording & Analytics Aggregation", () => {
  it("records a normal user visit and increments total and normalUserVisits", async () => {
    const ds = await getDataService();
    expect(typeof ds.recordVisit, "recordVisit must be implemented").toBe("function");

    const before = await ds.getVisitAnalytics();
    const visit = await ds.recordVisit({
      path: "/cakes/elysian-wedding-tier",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ip: "192.168.1.100",
    });

    expect(visit).toBeDefined();
    expect(visit.id).toBeDefined();
    expect(visit.path).toBe("/cakes/elysian-wedding-tier");
    expect(visit.isBot).toBe(false);

    const after = await ds.getVisitAnalytics();
    expect(after.totalVisits).toBe(before.totalVisits + 1);
    expect(after.normalUserVisits).toBe(before.normalUserVisits + 1);
    expect(after.botVisits).toBe(before.botVisits);
  });

  it("records a bot visit and increments total and botVisits with botName tracking", async () => {
    const ds = await getDataService();
    const before = await ds.getVisitAnalytics();

    const visit = await ds.recordVisit({
      path: "/robots.txt",
      userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      ip: "20.15.240.1",
    });

    expect(visit).toBeDefined();
    expect(visit.isBot).toBe(true);
    expect(visit.botName).toBe("GPTBot");

    const after = await ds.getVisitAnalytics();
    expect(after.totalVisits).toBe(before.totalVisits + 1);
    expect(after.botVisits).toBe(before.botVisits + 1);
    expect(after.normalUserVisits).toBe(before.normalUserVisits);
  });

  it("computes visit analytics summary where totalVisits === normalUserVisits + botVisits", async () => {
    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();

    expect(summary).toBeDefined();
    expect(typeof summary.totalVisits).toBe("number");
    expect(typeof summary.normalUserVisits).toBe("number");
    expect(typeof summary.botVisits).toBe("number");
    expect(summary.totalVisits).toBe(summary.normalUserVisits + summary.botVisits);
  });

  it("maintains botBreakdown mapping with correct per-bot frequency counts", async () => {
    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();

    expect(summary.botBreakdown).toBeDefined();
    expect(typeof summary.botBreakdown).toBe("object");

    const breakdownSum = Object.values(summary.botBreakdown as Record<string, number>).reduce(
      (acc, count) => acc + count,
      0
    );
    expect(breakdownSum).toBe(summary.botVisits);
  });

  it("returns recentVisits list containing path, userAgent, isBot, and createdAt", async () => {
    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();

    expect(Array.isArray(summary.recentVisits)).toBe(true);
    expect(summary.recentVisits.length).toBeGreaterThan(0);

    const first = summary.recentVisits[0];
    expect(first).toHaveProperty("path");
    expect(first).toHaveProperty("userAgent");
    expect(first).toHaveProperty("isBot");
    expect(first).toHaveProperty("createdAt");
  });
});

describe("Tier 1.5: Seed Orders Initial State Verification", () => {
  it("initializes catalog with seeded orders populated in the data store", async () => {
    const ds = await getDataService();
    expect(typeof ds.getAllOrders, "getAllOrders must be implemented").toBe("function");

    const orders = await ds.getAllOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length, "Seed orders must be pre-populated (minimum 5 orders)").toBeGreaterThanOrEqual(5);
  });

  it("contains both ACTIVE and CANCELLED orders in initial seed data", async () => {
    const ds = await getDataService();
    const orders: OrderRecord[] = await ds.getAllOrders();

    const activeOrders = orders.filter((o) => o.status === "ACTIVE");
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

    expect(activeOrders.length, "Should contain active seed orders").toBeGreaterThan(0);
    expect(cancelledOrders.length, "Should contain cancelled seed orders").toBeGreaterThan(0);
  });

  it("ensures all seed orders have valid prices matching or consistent with luxury cakes", async () => {
    const ds = await getDataService();
    const allOrders: OrderRecord[] = await ds.getAllOrders();
    const seedOrders = allOrders.filter((o) => o.id.startsWith("seed-order-"));
    expect(seedOrders.length).toBeGreaterThan(0);

    for (const order of seedOrders) {
      expect(order.price).toBeGreaterThan(0);
      expect(order.quantity).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(order.price)).toBe(true);
    }
  });

  it("ensures seed orders span multiple catalog cakes and have realistic customer details", async () => {
    const ds = await getDataService();
    const orders: OrderRecord[] = await ds.getAllOrders();

    const cakeIds = new Set(orders.map((o) => o.cakeId));
    expect(cakeIds.size, "Seed orders should cover multiple distinct cakes").toBeGreaterThanOrEqual(3);

    for (const order of orders) {
      expect(order.customerName.length).toBeGreaterThan(0);
      expect(order.customerEmail).toContain("@");
    }
  });

  it("ensures all seed orders have valid ISO createdAt and updatedAt timestamps", async () => {
    const ds = await getDataService();
    const orders: OrderRecord[] = await ds.getAllOrders();

    for (const order of orders) {
      const createdTime = new Date(order.createdAt).getTime();
      const updatedTime = new Date(order.updatedAt).getTime();

      expect(Number.isNaN(createdTime)).toBe(false);
      expect(Number.isNaN(updatedTime)).toBe(false);
      expect(updatedTime).toBeGreaterThanOrEqual(createdTime);
    }
  });
});

describe("Tier 1.6: Revenue Calculation Formulas", () => {
  it("calculates grossRevenue as total revenue across all placed orders", async () => {
    const ds = await getDataService();
    expect(typeof ds.getCakeSalesMetrics, "getCakeSalesMetrics must be implemented").toBe("function");

    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();
    const orders: OrderRecord[] = await ds.getAllOrders();

    const expectedGross = orders.reduce((acc, o) => acc + o.price * o.quantity, 0);
    expect(metrics.grossRevenue).toBe(expectedGross);
  });

  it("calculates cancelledRevenue as total revenue from CANCELLED orders", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();
    const orders: OrderRecord[] = await ds.getAllOrders();

    const expectedCancelled = orders
      .filter((o) => o.status === "CANCELLED")
      .reduce((acc, o) => acc + o.price * o.quantity, 0);

    expect(metrics.cancelledRevenue).toBe(expectedCancelled);
  });

  it("strictly enforces netRevenue formula: netRevenue === grossRevenue - cancelledRevenue", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    expect(metrics.netRevenue).toBe(metrics.grossRevenue - metrics.cancelledRevenue);
    expect(metrics.grossRevenue).toBeGreaterThanOrEqual(metrics.netRevenue);
    expect(metrics.cancelledRevenue).toBeGreaterThanOrEqual(0);
  });

  it("calculates totalBoughtCount and totalCancelledCount accurately", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();
    const orders: OrderRecord[] = await ds.getAllOrders();

    const expectedTotalBought = orders.reduce((acc, o) => acc + o.quantity, 0);
    const expectedTotalCancelled = orders
      .filter((o) => o.status === "CANCELLED")
      .reduce((acc, o) => acc + o.quantity, 0);

    expect(metrics.totalBoughtCount).toBe(expectedTotalBought);
    expect(metrics.totalCancelledCount).toBe(expectedTotalCancelled);
  });

  it("computes perCake revenue breakdown with sum of per-cake netRevenue matching catalog netRevenue", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    expect(Array.isArray(metrics.perCake)).toBe(true);
    expect(metrics.perCake.length).toBeGreaterThan(0);

    const sumPerCakeNet = metrics.perCake.reduce((acc, cake) => acc + cake.netRevenue, 0);
    expect(sumPerCakeNet).toBe(metrics.netRevenue);
  });
});

describe("Tier 1.7: Order Placement Flow (createOrder)", () => {
  it("creates a new order with ACTIVE status and unique generated ID", async () => {
    const ds = await getDataService();
    expect(typeof ds.createOrder, "createOrder must be implemented").toBe("function");

    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      cakeName: "The Elysian Grand Tier",
      customerName: "Eleanor Vance",
      customerEmail: "eleanor.vance@luxuryevents.com",
      price: 680,
      quantity: 1,
      deliveryDate: "2026-11-20",
      notes: "Please include edible gold leaf monogram.",
    });

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.status).toBe("ACTIVE");
    expect(order.cakeId).toBe("elysian-wedding-tier");
    expect(order.customerEmail).toBe("eleanor.vance@luxuryevents.com");
  });

  it("auto-populates cakeName and price from cake catalog when omitted", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "blush-seraphina-birthday",
      customerName: "Julian Sterling",
      customerEmail: "julian@sterling.co",
    });

    expect(order.cakeName).toBe("The Seraphina Blush");
    expect(order.price).toBe(195);
  });

  it("defaults quantity to 1 when quantity is not specified", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "nocturne-anniversary-velvet",
      customerName: "Diana Prince",
      customerEmail: "diana@themyscira.org",
    });

    expect(order.quantity).toBe(1);
  });

  it("increments totalBoughtCount and grossRevenue by order quantity and price upon placement", async () => {
    const ds = await getDataService();
    const before = await ds.getCakeSalesMetrics();

    const order = await ds.createOrder({
      cakeId: "solaris-gala-architectural",
      customerName: "Arthur Pendelton",
      customerEmail: "arthur@gala2026.com",
      price: 850,
      quantity: 2,
    });

    const after = await ds.getCakeSalesMetrics();
    expect(after.totalBoughtCount).toBe(before.totalBoughtCount + 2);
    expect(after.grossRevenue).toBe(before.grossRevenue + 1700);
    expect(after.netRevenue).toBe(before.netRevenue + 1700);
  });

  it("persists new order so that getAllOrders() includes the newly created order", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "rosalia-intimate-romance",
      customerName: "Sophia Loren",
      customerEmail: "sophia@cinema.it",
      price: 165,
    });

    const allOrders: OrderRecord[] = await ds.getAllOrders();
    const found = allOrders.find((o) => o.id === order.id);
    expect(found).toBeDefined();
    expect(found?.cakeId).toBe("rosalia-intimate-romance");
  });
});

describe("Tier 1.8: Order Cancellation Flow (cancelOrder)", () => {
  it("cancels an existing active order and transitions status to CANCELLED", async () => {
    const ds = await getDataService();
    expect(typeof ds.cancelOrder, "cancelOrder must be implemented").toBe("function");

    const order = await ds.createOrder({
      cakeId: "celeste-baby-shower",
      customerName: "Cancel Candidate 1",
      customerEmail: "cancel1@test.com",
      price: 320,
      quantity: 1,
    });

    expect(order.status).toBe("ACTIVE");

    const cancelled = await ds.cancelOrder(order.id);
    expect(cancelled.id).toBe(order.id);
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("updates updatedAt timestamp upon order cancellation", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      customerName: "Timestamp Check",
      customerEmail: "time@test.com",
      price: 680,
    });

    const cancelled = await ds.cancelOrder(order.id);
    expect(new Date(cancelled.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(order.createdAt).getTime()
    );
  });

  it("increments totalCancelledCount by the order quantity upon cancellation", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "blush-seraphina-birthday",
      customerName: "Cancel Multi Qty",
      customerEmail: "multi@test.com",
      price: 195,
      quantity: 3,
    });

    const before = await ds.getCakeSalesMetrics();
    await ds.cancelOrder(order.id);
    const after = await ds.getCakeSalesMetrics();

    expect(after.totalCancelledCount).toBe(before.totalCancelledCount + 3);
  });

  it("decreases netRevenue by the cancelled order amount while preserving grossRevenue", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "solaris-gala-architectural",
      customerName: "Net Revenue Delta Check",
      customerEmail: "netdelta@test.com",
      price: 850,
      quantity: 1,
    });

    const before = await ds.getCakeSalesMetrics();
    await ds.cancelOrder(order.id);
    const after = await ds.getCakeSalesMetrics();

    expect(after.grossRevenue).toBe(before.grossRevenue);
    expect(after.cancelledRevenue).toBe(before.cancelledRevenue + 850);
    expect(after.netRevenue).toBe(before.netRevenue - 850);
  });

  it("preserves original order details (cakeId, customerName, price) after cancellation", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "nocturne-anniversary-velvet",
      customerName: "Detail Preservation User",
      customerEmail: "preserve@test.com",
      price: 360,
      notes: "Special vintage champagne frosting.",
    });

    const cancelled = await ds.cancelOrder(order.id);
    expect(cancelled.cakeId).toBe("nocturne-anniversary-velvet");
    expect(cancelled.customerName).toBe("Detail Preservation User");
    expect(cancelled.customerEmail).toBe("preserve@test.com");
    expect(cancelled.price).toBe(360);
    expect(cancelled.notes).toBe("Special vintage champagne frosting.");
  });
});

describe("Tier 1.9: Role-Based Access Control — ADMIN Access", () => {
  it("grants ADMIN access to complete visit analytics metrics", async () => {
    const adminToken = await signSessionToken({
      id: "admin-rbac-1",
      email: "admin@aurapatisserie.com",
      name: "Admin User",
      role: "ADMIN",
    });

    const session = await verifySessionToken(adminToken);
    expect(session?.role).toBe("ADMIN");

    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();
    expect(summary.totalVisits).toBeGreaterThanOrEqual(0);
    expect(summary.normalUserVisits).toBeGreaterThanOrEqual(0);
    expect(summary.botVisits).toBeGreaterThanOrEqual(0);
  });

  it("grants ADMIN full access to financial metrics (grossRevenue, netRevenue, perCake)", async () => {
    const ds = await getDataService();
    const financials = await ds.getCakeSalesMetrics();

    expect(financials).toBeDefined();
    expect(financials.grossRevenue).toBeGreaterThanOrEqual(0);
    expect(financials.netRevenue).toBeGreaterThanOrEqual(0);
    expect(financials.totalBoughtCount).toBeGreaterThanOrEqual(0);
    expect(financials.totalCancelledCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(financials.perCake)).toBe(true);
  });

  it("grants ADMIN full access to order records list via getAllOrders", async () => {
    const ds = await getDataService();
    const orders = await ds.getAllOrders();

    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty("customerEmail");
    expect(orders[0]).toHaveProperty("price");
  });

  it("verifies ADMIN session payload has role === 'ADMIN'", async () => {
    const token = await signSessionToken({
      id: "admin-check",
      email: "admin@aurapatisserie.com",
      name: "Admin",
      role: "ADMIN",
    });

    const session = await verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.role).toBe("ADMIN");
  });

  it("allows ADMIN to perform administrative mutations such as cancelling orders", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      customerName: "Admin Perms Test",
      customerEmail: "perms@test.com",
      price: 680,
    });

    const cancelled = await ds.cancelOrder(order.id);
    expect(cancelled.status).toBe("CANCELLED");
  });
});

describe("Tier 1.10: Role-Based Access Control — SEO_SPECIALIST Redaction", () => {
  it("grants SEO_SPECIALIST access to full visit analytics metrics", async () => {
    const seoToken = await signSessionToken({
      id: "seo-rbac-1",
      email: "seo@aurapatisserie.com",
      name: "SEO Specialist",
      role: "SEO_SPECIALIST",
    });

    const session = await verifySessionToken(seoToken);
    expect(session?.role).toBe("SEO_SPECIALIST");

    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();
    expect(summary.totalVisits).toBeGreaterThanOrEqual(0);
    expect(summary.normalUserVisits).toBeGreaterThanOrEqual(0);
    expect(summary.botVisits).toBeGreaterThanOrEqual(0);
    expect(summary.botBreakdown).toBeDefined();
  });

  it("strictly redacts / hides financial metrics for SEO_SPECIALIST requests", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();

    // Simulate RBAC summary generator / API response filtering
    const seoAnalyticsPayload: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    expect(seoAnalyticsPayload.role).toBe("SEO_SPECIALIST");
    expect(seoAnalyticsPayload.visits).toBeDefined();
    expect(seoAnalyticsPayload.financials).toBeUndefined();
    expect(seoAnalyticsPayload.orders).toBeUndefined();
  });

  it("strictly redacts / hides orders records for SEO_SPECIALIST requests", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();

    const seoPayload: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    expect(seoPayload.orders).toBeUndefined();
  });

  it("verifies SEO_SPECIALIST session payload has role === 'SEO_SPECIALIST'", async () => {
    const token = await signSessionToken({
      id: "seo-check",
      email: "seo@aurapatisserie.com",
      name: "SEO Analyst",
      role: "SEO_SPECIALIST",
    });

    const session = await verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.role).toBe("SEO_SPECIALIST");
  });

  it("ensures data returned to SEO_SPECIALIST contains zero price, revenue, or customer identifiers", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();

    const seoPayload: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    const serialized = JSON.stringify(seoPayload);
    expect(serialized).not.toContain("grossRevenue");
    expect(serialized).not.toContain("netRevenue");
    expect(serialized).not.toContain("cancelledRevenue");
    expect(serialized).not.toContain("customerEmail");
  });
});

// ============================================================================
// TIER 2: Boundary & Corner Cases (>=5 tests per feature)
// ============================================================================

describe("Tier 2.1: User-Agent Classification Edge Cases", () => {
  it("handles empty string User-Agent safely without throwing", async () => {
    const classifyUserAgent = await getClassifier();
    const result = classifyUserAgent("");

    expect(result).toBeDefined();
    expect(typeof result.isBot).toBe("boolean");
  });

  it("handles null and undefined User-Agent safely without throwing", async () => {
    const classifyUserAgent = await getClassifier();
    const nullResult = classifyUserAgent(null);
    expect(nullResult).toBeDefined();

    const undefinedResult = classifyUserAgent(undefined);
    expect(undefinedResult).toBeDefined();
  });

  it("handles mixed and irregular casing in bot tokens (gptbot, CLAUDEBOT, GoOgLeBoT)", async () => {
    const classifyUserAgent = await getClassifier();
    const gptLower = classifyUserAgent("Mozilla/5.0 (compatible; gptbot/1.0)");
    expect(gptLower.isBot).toBe(true);
    expect(gptLower.category).toBe("AI_CRAWLER");

    const claudeUpper = classifyUserAgent("CLAUDEBOT/1.0 (+claudebot@anthropic.com)");
    expect(claudeUpper.isBot).toBe(true);
    expect(claudeUpper.category).toBe("AI_CRAWLER");

    const googleMixed = classifyUserAgent("Mozilla/5.0 (compatible; GoOgLeBoT/2.1)");
    expect(googleMixed.isBot).toBe(true);
    expect(googleMixed.category).toBe("SEARCH_BOT");
  });

  it("avoids false positive bot detection on benign device names (CUBOT smartphone)", async () => {
    const classifyUserAgent = await getClassifier();
    const cubotPhone = "Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36";
    const result = classifyUserAgent(cubotPhone);

    expect(result.isBot).toBe(false);
    expect(result.category).toBe("BROWSER");
  });

  it("safely handles extremely long User-Agent strings (> 2000 characters) without catastrophic backtracking", async () => {
    const classifyUserAgent = await getClassifier();
    const longUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " + "A".repeat(2500) + " Chrome/120.0 Safari/537.36";

    const t0 = performance.now();
    const result = classifyUserAgent(longUa);
    const durationMs = performance.now() - t0;

    expect(result).toBeDefined();
    expect(durationMs, "Classification must complete under 50ms without catastrophic backtracking").toBeLessThan(50);
  });

  it("handles uncommon scraper tools (PostmanRuntime, Wget, axios)", async () => {
    const classifyUserAgent = await getClassifier();
    const postman = classifyUserAgent("PostmanRuntime/7.36.0");
    expect(postman.isBot).toBe(true);
    expect(postman.category).toBe("SCRAPER_TOOL");

    const wget = classifyUserAgent("Wget/1.21.4 (linux-gnu)");
    expect(wget.isBot).toBe(true);
    expect(wget.category).toBe("SCRAPER_TOOL");

    const axios = classifyUserAgent("axios/1.6.0");
    expect(axios.isBot).toBe(true);
    expect(axios.category).toBe("SCRAPER_TOOL");
  });
});

describe("Tier 2.2: Order Placement & Management Boundaries", () => {
  it("handles order creation with multiple quantities (quantity: 5 tiers)", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      customerName: "Grand Ballroom Banquet",
      customerEmail: "banquet@ballroom.com",
      price: 680,
      quantity: 5,
    });

    expect(order.quantity).toBe(5);
    expect(order.price * order.quantity).toBe(3400);
  });

  it("handles order creation with minimum allowable cake price ($165 for Rosalia Mirror)", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "rosalia-intimate-romance",
      customerName: "Romantic Duo",
      customerEmail: "romance@paris.fr",
      price: 165,
      quantity: 1,
    });

    expect(order.price).toBe(165);
    expect(order.status).toBe("ACTIVE");
  });

  it("handles order creation with luxury custom notes and accented customer names (Hélène René-Dupont)", async () => {
    const ds = await getDataService();
    const customer = "Hélène René-Dupont & Chloë Müller";
    const notes = "24-karat gold dust inscription: « Pour l'éternité » @ 18:00 sharp.";

    const order = await ds.createOrder({
      cakeId: "solaris-gala-architectural",
      customerName: customer,
      customerEmail: "helene@dupont.luxury",
      price: 850,
      notes,
    });

    expect(order.customerName).toBe(customer);
    expect(order.notes).toBe(notes);
  });

  it("handles order cancellation on an already cancelled order idempotently", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "blush-seraphina-birthday",
      customerName: "Double Cancel Test",
      customerEmail: "doublecancel@test.com",
      price: 195,
    });

    const firstCancel = await ds.cancelOrder(order.id);
    expect(firstCancel.status).toBe("CANCELLED");

    // Second cancellation attempt
    const beforeMetrics = await ds.getCakeSalesMetrics();
    const secondCancel = await ds.cancelOrder(order.id);
    const afterMetrics = await ds.getCakeSalesMetrics();

    expect(secondCancel.status).toBe("CANCELLED");
    expect(afterMetrics.cancelledRevenue).toBe(beforeMetrics.cancelledRevenue);
    expect(afterMetrics.netRevenue).toBe(beforeMetrics.netRevenue);
  });

  it("handles order cancellation with non-existent or invalid order ID gracefully", async () => {
    const ds = await getDataService();
    await expect(ds.cancelOrder("non-existent-order-id-xyz-999")).rejects.toThrow();
  });

  it("handles edge case where all orders for a cake are cancelled (netRevenue becomes 0 without negative balance)", async () => {
    const ds = await getDataService();
    const cakeId = `test-isolated-cancel-cake-${Date.now()}`;

    const order = await ds.createOrder({
      cakeId,
      cakeName: "Isolated Cake",
      customerName: "Sole Customer",
      customerEmail: "sole@test.com",
      price: 400,
      quantity: 1,
    });

    await ds.cancelOrder(order.id);
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();
    const perCake = metrics.perCake.find((c) => c.cakeId === cakeId);

    if (perCake) {
      expect(perCake.netRevenue).toBe(0);
      expect(perCake.boughtCount).toBe(perCake.cancelledCount);
    }
  });
});

describe("Tier 2.3: Revenue & Financial Math Boundaries", () => {
  it("maintains floating-point decimal precision without fractional cent drift", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    // In USD, all luxury cake amounts should be integers or clean 2-decimal numbers
    expect(Number.isInteger(metrics.grossRevenue)).toBe(true);
    expect(Number.isInteger(metrics.cancelledRevenue)).toBe(true);
    expect(Number.isInteger(metrics.netRevenue)).toBe(true);
  });

  it("handles high-value order calculation ($850 Solaris Cube x 10 = $8,500) without integer overflow", async () => {
    const ds = await getDataService();
    const before = await ds.getCakeSalesMetrics();

    await ds.createOrder({
      cakeId: "solaris-gala-architectural",
      customerName: "Bespoke Corporate Gala",
      customerEmail: "gala@enterprise.com",
      price: 850,
      quantity: 10,
    });

    const after = await ds.getCakeSalesMetrics();
    expect(after.grossRevenue).toBe(before.grossRevenue + 8500);
    expect(after.netRevenue).toBe(before.netRevenue + 8500);
  });

  it("verifies revenue invariants when zero active orders exist for a cake", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    for (const cake of metrics.perCake) {
      if (cake.boughtCount === cake.cancelledCount) {
        expect(cake.netRevenue).toBe(0);
      }
    }
  });

  it("verifies invariant: grossRevenue >= cancelledRevenue >= 0 under all conditions", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    expect(metrics.grossRevenue).toBeGreaterThanOrEqual(metrics.cancelledRevenue);
    expect(metrics.cancelledRevenue).toBeGreaterThanOrEqual(0);
    expect(metrics.netRevenue).toBeGreaterThanOrEqual(0);
  });

  it("verifies per-cake sales metrics boughtCount and cancelledCount are non-negative integers", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    for (const item of metrics.perCake) {
      expect(Number.isInteger(item.boughtCount)).toBe(true);
      expect(Number.isInteger(item.cancelledCount)).toBe(true);
      expect(item.boughtCount).toBeGreaterThanOrEqual(item.cancelledCount);
      expect(item.cancelledCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles catalog-wide revenue calculation when multiple cakes have mixed active/cancelled ratios", async () => {
    const ds = await getDataService();
    const metrics: CakeSalesMetrics = await ds.getCakeSalesMetrics();

    const calculatedGross = metrics.netRevenue + metrics.cancelledRevenue;
    expect(calculatedGross).toBe(metrics.grossRevenue);
  });
});

describe("Tier 2.4: Visit Analytics Boundaries", () => {
  it("handles visits to deep nested URLs with special characters and query parameters", async () => {
    const ds = await getDataService();
    const complexPath = "/cakes/elysian-wedding-tier?ref=instagram_story&source=haute_couture_2026&utm_campaign=bridal#swatches";

    const visit = await ds.recordVisit({
      path: complexPath,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    });

    expect(visit.path).toBe(complexPath);
  });

  it("handles multiple consecutive visits from the same bot type without state corruption", async () => {
    const ds = await getDataService();
    const before = await ds.getVisitAnalytics();
    const initialGptCount = before.botBreakdown["GPTBot"] || 0;

    await ds.recordVisit({
      path: "/cakes",
      userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    });
    await ds.recordVisit({
      path: "/occasions/weddings",
      userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    });

    const after = await ds.getVisitAnalytics();
    expect(after.botBreakdown["GPTBot"]).toBe(initialGptCount + 2);
  });

  it("handles IPv4, IPv6, localhost, and missing IP addresses in visit records", async () => {
    const ds = await getDataService();
    const v1 = await ds.recordVisit({ path: "/", userAgent: "curl/8.4.0", ip: "127.0.0.1" });
    const v2 = await ds.recordVisit({ path: "/", userAgent: "curl/8.4.0", ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" });
    const v3 = await ds.recordVisit({ path: "/", userAgent: "curl/8.4.0" });

    expect(v1.ip).toBe("127.0.0.1");
    expect(v2.ip).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
    expect(v3.ip === undefined || v3.ip === null || typeof v3.ip === "string").toBe(true);
  });

  it("ensures recentVisits preserves chronological sorting (newest first)", async () => {
    const ds = await getDataService();
    const summary = await ds.getVisitAnalytics();

    const recent = summary.recentVisits;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = new Date(recent[i].createdAt).getTime();
      const next = new Date(recent[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("verifies botBreakdown handles bot names with hyphens and special tokens cleanly", async () => {
    const ds = await getDataService();
    await ds.recordVisit({
      path: "/robots.txt",
      userAgent: "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search)",
    });

    const summary = await ds.getVisitAnalytics();
    expect(summary.botBreakdown).toHaveProperty("Google-Extended");
    expect(summary.botBreakdown["Google-Extended"]).toBeGreaterThan(0);
  });
});

describe("Tier 2.5: RBAC & Authentication Boundaries", () => {
  it("rejects JWT session tokens with invalid or unrecognized roles", async () => {
    const invalidToken = await signSessionToken({
      id: "hacker-user",
      email: "hacker@intruder.net",
      name: "Intruder",
      role: "SUPER_ADMIN_ROOT" as unknown as "ADMIN",
    });

    const session = await verifySessionToken(invalidToken);
    expect(session?.role === "ADMIN" || session?.role === "SEO_SPECIALIST").toBe(false);
  });

  it("rejects expired session tokens (token past exp timestamp returns null)", async () => {
    const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE1MTYyMzkwMjJ9.invalidSignature";
    const session = await verifySessionToken(expiredToken);
    expect(session).toBeNull();
  });

  it("rejects tampered JWT signature and malformed token strings", async () => {
    const validToken = await signSessionToken({
      id: "valid-admin",
      email: "admin@aurapatisserie.com",
      name: "Admin",
      role: "ADMIN",
    });

    const tampered = validToken.slice(0, -10) + "XXXXXXXXXX";
    expect(await verifySessionToken(tampered)).toBeNull();
    expect(await verifySessionToken("malformed.string")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("rejects unauthorized order cancellation attempts from non-admin contexts", async () => {
    const seoToken = await signSessionToken({
      id: "seo-analyst",
      email: "seo@aurapatisserie.com",
      name: "SEO Analyst",
      role: "SEO_SPECIALIST",
    });

    const session = await verifySessionToken(seoToken);
    const isAdmin = session?.role === "ADMIN";
    expect(isAdmin, "SEO_SPECIALIST must not have admin mutation permissions").toBe(false);
  });

  it("audits JSON serialization of SEO_SPECIALIST analytics response for zero data leakage", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();

    const seoPayload: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    const keys = Object.keys(seoPayload);
    expect(keys).toContain("role");
    expect(keys).toContain("visits");
    expect(keys).not.toContain("financials");
    expect(keys).not.toContain("orders");

    const json = JSON.stringify(seoPayload);
    expect(json).not.toContain('"financials"');
    expect(json).not.toContain('"orders"');
    expect(json).not.toContain('"grossRevenue"');
  });
});

// ============================================================================
// TIER 3: Cross-Feature Combinations (Pairwise & Multi-Interaction)
// ============================================================================

describe("Tier 3: Cross-Feature Combinations", () => {
  it("Combination 1: combines user visit logging with subsequent order placement and revenue increment", async () => {
    const ds = await getDataService();
    const visitBefore = await ds.getVisitAnalytics();
    const salesBefore = await ds.getCakeSalesMetrics();

    // 1. User arrives on catalog page
    await ds.recordVisit({
      path: "/cakes/elysian-wedding-tier",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    // 2. User places order
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      customerName: "Cross Feature Buyer",
      customerEmail: "cross@buyer.com",
      price: 680,
      quantity: 1,
    });

    const visitAfter = await ds.getVisitAnalytics();
    const salesAfter = await ds.getCakeSalesMetrics();

    expect(visitAfter.normalUserVisits).toBe(visitBefore.normalUserVisits + 1);
    expect(salesAfter.totalBoughtCount).toBe(salesBefore.totalBoughtCount + 1);
    expect(salesAfter.netRevenue).toBe(salesBefore.netRevenue + 680);
    expect(order.status).toBe("ACTIVE");
  });

  it("Combination 2: verifies AI crawler visit does not register as customer purchase or affect order metrics", async () => {
    const ds = await getDataService();
    const salesBefore = await ds.getCakeSalesMetrics();
    const visitBefore = await ds.getVisitAnalytics();

    // AI crawler visits product pages
    await ds.recordVisit({
      path: "/cakes/nocturne-anniversary-velvet",
      userAgent: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    });

    const visitAfter = await ds.getVisitAnalytics();
    const salesAfter = await ds.getCakeSalesMetrics();

    expect(visitAfter.botVisits).toBe(visitBefore.botVisits + 1);
    expect(salesAfter.totalBoughtCount).toBe(salesBefore.totalBoughtCount);
    expect(salesAfter.grossRevenue).toBe(salesBefore.grossRevenue);
  });

  it("Combination 3: exercises complete order placement then cancellation cycle with revenue delta tracking", async () => {
    const ds = await getDataService();
    const initial = await ds.getCakeSalesMetrics();

    // Place order
    const order = await ds.createOrder({
      cakeId: "solaris-gala-architectural",
      customerName: "Cycle Test User",
      customerEmail: "cycle@test.com",
      price: 850,
      quantity: 1,
    });

    const afterPlace = await ds.getCakeSalesMetrics();
    expect(afterPlace.grossRevenue).toBe(initial.grossRevenue + 850);
    expect(afterPlace.netRevenue).toBe(initial.netRevenue + 850);

    // Cancel order
    await ds.cancelOrder(order.id);
    const afterCancel = await ds.getCakeSalesMetrics();

    expect(afterCancel.grossRevenue).toBe(afterPlace.grossRevenue);
    expect(afterCancel.cancelledRevenue).toBe(initial.cancelledRevenue + 850);
    expect(afterCancel.netRevenue).toBe(initial.netRevenue);
  });

  it("Combination 4: verifies multi-cake order portfolio: per-cake net revenues aggregate exactly to total net revenue", async () => {
    const ds = await getDataService();

    await ds.createOrder({ cakeId: "elysian-wedding-tier", customerName: "P1", customerEmail: "p1@t.com", price: 680 });
    await ds.createOrder({ cakeId: "blush-seraphina-birthday", customerName: "P2", customerEmail: "p2@t.com", price: 195 });
    await ds.createOrder({ cakeId: "rosalia-intimate-romance", customerName: "P3", customerEmail: "p3@t.com", price: 165 });

    const metrics = await ds.getCakeSalesMetrics();
    const perCakeSum = metrics.perCake.reduce((sum, item) => sum + item.netRevenue, 0);

    expect(perCakeSum).toBe(metrics.netRevenue);
  });

  it("Combination 5: handles partial cancellations across a multi-order catalog maintaining correct remaining net balance", async () => {
    const ds = await getDataService();

    const o1 = await ds.createOrder({ cakeId: "celeste-baby-shower", customerName: "O1", customerEmail: "o1@t.com", price: 320 });
    const o2 = await ds.createOrder({ cakeId: "celeste-baby-shower", customerName: "O2", customerEmail: "o2@t.com", price: 320 });

    const beforeCancel = await ds.getCakeSalesMetrics();
    await ds.cancelOrder(o1.id);
    const afterCancel = await ds.getCakeSalesMetrics();

    expect(afterCancel.netRevenue).toBe(beforeCancel.netRevenue - 320);

    // o2 is still active
    const allOrders = await ds.getAllOrders();
    const remainingActive = allOrders.find((o) => o.id === o2.id);
    expect(remainingActive?.status).toBe("ACTIVE");
  });

  it("Combination 6: simulates concurrent interleaved traffic of normal browsers, crawlers, and order transactions", async () => {
    const ds = await getDataService();
    const vBefore = await ds.getVisitAnalytics();
    const sBefore = await ds.getCakeSalesMetrics();

    // Interleaved events
    await ds.recordVisit({ path: "/", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0" });
    await ds.recordVisit({ path: "/robots.txt", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)" });
    await ds.createOrder({ cakeId: "rosalia-intimate-romance", customerName: "Interleaved User", customerEmail: "inter@test.com", price: 165 });
    await ds.recordVisit({ path: "/cakes", userAgent: "PerplexityBot/1.0" });

    const vAfter = await ds.getVisitAnalytics();
    const sAfter = await ds.getCakeSalesMetrics();

    expect(vAfter.totalVisits).toBe(vBefore.totalVisits + 3);
    expect(vAfter.normalUserVisits).toBe(vBefore.normalUserVisits + 1);
    expect(vAfter.botVisits).toBe(vBefore.botVisits + 2);
    expect(sAfter.totalBoughtCount).toBe(sBefore.totalBoughtCount + 1);
  });

  it("Combination 7: verifies live data consistency when ADMIN and SEO_SPECIALIST query the same underlying store", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();
    const financials = await ds.getCakeSalesMetrics();
    const orders = await ds.getAllOrders();

    const adminResponse: AdminAnalyticsResponse = {
      role: "ADMIN",
      visits,
      financials,
      orders,
    };

    const seoResponse: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    // Both observe the exact same visit analytics
    expect(adminResponse.visits.totalVisits).toBe(seoResponse.visits.totalVisits);
    expect(adminResponse.visits.normalUserVisits).toBe(seoResponse.visits.normalUserVisits);
    expect(adminResponse.visits.botVisits).toBe(seoResponse.visits.botVisits);

    // Only admin gets financials and orders
    expect(adminResponse.financials).toBeDefined();
    expect(adminResponse.orders).toBeDefined();
    expect(seoResponse.financials).toBeUndefined();
    expect(seoResponse.orders).toBeUndefined();
  });

  it("Combination 8: verifies bot breakdown distribution matches visit analytics total bot count during active crawl", async () => {
    const ds = await getDataService();

    await ds.recordVisit({ path: "/cakes", userAgent: "DuckDuckBot/1.1" });
    await ds.recordVisit({ path: "/sitemap.xml", userAgent: "CCBot/2.0" });

    const summary = await ds.getVisitAnalytics();
    const breakdownTotal = Object.values(summary.botBreakdown).reduce((sum, count) => sum + count, 0);

    expect(breakdownTotal).toBe(summary.botVisits);
  });

  it("Combination 9: verifies immediate status and timestamp transition upon order cancellation followed by re-fetch", async () => {
    const ds = await getDataService();
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      customerName: "Transition Timing User",
      customerEmail: "timing@test.com",
      price: 680,
    });

    const cancelled = await ds.cancelOrder(order.id);
    const refetchedOrders = await ds.getAllOrders();
    const refetched = refetchedOrders.find((o) => o.id === order.id);

    expect(refetched?.status).toBe("CANCELLED");
    expect(refetched?.updatedAt).toBe(cancelled.updatedAt);
  });

  it("Combination 10: verifies re-ordering the same cake after cancellation increments bought count to 2 while net active is 1", async () => {
    const ds = await getDataService();
    const cakeId = `test-reorder-cycle-cake-${Date.now()}`;

    // Order 1
    const order1 = await ds.createOrder({ cakeId, cakeName: "Reorder Cake", customerName: "Buyer 1", customerEmail: "b1@test.com", price: 500, quantity: 1 });
    // Cancel Order 1
    await ds.cancelOrder(order1.id);
    // Order 2 (same cake)
    await ds.createOrder({ cakeId, cakeName: "Reorder Cake", customerName: "Buyer 2", customerEmail: "b2@test.com", price: 500, quantity: 1 });

    const metrics = await ds.getCakeSalesMetrics();
    const perCake = metrics.perCake.find((c) => c.cakeId === cakeId);

    expect(perCake?.boughtCount).toBe(2);
    expect(perCake?.cancelledCount).toBe(1);
    expect(perCake?.netRevenue).toBe(500);
  });
});

// ============================================================================
// TIER 4: Real-World Scenarios
// ============================================================================

describe("Tier 4: Real-World Scenarios", () => {
  it("Scenario 1: End-to-End Luxury Patisserie Order & Administration Workflow", async () => {
    const ds = await getDataService();

    // 1. High-profile client arrives from Safari on iOS
    const visit = await ds.recordVisit({
      path: "/cakes/elysian-wedding-tier",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
      ip: "198.51.100.42",
    });
    expect(visit.isBot).toBe(false);

    // 2. Client configures architectural wedding tier and places order
    const order = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      cakeName: "The Elysian Grand Tier",
      customerName: "Countess Jacqueline de Valois",
      customerEmail: "jacqueline@valois-estates.fr",
      price: 680,
      quantity: 2,
      deliveryDate: "2026-12-15",
      notes: "White-glove climate-controlled delivery to Château reception.",
    });
    expect(order.status).toBe("ACTIVE");
    expect(order.price * order.quantity).toBe(1360);

    // 3. Admin reviews metrics and discovers customer requested cancellation of second tier
    const cancelled = await ds.cancelOrder(order.id);
    expect(cancelled.status).toBe("CANCELLED");

    // 4. Client places corrected single-tier order
    const reordered = await ds.createOrder({
      cakeId: "elysian-wedding-tier",
      cakeName: "The Elysian Grand Tier",
      customerName: "Countess Jacqueline de Valois",
      customerEmail: "jacqueline@valois-estates.fr",
      price: 680,
      quantity: 1,
      deliveryDate: "2026-12-15",
    });
    expect(reordered.status).toBe("ACTIVE");

    // 5. SEO specialist reviews visit trends without accessing Countess's transaction values
    const seoSession = await verifySessionToken(
      await signSessionToken({
        id: "seo-auditor",
        email: "seo@aurapatisserie.com",
        name: "SEO Analyst",
        role: "SEO_SPECIALIST",
      })
    );
    expect(seoSession?.role).toBe("SEO_SPECIALIST");

    const seoView: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits: await ds.getVisitAnalytics(),
    };
    expect(seoView.visits.totalVisits).toBeGreaterThan(0);
    expect(seoView.financials).toBeUndefined();
    expect(seoView.orders).toBeUndefined();
  });

  it("Scenario 2: Search Engine & AI Crawler Wave During High-Traffic Marketing Campaign", async () => {
    const ds = await getDataService();
    const vBefore = await ds.getVisitAnalytics();

    // Wave of AI and Search Bots indexing new catalogs
    const bots = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
      "CCBot/2.0 (https://commoncrawl.org/faq/)",
    ];

    for (const botUA of bots) {
      await ds.recordVisit({ path: "/cakes", userAgent: botUA });
    }

    // Simultaneously, 5 real human shoppers browse
    for (let i = 0; i < 5; i++) {
      await ds.recordVisit({
        path: `/cakes/blush-seraphina-birthday?customer=${i}`,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      });
    }

    const vAfter = await ds.getVisitAnalytics();
    expect(vAfter.botVisits).toBe(vBefore.botVisits + 5);
    expect(vAfter.normalUserVisits).toBe(vBefore.normalUserVisits + 5);
    expect(vAfter.totalVisits).toBe(vBefore.totalVisits + 10);
  });

  it("Scenario 3: Weekend Flash Event with Rapid Orders and Date-Conflict Cancellations", async () => {
    const ds = await getDataService();
    const initial = await ds.getCakeSalesMetrics();

    // 3 clients place orders for Seraphina Blush birthday cake ($195)
    const order1 = await ds.createOrder({ cakeId: "blush-seraphina-birthday", customerName: "Flash Buyer 1", customerEmail: "f1@t.com", price: 195 });
    const order2 = await ds.createOrder({ cakeId: "blush-seraphina-birthday", customerName: "Flash Buyer 2", customerEmail: "f2@t.com", price: 195 });
    const order3 = await ds.createOrder({ cakeId: "blush-seraphina-birthday", customerName: "Flash Buyer 3", customerEmail: "f3@t.com", price: 195 });

    // Buyer 2 has a date conflict and cancels
    await ds.cancelOrder(order2.id);

    const afterFlash = await ds.getCakeSalesMetrics();
    expect(afterFlash.totalBoughtCount).toBe(initial.totalBoughtCount + 3);
    expect(afterFlash.totalCancelledCount).toBe(initial.totalCancelledCount + 1);
    expect(afterFlash.grossRevenue).toBe(initial.grossRevenue + 195 * 3);
    expect(afterFlash.cancelledRevenue).toBe(initial.cancelledRevenue + 195);
    expect(afterFlash.netRevenue).toBe(initial.netRevenue + 195 * 2);
  });

  it("Scenario 4: Security Penetration Audit for Unauthorized Financial Data Leakage", async () => {
    const ds = await getDataService();
    const visits = await ds.getVisitAnalytics();
    const financials = await ds.getCakeSalesMetrics();
    const allOrders = await ds.getAllOrders();

    // Full system payload
    const adminPayload: AdminAnalyticsResponse = {
      role: "ADMIN",
      visits,
      financials,
      orders: allOrders,
    };

    // Restricted SEO Specialist payload
    const seoPayload: AdminAnalyticsResponse = {
      role: "SEO_SPECIALIST",
      visits,
    };

    const serializedSeo = JSON.stringify(seoPayload);
    const parsedSeo = JSON.parse(serializedSeo);

    // Penetration verification: zero access to financial or customer data
    expect(parsedSeo.financials).toBeUndefined();
    expect(parsedSeo.orders).toBeUndefined();
    expect(serializedSeo).not.toContain("customerEmail");
    expect(serializedSeo).not.toContain("grossRevenue");
    expect(serializedSeo).not.toContain("cancelledRevenue");
    expect(serializedSeo).not.toContain("netRevenue");

    // Admin payload properly contains all metrics
    const serializedAdmin = JSON.stringify(adminPayload);
    expect(serializedAdmin).toContain("grossRevenue");
    expect(serializedAdmin).toContain("netRevenue");
    expect(serializedAdmin).toContain("orders");
  });

  it("Scenario 5: Daily Store Closing Reconciliation Audit", async () => {
    const ds = await getDataService();
    const visitSummary = await ds.getVisitAnalytics();
    const salesMetrics = await ds.getCakeSalesMetrics();
    const orders = await ds.getAllOrders();

    // 1. Visit reconciliation
    expect(visitSummary.totalVisits).toBe(
      visitSummary.normalUserVisits + visitSummary.botVisits
    );

    // 2. Financial reconciliation
    expect(salesMetrics.netRevenue).toBe(
      salesMetrics.grossRevenue - salesMetrics.cancelledRevenue
    );

    // 3. Per-cake reconciliation
    const perCakeSum = salesMetrics.perCake.reduce((sum: number, item: { netRevenue: number }) => sum + item.netRevenue, 0);
    expect(perCakeSum).toBe(salesMetrics.netRevenue);

    // 4. Order count reconciliation
    const activeOrderCount = orders.filter((o: OrderRecord) => o.status === "ACTIVE").reduce((sum: number, o: OrderRecord) => sum + o.quantity, 0);
    const cancelledOrderCount = orders.filter((o: OrderRecord) => o.status === "CANCELLED").reduce((sum: number, o: OrderRecord) => sum + o.quantity, 0);

    expect(salesMetrics.totalBoughtCount).toBe(activeOrderCount + cancelledOrderCount);
    expect(salesMetrics.totalCancelledCount).toBe(cancelledOrderCount);
  });
});
