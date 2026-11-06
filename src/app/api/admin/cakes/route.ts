import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCakes, saveCake } from "@/lib/data-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cakes = await getAllCakes();
  return NextResponse.json({ cakes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Cake name and slug are required." },
        { status: 400 }
      );
    }

    const saved = await saveCake(data);
    return NextResponse.json({ success: true, cake: saved });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to create cake: " + (err as Error).message },
      { status: 500 }
    );
  }
}
