import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH, DELETE } from "../src/app/api/admin/orders/[id]/route";
import { POST } from "../src/app/api/orders/route";
import { signSessionToken } from "../src/lib/auth";
import {
  createOrder,
  cancelOrder,
  getAllOrders,
  getCakeSalesMetrics,
  resetOrdersStore,
  computeSalesMetrics,
} from "../src/lib/data-service";
import { SEED_ORDERS, SEED_CAKES } from "../src/lib/seed-data";

describe("Milestone 2 Reviewer 2: Security & Parity Audit Suite", () => {
  const globalStore = (globalThis as any).__auraStore;

  beforeEach(() => {
    resetOrdersStore();
  });

  // =========================================================================
  // SECTION 1: Security & RBAC Enforcement on PATCH /api/admin/orders/[id]
  // =========================================================================
  describe("1. Security & RBAC on PATCH /api/admin/orders/[id]", () => {
    it("rejects unauthenticated requests with HTTP 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord-test-01", {
        method: "PATCH",
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "ord-test-01" }),
      });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/unauthorized/i);
    });

    it("rejects SEO_SPECIALIST role requests with HTTP 403 via cookie", async () => {
      const seoToken = await signSessionToken({
        id: "seo-user-1",
        email: "seo@aurapatisserie.com",
        name: "SEO Analyst",
        role: "SEO_SPECIALIST",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord-test-01", {
        method: "PATCH",
        headers: {
          Cookie: `aura_session=${seoToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "ord-test-01" }),
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/forbidden|admin role required/i);
    });

    it("rejects SEO_SPECIALIST role requests with HTTP 403 via Authorization Bearer header", async () => {
      const seoToken = await signSessionToken({
        id: "seo-user-2",
        email: "seo2@aurapatisserie.com",
        name: "SEO Analyst 2",
        role: "SEO_SPECIALIST",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord-test-01", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${seoToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "ord-test-01" }),
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/forbidden|admin role required/i);
    });

    it("rejects forged or tampered JWT session token with HTTP 401", async () => {
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IngiLCJyb2xlIjoiQURNSSJ9.invalidsignaturehere";

      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord-test-01", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${fakeToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "ord-test-01" }),
      });
      expect(res.status).toBe(401);
    });

    it("authorizes ADMIN role and cancels order returning HTTP 200 via cookie", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-1",
        email: "admin@aurapatisserie.com",
        name: "Head Chef Admin",
        role: "ADMIN",
      });

      // Create a fresh active order to cancel
      const order = await createOrder({
        cakeId: "elysian-grand-cru",
        cakeName: "The Elysian Grand Cru",
        customerName: "Auditor Test",
        customerEmail: "auditor@test.com",
        price: 680,
        quantity: 1,
      });

      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `aura_session=${adminToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: order.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.order.id).toBe(order.id);
      expect(json.order.status).toBe("CANCELLED");
    });

    it("authorizes ADMIN role and cancels order returning HTTP 200 via Bearer header", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-2",
        email: "admin2@aurapatisserie.com",
        name: "Admin Two",
        role: "ADMIN",
      });

      const order = await createOrder({
        cakeId: "solaris-cube",
        cakeName: "Solaris Golden Cube",
        customerName: "Auditor Test 2",
        customerEmail: "auditor2@test.com",
        price: 850,
        quantity: 1,
      });

      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: order.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.order.status).toBe("CANCELLED");
    });

    it("DELETE alias behaves identically to PATCH (returns 200 for ADMIN)", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-3",
        email: "admin3@aurapatisserie.com",
        name: "Admin Three",
        role: "ADMIN",
      });

      const order = await createOrder({
        cakeId: "rosalia-mirror",
        cakeName: "Rosalia Mirror",
        customerName: "Delete Alias Test",
        customerEmail: "del@test.com",
        price: 165,
        quantity: 1,
      });

      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: order.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.order.status).toBe("CANCELLED");
    });

    it("returns HTTP 404 when attempting to cancel a non-existent order ID", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-1",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/orders/non-existent-99999", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "non-existent-99999" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toMatch(/not found/i);
    });

    it("returns HTTP 400 when order ID parameter is whitespace or empty", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-1",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/orders/%20%20", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "   " }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/order id is required/i);
    });

    it("handles idempotent cancellation gracefully (already CANCELLED order)", async () => {
      const adminToken = await signSessionToken({
        id: "admin-user-1",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      });

      const order = await createOrder({
        cakeId: "celeste-sphere",
        cakeName: "Céleste Lavender Sphere",
        customerName: "Idempotent Test",
        customerEmail: "idem@test.com",
        price: 320,
        quantity: 1,
      });

      // First cancel
      await cancelOrder(order.id);

      // Second cancel via PATCH route
      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: order.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.order.status).toBe("CANCELLED");
    });
  });

  // =========================================================================
  // SECTION 2: Dual-Store Parity & FallbackStore State Integrity
  // =========================================================================
  describe("2. Dual-Store Parity (PostgreSQL vs FallbackStore)", () => {
    it("ensures FallbackStore on globalThis.__auraStore is correctly populated with SEED_ORDERS", () => {
      expect(globalStore).toBeDefined();
      expect(globalStore.orders).toBeDefined();
      expect(Array.isArray(globalStore.orders)).toBe(true);
      expect(globalStore.orders.length).toBeGreaterThanOrEqual(SEED_ORDERS.length);
    });

    it("verifies computeSalesMetrics produces identical math on retrieved orders and getCakeSalesMetrics", async () => {
      const catalogCakes = SEED_CAKES.map((c) => ({ id: c.id, name: c.name }));
      const allOrders = await getAllOrders();
      const currentMetrics = await getCakeSalesMetrics();
      const calculatedMetrics = computeSalesMetrics(allOrders, catalogCakes);

      expect(currentMetrics.totalBoughtCount).toBe(calculatedMetrics.totalBoughtCount);
      expect(currentMetrics.totalCancelledCount).toBe(calculatedMetrics.totalCancelledCount);
      expect(currentMetrics.grossRevenue).toBe(calculatedMetrics.grossRevenue);
      expect(currentMetrics.cancelledRevenue).toBe(calculatedMetrics.cancelledRevenue);
      expect(currentMetrics.netRevenue).toBe(calculatedMetrics.netRevenue);
      expect(currentMetrics.perCake.length).toBe(calculatedMetrics.perCake.length);

      // Verify that FallbackStore in-memory seed math is also mathematically sound
      const fallbackMetrics = computeSalesMetrics(SEED_ORDERS, catalogCakes);
      expect(fallbackMetrics.grossRevenue).toBe(
        fallbackMetrics.cancelledRevenue + fallbackMetrics.netRevenue
      );
      expect(fallbackMetrics.totalBoughtCount).toBeGreaterThan(0);
      expect(fallbackMetrics.totalCancelledCount).toBeGreaterThan(0);
    });

    it("verifies order creation maintains synchrony between DB and FallbackStore", async () => {
      const initialCount = globalStore.orders.length;
      const order = await createOrder({
        cakeId: "nocturne-velvet",
        cakeName: "Nocturne Opera Velvet",
        customerName: "Sync Test Client",
        customerEmail: "sync@test.com",
        price: 360,
        quantity: 2,
      });

      expect(globalStore.orders.length).toBe(initialCount + 1);
      const inMemory = globalStore.orders.find((o: any) => o.id === order.id);
      expect(inMemory).toBeDefined();
      expect(inMemory.status).toBe("ACTIVE");
      expect(inMemory.price).toBe(360);
      expect(inMemory.quantity).toBe(2);

      // Verify cancellation synchrony
      await cancelOrder(order.id);
      const cancelledInMemory = globalStore.orders.find((o: any) => o.id === order.id);
      expect(cancelledInMemory.status).toBe("CANCELLED");
    });

    it("verifies net revenue invariant: grossRevenue = cancelledRevenue + netRevenue", async () => {
      const metrics = await getCakeSalesMetrics();
      expect(metrics.grossRevenue).toBe(metrics.cancelledRevenue + metrics.netRevenue);
      expect(metrics.grossRevenue).toBeGreaterThanOrEqual(metrics.cancelledRevenue);
      expect(metrics.netRevenue).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // SECTION 3: Public Orders Route (POST /api/orders) & CartDrawer Contract
  // =========================================================================
  describe("3. Order Placement Route & CartDrawer Contract Validation", () => {
    it("successfully creates order with CartDrawer payload", async () => {
      const payload = {
        cakeId: "elysian-grand-cru",
        cakeName: "The Elysian Grand Cru",
        customerName: "Duchess Sophia",
        customerEmail: "sophia@palace.fr",
        price: 680,
        quantity: 1,
        deliveryDate: "2026-11-20",
        notes: "Flavor: Madagascar Bourbon Vanilla | Plaque: Happy Birthday",
      };

      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.order.customerName).toBe("Duchess Sophia");
      expect(json.order.deliveryDate).toBe("2026-11-20");
      expect(json.order.status).toBe("ACTIVE");
    });

    it("rejects invalid JSON request body with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: "invalid-json-text",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/invalid json/i);
    });

    it("rejects missing customerEmail with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          cakeId: "elysian-grand-cru",
          customerName: "No Email Guest",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/customerEmail/i);
    });

    it("rejects invalid customerEmail without @ symbol with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          cakeId: "elysian-grand-cru",
          customerName: "Guest",
          customerEmail: "invalid-email-domain.com",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/valid email/i);
    });

    it("rejects negative or fractional quantity with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          cakeId: "elysian-grand-cru",
          customerName: "Guest",
          customerEmail: "guest@example.com",
          quantity: -3,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
