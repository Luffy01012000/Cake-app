import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT, generateKeyPair } from "jose";

import { GET as getAnalyticsRoute } from "../src/app/api/admin/analytics/route";
import {
  PATCH as cancelOrderRoute,
  DELETE as deleteOrderRoute,
} from "../src/app/api/admin/orders/[id]/route";
import { signSessionToken } from "../src/lib/auth";
import {
  resetOrdersStore,
  resetVisitsStore,
  getAllOrders,
  createOrder,
} from "../src/lib/data-service";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "aura_patisserie_production_secure_jwt_secret_token_2026_xyz";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const FORGED_SECRET = new TextEncoder().encode("completely_wrong_secret_key_999999999999999");

describe("Milestone 3 Challenger: RBAC & Authentication Adversarial Stress Suite", () => {
  let adminToken: string;
  let seoToken: string;

  beforeAll(async () => {
    adminToken = await signSessionToken({
      id: "challenger-admin-1",
      email: "admin@aurapatisserie.com",
      name: "Security Admin",
      role: "ADMIN",
    });

    seoToken = await signSessionToken({
      id: "challenger-seo-1",
      email: "seo@aurapatisserie.com",
      name: "SEO Auditor",
      role: "SEO_SPECIALIST",
    });
  });

  beforeEach(() => {
    resetOrdersStore();
    resetVisitsStore();
  });

  // =========================================================================
  // Section 1: Cryptographic Integrity & Tampered Token Attacks
  // =========================================================================
  describe("1. Cryptographic Integrity & Tampered Tokens", () => {
    it("1.1 rejects token signed with an invalid/forged HMAC secret on GET /api/admin/analytics with HTTP 401", async () => {
      const forgedToken = await new SignJWT({
        id: "attacker-admin",
        email: "attacker@darkweb.io",
        name: "Intruder",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("2h")
        .sign(FORGED_SECRET);

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${forgedToken}` },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("1.2 rejects token signed with an invalid/forged HMAC secret on PATCH /api/admin/orders/[id] with HTTP 401", async () => {
      const forgedToken = await new SignJWT({
        id: "attacker-admin",
        email: "attacker@darkweb.io",
        name: "Intruder",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("2h")
        .sign(FORGED_SECRET);

      const req = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${forgedToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/Unauthorized/i);
    });

    it("1.3 rejects expired token on GET /api/admin/analytics with HTTP 401", async () => {
      const expiredToken = await new SignJWT({
        id: "admin-expired",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
        .sign(JWT_SECRET);

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);
    });

    it("1.4 rejects expired token on PATCH /api/admin/orders/[id] with HTTP 401", async () => {
      const expiredToken = await new SignJWT({
        id: "admin-expired",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
        .sign(JWT_SECRET);

      const req = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${expiredToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(401);
    });

    it("1.5 rejects token with future nbf (not before) claim with HTTP 401", async () => {
      const futureToken = await new SignJWT({
        id: "admin-future",
        email: "admin@aurapatisserie.com",
        name: "Admin",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setNotBefore(Math.floor(Date.now() / 1000) + 3600)
        .setExpirationTime("2h")
        .sign(JWT_SECRET);

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${futureToken}` },
      });
      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${futureToken}` },
      });
      const resOrder = await cancelOrderRoute(reqOrder, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(resOrder.status).toBe(401);
    });

    it("1.6 rejects token with mutated signature bytes with HTTP 401", async () => {
      const parts = adminToken.split(".");
      expect(parts.length).toBe(3);
      const mutatedSig = parts[2].slice(0, -6) + "XXXXXX";
      const tamperedToken = `${parts[0]}.${parts[1]}.${mutatedSig}`;

      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${tamperedToken}` },
      });
      const resAnalytics = await getAnalyticsRoute(reqAnalytics);
      expect(resAnalytics.status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tamperedToken}` },
      });
      const resOrder = await cancelOrderRoute(reqOrder, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(resOrder.status).toBe(401);
    });

    it("1.7 rejects algorithm 'none' unsigned token attack with HTTP 401", async () => {
      const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(
        JSON.stringify({
          id: "attacker",
          email: "attacker@darkweb.io",
          role: "ADMIN",
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      ).toString("base64url");
      const noneToken = `${header}.${payload}.`;

      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${noneToken}` },
      });
      const resAnalytics = await getAnalyticsRoute(reqAnalytics);
      expect(resAnalytics.status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${noneToken}` },
      });
      const resOrder = await cancelOrderRoute(reqOrder, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(resOrder.status).toBe(401);
    });

    it("1.8 rejects asymmetric algorithm 'RS256' token verified against HMAC secret with HTTP 401", async () => {
      const { privateKey } = await generateKeyPair("RS256");
      const rsToken = await new SignJWT({
        id: "attacker-rs",
        email: "admin@aurapatisserie.com",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "RS256" })
        .setExpirationTime("1h")
        .sign(privateKey);

      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${rsToken}` },
      });
      const resAnalytics = await getAnalyticsRoute(reqAnalytics);
      expect(resAnalytics.status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${rsToken}` },
      });
      const resOrder = await cancelOrderRoute(reqOrder, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(resOrder.status).toBe(401);
    });

    it("1.9 rejects corrupt non-base64 characters in token segments with HTTP 401", async () => {
      const corruptTokens = [
        "eyJhbGciOiJIUzI1NiJ9.!!!???invalid-base64???!!!.signature",
        "corrupt-jwt-no-dots",
        "one.dot.only",
        "a.b.c.d.e",
        adminToken + "!@#$%^&*()",
        adminToken.replace("a", "==="),
        adminToken.slice(0, 25) + "~~~~~~~~" + adminToken.slice(35),
      ];

      for (const token of corruptTokens) {
        const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const res = await getAnalyticsRoute(req);
        expect(res.status, `Corrupt token should return 401: ${token}`).toBe(401);
      }
    });

    it("1.10 rejects payload-swapped token (valid SEO signature attached to ADMIN payload) with HTTP 401", async () => {
      const seoParts = seoToken.split(".");
      const adminParts = adminToken.split(".");

      // Combine ADMIN payload with SEO signature
      const splicedToken = `${adminParts[0]}.${adminParts[1]}.${seoParts[2]}`;

      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${splicedToken}` },
      });
      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${splicedToken}` },
      });
      const resOrder = await cancelOrderRoute(reqOrder, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(resOrder.status).toBe(401);
    });
  });

  // =========================================================================
  // Section 2: Privilege Escalation Attacks (SEO_SPECIALIST -> Financials/Orders)
  // =========================================================================
  describe("2. Privilege Escalation Attacks (SEO_SPECIALIST -> Financials/Orders)", () => {
    it("2.1 ignores query parameter ?role=ADMIN and strictly redacts financial metrics", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics?role=ADMIN", {
        headers: { Authorization: `Bearer ${seoToken}` },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.visits).toBeDefined();
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
      expect("financials" in data).toBe(false);
      expect("orders" in data).toBe(false);
    });

    it("2.2 ignores query parameters ?includeFinancials=true&financials=1 and prevents data leakage", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/admin/analytics?includeFinancials=true&financials=1&metrics=all",
        {
          headers: { Authorization: `Bearer ${seoToken}` },
        }
      );

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("2.3 ignores query parameters ?expand=orders,financials&all=1&metrics=full", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/admin/analytics?expand=orders,financials&all=1&metrics=full&adminOverride=true&view=ADMIN",
        {
          headers: { Authorization: `Bearer ${seoToken}` },
        }
      );

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("2.4 ignores privilege escalation header X-User-Role: ADMIN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${seoToken}`,
          "X-User-Role": "ADMIN",
        },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("2.5 ignores diverse spoofing headers (X-Role, X-Admin-Override, X-Forwarded-User-Role)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${seoToken}`,
          "X-Role": "ADMIN",
          "X-Admin-Override": "true",
          "X-Forwarded-User-Role": "ADMIN",
          "X-Original-Role": "ADMIN",
          "X-Aura-Role": "ADMIN",
        },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("2.6 ignores injected body or spoofed role properties on SEO_SPECIALIST requests", async () => {
      // Create request with custom headers attempting body simulation
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${seoToken}`,
          "X-Injected-Role": JSON.stringify({ role: "ADMIN", includeFinancials: true }),
        },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("2.7 strictly audits Object.keys() on SEO_SPECIALIST response: contains ONLY ['role', 'visits']", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${seoToken}` },
      });

      const res = await getAnalyticsRoute(req);
      const data = await res.json();
      const keys = Object.keys(data).sort();

      expect(keys).toEqual(["role", "visits"].sort());
      expect(keys.length).toBe(2);
      expect(keys).not.toContain("financials");
      expect(keys).not.toContain("orders");
    });

    it("2.8 deep audits serialized JSON: zero occurrences of financial terms or order records", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${seoToken}` },
      });

      const res = await getAnalyticsRoute(req);
      const data = await res.json();
      const rawJson = JSON.stringify(data);

      expect(rawJson).not.toContain('"financials"');
      expect(rawJson).not.toContain('"orders"');
      expect(rawJson).not.toContain('"grossRevenue"');
      expect(rawJson).not.toContain('"netRevenue"');
      expect(rawJson).not.toContain('"cancelledRevenue"');
      expect(rawJson).not.toContain('"totalBoughtCount"');
      expect(rawJson).not.toContain('"totalCancelledCount"');
      expect(rawJson).not.toContain('"perCake"');
      expect(rawJson).not.toContain("genevieve.montague");
    });

    it("2.9 rejects SEO_SPECIALIST attempting to cancel orders on PATCH /api/admin/orders/[id] with HTTP 403 Forbidden", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${seoToken}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/Forbidden/i);
    });

    it("2.10 rejects SEO_SPECIALIST attempting to cancel orders with privilege escalation headers/params with HTTP 403", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/admin/orders/seed-order-001?role=ADMIN&adminOverride=true",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${seoToken}`,
            "X-User-Role": "ADMIN",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "ADMIN", override: true }),
        }
      );

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(403);
    });

    it("2.11 rejects SEO_SPECIALIST attempting DELETE alias on orders with HTTP 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${seoToken}` },
      });

      const res = await deleteOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(403);
    });

    it("2.12 verifies order seed-order-001 remains ACTIVE after all failed SEO_SPECIALIST cancellation attempts", async () => {
      const orders = await getAllOrders();
      const targetOrder = orders.find((o) => o.id === "seed-order-001");
      expect(targetOrder).toBeDefined();
      expect(targetOrder?.status).toBe("ACTIVE");
    });
  });

  // =========================================================================
  // Section 3: Session Impersonation & Unauthorized Role Rejection
  // =========================================================================
  describe("3. Session Impersonation & Unauthorized Role Rejection", () => {
    async function signCustomToken(roleValue: unknown) {
      return await new SignJWT({
        id: "custom-user-1",
        email: "user@aurapatisserie.com",
        name: "Test User",
        role: roleValue as string,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("2h")
        .sign(JWT_SECRET);
    }

    it("3.1 rejects role: CUSTOMER on GET /api/admin/analytics with HTTP 401", async () => {
      const token = await signCustomToken("CUSTOMER");
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("3.2 rejects role: CUSTOMER on PATCH /api/admin/orders/[id] with HTTP 403", async () => {
      const token = await signCustomToken("CUSTOMER");
      const req = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await cancelOrderRoute(req, {
        params: Promise.resolve({ id: "seed-order-001" }),
      });
      expect(res.status).toBe(403);
    });

    it("3.3 rejects role: ANONYMOUS on analytics (401) and order cancellation (403)", async () => {
      const token = await signCustomToken("ANONYMOUS");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(
        (
          await cancelOrderRoute(reqOrder, {
            params: Promise.resolve({ id: "seed-order-001" }),
          })
        ).status
      ).toBe(403);
    });

    it("3.4 rejects role: GUEST on analytics (401) and order cancellation (403)", async () => {
      const token = await signCustomToken("GUEST");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(
        (
          await cancelOrderRoute(reqOrder, {
            params: Promise.resolve({ id: "seed-order-001" }),
          })
        ).status
      ).toBe(403);
    });

    it("3.5 rejects arbitrary non-whitelisted elevated roles (SUPER_ADMIN, ROOT, MODERATOR)", async () => {
      for (const arbitraryRole of ["SUPER_ADMIN", "ROOT", "MODERATOR", "OWNER"]) {
        const token = await signCustomToken(arbitraryRole);
        const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resAnalytics = await getAnalyticsRoute(reqAnalytics);
        expect(resAnalytics.status, `Arbitrary role ${arbitraryRole} must return 401`).toBe(401);

        const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        const resOrder = await cancelOrderRoute(reqOrder, {
          params: Promise.resolve({ id: "seed-order-001" }),
        });
        expect(resOrder.status, `Arbitrary role ${arbitraryRole} must return 403 on order cancel`).toBe(
          403
        );
      }
    });

    it("3.6 rejects lowercase role 'admin' with strict case comparison (401 on analytics, 403 on orders)", async () => {
      const token = await signCustomToken("admin");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(
        (
          await cancelOrderRoute(reqOrder, {
            params: Promise.resolve({ id: "seed-order-001" }),
          })
        ).status
      ).toBe(403);
    });

    it("3.7 rejects lowercase role 'seo_specialist' on analytics with HTTP 401", async () => {
      const token = await signCustomToken("seo_specialist");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);
    });

    it("3.8 rejects whitespace-padded role ' ADMIN ' with HTTP 401", async () => {
      const token = await signCustomToken(" ADMIN ");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);
    });

    it("3.9 rejects null byte injection in role 'ADMIN\\0' with HTTP 401", async () => {
      const token = await signCustomToken("ADMIN\0");
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);
    });

    it("3.10 rejects missing, empty, or non-string role claims with HTTP 401", async () => {
      for (const malformedRole of ["", null, undefined, 12345, true, {}]) {
        const token = await signCustomToken(malformedRole);
        const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const res = await getAnalyticsRoute(reqAnalytics);
        expect(res.status, `Malformed role ${JSON.stringify(malformedRole)} must return 401`).toBe(
          401
        );
      }
    });
  });

  // =========================================================================
  // Section 4: Credential Delivery Boundaries & Cookie Header Anomalies
  // =========================================================================
  describe("4. Credential Delivery Boundaries: Missing, Empty, Bearer & Cookie Header Anomalies", () => {
    it("4.1 rejects completely missing credentials on analytics (401) and order cancel (401)", async () => {
      const reqAnalytics = new NextRequest("http://localhost:3000/api/admin/analytics");
      expect((await getAnalyticsRoute(reqAnalytics)).status).toBe(401);

      const reqOrder = new NextRequest("http://localhost:3000/api/admin/orders/seed-order-001", {
        method: "PATCH",
      });
      expect(
        (
          await cancelOrderRoute(reqOrder, {
            params: Promise.resolve({ id: "seed-order-001" }),
          })
        ).status
      ).toBe(401);
    });

    it("4.2 rejects empty or whitespace-only Authorization header with HTTP 401", async () => {
      const emptyHeaders = [
        "",
        "   ",
        "Bearer",
        "Bearer ",
        "Bearer    ",
        "Bearer \t\r\n",
      ];

      for (const headerVal of emptyHeaders) {
        const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: headerVal },
        });
        const res = await getAnalyticsRoute(req);
        expect(res.status, `Header '${headerVal}' should return 401`).toBe(401);
      }
    });

    it("4.3 rejects non-Bearer schemes (Basic, Digest, Token, lowercase bearer) with HTTP 401", async () => {
      const nonBearerHeaders = [
        "Basic dXNlcjpwYXNz",
        "Digest username=admin, realm=aura",
        `Token ${adminToken}`,
        `JWT ${adminToken}`,
        `bearer ${adminToken}`, // Lowercase "bearer " is intentionally not matched by startsWith("Bearer ")
        `Bearer-Token ${adminToken}`,
      ];

      for (const headerVal of nonBearerHeaders) {
        const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: headerVal },
        });
        const res = await getAnalyticsRoute(req);
        expect(res.status, `Scheme in '${headerVal}' should return 401`).toBe(401);
      }
    });

    it("4.4 rejects empty and dummy Cookie headers with HTTP 401", async () => {
      const dummyCookies = [
        "",
        "aura_session=",
        "aura_session=   ",
        "aura_session=null",
        "aura_session=undefined",
        "unrelated_session=12345; tracker=bot",
        "aura_session=%20",
      ];

      for (const cookieVal of dummyCookies) {
        const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
          headers: { Cookie: cookieVal },
        });
        const res = await getAnalyticsRoute(req);
        expect(res.status, `Cookie '${cookieVal}' should return 401`).toBe(401);
      }
    });

    it("4.5 multi-cookie payload: correctly authenticates ADMIN when other cookies precede aura_session", async () => {
      const multiCookie = `sid=session_alpha_123; tracking_consent=true; aura_session=${adminToken}; display_mode=dark`;
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Cookie: multiCookie },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.role).toBe("ADMIN");
      expect(data.financials).toBeDefined();
      expect(data.orders).toBeDefined();
    });

    it("4.6 multi-cookie payload: rejects with 401 when multiple aura_session cookies are all corrupt", async () => {
      const multiCookie = "aura_session=corrupt_garbage_1; aura_session=corrupt_garbage_2";
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Cookie: multiCookie },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(401);
    });

    it("4.7 multi-cookie payload: prevents privilege escalation when an attacker pairs SEO session with a forged admin cookie", async () => {
      const forgedAdmin = await new SignJWT({
        id: "attacker-admin",
        role: "ADMIN",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("2h")
        .sign(FORGED_SECRET);

      // Scenario A: SEO cookie first, forged admin cookie second
      // NextRequest parses the second cookie into cookies.get(), which fails verification.
      // The route then falls back to raw Cookie parsing which finds the first cookie (SEO)
      // and authenticates safely as SEO_SPECIALIST with zero data leakage.
      const reqA = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Cookie: `aura_session=${seoToken}; aura_session=${forgedAdmin}` },
      });
      const resA = await getAnalyticsRoute(reqA);
      expect(resA.status).toBe(200);
      const dataA = await resA.json();
      expect(dataA.role).toBe("SEO_SPECIALIST");
      expect(dataA.financials).toBeUndefined();
      expect(dataA.orders).toBeUndefined();

      // Scenario B: Forged admin cookie first, SEO cookie second
      // NextRequest parses the second cookie (SEO) which verifies cleanly.
      const reqB = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: { Cookie: `aura_session=${forgedAdmin}; aura_session=${seoToken}` },
      });
      const resB = await getAnalyticsRoute(reqB);
      expect(resB.status).toBe(200);
      const dataB = await resB.json();
      expect(dataB.role).toBe("SEO_SPECIALIST");
      expect(dataB.financials).toBeUndefined();
      expect(dataB.orders).toBeUndefined();
    });

    it("4.8 conflicting credentials: Cookie takes precedence over Authorization Bearer header", async () => {
      // Cookie has SEO_SPECIALIST, Bearer header has ADMIN
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: `aura_session=${seoToken}`,
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      // Must strictly authenticate as SEO_SPECIALIST based on Cookie order of precedence
      expect(data.role).toBe("SEO_SPECIALIST");
      expect(data.financials).toBeUndefined();
      expect(data.orders).toBeUndefined();
    });

    it("4.9 fallback to Bearer header succeeds when Cookie aura_session is invalid or absent", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/analytics", {
        headers: {
          Cookie: "aura_session=invalid_junk_cookie",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const res = await getAnalyticsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.role).toBe("ADMIN");
      expect(data.financials).toBeDefined();
    });

    it("4.10 invoking getAnalyticsRoute with undefined or null request parameter returns HTTP 401 safely", async () => {
      const res = await getAnalyticsRoute(undefined);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });
  });

  // =========================================================================
  // Section 5: Edge Cases: Concurrent Requests under Interleaved Session Tokens
  // =========================================================================
  describe("5. Edge Cases: Concurrent Requests under Interleaved Session Tokens", () => {
    it("5.1 executes 40 interleaved concurrent requests to GET /api/admin/analytics with 0 state leakage", async () => {
      const requestCount = 40;
      const tasks = Array.from({ length: requestCount }, async (_, index) => {
        const isAdmin = index % 2 === 0;
        const token = isAdmin ? adminToken : seoToken;
        const req = new NextRequest(
          `http://localhost:3000/api/admin/analytics?iter=${index}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const res = await getAnalyticsRoute(req);
        const data = await res.json();
        return { index, isAdmin, status: res.status, data };
      });

      const results = await Promise.all(tasks);
      expect(results.length).toBe(requestCount);

      for (const r of results) {
        expect(r.status).toBe(200);

        if (r.isAdmin) {
          expect(r.data.role).toBe("ADMIN");
          expect(r.data.visits).toBeDefined();
          expect(r.data.financials).toBeDefined();
          expect(r.data.financials.netRevenue).toBeGreaterThanOrEqual(0);
          expect(r.data.orders).toBeDefined();
          expect(Array.isArray(r.data.orders)).toBe(true);
        } else {
          expect(r.data.role).toBe("SEO_SPECIALIST");
          expect(r.data.visits).toBeDefined();
          expect(r.data.financials).toBeUndefined();
          expect(r.data.orders).toBeUndefined();
          expect("financials" in r.data).toBe(false);
          expect("orders" in r.data).toBe(false);

          const rawJson = JSON.stringify(r.data);
          expect(rawJson).not.toContain('"financials"');
          expect(rawJson).not.toContain('"orders"');
        }
      }
    });

    it("5.2 executes concurrent interleaved order cancellations (ADMIN vs SEO_SPECIALIST)", async () => {
      // Create fresh active orders specifically for this concurrency test
      const o1 = await createOrder({
        cakeId: "elysian-wedding-tier",
        customerName: "Audrey Hepburn",
        customerEmail: "audrey@aurapatisserie.com",
      });
      const o2 = await createOrder({
        cakeId: "solaris-cube",
        customerName: "Julian Sterling",
        customerEmail: "julian@sterlingestate.co.uk",
      });
      const o3 = await createOrder({
        cakeId: "blush-seraphina-birthday",
        customerName: "Camilla Chesterfield",
        customerEmail: "camilla@chesterfield-design.com",
      });

      const ordersToTest = [o1.id, o2.id, o3.id];

      // SEO attempts cancellations concurrently
      const seoTasks = ordersToTest.map(async (orderId) => {
        const req = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${seoToken}` },
        });
        const res = await cancelOrderRoute(req, {
          params: Promise.resolve({ id: orderId }),
        });
        return { orderId, status: res.status };
      });

      const seoResults = await Promise.all(seoTasks);
      for (const res of seoResults) {
        expect(res.status).toBe(403);
      }

      // Verify all orders remain ACTIVE
      const currentOrders = await getAllOrders();
      for (const orderId of ordersToTest) {
        const found = currentOrders.find((o) => o.id === orderId);
        expect(found?.status).toBe("ACTIVE");
      }

      // Now ADMIN cancels o2.id
      const adminReq = new NextRequest(`http://localhost:3000/api/admin/orders/${o2.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminRes = await cancelOrderRoute(adminReq, {
        params: Promise.resolve({ id: o2.id }),
      });
      expect(adminRes.status).toBe(200);

      // Verify o2 is CANCELLED but o1 is still ACTIVE
      const updatedOrders = await getAllOrders();
      expect(updatedOrders.find((o) => o.id === o2.id)?.status).toBe("CANCELLED");
      expect(updatedOrders.find((o) => o.id === o1.id)?.status).toBe("ACTIVE");
    });

    it("5.3 rapid burst of 50 simultaneous SEO_SPECIALIST requests maintains 100% data redaction", async () => {
      const burstTasks = Array.from({ length: 50 }, async (_, i) => {
        const req = new NextRequest(`http://localhost:3000/api/admin/analytics?burst=${i}`, {
          headers: {
            Authorization: `Bearer ${seoToken}`,
            "X-Attempt-Index": String(i),
          },
        });
        const res = await getAnalyticsRoute(req);
        const data = await res.json();
        return { status: res.status, data };
      });

      const burstResults = await Promise.all(burstTasks);
      for (const res of burstResults) {
        expect(res.status).toBe(200);
        expect(res.data.role).toBe("SEO_SPECIALIST");
        expect(res.data.financials).toBeUndefined();
        expect(res.data.orders).toBeUndefined();
        expect(Object.keys(res.data)).toEqual(["role", "visits"]);
      }
    });
  });
});
