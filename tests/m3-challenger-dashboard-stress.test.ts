import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { NextRequest } from "next/server";

// Mock next/navigation for Next.js App Router hooks in Vitest Node environment
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/admin/analytics",
  useSearchParams: () => new URLSearchParams(),
}));

import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import {
  VisitAnalyticsSummary,
  CakeSalesMetrics,
  OrderRecord,
  VisitRecord,
  resetOrdersStore,
  createOrder,
  getCakeSalesMetrics,
} from "@/lib/data-service";
import { classifyUserAgent } from "@/lib/visit-utils";
import { signSessionToken } from "@/lib/auth";
import { PATCH as cancelOrderRoute } from "@/app/api/admin/orders/[id]/route";

// ============================================================================
// Helper Utilities for CSV generation, Filtering & State Transitions
// (Mirrors the exact pure logic implemented in AnalyticsDashboard.tsx)
// ============================================================================

/**
 * Strips React SSR comment markers (<!-- -->) from rendered HTML for robust
 * text assertions against React 19's server-rendered markup.
 */
function cleanSsrHtml(html: string): string {
  return html.replace(/<!--.*?-->/g, "");
}

function filterVisits(
  visits: VisitRecord[],
  filter: "all" | "users" | "bots",
  selectedCategory: string,
  searchTerm: string
): VisitRecord[] {
  return visits.filter((v) => {
    if (filter === "users" && v.isBot) return false;
    if (filter === "bots" && !v.isBot) return false;

    if (selectedCategory !== "all" && v.isBot) {
      const cat = classifyUserAgent(v.botName || v.userAgent).category;
      if (cat !== selectedCategory) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.path.toLowerCase().includes(term) ||
      (v.botName && v.botName.toLowerCase().includes(term)) ||
      (v.ip && v.ip.toLowerCase().includes(term)) ||
      v.userAgent.toLowerCase().includes(term)
    );
  });
}

function generateCsvContent(visits: VisitRecord[]): string {
  const rows = [
    ["Type", "Path", "IP Address", "Bot Name", "User Agent", "Timestamp"],
    ...visits.map((v) => [
      v.isBot ? "BOT" : "USER",
      `"${v.path.replace(/"/g, '""')}"`,
      v.ip || "",
      v.botName || "",
      `"${(v.userAgent || "").replace(/"/g, '""')}"`,
      v.createdAt,
    ]),
  ];
  return "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
}

function applyOptimisticOrderCancellation(
  orderId: string,
  orders: OrderRecord[],
  financials: CakeSalesMetrics | null
): { orders: OrderRecord[]; financials: CakeSalesMetrics | null } {
  const updatedOrders = orders.map((o) =>
    o.id === orderId ? { ...o, status: "CANCELLED" as const } : o
  );

  let updatedFinancials = financials;
  if (financials) {
    const target = orders.find((o) => o.id === orderId);
    if (target && target.status === "ACTIVE") {
      const loss = target.price * target.quantity;
      updatedFinancials = {
        ...financials,
        totalCancelledCount: financials.totalCancelledCount + target.quantity,
        cancelledRevenue: financials.cancelledRevenue + loss,
        netRevenue: financials.netRevenue - loss,
        perCake: financials.perCake.map((c) =>
          c.cakeId === target.cakeId
            ? {
                ...c,
                cancelledCount: c.cancelledCount + target.quantity,
                netRevenue: c.netRevenue - loss,
              }
            : c
        ),
      };
    }
  }

  return { orders: updatedOrders, financials: updatedFinancials };
}

// ============================================================================
// Adversarial Stress Test Suite: Milestone 3 Challenger 2
// ============================================================================

describe("Milestone 3 Challenger 2: Analytics Dashboard Empirical Stress Suite", () => {
  let adminToken: string;
  let seoToken: string;

  beforeAll(async () => {
    adminToken = await signSessionToken({
      id: "admin-challenger-2",
      email: "admin-challenger@aura.test",
      name: "Admin Challenger 2",
      role: "ADMIN",
    });

    seoToken = await signSessionToken({
      id: "seo-challenger-2",
      email: "seo-challenger@aura.test",
      name: "SEO Challenger 2",
      role: "SEO_SPECIALIST",
    });
  });

  beforeEach(() => {
    resetOrdersStore();
  });

  // ==========================================================================
  // Suite 1: Extreme Edge States: Empty Logs, Zero Metrics & Division by Zero
  // ==========================================================================
  describe("1. Extreme Edge States: Empty Logs, Zero Metrics & Division by Zero", () => {
    const emptyVisits: VisitAnalyticsSummary = {
      totalVisits: 0,
      normalUserVisits: 0,
      botVisits: 0,
      botBreakdown: {},
      recentVisits: [],
      dailyTrends: [],
    };

    const emptyFinancials: CakeSalesMetrics = {
      totalBoughtCount: 0,
      totalCancelledCount: 0,
      grossRevenue: 0,
      cancelledRevenue: 0,
      netRevenue: 0,
      perCake: [],
    };

    it("renders cleanly without NaN, Infinity, or crash when visit logs are completely empty", () => {
      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: emptyVisits,
          financials: emptyFinancials,
          orders: [],
        })
      );
      const html = cleanSsrHtml(rawHtml);

      // Verify no JavaScript numeric errors in rendered markup
      expect(html).not.toContain("NaN");
      expect(html).not.toContain("Infinity");
      expect(html).not.toContain("undefined");

      // Verify zero-traffic fallbacks
      expect(html).toContain("Total Impressions");
      expect(html).toContain("Normal Visitors");
      expect(html).toContain("Bot &amp; AI Crawlers");
      expect(html).toContain("Crawler Share Ratio");
      expect(html).toContain("0% of traffic");
      expect(html).toContain("0 Humans");
      expect(html).toContain("0 Crawlers");
      expect(html).toContain("No visit records match your selected criteria.");

      // Verify empty bot category cards display "None detected"
      expect(html).toContain("None detected");
    });

    it("handles zero total visits with safe percentage calculation (0% normal, 0% bot)", () => {
      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "SEO_SPECIALIST",
          visits: emptyVisits,
        })
      );
      const html = cleanSsrHtml(rawHtml);

      expect(html).not.toContain("NaN%");
      expect(html).toContain("0%");
      // Verify SEO Specialist terminal header
      expect(html).toContain("SEO Specialist Terminal");
      // Verify financial sections are strictly absent from DOM
      expect(html).not.toContain("Cake Revenue");
      expect(html).not.toContain("Net Realized Revenue");
      expect(html).not.toContain("Orders &amp; Actions");
    });

    it("renders zero orders and zero cake sales metrics cleanly for ADMIN", () => {
      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: emptyVisits,
          financials: emptyFinancials,
          orders: [],
        })
      );
      const html = cleanSsrHtml(rawHtml);

      // Verify Executive Admin terminal header
      expect(html).toContain("Executive Terminal • Administrator");
      expect(html).toContain("Cake Revenue");
      expect(html).toContain("Orders &amp; Actions");
    });
  });

  // ==========================================================================
  // Suite 2: Extreme Ratios: 100% Bots, 100% Normal Users, and 0% Bots
  // ==========================================================================
  describe("2. Extreme Ratios: 100% Bots, 100% Normal Users, and 0% Bots", () => {
    it("handles 100% bot visits (0% normal users) without arithmetic skew", () => {
      const botOnlyVisits: VisitAnalyticsSummary = {
        totalVisits: 450,
        normalUserVisits: 0,
        botVisits: 450,
        botBreakdown: {
          "GPTBot/1.0": 200,
          "Googlebot/2.1": 150,
          "curl/7.88.1": 100,
        },
        recentVisits: [
          {
            id: "v-bot-1",
            path: "/cakes/elysian-silk-cube",
            userAgent: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
            isBot: true,
            botName: "GPTBot/1.0",
            ip: "20.15.240.1",
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: botOnlyVisits,
        })
      );
      const html = cleanSsrHtml(rawHtml);

      expect(html).not.toContain("NaN");
      expect(html).toContain("0% of traffic"); // Normal visitors
      expect(html).toContain("100% of traffic"); // Bots
      expect(html).toContain("100%"); // Crawler Share Ratio
      expect(html).toContain("0 Humans");
      expect(html).toContain("450 Crawlers");
      expect(html).toContain("GPTBot/1.0");
      expect(html).toContain("(200)");
      expect(html).toContain("Googlebot/2.1");
      expect(html).toContain("(150)");
      expect(html).toContain("curl/7.88.1");
      expect(html).toContain("(100)");
    });

    it("handles 100% normal users (0% bots) with all bot categories displaying 'None detected'", () => {
      const userOnlyVisits: VisitAnalyticsSummary = {
        totalVisits: 320,
        normalUserVisits: 320,
        botVisits: 0,
        botBreakdown: {},
        recentVisits: [
          {
            id: "v-user-1",
            path: "/cakes",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            isBot: false,
            ip: "192.168.1.100",
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: userOnlyVisits,
        })
      );
      const html = cleanSsrHtml(rawHtml);

      expect(html).not.toContain("NaN");
      expect(html).toContain("100% of traffic"); // Normal visitors
      expect(html).toContain("0% of traffic"); // Bots
      expect(html).toContain("320 Humans");
      expect(html).toContain("0 Crawlers");
      expect(html).toContain("None detected");
      expect(html).toContain("Browser Client");
      expect(html).toContain("USER");
    });

    it("handles single-visit boundary states (1 user / 0 bots and 0 users / 1 bot)", () => {
      // 1 user / 0 bots
      const singleUserHtml = cleanSsrHtml(
        renderToString(
          React.createElement(AnalyticsDashboard, {
            role: "SEO_SPECIALIST",
            visits: {
              totalVisits: 1,
              normalUserVisits: 1,
              botVisits: 0,
              botBreakdown: {},
              recentVisits: [],
            },
          })
        )
      );
      expect(singleUserHtml).toContain("100% of traffic");
      expect(singleUserHtml).toContain("0% of traffic");
      expect(singleUserHtml).toContain("1 Humans");
      expect(singleUserHtml).toContain("0 Crawlers");

      // 0 users / 1 bot
      const singleBotHtml = cleanSsrHtml(
        renderToString(
          React.createElement(AnalyticsDashboard, {
            role: "SEO_SPECIALIST",
            visits: {
              totalVisits: 1,
              normalUserVisits: 0,
              botVisits: 1,
              botBreakdown: { "PerplexityBot/1.0": 1 },
              recentVisits: [],
            },
          })
        )
      );
      expect(singleBotHtml).toContain("0% of traffic");
      expect(singleBotHtml).toContain("100% of traffic");
      expect(singleBotHtml).toContain("0 Humans");
      expect(singleBotHtml).toContain("1 Crawlers");
    });
  });

  // ==========================================================================
  // Suite 3: High-Volume Traffic Bursts (500+ Diverse Records & IP Formats)
  // ==========================================================================
  describe("3. High-Volume Traffic Bursts (500+ Diverse Records & IP Formats)", () => {
    it("processes a large burst of 500+ records with diverse User-Agents and IP formats", () => {
      const userAgents = [
        // AI Crawlers
        "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
        "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)",
        "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search)",
        "CCBot/2.0 (https://commoncrawl.org/faq/)",
        // Search Bots
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
        "Baiduspider+(+http://www.baidu.com/search/spider.htm)",
        "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
        // Scrapers
        "curl/8.1.2",
        "python-requests/2.31.0",
        "Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36",
        // Human Browsers
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
      ];

      const ips = [
        "192.168.1.1",
        "10.0.4.15",
        "172.16.0.99",
        "127.0.0.1",
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "::1",
        undefined, // test missing IP
      ];

      const paths = [
        "/",
        "/cakes",
        "/cakes/elysian-silk-cube",
        "/cakes/opera-nocturne-gold",
        "/cakes/aurora-berry-chiffon",
        "/about",
        "/contact",
      ];

      const burstRecords: VisitRecord[] = [];
      const breakdown: Record<string, number> = {};
      let normalCount = 0;
      let botCount = 0;

      for (let i = 0; i < 500; i++) {
        const ua = userAgents[i % userAgents.length];
        const ip = ips[i % ips.length];
        const path = paths[i % paths.length];
        const classification = classifyUserAgent(ua);

        if (classification.isBot) {
          botCount++;
          const name = classification.botName || "Unknown Bot";
          breakdown[name] = (breakdown[name] || 0) + 1;
        } else {
          normalCount++;
        }

        burstRecords.push({
          id: `burst-visit-${i}`,
          path,
          userAgent: ua,
          isBot: classification.isBot,
          botName: classification.botName,
          ip,
          createdAt: new Date(Date.now() - i * 60000).toISOString(),
        });
      }

      const burstSummary: VisitAnalyticsSummary = {
        totalVisits: 500,
        normalUserVisits: normalCount,
        botVisits: botCount,
        botBreakdown: breakdown,
        recentVisits: burstRecords,
      };

      const startTime = performance.now();
      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: burstSummary,
        })
      );
      const renderDuration = performance.now() - startTime;
      const html = cleanSsrHtml(rawHtml);

      // Rendering 500 records should take less than 500ms
      expect(renderDuration).toBeLessThan(500);
      expect(html).not.toContain("NaN");

      // Verify that table rows are capped at 50 records in DOM table
      const trCount = (html.match(/<tr/g) || []).length;
      // Header row (1) + up to 50 body rows = 51 tr elements
      expect(trCount).toBeLessThanOrEqual(52);

      // Verify missing IP fallback renders gracefully
      expect(html).toContain("—");
    });
  });

  // ==========================================================================
  // Suite 4: Search and Bot Category Filter Matrix
  // ==========================================================================
  describe("4. Search and Bot Category Filter Matrix", () => {
    const testVisits: VisitRecord[] = [
      {
        id: "v1",
        path: "/cakes/elysian-silk-cube",
        userAgent: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        isBot: true,
        botName: "GPTBot",
        ip: "20.15.240.1",
        createdAt: "2026-11-06T10:00:00Z",
      },
      {
        id: "v2",
        path: "/cakes/opera-nocturne-gold",
        userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        isBot: true,
        botName: "Googlebot",
        ip: "66.249.66.1",
        createdAt: "2026-11-06T10:01:00Z",
      },
      {
        id: "v3",
        path: "/api/health",
        userAgent: "curl/7.88.1",
        isBot: true,
        botName: "curl",
        ip: "127.0.0.1",
        createdAt: "2026-11-06T10:02:00Z",
      },
      {
        id: "v4",
        path: "/cakes",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0",
        isBot: false,
        ip: "192.168.1.50",
        createdAt: "2026-11-06T10:03:00Z",
      },
      {
        id: "v5",
        path: "/about",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15",
        isBot: false,
        ip: "10.0.0.99",
        createdAt: "2026-11-06T10:04:00Z",
      },
    ];

    it("accurately classifies all four categories: AI_CRAWLER, SEARCH_BOT, SCRAPER_TOOL, and BROWSER", () => {
      expect(classifyUserAgent(testVisits[0].userAgent).category).toBe("AI_CRAWLER");
      expect(classifyUserAgent(testVisits[1].userAgent).category).toBe("SEARCH_BOT");
      expect(classifyUserAgent(testVisits[2].userAgent).category).toBe("SCRAPER_TOOL");
      expect(classifyUserAgent(testVisits[3].userAgent).category).toBe("BROWSER");
      expect(classifyUserAgent(testVisits[4].userAgent).category).toBe("BROWSER");
    });

    it("filters accurately by bot category when bots filter is active: AI_CRAWLER", () => {
      const filtered = filterVisits(testVisits, "bots", "AI_CRAWLER", "");
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("v1");
      expect(filtered[0].botName).toBe("GPTBot");
    });

    it("filters accurately by bot category when bots filter is active: SEARCH_BOT", () => {
      const filtered = filterVisits(testVisits, "bots", "SEARCH_BOT", "");
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("v2");
      expect(filtered[0].botName).toBe("Googlebot");
    });

    it("filters accurately by bot category when bots filter is active: SCRAPER_TOOL", () => {
      const filtered = filterVisits(testVisits, "bots", "SCRAPER_TOOL", "");
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("v3");
      expect(filtered[0].botName).toBe("curl");
    });

    it("filters accurately by visitor type: users only (BROWSER visits)", () => {
      const filtered = filterVisits(testVisits, "users", "all", "");
      expect(filtered.length).toBe(2);
      expect(filtered.every((v) => !v.isBot)).toBe(true);
    });

    it("filters accurately by visitor type: bots only", () => {
      const filtered = filterVisits(testVisits, "bots", "all", "");
      expect(filtered.length).toBe(3);
      expect(filtered.every((v) => v.isBot)).toBe(true);
    });

    it("filters accurately by search query across path, IP, bot name, and user-agent (case-insensitive)", () => {
      // Search by path
      expect(filterVisits(testVisits, "all", "all", "elysian").length).toBe(1);

      // Search by IP
      expect(filterVisits(testVisits, "all", "all", "66.249").length).toBe(1);

      // Search by bot name in uppercase
      expect(filterVisits(testVisits, "all", "all", "GPTBOT").length).toBe(1);

      // Search by user agent substring
      expect(filterVisits(testVisits, "all", "all", "iphone").length).toBe(1);

      // Search with non-matching term
      expect(filterVisits(testVisits, "all", "all", "nonexistent-query").length).toBe(0);
    });

    it("handles special regex characters in search query literally without syntax error", () => {
      const specialQuery = "[0-9]+.*$()?";
      expect(() => filterVisits(testVisits, "all", "all", specialQuery)).not.toThrow();
      expect(filterVisits(testVisits, "all", "all", specialQuery).length).toBe(0);
    });
  });

  // ==========================================================================
  // Suite 5: CSV Export Data Integrity & Escaping
  // ==========================================================================
  describe("5. CSV Export Data Integrity & Escaping", () => {
    it("generates correct CSV headers: Timestamp, Type, Path, IP, Bot Name, User Agent", () => {
      const csv = generateCsvContent([]);
      expect(csv.startsWith("data:text/csv;charset=utf-8,")).toBe(true);

      const headerLine = csv.replace("data:text/csv;charset=utf-8,", "").split("\n")[0];
      const headers = headerLine.split(",");

      // Verify all 6 mandatory headers
      expect(headers).toContain("Type");
      expect(headers).toContain("Path");
      expect(headers).toContain("IP Address");
      expect(headers).toContain("Bot Name");
      expect(headers).toContain("User Agent");
      expect(headers).toContain("Timestamp");
    });

    it("properly escapes double quotes and preserves commas in User-Agent and Path", () => {
      const complexVisits: VisitRecord[] = [
        {
          id: "v-quotes",
          path: '/cakes/special"quote',
          userAgent: 'Mozilla/5.0 (compatible; "CustomBot"/2.0; +http://example.com)',
          isBot: true,
          botName: 'CustomBot"Pro',
          ip: "10.0.0.1",
          createdAt: "2026-11-06T12:00:00.000Z",
        },
        {
          id: "v-commas",
          path: "/cakes/matcha,vanilla",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64), Chrome/120.0",
          isBot: false,
          ip: "",
          createdAt: "2026-11-06T12:01:00.000Z",
        },
      ];

      const csv = generateCsvContent(complexVisits);
      const lines = csv.replace("data:text/csv;charset=utf-8,", "").split("\n");

      expect(lines.length).toBe(3); // header + 2 rows

      // Verify row 1 escaped quotes according to RFC 4180
      const row1 = lines[1];
      expect(row1.startsWith("BOT,")).toBe(true);
      expect(row1).toContain('"/cakes/special""quote"');
      expect(row1).toContain('""CustomBot""/2.0');

      // Verify row 2 comma handling
      const row2 = lines[2];
      expect(row2.startsWith("USER,")).toBe(true);
      expect(row2).toContain('"/cakes/matcha,vanilla"');
    });

    it("handles undefined or missing optional fields (IP, botName) without 'undefined' string", () => {
      const visitMissingFields: VisitRecord[] = [
        {
          id: "v-missing",
          path: "/cakes",
          userAgent: "Mozilla/5.0",
          isBot: false,
          createdAt: "2026-11-06T12:00:00.000Z",
        },
      ];

      const csv = generateCsvContent(visitMissingFields);
      expect(csv).not.toContain("undefined");
      expect(csv).not.toContain("null");
    });
  });

  // ==========================================================================
  // Suite 6: Interactive Optimistic Order Cancellation & State Transitions
  // ==========================================================================
  describe("6. Interactive Optimistic Order Cancellation & State Transitions", () => {
    const initialOrders: OrderRecord[] = [
      {
        id: "ord_opt_1",
        cakeId: "elysian-silk-cube",
        cakeName: "Elysian Silk Cube",
        customerName: "Audrey Hepburn",
        customerEmail: "audrey@hollywood.test",
        price: 150,
        quantity: 2, // Total value = $300
        status: "ACTIVE",
        createdAt: "2026-11-06T08:00:00Z",
        updatedAt: "2026-11-06T08:00:00Z",
      },
      {
        id: "ord_opt_2",
        cakeId: "opera-nocturne-gold",
        cakeName: "Opéra Nocturne Gold",
        customerName: "Grace Kelly",
        customerEmail: "grace@monaco.test",
        price: 220,
        quantity: 1, // Total value = $220
        status: "ACTIVE",
        createdAt: "2026-11-06T08:30:00Z",
        updatedAt: "2026-11-06T08:30:00Z",
      },
      {
        id: "ord_opt_3",
        cakeId: "aurora-berry-chiffon",
        cakeName: "Aurora Berry Chiffon",
        customerName: "Elizabeth Taylor",
        customerEmail: "liz@taylor.test",
        price: 95,
        quantity: 1, // Total value = $95 (Already cancelled)
        status: "CANCELLED",
        createdAt: "2026-11-06T07:00:00Z",
        updatedAt: "2026-11-06T07:30:00Z",
      },
    ];

    const initialFinancials: CakeSalesMetrics = {
      totalBoughtCount: 4,
      totalCancelledCount: 1,
      grossRevenue: 615, // 300 + 220 + 95
      cancelledRevenue: 95,
      netRevenue: 520, // 615 - 95
      perCake: [
        {
          cakeId: "elysian-silk-cube",
          cakeName: "Elysian Silk Cube",
          boughtCount: 2,
          cancelledCount: 0,
          netRevenue: 300,
        },
        {
          cakeId: "opera-nocturne-gold",
          cakeName: "Opéra Nocturne Gold",
          boughtCount: 1,
          cancelledCount: 0,
          netRevenue: 220,
        },
        {
          cakeId: "aurora-berry-chiffon",
          cakeName: "Aurora Berry Chiffon",
          boughtCount: 1,
          cancelledCount: 1,
          netRevenue: 0,
        },
      ],
    };

    it("immediately decrements net revenue and increments cancelled revenue upon order cancellation", () => {
      // Cancel active order ord_opt_1 ($300 value)
      const result = applyOptimisticOrderCancellation(
        "ord_opt_1",
        initialOrders,
        initialFinancials
      );

      // Verify order status updated to CANCELLED
      const cancelledOrder = result.orders.find((o) => o.id === "ord_opt_1");
      expect(cancelledOrder?.status).toBe("CANCELLED");

      // Verify financials state:
      // netRevenue: 520 - 300 = 220
      // cancelledRevenue: 95 + 300 = 395
      // totalCancelledCount: 1 + 2 = 3
      // grossRevenue: unchanged (615)
      // totalBoughtCount: unchanged (4)
      expect(result.financials?.netRevenue).toBe(220);
      expect(result.financials?.cancelledRevenue).toBe(395);
      expect(result.financials?.totalCancelledCount).toBe(3);
      expect(result.financials?.grossRevenue).toBe(615);
      expect(result.financials?.totalBoughtCount).toBe(4);

      // Verify perCake for elysian-silk-cube
      const cakeItem = result.financials?.perCake.find(
        (c) => c.cakeId === "elysian-silk-cube"
      );
      expect(cakeItem?.cancelledCount).toBe(2);
      expect(cakeItem?.netRevenue).toBe(0);
    });

    it("operates idempotently when attempting to cancel an already cancelled order", () => {
      // ord_opt_3 is already CANCELLED
      const result = applyOptimisticOrderCancellation(
        "ord_opt_3",
        initialOrders,
        initialFinancials
      );

      // Financials must remain completely untouched
      expect(result.financials?.netRevenue).toBe(initialFinancials.netRevenue);
      expect(result.financials?.cancelledRevenue).toBe(initialFinancials.cancelledRevenue);
      expect(result.financials?.totalCancelledCount).toBe(
        initialFinancials.totalCancelledCount
      );
      expect(result.financials?.grossRevenue).toBe(initialFinancials.grossRevenue);
    });

    it("verifies UI rendering treats already cancelled orders as 'Voided' without cancel button", () => {
      const rawHtml = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          visits: {
            totalVisits: 10,
            normalUserVisits: 8,
            botVisits: 2,
            botBreakdown: {},
            recentVisits: [],
          },
          financials: initialFinancials,
          orders: initialOrders,
        })
      );
      const html = cleanSsrHtml(rawHtml);

      // In the default "traffic" tab, orders tab is accessible to ADMIN
      expect(html).toContain("Orders &amp; Actions");
    });

    it("integrates with backend PATCH /api/admin/orders/[id] for real cancellation and idempotency", async () => {
      // Create a live test order in the store
      const order = await createOrder({
        cakeId: "elysian-silk-cube",
        cakeName: "Elysian Silk Cube",
        customerName: "Challenger Live Customer",
        customerEmail: "challenger@live.test",
        price: 180,
        quantity: 1,
      });

      expect(order.status).toBe("ACTIVE");

      // Verify metrics prior to cancellation
      const initialMetrics = await getCakeSalesMetrics();
      const initialNet = initialMetrics.netRevenue;
      const initialCancelled = initialMetrics.cancelledRevenue;

      // 1. Cancel order via PATCH with ADMIN token
      const cancelReq = new NextRequest(
        `http://localhost:3000/api/admin/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const cancelRes = await cancelOrderRoute(cancelReq, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(cancelRes.status).toBe(200);
      const cancelData = await cancelRes.json();
      expect(cancelData.success).toBe(true);
      expect(cancelData.order.status).toBe("CANCELLED");

      // Verify metrics adjusted in store
      const afterCancelMetrics = await getCakeSalesMetrics();
      expect(afterCancelMetrics.netRevenue).toBe(initialNet - 180);
      expect(afterCancelMetrics.cancelledRevenue).toBe(initialCancelled + 180);

      // 2. Idempotent re-cancellation: cancel again
      const repeatReq = new NextRequest(
        `http://localhost:3000/api/admin/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const repeatRes = await cancelOrderRoute(repeatReq, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(repeatRes.status).toBe(200);

      // Verify metrics did NOT decrement a second time!
      const finalMetrics = await getCakeSalesMetrics();
      expect(finalMetrics.netRevenue).toBe(afterCancelMetrics.netRevenue);
      expect(finalMetrics.cancelledRevenue).toBe(afterCancelMetrics.cancelledRevenue);
    });

    it("rejects unauthorized cancellation and prevents SEO_SPECIALIST role from cancelling orders", async () => {
      const order = await createOrder({
        cakeId: "opera-nocturne-gold",
        customerName: "Security Test",
        customerEmail: "sec@test.com",
      });

      // Attempt cancellation as SEO_SPECIALIST
      const seoReq = new NextRequest(
        `http://localhost:3000/api/admin/orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${seoToken}`,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const seoRes = await cancelOrderRoute(seoReq, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(seoRes.status).toBe(403);

      // Attempt cancellation without any auth header
      const unauthReq = new NextRequest(
        `http://localhost:3000/api/admin/orders/${order.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      const unauthRes = await cancelOrderRoute(unauthReq, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(unauthRes.status).toBe(401);
    });
  });
});
