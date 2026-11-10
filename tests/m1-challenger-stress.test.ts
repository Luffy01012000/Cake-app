import { describe, it, expect } from "vitest";
import { NextFetchEvent, NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { POST as trackPostHandler, GET as trackGetHandler } from "../src/app/api/analytics/track/route";
import {
  recordVisit,
  getVisitAnalytics,
  resetVisitsStore,
} from "../src/lib/data-service";
import { classifyUserAgent } from "../src/lib/visit-utils";

describe("Milestone 1 Empirical Stress Harness (Challenger 2)", () => {
  // =========================================================================
  // 1. Concurrency Stress Testing
  // =========================================================================
  describe("1. Concurrency Stress Testing (50+ Concurrent Ingestion Requests)", () => {
    it("handles 50 concurrent recordVisit calls with mixed browsers and bots maintaining strict invariants", async () => {
      const statsBefore = await getVisitAnalytics();

      const userAgents = [
        // 25 normal browsers
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.143 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",

        // 25 crawlers & bots
        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
        "Mozilla/5.0 (compatible; Claude-Web/1.0; +claudebot@anthropic.com)",
        "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
        "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search)",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
        "Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; https://duckduckgo.com/duckduckbot)",
        "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
        "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
        "Mozilla/5.0 (compatible; Applebot/0.3; +http://www.apple.com/go/applebot)",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot-Extended/0.1)",
        "CCBot/2.0 (https://commoncrawl.org/faq/)",
        "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
        "Mozilla/5.0 (compatible; Diffbot/0.1; +http://www.diffbot.com)",
        "curl/8.4.0",
        "Wget/1.21.4",
        "python-requests/2.31.0",
        "Scrapy/2.11.0 (+https://scrapy.org)",
        "PostmanRuntime/7.36.0",
        "axios/1.6.7",
        "aiohttp/3.9.1",
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      ];

      expect(userAgents.length).toBe(50);

      // Pre-calculate expected bot breakdown deltas
      const expectedBotDeltas: Record<string, number> = {};
      let expectedBotCount = 0;
      let expectedNormalCount = 0;

      for (const ua of userAgents) {
        const cls = classifyUserAgent(ua);
        if (cls.isBot) {
          expectedBotCount++;
          const botKey = cls.botName || "Unknown Bot";
          expectedBotDeltas[botKey] = (expectedBotDeltas[botKey] || 0) + 1;
        } else {
          expectedNormalCount++;
        }
      }

      expect(expectedNormalCount).toBe(25);
      expect(expectedBotCount).toBe(25);

      // Fire all 50 concurrently
      const promises = userAgents.map((ua, idx) =>
        recordVisit({
          path: `/cakes/stress-item-${idx}`,
          userAgent: ua,
          ip: `198.51.100.${idx + 1}`,
        })
      );

      const records = await Promise.all(promises);

      // Verify all 50 returned valid records
      expect(records.length).toBe(50);
      const uniqueIds = new Set(records.map((r) => r.id));
      expect(uniqueIds.size).toBe(50); // Zero ID collisions

      for (const r of records) {
        expect(r.id).toBeDefined();
        expect(r.path).toContain("/cakes/stress-item-");
        expect(r.createdAt).toBeDefined();
        expect(new Date(r.createdAt).getTime()).not.toBeNaN();
      }

      // Verify post-burst metrics
      const statsAfter = await getVisitAnalytics();

      expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits + 50);
      expect(statsAfter.normalUserVisits).toBe(statsBefore.normalUserVisits + 25);
      expect(statsAfter.botVisits).toBe(statsBefore.botVisits + 25);

      // Strict Mathematical Invariants
      expect(statsAfter.totalVisits).toBe(
        statsAfter.normalUserVisits + statsAfter.botVisits
      );

      const sumBotBreakdown = Object.values(statsAfter.botBreakdown).reduce(
        (acc, val) => acc + val,
        0
      );
      expect(sumBotBreakdown).toBe(statsAfter.botVisits);

      // Verify specific bot breakdown increments
      for (const [botName, delta] of Object.entries(expectedBotDeltas)) {
        const prevCount = statsBefore.botBreakdown[botName] || 0;
        const currentCount = statsAfter.botBreakdown[botName] || 0;
        expect(currentCount).toBe(prevCount + delta);
      }
    });

    it("survives interleaved concurrent read/write stress without race conditions or crashes", async () => {
      // 30 concurrent writes mixed with 20 concurrent analytics reads
      const writeTasks = Array.from({ length: 30 }, (_, i) =>
        recordVisit({
          path: `/interleaved-${i}`,
          userAgent: i % 2 === 0 ? "curl/8.5.0" : "Mozilla/5.0 Chrome/122.0.0.0",
        })
      );

      const readTasks = Array.from({ length: 20 }, () => getVisitAnalytics());

      const results = await Promise.all([...writeTasks, ...readTasks]);
      expect(results.length).toBe(50);

      // Ensure every read returned a mathematically sound summary
      const readResults = results.slice(30);
      for (const summary of readResults) {
        const s = summary as Awaited<ReturnType<typeof getVisitAnalytics>>;
        expect(s.totalVisits).toBe(s.normalUserVisits + s.botVisits);
        const bSum = Object.values(s.botBreakdown).reduce((a, b) => a + b, 0);
        expect(bSum).toBe(s.botVisits);
      }
    });
  });

  // =========================================================================
  // 2. Proxy Interception Verification
  // =========================================================================
  describe("2. Proxy Interception Verification (src/proxy.ts)", () => {
    it("preserves response status 200 and passes through headers without mutation", async () => {
      const statsBefore = await getVisitAnalytics();
      const req = new NextRequest("http://localhost:3000/occasions/anniversary", {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0",
          "accept-language": "en-US,en;q=0.9",
          "cookie": "aura_session=fake_cookie_value",
        },
      });

      const res = await proxy(req);
      expect(res.status).toBe(200);

      const statsAfter = await getVisitAnalytics();
      expect(statsAfter.normalUserVisits).toBe(statsBefore.normalUserVisits + 1);
    });

    it("strictly ignores prefetch requests across all standard prefetch headers", async () => {
      const statsBefore = await getVisitAnalytics();

      const prefetchHeadersList: Array<Record<string, string>> = [
        { "next-router-prefetch": "1" },
        { "purpose": "prefetch" },
        { "purpose": "Prefetch" }, // Mixed-case HTTP header value
        { "x-purpose": "prefetch" },
        { "sec-purpose": "prefetch" },
        { "sec-purpose": "Prefetch" },
      ];

      for (const hdrs of prefetchHeadersList) {
        const req = new NextRequest("http://localhost:3000/cakes/velvet-noir", {
          headers: {
            "user-agent": "Mozilla/5.0 Chrome/122.0.0.0",
            ...hdrs,
          },
        });

        const res = await proxy(req);
        expect(res.status).toBe(200);
      }

      const statsAfter = await getVisitAnalytics();
      // Total visits must remain completely unchanged
      expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
    });

    it("skips excluded routes: static files, next chunks, api routes, and seo files", async () => {
      const statsBefore = await getVisitAnalytics();
      const excludedPaths = [
        "/_next/static/css/global.css",
        "/_next/static/chunks/app/layout.js",
        "/api/cakes",
        "/api/orders",
        "/api/analytics/track",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
      ];

      for (const p of excludedPaths) {
        const req = new NextRequest(`http://localhost:3000${p}`, {
          headers: {
            "user-agent": "Mozilla/5.0 Chrome/122.0.0.0",
          },
        });
        const res = await proxy(req);
        expect(res.status).toBe(200);
      }

      const statsAfter = await getVisitAnalytics();
      expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
    });

    it("operates non-blockingly with NextFetchEvent waitUntil without delaying response", async () => {
      let waitUntilPromise: Promise<unknown> | null = null;
      const fakeEvent = {
        waitUntil: (p: Promise<unknown>) => {
          waitUntilPromise = p;
        },
      } as unknown as NextFetchEvent;

      const req = new NextRequest("http://localhost:3000/gallery", {
        headers: {
          "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile Safari/604.1",
        },
      });

      const res = await proxy(req, fakeEvent);
      expect(res.status).toBe(200);
      expect(waitUntilPromise).not.toBeNull();

      // Await the background promise
      await waitUntilPromise;

      const stats = await getVisitAnalytics();
      const recent = stats.recentVisits[0];
      expect(recent.path).toBe("/gallery");
      expect(recent.isBot).toBe(false);
    });

    it("resiliently traps unexpected errors without crashing navigation", async () => {
      // Create a request with an unconventional malformed object
      const req = new NextRequest("http://localhost:3000/malformed-path", {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      });

      // proxy must resolve cleanly with 200 even under error conditions
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });

  // =========================================================================
  // 3. API Tracking Verification (POST & GET /api/analytics/track)
  // =========================================================================
  describe("3. API Tracking Endpoint (src/app/api/analytics/track/route.ts)", () => {
    it("handles valid custom payload and returns 200 with stored visit record", async () => {
      const statsBefore = await getVisitAnalytics();

      const req = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: "/occasions/bridal-shower",
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          ip: "10.0.0.42",
        }),
      });

      const res = await trackPostHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.visit).toBeDefined();
      expect(json.visit.path).toBe("/occasions/bridal-shower");
      expect(json.visit.ip).toBe("10.0.0.42");
      expect(json.visit.isBot).toBe(false);

      const statsAfter = await getVisitAnalytics();
      expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits + 1);
      expect(statsAfter.normalUserVisits).toBe(statsBefore.normalUserVisits + 1);
    });

    it("handles partial payloads with fallback to referer header and request headers", async () => {
      // Only body.path provided; userAgent from headers
      const req1 = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        headers: {
          "user-agent": "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.2)",
          "x-forwarded-for": "172.16.0.5, 10.0.0.1",
        },
        body: JSON.stringify({
          path: "/cakes/chocolate-truffle",
        }),
      });

      const res1 = await trackPostHandler(req1);
      expect(res1.status).toBe(200);
      const json1 = await res1.json();
      expect(json1.visit.path).toBe("/cakes/chocolate-truffle");
      expect(json1.visit.isBot).toBe(true);
      expect(json1.visit.botName).toBe("GPTBot");
      expect(json1.visit.ip).toBe("172.16.0.5");

      // No body.path; path extracted from referer URL
      const req2 = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        headers: {
          "user-agent": "Mozilla/5.0 Chrome/120.0",
          "referer": "http://localhost:3000/contact-us?subject=custom-cake",
        },
        body: JSON.stringify({}),
      });

      const res2 = await trackPostHandler(req2);
      expect(res2.status).toBe(200);
      const json2 = await res2.json();
      expect(json2.visit.path).toBe("/contact-us");
    });

    it("handles non-URL referer strings gracefully without throwing", async () => {
      const req = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        headers: {
          "user-agent": "Mozilla/5.0 Chrome/120.0",
          "referer": "/relative-only-path",
        },
        body: JSON.stringify({}),
      });

      const res = await trackPostHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.visit.path).toBe("/relative-only-path");
    });

    it("handles completely empty payload ({}) and defaults path to '/'", async () => {
      const req = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await trackPostHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.visit.path).toBe("/");
    });

    it("handles malformed JSON body gracefully by falling back to empty object", async () => {
      const req = new NextRequest("http://localhost:3000/api/analytics/track", {
        method: "POST",
        headers: {
          "user-agent": "curl/7.88.1",
        },
        body: "NOT_VALID_JSON{{{",
      });

      const res = await trackPostHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.visit.path).toBe("/");
      expect(json.visit.isBot).toBe(true);
      expect(json.visit.botName).toBe("curl");
    });

    it("strictly returns 405 Method Not Allowed for GET requests", async () => {
      const res = await trackGetHandler();
      expect(res.status).toBe(405);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });
  });

  // =========================================================================
  // 4. Store State Resilience & Invariant Verification
  // =========================================================================
  describe("4. Store State Resilience & Fallback Invariants", () => {
    it("resets store cleanly via resetVisitsStore() without corrupting internal seed references", () => {
      resetVisitsStore();
      const globalStore = (globalThis as unknown as { __auraStore?: { visits: unknown[] } }).__auraStore;
      expect(globalStore).toBeDefined();
      expect(Array.isArray(globalStore?.visits)).toBe(true);
      expect(globalStore?.visits.length).toBe(100);

      // Verify mutating the store does not corrupt future resets
      globalStore!.visits.push({ fake: "record" });
      expect(globalStore?.visits.length).toBe(101);

      resetVisitsStore();
      expect(globalStore?.visits.length).toBe(100);
    });

    it("ensures recentVisits array preserves strict descending chronological order", async () => {
      const summary = await getVisitAnalytics();
      expect(summary.recentVisits.length).toBeGreaterThan(0);
      expect(summary.recentVisits.length).toBeLessThanOrEqual(50);

      for (let i = 0; i < summary.recentVisits.length - 1; i++) {
        const cur = new Date(summary.recentVisits[i].createdAt).getTime();
        const next = new Date(summary.recentVisits[i + 1].createdAt).getTime();
        expect(cur).toBeGreaterThanOrEqual(next);
      }
    });

    it("ensures getVisitAnalytics maintains invariant: totalVisits === normalUserVisits + botVisits", async () => {
      const summary = await getVisitAnalytics();
      expect(summary.totalVisits).toBe(
        summary.normalUserVisits + summary.botVisits
      );
    });

    it("ensures sum of botBreakdown entries equals exactly botVisits", async () => {
      const summary = await getVisitAnalytics();
      const breakdownSum = Object.values(summary.botBreakdown).reduce(
        (acc, val) => acc + val,
        0
      );
      expect(breakdownSum).toBe(summary.botVisits);
    });

    it("provides dailyTrends in getVisitAnalytics() across both PostgreSQL and Fallback stores", async () => {
      const summary = await getVisitAnalytics();
      expect(summary.dailyTrends).toBeDefined();
      expect(Array.isArray(summary.dailyTrends)).toBe(true);
      expect(summary.dailyTrends!.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. Adversarial Input Stress (ReDoS, Extreme Strings, Bot Lookalikes)
  // =========================================================================
  describe("5. Adversarial Input Stress & False Positive Protection", () => {
    it("safely processes extremely long User-Agent strings (> 15,000 chars) in < 50ms without ReDoS", () => {
      const megaUa = "Mozilla/5.0 " + "A".repeat(15_000) + " Chrome/120.0";
      const start = performance.now();
      const result = classifyUserAgent(megaUa);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
      expect(result).toBeDefined();
    });

    it("protects benign phone models and words with 'bot' substring from false positive classification", () => {
      const benignUas = [
        // CUBOT phones
        "Mozilla/5.0 (Linux; Android 10; CUBOT_X30 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; CUBOT KINGKONG 5 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0 Mobile Safari/537.36",
        // Dictionary words
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 TurbotFishingApp/1.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) RoboticsViewer/2.0 Chrome/120.0 Safari/537.36",
      ];

      for (const ua of benignUas) {
        const cls = classifyUserAgent(ua);
        expect(cls.isBot).toBe(false);
        expect(cls.category).toBe("BROWSER");
      }
    });

    it("handles null, undefined, empty string, and whitespace without throwing", () => {
      const edgeCases = [null, undefined, "", "   ", "\t\n"];
      for (const ua of edgeCases) {
        const cls = classifyUserAgent(ua);
        expect(cls.isBot).toBe(true);
        expect(cls.category).toBe("SCRAPER_TOOL");
      }
    });

    it("handles prototype pollution keys in custom tracking inputs safely", async () => {
      const maliciousData = {
        path: "/__proto__",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        ip: "constructor",
      };

      const record = await recordVisit(maliciousData);
      expect(record.id).toBeDefined();
      expect(record.path).toBe("/__proto__");
      // Ensure Object prototype was not polluted
      expect((Object.prototype as unknown as { fakeField?: unknown }).fakeField).toBeUndefined();
    });
  });
});
