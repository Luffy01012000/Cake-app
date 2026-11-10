import { NextRequest, NextResponse } from "next/server";
import { getSession, verifySessionToken } from "@/lib/auth";
import { cancelOrder } from "@/lib/data-service";

async function getAuthenticatedUser(req: NextRequest) {
  // 1. Try reading session from standard next/headers cookies
  let session = await getSession();
  if (session) return session;

  // 2. Fallback to direct request cookie (e.g., in unit tests or isolated fetchers)
  const cookieToken = req.cookies.get("aura_session")?.value;
  if (cookieToken) {
    session = await verifySessionToken(cookieToken);
    if (session) return session;
  }

  // 3. Fallback to Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken) {
      session = await verifySessionToken(bearerToken);
      if (session) return session;
    }
  }

  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser(req);

  // Authentication check: unauthenticated -> 401
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Active session required." },
      { status: 401 }
    );
  }

  // RBAC check: only ADMIN role can cancel orders. SEO_SPECIALIST -> 403
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin role required to cancel orders." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id || typeof id !== "string" || !id.trim()) {
    return NextResponse.json(
      { error: "Validation failed: Order ID is required." },
      { status: 400 }
    );
  }

  try {
    const order = await cancelOrder(id.trim());
    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = (err as Error).message || "Failed to cancel order.";
    const isNotFound =
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("non-existent");
    return NextResponse.json(
      { error: message },
      { status: isNotFound ? 404 : 400 }
    );
  }
}

// Support DELETE as an alias to PATCH for client / test flexibility
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}
