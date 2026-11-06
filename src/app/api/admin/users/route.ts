import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEED_USERS } from "@/lib/seed-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin role required to manage users." },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    if (users && users.length > 0) {
      return NextResponse.json({ users });
    }
  } catch (err) {
    console.warn("Prisma user list failed, using fallback:", err);
  }

  const fallbackUsers = SEED_USERS.map((u, i) => ({
    id: `seed-user-${i}`,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: new Date().toISOString(),
  }));

  return NextResponse.json({ users: fallbackUsers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin role required to create users." },
      { status: 403 }
    );
  }

  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole = role === "ADMIN" ? "ADMIN" : "SEO_SPECIALIST";

    const created = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name.trim(),
        role: validRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: created });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to create user: " + (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin role required to delete users." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  if (id === session.id) {
    return NextResponse.json(
      { error: "Cannot delete your own active administrator account." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to delete user: " + (err as Error).message },
      { status: 500 }
    );
  }
}
