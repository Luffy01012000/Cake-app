import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getCustomSitemapEntries,
  saveCustomSitemapEntries,
  CustomSitemapEntry,
} from "@/lib/data-service";

const VALID_FREQUENCIES = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const;

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
    const rawEntries: unknown = body.entries;

    if (!Array.isArray(rawEntries)) {
      return NextResponse.json(
        { error: "Invalid payload: entries must be an array" },
        { status: 400 }
      );
    }

    const validatedEntries: CustomSitemapEntry[] = rawEntries
      .filter((e: unknown): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((entry) => {
        let path = typeof entry.path === "string" ? entry.path.trim() : "";
        if (!path.startsWith("/")) {
          path = `/${path}`;
        }
        // Sanitize path: eliminate query params/fragments, limit length
        path = path.split("?")[0].split("#")[0].slice(0, 1024);

        let priority = typeof entry.priority === "number" ? entry.priority : parseFloat(String(entry.priority)) || 0.5;
        priority = Math.min(1.0, Math.max(0.0, Math.round(priority * 10) / 10));

        const changeFrequency = (
          typeof entry.changeFrequency === "string" &&
          (VALID_FREQUENCIES as readonly string[]).includes(entry.changeFrequency)
            ? entry.changeFrequency
            : "weekly"
        ) as CustomSitemapEntry["changeFrequency"];

        const enabled = Boolean(entry.enabled);

        return {
          path,
          priority,
          changeFrequency,
          enabled,
        };
      })
      .filter((entry) => entry.path.length > 1); // Disallow empty root duplicate as custom entry

    await saveCustomSitemapEntries(validatedEntries);

    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/sitemap");

    return NextResponse.json({ success: true, entries: validatedEntries });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to update sitemap entries: " + (err as Error).message },
      { status: 500 }
    );
  }
}
