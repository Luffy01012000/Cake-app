import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getCustomSitemapEntries,
  saveCustomSitemapEntries,
  CustomSitemapEntry,
} from "@/lib/data-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getCustomSitemapEntries();
  return NextResponse.json({ entries });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const entries: CustomSitemapEntry[] = body.entries || [];

    await saveCustomSitemapEntries(entries);

    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/sitemap");

    return NextResponse.json({ success: true, entries });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update sitemap entries: " + (err as Error).message },
      { status: 500 }
    );
  }
}
