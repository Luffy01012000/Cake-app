import { NextRequest, NextResponse } from "next/server";
import { getSession, verifySessionToken } from "@/lib/auth";
import {
  getVisitAnalytics,
  getCakeSalesMetrics,
  getAllOrders,
} from "@/lib/data-service";

/**
 * Extracts and authenticates user session from:
 * 1. Next.js server cookie store via getSession()
 * 2. Request cookie "aura_session" (direct NextRequest or raw cookie header)
 * 3. Authorization header "Bearer <token>"
 */
async function getAuthenticatedUser(req?: NextRequest | Request) {
  // 1. Next.js headers / cookies context
  try {
    const session = await getSession();
    if (session) return session;
  } catch {
    // Ignore error if cookies() is called outside server request context (e.g. unit tests)
  }

  if (!req) return null;

  // 2. Direct cookie store from NextRequest if available
  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    const cookieToken = (req as NextRequest).cookies.get("aura_session")?.value;
    if (cookieToken) {
      const session = await verifySessionToken(cookieToken);
      if (session) return session;
    }
  }

  // 3. Fallback: Parse raw Cookie header
  const rawCookie = req.headers.get("cookie");
  if (rawCookie) {
    const match = rawCookie.match(/(?:^|;\s*)aura_session=([^;]+)/);
    if (match?.[1]) {
      const session = await verifySessionToken(decodeURIComponent(match[1].trim()));
      if (session) return session;
    }
  }

  // 4. Fallback: Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken) {
      const session = await verifySessionToken(bearerToken);
      if (session) return session;
    }
  }

  return null;
}

export async function GET(req?: NextRequest | Request) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session || (session.role !== "ADMIN" && session.role !== "SEO_SPECIALIST")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visits = await getVisitAnalytics();

    if (session.role === "ADMIN") {
      const [financials, orders] = await Promise.all([
        getCakeSalesMetrics(),
        getAllOrders(),
      ]);

      return NextResponse.json(
        {
          role: "ADMIN",
          visits,
          financials,
          orders,
        },
        { status: 200 }
      );
    }

    // Role is "SEO_SPECIALIST": Strictly redact financials and orders
    // The JSON response object contains ONLY 'role' and 'visits'.
    // Neither 'financials' nor 'orders' key is defined or included.
    return NextResponse.json(
      {
        role: "SEO_SPECIALIST",
        visits,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_PRERENDER") ||
        (err as { digest: string }).digest.startsWith("DYNAMIC_SERVER_USAGE"))
    ) {
      throw err;
    }
    console.error("Error in /api/admin/analytics GET handler:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
