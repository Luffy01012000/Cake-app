import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import React from "react";
import { renderToString } from "react-dom/server";

import { POST as createOrderRoute, GET as getOrderRoute } from "../src/app/api/orders/route";
import {
  PATCH as cancelOrderRoute,
  DELETE as deleteOrderRoute,
} from "../src/app/api/admin/orders/[id]/route";
import { signSessionToken } from "../src/lib/auth";
import {
  createOrder,
  getAllOrders,
  resetOrdersStore,
  getCakeSalesMetrics,
} from "../src/lib/data-service";
import CartDrawer from "../src/components/CartDrawer";
import { CartItem } from "../src/data/cakes";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "aura_patisserie_production_secure_jwt_secret_token_2026_xyz";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

describe("Milestone 2 Challenger 2: API Routes & Checkout Flow Adversarial Stress", () => {
  let adminToken: string;
  let seoToken: string;

  beforeAll(async () => {
    adminToken = await signSessionToken({
      id: "challenger-admin",
      email: "admin@aurapatisserie.com",
      name: "Admin Challenger",
      role: "ADMIN",
    });

    seoToken = await signSessionToken({
      id: "challenger-seo",
      email: "seo@aurapatisserie.com",
      name: "SEO Challenger",
      role: "SEO_SPECIALIST",
    });
  });

  beforeEach(() => {
    resetOrdersStore();
  });

  // =========================================================================
  // 1. POST /api/orders: Payload Parsing, Validation, and Method Guards
  // =========================================================================
  describe("1. POST /api/orders: Payload Validation & Method Guards", () => {
    it("rejects malformed non-parseable JSON payload with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ malformed: json, missing quotes ...",
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toMatch(/invalid json/i);
    });

    it("rejects empty body and primitive/array JSON types with HTTP 400", async () => {
      // Primitive string body
      const reqStr = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify("plain string is not object"),
      });
      const resStr = await createOrderRoute(reqStr);
      expect(resStr.status).toBe(400);

      // JSON Array body
      const reqArr = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ cakeId: "elysian-silk-cube" }]),
      });
      const resArr = await createOrderRoute(reqArr);
      expect(resArr.status).toBe(400);

      // null body
      const reqNull = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(null),
      });
      const resNull = await createOrderRoute(reqNull);
      expect(resNull.status).toBe(400);
    });

    it("rejects missing cakeId, empty cakeId, or whitespace-only cakeId with HTTP 400", async () => {
      const payloads = [
        { customerName: "Eleanor Vance", customerEmail: "eleanor@example.com" }, // omitted
        { cakeId: "", customerName: "Eleanor Vance", customerEmail: "eleanor@example.com" }, // empty
        { cakeId: "    ", customerName: "Eleanor Vance", customerEmail: "eleanor@example.com" }, // whitespace
        { cakeId: 12345, customerName: "Eleanor Vance", customerEmail: "eleanor@example.com" }, // wrong type
      ];

      for (const p of payloads) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        const res = await createOrderRoute(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/cakeId/i);
      }
    });

    it("rejects missing customerName, empty, or whitespace-only name with HTTP 400", async () => {
      const payloads = [
        { cakeId: "elysian-silk-cube", customerEmail: "eleanor@example.com" },
        { cakeId: "elysian-silk-cube", customerName: "", customerEmail: "eleanor@example.com" },
        { cakeId: "elysian-silk-cube", customerName: "   ", customerEmail: "eleanor@example.com" },
        { cakeId: "elysian-silk-cube", customerName: null, customerEmail: "eleanor@example.com" },
        { cakeId: "elysian-silk-cube", customerName: false, customerEmail: "eleanor@example.com" },
      ];

      for (const p of payloads) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        const res = await createOrderRoute(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/customerName/i);
      }
    });

    it("rejects missing customerEmail or invalid email format with HTTP 400", async () => {
      const payloads = [
        { cakeId: "elysian-silk-cube", customerName: "Eleanor Vance" },
        { cakeId: "elysian-silk-cube", customerName: "Eleanor Vance", customerEmail: "" },
        { cakeId: "elysian-silk-cube", customerName: "Eleanor Vance", customerEmail: "invalid-plain-email" },
        { cakeId: "elysian-silk-cube", customerName: "Eleanor Vance", customerEmail: 99999 },
      ];

      for (const p of payloads) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        const res = await createOrderRoute(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/customerEmail/i);
      }
    });

    it("rejects negative quantities, zero quantity, and non-integer quantities with HTTP 400", async () => {
      const badQuantities = [-1, -50, 0, 1.5, 2.99, "3", null, NaN, Infinity];

      for (const q of badQuantities) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cakeId: "elysian-silk-cube",
            customerName: "Eleanor Vance",
            customerEmail: "eleanor@example.com",
            quantity: q,
          }),
        });
        const res = await createOrderRoute(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/quantity/i);
      }
    });

    it("rejects negative prices and non-finite prices with HTTP 400", async () => {
      const badPrices = [-0.01, -100, -999.99, "free", null, NaN, Infinity, -Infinity];

      for (const pr of badPrices) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cakeId: "elysian-silk-cube",
            customerName: "Eleanor Vance",
            customerEmail: "eleanor@example.com",
            price: pr,
          }),
        });
        const res = await createOrderRoute(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/price/i);
      }
    });

    it("enforces HTTP method guard on GET /api/orders returning HTTP 405 Method Not Allowed", async () => {
      const res = await getOrderRoute();
      expect(res.status).toBe(405);
      const data = await res.json();
      expect(data.error).toMatch(/method not allowed/i);
    });

    it("creates an order successfully with HTTP 201 when minimal required payload is provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: "elysian-wedding-tier",
          customerName: "Audrey Hepburn",
          customerEmail: "audrey@aurapatisserie.com",
        }),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order).toBeDefined();
      expect(data.order.cakeId).toBe("elysian-wedding-tier");
      expect(data.order.cakeName).toBe("The Elysian Grand Tier");
      expect(data.order.customerName).toBe("Audrey Hepburn");
      expect(data.order.customerEmail).toBe("audrey@aurapatisserie.com");
      expect(data.order.price).toBe(680);
      expect(data.order.quantity).toBe(1);
      expect(data.order.status).toBe("ACTIVE");
    });

    it("creates an order successfully with custom price, quantity, deliveryDate, and notes", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: "solaris-cube",
          cakeName: "Solaris Golden Edition",
          customerName: "Lord Julian Sterling",
          customerEmail: "julian@sterlingestate.co.uk",
          price: 850,
          quantity: 4,
          deliveryDate: "2026-12-31",
          notes: "Plaque: Happy 50th | Gold Leaf Flakes",
        }),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order.price).toBe(850);
      expect(data.order.quantity).toBe(4);
      expect(data.order.deliveryDate).toBe("2026-12-31");
      expect(data.order.notes).toBe("Plaque: Happy 50th | Gold Leaf Flakes");
    });

    it("allows promotional price 0 for complimentary vouchers with HTTP 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: "rosalia-mirror",
          customerName: "VIP Benefactor",
          customerEmail: "vip@aurapatisserie.com",
          price: 0,
          quantity: 1,
        }),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.order.price).toBe(0);
      expect(data.order.status).toBe("ACTIVE");
    });
  });

  // =========================================================================
  // 2. PATCH & DELETE /api/admin/orders/[id]: Auth, RBAC, and Aliasing
  // =========================================================================
  describe("2. PATCH & DELETE /api/admin/orders/[id]: Auth & RBAC Security", () => {
    it("rejects unauthenticated PATCH request with HTTP 401 Unauthorized", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_test_unauth", {
        method: "PATCH",
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "ord_test_unauth" }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/unauthorized/i);
    });

    it("rejects malformed, forged, or expired Authorization headers with HTTP 401", async () => {
      // 1. Empty bearer
      const reqEmptyBearer = new NextRequest("http://localhost:3000/api/admin/orders/ord_1", {
        method: "PATCH",
        headers: { Authorization: "Bearer " },
      });
      const resEmpty = await cancelOrderRoute(reqEmptyBearer, {
        params: Promise.resolve({ id: "ord_1" }),
      });
      expect(resEmpty.status).toBe(401);

      // 2. Random junk token
      const reqJunk = new NextRequest("http://localhost:3000/api/admin/orders/ord_1", {
        method: "PATCH",
        headers: { Authorization: "Bearer this.is.garbage.token" },
      });
      const resJunk = await cancelOrderRoute(reqJunk, {
        params: Promise.resolve({ id: "ord_1" }),
      });
      expect(resJunk.status).toBe(401);

      // 3. Forged token signed with attacker secret
      const forgedToken = await new SignJWT({
        id: "attacker",
        email: "attacker@darkweb.org",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode("completely_wrong_secret_key_123456789"));

      const reqForged = new NextRequest("http://localhost:3000/api/admin/orders/ord_1", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${forgedToken}` },
      });
      const resForged = await cancelOrderRoute(reqForged, {
        params: Promise.resolve({ id: "ord_1" }),
      });
      expect(resForged.status).toBe(401);

      // 4. Expired token signed with valid secret
      const expiredToken = await new SignJWT({
        id: "admin-expired",
        email: "admin@aurapatisserie.com",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("0s")
        .sign(JWT_SECRET);

      const reqExpired = new NextRequest("http://localhost:3000/api/admin/orders/ord_1", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      const resExpired = await cancelOrderRoute(reqExpired, {
        params: Promise.resolve({ id: "ord_1" }),
      });
      expect(resExpired.status).toBe(401);
    });

    it("rejects SEO_SPECIALIST role with HTTP 403 Forbidden (RBAC gate)", async () => {
      // 1. Via Authorization: Bearer
      const reqBearer = new NextRequest("http://localhost:3000/api/admin/orders/ord_seed_1", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${seoToken}` },
      });
      const resBearer = await cancelOrderRoute(reqBearer, {
        params: Promise.resolve({ id: "ord_seed_1" }),
      });
      expect(resBearer.status).toBe(403);
      const dataBearer = await resBearer.json();
      expect(dataBearer.error).toMatch(/forbidden|admin role required/i);

      // 2. Via Cookie aura_session
      const reqCookie = new NextRequest("http://localhost:3000/api/admin/orders/ord_seed_1", {
        method: "PATCH",
        headers: { Cookie: `aura_session=${seoToken}` },
      });
      const resCookie = await cancelOrderRoute(reqCookie, {
        params: Promise.resolve({ id: "ord_seed_1" }),
      });
      expect(resCookie.status).toBe(403);
    });

    it("allows ADMIN role to cancel an active order via Bearer header or Cookie with HTTP 200", async () => {
      // Create a fresh active order to cancel
      const order = await createOrder({
        cakeId: "elysian-silk-cube",
        customerName: "Countess Olivia",
        customerEmail: "olivia@aura.com",
        price: 680,
        quantity: 2,
      });

      expect(order.status).toBe("ACTIVE");

      // Cancel via Bearer token
      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: order.id }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order.id).toBe(order.id);
      expect(data.order.status).toBe("CANCELLED");
    });

    it("returns HTTP 200 idempotently when cancelling an already cancelled order", async () => {
      const order = await createOrder({
        cakeId: "nocturne-truffle",
        customerName: "Baron von Richter",
        customerEmail: "richter@aura.com",
      });

      // First cancel
      const req1 = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res1 = await cancelOrderRoute(req1, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(res1.status).toBe(200);

      // Second cancel (idempotency check)
      const req2 = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res2 = await cancelOrderRoute(req2, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.order.status).toBe("CANCELLED");
    });

    it("returns HTTP 404 when attempting to cancel a non-existent order ID", async () => {
      const nonExistentId = "ord_ghost_does_not_exist_99999";
      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${nonExistentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: nonExistentId }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toMatch(/not found/i);
    });

    it("rejects empty or whitespace-only order ID with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/empty", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "   " }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/order id is required/i);
    });

    it("supports DELETE alias pointing to PATCH with identical RBAC and functionality", async () => {
      // 1. Unauthenticated DELETE -> 401
      const reqUnauth = new NextRequest("http://localhost:3000/api/admin/orders/ord_seed_1", {
        method: "DELETE",
      });
      const resUnauth = await deleteOrderRoute(reqUnauth, {
        params: Promise.resolve({ id: "ord_seed_1" }),
      });
      expect(resUnauth.status).toBe(401);

      // 2. SEO_SPECIALIST DELETE -> 403
      const reqSeo = new NextRequest("http://localhost:3000/api/admin/orders/ord_seed_1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${seoToken}` },
      });
      const resSeo = await deleteOrderRoute(reqSeo, {
        params: Promise.resolve({ id: "ord_seed_1" }),
      });
      expect(resSeo.status).toBe(403);

      // 3. ADMIN DELETE on new order -> 200 CANCELLED
      const order = await createOrder({
        cakeId: "celeste-lavender",
        customerName: "Duchess Genevieve",
        customerEmail: "genevieve@aura.com",
      });

      const reqAdmin = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const resAdmin = await deleteOrderRoute(reqAdmin, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(resAdmin.status).toBe(200);
      const data = await resAdmin.json();
      expect(data.success).toBe(true);
      expect(data.order.status).toBe("CANCELLED");
    });
  });

  // =========================================================================
  // 3. CartDrawer.tsx: SSR Markup, Interaction Logic, and Resilience
  // =========================================================================
  describe("3. CartDrawer.tsx: SSR Markup & Interaction Verification", () => {
    const mockItem: CartItem = {
      id: "cart_item_1",
      cake: {
        id: "elysian-silk-cube",
        name: "The Elysian Silk Cube",
        tagline: "Opulent Madagascar Vanilla & Champagne Mousse",
        price: 680,
        servings: "24-30 Guests",
        occasion: "Weddings" as const,
        flavorProfile: "Bourbon Vanilla, Marc de Champagne, White Gold Leaf",
        leadTimeDays: 7,
        image: "/cakes/elysian-silk-cube.webp",
        palette: ["#f7f5f0", "#d4af37", "#1a1a1a"],
        slug: "elysian-silk-cube",
        description: "Opulent masterpiece.",
        specs: { diameter: "12 inches", height: "14 inches", weight: "6.5 kg" },
      },
      quantity: 1,
      flavorChoice: "Champagne Mousse",
      customInscription: "Happy Anniversary",
    };

    it("renders nothing when isOpen is false", () => {
      const html = renderToString(
        React.createElement(CartDrawer, {
          isOpen: false,
          onClose: () => {},
          items: [mockItem],
          onUpdateQuantity: () => {},
          onRemoveItem: () => {},
          onClearCart: () => {},
        })
      );
      expect(html).toBe("");
    });

    it("renders empty cart view when items array is empty", () => {
      const html = renderToString(
        React.createElement(CartDrawer, {
          isOpen: true,
          onClose: () => {},
          items: [],
          onUpdateQuantity: () => {},
          onRemoveItem: () => {},
          onClearCart: () => {},
        })
      );

      expect(html).toContain("Your cart is empty");
      expect(html).toContain("Discover Occasions");
      expect(html).not.toContain("Checkout •");
    });

    it("renders line items, pricing, guest contact inputs, and checkout button when cart has items", () => {
      const html = renderToString(
        React.createElement(CartDrawer, {
          isOpen: true,
          onClose: () => {},
          items: [mockItem],
          onUpdateQuantity: () => {},
          onRemoveItem: () => {},
          onClearCart: () => {},
        })
      );

      // Cake details & plaque
      expect(html).toContain("The Elysian Silk Cube");
      expect(html).toMatch(/\$<!-- -->680|\$680/);
      expect(html).toContain("Happy Anniversary");

      // Guest contact inputs
      expect(html).toContain("Client &amp; Delivery Details");
      expect(html).toContain("Full name (e.g. Eleanor Vance)");
      expect(html).toContain("Email address for order tracking");

      // Complimentary note
      expect(html).toContain("Complimentary Calligraphy Card Note");

      // Checkout CTA
      expect(html).toMatch(/Checkout • \$<!-- -->680|Checkout • \$680/);
    });

    it("correctly computes white-glove courier fee ($45 under $300, complimentary at $300+)", () => {
      const cheapItem: CartItem = {
        ...mockItem,
        id: "cart_cheap_1",
        cake: {
          ...mockItem.cake,
          id: "rosalia-mirror",
          name: "Rosalia Mirror Tart",
          price: 165,
        },
        quantity: 1,
      };

      // Under $300 -> subtotal $165 + $45 courier fee = $210
      const htmlCheap = renderToString(
        React.createElement(CartDrawer, {
          isOpen: true,
          onClose: () => {},
          items: [cheapItem],
          onUpdateQuantity: () => {},
          onRemoveItem: () => {},
          onClearCart: () => {},
        })
      );
      expect(htmlCheap).toMatch(/\$<!-- -->165|\$165/);
      expect(htmlCheap).toMatch(/\$45|\$<!-- -->45/);
      expect(htmlCheap).toMatch(/\$<!-- -->210|\$210/);

      // Over $300 ($680) -> Complimentary courier fee
      const htmlExpensive = renderToString(
        React.createElement(CartDrawer, {
          isOpen: true,
          onClose: () => {},
          items: [mockItem],
          onUpdateQuantity: () => {},
          onRemoveItem: () => {},
          onClearCart: () => {},
        })
      );
      expect(htmlExpensive).toContain("Complimentary");
      expect(htmlExpensive).toMatch(/\$<!-- -->680|\$680/);
    });
  });

  // =========================================================================
  // 4. End-to-End Checkout Flow & Resilience Simulation
  // =========================================================================
  describe("4. End-to-End Checkout Simulation & Error Resilience", () => {
    it("simulates client checkout call with guest defaults, creating real order and updating sales metrics", async () => {
      const metricsBefore = await getCakeSalesMetrics();

      // Simulate CartDrawer default guest checkout
      const cartItem = {
        cakeId: "celeste-baby-shower",
        cakeName: "The Céleste Cloud",
        price: 320,
        quantity: 2,
        notes: "Flavor: Lavender Mousse | Plaque: 'Joy'",
      };

      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: cartItem.cakeId,
          cakeName: cartItem.cakeName,
          customerName: "Patisserie Guest", // CartDrawer default
          customerEmail: "guest@aurapatisserie.com", // CartDrawer default
          price: cartItem.price,
          quantity: cartItem.quantity,
          deliveryDate: "2026-11-20",
          notes: cartItem.notes,
        }),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.order.id).toBeDefined();

      // Verify sales metrics updated
      const metricsAfter = await getCakeSalesMetrics();
      expect(metricsAfter.totalBoughtCount).toBe(metricsBefore.totalBoughtCount + 2);
      expect(metricsAfter.grossRevenue).toBe(metricsBefore.grossRevenue + 320 * 2);
      expect(metricsAfter.netRevenue).toBe(metricsBefore.netRevenue + 320 * 2);
    });

    it("verifies order cancellation by ADMIN decrements net revenue while retaining bought count", async () => {
      const order = await createOrder({
        cakeId: "solaris-cube",
        customerName: "Baroness Vance",
        customerEmail: "vance@aura.com",
        price: 850,
        quantity: 1,
      });

      const metricsBefore = await getCakeSalesMetrics();

      // Cancel via admin route
      const req = new NextRequest(`http://localhost:3000/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: order.id }),
      });
      expect(res.status).toBe(200);

      const metricsAfter = await getCakeSalesMetrics();
      expect(metricsAfter.totalBoughtCount).toBe(metricsBefore.totalBoughtCount);
      expect(metricsAfter.totalCancelledCount).toBe(metricsBefore.totalCancelledCount + 1);
      expect(metricsAfter.cancelledRevenue).toBe(metricsBefore.cancelledRevenue + 850);
      expect(metricsAfter.netRevenue).toBe(metricsBefore.netRevenue - 850);
    });
  });

  // =========================================================================
  // 5. Adversarial Payloads: Unicode, Float Prices, and Injection Resilience
  // =========================================================================
  describe("5. Adversarial Payloads: Unicode, Decimals & Injection Resilience", () => {
    it("safely handles Unicode emojis and non-Latin characters in customer details and notes", async () => {
      const unicodePayload = {
        cakeId: "blush-seraphina-birthday",
        customerName: "👑 Princess 辻井 伸行 💖",
        customerEmail: "princess.nobu@luxury-tokyo.jp",
        notes: "🎉 Félicitations pour le 30ème anniversaire! 🎂✨",
      };

      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unicodePayload),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.order.customerName).toBe("👑 Princess 辻井 伸行 💖");
      expect(data.order.notes).toBe("🎉 Félicitations pour le 30ème anniversaire! 🎂✨");
    });

    it("safely handles SQL injection and script injection strings as literal values", async () => {
      const maliciousPayload = {
        cakeId: "elysian-wedding-tier",
        customerName: "Robert'); DROP TABLE Orders;--",
        customerEmail: "sqli@test.org",
        notes: "<script>alert('XSS')</script><img src=x onerror=alert(1)>",
      };

      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maliciousPayload),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.order.customerName).toBe("Robert'); DROP TABLE Orders;--");
      expect(data.order.notes).toBe("<script>alert('XSS')</script><img src=x onerror=alert(1)>");

      // Verify DB remains intact and accessible
      const orders = await getAllOrders();
      expect(orders.length).toBeGreaterThan(0);
    });

    it("handles decimal floating-point prices accurately without NaN or rounding bugs", async () => {
      const req = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: "rosalia-intimate-romance",
          customerName: "Decimal Tester",
          customerEmail: "decimal@aura.com",
          price: 165.75,
          quantity: 3,
        }),
      });

      const res = await createOrderRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.order.price).toBe(165.75);
      expect(data.order.quantity).toBe(3);
    });
  });

  // =========================================================================
  // 6. CartDrawer Checkout Flow Simulation & Resilience Edge Cases
  // =========================================================================
  describe("6. CartDrawer Checkout Multi-Item Flow & Fault Resilience", () => {
    it("simulates sequential multi-line-item checkout aggregating multiple order IDs", async () => {
      const mockItems = [
        {
          cakeId: "elysian-wedding-tier",
          cakeName: "The Elysian Grand Tier",
          price: 680,
          quantity: 1,
        },
        {
          cakeId: "nocturne-anniversary-velvet",
          cakeName: "The Nocturne Reserve",
          price: 360,
          quantity: 2,
        },
      ];

      const createdOrderIds: string[] = [];

      for (const item of mockItems) {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cakeId: item.cakeId,
            cakeName: item.cakeName,
            customerName: "Multi Buyer",
            customerEmail: "multi@aurapatisserie.com",
            price: item.price,
            quantity: item.quantity,
          }),
        });

        const res = await createOrderRoute(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.order.id).toBeDefined();
        createdOrderIds.push(data.order.id);
      }

      expect(createdOrderIds.length).toBe(2);
      const confirmationString = createdOrderIds.join(", ");
      expect(confirmationString).toContain(createdOrderIds[0]);
      expect(confirmationString).toContain(createdOrderIds[1]);
    });

    it("verifies cart clearing is blocked when order placement fails with HTTP 400", async () => {
      let cartCleared = false;
      const onClearCart = () => {
        cartCleared = true;
      };

      let checkoutError: string | null = null;

      // Simulate client checkout attempting with invalid email
      try {
        const req = new NextRequest("http://localhost:3000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cakeId: "elysian-wedding-tier",
            customerName: "Test User",
            customerEmail: "invalid-email-address", // triggers 400
          }),
        });

        const res = await createOrderRoute(req);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Checkout failed (${res.status})`);
        }
        onClearCart();
      } catch (err: unknown) {
        checkoutError = (err as Error).message;
      }

      // Assert error captured and cart protected from premature clearance
      expect(checkoutError).toMatch(/valid email/i);
      expect(cartCleared).toBe(false);
    });
  });
});
