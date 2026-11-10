import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPagesSeo, getPageSeo, savePageSeo } from "@/lib/data-service";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (path) {
    const page = await getPageSeo(path);
    return NextResponse.json({ page });
  }

  const pages = await getAllPagesSeo();
  return NextResponse.json({ pages });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.path || !data.title) {
      return NextResponse.json(
        { error: "Path and Title are required." },
        { status: 400 }
      );
    }

    const saved = await savePageSeo(data);
    return NextResponse.json({ success: true, page: saved });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update page SEO: " + (err as Error).message },
      { status: 500 }
    );
  }
}
