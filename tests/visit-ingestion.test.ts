import { describe, it, expect, beforeEach } from "vitest";
import { NextFetchEvent, NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { POST as trackHandler, GET as trackGetHandler } from "../src/app/api/analytics/track/route";
import {
  getVisitAnalytics,
  resetVisitsStore,
} from "../src/lib/data-service";
import {
  isBot,
  getBotCategory,
  formatBotCategoryLabel,
} from "../src/lib/visit-utils";

describe("Next.js 16 Proxy Visit Ingestion (src/proxy.ts)", () => {
  beforeEach(() => {
    resetVisitsStore();
  });

  it("records normal browser visits with 200 status", async () => {
    const statsBefore = await getVisitAnalytics();
    const req = new NextRequest("http://localhost:3000/cakes", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(200);

    const statsAfter = await getVisitAnalytics();
    expect(statsAfter.normalUserVisits).toBe(statsBefore.normalUserVisits + 1);
    expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits + 1);
  });

  it("records AI crawler visits and updates bot breakdown", async () => {
    const statsBefore = await getVisitAnalytics();
    const req = new NextRequest("http://localhost:3000/cakes/elysian-wedding-tier", {
      headers: {
        "user-agent":
          "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(200);

    const statsAfter = await getVisitAnalytics();
    expect(statsAfter.botVisits).toBe(statsBefore.botVisits + 1);
    expect(statsAfter.botBreakdown["GPTBot"]).toBe(
      (statsBefore.botBreakdown["GPTBot"] || 0) + 1
    );
  });

  it("filters out next-router-prefetch requests without recording visits", async () => {
    const statsBefore = await getVisitAnalytics();
    const req = new NextRequest("http://localhost:3000/cakes/blush-seraphina-birthday", {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "next-router-prefetch": "1",
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(200);

    const statsAfter = await getVisitAnalytics();
    expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
  });

  it("filters out purpose: prefetch headers without recording visits", async () => {
    const statsBefore = await getVisitAnalytics();
    const req = new NextRequest("http://localhost:3000/occasions/weddings", {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        purpose: "prefetch",
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(200);

    const statsAfter = await getVisitAnalytics();
    expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
  });

  it("skips internal API routes, static assets, and metadata endpoints", async () => {
    const statsBefore = await getVisitAnalytics();
    const pathsToSkip = [
      "http://localhost:3000/api/admin/status",
      "http://localhost:3000/api/analytics/track",
      "http://localhost:3000/_next/static/chunks/main.js",
      "http://localhost:3000/favicon.ico",
      "http://localhost:3000/robots.txt",
      "http://localhost:3000/sitemap.xml",
    ];

    for (const url of pathsToSkip) {
      const req = new NextRequest(url, {
        headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      const res = await proxy(req);
      expect(res.status).toBe(200);
    }

    const statsAfter = await getVisitAnalytics();
    expect(statsAfter.totalVisits).toBe(statsBefore.totalVisits);
  });

  it("executes event.waitUntil when NextFetchEvent is provided", async () => {
    let promisePassedToWaitUntil: Promise<unknown> | null = null;
    const fakeEvent = {
      waitUntil: (p: Promise<unknown>) => {
        promisePassedToWaitUntil = p;
      },
    };

    const req = new NextRequest("http://localhost:3000/about", {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
      },
    });

    const res = await proxy(req, fakeEvent as unknown as NextFetchEvent);
    expect(res.status).toBe(200);
    expect(promisePassedToWaitUntil).not.toBeNull();

    await promisePassedToWaitUntil;
    const stats = await getVisitAnalytics();
    const recent = stats.recentVisits[0];
    expect(recent.path).toBe("/about");
  });
});

describe("Client Tracking Endpoint (src/app/api/analytics/track/route.ts)", () => {
  beforeEach(() => {
    resetVisitsStore();
  });

  it("ingests visit with full custom JSON payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        path: "/occasions/galas",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
        ip: "203.0.113.195",
      }),
    });

    const res = await trackHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.visit.path).toBe("/occasions/galas");
    expect(body.visit.isBot).toBe(false);
    expect(body.visit.ip).toBe("203.0.113.195");
  });

  it("falls back to referer header and user-agent header when body fields are missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      headers: {
        "user-agent": "ClaudeBot/1.0; +claudebot@anthropic.com",
        referer: "http://localhost:3000/cakes/solaris-gala-architectural",
      },
      body: JSON.stringify({}),
    });

    const res = await trackHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.visit.path).toBe("/cakes/solaris-gala-architectural");
    expect(body.visit.isBot).toBe(true);
    expect(body.visit.botName).toBe("ClaudeBot");
  });

  it("handles malformed JSON body gracefully", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/track", {
      method: "POST",
      headers: {
        "user-agent": "curl/8.4.0",
      },
      body: "invalid-json-content",
    });

    const res = await trackHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.visit.path).toBe("/");
    expect(body.visit.isBot).toBe(true);
    expect(body.visit.botName).toBe("curl");
  });

  it("rejects GET requests with 405 Method Not Allowed", async () => {
    const res = await trackGetHandler();
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toContain("Method not allowed");
  });
});

describe("User-Agent Helper Utilities (src/lib/visit-utils.ts)", () => {
  it("exports convenience helpers isBot and getBotCategory", () => {
    expect(isBot("curl/8.0")).toBe(true);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0")).toBe(false);

    expect(getBotCategory("GPTBot/1.0")).toBe("AI_CRAWLER");
    expect(getBotCategory("Googlebot/2.1")).toBe("SEARCH_BOT");
    expect(getBotCategory("curl/7.68")).toBe("SCRAPER_TOOL");
    expect(getBotCategory("Mozilla/5.0 Safari/604.1")).toBe("BROWSER");
  });

  it("formats human-friendly bot category labels", () => {
    expect(formatBotCategoryLabel("BROWSER")).toBe("Normal User");
    expect(formatBotCategoryLabel("AI_CRAWLER")).toBe("AI Crawler");
    expect(formatBotCategoryLabel("SEARCH_BOT")).toBe("Search Bot");
    expect(formatBotCategoryLabel("SCRAPER_TOOL")).toBe("Scraper / Tool");
    // @ts-expect-error - testing invalid category fallback
    expect(formatBotCategoryLabel("OTHER")).toBe("Unknown");
  });
});
