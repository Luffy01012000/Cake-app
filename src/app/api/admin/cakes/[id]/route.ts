import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCakeBySlug, saveCake, deleteCake } from "@/lib/data-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cake = await getCakeBySlug(id);
  if (!cake) {
    return NextResponse.json({ error: "Cake not found" }, { status: 404 });
  }

  return NextResponse.json({ cake });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const data = await req.json();
    const updated = await saveCake({ ...data, id, slug: data.slug || id });
    return NextResponse.json({ success: true, cake: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update cake: " + (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin role required to delete cakes from the catalog." },
      { status: 403 }
    );
  }

  const { id } = await params;
  await deleteCake(id);
  return NextResponse.json({ success: true });
}
