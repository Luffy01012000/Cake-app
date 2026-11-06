import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { recordVisit } from "@/lib/data-service";

// Negative matcher: runs on all dynamic page requests while excluding static assets, images, icons, and metadata
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (search engine discovery metadata)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export async function proxy(request: NextRequest, event?: NextFetchEvent) {
  try {
    const pathname = request.nextUrl.pathname;

    // 1. Skip static assets, internal Next.js paths, and API endpoints
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml"
    ) {
      return NextResponse.next();
    }

    // 2. Skip prefetch requests to avoid false positive visit tallies on link hover
    const isPrefetch =
      request.headers.get("next-router-prefetch") === "1" ||
      request.headers.get("purpose") === "prefetch" ||
      request.headers.get("x-purpose") === "prefetch" ||
      request.headers.get("sec-purpose") === "prefetch";

    if (isPrefetch) {
      return NextResponse.next();
    }

    // 3. Extract request parameters
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
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
