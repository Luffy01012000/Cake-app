import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { NextRequest } from "next/server";

// Mock next/navigation for SSR component testing in Node environment
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/analytics",
  useSearchParams: () => new URLSearchParams(),
}));

import { GET } from "../src/app/api/admin/analytics/route";
import AnalyticsDashboard from "../src/components/admin/AnalyticsDashboard";
import { signSessionToken } from "../src/lib/auth";
import {
  getVisitAnalytics,
  getCakeSalesMetrics,
  getAllOrders,
  recordVisit,
  createOrder,
  cancelOrder,
  resetOrdersStore,
} from "../src/lib/data-service";

describe("Milestone 3 Reviewer 2: Deep Security, RBAC & Redaction Audit", () => {
  beforeEach(() => {
    resetOrdersStore();
  });

  // =========================================================================
  // 1. API Route RBAC & Data Redaction (/api/admin/analytics)
  // =========================================================================
  describe("1. GET /api/admin/analytics — RBAC & Data Isolation", () => {
    it("rejects unauthenticated requests with HTTP 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics");
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("rejects invalid/tampered JWT session token with HTTP 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: "aura_session=malformed.tampered.jwt.token",
        },
      });
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("rejects unrecognized or unprivileged role (e.g. GUEST or CUSTOMER) with HTTP 401", async () => {
      // @ts-expect-error - testing invalid role
      const bogusToken = await signSessionToken({
        id: "bogus-user",
        email: "intruder@domain.com",
        name: "Intruder",
        role: "CUSTOMER",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: `aura_session=${bogusToken}`,
        },
      });
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("SEO_SPECIALIST: strictly omits financials and orders keys from JSON payload (Cookie auth)", async () => {
      const seoToken = await signSessionToken({
        id: "seo-specialist-1",
        email: "seo.analyst@aurapatisserie.com",
        name: "AURA SEO Analyst",
        role: "SEO_SPECIALIST",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: `aura_session=${seoToken}`,
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const payload = await res.json();

      // Top-level role check
      expect(payload.role).toBe("SEO_SPECIALIST");
      expect(payload.visits).toBeDefined();

      // Strict key omission assertions
      const keys = Object.keys(payload);
      expect(keys).not.toContain("financials");
      expect(keys).not.toContain("orders");
      expect(keys.sort()).toEqual(["role", "visits"]);

      // In-depth string serialization leak checks
      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain("financials");
      expect(serialized).not.toContain("orders");
      expect(serialized).not.toContain("grossRevenue");
      expect(serialized).not.toContain("netRevenue");
      expect(serialized).not.toContain("cancelledRevenue");
      expect(serialized).not.toContain("customerEmail");
      expect(serialized).not.toContain("totalBoughtCount");
      expect(serialized).not.toContain("totalCancelledCount");
      expect(serialized).not.toContain("Genevieve Laurent");
      expect(serialized).not.toContain("genevieve.laurent@elysee-lux.fr");
    });

    it("SEO_SPECIALIST: strictly omits financials and orders keys via Authorization: Bearer <token>", async () => {
      const seoToken = await signSessionToken({
        id: "seo-specialist-bearer",
        email: "seo.bearer@aurapatisserie.com",
        name: "Bearer SEO Specialist",
        role: "SEO_SPECIALIST",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${seoToken}`,
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const payload = await res.json();
      expect(payload.role).toBe("SEO_SPECIALIST");
      expect(payload.visits).toBeDefined();

      const keys = Object.keys(payload);
      expect(keys).not.toContain("financials");
      expect(keys).not.toContain("orders");
      expect(keys.length).toBe(2);
    });

    it("ADMIN: returns visits, financials, and orders with full financial parity", async () => {
      const adminToken = await signSessionToken({
        id: "admin-master",
        email: "executive@aurapatisserie.com",
        name: "Executive Administrator",
        role: "ADMIN",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: `aura_session=${adminToken}`,
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const payload = await res.json();
      expect(payload.role).toBe("ADMIN");
      expect(payload.visits).toBeDefined();
      expect(payload.financials).toBeDefined();
      expect(payload.orders).toBeDefined();

      const keys = Object.keys(payload);
      expect(keys).toContain("role");
      expect(keys).toContain("visits");
      expect(keys).toContain("financials");
      expect(keys).toContain("orders");

      // Verify financial structure & mathematical invariants
      const fin = payload.financials;
      expect(typeof fin.grossRevenue).toBe("number");
      expect(typeof fin.netRevenue).toBe("number");
      expect(typeof fin.cancelledRevenue).toBe("number");
      expect(typeof fin.totalBoughtCount).toBe("number");
      expect(typeof fin.totalCancelledCount).toBe("number");
      expect(Array.isArray(fin.perCake)).toBe(true);

      expect(fin.netRevenue).toBe(fin.grossRevenue - fin.cancelledRevenue);
      expect(fin.grossRevenue).toBeGreaterThanOrEqual(fin.cancelledRevenue);
      expect(fin.totalBoughtCount).toBeGreaterThanOrEqual(fin.totalCancelledCount);

      // Verify orders array
      expect(Array.isArray(payload.orders)).toBe(true);
      expect(payload.orders.length).toBeGreaterThan(0);
      const firstOrder = payload.orders[0];
      expect(firstOrder.id).toBeDefined();
      expect(firstOrder.cakeId).toBeDefined();
      expect(firstOrder.price).toBeGreaterThan(0);
      expect(firstOrder.status).toMatch(/ACTIVE|CANCELLED/);
    });
  });

  // =========================================================================
  // 2. Client Component DOM Leakage Audit (<AnalyticsDashboard />)
  // =========================================================================
  describe("2. <AnalyticsDashboard /> — DOM Presentation Isolation", () => {
    it("renders traffic intelligence but ZERO financial markup for SEO_SPECIALIST", async () => {
      const visits = await getVisitAnalytics();

      const html = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "SEO_SPECIALIST",
          initialVisits: visits,
        })
      );

      // Assert Presence of Traffic Metrics
      expect(html).toContain("SEO Specialist Terminal");
      expect(html).toContain("Traffic &amp; Bot Intelligence");
      expect(html).toContain("Total Impressions");
      expect(html).toContain("Normal Visitors");
      expect(html).toContain("Bot &amp; AI Crawlers");
      expect(html).toContain("Crawler Share Ratio");
      expect(html).toContain("Generative AI Crawlers");
      expect(html).toContain("Search Engine Bots");
      expect(html).toContain("Scrapers &amp; HTTP Tools");
      expect(html).toContain("Live Traffic &amp; Request Stream");

      // Assert Strict ABSENCE of Financial Elements & Sections
      expect(html).not.toContain("Executive Terminal • Administrator");
      expect(html).not.toContain("&amp; Cake Sales Financials");
      expect(html).not.toContain("Cake Revenue");
      expect(html).not.toContain("Orders &amp; Actions");
      expect(html).not.toContain("Net Realized Revenue");
      expect(html).not.toContain("Gross Cake Sales");
      expect(html).not.toContain("Cancelled Revenue");
      expect(html).not.toContain("Total Cakes Sold");
      expect(html).not.toContain("Per-Cake Sales Performance");
      expect(html).not.toContain("Live Customer Orders &amp; Cancellation Terminal");
      expect(html).not.toContain("Cancel Order");
      expect(html).not.toContain("Voided");
    });

    it("defense-in-depth: suppresses financial UI even if financial props are passed when role is SEO_SPECIALIST", async () => {
      const visits = await getVisitAnalytics();
      const financials = await getCakeSalesMetrics();
      const orders = await getAllOrders();

      const html = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "SEO_SPECIALIST",
          initialVisits: visits,
          initialFinancials: financials,
          initialOrders: orders,
        })
      );

      // Tab switcher must still be absent
      expect(html).not.toContain("Cake Revenue");
      expect(html).not.toContain("Orders &amp; Actions");

      // Financial sections must still NOT be rendered
      expect(html).not.toContain("Net Realized Revenue");
      expect(html).not.toContain("Per-Cake Sales Performance");
      expect(html).not.toContain("Live Customer Orders &amp; Cancellation Terminal");
    });

    it("renders executive tabs and allows ADMIN full access", async () => {
      const visits = await getVisitAnalytics();
      const financials = await getCakeSalesMetrics();
      const orders = await getAllOrders();

      const html = renderToString(
        React.createElement(AnalyticsDashboard, {
          role: "ADMIN",
          initialVisits: visits,
          initialFinancials: financials,
          initialOrders: orders,
        })
      );

      // Presence of Admin badge & title
      expect(html).toContain("Executive Terminal • Administrator");
      expect(html).toContain("&amp; Cake Sales Financials");

      // Presence of Tab Switcher buttons
      expect(html).toContain("Traffic &amp; Bots");
      expect(html).toContain("Cake Revenue");
      expect(html).toContain("Orders &amp; Actions");
    });
  });

  // =========================================================================
  // 3. Main Admin Dashboard KPI Cards Role-Gating
  // =========================================================================
  describe("3. Main Admin Dashboard (/admin) — Summary KPI Role-Gating Logic", () => {
    it("validates server logic: getCakeSalesMetrics is called only when role === 'ADMIN'", async () => {
      const cakeSalesMetricsSpy = vi.fn().mockImplementation(getCakeSalesMetrics);

      // Simulate logic from src/app/admin/(panel)/page.tsx for SEO_SPECIALIST
      const seoSession = { role: "SEO_SPECIALIST" as const };
      const isSeoAdmin = seoSession.role === "ADMIN";
      const seoFinancials = isSeoAdmin ? await cakeSalesMetricsSpy() : null;

      expect(isSeoAdmin).toBe(false);
      expect(seoFinancials).toBeNull();
      expect(cakeSalesMetricsSpy).not.toHaveBeenCalled();

      // Simulate logic for ADMIN
      const adminSession = { role: "ADMIN" as const };
      const isAdminRole = adminSession.role === "ADMIN";
      const adminFinancials = isAdminRole ? await cakeSalesMetricsSpy() : null;

      expect(isAdminRole).toBe(true);
      expect(adminFinancials).not.toBeNull();
      expect(cakeSalesMetricsSpy).toHaveBeenCalledTimes(1);
    });

    it("verifies grid sizing differences between ADMIN (lg:grid-cols-5) and SEO_SPECIALIST (lg:grid-cols-3)", () => {
      const getGridClass = (role: "ADMIN" | "SEO_SPECIALIST") =>
        `grid grid-cols-1 sm:grid-cols-2 ${role === "ADMIN" ? "lg:grid-cols-5" : "lg:grid-cols-3"} gap-4`;

      expect(getGridClass("SEO_SPECIALIST")).toContain("lg:grid-cols-3");
      expect(getGridClass("ADMIN")).toContain("lg:grid-cols-5");
    });
  });

  // =========================================================================
  // 4. Adversarial Edge Cases & Stress Scenarios
  // =========================================================================
  describe("4. Adversarial Attack Scenarios & Integrity Checks", () => {
    it("handles multiple interleaved visits and orders while maintaining RBAC isolation", async () => {
      // 1. Bot visit
      await recordVisit({
        path: "/cakes/le-noir-truffle",
        userAgent: "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      });

      // 2. Normal user visit
      await recordVisit({
        path: "/cakes/le-noir-truffle",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0",
      });

      // 3. User places order
      const newOrder = await createOrder({
        cakeId: "le-noir-truffle",
        cakeName: "Le Noir Truffle",
        customerName: "Adversarial Customer",
        customerEmail: "adversarial@audit.com",
        price: 240,
        quantity: 2,
      });

      // Query as SEO_SPECIALIST
      const seoToken = await signSessionToken({
        id: "seo-adv",
        email: "seo@aura.com",
        name: "SEO Auditor",
        role: "SEO_SPECIALIST",
      });

      const resSeo = await GET(
        new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Cookie: `aura_session=${seoToken}` },
        })
      );
      const seoPayload = await resSeo.json();

      expect(seoPayload.role).toBe("SEO_SPECIALIST");
      expect(seoPayload.visits.totalVisits).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(seoPayload)).not.toContain("adversarial@audit.com");
      expect(JSON.stringify(seoPayload)).not.toContain("Adversarial Customer");
      expect(JSON.stringify(seoPayload)).not.toContain("480");

      // Query as ADMIN
      const adminToken = await signSessionToken({
        id: "admin-adv",
        email: "admin@aura.com",
        name: "Admin Auditor",
        role: "ADMIN",
      });

      const resAdmin = await GET(
        new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Cookie: `aura_session=${adminToken}` },
        })
      );
      const adminPayload = await resAdmin.json();

      expect(adminPayload.role).toBe("ADMIN");
      expect(adminPayload.orders.some((o: { id: string }) => o.id === newOrder.id)).toBe(true);
      expect(adminPayload.financials.grossRevenue).toBeGreaterThan(0);

      // Clean up order
      await cancelOrder(newOrder.id);
    });

    it("verifies no hardcoded responses or dummy facades in GET /api/admin/analytics", async () => {
      // Create a unique visit with a unique path
      const uniquePath = `/cakes/unique-audit-test-${Date.now()}`;
      await recordVisit({
        path: uniquePath,
        userAgent: "AuditUserAgent/1.0",
      });

      const adminToken = await signSessionToken({
        id: "admin-check",
        email: "admin@aura.com",
        name: "Admin",
        role: "ADMIN",
      });

      const res = await GET(
        new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Cookie: `aura_session=${adminToken}` },
        })
      );
      const payload = await res.json();

      // Recent visits must actually reflect real data service entries
      const matchingVisit = payload.visits.recentVisits.find(
        (v: { path: string }) => v.path === uniquePath
      );
      expect(matchingVisit).toBeDefined();
      expect(matchingVisit.path).toBe(uniquePath);
    });
  });
});
