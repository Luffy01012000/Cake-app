import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { recordVisit } from "@/lib/data-service";

// Match all routes except static assets, images, favicon, and SEO metadata files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

/**
 * Detects whether an incoming HTTP request is a speculative prefetch or prerender request.
 * Normalizes header values to lowercase and trims whitespace to prevent case-sensitive
 * bypasses (e.g., "Purpose: Prefetch", "Sec-Purpose: Prefetch", "next-router-prefetch: 1").
 */
export function isPrefetchRequest(request: NextRequest): boolean {
  const nextRouterPrefetch = request.headers.get("next-router-prefetch")?.trim().toLowerCase();
  const purpose = request.headers.get("purpose")?.trim().toLowerCase();
  const xPurpose = request.headers.get("x-purpose")?.trim().toLowerCase();
  const secPurpose = request.headers.get("sec-purpose")?.trim().toLowerCase();

  return (
    nextRouterPrefetch === "1" ||
    nextRouterPrefetch === "true" ||
    purpose === "prefetch" ||
    purpose === "prerender" ||
    xPurpose === "prefetch" ||
    xPurpose === "preview" ||
    secPurpose === "prefetch" ||
    secPurpose === "prerender" ||
    Boolean(secPurpose?.includes("prefetch"))
  );
}

export async function proxy(request: NextRequest, event?: NextFetchEvent): Promise<NextResponse> {
  try {
    const pathname = request.nextUrl.pathname;

    // 1. Skip static assets, internal Next.js routes, and API endpoints
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml"
    ) {
      return NextResponse.next();
    }

    // 2. Skip prefetch requests to avoid false positive visit tallies
    if (isPrefetchRequest(request)) {
      return NextResponse.next();
    }

    // 3. Extract request parameters
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      (request as unknown as { ip?: string }).ip ||
      undefined;

    // 4. Non-blocking visit recording promise
    const visitPromise = recordVisit({
      path: pathname,
      userAgent,
      ip,
    }).catch((err) => {
      // Resilience: Errors in visit recording never bubble up to crash page requests
      console.error("[proxy] Visit recording error:", err);
    });

    // 5. Asynchronous delegation
    if (event && typeof event.waitUntil === "function") {
      event.waitUntil(visitPromise);
    } else {
      // In unit test environments where event is omitted, await to guarantee determinism
      await visitPromise;
    }
  } catch (err) {
    // Resilience: Top-level error catch ensures navigation and rendering NEVER fail
    console.error("[proxy] Unexpected error in proxy interceptor:", err);
  }

  return NextResponse.next();
}

export default proxy;
