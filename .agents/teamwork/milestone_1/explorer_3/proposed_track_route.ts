import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/data-service";

export async function POST(request: NextRequest) {
  try {
    let body: { path?: string; userAgent?: string; ip?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or not valid JSON; fallback gracefully
      body = {};
    }

    // Determine path from body, referer header, or default to "/"
    let path = typeof body.path === "string" && body.path.trim().length > 0
      ? body.path.trim()
      : undefined;

    if (!path) {
      const referer = request.headers.get("referer");
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          path = refererUrl.pathname;
        } catch {
          path = referer;
        }
      }
    }
    if (!path) {
      path = "/";
    }

    // Determine User-Agent from body or request headers
    const userAgent =
      typeof body.userAgent === "string" && body.userAgent.length > 0
        ? body.userAgent
        : request.headers.get("user-agent") || "";

    // Determine client IP
    const ip =
      typeof body.ip === "string" && body.ip.length > 0
        ? body.ip
        : request.ip ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined;

    const visit = await recordVisit({ path, userAgent, ip });

    return NextResponse.json({ success: true, visit }, { status: 200 });
  } catch (error) {
    console.error("[api/analytics/track] Error recording visit:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error recording visit" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to record visits." },
    { status: 405 }
  );
}
